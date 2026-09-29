import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  Check,
  Download,
  Edit3,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Product } from "../data/products";
import {
  addSale,
  formatKES,
  getAllProducts,
  getNumericPrice,
  getProductPrice,
  getSales,
  removeProduct,
  saveProducts,
  SaleRecord,
  upsertProduct,
} from "../data/productStore";
import { Cog } from "lucide-react";

type Tab = "overview" | "products" | "sales";

const emptyProduct: Product = {
  id: 0,
  name: "",
  category: "Solar Panels",
  image: "",
  description: "",
  features: [],
  specifications: { Price: "KSh 0" },
  icon: Cog,
  color: "from-slate-700 to-emerald-500",
  stock: 0,
  costPrice: 0,
  active: true,
};

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "stetech2026";

const AdminPage: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("stetech-admin") === "true");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [products, setProducts] = useState<Product[]>(getAllProducts());
  const [sales, setSales] = useState<SaleRecord[]>(getSales());
  const [productSearch, setProductSearch] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product>(emptyProduct);
  const [saleForm, setSaleForm] = useState({
    productId: "",
    quantity: "1",
    customerName: "",
    customerPhone: "",
    location: "",
    paymentStatus: "paid" as SaleRecord["paymentStatus"],
    unitPrice: "",
  });

  const refresh = () => {
    setProducts(getAllProducts());
    setSales(getSales());
  };

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("stetech-products-updated", handler);
    window.addEventListener("stetech-sales-updated", handler);
    return () => {
      window.removeEventListener("stetech-products-updated", handler);
      window.removeEventListener("stetech-sales-updated", handler);
    };
  }, []);

  const stats = useMemo(() => {
    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const units = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const stock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
    const lowStock = products.filter((p) => Number(p.stock || 0) <= 5).length;
    return { revenue, units, stock, lowStock };
  }, [products, sales]);

  const filteredProducts = products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(productSearch.toLowerCase()));

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("stetech-admin", "true");
      setLoggedIn(true);
      setPassword("");
    } else {
      alert("Incorrect admin password.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("stetech-admin");
    setLoggedIn(false);
  };

  const openNewProduct = () => {
    setEditingProduct({ ...emptyProduct, id: Date.now() });
    setShowProductForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct({ ...product, specifications: { ...product.specifications } });
    setShowProductForm(true);
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number((editingProduct.specifications.Price || "").replace(/[^\d.]/g, "")) || 0;
    const product = {
      ...editingProduct,
      specifications: { ...editingProduct.specifications, Price: `KSh ${price.toLocaleString("en-KE")}` },
      stock: Number(editingProduct.stock || 0),
      costPrice: Number(editingProduct.costPrice || 0),
      active: true,
    };
    upsertProduct(product);
    refresh();
    setShowProductForm(false);
  };

  const deleteProduct = (product: Product) => {
    if (window.confirm(`Hide "${product.name}" from the public catalogue?`)) {
      removeProduct(product.id);
      refresh();
    }
  };

  const recordSale = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === Number(saleForm.productId));
    if (!product) return;
    const quantity = Math.max(1, Number(saleForm.quantity) || 1);
    const unitPrice = Number(saleForm.unitPrice) || getNumericPrice(product);
    addSale({
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      customerName: saleForm.customerName || "Walk-in customer",
      customerPhone: saleForm.customerPhone,
      location: saleForm.location,
      paymentStatus: saleForm.paymentStatus,
    });
    setSaleForm({ productId: "", quantity: "1", customerName: "", customerPhone: "", location: "", paymentStatus: "paid", unitPrice: "" });
    refresh();
  };

  const exportSales = () => {
    const header = "Sale ID,Date,Product,Quantity,Unit Price,Total,Customer,Phone,Location,Payment Status";
    const rows = sales.map((s) => [s.id, new Date(s.soldAt).toLocaleString(), s.productName, s.quantity, s.unitPrice, s.total, s.customerName, s.customerPhone, s.location, s.paymentStatus]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `stetech-sales-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!loggedIn) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-slate-950 px-4 py-16">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white p-8 shadow-2xl sm:p-10">
          <div className="mb-8 text-center">
            <img src="/stetech solar.png" alt="STETECH" className="mx-auto h-16 w-16 object-contain" />
            <p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-emerald-600">STETECH control room</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Admin sign in</h1>
            <p className="mt-2 text-sm text-slate-500">Manage your catalogue, inventory and sales records.</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <label className="block"><span className="mb-2 block text-sm font-bold">Admin password</span><input type="password" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50" placeholder="Enter password" /></label>
            <button className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white hover:bg-emerald-600">Enter dashboard</button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">For production, set <code>VITE_ADMIN_PASSWORD</code> in your environment and connect a server-side authentication/database.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-600">STETECH back office</p><h1 className="mt-1 text-3xl font-black text-slate-950">Sales & catalogue</h1></div>
          <button onClick={logout} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600"><LogOut className="mr-2 inline h-4 w-4" /> Sign out</button>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-2 sm:grid-cols-3">
          {[
            ["overview", LayoutDashboard, "Overview"],
            ["products", Boxes, "Products & stock"],
            ["sales", BarChart3, "Sales records"],
          ].map(([key, Icon, label]) => (
            <button key={String(key)} onClick={() => setTab(key as Tab)} className={`rounded-xl px-4 py-3 text-left text-sm font-black transition ${tab === key ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50"}`}><Icon className="mr-2 inline h-4 w-4" />{String(label)}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [TrendingUp, "Sales revenue", formatKES(stats.revenue), "from recorded sales"],
                [ShoppingCart, "Units sold", stats.units.toLocaleString(), "units recorded"],
                [Boxes, "Stock on hand", stats.stock.toLocaleString(), "units across catalogue"],
                [PackagePlus, "Low stock", stats.lowStock.toLocaleString(), "products at 5 or below"],
              ].map(([Icon, label, value, note]) => (
                <div key={String(label)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between"><p className="text-sm font-bold text-slate-500">{String(label)}</p><Icon className="h-5 w-5 text-emerald-500" /></div>
                  <p className="mt-4 text-3xl font-black text-slate-950">{String(value)}</p>
                  <p className="mt-1 text-xs text-slate-400">{String(note)}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Recent sales</h2><p className="text-sm text-slate-500">Latest transactions entered by admin</p></div><button onClick={() => setTab("sales")} className="text-sm font-bold text-emerald-600">View all</button></div>
                <div className="mt-5 space-y-2">
                  {sales.slice(0, 6).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                      <div className="min-w-0"><p className="truncate font-bold">{sale.productName}</p><p className="text-xs text-slate-400">{sale.customerName} · {new Date(sale.soldAt).toLocaleDateString()}</p></div>
                      <div className="shrink-0 text-right"><p className="font-black text-emerald-600">{formatKES(sale.total)}</p><p className="text-xs text-slate-400">{sale.quantity} unit{sale.quantity === 1 ? "" : "s"}</p></div>
                    </div>
                  ))}
                  {!sales.length && <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No sales recorded yet. Add your first sale from the Sales Records tab.</div>}
                </div>
              </div>
              <div className="rounded-3xl bg-slate-950 p-6 text-white">
                <h2 className="text-xl font-black">Catalogue health</h2>
                <div className="mt-6 space-y-5">
                  <div><div className="flex justify-between text-sm"><span>Active products</span><b>{products.filter((p) => p.active !== false).length}</b></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-emerald-400" style={{ width: `${Math.min(100, products.length / 1.5)}%` }} /></div></div>
                  <div><p className="text-sm text-slate-400">Tip</p><p className="mt-1 text-sm leading-6">Keep stock quantities updated so the sales dashboard gives you a useful picture of what is moving and what needs replenishment.</p></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div className="mt-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search catalogue..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-emerald-400 sm:w-80" /></div>
              <button onClick={openNewProduct} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-emerald-600"><Plus className="mr-2 inline h-4 w-4" /> Add product</button>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[2.2fr_1fr_1fr_1fr_130px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400 md:grid"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Actions</span></div>
              <div className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="grid gap-3 px-5 py-4 md:grid-cols-[2.2fr_1fr_1fr_1fr_130px] md:items-center md:gap-4">
                    <div className="flex min-w-0 items-center gap-3"><img src={product.image} alt="" className="h-12 w-14 rounded-xl bg-slate-50 object-contain p-1" /><div className="min-w-0"><p className="truncate font-bold">{product.name}</p><p className="text-xs text-slate-400">ID #{product.id}</p></div></div>
                    <div className="text-sm text-slate-500">{product.category}</div>
                    <div className="font-black text-emerald-600">{getProductPrice(product)}</div>
                    <div><span className={`rounded-full px-3 py-1 text-xs font-black ${Number(product.stock || 0) <= 5 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{product.stock ?? 0} units</span></div>
                    <div className="flex gap-2"><button onClick={() => openEdit(product)} className="rounded-xl bg-slate-100 p-2.5 hover:bg-emerald-50 hover:text-emerald-700"><Edit3 className="h-4 w-4" /></button><button onClick={() => deleteProduct(product)} className="rounded-xl bg-slate-100 p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "sales" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
            <form onSubmit={recordSale} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">Record a sale</h2>
              <p className="mt-1 text-sm text-slate-500">Each recorded sale updates the product stock automatically.</p>
              <div className="mt-5 space-y-4">
                <label className="block text-sm font-bold">Product<select required value={saleForm.productId} onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value, unitPrice: e.target.value ? String(getNumericPrice(products.find((p) => p.id === Number(e.target.value))!)) : "" })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"><option value="">Select product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
                <div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Quantity<input required min="1" type="number" value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3" /></label><label className="text-sm font-bold">Unit price<input required min="0" type="number" value={saleForm.unitPrice} onChange={(e) => setSaleForm({ ...saleForm, unitPrice: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3" /></label></div>
                <label className="block text-sm font-bold">Customer<input value={saleForm.customerName} onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3" placeholder="Customer name" /></label>
                <label className="block text-sm font-bold">Phone<input value={saleForm.customerPhone} onChange={(e) => setSaleForm({ ...saleForm, customerPhone: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3" placeholder="+254..." /></label>
                <label className="block text-sm font-bold">Location<input value={saleForm.location} onChange={(e) => setSaleForm({ ...saleForm, location: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3" placeholder="Town / delivery area" /></label>
                <label className="block text-sm font-bold">Payment status<select value={saleForm.paymentStatus} onChange={(e) => setSaleForm({ ...saleForm, paymentStatus: e.target.value as SaleRecord["paymentStatus"] })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"><option value="paid">Paid</option><option value="pending">Pending</option><option value="partial">Partial</option></select></label>
                <button className="w-full rounded-2xl bg-emerald-500 px-5 py-3.5 font-black text-slate-950 hover:bg-emerald-400"><Check className="mr-2 inline h-4 w-4" /> Save sale</button>
              </div>
            </form>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black">Sales database</h2><p className="text-sm text-slate-500">{sales.length} recorded transactions</p></div><button onClick={exportSales} disabled={!sales.length} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-40"><Download className="mr-2 inline h-4 w-4" /> Export CSV</button></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Date</th><th>Product</th><th>Customer</th><th>Qty</th><th>Total</th><th>Status</th></tr></thead><tbody className="divide-y divide-slate-100">{sales.map((sale) => <tr key={sale.id}><td className="px-5 py-4 text-slate-500">{new Date(sale.soldAt).toLocaleDateString()}</td><td className="py-4 font-bold">{sale.productName}</td><td className="py-4">{sale.customerName}<div className="text-xs text-slate-400">{sale.location}</div></td><td className="py-4">{sale.quantity}</td><td className="py-4 font-black text-emerald-600">{formatKES(sale.total)}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${sale.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{sale.paymentStatus}</span></td></tr>)}</tbody></table>{!sales.length && <div className="p-12 text-center text-slate-500">Your sales records will appear here.</div>}</div>
            </div>
          </div>
        )}
      </div>

      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form onSubmit={saveProduct} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-emerald-600">{editingProduct.id && products.some((p) => p.id === editingProduct.id) ? "Edit product" : "New product"}</p><h2 className="mt-1 text-2xl font-black">Product details</h2></div><button type="button" onClick={() => setShowProductForm(false)} className="rounded-full bg-slate-100 p-2"><X className="h-5 w-5" /></button></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-bold">Product name<input required value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
              <label className="text-sm font-bold">Category<input required value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
              <label className="text-sm font-bold">Price (KSh)<input required min="0" type="number" value={(editingProduct.specifications.Price || "").replace(/[^\d.]/g, "")} onChange={(e) => setEditingProduct({ ...editingProduct, specifications: { ...editingProduct.specifications, Price: e.target.value } })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
              <label className="text-sm font-bold">Stock quantity<input min="0" type="number" value={editingProduct.stock ?? 0} onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
              <label className="text-sm font-bold">Cost price<input min="0" type="number" value={editingProduct.costPrice ?? 0} onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
              <label className="sm:col-span-2 text-sm font-bold">Image path / URL<input value={editingProduct.image} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="/products/example.jpg" /></label>
              <label className="sm:col-span-2 text-sm font-bold">Description<textarea required rows={3} value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
              <label className="sm:col-span-2 text-sm font-bold">Features (one per line)<textarea rows={4} value={editingProduct.features.join("\n")} onChange={(e) => setEditingProduct({ ...editingProduct, features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            </div>
            <button className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white hover:bg-emerald-600">{editingProduct.id && products.some((p) => p.id === editingProduct.id) ? "Save changes" : "Add product to catalogue"}</button>
          </form>
        </div>
      )}
    </main>
  );
};

export default AdminPage;
