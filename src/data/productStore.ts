import { initialProducts, type Product } from './products';
import { Cog } from 'lucide-react';
import { numericPrice } from './productFilters';
export interface SaleRecord {id:string;productId:number;productName:string;quantity:number;unitPrice:number;total:number;customerName:string;customerPhone:string;location:string;paymentStatus:'paid'|'pending'|'partial';soldAt:string;}
let catalogue:Product[]=initialProducts.map(p=>({...p,active:true}));
let sales:SaleRecord[]=[];
const hydrate=(p:Partial<Product>):Product=>({...p,icon:initialProducts.find(seed=>seed.id===p.id)?.icon||Cog,stock:typeof p.stock==='number'?p.stock:undefined,active:p.active!==false}) as Product;
async function api(path:string,body?:unknown){const response=await fetch(path,body?{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||'Could not save changes. Please try again.');}return response.json();}
export const getProducts=()=>catalogue.filter(p=>p.active!==false);
export const getAllProducts=()=>catalogue;
export async function syncProducts(){try{const data=await api('/api/catalogue');catalogue=data.products.map(hydrate);window.dispatchEvent(new Event('stetech-products-updated'));}catch{/* Keep the supplied catalogue readable when offline. */}}
export async function syncSales(){const data=await api('/api/sales');sales=data.sales;window.dispatchEvent(new Event('stetech-sales-updated'));}
export async function saveProducts(products:Product[]){const serializable=products.map(p=>{const record={...p} as Partial<Product>;delete record.icon;return record;});await api('/api/catalogue',{products:serializable});catalogue=products;window.dispatchEvent(new Event('stetech-products-updated'));}
export async function upsertProduct(product:Product){const next=[...catalogue];const index=next.findIndex(p=>p.id===product.id);if(index>=0)next[index]=product;else next.unshift(product);await saveProducts(next);return product;}
export async function removeProduct(id:number){await saveProducts(catalogue.map(p=>p.id===id?{...p,active:false}:p));}
export const getSales=()=>sales;
export async function addSale(sale:Omit<SaleRecord,'id'|'total'|'soldAt'>){const response=await fetch('/api/sales',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sale)});const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not save sale.');sales=data.sales;catalogue=data.products.map(hydrate);window.dispatchEvent(new Event('stetech-sales-updated'));window.dispatchEvent(new Event('stetech-products-updated'));return data.record as SaleRecord;}
export const getProductPrice=(product:Product)=>product.specifications?.Price||'Price on request';
export const getNumericPrice=(product:Product)=>numericPrice(product)??0;
export const formatKES=(amount:number)=>`KSh ${amount.toLocaleString('en-KE')}`;
