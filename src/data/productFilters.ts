import type { Product } from './products';
export function numericPrice(product:Pick<Product,'specifications'>):number|null {const raw=product.specifications?.Price||'';const match=raw.replace(/,/g,'').match(/\d+(?:\.\d+)?/);return match?Number(match[0]):null;}
export const normalize=(text:string)=>text.toLowerCase().replace(/aluminum/g,'aluminium').replace(/[^a-z0-9]+/g,' ').trim();
const categoryAliases:Record<string,string[]>={
  'solar panel':['solar panels'],
  inverters:['solar inverters'],
  'solar water pumps':['solar dc pumps'],
  'solar lighting':['solar floodlight and streetlights'],
  'solar cables':['solar accessories and cables'],
  'solar accessories':['solar accessories and cables'],
};
export interface ProductFilters {category:string;query:string;sort:string;availability:string;priceLimit:string;}
export function filterProducts(products:Product[],filters:ProductFilters){
  const tokens=normalize(filters.query).split(' ').filter(Boolean);
  const selectedCategory=normalize(filters.category);
  const result=products.filter(p=>{const price=numericPrice(p);const productCategory=normalize(p.category);const search=normalize(`${p.name} ${p.category} ${p.description} ${Object.values(p.specifications||{}).join(' ')}`);return p.active!==false&&(filters.category==='All Products'||productCategory===selectedCategory||categoryAliases[selectedCategory]?.includes(productCategory))&&tokens.every(t=>search.includes(t))&&(filters.availability==='all'||(filters.availability==='in-stock'?p.stock!==undefined&&p.stock>0:filters.availability==='out-stock'?p.stock===0:p.stock===undefined))&&(filters.priceLimit==='all'||price!==null&&(filters.priceLimit==='under-10000'?price<10000:filters.priceLimit==='10k-50k'?price>=10000&&price<=50000:price>50000));});
  return result.sort((a,b)=>{if(filters.sort==='name')return a.name.localeCompare(b.name);if(filters.sort.startsWith('price-')){const aa=numericPrice(a),bb=numericPrice(b);if(aa===null)return bb===null?0:1;if(bb===null)return -1;return (filters.sort==='price-low'?aa-bb:bb-aa)||a.name.localeCompare(b.name);}return 0;});
}
