import { initialProducts, type Product } from './products';
import { Cog } from 'lucide-react';
import { numericPrice } from './productFilters';

export type PaymentMethod = 'Cash' | 'M-Pesa' | 'Bank' | 'Credit';
export interface SaleRecord {
	id: string;
	transactionId?: string;
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
}

export interface PaymentRecord {
	id: string;
	transactionId: string;
	customerName: string;
	method: Exclude<PaymentMethod, 'Credit'>;
	amount: number;
	createdAt: string;
}

export interface TransactionSummary {
	id: string;
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
const mergeRecords = <T extends { id: string }>(current: T[], incoming: T[]) =>
	[...new Map([...current, ...incoming].map((record) => [record.id, record])).values()];

async function api(path: string, body?: unknown, method = body ? 'PUT' : 'GET') {
	const response = await fetch(path, {
		...(body ? { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
	});
	const data = await response.json().catch(() => null);
	if (!response.ok) {
		throw new Error(data?.error || (response.status === 404
			? 'Admin API routes are missing from this deployment. Redeploy the latest version.'
			: 'Could not save changes. Please try again.'));
	}
	if (!data) throw new Error('The admin API returned an invalid response.');
	return data;
}

export const getProducts = () => catalogue.filter((product) => product.active !== false);
export const getAllProducts = () => catalogue;
export const getSales = () => sales;
export const getInventoryMovements = () => movements;
export const getPayments = () => payments;
export const getTransactions = () => transactions;

export async function syncProducts() {
	try {
		const data = await api('/api/catalogue');
		catalogue = data.products.map(hydrate);
		window.dispatchEvent(new Event('stetech-products-updated'));
	} catch {
		// Keep the supplied catalogue readable when offline.
	}
}

export async function syncSales() {
	const data = await api('/api/sales');
	sales = data.sales;
	window.dispatchEvent(new Event('stetech-sales-updated'));
}

export async function syncInventoryMovements() {
	const data = await api('/api/inventory');
	movements = data.movements;
	window.dispatchEvent(new Event('stetech-inventory-updated'));
}

export async function syncPayments() {
	const data = await api('/api/payments');
	payments = data.payments;
	transactions = data.transactions;
	window.dispatchEvent(new Event('stetech-payments-updated'));
}

export async function saveProducts(products: Product[]) {
	const serializable = products.map((product) => {
		const record = { ...product } as Partial<Product>;
		delete record.icon;
		return record;
	});
	await api('/api/catalogue', { products: serializable });
	catalogue = products;
	window.dispatchEvent(new Event('stetech-products-updated'));
}

export async function upsertProduct(product: Product) {
	const record = { ...product } as Partial<Product>;
	delete record.icon;
	await api('/api/catalogue', { product: record }, 'POST');
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
}) {
	const data = await api('/api/sales', input, 'POST');
	sales = data.sales;
	catalogue = data.products.map(hydrate);
	movements = mergeRecords(movements, data.movements || []);
	payments = mergeRecords(payments, data.payments || []);
	transactions = mergeRecords(transactions, data.transactions || (data.transaction ? [data.transaction] : []));
	window.dispatchEvent(new Event('stetech-sales-updated'));
	window.dispatchEvent(new Event('stetech-products-updated'));
	window.dispatchEvent(new Event('stetech-inventory-updated'));
	window.dispatchEvent(new Event('stetech-payments-updated'));
	return data.records as SaleRecord[];
}

export async function recordPayment(input: { transactionId: string; amount: number; method: Exclude<PaymentMethod, 'Credit'> }) {
	const data = await api('/api/payments', input, 'POST');
	payments = data.payments;
	transactions = transactions.map((transaction) => transaction.id === data.transaction.id ? data.transaction : transaction);
	sales = sales.map((sale) => data.sales.find((updated: SaleRecord) => updated.id === sale.id) || sale);
	window.dispatchEvent(new Event('stetech-payments-updated'));
	window.dispatchEvent(new Event('stetech-sales-updated'));
	return data.payment as PaymentRecord;
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
	const data = await api('/api/inventory', input, 'POST');
	catalogue = data.products.map(hydrate);
	movements = data.movements;
	window.dispatchEvent(new Event('stetech-products-updated'));
	window.dispatchEvent(new Event('stetech-inventory-updated'));
	return data.movement as InventoryMovement;
}

export const getProductPrice = (product: Product) => product.specifications?.Price || 'Price on request';
export const getNumericPrice = (product: Product) => numericPrice(product) ?? 0;
export const formatKES = (amount: number) => `KSh ${amount.toLocaleString('en-KE')}`;
