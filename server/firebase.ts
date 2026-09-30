import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldPath, getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initialProducts } from '../src/data/products';
import type {
  Env,
  InventoryRecord,
  PaymentMethod,
  PaymentRecord,
  RetailProduct,
  RetailRepository,
  RetailSale,
  RetailTransaction,
  SaleRequest,
  Store,
} from './app';

export class RepositoryError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

const productCollection = 'products';
const saleCollection = 'sales';
const transactionCollection = 'transactions';
const paymentCollection = 'payments';
const movementCollection = 'inventoryMovements';
const keyValueCollection = 'portalKeyValue';
const asProduct = (value: FirebaseFirestore.DocumentData): RetailProduct => value as RetailProduct;
const statusFor = (paid: number, total: number): RetailSale['paymentStatus'] =>
  paid >= total ? 'paid' : paid > 0 ? 'partial' : 'pending';
const productData = (product: RetailProduct) => {
  const record = { ...product };
  delete record.icon;
  return {
    ...record,
    stock: Number(product.stock) || 0,
    costPrice: Number(product.costPrice) || 0,
    reorderLevel: Number(product.reorderLevel ?? 5),
    active: product.active !== false,
  };
};

class FirebaseStore implements Store {
  constructor(
    private readonly database: Firestore,
    private readonly bucket: ReturnType<ReturnType<typeof getStorage>['bucket']>,
  ) {}

  async get(key: string) {
    if (key.startsWith('gallery/images/')) {
      const file = this.bucket.file(key);
      const [exists] = await file.exists();
      if (!exists) return null;
      const [[bytes], [metadata]] = await Promise.all([file.download(), file.getMetadata()]);
      const content = new Uint8Array(bytes);
      return {
        body: content,
        text: async () => new TextDecoder().decode(content),
        httpMetadata: { contentType: metadata.contentType || 'image/jpeg' },
      };
    }
    const snapshot = await this.database.collection(keyValueCollection).doc(encodeURIComponent(key)).get();
    if (!snapshot.exists) return null;
    const data = snapshot.data()!;
    const content = data.binary
      ? new Uint8Array(Buffer.from(data.value as string, 'base64'))
      : new TextEncoder().encode(String(data.value ?? ''));
    return {
      body: content,
      text: async () => new TextDecoder().decode(content),
      httpMetadata: { contentType: data.contentType || 'application/json' },
    };
  }

  async put(key: string, value: string | ArrayBuffer | Uint8Array, options?: { httpMetadata?: { contentType: string } }) {
    if (key.startsWith('gallery/images/')) {
      const bytes = typeof value === 'string' ? Buffer.from(value) : Buffer.from(value as ArrayBuffer | Uint8Array);
      await this.bucket.file(key).save(bytes, {
        resumable: false,
        metadata: { contentType: options?.httpMetadata?.contentType || 'application/octet-stream' },
      });
      return;
    }
    const binary = typeof value !== 'string';
    const encoded = binary ? Buffer.from(value as ArrayBuffer | Uint8Array).toString('base64') : value;
    await this.database.collection(keyValueCollection).doc(encodeURIComponent(key)).set({
      key,
      value: encoded,
      binary,
      contentType: options?.httpMetadata?.contentType || 'application/json',
    });
  }

  async delete(key: string) {
    if (key.startsWith('gallery/images/')) {
      await this.bucket.file(key).delete({ ignoreNotFound: true });
      return;
    }
    await this.database.collection(keyValueCollection).doc(encodeURIComponent(key)).delete();
  }

  async list({ prefix, cursor }: { prefix: string; cursor?: string }) {
    const encodedPrefix = encodeURIComponent(prefix);
    let query = this.database.collection(keyValueCollection)
      .orderBy(FieldPath.documentId())
      .startAt(encodedPrefix)
      .endAt(`${encodedPrefix}\uf8ff`)
      .limit(1001);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    const docs = snapshot.docs.slice(0, 1000);
    return {
      objects: docs.map((doc) => ({ key: String(doc.get('key')) })),
      truncated: snapshot.docs.length > 1000,
      cursor: snapshot.docs.length > 1000 ? docs[docs.length - 1]?.id : undefined,
    };
  }
}

class FirestoreRetailRepository implements RetailRepository {
  constructor(private readonly database: Firestore) {}

