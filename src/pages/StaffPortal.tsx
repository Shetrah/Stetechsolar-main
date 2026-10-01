import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { ArrowRight, Check, CircleUserRound, Download, LogOut, Minus, PackageSearch, Plus, Search, Settings2, ShoppingBag, Trash2 } from 'lucide-react';
import { isAdminFirebaseUser, isStaffFirebaseUser, staffFirebaseAuth, staffFirebaseDb } from '../data/firebase';
import { addSales, formatKES, formatRecordCode, getProducts, getSales, getNumericPrice, subscribeProducts, subscribeSales, syncProducts, syncSales, type PaymentMethod, type SaleRecord, type StoreAuthContext } from '../data/productStore';
import { getSignedInStaffName } from '../data/staffStore';
import type { Product } from '../data/products';
import PortalProfileModal from '../components/PortalProfileModal';

type CartLine = { product: Product; quantity: number; unitPrice: number };
const staffStoreContext: StoreAuthContext = { auth: staffFirebaseAuth, db: staffFirebaseDb, staffOnly: true };
type CompletedReceipt = {
  receiptNumber: string;
  transactionId: string;
  soldAt: string;
  items: SaleRecord[];
  customerName: string;
  customerPhone: string;
  location: string;
  paymentMethod: PaymentMethod;
  total: number;
  amountPaid: number;
};

