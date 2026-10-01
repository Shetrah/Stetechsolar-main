import { initialProducts, type Product } from './products';
import { Cog } from 'lucide-react';
import { numericPrice } from './productFilters';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import {
	collection,
	doc,
	getDocs,
	limit,
	onSnapshot,
	orderBy,
	query,
	runTransaction,
	where,
	writeBatch,
} from 'firebase/firestore';
import { firebaseAuth, firebaseDb, isAdminFirebaseUser, requireFirebaseAdmin, requireFirebaseStaffOrAdmin } from './firebase';
import { getSignedInStaffName } from './staffStore';

export interface StoreAuthContext {
	auth: Auth;
	db: Firestore;
	staffOnly?: boolean;
}

export type PaymentMethod = 'Cash' | 'M-Pesa' | 'Bank' | 'Credit';
export interface SaleRecord {
	id: string;
	transactionId?: string;
	receiptNumber?: string;
	verificationId?: string;
	productId: number;
	productName: string;
	quantity: number;
	unitPrice: number;
	unitCost?: number;
	total: number;
	amountPaid?: number;
	customerName: string;
	customerPhone: string;
	location: string;
	paymentStatus: 'paid' | 'pending' | 'partial';
	paymentMethod?: PaymentMethod;
	staffUid?: string;
	staffName?: string;
	soldAt: string;
}

export interface InventoryMovement {
	id: string;
	productId: number;
	productName: string;
	type: 'sale' | 'receive' | 'remove' | 'set' | 'opening' | 'adjust';
	quantity: number;
	delta: number;
	stockBefore: number;
	stockAfter: number;
	note: string;
	referenceId?: string;
	createdAt: string;
	staffUid?: string;
	staffName?: string;
}

export interface PaymentRecord {
	id: string;
	transactionId: string;
	receiptNumber: string;
	verificationId: string;
	customerName: string;
	method: Exclude<PaymentMethod, 'Credit'>;
	amount: number;
	createdAt: string;
	staffUid?: string;
	staffName?: string;
}

export interface TransactionSummary {
	id: string;
	receiptNumber: string;
	verificationId: string;
	customerName: string;
	customerPhone: string;
	location: string;
	total: number;
	amountPaid: number;
	balanceDue: number;
	paymentStatus: 'paid' | 'pending' | 'partial';
	paymentMethod: PaymentMethod;
	soldAt: string;
	saleIds: string[];
	staffUid?: string;
	staffName?: string;
}

export interface ReceiptVerification {
	id: string;
	receiptNumber: string;
	transactionId: string;
	total: number;
	amountPaid: number;
	balanceDue: number;
	paymentStatus: 'paid' | 'pending' | 'partial';
	issuedAt: string;
	type: 'sale' | 'payment';
	staffUid?: string;
	staffName?: string;
}

type SaleLine = Pick<SaleRecord, 'productId' | 'quantity' | 'unitPrice'>;
type SaleInput = SaleLine & Pick<SaleRecord, 'customerName' | 'customerPhone' | 'location'> & {
	paymentStatus?: SaleRecord['paymentStatus'];
	paymentMethod?: PaymentMethod;
	amountPaid?: number;
};

let catalogue: Product[] = initialProducts.map((product) => ({ ...product, active: true }));
let sales: SaleRecord[] = [];
let movements: InventoryMovement[] = [];
let payments: PaymentRecord[] = [];
let transactions: TransactionSummary[] = [];

const hydrate = (product: Partial<Product>): Product => ({
	...product,
	icon: initialProducts.find((seed) => seed.id === product.id)?.icon || Cog,
	stock: typeof product.stock === 'number' ? product.stock : undefined,
	active: product.active !== false,
}) as Product;
const collectionNames = {
	products: 'products',
	sales: 'sales',
	transactions: 'transactions',
	payments: 'payments',
	movements: 'inventoryMovements',
	receiptCounters: 'receiptCounters',
	receiptVerifications: 'receiptVerifications',
} as const;