  private async seedProducts() {
    const existing = await this.database.collection(productCollection).limit(1).get();
    if (!existing.empty) return;
    const writer = this.database.bulkWriter();
    initialProducts.forEach((product) => {
      const seeded = productData({ ...product, active: true });
      writer.set(this.database.collection(productCollection).doc(String(product.id)), seeded);
    });
    await writer.close();
  }

  async getProducts(activeOnly: boolean) {
    await this.seedProducts();
    const snapshot = await this.database.collection(productCollection).get();
    return snapshot.docs
      .map((document) => asProduct(document.data()))
      .filter((product) => !activeOnly || product.active !== false)
      .sort((left, right) => left.id - right.id);
  }

  async saveProducts(products: RetailProduct[]) {
    await this.seedProducts();
    const existingSnapshot = await this.database.collection(productCollection).get();
    const existing = new Map(existingSnapshot.docs.map((doc) => [Number(doc.id), asProduct(doc.data())]));
    const writer = this.database.bulkWriter();
    const now = new Date().toISOString();
    for (const product of products) {
      const before = Number(existing.get(product.id)?.stock) || 0;
      const after = Number(product.stock) || 0;
      writer.set(this.database.collection(productCollection).doc(String(product.id)), productData(product));
      if (before !== after) {
        const movement: InventoryRecord = {
          id: crypto.randomUUID(), productId: product.id, productName: product.name,
          type: existing.has(product.id) ? 'adjust' : 'opening', quantity: Math.abs(after - before),
          delta: after - before, stockBefore: before, stockAfter: after,
          note: existing.has(product.id) ? 'Product stock edited' : 'Opening stock', createdAt: now,
        };
        writer.create(this.database.collection(movementCollection).doc(movement.id), movement);
      }
    }
    await writer.close();
  }