export default function StaffPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [staffName, setStaffName] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [products, setProducts] = useState(getProducts());
  const [sales, setSales] = useState<SaleRecord[]>(getSales());
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [completedReceipt, setCompletedReceipt] = useState<CompletedReceipt | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(staffFirebaseAuth, (signedInUser) => {
      if (!signedInUser) {
        setUser(null);
        setAuthReady(true);
        return;
      }
      void isStaffFirebaseUser(signedInUser, staffFirebaseDb).then(async (authorized) => {
        if (!active) return;
        if (!authorized) {
          const isAdmin = await isAdminFirebaseUser(signedInUser, staffFirebaseDb);
          setError(isAdmin
            ? 'An admin account is signed in. Staff use a separate account created under Admin > Staff; this will not sign out the admin portal.'
            : 'This account is not active staff. Ask your administrator to create or reactivate your staff account.');
          setUser(null);
        } else {
          setUser(signedInUser);
          setStaffName(await getSignedInStaffName(signedInUser.uid, signedInUser.displayName || signedInUser.email || 'Team member', staffFirebaseDb));
        }
        setAuthReady(true);
      }).catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Could not verify this account.');
          setAuthReady(true);
        }
      });
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user) return;
    void syncProducts(staffStoreContext);
    void syncSales(staffStoreContext).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load your sales.'));
    const stopProducts = subscribeProducts(() => setProducts(getProducts()), false, (reason) => setError(reason.message), staffFirebaseDb);
    const stopSales = subscribeSales(() => setSales(getSales()), (reason) => setError(reason.message), staffStoreContext);
    return () => { stopProducts(); stopSales(); };
  }, [user]);

  const categories = useMemo(() => ['All', ...new Set(products.map((product) => product.category).filter(Boolean))], [products]);
  const visibleProducts = useMemo(() => products.filter((product) => product.active !== false && (category === 'All' || product.category === category) && `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())), [products, category, query]);
  const subtotal = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const todaySales = sales.filter((sale) => new Date(sale.soldAt).toDateString() === new Date().toDateString());
  const todayRevenue = todaySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const credential = await signInWithEmailAndPassword(staffFirebaseAuth, email.trim(), password);
      if (!(await isStaffFirebaseUser(credential.user, staffFirebaseDb))) {
        throw new Error('This account does not have active staff access. Contact your administrator.');
      }
      setPassword('');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : '';
      setError(message.includes('active staff')
        ? 'This login is not an active staff account. Use a staff account created under Admin > Staff; your admin session remains unchanged.'
        : 'Email or password is incorrect.');
    } finally {
      setBusy(false);
    }
  };

  const addToCart = (product: Product) => {
    setReceipt('');
    setCompletedReceipt(null);
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) return current.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(Number(product.stock || 0), line.quantity + 1) } : line);
      return [...current, { product, quantity: 1, unitPrice: getNumericPrice(product) }];
    });
  };

  const adjustQuantity = (product: Product, step: number) => setCart((current) => current.flatMap((line) => {
    if (line.product.id !== product.id) return [line];
    const quantity = line.quantity + step;
    return quantity <= 0 ? [] : [{ ...line, quantity: Math.min(Number(product.stock || 0), quantity) }];
  }));

  const checkout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.length || busy) return;
    const paid = paymentMethod === 'Credit' ? 0 : Number(amountReceived || 0);
    if (!Number.isFinite(paid) || paid < 0 || paid > subtotal) {
      setError('Enter an amount received between zero and the sale total.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const records = await addSales({
        items: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity, unitPrice: line.unitPrice })),
        customerName: customerName.trim() || 'Walk-in customer',
        customerPhone: customerPhone.trim(),
        location: customerLocation.trim(),
        paymentMethod,
        amountPaid: paid,
      }, staffStoreContext);
      const receiptNumber = records[0]?.receiptNumber || 'Sale recorded';
      setReceipt(receiptNumber);
      setCompletedReceipt({
        receiptNumber,
        transactionId: records[0]?.transactionId || records[0]?.id || '',
        soldAt: records[0]?.soldAt || new Date().toISOString(),
        items: records,
        customerName: customerName.trim() || 'Walk-in customer',
        customerPhone: customerPhone.trim(),
        location: customerLocation.trim(),
        paymentMethod,
        total: subtotal,
        amountPaid: paid,
      });
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerLocation('');
      setPaymentMethod('Cash');
      setAmountReceived('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to complete this sale.');
    } finally {
      setBusy(false);
    }
  };

  const downloadReceipt = () => {
    if (!completedReceipt) return;
    const escapeHtml = (value: unknown) => String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character] || character);
    const rows = completedReceipt.items.map((item) => `<tr><td>${escapeHtml(item.productName)}<small>Sale ID ${formatRecordCode(item.id)} · ${item.quantity} × ${formatKES(item.unitPrice)}</small></td><td>${formatKES(item.total)}</td></tr>`).join('');
    const balance = Math.max(0, completedReceipt.total - completedReceipt.amountPaid);
    const status = balance === 0 ? 'PAID' : completedReceipt.amountPaid > 0 ? 'PARTIALLY PAID' : 'CREDIT';
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>STETECH receipt ${escapeHtml(completedReceipt.receiptNumber)}</title><style>*{box-sizing:border-box}body{margin:0;padding:32px;background:#edf2ee;color:#14251d;font:14px Arial,sans-serif}.receipt{max-width:620px;margin:auto;background:#fff;border:1px solid #dce6e0;border-radius:12px;overflow:hidden}.head{padding:24px;background:#07533e;color:#fff}.head strong{font-size:20px}.head p{margin:6px 0 0;color:#d8e9df;font-size:12px}.body{padding:24px}.title{display:flex;justify-content:space-between;gap:12px;align-items:center;border-bottom:1px solid #dce6e0;padding-bottom:14px}.title h1{font-size:22px;margin:0}.badge{padding:7px 10px;border-radius:20px;background:#e7f5eb;color:#07533e;font-size:10px;font-weight:800}.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0;font-size:12px}.meta span{display:block;color:#66766e;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:16px 0}th{padding:8px 0;border-bottom:1px solid #dce6e0;text-align:left;color:#66766e;font-size:10px;text-transform:uppercase}th:last-child,td:last-child{text-align:right}td{padding:12px 0;border-bottom:1px solid #eef2ef;font-size:12px}td small{display:block;margin-top:4px;color:#66766e}.totals{max-width:280px;margin:16px 0 0 auto}.line{display:flex;justify-content:space-between;padding:6px 0}.grand{border-top:1px solid #ccd8d0;margin-top:6px;padding-top:12px;font-size:18px;font-weight:800}.thanks{margin-top:22px;padding-top:16px;border-top:1px dashed #ccd8d0;text-align:center;color:#66766e;font-size:12px}@media print{body{padding:0;background:#fff}.receipt{max-width:none;border:0;border-radius:0}}</style></head><body><article class="receipt"><header class="head"><strong>STETECH SOLAR TECHNOLOGY</strong><p>Uhuru Market Business Complex, Block R41, Nyerere Road, Kisumu</p><p>+254 717 656 407 · stetechsolartechnology@gmail.com</p></header><main class="body"><div class="title"><h1>Sales receipt</h1><span class="badge">${status}</span></div><div class="meta"><div><span>Receipt</span><strong>${escapeHtml(completedReceipt.receiptNumber)}</strong></div><div><span>Date</span><strong>${escapeHtml(new Date(completedReceipt.soldAt).toLocaleString())}</strong></div><div><span>Customer</span><strong>${escapeHtml(completedReceipt.customerName)}</strong></div><div><span>Phone</span><strong>${escapeHtml(completedReceipt.customerPhone || 'Not provided')}</strong></div><div><span>Location</span><strong>${escapeHtml(completedReceipt.location || 'Not provided')}</strong></div><div><span>Payment</span><strong>${escapeHtml(completedReceipt.paymentMethod)}</strong></div></div><table><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="line"><span>Total</span><strong>${formatKES(completedReceipt.total)}</strong></div><div class="line"><span>Amount received</span><strong>${formatKES(completedReceipt.amountPaid)}</strong></div><div class="line grand"><span>Balance due</span><span>${formatKES(balance)}</span></div></div><div class="thanks">Thank you for choosing STETECH Solar Technology.</div></main></article></body></html>`;
    const htmlWithTransaction = html.replace(
      '</div><div><span>Date</span>',
      `</div><div><span>Transaction ID</span><strong>${formatRecordCode(completedReceipt.transactionId)}</strong></div><div><span>Date</span>`,
    );
    const blob = new Blob([htmlWithTransaction], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `stetech-${completedReceipt.receiptNumber.replace(/[^a-zA-Z0-9-]/g, '-')}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const logOut = async () => {
    await signOut(staffFirebaseAuth);
    setCart([]);
  };

  if (!authReady) return <main className="grid min-h-screen place-items-center bg-[#eef4ef]"><p className="font-bold text-emerald-900">Opening your staff workspace…</p></main>;

  if (!user) return <main className="staff-login-shell">
    <section className="staff-login-panel">
      <div className="staff-login-story"><img src="/stetech solar.png" alt="STETECH Solar Technology" /><p className="staff-login-kicker">STETECH SOLAR TECHNOLOGY</p><h1>Good energy starts with a great welcome.</h1><p>Sign in to serve customers, find the right solar solution, and keep every sale moving smoothly.</p><div className="staff-login-points"><span>Live stock levels</span><span>Secure sales records</span><span>Instant receipts</span></div></div>
      <div className="staff-login-form-wrap"><div className="staff-login-form">
        <p className="staff-login-overline">TEAM WORKSPACE</p><h2>Welcome back</h2><p className="staff-login-intro">Use your personal staff account to open the sales desk.</p>
        <form onSubmit={signIn} className="mt-7 space-y-4"><label className="block text-sm font-bold">Work email<input autoFocus required type="email" autoComplete="username" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50" /></label><label className="block text-sm font-bold">Password<input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="mt-1.5 text-xs font-bold text-emerald-800 hover:underline">{showPassword ? 'Hide password' : 'Show password'}</button></label>
          {error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-5 text-amber-950">{error}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-emerald-800 px-5 py-3.5 font-extrabold text-white hover:bg-emerald-900 disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in to sales desk'} <ArrowRight className="ml-2 inline h-4 w-4" /></button>
        </form>
        <button onClick={() => { if (!email.trim()) { setError('Enter your work email first, then request a reset link.'); return; } void sendPasswordResetEmail(staffFirebaseAuth, email.trim()).then(() => setError('Password reset link sent. Check your inbox.')).catch(() => setError('Unable to send a reset link. Check the email and try again.')); }} className="mt-4 w-full text-center text-sm font-bold text-emerald-800 hover:underline">Forgot password?</button>
        <div className="staff-admin-link"><span>Administrator?</span><a href="/admin">Go to admin portal <ArrowRight size={15} /></a></div>
      </div></div>
    </section>
  </main>;

  return <main className="min-h-screen bg-[#eef3ef] text-slate-900">
    {profileOpen && user && <PortalProfileModal db={staffFirebaseDb} user={user} role="staff" onClose={() => setProfileOpen(false)} onSaved={setStaffName} />}
    <header className="sticky top-0 z-30 border-b border-emerald-950/10 bg-white/95 backdrop-blur"><div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6"><div className="flex items-center gap-3"><img src="/stetech solar.png" alt="STETECH" className="h-11 w-11 object-contain" /><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-emerald-700">STETECH SOLAR</p><h1 className="text-lg font-black leading-5">Sales desk</h1></div></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-extrabold">{staffName}</p><p className="text-xs text-slate-500">Staff workspace</p></div><CircleUserRound className="h-8 w-8 text-emerald-800" /><button onClick={() => setProfileOpen(true)} title="Edit profile" aria-label="Edit profile" className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"><Settings2 size={18} /></button><button onClick={() => void logOut()} title="Sign out" aria-label="Sign out" className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"><LogOut size={18} /></button></div></div></header>
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">TODAY AT THE COUNTER</p><h2 className="mt-1 text-3xl font-black tracking-tight">Let’s make someone’s day brighter.</h2><p className="mt-2 text-sm text-slate-600">Find a product, build the basket, and check out when you’re ready.</p></div><div className="flex gap-3"><div className="rounded-xl border border-white bg-white px-4 py-3 shadow-sm"><p className="text-xs text-slate-500">Your sales today</p><p className="mt-1 text-lg font-black">{formatKES(todayRevenue)}</p></div><div className="rounded-xl border border-white bg-white px-4 py-3 shadow-sm"><p className="text-xs text-slate-500">Transactions</p><p className="mt-1 text-lg font-black">{new Set(todaySales.map((sale) => sale.transactionId || sale.id)).size}</p></div></div></div>
      {error && <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-800"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss message">×</button></div>}
      {receipt && <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900"><span className="flex items-center gap-3"><Check size={18} /> Sale complete. Receipt {receipt}</span><button type="button" onClick={downloadReceipt} className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-900"><Download size={16} />Download receipt</button></div>}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-3"><div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products by name or category" className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 outline-none focus:border-emerald-600" /></div><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter products by category" className="rounded-lg border border-slate-200 bg-white px-3 py-3 font-bold">{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.map((product) => {
            const stock = Number(product.stock || 0);
            return <button type="button" key={product.id} onClick={() => addToCart(product)} disabled={stock <= 0} className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-65"><div className="relative grid h-40 place-items-center bg-[#f6f8f6] p-4"><img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-contain mix-blend-multiply" /><span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${stock > 0 ? 'bg-white text-slate-600' : 'bg-rose-100 text-rose-800'}`}>{stock > 0 ? `${stock} in stock` : 'Out of stock'}</span></div><div className="p-4"><p className="truncate text-sm font-extrabold">{product.name}</p><p className="mt-1 truncate text-xs text-slate-500">{product.category}</p><div className="mt-3 flex items-center justify-between"><span className="font-black text-emerald-800">{getNumericPrice(product) ? formatKES(getNumericPrice(product)) : 'Ask for price'}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-800 text-white group-hover:bg-emerald-700"><Plus size={17} /></span></div></div></button>;
          })}</div>
          {!visibleProducts.length && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"><PackageSearch className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-bold">No available products found</p><p className="mt-1 text-sm text-slate-500">Try a different search or category.</p></div>}
        </section>
        <aside className="rounded-xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-[92px]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-black">Current sale</h2><p className="mt-0.5 text-xs text-slate-500">{cart.reduce((sum, line) => sum + line.quantity, 0)} items</p></div><ShoppingBag className="text-emerald-800" size={20} /></div>
          <div className="max-h-[35vh] min-h-24 divide-y divide-slate-100 overflow-y-auto px-5">{cart.map((line) => <div key={line.product.id} className="flex gap-3 py-4"><img src={line.product.image} alt="" className="h-12 w-12 rounded-lg bg-slate-50 object-contain p-1" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{line.product.name}</p><p className="mt-1 text-xs text-slate-500">{formatKES(line.unitPrice)} each</p><div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => adjustQuantity(line.product, -1)} aria-label={`Decrease ${line.product.name} quantity`} className="rounded-md border border-slate-200 p-1"><Minus size={13} /></button><span className="min-w-5 text-center text-xs font-black">{line.quantity}</span><button type="button" onClick={() => adjustQuantity(line.product, 1)} aria-label={`Increase ${line.product.name} quantity`} className="rounded-md border border-slate-200 p-1"><Plus size={13} /></button></div></div><div className="text-right"><p className="text-sm font-black">{formatKES(line.quantity * line.unitPrice)}</p><button type="button" onClick={() => adjustQuantity(line.product, -line.quantity)} aria-label={`Remove ${line.product.name}`} className="mt-2 text-slate-400 hover:text-red-700"><Trash2 size={15} /></button></div></div>)}
            {!cart.length && <div className="grid min-h-24 place-items-center text-center text-sm text-slate-500">Add products to start a sale.</div>}
          </div>
          <form onSubmit={checkout} className="border-t border-slate-100 p-5"><label className="mb-3 block text-sm font-bold">Customer name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Walk-in customer" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="mb-3 block text-sm font-bold">Phone number<input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Optional" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="mb-3 block text-sm font-bold">Location<input value={customerLocation} onChange={(event) => setCustomerLocation(event.target.value)} placeholder="Town or area" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Payment<select value={paymentMethod} onChange={(event) => { const method = event.target.value as PaymentMethod; setPaymentMethod(method); setAmountReceived(method === 'Credit' ? '0' : String(subtotal)); }} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2.5 text-sm">{['Cash', 'M-Pesa', 'Bank', 'Credit'].map((method) => <option key={method}>{method}</option>)}</select></label><label className="text-sm font-bold">Received<input required type="number" min="0" max={subtotal} value={amountReceived} onChange={(event) => setAmountReceived(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2.5 text-sm" /></label></div><div className="mt-4 flex justify-between border-t border-dashed border-slate-200 pt-4"><span className="font-bold">Total</span><span className="text-xl font-black">{formatKES(subtotal)}</span></div><p className="mt-1 text-right text-xs text-slate-500">Balance due: {formatKES(Math.max(0, subtotal - Number(amountReceived || 0)))}</p><button disabled={!cart.length || busy} className="mt-4 w-full rounded-lg bg-emerald-800 px-4 py-3.5 font-extrabold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-40">{busy ? 'Processing sale…' : 'Complete sale'} <ArrowRight className="ml-2 inline h-4 w-4" /></button></form>
        </aside>
      </div>
      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-black">Your recent sales</h2><p className="mt-1 text-xs text-slate-500">Updates as sales are recorded</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">Live</span></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Time</th><th>Transaction ID</th><th>Sale ID</th><th>Receipt</th><th>Customer</th><th>Product</th><th className="pr-5 text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-100">{sales.slice(0, 8).map((sale) => <tr key={sale.id}><td className="px-5 py-3 text-slate-500">{new Date(sale.soldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td><td className="font-mono text-xs font-bold">{formatRecordCode(sale.transactionId || sale.id)}</td><td className="font-mono text-xs font-bold">{formatRecordCode(sale.id)}</td><td className="font-mono text-xs">{sale.receiptNumber || 'Legacy'}</td><td>{sale.customerName}</td><td className="max-w-56 truncate">{sale.productName} × {sale.quantity}</td><td className="pr-5 text-right font-black">{formatKES(sale.total)}</td></tr>)}{!sales.length && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500">Your completed sales will appear here.</td></tr>}</tbody></table></div></section>
    </div>
  </main>;
}