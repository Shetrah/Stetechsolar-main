import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  Download,
  Edit3,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
  UserRound,
  Wallet,
  X,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDollarSign,
  Receipt,
  Settings2,
} from "lucide-react";

import { Product } from "../data/products";
import { firebaseAuth, firebaseDb, isAdminFirebaseUser } from "../data/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  addSale,
  addSales,
  adjustInventory,
  formatKES,
  formatRecordCode,
  getAllProducts,
  getInventoryMovements,
  getPayments,
  getNumericPrice,
  getProductPrice,
  getSales,
  getTransactions,
  recordPayment,
  removeProduct,
  syncProducts,
  syncSales,
  syncInventoryMovements,
  syncPayments,
  subscribeProducts,
  subscribeSales,
  subscribeInventoryMovements,
  subscribePayments,
  InventoryMovement,
  PaymentMethod,
  PaymentRecord,
  SaleRecord,
  TransactionSummary,
  upsertProduct,
} from "../data/productStore";

import { Cog } from "lucide-react";
import GalleryAdmin from "../components/GalleryAdmin";
import ProjectManagement from "../components/ProjectManagement";
import StaffManagement from "../components/StaffManagement";
import PortalProfileModal from "../components/PortalProfileModal";

type Tab =
  | "overview"
  | "pos"
  | "inventory"
  | "products"
  | "sales"
  | "reports"
  | "projects"
  | "staff"
  | "gallery";

type CartItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  stock: number;
};

type InventoryAction = "receive" | "remove" | "set";

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
  reorderLevel: 5,
  active: true,
};

