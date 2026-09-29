import { initialProducts, Product } from "./products";
import { Cog } from "lucide-react";

export interface SaleRecord {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  customerName: string;
  customerPhone: string;
  location: string;
  paymentStatus: "paid" | "pending" | "partial";
  soldAt: string;
}

const PRODUCTS_KEY = "stetech_products_v2";
const SALES_KEY = "stetech_sales_v2";

const priceFromProduct = (product: Product) => {
  const raw = product.specifications?.Price || "";
  const match = raw.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const hydrate = (saved: Partial<Product>): Product => {
  const seed = initialProducts.find((p) => p.id === saved.id);
  return {
    ...(seed || {
      id: saved.id || Date.now(),
      name: "Product",
      category: "Other",
      image: "",
      description: "",
      features: [],
      specifications: {},
      icon: seed?.icon,
      color: "from-slate-700 to-emerald-500",
    }),
    ...saved,
    icon: seed?.icon || saved.icon || Cog,
    stock: Number(saved.stock ?? seed?.stock ?? 0),
    costPrice: Number(saved.costPrice ?? seed?.costPrice ?? 0),
    active: saved.active ?? seed?.active ?? true,
  } as Product;
};

export const getProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return initialProducts.map((p) => ({ ...p, stock: p.stock ?? 0, costPrice: p.costPrice ?? Math.round(priceFromProduct(p) * 0.8), active: true }));
    const saved = JSON.parse(raw) as Partial<Product>[];
    return saved.map(hydrate).filter((p) => p.active !== false);
  } catch {
    return initialProducts.map((p) => ({ ...p, stock: p.stock ?? 0, costPrice: p.costPrice ?? Math.round(priceFromProduct(p) * 0.8), active: true }));
  }
};

export const getAllProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return initialProducts.map((p) => ({ ...p, stock: p.stock ?? 0, costPrice: p.costPrice ?? Math.round(priceFromProduct(p) * 0.8), active: true }));
    return (JSON.parse(raw) as Partial<Product>[]).map(hydrate);
  } catch {
    return initialProducts.map((p) => ({ ...p, stock: p.stock ?? 0, costPrice: p.costPrice ?? Math.round(priceFromProduct(p) * 0.8), active: true }));
  }
};

export const saveProducts = (products: Product[]) => {
  const serializable = products.map(({ icon, ...product }) => product);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(serializable));
  window.dispatchEvent(new Event("stetech-products-updated"));
};

export const upsertProduct = (product: Product) => {
  const products = getAllProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) products[index] = product;
  else products.unshift(product);
  saveProducts(products);
  return product;
};

export const removeProduct = (id: number) => {
  const products = getAllProducts().map((p) => p.id === id ? { ...p, active: false } : p);
  saveProducts(products);
};

export const resetProductCatalogue = () => {
  localStorage.removeItem(PRODUCTS_KEY);
  window.dispatchEvent(new Event("stetech-products-updated"));
};

export const getSales = (): SaleRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(SALES_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveSales = (sales: SaleRecord[]) => {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  window.dispatchEvent(new Event("stetech-sales-updated"));
};

export const addSale = (sale: Omit<SaleRecord, "id" | "total" | "soldAt">) => {
  const record: SaleRecord = {
    ...sale,
    id: `ST-${Date.now()}`,
    total: sale.quantity * sale.unitPrice,
    soldAt: new Date().toISOString(),
  };
  const sales = getSales();
  saveSales([record, ...sales]);

  const products = getAllProducts();
  const product = products.find((p) => p.id === sale.productId);
  if (product) {
    product.stock = Math.max(0, Number(product.stock || 0) - sale.quantity);
    saveProducts(products);
  }
  return record;
};

export const clearSales = () => {
  localStorage.removeItem(SALES_KEY);
  window.dispatchEvent(new Event("stetech-sales-updated"));
};

export const getProductPrice = (product: Product) => product.specifications?.Price || "Price on request";
export const getNumericPrice = (product: Product) => priceFromProduct(product);
export const formatKES = (amount: number) => `KSh ${amount.toLocaleString("en-KE")}`;
