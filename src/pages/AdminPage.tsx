import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  Check,
  ChevronDown,
  Download,
  Edit3,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackageCheck,
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
import {
  addSale,
  formatKES,
  getAllProducts,
  getNumericPrice,
  getProductPrice,
  getSales,
  removeProduct,
  syncProducts,
  syncSales,
  SaleRecord,
  upsertProduct,
} from "../data/productStore";

import { Cog } from "lucide-react";
import GalleryAdmin from "../components/GalleryAdmin";

type Tab =
  | "overview"
  | "pos"
  | "inventory"
  | "products"
  | "sales"
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
  active: true,
};

const AdminPage: React.FC = () => {
  /* -------------------------------------------------------------
     AUTH
  ------------------------------------------------------------- */

  const [loggedIn, setLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  /* -------------------------------------------------------------
     GLOBAL STATE
  ------------------------------------------------------------- */

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [products, setProducts] = useState<Product[]>(getAllProducts());
  const [sales, setSales] = useState<SaleRecord[]>(getSales());

  /* -------------------------------------------------------------
     PRODUCT STATE
  ------------------------------------------------------------- */

  const [productSearch, setProductSearch] = useState("");
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

  const [paymentStatus, setPaymentStatus] =
    useState<SaleRecord["paymentStatus"]>("paid");

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
    unitPrice: "",
  });

  /* -------------------------------------------------------------
     REFRESH
  ------------------------------------------------------------- */

  const refresh = () => {
    setProducts(getAllProducts());
    setSales(getSales());
  };

  /* -------------------------------------------------------------
     AUTH CHECK
  ------------------------------------------------------------- */

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => setLoggedIn(data.authenticated))
      .catch(() =>
        setError(
          "Unable to connect to the admin server. Please reload and try again."
        )
      )
      .finally(() => setAuthReady(true));
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
  }, [loggedIn]);

  useEffect(() => {
    const handler = () => refresh();

    window.addEventListener("stetech-products-updated", handler);
    window.addEventListener("stetech-sales-updated", handler);

    return () => {
      window.removeEventListener("stetech-products-updated", handler);
      window.removeEventListener("stetech-sales-updated", handler);
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
      (product) => Number(product.stock || 0) <= 5
    ).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock || 0) <= 0
    ).length;

    const activeProducts = products.filter(
      (product) => product.active !== false
    ).length;

    return {
      revenue,
      units,
      stock,
      stockValue,
      retailValue,
      lowStock,
      outOfStock,
      activeProducts,
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

  /* -------------------------------------------------------------
     LOGIN
  ------------------------------------------------------------- */

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setLoggedIn(true);
      setPassword("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Sign in failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const [password, setPassword] = useState("");

  /* -------------------------------------------------------------
     LOGOUT
  ------------------------------------------------------------- */

  const logout = async () => {
    try {
      const response = await fetch("/api/session", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not sign out.");
      }

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
      active: true,
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

  const checkout = async () => {
    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      /*
       * Add every cart line as a sale.
       * Existing productStore handles the stock reduction.
       */
      for (const item of cart) {
        await addSale({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customerName:
            customerName.trim() || "Walk-in customer",
          customerPhone,
          location: customerLocation,
          paymentStatus,
        });
      }

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerLocation("");
      setPaymentStatus("paid");

      setCheckoutOpen(false);

      await syncProducts().catch(() => undefined);
      await syncSales().catch(() => undefined);

      refresh();

      setTab("sales");
    } catch (e) {
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

    setSaving(true);
    setError("");

    try {
      await addSale({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        customerName:
          saleForm.customerName || "Walk-in customer",
        customerPhone: saleForm.customerPhone,
        location: saleForm.location,
        paymentStatus: saleForm.paymentStatus,
      });

      setSaleForm({
        productId: "",
        quantity: "1",
        customerName: "",
        customerPhone: "",
        location: "",
        paymentStatus: "paid",
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

    if (quantity <= 0) {
      setError("Enter a valid quantity.");
      return;
    }

    const currentStock = Number(
      inventoryProduct.stock || 0
    );

    let newStock = currentStock;

    if (inventoryAction === "receive") {
      newStock = currentStock + quantity;
    }

    if (inventoryAction === "remove") {
      newStock = Math.max(0, currentStock - quantity);
    }

    if (inventoryAction === "set") {
      newStock = quantity;
    }

    setSaving(true);
    setError("");

    try {
      await upsertProduct({
        ...inventoryProduct,
        stock: newStock,
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
      "Sale ID,Date,Product,Quantity,Unit Price,Total,Customer,Phone,Location,Payment Status";

    const rows = sales.map((s) =>
      [
        s.id,
        new Date(s.soldAt).toLocaleString(),
        s.productName,
        s.quantity,
        s.unitPrice,
        s.total,
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
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_#064e3b,_#020617_55%)] px-4 py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-8 shadow-2xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950 shadow-lg">
              <img
                src="/stetech solar.png"
                alt="STETECH"
                className="h-16 w-16 object-contain"
              />
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
              STETECH Solar
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Admin Portal
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage products, inventory, POS sales and your
              website.
            </p>
          </div>

          <form onSubmit={login} className="space-y-5">
            {error && (
              <p
                role="alert"
                className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Admin password
              </span>

              <input
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                placeholder="Enter password"
              />
            </label>

            <button
              disabled={saving}
              className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Signing in..." : "Enter dashboard"}
            </button>
          </form>

          <a
            href="/"
            className="mt-6 block text-center text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            Return to website
          </a>
        </div>
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

                  {tab === "gallery" &&
                    "Website Gallery"}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your solar business from one place.
                </p>
              </div>

              <div className="flex items-center gap-2">
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

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-400">
                          Sales revenue
                        </p>

                        <p className="mt-3 text-3xl font-black">
                          {formatKES(stats.revenue)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                      From recorded POS transactions
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-500">
                          Units sold
                        </p>

                        <p className="mt-3 text-3xl font-black text-slate-950">
                          {stats.units.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      Total units sold
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
                </div>

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
                            5
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
                                    stock <= 5
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
                        onClick={() =>
                          setCheckoutOpen(true)
                        }
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
                                  : stock <= 5
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
                        Payment status

                        <select
                          value={
                            saleForm.paymentStatus
                          }
                          onChange={(e) =>
                            setSaleForm({
                              ...saleForm,
                              paymentStatus:
                                e.target.value as SaleRecord["paymentStatus"],
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
                        >
                          <option value="paid">
                            Paid
                          </option>

                          <option value="pending">
                            Pending
                          </option>

                          <option value="partial">
                            Partial
                          </option>
                        </select>
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
                          {sales.length} recorded
                          transactions
                        </p>
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

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="px-5 py-4">
                              Date
                            </th>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {sales.map((sale) => (
                            <tr key={sale.id}>
                              <td className="px-5 py-4 text-slate-500">
                                {new Date(
                                  sale.soldAt
                                ).toLocaleDateString()}
                              </td>

                              <td className="py-4 font-bold">
                                {sale.productName}
                              </td>

                              <td className="py-4">
                                {sale.customerName}

                                <div className="text-xs text-slate-400">
                                  {sale.location}
                                </div>
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
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {!sales.length && (
                        <div className="p-12 text-center text-slate-500">
                          Your sales records will appear
                          here.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  Payment status

                  <select
                    value={paymentStatus}
                    onChange={(e) =>
                      setPaymentStatus(
                        e.target.value as SaleRecord["paymentStatus"]
                      )
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
                  >
                    <option value="paid">
                      Paid
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="partial">
                      Partial
                    </option>
                  </select>
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
                  min="0"
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