const AdminPage: React.FC = () => {
  /* -------------------------------------------------------------
     AUTH
  ------------------------------------------------------------- */

  const [loggedIn, setLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  /* -------------------------------------------------------------
     GLOBAL STATE
  ------------------------------------------------------------- */

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [products, setProducts] = useState<Product[]>(getAllProducts());
  const [sales, setSales] = useState<SaleRecord[]>(getSales());
    const [payments, setPayments] = useState<PaymentRecord[]>(getPayments());
    const [transactions, setTransactions] = useState<TransactionSummary[]>(getTransactions());
    const [paymentTransaction, setPaymentTransaction] = useState<TransactionSummary | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentEntryMethod, setPaymentEntryMethod] = useState<Exclude<PaymentMethod, "Credit">>("Cash");
  const [movements, setMovements] = useState<InventoryMovement[]>(getInventoryMovements());

  /* -------------------------------------------------------------
     PRODUCT STATE
  ------------------------------------------------------------- */

  const [productSearch, setProductSearch] = useState("");
  const [salesSearch, setSalesSearch] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product>(emptyProduct);

  /* -------------------------------------------------------------
     POS STATE
  ------------------------------------------------------------- */

  const [posSearch, setPosSearch] = useState("");
  const [posCategory, setPosCategory] = useState("All");

  const [cart, setCart] = useState<CartItem[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [amountPaid, setAmountPaid] = useState("0");

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  /* -------------------------------------------------------------
     INVENTORY STATE
  ------------------------------------------------------------- */

  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("All");

  const [inventoryModal, setInventoryModal] = useState(false);
  const [inventoryProduct, setInventoryProduct] =
    useState<Product | null>(null);

  const [inventoryAction, setInventoryAction] =
    useState<InventoryAction>("receive");

  const [inventoryQuantity, setInventoryQuantity] = useState("1");
  const [inventoryNote, setInventoryNote] = useState("");

  /* -------------------------------------------------------------
     SALE FORM
  ------------------------------------------------------------- */

  const [saleForm, setSaleForm] = useState({
    productId: "",
    quantity: "1",
    customerName: "",
    customerPhone: "",
    location: "",
    paymentStatus: "paid" as SaleRecord["paymentStatus"],
    paymentMethod: "Cash" as PaymentMethod,
    amountPaid: "",
    unitPrice: "",
  });

  const [reportPeriod, setReportPeriod] = useState<"day" | "month">("month");
  const [reportDate, setReportDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });

  /* -------------------------------------------------------------
     REFRESH
  ------------------------------------------------------------- */

  const refresh = () => {
    setProducts(getAllProducts());
    setSales(getSales());
      setPayments(getPayments());
      setTransactions(getTransactions());
    setMovements(getInventoryMovements());
  };

  /* -------------------------------------------------------------
     AUTH CHECK
  ------------------------------------------------------------- */

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setLoggedIn(false);
        setAuthReady(true);
        return;
      }
      try {
        if (await isAdminFirebaseUser(user)) {
          setLoggedIn(true);
          setError("");
        }
        else {
          setLoggedIn(false);
          setError("This Firebase account is not authorized for the admin portal.");
        }
      } catch (error) {
        setError(error instanceof Error
          ? `Could not verify admin access: ${error.message}. Your sign-in is preserved; retry after permissions or connectivity are restored.`
          : "Could not verify the Firebase account. Your sign-in is preserved; please retry.");
      } finally {
        setAuthReady(true);
      }
    });
  }, []);

  /* -------------------------------------------------------------
     SYNC DATA
  ------------------------------------------------------------- */

  useEffect(() => {
    if (!loggedIn) return;

    void syncProducts();
    void syncSales().catch((e) =>
      setError(e instanceof Error ? e.message : "Unable to sync sales.")
    );
    void syncInventoryMovements().catch((e) =>
      setError(e instanceof Error ? e.message : "Unable to sync inventory movements.")
    );
    void syncPayments().catch((e) =>
      setError(e instanceof Error ? e.message : "Unable to sync payment records.")
    );
    const stopProducts = subscribeProducts(() => refresh(), true, (e) => setError(e.message));
    const stopSales = subscribeSales(() => refresh(), (e) => setError(e.message));
    const stopMovements = subscribeInventoryMovements(() => refresh(), (e) => setError(e.message));
    const stopPayments = subscribePayments(() => refresh(), (e) => setError(e.message));
    return () => { stopProducts(); stopSales(); stopMovements(); stopPayments(); };
  }, [loggedIn]);

  useEffect(() => {
    const handler = () => refresh();

    window.addEventListener("stetech-products-updated", handler);
    window.addEventListener("stetech-sales-updated", handler);
  window.addEventListener("stetech-payments-updated", handler);

    return () => {
      window.removeEventListener("stetech-products-updated", handler);
      window.removeEventListener("stetech-sales-updated", handler);
      window.removeEventListener("stetech-payments-updated", handler);
    };
  }, []);

  /* -------------------------------------------------------------
     CATEGORIES
  ------------------------------------------------------------- */

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(products.map((product) => product.category).filter(Boolean))
      ),
    ];
  }, [products]);

  /* -------------------------------------------------------------
     DASHBOARD STATISTICS
  ------------------------------------------------------------- */

  const stats = useMemo(() => {
    const revenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0
    );

    const units = sales.reduce(
      (sum, sale) => sum + Number(sale.quantity || 0),
      0
    );

    const stock = products.reduce(
      (sum, product) => sum + Number(product.stock || 0),
      0
    );

    const stockValue = products.reduce(
      (sum, product) =>
        sum +
        Number(product.stock || 0) *
          Number(product.costPrice || getNumericPrice(product) || 0),
      0
    );

    const retailValue = products.reduce(
      (sum, product) =>
        sum +
        Number(product.stock || 0) *
          Number(getNumericPrice(product) || 0),
      0
    );

    const lowStock = products.filter(
      (product) => Number(product.stock || 0) <= Number(product.reorderLevel ?? 5)
    ).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock || 0) <= 0
    ).length;

    const activeProducts = products.filter(
      (product) => product.active !== false
    ).length;
    const today = new Date().toDateString();
    const todaySales = sales.filter(
      (sale) => new Date(sale.soldAt).toDateString() === today
    );
    const todayRevenue = todaySales.reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0
    );
    const todayTransactions = new Set(
      todaySales.map((sale) => sale.transactionId || sale.id)
    ).size;
    const pendingPayments = sales.reduce((sum, sale) => {
      const paid = Number(sale.amountPaid ?? (sale.paymentStatus === "paid" ? sale.total : 0));
      return sum + Math.max(0, Number(sale.total || 0) - paid);
    }, 0);
    const grossProfit = sales.reduce((sum, sale) => {
      const cost = Number(
        sale.unitCost ?? products.find((product) => product.id === sale.productId)?.costPrice ?? 0
      );
      return sum + Number(sale.total || 0) - cost * Number(sale.quantity || 0);
    }, 0);

    return {
      revenue,
      units,
      stock,
      stockValue,
      retailValue,
      lowStock,
      outOfStock,
      activeProducts,
      todayRevenue,
      todayTransactions,
      pendingPayments,
      grossProfit,
    };
  }, [products, sales]);

  /* -------------------------------------------------------------
     FILTER PRODUCTS
  ------------------------------------------------------------- */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text =
        `${product.name} ${product.category}`.toLowerCase();

      return text.includes(productSearch.toLowerCase());
    });
  }, [products, productSearch]);

  const filteredSales = useMemo(() => {
    const search = salesSearch.trim().toLowerCase();
    if (!search) return sales;
    const matchingPaymentTransactions = new Set(
      payments.filter((payment) => payment.receiptNumber?.toLowerCase().includes(search)).map((payment) => payment.transactionId)
    );
    return sales.filter((sale) =>
      sale.receiptNumber?.toLowerCase().includes(search)
      || sale.transactionId?.toLowerCase().includes(search)
      || sale.productName.toLowerCase().includes(search)
      || sale.customerName.toLowerCase().includes(search)
      || sale.customerPhone.toLowerCase().includes(search)
      || (sale.transactionId ? matchingPaymentTransactions.has(sale.transactionId) : false)
    );
  }, [sales, salesSearch, payments]);

  /* -------------------------------------------------------------
     POS PRODUCTS
  ------------------------------------------------------------- */

  const posProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        `${product.name} ${product.category}`
          .toLowerCase()
          .includes(posSearch.toLowerCase());

      const matchesCategory =
        posCategory === "All" || product.category === posCategory;

      return (
        product.active !== false &&
        matchesSearch &&
        matchesCategory
      );
    });
  }, [products, posSearch, posCategory]);

  /* -------------------------------------------------------------
     INVENTORY PRODUCTS
  ------------------------------------------------------------- */

  const inventoryProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        `${product.name} ${product.category}`
          .toLowerCase()
          .includes(inventorySearch.toLowerCase());

      const matchesCategory =
        inventoryCategory === "All" ||
        product.category === inventoryCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, inventorySearch, inventoryCategory]);

  /* -------------------------------------------------------------
     POS CART TOTALS
  ------------------------------------------------------------- */

  const cartSubtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  }, [cart]);

  const cartItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const reportSales = useMemo(() => sales.filter((sale) => {
    const sold = new Date(sale.soldAt);
    const key = reportPeriod === "day"
      ? `${sold.getFullYear()}-${String(sold.getMonth() + 1).padStart(2, "0")}-${String(sold.getDate()).padStart(2, "0")}`
      : `${sold.getFullYear()}-${String(sold.getMonth() + 1).padStart(2, "0")}`;
    return key === (reportPeriod === "day" ? reportDate : reportDate.slice(0, 7));
  }), [sales, reportDate, reportPeriod]);

  const reportTotals = useMemo(() => {
    const revenue = reportSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const cost = reportSales.reduce((sum, sale) => {
      const unitCost = Number(sale.unitCost ?? products.find((product) => product.id === sale.productId)?.costPrice ?? 0);
      return sum + unitCost * Number(sale.quantity || 0);
    }, 0);
    const methods: Exclude<PaymentMethod, "Credit">[] = ["Cash", "M-Pesa", "Bank"];
    return {
      revenue,
      grossProfit: revenue - cost,
      paymentBreakdown: methods.map((method) => ({
        method,
        total: payments.filter((payment) => payment.method === method && (() => {
          const paid = new Date(payment.createdAt);
          const dateKey = reportPeriod === "day"
            ? `${paid.getFullYear()}-${String(paid.getMonth() + 1).padStart(2, "0")}-${String(paid.getDate()).padStart(2, "0")}`
            : `${paid.getFullYear()}-${String(paid.getMonth() + 1).padStart(2, "0")}`;
          return dateKey === (reportPeriod === "day" ? reportDate : reportDate.slice(0, 7));
        })()).reduce((sum, payment) => sum + payment.amount, 0),
      })).concat({
        method: "Credit",
        total: transactions.filter((transaction) => reportSales.some((sale) => sale.transactionId === transaction.id))
          .reduce((sum, transaction) => sum + transaction.balanceDue, 0),
      }),
    };
  }, [reportSales, payments, transactions, reportDate, reportPeriod, products]);

  const staffReportSales = useMemo(() => reportSales.map((sale) => ({
    ...sale,
    staffName: sale.staffName || 'Admin / legacy sale',
  })).sort((first, second) => second.soldAt.localeCompare(first.soldAt)), [reportSales]);

  const paymentBalances = useMemo(() => ({
    cash: payments.filter((payment) => payment.method === "Cash").reduce((sum, payment) => sum + payment.amount, 0),
    mpesa: payments.filter((payment) => payment.method === "M-Pesa").reduce((sum, payment) => sum + payment.amount, 0),
    bank: payments.filter((payment) => payment.method === "Bank").reduce((sum, payment) => sum + payment.amount, 0),
    credit: transactions.reduce((sum, transaction) => sum + Math.max(0, transaction.balanceDue), 0),
  }), [payments, transactions]);

  /* -------------------------------------------------------------
     LOGIN
  ------------------------------------------------------------- */

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      if (!(await isAdminFirebaseUser(credential.user))) {
        throw new Error("This Firebase account is not authorized for the admin portal.");
      }

      setLoggedIn(true);
      setPassword("");
    } catch (e) {
      const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
      const message = code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password"
        ? "Email or password is incorrect."
        : code === "auth/operation-not-allowed"
          ? "Email/password sign-in is disabled in Firebase Authentication."
          : e instanceof Error ? e.message : "Sign in failed. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------
     LOGOUT
  ------------------------------------------------------------- */

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      setLoggedIn(false);
      setTab("overview");
      setError("");
    } catch {
      setError("Could not sign out. Please try again.");
    }
  };

  /* -------------------------------------------------------------
     PRODUCT FORM
  ------------------------------------------------------------- */

  const openNewProduct = () => {
    setEditingProduct({
      ...emptyProduct,
      id: Date.now(),
    });

    setShowProductForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct({
      ...product,
      specifications: {
        ...product.specifications,
      },
    });

    setShowProductForm(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    const price =
      Number(
        (editingProduct.specifications.Price || "").replace(
          /[^\d.]/g,
          ""
        )
      ) || 0;

    const product = {
      ...editingProduct,
      specifications: {
        ...editingProduct.specifications,
        Price: `KSh ${price.toLocaleString("en-KE")}`,
      },
      stock: Number(editingProduct.stock || 0),
      costPrice: Number(editingProduct.costPrice || 0),
      reorderLevel: Number(editingProduct.reorderLevel ?? 5),
      active: editingProduct.active !== false,
    };

    try {
      await upsertProduct(product);
      refresh();
      setShowProductForm(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    if (
      window.confirm(
        `Hide "${product.name}" from the public catalogue?`
      )
    ) {
      try {
        await removeProduct(product.id);
        refresh();
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Unable to hide product."
        );
      }
    }
  };

  /* -------------------------------------------------------------
     ADD TO CART
  ------------------------------------------------------------- */

  const addToCart = (product: Product) => {
    const stock = Number(product.stock || 0);

    if (stock <= 0) {
      setError(`${product.name} is currently out of stock.`);
      return;
    }

    setError("");

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.productId === product.id
      );

      if (existing) {
        if (existing.quantity >= stock) {
          setError(
            `Only ${stock} unit${stock === 1 ? "" : "s"} of ${
              product.name
            } available.`
          );

          return currentCart;
        }

        return currentCart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, stock),
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: getNumericPrice(product),
          image: product.image,
          stock,
        },
      ];
    });
  };

  const updateCartQuantity = (
    productId: number,
    quantity: number
  ) => {
    const item = cart.find(
      (cartItem) => cartItem.productId === productId
    );

    if (!item) return;

    const safeQuantity = Math.max(
      0,
      Math.min(quantity, item.stock)
    );

    if (safeQuantity === 0) {
      setCart((current) =>
        current.filter(
          (cartItem) => cartItem.productId !== productId
        )
      );
      return;
    }

    setCart((current) =>
      current.map((cartItem) =>
        cartItem.productId === productId
          ? {
              ...cartItem,
              quantity: safeQuantity,
            }
          : cartItem
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((current) =>
      current.filter(
        (item) => item.productId !== productId
      )
    );
  };

  /* -------------------------------------------------------------
     POS CHECKOUT
  ------------------------------------------------------------- */

  const printReceipt = async (
    target: Window | null,
    records: SaleRecord[],
    customer: string,
    phone: string,
    location: string,
    method: PaymentMethod,
    total: number,
    amountReceived: number,
    receiptNumber?: string,
    verificationId?: string
  ): Promise<void> => {
    if (!target) {
      setError("Sale completed. Allow pop-ups to print the receipt.");
      return;
    }
    const escape = (value: unknown) => String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    })[character] || character);
    const rows = records.map((record) => `<tr><td>${escape(record.productName)}<small>Sale ID ${formatRecordCode(record.id)} · ${record.quantity} × ${formatKES(record.unitPrice)}</small></td><td>${formatKES(record.total)}</td></tr>`).join("");
    const receiptStatus = amountReceived >= total ? "PAID" : amountReceived > 0 ? "PARTIALLY PAID" : "CREDIT";
    const logo = escape(new URL("/stetech solar.png", window.location.origin).href);
    const transactionCode = formatRecordCode(records[0]?.transactionId || records[0]?.id);
    const reference = escape(`${receiptNumber || records[0]?.receiptNumber || records[0]?.id || ""} · TXN ${transactionCode}`);
    const validationUrl = new URL("/receipt/validate", window.location.origin);
    if (verificationId) validationUrl.searchParams.set("code", verificationId);
    const qrDataUrl = verificationId ? await QRCode.toDataURL(validationUrl.href, { width: 220, margin: 1, color: { dark: "#24302d", light: "#ffffff" } }) : "";
    target.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>STETECH e-Receipt</title><style>*{box-sizing:border-box}body{font:14px Arial,sans-serif;color:#10201a;margin:0;padding:28px}.receipt{max-width:520px;margin:auto;border:1px solid #dce6e0;border-radius:12px;overflow:hidden}.letterhead{display:flex;align-items:center;gap:14px;padding:22px;background:#062a22;color:#fff}.logo{width:58px;height:58px;object-fit:contain;background:#fff;border-radius:10px;padding:4px}.company{font-size:17px;font-weight:800;letter-spacing:.6px}.details{font-size:11px;line-height:1.55;color:#c9d8d1;margin-top:5px}.body{padding:22px}.title{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #dce6e0;padding-bottom:14px}.title h1{font-size:20px;margin:0}.badge{font-size:10px;font-weight:800;letter-spacing:.5px;color:#075b3e;background:#e3f5eb;border-radius:20px;padding:7px 9px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;font-size:12px}.meta span{display:block;color:#63736c;margin-bottom:3px}.meta strong{overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;margin:18px 0}th{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#63736c;text-align:left;padding:9px 0;border-bottom:1px solid #cbd8d1}th:last-child,td:last-child{text-align:right}td{padding:11px 0;border-bottom:1px solid #e6ede9;font-size:12px}td small{display:block;color:#63736c;margin-top:4px}.totals{margin:16px 0 0 auto;max-width:260px}.line{display:flex;justify-content:space-between;padding:5px 0;color:#45564e}.grand{font-size:17px;font-weight:800;color:#10201a;border-top:1px solid #cbd8d1;margin-top:7px;padding-top:11px}.thanks{border-top:1px dashed #cbd8d1;margin-top:20px;padding-top:15px;text-align:center;color:#63736c;font-size:11px}.thanks strong{display:block;color:#075b3e;margin-bottom:4px}@media print{body{padding:0}.receipt{border:0;max-width:none}.letterhead{-webkit-print-color-adjust:exact;print-color-adjust:exact}.badge{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><article class="receipt"><header class="letterhead"><img class="logo" src="${logo}" alt="STETECH Solar logo"><div><div class="company">STETECH SOLAR TECHNOLOGY</div><div class="details">Uhuru Market Business Complex, Block R41<br>Nyerere Road, Kisumu, Kenya<br>Phone: +254 717 656 407</div></div></header><main class="body"><div class="title"><h1>Electronic receipt</h1><span class="badge">${receiptStatus}</span></div><div class="meta"><div><span>Receipt reference</span><strong>${reference}</strong></div><div><span>Date and time</span><strong>${escape(new Date().toLocaleString())}</strong></div><div><span>Customer</span><strong>${escape(customer || "Walk-in customer")}</strong></div><div><span>Phone</span><strong>${escape(phone || "Not provided")}</strong></div><div><span>Payment method</span><strong>${escape(method)}</strong></div><div><span>Location</span><strong>${escape(location || "Not provided")}</strong></div></div><table><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="line"><span>Total</span><strong>${formatKES(total)}</strong></div><div class="line"><span>Amount received</span><strong>${formatKES(amountReceived)}</strong></div><div class="line grand"><span>Balance due</span><span>${formatKES(Math.max(0, total - amountReceived))}</span></div></div><div class="thanks"><strong>Thank you for choosing STETECH Solar</strong>System-generated receipt · Keep this reference for payment follow-up.</div></main></article><script>window.onload=()=>window.print()</script></body></html>`);
    const theme = target.document.createElement("style");
    theme.textContent = "body{background:#e9ebe8!important;color:#242a28!important;padding:6px!important}.receipt{max-width:400px!important;border-radius:8px!important;background:#fff!important;border-color:#d5d9d5!important}.letterhead{background:#f1f2ef!important;color:#242a28!important;border-bottom:1px solid #d4d8d4;padding:10px 12px!important;gap:10px!important}.logo{width:42px!important;height:42px!important;padding:2px!important;border-radius:6px!important}.company{font-size:13px!important}.details{font-size:9px!important;line-height:1.3!important;color:#515b56!important;margin-top:3px!important}.body{padding:12px!important}.title{padding-bottom:8px!important}.title h1{font-size:15px!important}.badge{font-size:9px!important;background:#e8eae7!important;color:#333b37!important;padding:5px 7px!important}.meta{gap:6px!important;margin:10px 0!important;font-size:10px!important}.meta span{margin-bottom:2px!important}.thanks strong{color:#333b37!important}table{margin:10px 0!important}th{padding:5px 0!important}td{padding:6px 0!important;font-size:10px!important}td small{margin-top:2px!important}.totals{margin-top:8px!important}.line{padding:3px 0!important}.grand{font-size:14px!important;margin-top:5px!important;padding-top:7px!important}.receipt-notes{margin-top:9px!important;padding-top:7px!important;font-size:8px!important;line-height:1.35!important}.receipt-notes h2{font-size:9px!important;margin-bottom:4px!important}.receipt-notes li{margin:1px 0!important}.receipt-verify{gap:8px!important;margin-top:9px!important;padding-top:7px!important;font-size:8px!important}.receipt-verify img{width:62px!important;height:62px!important}@page{margin:8mm 10mm}@media print{body{padding:0!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.receipt{border:0!important;max-width:400px!important}}";
    target.document.head.appendChild(theme);
    const headerDetails = target.document.querySelector(".letterhead .details");
    if (headerDetails) headerDetails.insertAdjacentHTML("beforeend", "<br>stetechsolartechnology.co.ke");
    const receiptBody = target.document.querySelector(".receipt .body");
    if (receiptBody) {
      const notes = target.document.createElement("section");
      notes.className = "receipt-notes";
      notes.innerHTML = "<h2>PLEASE NOTE</h2><ul><li>Accounts are due on demand.</li><li>Our products carry a warranty against manufacturing defects. All claims must be accompanied by the sales invoice.</li><li>Goods once sold are not returnable and remain the property of STETECH SOLAR TECHNOLOGY Kenya Limited until fully paid for.</li><li>Our official bank details remain unchanged. Confirm any requested change through the company’s official telephone contacts.</li><li>E&amp;O.E.</li></ul>";
      notes.style.cssText = "border-top:1px solid #d5d9d5;margin-top:9px;padding-top:7px;font-size:8px;color:#515b56;line-height:1.35";
      const notesStyle = target.document.createElement("style");
      notesStyle.textContent = ".receipt-notes h2{font-size:11px;margin:0 0 6px;color:#333b37}.receipt-notes ul{margin:0;padding-left:16px}.receipt-notes li{margin:3px 0}";
      target.document.head.appendChild(notesStyle);
      if (qrDataUrl) {
        const verification = target.document.createElement("div");
        verification.className = "receipt-verify";
        verification.style.cssText = "display:flex;align-items:center;gap:8px;border-top:1px solid #d5d9d5;margin-top:9px;padding-top:7px;font-size:8px;color:#515b56";
        const qr = target.document.createElement("img");
        qr.src = qrDataUrl;
        qr.alt = "Scan to verify receipt authenticity";
        qr.style.cssText = "width:62px;height:62px;image-rendering:pixelated";
        const verifyText = target.document.createElement("div");
        verifyText.textContent = "Scan to verify this receipt online. Verification shows receipt totals and payment status only.";
        verification.append(qr, verifyText);
        receiptBody.appendChild(verification);
      }
      receiptBody.appendChild(notes);
    }
    target.document.close();
  };

  const checkout = async () => {
    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    const receiptWindow = window.open("", "_blank", "width=440,height=680");
    setSaving(true);
    setError("");

    try {
      const records = await addSales({
        items: cart.map(({ productId, quantity, unitPrice }) => ({ productId, quantity, unitPrice })),
        customerName: customerName.trim() || "Walk-in customer",
        customerPhone,
        location: customerLocation,
        paymentMethod,
        amountPaid: Math.max(0, Math.min(cartSubtotal, Number(amountPaid) || 0)),
      });
      await printReceipt(receiptWindow, records, customerName.trim() || "Walk-in customer", customerPhone, customerLocation, paymentMethod, cartSubtotal, Math.max(0, Math.min(cartSubtotal, Number(amountPaid) || 0)), records[0]?.receiptNumber, records[0]?.verificationId);

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerLocation("");
      setPaymentMethod("Cash");
      setAmountPaid("0");

      setCheckoutOpen(false);

      await syncProducts().catch(() => undefined);
      await syncSales().catch(() => undefined);

      refresh();

      setTab("sales");
    } catch (e) {
      receiptWindow?.close();
      setError(
        e instanceof Error
          ? e.message
          : "Unable to complete the sale."
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------
     QUICK SALE FORM
     Retained for compatibility with existing sales workflow.
  ------------------------------------------------------------- */

  const recordSale = async (e: React.FormEvent) => {
    e.preventDefault();

    const product = products.find(
      (p) => p.id === Number(saleForm.productId)
    );

    if (!product) return;

    const quantity = Math.max(
      1,
      Number(saleForm.quantity) || 1
    );

    if (quantity > Number(product.stock || 0)) {
      setError(
        `Only ${product.stock || 0} units of ${
          product.name
        } are available.`
      );
      return;
    }

    const unitPrice =
      Number(saleForm.unitPrice) ||
      getNumericPrice(product);
    const amountReceived = saleForm.amountPaid === ""
      ? saleForm.paymentMethod === "Credit" ? 0 : quantity * unitPrice
      : Number(saleForm.amountPaid) || 0;

    setSaving(true);
    setError("");

    try {
      await addSale({
        productId: product.id,
        quantity,
        unitPrice,
        customerName:
          saleForm.customerName || "Walk-in customer",
        customerPhone: saleForm.customerPhone,
        location: saleForm.location,
        paymentStatus: saleForm.paymentStatus,
        paymentMethod: saleForm.paymentMethod,
        amountPaid: amountReceived,
      });

      setSaleForm({
        productId: "",
        quantity: "1",
        customerName: "",
        customerPhone: "",
        location: "",
        paymentStatus: "paid",
        paymentMethod: "Cash",
        amountPaid: "",
        unitPrice: "",
      });

      refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to record sale."
      );
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTransaction || saving) return;
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > paymentTransaction.balanceDue) {
      setError(`Enter an amount up to ${formatKES(paymentTransaction.balanceDue)}.`);
      return;
    }
    const receiptWindow = window.open("", "_blank", "width=440,height=680");
    setSaving(true);
    setError("");
    try {
      const payment = await recordPayment({ transactionId: paymentTransaction.id, amount, method: paymentEntryMethod });
      await printReceipt(
        receiptWindow,
        sales.filter((sale) => sale.transactionId === paymentTransaction.id),
        paymentTransaction.customerName,
        paymentTransaction.customerPhone,
        paymentTransaction.location,
        paymentEntryMethod,
        paymentTransaction.total,
        paymentTransaction.amountPaid + amount,
        payment.receiptNumber,
        payment.verificationId
      );
      setPaymentTransaction(null);
      setPaymentAmount("");
      refresh();
    } catch (e) {
      receiptWindow?.close();
      setError(e instanceof Error ? e.message : "Unable to save payment.");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------
     INVENTORY ADJUSTMENT
  ------------------------------------------------------------- */

  const openInventoryAdjustment = (
    product: Product,
    action: InventoryAction = "receive"
  ) => {
    setInventoryProduct(product);
    setInventoryAction(action);
    setInventoryQuantity("1");
    setInventoryNote("");
    setInventoryModal(true);
  };

  const saveInventoryAdjustment = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!inventoryProduct || saving) return;

    const quantity = Math.max(
      0,
      Number(inventoryQuantity) || 0
    );

    if (quantity < 0 || (inventoryAction !== "set" && quantity === 0)) {
      setError("Enter a valid quantity.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await adjustInventory({
        productId: inventoryProduct.id,
        action: inventoryAction,
        quantity,
        note: inventoryNote,
      });

      refresh();
      setInventoryModal(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to update inventory."
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------
     EXPORT SALES
  ------------------------------------------------------------- */

  const exportSales = () => {
    const header =
      "Sale ID,Transaction ID,Receipt Reference,Date,Product,Quantity,Unit Price,Total,Amount Paid,Payment Method,Customer,Phone,Location,Payment Status";

    const rows = sales.map((s) =>
      [
        formatRecordCode(s.id),
        formatRecordCode(s.transactionId || s.id),
        s.receiptNumber || "",
        new Date(s.soldAt).toLocaleString(),
        s.productName,
        s.quantity,
        s.unitPrice,
        s.total,
        s.amountPaid ?? (s.paymentStatus === "paid" ? s.total : 0),
        s.paymentMethod || "Cash",
        s.customerName,
        s.customerPhone,
        s.location,
        s.paymentStatus,
      ]
        .map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",")
    );

    const blob = new Blob(
      [[header, ...rows].join("\n")],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `stetech-sales-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    a.click();

    URL.revokeObjectURL(url);
  };

  const exportSalesReport = async () => {
    const { strToU8, zipSync } = await import('fflate');
    const headers = ['Sale ID', 'Transaction ID', 'Date', 'Staff', 'Receipt', 'Customer', 'Product', 'Quantity', 'Sale total (KSh)'];
    const rows: Array<Array<string | number>> = [headers, ...staffReportSales.map((sale) => [
      formatRecordCode(sale.id),
      formatRecordCode(sale.transactionId || sale.id),
      new Date(sale.soldAt).toLocaleString(),
      sale.staffName,
      sale.receiptNumber || 'Legacy receipt',
      sale.customerName,
      sale.productName,
      sale.quantity,
      Number(sale.total || 0),
    ]), ['REPORT TOTAL', '', '', '', '', '', '', '', reportTotals.revenue]];
    const widths = [14, 18, 22, 24, 20, 24, 42, 12, 20];
    const columnName = (index: number) => String.fromCharCode(65 + index);
    const escapeXml = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
    })[character] || '');
    const sheetRows = rows.map((row, rowIndex) => {
      const cells = row.map((value, columnIndex) => {
        if (value === '') return '';
        const address = `${columnName(columnIndex)}${rowIndex + 1}`;
        const isHeader = rowIndex === 0;
        const isTotal = rowIndex === rows.length - 1;
        const style = isHeader ? 1 : columnIndex === 8 ? (isTotal ? 4 : 3) : isTotal ? 2 : 0;
        if (typeof value === 'number') return `<c r="${address}" s="${style}" t="n"><v>${value}</v></c>`;
        return `<c r="${address}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
      }).join('');
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    }).join('');
    const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><dimension ref="A1:I${rows.length}"/><cols>${widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join('')}</cols><sheetData>${sheetRows}</sheetData><autoFilter ref="A1:I${Math.max(1, rows.length - 1)}"/></worksheet>`;
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;KSh&quot; #,##0.00"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF07533E"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="1" fillId="0" borderId="0" applyFont="1" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sales Report" sheetId="1" r:id="rId1"/></sheets></workbook>`;
    const archive = zipSync({
      '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`),
      '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`),
      'xl/workbook.xml': strToU8(workbookXml),
      'xl/_rels/workbook.xml.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`),
      'xl/worksheets/sheet1.xml': strToU8(worksheet),
      'xl/styles.xml': strToU8(styles),
    });
    const url = URL.createObjectURL(new Blob([archive], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `stetech-sales-${reportPeriod}-${reportPeriod === 'day' ? reportDate : reportDate.slice(0, 7)}.xlsx`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  /* -------------------------------------------------------------
     EXPORT INVENTORY
  ------------------------------------------------------------- */

  const exportInventory = () => {
    const header =
      "Product ID,Product,Category,Stock,Cost Price,Retail Price,Stock Cost Value,Retail Value";

    const rows = products.map((product) => {
      const stock = Number(product.stock || 0);
      const cost = Number(product.costPrice || 0);
      const retail = getNumericPrice(product);

      return [
        product.id,
        product.name,
        product.category,
        stock,
        cost,
        retail,
        stock * cost,
        stock * retail,
      ]
        .map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",");
    });

    const blob = new Blob(
      [[header, ...rows].join("\n")],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `stetech-inventory-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    a.click();

    URL.revokeObjectURL(url);
  };

  /* -------------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------------- */

  const navigation = [
    {
      key: "overview",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      key: "pos",
      icon: ShoppingCart,
      label: "POS / New Sale",
    },
    {
      key: "inventory",
      icon: Boxes,
      label: "Inventory",
    },
    {
      key: "products",
      icon: Package,
      label: "Products",
    },
    {
      key: "sales",
      icon: BarChart3,
      label: "Sales",
    },
    {
      key: "reports",
      icon: TrendingUp,
      label: "Reports",
    },
    {
      key: "projects",
      icon: PackagePlus,
      label: "Projects",
    },
    {
      key: "staff",
      icon: UserRound,
      label: "Staff",
    },
    {
      key: "gallery",
      icon: Images,
      label: "Gallery",
    },
  ] as const;

  const changeTab = (newTab: Tab) => {
    setTab(newTab);
    setMobileMenu(false);
    setError("");
  };

  /* -------------------------------------------------------------
     LOADING
  ------------------------------------------------------------- */

  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center text-white">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />
          <p className="font-semibold">
            Loading STETECH control room...
          </p>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------
     LOGIN
  ------------------------------------------------------------- */

  if (!loggedIn) {
    return (
      <main className="staff-login-shell">
        <section className="staff-login-panel">
          <div className="staff-login-story"><img src="/stetech solar.png" alt="STETECH Solar Technology" /><p className="staff-login-kicker">STETECH SOLAR TECHNOLOGY</p><h1>One clear view of your whole business.</h1><p>Manage the team, keep projects current, and stay on top of stock and sales from one secure workspace.</p><div className="staff-login-points"><span>Projects & staff</span><span>Live sales & stock</span><span>Business reports</span></div></div>
          <div className="staff-login-form-wrap"><div className="staff-login-form">
            <p className="staff-login-overline">ADMIN WORKSPACE</p><h2>Welcome back</h2><p className="staff-login-intro">Sign in with your administrator account to continue.</p>
            <form onSubmit={login} className="mt-7 space-y-4">
              {error && <p role="alert" className="staff-login-alert">{error}</p>}
              <label className="block text-sm font-bold">Admin email<input type="email" autoFocus autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50" placeholder="name@example.com" /></label>
              <label className="block text-sm font-bold">Password<input type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50" placeholder="Enter password" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="mt-1.5 text-xs font-bold text-emerald-800 hover:underline">{showPassword ? "Hide password" : "Show password"}</button></label>
              <button disabled={saving} className="w-full rounded-lg bg-emerald-800 px-5 py-3.5 font-extrabold text-white transition hover:bg-emerald-900 disabled:opacity-50">{saving ? "Signing in..." : "Enter admin workspace"} <ArrowRight className="ml-2 inline h-4 w-4" /></button>
            </form>
            <div className="staff-admin-link"><a href="/">Return to website</a><span>·</span><a href="/staff">Staff portal</a></div>
          </div></div>
        </section>
      </main>
    );
  }

  /* -------------------------------------------------------------
     MAIN PORTAL
  ------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* MOBILE TOP BAR */}

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="rounded-xl p-2 hover:bg-slate-100"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/stetech solar.png"
            alt="STETECH"
            className="h-9 w-9 object-contain"
          />

          <span className="font-black">
            STETECH
          </span>
        </div>

        <button
          onClick={() => changeTab("pos")}
          className="relative rounded-xl bg-emerald-600 p-2 text-white"
        >
          <ShoppingCart className="h-5 w-5" />

          {cartItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black">
              {cartItems}
            </span>
          )}
        </button>
      </header>

      <div className="flex min-h-screen">
        {/* SIDEBAR */}

        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 transform bg-slate-950 text-white transition-transform
            lg:sticky lg:top-0 lg:block lg:h-screen lg:translate-x-0
            ${
              mobileMenu
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          <div className="flex h-full flex-col">
            {/* BRAND */}

            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                  <img
                    src="/stetech solar.png"
                    alt="STETECH"
                    className="h-10 w-10 object-contain"
                  />
                </div>

                <div>
                  <p className="font-black tracking-wide">
                    STETECH
                  </p>

                  <p className="text-xs text-slate-400">
                    Solar Management
                  </p>
                </div>
              </div>
            </div>

            {/* NAV */}

            <nav className="flex-1 space-y-1 p-4">
              <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Management
              </p>

              {navigation.map((item) => {
                const Icon = item.icon;

                const active =
                  tab === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() =>
                      changeTab(item.key as Tab)
                    }
                    className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                      active
                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-900/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />

                    <span>{item.label}</span>

                    {item.key === "pos" &&
                      cartItems > 0 && (
                        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                          {cartItems}
                        </span>
                      )}
                  </button>
                );
              })}
            </nav>

            {/* QUICK INFO */}

            <div className="m-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold text-slate-400">
                Inventory
              </p>

              <p className="mt-1 text-2xl font-black">
                {stats.stock.toLocaleString()}
              </p>

              <p className="text-xs text-slate-500">
                units currently in stock
              </p>
            </div>

            {/* LOGOUT */}

            <div className="border-t border-white/10 p-4">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE OVERLAY */}

        {mobileMenu && (
          <button
            aria-label="Close menu"
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          />
        )}

        {/* CONTENT */}

        <section className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* PAGE HEADER */}

            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                  STETECH control room
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                  {tab === "overview" &&
                    "Business Overview"}

                  {tab === "pos" &&
                    "Point of Sale"}

                  {tab === "inventory" &&
                    "Inventory Management"}

                  {tab === "products" &&
                    "Product Catalogue"}

                  {tab === "sales" &&
                    "Sales Records"}

                  {tab === "reports" &&
                    "Business Reports"}

                  {tab === "projects" && "Project Portfolio"}

                  {tab === "staff" && "Staff Portal Access"}

                  {tab === "gallery" &&
                    "Website Gallery"}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your solar business from one place.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setProfileOpen(true)} className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800" title="Edit profile" aria-label="Edit profile"><UserRound className="h-4 w-4" /></button>
                <button
                  onClick={() => {
                    refresh();
                    setError("");
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 hover:bg-slate-50"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                <button
                  onClick={() => changeTab("pos")}
                  className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-600"
                >
                  <ShoppingCart className="mr-2 inline h-4 w-4" />
                  New Sale
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <span>{error}</span>

                <button
                  onClick={() => setError("")}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* =====================================================
                DASHBOARD
            ====================================================== */}

            {tab === "overview" && (
              <div className="space-y-6">
                {/* KPI */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-400">
                          Today's revenue
                        </p>

                        <p className="mt-3 text-3xl font-black">
                          {formatKES(stats.todayRevenue)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                          From today's recorded sales
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-500">
                          Today's sales
                        </p>

                        <p className="mt-3 text-3xl font-black text-slate-950">
                          {stats.todayTransactions.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      Completed transactions
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-500">
                          Inventory value
                        </p>

                        <p className="mt-3 text-3xl font-black text-slate-950">
                          {formatKES(stats.stockValue)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                        <Wallet className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      Based on product cost price
                    </p>
                  </div>

                  <div className="rounded-3xl border border-red-100 bg-red-50 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-red-600">
                          Stock alerts
                        </p>

                        <p className="mt-3 text-3xl font-black text-red-900">
                          {stats.lowStock}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-3 text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-red-600">
                      {stats.outOfStock} currently out of stock
                    </p>
                  </div>

                  <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-amber-700">Pending payments</p>
                        <p className="mt-3 text-2xl font-black text-amber-950">{formatKES(stats.pendingPayments)}</p>
                      </div>
                      <Wallet className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="mt-4 text-xs text-amber-700">Outstanding across all sales</p>
                  </div>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-black">Payment balances</h2>
                    <p className="text-sm text-slate-500">Collected by method and outstanding customer credit</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "Cash received", value: paymentBalances.cash, tone: "text-emerald-700" },
                      { label: "M-Pesa received", value: paymentBalances.mpesa, tone: "text-green-700" },
                      { label: "Bank received", value: paymentBalances.bank, tone: "text-blue-700" },
                      { label: "Credit outstanding", value: paymentBalances.credit, tone: "text-amber-700" },
                    ].map((balance) => (
                      <div key={balance.label} className="border-l-2 border-slate-200 px-4 py-2">
                        <p className="text-sm font-bold text-slate-500">{balance.label}</p>
                        <p className={`mt-1 text-xl font-black ${balance.tone}`}>{formatKES(balance.value)}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* QUICK ACTIONS */}

                <div className="grid gap-4 md:grid-cols-3">
                  <button
                    onClick={() => changeTab("pos")}
                    className="group rounded-3xl bg-emerald-600 p-6 text-left text-white transition hover:-translate-y-1 hover:bg-emerald-700"
                  >
                    <ShoppingCart className="h-7 w-7" />

                    <h2 className="mt-5 text-xl font-black">
                      Open POS
                    </h2>

                    <p className="mt-1 text-sm text-emerald-100">
                      Create a customer sale and update stock.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      changeTab("inventory")
                    }
                    className="group rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:ring-emerald-300"
                  >
                    <Boxes className="h-7 w-7 text-emerald-600" />

                    <h2 className="mt-5 text-xl font-black">
                      Manage Inventory
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Receive stock, adjust quantities and
                      monitor low stock.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      changeTab("products")
                    }
                    className="group rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:ring-emerald-300"
                  >
                    <PackagePlus className="h-7 w-7 text-emerald-600" />

                    <h2 className="mt-5 text-xl font-black">
                      Add Product
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Add a new product to the catalogue.
                    </p>
                  </button>
                </div>

                {/* RECENT SALES + LOW STOCK */}

                <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black">
                          Recent sales
                        </h2>

                        <p className="text-sm text-slate-500">
                          Latest POS transactions
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          changeTab("sales")
                        }
                        className="text-sm font-black text-emerald-600"
                      >
                        View all
                      </button>
                    </div>

                    <div className="mt-5 space-y-2">
                      {sales.slice(0, 6).map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-bold">
                              {sale.productName}
                            </p>

                            <p className="text-xs text-slate-400">
                              {sale.customerName} ·{" "}
                              {new Date(
                                sale.soldAt
                              ).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-black text-emerald-600">
                              {formatKES(sale.total)}
                            </p>

                            <p className="text-xs text-slate-400">
                              {sale.quantity} unit
                              {sale.quantity === 1
                                ? ""
                                : "s"}
                            </p>
                          </div>
                        </div>
                      ))}

                      {!sales.length && (
                        <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                          No sales recorded yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-950 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black">
                          Low stock
                        </h2>

                        <p className="text-sm text-slate-500">
                          Products needing attention
                        </p>
                      </div>

                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>

                    <div className="mt-5 space-y-3">
                      {products
                        .filter(
                          (product) =>
                            Number(product.stock || 0) <=
                            Number(product.reorderLevel ?? 5)
                        )
                        .slice(0, 5)
                        .map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between rounded-2xl bg-white/5 p-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <img
                                src={product.image}
                                alt=""
                                className="h-10 w-10 rounded-xl bg-white object-contain p-1"
                              />

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold">
                                  {product.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {product.category}
                                </p>
                              </div>
                            </div>

                            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-black text-red-400">
                              {product.stock || 0}
                            </span>
                          </div>
                        ))}

                      {!stats.lowStock && (
                        <p className="py-8 text-center text-sm text-slate-500">
                          All products have healthy stock.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================
                POS
            ====================================================== */}

            {tab === "pos" && (
              <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                {/* PRODUCTS */}

                <div className="min-w-0">
                  <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <input
                          value={posSearch}
                          onChange={(e) =>
                            setPosSearch(e.target.value)
                          }
                          placeholder="Search products..."
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                        />
                      </div>

                      <select
                        value={posCategory}
                        onChange={(e) =>
                          setPosCategory(e.target.value)
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none"
                      >
                        {categories.map((category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {posProducts.map((product) => {
                      const stock = Number(
                        product.stock || 0
                      );

                      const inCart =
                        cart.find(
                          (item) =>
                            item.productId === product.id
                        )?.quantity || 0;

                      return (
                        <button
                          key={product.id}
                          onClick={() =>
                            addToCart(product)
                          }
                          disabled={stock <= 0}
                          className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <div className="relative flex h-44 items-center justify-center bg-slate-50 p-5">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-contain transition group-hover:scale-105"
                            />

                            {inCart > 0 && (
                              <span className="absolute right-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-emerald-600 px-2 text-xs font-black text-white">
                                {inCart}
                              </span>
                            )}
                          </div>

                          <div className="p-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              {product.category}
                            </p>

                            <h3 className="mt-1 line-clamp-2 min-h-[48px] font-black text-slate-950">
                              {product.name}
                            </h3>

                            <div className="mt-4 flex items-end justify-between">
                              <div>
                                <p className="text-lg font-black text-emerald-600">
                                  {formatKES(
                                    getNumericPrice(
                                      product
                                    )
                                  )}
                                </p>

                                <p
                                  className={`text-xs font-bold ${
                                    stock <= Number(product.reorderLevel ?? 5)
                                      ? "text-amber-600"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {stock <= 0
                                    ? "Out of stock"
                                    : `${stock} in stock`}
                                </p>
                              </div>

                              <span className="rounded-xl bg-slate-950 p-2.5 text-white group-hover:bg-emerald-600">
                                <Plus className="h-4 w-4" />
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {!posProducts.length && (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                      <Package className="mx-auto h-10 w-10 text-slate-300" />

                      <p className="mt-4 font-bold">
                        No products found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try another product or category.
                      </p>
                    </div>
                  )}
                </div>

                {/* CART */}

                <div className="xl:sticky xl:top-6 xl:self-start">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 bg-slate-950 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Current transaction
                          </p>

                          <h2 className="mt-1 text-2xl font-black">
                            Shopping Cart
                          </h2>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-3">
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto p-4">
                      {cart.length ? (
                        <div className="space-y-3">
                          {cart.map((item) => (
                            <div
                              key={item.productId}
                              className="rounded-2xl bg-slate-50 p-3"
                            >
                              <div className="flex gap-3">
                                <img
                                  src={item.image}
                                  alt=""
                                  className="h-14 w-14 rounded-xl bg-white object-contain p-1"
                                />

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-black">
                                    {item.productName}
                                  </p>

                                  <p className="text-xs text-slate-400">
                                    {formatKES(
                                      item.unitPrice
                                    )}{" "}
                                    each
                                  </p>

                                  <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateCartQuantity(
                                            item.productId,
                                            item.quantity -
                                              1
                                          )
                                        }
                                        className="px-3 py-1.5 font-black hover:bg-slate-100"
                                      >
                                        −
                                      </button>

                                      <span className="min-w-8 text-center text-sm font-black">
                                        {item.quantity}
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateCartQuantity(
                                            item.productId,
                                            item.quantity +
                                              1
                                          )
                                        }
                                        className="px-3 py-1.5 font-black hover:bg-slate-100"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <p className="font-black">
                                      {formatKES(
                                        item.quantity *
                                          item.unitPrice
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromCart(
                                      item.productId
                                    )
                                  }
                                  className="h-8 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <ShoppingCart className="mx-auto h-12 w-12 text-slate-200" />

                          <p className="mt-4 font-black">
                            Cart is empty
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Click a product to add it.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-500">
                          Items
                        </span>

                        <span className="font-black">
                          {cartItems}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-black">
                          Total
                        </span>

                        <span className="text-2xl font-black text-emerald-600">
                          {formatKES(cartSubtotal)}
                        </span>
                      </div>

                      <button
                        disabled={!cart.length}
                        onClick={() => {
                          setAmountPaid(paymentMethod === "Credit" ? "0" : String(cartSubtotal));
                          setCheckoutOpen(true);
                        }}
                        className="mt-5 w-full rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Receipt className="mr-2 inline h-5 w-5" />
                        Continue to Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================
                INVENTORY
            ====================================================== */}

            {tab === "inventory" && (
              <div className="space-y-6">
                {/* INVENTORY SUMMARY */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-500">
                          Total stock
                        </p>

                        <p className="mt-2 text-3xl font-black">
                          {stats.stock.toLocaleString()}
                        </p>
                      </div>

                      <Boxes className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-500">
                          Cost value
                        </p>

                        <p className="mt-2 text-3xl font-black">
                          {formatKES(
                            stats.stockValue
                          )}
                        </p>
                      </div>

                      <CircleDollarSign className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-500">
                          Retail value
                        </p>

                        <p className="mt-2 text-3xl font-black">
                          {formatKES(
                            stats.retailValue
                          )}
                        </p>
                      </div>

                      <Wallet className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-bold text-amber-700">
                          Low stock
                        </p>

                        <p className="mt-2 text-3xl font-black text-amber-900">
                          {stats.lowStock}
                        </p>
                      </div>

                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </div>

                {/* INVENTORY TOOLBAR */}

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        value={inventorySearch}
                        onChange={(e) =>
                          setInventorySearch(
                            e.target.value
                          )
                        }
                        placeholder="Search inventory..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none focus:border-emerald-400 focus:bg-white"
                      />
                    </div>

                    <select
                      value={inventoryCategory}
                      onChange={(e) =>
                        setInventoryCategory(
                          e.target.value
                        )
                      }
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold"
                    >
                      {categories.map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={exportInventory}
                      className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-emerald-600"
                    >
                      <Download className="mr-2 inline h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>

                {/* INVENTORY TABLE */}

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="hidden grid-cols-[2.4fr_1fr_1fr_1fr_1fr_220px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400 lg:grid">
                    <span>Product</span>
                    <span>Category</span>
                    <span>Stock</span>
                    <span>Cost</span>
                    <span>Retail</span>
                    <span>Inventory actions</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {inventoryProducts.map((product) => {
                      const stock = Number(
                        product.stock || 0
                      );

                      const cost = Number(
                        product.costPrice || 0
                      );

                      const retail =
                        getNumericPrice(product);

                      return (
                        <div
                          key={product.id}
                          className="grid gap-4 px-5 py-5 lg:grid-cols-[2.4fr_1fr_1fr_1fr_1fr_220px] lg:items-center"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt=""
                              className="h-14 w-14 rounded-2xl bg-slate-50 object-contain p-1"
                            />

                            <div className="min-w-0">
                              <p className="truncate font-black">
                                {product.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                ID #{product.id}
                              </p>
                            </div>
                          </div>

                          <div className="text-sm text-slate-500">
                            {product.category}
                          </div>

                          <div>
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-black ${
                                stock <= 0
                                  ? "bg-red-50 text-red-700"
                                  : stock <= Number(product.reorderLevel ?? 5)
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {stock} units
                            </span>
                          </div>

                          <div className="font-bold text-slate-600">
                            {formatKES(cost)}
                          </div>

                          <div className="font-black text-emerald-600">
                            {formatKES(retail)}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                openInventoryAdjustment(
                                  product,
                                  "receive"
                                )
                              }
                              className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100"
                            >
                              <ArrowDownToLine className="mr-1 inline h-3.5 w-3.5" />
                              Receive
                            </button>

                            <button
                              onClick={() =>
                                openInventoryAdjustment(
                                  product,
                                  "remove"
                                )
                              }
                              className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-100"
                            >
                              <ArrowUpFromLine className="mr-1 inline h-3.5 w-3.5" />
                              Remove
                            </button>

                            <button
                              onClick={() =>
                                openInventoryAdjustment(
                                  product,
                                  "set"
                                )
                              }
                              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200"
                            >
                              <Settings2 className="mr-1 inline h-3.5 w-3.5" />
                              Adjust
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!inventoryProducts.length && (
                    <div className="p-12 text-center text-slate-500">
                      No inventory items found.
                    </div>
                  )}
                </div>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-5">
                    <h2 className="text-lg font-black">Stock movement history</h2>
                    <p className="text-sm text-slate-500">Sales, receipts, removals, and corrections</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {movements.slice().reverse().slice(0, 12).map((movement) => (
                      <div key={movement.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1.5fr_1fr_1fr_1.4fr] sm:items-center">
                        <div>
                          <p className="font-bold">{movement.productName}</p>
                          <p className="text-xs text-slate-500">{movement.note || movement.type}</p>
                        </div>
                        <span className={`text-sm font-black ${movement.delta < 0 ? "text-red-600" : "text-emerald-700"}`}>
                          {movement.delta > 0 ? "+" : ""}{movement.delta} units · {movement.type}
                        </span>
                        <span className="text-sm text-slate-600">{movement.stockBefore} → {movement.stockAfter}</span>
                        <time className="text-xs text-slate-500">{new Date(movement.createdAt).toLocaleString()}</time>
                      </div>
                    ))}
                    {!movements.length && <p className="p-8 text-center text-sm text-slate-500">Stock changes will appear here.</p>}
                  </div>
                </section>
              </div>
            )}

            {/* =====================================================
                PRODUCTS
            ====================================================== */}

            {tab === "products" && (
              <div className="mt-2">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      value={productSearch}
                      onChange={(e) =>
                        setProductSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search catalogue..."
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-emerald-400 sm:w-80"
                    />
                  </div>

                  <button
                    onClick={openNewProduct}
                    className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-emerald-600"
                  >
                    <Plus className="mr-2 inline h-4 w-4" />
                    Add product
                  </button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="hidden grid-cols-[2.2fr_1fr_1fr_1fr_130px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400 md:grid">
                    <span>Product</span>
                    <span>Category</span>
                    <span>Price</span>
                    <span>Stock</span>
                    <span>Actions</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="grid gap-3 px-5 py-4 md:grid-cols-[2.2fr_1fr_1fr_1fr_130px] md:items-center md:gap-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={product.image}
                            alt=""
                            className="h-12 w-14 rounded-xl bg-slate-50 object-contain p-1"
                          />

                          <div className="min-w-0">
                            <p className="truncate font-bold">
                              {product.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              ID #{product.id}
                            </p>
                          </div>
                        </div>

                        <div className="text-sm text-slate-500">
                          {product.category}
                        </div>

                        <div className="font-black text-emerald-600">
                          {getProductPrice(product)}
                        </div>

                        <div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              Number(product.stock || 0) <=
                              5
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {product.stock ?? 0} units
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openEdit(product)
                            }
                            className="rounded-xl bg-slate-100 p-2.5 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              deleteProduct(product)
                            }
                            className="rounded-xl bg-slate-100 p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================
                SALES
            ====================================================== */}

            {tab === "sales" && (
              <div className="space-y-6">
                {/* QUICK SALE */}

                <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                  <form
                    onSubmit={recordSale}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                        <Receipt className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-xl font-black">
                          Quick sale
                        </h2>

                        <p className="text-sm text-slate-500">
                          Record a single transaction.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <label className="block text-sm font-bold">
                        Product

                        <select
                          required
                          value={saleForm.productId}
                          onChange={(e) =>
                            setSaleForm({
                              ...saleForm,
                              productId:
                                e.target.value,
                              unitPrice: e.target
                                .value
                                ? String(
                                    getNumericPrice(
                                      products.find(
                                        (p) =>
                                          p.id ===
                                          Number(
                                            e.target
                                              .value
                                          )
                                      )!
                                    )
                                  )
                                : "",
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
                        >
                          <option value="">
                            Select product
                          </option>

                          {products.map((p) => (
                            <option
                              key={p.id}
                              value={p.id}
                            >
                              {p.name} — {p.stock || 0}{" "}
                              in stock
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm font-bold">
                          Quantity

                          <input
                            required
                            min="1"
                            type="number"
                            value={
                              saleForm.quantity
                            }
                            onChange={(e) =>
                              setSaleForm({
                                ...saleForm,
                                quantity:
                                  e.target.value,
                              })
                            }
                            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
                          />
                        </label>

                        <label className="text-sm font-bold">
                          Unit price

                          <input
                            required
                            min="0"
                            type="number"
                            value={
                              saleForm.unitPrice
                            }
                            onChange={(e) =>
                              setSaleForm({
                                ...saleForm,
                                unitPrice:
                                  e.target.value,
                              })
                            }
                            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
                          />
                        </label>
                      </div>

                      <label className="block text-sm font-bold">
                        Customer

                        <input
                          value={
                            saleForm.customerName
                          }
                          onChange={(e) =>
                            setSaleForm({
                              ...saleForm,
                              customerName:
                                e.target.value,
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
                          placeholder="Customer name"
                        />
                      </label>

                      <label className="block text-sm font-bold">
                        Phone

                        <input
                          value={
                            saleForm.customerPhone
                          }
                          onChange={(e) =>
                            setSaleForm({
                              ...saleForm,
                              customerPhone:
                                e.target.value,
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
                          placeholder="+254..."
                        />
                      </label>

                      <label className="block text-sm font-bold">
                        Payment method
                        <select value={saleForm.paymentMethod} onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value as PaymentMethod })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3">
                          <option>Cash</option>
                          <option>M-Pesa</option>
                          <option>Bank</option>
                          <option>Credit</option>
                        </select>
                      </label>

                      <label className="block text-sm font-bold">
                        Amount received (KSh)
                        <input min="0" type="number" value={saleForm.amountPaid} onChange={(e) => setSaleForm({ ...saleForm, amountPaid: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3" />
                      </label>

                      <button
                        disabled={saving}
                        className="w-full rounded-2xl bg-emerald-600 px-5 py-3.5 font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="mr-2 inline h-4 w-4" />

                        {saving
                          ? "Saving..."
                          : "Save sale"}
                      </button>
                    </div>
                  </form>

                  {/* SALES TABLE */}

                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-xl font-black">
                          Sales database
                        </h2>

                        <p className="text-sm text-slate-500">
                          {new Set(sales.map((sale) => sale.transactionId || sale.id)).size} recorded
                          transactions
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input value={salesSearch} onChange={(e) => setSalesSearch(e.target.value)} placeholder="Receipt reference, customer, or phone" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm sm:w-72" />
                        </div>
                        <button
                          onClick={exportSales}
                          disabled={!sales.length}
                          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-40"
                        >
                          <Download className="mr-2 inline h-4 w-4" />
                          Export CSV
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1180px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="px-5 py-4">
                              Date
                            </th>
                            <th>Receipt reference</th>
                            <th>Transaction ID</th>
                            <th>Sale ID</th>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {filteredSales.map((sale) => (
                            <tr key={sale.id}>
                              <td className="px-5 py-4 text-slate-500">
                                {new Date(
                                  sale.soldAt
                                ).toLocaleDateString()}
                              </td>

                              <td className="py-4 font-mono text-xs font-bold text-slate-700">
                                {sale.receiptNumber || "Legacy receipt"}
                              </td>

                              <td className="py-4 font-mono text-xs font-bold text-slate-700">
                                {formatRecordCode(sale.transactionId || sale.id)}
                              </td>

                              <td className="py-4 font-mono text-xs font-bold text-slate-700">
                                {formatRecordCode(sale.id)}
                              </td>

                              <td className="py-4 font-bold">
                                {sale.productName}
                              </td>

                              <td className="py-4">
                                {sale.customerName}

                                <div className="text-xs text-slate-400">
                                  {sale.location}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {sale.customerPhone}
                                </div>
                                {transactions.filter((transaction) => transaction.id === sale.transactionId && transaction.balanceDue > 0 && transaction.saleIds[0] === sale.id).map((transaction) => (
                                  <button key={transaction.id} onClick={() => { setPaymentTransaction(transaction); setPaymentAmount(String(transaction.balanceDue)); }} className="mt-2 block text-xs font-black text-emerald-700 hover:underline">
                                    Collect {formatKES(transaction.balanceDue)}
                                  </button>
                                ))}
                              </td>

                              <td className="py-4">
                                {sale.quantity}
                              </td>

                              <td className="py-4 font-black text-emerald-600">
                                {formatKES(
                                  sale.total
                                )}
                              </td>

                              <td className="py-4">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                    sale.paymentStatus ===
                                    "paid"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  {
                                    sale.paymentStatus
                                  }
                                  <span className="ml-1">· {sale.paymentMethod || "Cash"}</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {!filteredSales.length && (
                        <div className="p-12 text-center text-slate-500">
                          {salesSearch ? "No sales match that receipt reference or search." : "Your sales records will appear here."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "reports" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                  <div>
                    <h2 className="text-lg font-black">Sales performance</h2>
                    <p className="text-sm text-slate-500">Revenue, gross profit, and payment mix</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value as "day" | "month")} className="rounded-xl border border-slate-200 px-3 py-2.5 font-bold">
                      <option value="day">Daily</option>
                      <option value="month">Monthly</option>
                    </select>
                    <input type={reportPeriod === "day" ? "date" : "month"} value={reportPeriod === "day" ? reportDate : reportDate.slice(0, 7)} onChange={(e) => setReportDate(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" />
                    <button type="button" onClick={exportSalesReport} disabled={!reportSales.length} className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-900 disabled:opacity-40"><Download className="mr-2 inline h-4 w-4" />Export Excel</button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-950 p-5 text-white">
                    <p className="text-sm text-slate-400">Sales revenue</p>
                    <p className="mt-2 text-2xl font-black">{formatKES(reportTotals.revenue)}</p>
                    <p className="mt-2 text-xs text-slate-400">{new Set(reportSales.map((sale) => sale.transactionId || sale.id)).size} transactions</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Gross profit</p>
                    <p className="mt-2 text-2xl font-black text-emerald-700">{formatKES(reportTotals.grossProfit)}</p>
                    <p className="mt-2 text-xs text-slate-500">Revenue less recorded product cost</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Current stock valuation</p>
                    <p className="mt-2 text-2xl font-black">{formatKES(stats.stockValue)}</p>
                    <p className="mt-2 text-xs text-slate-500">At product cost price</p>
                  </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 p-5">
                    <h2 className="font-black">Payment breakdown</h2>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {reportTotals.paymentBreakdown.map(({ method, total }) => (
                      <div key={method} className="flex items-center justify-between px-5 py-4">
                        <span className="font-bold">{method}</span>
                        <span className="font-black">{formatKES(total)}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 p-5"><h2 className="font-black">Staff sales records</h2><p className="mt-1 text-sm text-slate-500">Seller, customer, receipt and revenue for the selected period</p></div>
                  <div className="overflow-x-auto"><table className="w-full min-w-[1040px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Date</th><th>Transaction ID</th><th>Sale ID</th><th>Staff member</th><th>Receipt</th><th>Customer</th><th>Product</th><th>Qty</th><th className="pr-5 text-right">Sale total</th></tr></thead><tbody className="divide-y divide-slate-100">{staffReportSales.map((sale) => <tr key={sale.id}><td className="px-5 py-3 text-slate-500">{new Date(sale.soldAt).toLocaleString()}</td><td className="font-mono text-xs font-bold">{formatRecordCode(sale.transactionId || sale.id)}</td><td className="font-mono text-xs font-bold">{formatRecordCode(sale.id)}</td><td className="font-bold">{sale.staffName}</td><td className="font-mono text-xs">{sale.receiptNumber || 'Legacy'}</td><td>{sale.customerName}</td><td className="max-w-56 truncate">{sale.productName}</td><td>{sale.quantity}</td><td className="pr-5 text-right font-black">{formatKES(sale.total)}</td></tr>)}{!staffReportSales.length && <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-500">No sales were recorded during this period.</td></tr>}</tbody></table></div>
                </section>
              </div>
            )}

            {tab === "projects" && <ProjectManagement />}

            {tab === "staff" && <StaffManagement />}

            {/* =====================================================
                GALLERY
            ====================================================== */}

            {tab === "gallery" && <GalleryAdmin />}
          </div>
        </section>
      </div>

      {/* =========================================================
          CHECKOUT MODAL
      ========================================================== */}

        {profileOpen && firebaseAuth.currentUser && <PortalProfileModal db={firebaseDb} user={firebaseAuth.currentUser} role="admin" onClose={() => setProfileOpen(false)} />}

      {checkoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                  POS Checkout
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Complete sale
                </h2>
              </div>

              <button
                onClick={() =>
                  setCheckoutOpen(false)
                }
                className="rounded-full bg-slate-100 p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* TOTAL */}

              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-400">
                  Amount to collect
                </p>

                <p className="mt-1 text-4xl font-black text-emerald-400">
                  {formatKES(cartSubtotal)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {cartItems} item
                  {cartItems === 1 ? "" : "s"}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block text-sm font-bold">
                  Customer name

                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      value={customerName}
                      onChange={(e) =>
                        setCustomerName(
                          e.target.value
                        )
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3"
                      placeholder="Walk-in customer"
                    />
                  </div>
                </label>

                <label className="block text-sm font-bold">
                  Phone

                  <input
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(
                        e.target.value
                      )
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
                    placeholder="+254..."
                  />
                </label>

                <label className="block text-sm font-bold">
                  Location

                  <input
                    value={customerLocation}
                    onChange={(e) =>
                      setCustomerLocation(
                        e.target.value
                      )
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
                    placeholder="Town / delivery location"
                  />
                </label>

                <label className="block text-sm font-bold">
                  Payment method
                  <select value={paymentMethod} onChange={(e) => { const nextMethod = e.target.value as PaymentMethod; setPaymentMethod(nextMethod); setAmountPaid(nextMethod === "Credit" ? "0" : String(cartSubtotal)); }} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3">
                    <option>Cash</option>
                    <option>M-Pesa</option>
                    <option>Bank</option>
                    <option>Credit</option>
                  </select>
                </label>

                <label className="block text-sm font-bold">
                  Amount received (KSh)
                  <input type="number" min="0" max={cartSubtotal} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3" />
                  <span className="mt-1 block text-xs font-normal text-slate-500">Balance due: {formatKES(Math.max(0, cartSubtotal - (Number(amountPaid) || 0)))}</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() =>
                      setCheckoutOpen(false)
                    }
                    className="flex-1 rounded-2xl border border-slate-200 px-5 py-3.5 font-black text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>

                  <button
                    onClick={checkout}
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3.5 font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving
                      ? "Processing..."
                      : "Complete Sale"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentTransaction && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form onSubmit={submitPayment} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Payment collection</p>
                <h2 className="mt-1 text-xl font-black">Record payment</h2>
              </div>
              <button type="button" aria-label="Close payment form" onClick={() => setPaymentTransaction(null)} className="rounded-full bg-slate-100 p-2"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="font-bold">{paymentTransaction.customerName}</p>
              <p className="mt-1 text-sm text-slate-500">Transaction {formatRecordCode(paymentTransaction.id)}</p>
              <p className="mt-3 text-sm text-slate-500">Outstanding balance</p>
              <p className="text-2xl font-black text-amber-700">{formatKES(paymentTransaction.balanceDue)}</p>
            </div>
            <label className="mt-4 block text-sm font-bold">
              Amount received (KSh)
              <input required type="number" min="1" max={paymentTransaction.balanceDue} step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" />
            </label>
            <label className="mt-4 block text-sm font-bold">
              Received via
              <select value={paymentEntryMethod} onChange={(e) => setPaymentEntryMethod(e.target.value as Exclude<PaymentMethod, "Credit">)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3">
                <option>Cash</option>
                <option>M-Pesa</option>
                <option>Bank</option>
              </select>
            </label>
            <button disabled={saving} className="mt-5 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-black text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save payment"}
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          INVENTORY ADJUSTMENT MODAL
      ========================================================== */}

      {inventoryModal && inventoryProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveInventoryAdjustment}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                  Inventory
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {inventoryAction === "receive"
                    ? "Receive stock"
                    : inventoryAction === "remove"
                    ? "Remove stock"
                    : "Set stock"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setInventoryModal(false)
                }
                className="rounded-full bg-slate-100 p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={inventoryProduct.image}
                  alt=""
                  className="h-14 w-14 rounded-xl bg-white object-contain p-1"
                />

                <div>
                  <p className="font-black">
                    {inventoryProduct.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    Current stock:{" "}
                    <strong>
                      {inventoryProduct.stock || 0}
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-bold">
                Action

                <select
                  value={inventoryAction}
                  onChange={(e) =>
                    setInventoryAction(
                      e.target.value as InventoryAction
                    )
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
                >
                  <option value="receive">
                    Receive stock
                  </option>

                  <option value="remove">
                    Remove stock
                  </option>

                  <option value="set">
                    Set exact quantity
                  </option>
                </select>
              </label>

              <label className="block text-sm font-bold">
                Quantity

                <input
                  required
                  min={inventoryAction === "set" ? "0" : "1"}
                  type="number"
                  value={inventoryQuantity}
                  onChange={(e) =>
                    setInventoryQuantity(
                      e.target.value
                    )
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-black"
                />
              </label>

              <label className="block text-sm font-bold">
                Note

                <textarea
                  value={inventoryNote}
                  onChange={(e) =>
                    setInventoryNote(
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Reason for stock adjustment..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <button
                disabled={saving}
                className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving
                  ? "Updating..."
                  : "Update inventory"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          PRODUCT FORM
      ========================================================== */}

      {showProductForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveProduct}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  {editingProduct.id &&
                  products.some(
                    (p) => p.id === editingProduct.id
                  )
                    ? "Edit product"
                    : "New product"}
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Product details
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowProductForm(false)
                }
                className="rounded-full bg-slate-100 p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold sm:col-span-2">
                Product name

                <input
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="text-sm font-bold">
                Category

                <input
                  required
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="text-sm font-bold">
                Retail price (KSh)

                <input
                  required
                  min="0"
                  type="number"
                  value={(
                    editingProduct
                      .specifications.Price || ""
                  ).replace(/[^\d.]/g, "")}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      specifications: {
                        ...editingProduct.specifications,
                        Price: e.target.value,
                      },
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="text-sm font-bold">
                Stock quantity

                <input
                  min="0"
                  type="number"
                  value={editingProduct.stock ?? 0}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: Number(
                        e.target.value
                      ),
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="text-sm font-bold">
                Cost price

                <input
                  min="0"
                  type="number"
                  value={
                    editingProduct.costPrice ?? 0
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      costPrice: Number(
                        e.target.value
                      ),
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="text-sm font-bold">
                Reorder level
                <input min="0" type="number" value={editingProduct.reorderLevel ?? 5} onChange={(e) => setEditingProduct({ ...editingProduct, reorderLevel: Number(e.target.value) })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </label>

              <label className="text-sm font-bold sm:col-span-2">
                Image path / URL

                <input
                  value={editingProduct.image}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      image: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="/products/example.jpg"
                />
              </label>

              <label className="text-sm font-bold sm:col-span-2">
                Description

                <textarea
                  required
                  rows={3}
                  value={
                    editingProduct.description
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description:
                        e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="text-sm font-bold sm:col-span-2">
                Features

                <textarea
                  rows={4}
                  value={editingProduct.features.join(
                    "\n"
                  )}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      features:
                        e.target.value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="One feature per line"
                />
              </label>

              <label className="flex items-center gap-2 text-sm font-bold sm:col-span-2">
                <input type="checkbox" checked={editingProduct.active !== false} onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })} />
                Active in public catalogue and POS
              </label>
            </div>

            <button
              disabled={saving}
              className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingProduct.id &&
                  products.some(
                    (p) => p.id === editingProduct.id
                  )
                ? "Save changes"
                : "Add product to catalogue"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
};

export default AdminPage;