  async upsertProduct(product: RetailProduct) {
    await this.seedProducts();
    const reference = this.database.collection(productCollection).doc(String(product.id));
    await this.database.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      const previous = snapshot.exists ? asProduct(snapshot.data()!) : undefined;
      const before = Number(previous?.stock) || 0;
      const after = Number(product.stock) || 0;
      transaction.set(reference, productData(product));
      if (before !== after) {
        const movement: InventoryRecord = {
          id: crypto.randomUUID(), productId: product.id, productName: product.name,
          type: previous ? 'adjust' : 'opening', quantity: Math.abs(after - before),
          delta: after - before, stockBefore: before, stockAfter: after,
          note: previous ? 'Product stock edited' : 'Opening stock', createdAt: new Date().toISOString(),
        };
        transaction.create(this.database.collection(movementCollection).doc(movement.id), movement);
      }
    });
  }

  async getSales() {
    const snapshot = await this.database.collection(saleCollection).orderBy('soldAt', 'desc').limit(10000).get();
    return snapshot.docs.map((doc) => doc.data() as RetailSale);
  }

  async getMovements() {
    const snapshot = await this.database.collection(movementCollection).orderBy('createdAt', 'desc').limit(10000).get();
    return snapshot.docs.map((doc) => doc.data() as InventoryRecord);
  }

  async getPayments() {
    const snapshot = await this.database.collection(paymentCollection).orderBy('createdAt', 'desc').limit(20000).get();
    return snapshot.docs.map((doc) => doc.data() as PaymentRecord);
  }

  async getTransactions() {
    const snapshot = await this.database.collection(transactionCollection).orderBy('soldAt', 'desc').limit(10000).get();
    return snapshot.docs.map((doc) => doc.data() as RetailTransaction);
  }

  async createSale(input: SaleRequest) {
    await this.seedProducts();
    const transactionId = crypto.randomUUID();
    const saleLines = input.items.map((item) => ({ ...item, id: crypto.randomUUID() }));
    const uniqueProductIds = [...new Set(saleLines.map((item) => item.productId))];
    const soldAt = new Date().toISOString();
    const transactionRef = this.database.collection(transactionCollection).doc(transactionId);
    const result = await this.database.runTransaction(async (transaction) => {
      const productSnapshots = new Map<number, RetailProduct>();
      for (const id of uniqueProductIds) {
        const snapshot = await transaction.get(this.database.collection(productCollection).doc(String(id)));
        if (!snapshot.exists) throw new RepositoryError('A product in this sale was not found.', 404);
        const product = asProduct(snapshot.data()!);
        if (product.active === false) throw new RepositoryError(`${product.name} is inactive.`, 409);
        productSnapshots.set(id, product);
      }
      const quantities = new Map<number, number>();
      saleLines.forEach((line) => quantities.set(line.productId, (quantities.get(line.productId) || 0) + line.quantity));
      for (const [id, quantity] of quantities) {
        const product = productSnapshots.get(id)!;
        if (quantity > (Number(product.stock) || 0)) throw new RepositoryError(`Only ${Number(product.stock) || 0} units of ${product.name} are available.`, 409);
      }
      const total = saleLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
      if (input.amountPaid > total) throw new RepositoryError('Amount received exceeds the sale total.');
      let remainingPaid = input.amountPaid;
      const records: RetailSale[] = saleLines.map((line) => {
        const product = productSnapshots.get(line.productId)!;
        const lineTotal = line.quantity * line.unitPrice;
        const amountPaid = Math.min(lineTotal, remainingPaid);
        remainingPaid -= amountPaid;
        return {
          id: line.id, transactionId, productId: product.id, productName: product.name,
          quantity: line.quantity, unitPrice: line.unitPrice, unitCost: Number(product.costPrice) || 0,
          total: lineTotal, amountPaid, customerName: input.customerName,
          customerPhone: input.customerPhone, location: input.location,
          paymentStatus: statusFor(amountPaid, lineTotal), paymentMethod: input.paymentMethod, soldAt,
        };
      });
      const movements: InventoryRecord[] = [...quantities].map(([id, quantity]) => {
        const product = productSnapshots.get(id)!;
        const before = Number(product.stock) || 0;
        return {
          id: crypto.randomUUID(), productId: id, productName: product.name, type: 'sale',
          quantity, delta: -quantity, stockBefore: before, stockAfter: before - quantity,
          note: `Sale ${transactionId}`, referenceId: transactionId, createdAt: soldAt,
        };
      });
      const status = statusFor(input.amountPaid, total);
      const savedTransaction: RetailTransaction = {
        id: transactionId, customerName: input.customerName, customerPhone: input.customerPhone,
        location: input.location, total, amountPaid: input.amountPaid, balanceDue: total - input.amountPaid,
        paymentStatus: status, paymentMethod: input.paymentMethod, soldAt, saleIds: records.map((record) => record.id),
      };
      for (const [id, quantity] of quantities) {
        const product = productSnapshots.get(id)!;
        transaction.update(this.database.collection(productCollection).doc(String(id)), {
          stock: (Number(product.stock) || 0) - quantity,
        });
      }
      records.forEach((record) => transaction.create(this.database.collection(saleCollection).doc(record.id), record));
      movements.forEach((movement) => transaction.create(this.database.collection(movementCollection).doc(movement.id), movement));
      transaction.create(transactionRef, savedTransaction);
      const payments: PaymentRecord[] = [];
      if (input.amountPaid > 0) {
        const payment: PaymentRecord = {
          id: crypto.randomUUID(), transactionId, customerName: input.customerName,
          method: input.paymentMethod as Exclude<PaymentMethod, 'Credit'>,
          amount: input.amountPaid, createdAt: soldAt,
        };
        transaction.create(this.database.collection(paymentCollection).doc(payment.id), payment);
        payments.push(payment);
      }
      return { records, movements, transaction: savedTransaction, payments };
    });
    const [products, sales] = await Promise.all([this.getProducts(false), this.getSales()]);
    return { ...result, products, sales };
  }

  async adjustInventory(input: { productId: number; action: 'receive'|'remove'|'set'; quantity: number; note: string }) {
    const reference = this.database.collection(productCollection).doc(String(input.productId));
    const movement = await this.database.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists) throw new RepositoryError('Product not found.', 404);
      const product = asProduct(snapshot.data()!);
      const before = Number(product.stock) || 0;
      if (!Number.isFinite(input.quantity) || input.quantity < 0 || (input.action !== 'set' && input.quantity === 0)) throw new RepositoryError('Enter a valid stock quantity.');
      const after = input.action === 'receive' ? before + input.quantity : input.action === 'remove' ? before - input.quantity : input.quantity;
      if (after < 0) throw new RepositoryError(`Only ${before} units are available to remove.`, 409);
      if (after === before) throw new RepositoryError('The stock quantity is unchanged.');
      const record: InventoryRecord = {
        id: crypto.randomUUID(), productId: product.id, productName: product.name, type: input.action,
        quantity: Math.abs(after - before), delta: after - before, stockBefore: before, stockAfter: after,
        note: input.note, createdAt: new Date().toISOString(),
      };
      transaction.update(reference, { stock: after });
      transaction.create(this.database.collection(movementCollection).doc(record.id), record);
      return record;
    });
    return { movement, products: await this.getProducts(false), movements: await this.getMovements() };
  }

  async addPayment(input: { transactionId: string; amount: number; method: Exclude<PaymentMethod, 'Credit'> }) {
    const payment: PaymentRecord = {
      id: crypto.randomUUID(), transactionId: input.transactionId, customerName: '',
      method: input.method, amount: input.amount, createdAt: new Date().toISOString(),
    };
    const updated = await this.database.runTransaction(async (transaction) => {
      const transactionRef = this.database.collection(transactionCollection).doc(input.transactionId);
      const snapshot = await transaction.get(transactionRef);
      if (!snapshot.exists) throw new RepositoryError('Transaction not found.', 404);
      const current = snapshot.data() as RetailTransaction;
      if (input.amount > current.balanceDue) throw new RepositoryError(`The outstanding balance is ${current.balanceDue}.`);
      const saleSnapshots = [];
      for (const id of current.saleIds) {
        saleSnapshots.push(await transaction.get(this.database.collection(saleCollection).doc(id)));
      }
      const newPaid = current.amountPaid + input.amount;
      const remainingPaid = { value: newPaid };
      const sales = saleSnapshots.filter((sale) => sale.exists).map((saleSnapshot) => {
        const sale = saleSnapshot.data() as RetailSale;
        const amountPaid = Math.min(sale.total, remainingPaid.value);
        remainingPaid.value -= amountPaid;
        const changed = { ...sale, amountPaid, paymentStatus: statusFor(amountPaid, sale.total) };
        transaction.set(saleSnapshot.ref, changed);
        return changed;
      });
      const transactionRecord: RetailTransaction = {
        ...current, amountPaid: newPaid, balanceDue: current.total - newPaid,
        paymentStatus: statusFor(newPaid, current.total),
      };
      payment.customerName = current.customerName;
      transaction.set(transactionRef, transactionRecord);
      transaction.create(this.database.collection(paymentCollection).doc(payment.id), payment);
      return { payment, transaction: transactionRecord, sales };
    });
    return { ...updated, payments: await this.getPayments() };
  }
}

