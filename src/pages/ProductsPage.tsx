import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BatteryCharging, Check, ChevronDown, Droplets, Filter, Minus, PackageSearch,
  PanelTop, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, X, Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { Product, categories } from "../data/products";
import { getNumericPrice, getProductPrice, getProducts } from "../data/productStore";

type CartItem = { product: Product; quantity: number };
const WHATSAPP = "254717656407";

const categoryVisuals: Record<string, { icon: React.ElementType; text: string }> = {
  "Solar Panels": { icon: PanelTop, text: "PV modules for homes, farms and commercial installations." },
  "Solar Inverters": { icon: Zap, text: "Hybrid and backup power management for dependable energy." },
  "Solar Batteries": { icon: BatteryCharging, text: "Energy storage for backup, off-grid and hybrid systems." },
  "Solar DC Pumps": { icon: Droplets, text: "Efficient solar pumping solutions for water and irrigation." },
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [category, setCategory] = useState("All Products");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [availability, setAvailability] = useState("all");
  const [priceLimit, setPriceLimit] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", county: "", town: "", address: "", notes: "" });

  useEffect(() => {
    const refresh = () => setProducts(getProducts());
    window.addEventListener("stetech-products-updated", refresh);
    return () => window.removeEventListener("stetech-products-updated", refresh);
  }, []);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const inCategory = category === "All Products" || p.category === category;
      const text = `${p.name} ${p.description} ${p.category} ${Object.values(p.specifications || {}).join(" ")}`.toLowerCase();
      const matchesSearch = text.includes(query.trim().toLowerCase());
      const price = getNumericPrice(p);
      const matchesAvailability = availability === "all" || (availability === "in-stock" ? Number(p.stock || 0) > 0 : Number(p.stock || 0) <= 0);
      const matchesPrice = priceLimit === "all" || (priceLimit === "under-10000" ? price > 0 && price < 10000 : priceLimit === "10k-50k" ? price >= 10000 && price <= 50000 : price > 50000);
      return inCategory && matchesSearch && matchesAvailability && matchesPrice;
    });

    if (sort === "price-low") result = [...result].sort((a, b) => getNumericPrice(a) - getNumericPrice(b));
    if (sort === "price-high") result = [...result].sort((a, b) => getNumericPrice(b) - getNumericPrice(a));
    if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, category, query, sort, availability, priceLimit]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, { product, quantity }];
    });
  };

  const changeQuantity = (id: number, delta: number) => {
    setCart((current) => current.map((item) => item.product.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + getNumericPrice(item.product) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const resetFilters = () => { setCategory("All Products"); setQuery(""); setSort("featured"); setAvailability("all"); setPriceLimit("all"); };

  const openCheckout = (product?: Product) => {
    if (product) addToCart(product);
    setCheckoutOpen(true);
  };

  const submitOrder = (event: React.FormEvent) => {
    event.preventDefault();
    if (!cart.length) return;
    const items = cart.map((item) => `- ${item.product.name} x ${item.quantity} — KSh ${(getNumericPrice(item.product) * item.quantity).toLocaleString("en-KE")}`).join("\n");
    const message = `Hello STETECH Solar Technology,\n\nI would like to place an order from your website.\n\nORDER SUMMARY\n${items}\n\nEstimated product total: KSh ${cartTotal.toLocaleString("en-KE")}\n\nDELIVERY DETAILS\nName: ${customer.name}\nPhone/WhatsApp: ${customer.phone}\nCounty: ${customer.county}\nTown/Area: ${customer.town}\nDelivery location/landmark: ${customer.address}\nAdditional notes: ${customer.notes || "None"}\n\nPlease confirm availability, final delivery charges and the next steps.`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank");
    setCheckoutOpen(false);
    setCart([]);
  };

  const featuredCategories = ["Solar Panels", "Solar Inverters", "Solar Batteries", "Solar DC Pumps"];

  return (
    <main className="min-h-screen bg-[#f5f8f5] text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(34,197,94,.25),transparent_28%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,.18),transparent_25%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide text-emerald-200 backdrop-blur"><Sparkles className="h-4 w-4" /> Solar equipment catalogue</div>
            <h1 className="mt-6 text-4xl font-black tracking-[-.03em] sm:text-6xl">Good solar decisions start with <span className="text-emerald-400">clear choices.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Explore STETECH equipment with transparent pricing, compare options and build an order that reaches our team directly on WhatsApp.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#catalogue" className="inline-flex items-center rounded-2xl bg-emerald-500 px-6 py-3.5 font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400">Explore catalogue <ArrowRight className="ml-2 h-4 w-4" /></a>
              <Link to="/contact" className="inline-flex items-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-bold transition hover:bg-white/10">Talk to our team</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCategories.map((name, index) => {
            const visual = categoryVisuals[name];
            const Icon = visual.icon;
            return <button key={name} onClick={() => { setCategory(name); document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" }); }} className="group min-h-[190px] rounded-[26px] border border-slate-200 bg-white p-6 text-left shadow-[0_12px_40px_rgba(15,23,42,.07)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_22px_55px_rgba(15,23,42,.11)]">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-500 group-hover:text-white"><Icon className="h-5 w-5" /></span>
              <p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-slate-400">0{index + 1}</p>
              <h3 className="mt-1 text-lg font-black">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{visual.text}</p>
            </button>;
          })}
        </div>
      </section>

      <section id="catalogue" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_15px_50px_rgba(15,23,42,.06)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-600">Browse everything</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Solar catalogue</h2><p className="mt-1 text-sm text-slate-500">Showing {filtered.length} of {products.length} products.</p></div>
            <div className="flex flex-wrap gap-2">
              {cartCount > 0 && <button onClick={() => setCheckoutOpen(true)} className="inline-flex items-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-600"><ShoppingBag className="mr-2 h-4 w-4" /> Order ({cartCount}) · KSh {cartTotal.toLocaleString("en-KE")}</button>}
              <button onClick={() => setFiltersOpen((value) => !value)} className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"><SlidersHorizontal className="mr-2 h-4 w-4" /> Filters <ChevronDown className={`ml-2 h-4 w-4 transition ${filtersOpen ? "rotate-180" : ""}`} /></button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="relative block"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, categories or specifications…" className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white" /></label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-emerald-400"><option value="featured">Featured order</option><option value="name">Name A–Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select>
          </div>

          {filtersOpen && <div className="mt-4 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-black uppercase tracking-wide text-slate-500">Category<select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal"><option>All Products</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-xs font-black uppercase tracking-wide text-slate-500">Availability<select value={availability} onChange={(e) => setAvailability(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal"><option value="all">All products</option><option value="in-stock">In stock</option><option value="out-stock">Out of stock</option></select></label>
            <label className="text-xs font-black uppercase tracking-wide text-slate-500">Price range<select value={priceLimit} onChange={(e) => setPriceLimit(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal"><option value="all">All prices</option><option value="under-10000">Below KSh 10,000</option><option value="10k-50k">KSh 10,000 – 50,000</option><option value="over-50k">Above KSh 50,000</option></select></label>
            <div className="flex items-end"><button onClick={resetFilters} className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Filter className="mr-2 h-4 w-4" /> Reset filters</button></div>
          </div>}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((product) => {
            const price = getNumericPrice(product);
            const stock = Number(product.stock || 0);
            return <article key={product.id} className="group flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,.05)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_55px_rgba(15,23,42,.12)]">
              <button onClick={() => setSelected(product)} className="relative block aspect-[4/3] w-full overflow-hidden bg-[#f7faf7] p-6 text-left" aria-label={`View ${product.name}`}>
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 shadow-sm">{product.category}</div>
                <img src={product.image} alt={product.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.06]" loading="lazy" />
              </button>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 min-h-[3.5rem] font-black leading-6 text-slate-900">{product.name}</h3>
                <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-5 text-slate-500">{product.description}</p>
                <div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price</p><p className="mt-0.5 text-lg font-black text-slate-950">{getProductPrice(product)}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{stock > 0 ? `${stock} in stock` : "Check availability"}</span></div>
                <div className="mt-5 grid grid-cols-[1fr_auto] gap-2"><button onClick={() => setSelected(product)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">Details</button><button onClick={() => openCheckout(product)} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Order</button></div>
              </div>
            </article>;
          })}
        </div>

        {!filtered.length && <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><PackageSearch className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 text-lg font-black">No products match those filters</h3><p className="mt-1 text-sm text-slate-500">Try a different category, search term or price range.</p><button onClick={resetFilters} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Clear filters</button></div>}
      </section>

      {selected && <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-md" onMouseDown={(e) => { if (e.currentTarget === e.target) setSelected(null); }}>
        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-white shadow-2xl animate-modal-in">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-600">Product details</p><button onClick={() => setSelected(null)} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" aria-label="Close"><X className="h-5 w-5" /></button></div>
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-2">
            <div className="aspect-square rounded-[26px] bg-[#f6f9f6] p-8"><img src={selected.image} alt={selected.name} className="h-full w-full object-contain" /></div>
            <div><p className="text-xs font-black uppercase tracking-widest text-slate-400">{selected.category}</p><h2 className="mt-2 text-3xl font-black tracking-tight">{selected.name}</h2><p className="mt-4 leading-7 text-slate-600">{selected.description}</p><p className="mt-6 text-2xl font-black text-emerald-700">{getProductPrice(selected)}</p>
              <div className="mt-7 grid gap-2">{selected.features.slice(0, 6).map((feature) => <div key={feature} className="flex gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{feature}</div>)}</div>
              <div className="mt-7 grid grid-cols-2 gap-3"><button onClick={() => setSelected(null)} className="rounded-2xl border border-slate-200 px-5 py-3.5 font-bold text-slate-700">Continue browsing</button><button onClick={() => { setSelected(null); openCheckout(selected); }} className="rounded-2xl bg-slate-950 px-5 py-3.5 font-black text-white transition hover:bg-emerald-600">Add to order</button></div>
            </div>
          </div>
        </div>
      </div>}

      {checkoutOpen && <div className="fixed inset-0 z-[75] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-md">
        <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[30px] bg-white shadow-2xl animate-modal-in">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-600">WhatsApp order</p><h2 className="mt-1 text-2xl font-black">Delivery details</h2></div><button onClick={() => setCheckoutOpen(false)} className="rounded-full bg-slate-100 p-2" aria-label="Close"><X className="h-5 w-5" /></button></div>
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[.85fr_1.15fr]">
            <div className="rounded-[26px] bg-slate-50 p-5"><div className="flex items-center justify-between"><h3 className="font-black">Your order</h3><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{cartCount} items</span></div><div className="mt-4 space-y-2">{cart.map((item) => <div key={item.product.id} className="flex gap-3 rounded-2xl bg-white p-3"><img src={item.product.image} alt="" className="h-14 w-14 rounded-xl bg-slate-50 object-contain" /><div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-bold">{item.product.name}</p><p className="mt-1 text-xs text-slate-400">KSh {getNumericPrice(item.product).toLocaleString("en-KE")} each</p><div className="mt-2 flex items-center gap-2"><button onClick={() => changeQuantity(item.product.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100"><Minus className="h-3 w-3" /></button><span className="w-5 text-center text-xs font-black">{item.quantity}</span><button onClick={() => changeQuantity(item.product.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100"><Plus className="h-3 w-3" /></button></div></div><p className="font-black">KSh {(getNumericPrice(item.product) * item.quantity).toLocaleString("en-KE")}</p></div>)}</div><div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5"><span className="font-bold text-slate-500">Estimated total</span><span className="text-xl font-black">KSh {cartTotal.toLocaleString("en-KE")}</span></div></div>
            <form onSubmit={submitOrder} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Full name<input required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-400" /></label><label className="text-sm font-bold">Phone / WhatsApp<input required value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-400" placeholder="07xx xxx xxx" /></label><label className="text-sm font-bold">County<input required value={customer.county} onChange={(e) => setCustomer({ ...customer, county: e.target.value })} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-400" /></label><label className="text-sm font-bold">Town / Area<input required value={customer.town} onChange={(e) => setCustomer({ ...customer, town: e.target.value })} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-400" /></label><label className="sm:col-span-2 text-sm font-bold">Delivery location / landmark<input required value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-400" placeholder="Building, road, landmark or GPS pin" /></label><label className="sm:col-span-2 text-sm font-bold">Additional notes<textarea value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400" /></label><button disabled={!cart.length} className="sm:col-span-2 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-4 font-black text-slate-950 transition hover:bg-emerald-400 disabled:opacity-40"><ShoppingBag className="mr-2 h-5 w-5" /> Send order to WhatsApp</button><p className="sm:col-span-2 text-center text-xs text-slate-400">Your order opens in WhatsApp for final confirmation. Delivery charges and availability are confirmed by STETECH.</p></form>
          </div>
        </div>
      </div>}
    </main>
  );
};

export default ProductsPage;