function receiptPeriod(date: Date) {
	const parts = new Intl.DateTimeFormat('en', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit' }).formatToParts(date);
	const year = parts.find((part) => part.type === 'year')?.value || String(date.getUTCFullYear());
	const month = parts.find((part) => part.type === 'month')?.value || String(date.getUTCMonth() + 1).padStart(2, '0');
	return { period: `${year}-${month}`, year, month };
}

async function nextReceiptNumber(transaction: Parameters<Parameters<typeof runTransaction>[1]>[0], date: Date, db: Firestore = firebaseDb) {
	const { period, year, month } = receiptPeriod(date);
	const counterReference = doc(db, collectionNames.receiptCounters, period);
	const snapshot = await transaction.get(counterReference);
	const sequence = (Number(snapshot.data()?.lastNumber) || 0) + 1;
	const receiptNumber = `STS-${year}-${month}-${String(sequence).padStart(4, '0')}`;
	return { counterReference, sequence, receiptNumber };
}

const requireAdmin = requireFirebaseAdmin;

const productRecord = (product: Product) => {
	const record = { ...product } as Partial<Product>;
	delete record.icon;
	return { ...record, active: product.active !== false, stock: Number(product.stock) || 0, costPrice: Number(product.costPrice) || 0, reorderLevel: Number(product.reorderLevel ?? 5) };
};

async function seedProducts() {
	const writer = writeBatch(firebaseDb);
	initialProducts.forEach((product) => writer.set(doc(firebaseDb, collectionNames.products, String(product.id)), productRecord({ ...product, active: true })));
	await writer.commit();
}

export const getProducts = () => catalogue.filter((product) => product.active !== false);
export const getAllProducts = () => catalogue;
export const getSales = () => sales;
export const getInventoryMovements = () => movements;
export const getPayments = () => payments;
export const getTransactions = () => transactions;
export const formatRecordCode = (id: string | undefined) => (id || '').replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase().padEnd(6, '0');

export function subscribeProducts(onChange: () => void, includeInactive = false, onError?: (error: Error) => void, db: Firestore = firebaseDb) {
	const reference = collection(db, collectionNames.products);
	const source = includeInactive ? reference : query(reference, where('active', '==', true));
	return onSnapshot(source, (snapshot) => {
		if (snapshot.empty) return;
		catalogue = snapshot.docs.map((item) => hydrate(item.data() as Partial<Product>));
		window.dispatchEvent(new Event('stetech-products-updated'));
		onChange();
	}, (error) => onError?.(error));
}

export function subscribeSales(onChange: () => void, onError?: (error: Error) => void, context: StoreAuthContext = { auth: firebaseAuth, db: firebaseDb }) {
	let unsubscribe = () => undefined;
	let cancelled = false;
	const user = context.auth.currentUser;
	if (!user) return () => undefined;
	void (context.staffOnly ? Promise.resolve(false) : isAdminFirebaseUser(user, context.db)).then((admin) => {
		if (cancelled) return;
		const reference = collection(context.db, collectionNames.sales);
		const source = admin
			? query(reference, orderBy('soldAt', 'desc'), limit(10000))
			: query(reference, where('staffUid', '==', user.uid), limit(10000));
		unsubscribe = onSnapshot(source, (snapshot) => {
			sales = snapshot.docs.map((item) => item.data() as SaleRecord).sort((first, second) => second.soldAt.localeCompare(first.soldAt));
			window.dispatchEvent(new Event('stetech-sales-updated'));
			onChange();
		}, (error) => onError?.(error));
	}).catch((error: unknown) => onError?.(error instanceof Error ? error : new Error('Unable to subscribe to sales.')));
	return () => { cancelled = true; unsubscribe(); };
}

export function subscribeInventoryMovements(onChange: () => void, onError?: (error: Error) => void) {
	return onSnapshot(query(collection(firebaseDb, collectionNames.movements), orderBy('createdAt', 'desc'), limit(10000)), (snapshot) => {
		movements = snapshot.docs.map((item) => item.data() as InventoryMovement);
		window.dispatchEvent(new Event('stetech-inventory-updated'));
		onChange();
	}, (error) => onError?.(error));
}

export function subscribePayments(onChange: () => void, onError?: (error: Error) => void) {
	const stopPayments = onSnapshot(query(collection(firebaseDb, collectionNames.payments), orderBy('createdAt', 'desc'), limit(10000)), (snapshot) => {
		payments = snapshot.docs.map((item) => item.data() as PaymentRecord);
		window.dispatchEvent(new Event('stetech-payments-updated'));
		onChange();
	}, (error) => onError?.(error));
	const stopTransactions = onSnapshot(query(collection(firebaseDb, collectionNames.transactions), orderBy('soldAt', 'desc'), limit(10000)), (snapshot) => {
		transactions = snapshot.docs.map((item) => item.data() as TransactionSummary);
		window.dispatchEvent(new Event('stetech-payments-updated'));
		onChange();
	}, (error) => onError?.(error));
	return () => { stopPayments(); stopTransactions(); };
}

export async function syncProducts(context: StoreAuthContext = { auth: firebaseAuth, db: firebaseDb }) {
	try {
		const user = context.auth.currentUser;
		const admin = !!user && !context.staffOnly && await isAdminFirebaseUser(user, context.db);
		const reference = collection(context.db, collectionNames.products);
		let snapshot = await getDocs(admin ? reference : query(reference, where('active', '==', true)));
		if (admin && snapshot.empty) {
			await seedProducts(context.db);
			snapshot = await getDocs(reference);
		}
		if (!snapshot.empty) catalogue = snapshot.docs.map((item) => hydrate(item.data() as Partial<Product>));
		window.dispatchEvent(new Event('stetech-products-updated'));
	} catch (error) {
		console.error('Could not sync the Firebase product catalogue:', error);
	}
}

export async function syncSales(context: StoreAuthContext = { auth: firebaseAuth, db: firebaseDb }) {
	const user = await requireFirebaseStaffOrAdmin(context.auth, context.db, context.staffOnly);
	const admin = context.staffOnly ? false : await isAdminFirebaseUser(user, context.db);
	const reference = collection(context.db, collectionNames.sales);
	const source = admin
		? query(reference, orderBy('soldAt', 'desc'), limit(10000))
		: query(reference, where('staffUid', '==', user.uid), limit(10000));
	const snapshot = await getDocs(source);
	sales = snapshot.docs.map((item) => item.data() as SaleRecord).sort((first, second) => second.soldAt.localeCompare(first.soldAt));
	window.dispatchEvent(new Event('stetech-sales-updated'));
}

export async function syncInventoryMovements() {
	await requireAdmin();
	const snapshot = await getDocs(query(collection(firebaseDb, collectionNames.movements), orderBy('createdAt', 'desc'), limit(10000)));
	movements = snapshot.docs.map((item) => item.data() as InventoryMovement);
	window.dispatchEvent(new Event('stetech-inventory-updated'));
}

export async function syncPayments() {
	await requireAdmin();
	const [paymentSnapshot, transactionSnapshot] = await Promise.all([
		getDocs(query(collection(firebaseDb, collectionNames.payments), orderBy('createdAt', 'desc'), limit(10000))),
		getDocs(query(collection(firebaseDb, collectionNames.transactions), orderBy('soldAt', 'desc'), limit(10000))),
	]);
	payments = paymentSnapshot.docs.map((item) => item.data() as PaymentRecord);
	transactions = transactionSnapshot.docs.map((item) => item.data() as TransactionSummary);
	window.dispatchEvent(new Event('stetech-payments-updated'));
}

export async function saveProducts(products: Product[]) {
	await requireAdmin();
	for (const product of products) await upsertProduct(product);
}

export async function upsertProduct(product: Product) {
	await requireAdmin();
	const reference = doc(firebaseDb, collectionNames.products, String(product.id));
	await runTransaction(firebaseDb, async (transaction) => {
		const snapshot = await transaction.get(reference);
		const previous = snapshot.exists() ? Number(snapshot.data().stock) || 0 : 0;
		const next = Number(product.stock) || 0;
		transaction.set(reference, productRecord(product));
		if (previous !== next) {
			const movement: InventoryMovement = {
				id: crypto.randomUUID(), productId: product.id, productName: product.name,
				type: snapshot.exists() ? 'adjust' : 'opening', quantity: Math.abs(next - previous),
				delta: next - previous, stockBefore: previous, stockAfter: next,
				note: snapshot.exists() ? 'Product stock edited' : 'Opening stock', createdAt: new Date().toISOString(),
			};
			transaction.set(doc(firebaseDb, collectionNames.movements, movement.id), movement);
		}
	});
	const next = [...catalogue];
	const index = next.findIndex((item) => item.id === product.id);
	if (index >= 0) next[index] = product;
	else next.unshift(product);
	catalogue = next;
	window.dispatchEvent(new Event('stetech-products-updated'));
	return product;
}

export async function removeProduct(id: number) {
	const product = catalogue.find((item) => item.id === id);
	if (product) await upsertProduct({ ...product, active: false });
}

export async function addSales(input: {
	items: SaleLine[];
	customerName: string;
	customerPhone: string;
	location: string;
	paymentMethod: PaymentMethod;
	amountPaid: number;
}, context: StoreAuthContext = { auth: firebaseAuth, db: firebaseDb }) {
	const actor = await requireFirebaseStaffOrAdmin(context.auth, context.db, context.staffOnly);
	const staffName = await getSignedInStaffName(actor.uid, actor.displayName || actor.email || 'Staff', context.db);
	if (!input.items.length || input.items.length > 100) throw new Error('Add at least one product to the sale.');
	const total = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
	if (!Number.isFinite(input.amountPaid) || input.amountPaid < 0 || input.amountPaid > total) throw new Error('Amount received must be between zero and the sale total.');
	if (input.paymentMethod === 'Credit' && input.amountPaid > 0) throw new Error('Credit sales cannot include an amount received.');
	const transactionId = crypto.randomUUID();
	const soldAt = new Date().toISOString();
	const lines = input.items.map((item) => ({ ...item, id: crypto.randomUUID() }));
	const productIds = [...new Set(lines.map((line) => line.productId))];
	const result = await runTransaction(context.db, async (transaction) => {
		const products = new Map<number, { product: Product; reference: ReturnType<typeof doc> }>();
		for (const productId of productIds) {
			const reference = doc(context.db, collectionNames.products, String(productId));
			const snapshot = await transaction.get(reference);
			if (!snapshot.exists()) throw new Error('A product in this sale was not found.');
			const product = hydrate(snapshot.data() as Partial<Product>);
			if (product.active === false) throw new Error(`${product.name} is inactive.`);
			products.set(productId, { product, reference });
		}
		const quantities = new Map<number, number>();
		lines.forEach((line) => {
			if (!Number.isInteger(line.quantity) || line.quantity <= 0 || !Number.isFinite(line.unitPrice) || line.unitPrice < 0) throw new Error('Check sale quantities and prices.');
			quantities.set(line.productId, (quantities.get(line.productId) || 0) + line.quantity);
		});
		for (const [productId, quantity] of quantities) {
			const product = products.get(productId)!.product;
			if (quantity > Number(product.stock || 0)) throw new Error(`Only ${product.stock || 0} units of ${product.name} are available.`);
		}
		const nextReceipt = await nextReceiptNumber(transaction, new Date(soldAt), context.db);
		const verificationId = crypto.randomUUID();
		let remainingPaid = input.amountPaid;
		const records: SaleRecord[] = lines.map((line) => {
			const product = products.get(line.productId)!.product;
			const lineTotal = line.quantity * line.unitPrice;
			const amountPaid = Math.min(lineTotal, remainingPaid);
			remainingPaid -= amountPaid;
			return {
				id: line.id, transactionId, receiptNumber: nextReceipt.receiptNumber, verificationId, productId: product.id, productName: product.name,
				quantity: line.quantity, unitPrice: line.unitPrice, unitCost: Number(product.costPrice) || 0,
				total: lineTotal, amountPaid, customerName: input.customerName, customerPhone: input.customerPhone,
				location: input.location, paymentStatus: amountPaid >= lineTotal ? 'paid' : amountPaid > 0 ? 'partial' : 'pending',
				paymentMethod: input.paymentMethod, soldAt,
				staffUid: actor.uid, staffName,
			};
		});
		const stockMovements: InventoryMovement[] = [...quantities].map(([productId, quantity]) => {
			const product = products.get(productId)!.product;
			const stockBefore = Number(product.stock) || 0;
			return {
				id: crypto.randomUUID(), productId, productName: product.name, type: 'sale', quantity,
				delta: -quantity, stockBefore, stockAfter: stockBefore - quantity,
				note: `Sale ${transactionId}`, referenceId: transactionId, createdAt: soldAt,
				staffUid: actor.uid, staffName,
			};
		});
		const paymentStatus = input.amountPaid >= total ? 'paid' : input.amountPaid > 0 ? 'partial' : 'pending';
		const summary: TransactionSummary = {
			id: transactionId, receiptNumber: nextReceipt.receiptNumber, verificationId, customerName: input.customerName, customerPhone: input.customerPhone,
			location: input.location, total, amountPaid: input.amountPaid, balanceDue: total - input.amountPaid,
			paymentStatus, paymentMethod: input.paymentMethod, soldAt, saleIds: records.map((record) => record.id),
			staffUid: actor.uid, staffName,
		};
		const payment: PaymentRecord | undefined = input.amountPaid > 0 ? {
			id: crypto.randomUUID(), transactionId, receiptNumber: nextReceipt.receiptNumber, verificationId, customerName: input.customerName,
			method: input.paymentMethod as Exclude<PaymentMethod, 'Credit'>, amount: input.amountPaid, createdAt: soldAt,
			staffUid: actor.uid, staffName,
		} : undefined;
		const verification: ReceiptVerification = {
			id: verificationId, receiptNumber: nextReceipt.receiptNumber, transactionId,
			total, amountPaid: input.amountPaid, balanceDue: total - input.amountPaid,
			paymentStatus, issuedAt: soldAt, type: 'sale',
			staffUid: actor.uid, staffName,
		};
		for (const [productId, quantity] of quantities) {
			const { product, reference } = products.get(productId)!;
			transaction.update(reference, { stock: (Number(product.stock) || 0) - quantity });
		}
		records.forEach((record) => transaction.set(doc(context.db, collectionNames.sales, record.id), record));
		stockMovements.forEach((movement) => transaction.set(doc(context.db, collectionNames.movements, movement.id), movement));
		transaction.set(doc(context.db, collectionNames.transactions, transactionId), summary);
		if (payment) transaction.set(doc(context.db, collectionNames.payments, payment.id), payment);
		transaction.set(nextReceipt.counterReference, { lastNumber: nextReceipt.sequence });
		transaction.set(doc(context.db, collectionNames.receiptVerifications, verificationId), verification);
		return { records, stockMovements, summary, payment, verification };
	});
	const changedStock = new Map([...new Set(lines.map((line) => line.productId))].map((productId) => {
		const sold = lines.filter((line) => line.productId === productId).reduce((sum, line) => sum + line.quantity, 0);
		return [productId, sold] as const;
	}));
	catalogue = catalogue.map((product) => changedStock.has(product.id) ? { ...product, stock: Math.max(0, Number(product.stock || 0) - changedStock.get(product.id)!) } : product);
	sales = [...result.records, ...sales].slice(0, 10000);
	movements = [...result.stockMovements, ...movements].slice(0, 10000);
	transactions = [result.summary, ...transactions].slice(0, 10000);
	if (result.payment) payments = [result.payment, ...payments].slice(0, 10000);
	window.dispatchEvent(new Event('stetech-sales-updated'));
	window.dispatchEvent(new Event('stetech-products-updated'));
	window.dispatchEvent(new Event('stetech-inventory-updated'));
	window.dispatchEvent(new Event('stetech-payments-updated'));
	return result.records;
}

export async function recordPayment(input: { transactionId: string; amount: number; method: Exclude<PaymentMethod, 'Credit'> }) {
	await requireAdmin();
	if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error('Enter a valid payment amount.');
	const result = await runTransaction(firebaseDb, async (transaction) => {
		const transactionRef = doc(firebaseDb, collectionNames.transactions, input.transactionId);
		const transactionSnapshot = await transaction.get(transactionRef);
		if (!transactionSnapshot.exists()) throw new Error('Transaction not found.');
		const summary = transactionSnapshot.data() as TransactionSummary;
		if (input.amount > summary.balanceDue) throw new Error(`Outstanding balance is ${formatKES(summary.balanceDue)}.`);
		const saleSnapshots = [];
		for (const saleId of summary.saleIds) saleSnapshots.push(await transaction.get(doc(firebaseDb, collectionNames.sales, saleId)));
		const nextReceipt = await nextReceiptNumber(transaction, new Date());
		const verificationReference = doc(firebaseDb, collectionNames.receiptVerifications, summary.verificationId);
		const priorVerification = await transaction.get(verificationReference);
		const paymentVerificationId = crypto.randomUUID();
		const newAmountPaid = summary.amountPaid + input.amount;
		let remainingPaid = newAmountPaid;
		const updatedSales = saleSnapshots.filter((snapshot) => snapshot.exists()).map((snapshot) => {
			const sale = snapshot.data() as SaleRecord;
			const amountPaid = Math.min(sale.total, remainingPaid);
			remainingPaid -= amountPaid;
			const updated: SaleRecord = { ...sale, amountPaid, paymentStatus: amountPaid >= sale.total ? 'paid' : amountPaid > 0 ? 'partial' : 'pending' };
			transaction.set(snapshot.ref, updated);
			return updated;
		});
		const updatedSummary: TransactionSummary = {
			...summary, amountPaid: newAmountPaid, balanceDue: summary.total - newAmountPaid,
			paymentStatus: newAmountPaid >= summary.total ? 'paid' : 'partial',
		};
		const payment: PaymentRecord = {
			id: crypto.randomUUID(), transactionId: summary.id, receiptNumber: nextReceipt.receiptNumber,
			verificationId: paymentVerificationId, customerName: summary.customerName,
			method: input.method, amount: input.amount, createdAt: new Date().toISOString(),
		};
		const issuedAt = payment.createdAt;
		const paymentVerification: ReceiptVerification = {
			id: paymentVerificationId, receiptNumber: nextReceipt.receiptNumber, transactionId: summary.id,
			total: summary.total, amountPaid: newAmountPaid, balanceDue: updatedSummary.balanceDue,
			paymentStatus: updatedSummary.paymentStatus, issuedAt, type: 'payment',
		};
		const initialVerification: ReceiptVerification = priorVerification.exists()
			? { ...(priorVerification.data() as ReceiptVerification), amountPaid: newAmountPaid, balanceDue: updatedSummary.balanceDue, paymentStatus: updatedSummary.paymentStatus }
			: { id: summary.verificationId, receiptNumber: summary.receiptNumber, transactionId: summary.id, total: summary.total, amountPaid: newAmountPaid, balanceDue: updatedSummary.balanceDue, paymentStatus: updatedSummary.paymentStatus, issuedAt: summary.soldAt, type: 'sale' };
		transaction.set(transactionRef, updatedSummary);
		transaction.set(doc(firebaseDb, collectionNames.payments, payment.id), payment);
		transaction.set(nextReceipt.counterReference, { lastNumber: nextReceipt.sequence });
		transaction.set(verificationReference, initialVerification);
		transaction.set(doc(firebaseDb, collectionNames.receiptVerifications, paymentVerificationId), paymentVerification);
		return { payment, summary: updatedSummary, updatedSales };
	});
	payments = [result.payment, ...payments].slice(0, 10000);
	transactions = [result.summary, ...transactions.filter((item) => item.id !== result.summary.id)].slice(0, 10000);
	const byId = new Map(result.updatedSales.map((sale) => [sale.id, sale]));
	sales = sales.map((sale) => byId.get(sale.id) || sale);
	window.dispatchEvent(new Event('stetech-payments-updated'));
	window.dispatchEvent(new Event('stetech-sales-updated'));
	return result.payment;
}

export async function addSale(sale: SaleInput) {
	const records = await addSales({
		items: [{ productId: sale.productId, quantity: sale.quantity, unitPrice: sale.unitPrice }],
		customerName: sale.customerName,
		customerPhone: sale.customerPhone,
		location: sale.location,
		paymentMethod: sale.paymentMethod || 'Cash',
		amountPaid: sale.amountPaid ?? (sale.paymentStatus === 'paid' ? sale.quantity * sale.unitPrice : 0),
	});
	return records[0];
}

export async function adjustInventory(input: { productId: number; action: 'receive' | 'remove' | 'set'; quantity: number; note: string }) {
	await requireAdmin();
	const reference = doc(firebaseDb, collectionNames.products, String(input.productId));
	const movement = await runTransaction(firebaseDb, async (transaction) => {
		const snapshot = await transaction.get(reference);
		if (!snapshot.exists()) throw new Error('Product not found.');
		const product = hydrate(snapshot.data() as Partial<Product>);
		const before = Number(product.stock) || 0;
		if (!Number.isFinite(input.quantity) || input.quantity < 0 || (input.action !== 'set' && input.quantity === 0)) throw new Error('Enter a valid stock quantity.');
		const after = input.action === 'receive' ? before + input.quantity : input.action === 'remove' ? before - input.quantity : input.quantity;
		if (after < 0) throw new Error(`Only ${before} units are available to remove.`);
		if (after === before) throw new Error('The stock quantity is unchanged.');
		const record: InventoryMovement = {
			id: crypto.randomUUID(), productId: product.id, productName: product.name, type: input.action,
			quantity: Math.abs(after - before), delta: after - before, stockBefore: before, stockAfter: after,
			note: input.note, createdAt: new Date().toISOString(),
		};
		transaction.update(reference, { stock: after });
		transaction.set(doc(firebaseDb, collectionNames.movements, record.id), record);
		return record;
	});
	catalogue = catalogue.map((product) => product.id === input.productId ? { ...product, stock: movement.stockAfter } : product);
	movements = [movement, ...movements].slice(0, 10000);
	window.dispatchEvent(new Event('stetech-products-updated'));
	window.dispatchEvent(new Event('stetech-inventory-updated'));
	return movement;
}

export const getProductPrice = (product: Product) => product.specifications?.Price || 'Price on request';
export const getNumericPrice = (product: Product) => numericPrice(product) ?? 0;
export const formatKES = (amount: number) => `KSh ${amount.toLocaleString('en-KE')}`;