export function createFirebaseBackend(environment: NodeJS.ProcessEnv): (Pick<Env, 'BUCKET' | 'RETAIL' | 'FIREBASE_AUTH'> & { error?: string }) | undefined {
  const serializedAccount = environment.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serializedAccount) return undefined;
  try {
    const account = JSON.parse(serializedAccount) as ServiceAccount & { project_id?: string };
    const projectId = environment.FIREBASE_PROJECT_ID || account.project_id || 'stetech-solar';
    const storageBucket = environment.FIREBASE_STORAGE_BUCKET || 'stetech-solar.firebasestorage.app';
    const existing = getApps().find((app) => app.name === 'stetech-admin');
    const app = existing || initializeApp({
      credential: cert(account), projectId, storageBucket,
    }, 'stetech-admin');
    const database = getFirestore(app);
    const authentication = getAuth(app);
    if (!existing) database.settings({ ignoreUndefinedProperties: true });
    const bucket = getStorage(app).bucket(storageBucket);
    return {
      BUCKET: new FirebaseStore(database, bucket),
      RETAIL: new FirestoreRetailRepository(database),
      FIREBASE_AUTH: {
        async verifyIdToken(token) {
          const decoded = await authentication.verifyIdToken(token);
          return { uid: decoded.uid, email: decoded.email, admin: decoded.admin === true };
        },
      },
    };
  } catch (error) {
    console.error('STETECH Firebase initialization failed:', error);
    return { error: 'Firebase Admin credentials are invalid or Firebase could not be initialized.' };
  }
}