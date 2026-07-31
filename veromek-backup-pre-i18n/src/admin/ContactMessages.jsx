import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  Clock3,
  Crown,
  Eye,
  LoaderCircle,
  Mail,
  MessageSquareText,
  PackageCheck,
  PackagePlus,
  Pencil,
  RefreshCw,
  ShoppingBag,
  Star,
  TriangleAlert,
  Ticket,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  to,
  tone = "default",
}) {
  const toneClasses = {
    default:
      "border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
    warning:
      "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20",
    danger:
      "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20",
    success:
      "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20",
  };

  const iconClasses = {
    default:
      "bg-gray-100 text-gray-950 dark:bg-zinc-800 dark:text-white",
    warning:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    danger:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    success:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };

  const card = (
    <article
      className={`h-full rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        toneClasses[tone] || toneClasses.default
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight">
            {value}
          </p>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            iconClasses[tone] ||
            iconClasses.default
          }`}
        >
          <Icon size={23} />
        </div>
      </div>
    </article>
  );

  if (!to) {
    return card;
  }

  return (
    <Link
      to={to}
      className="block h-full"
    >
      {card}
    </Link>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = String(
    status || "pending"
  ).toLowerCase();

  const styles = {
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    processing:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    shipped:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    delivered:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    cancelled:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
        styles[normalizedStatus] ||
        styles.pending
      }`}
    >
      {normalizedStatus}
    </span>
  );
}

function StockBadge({ stock }) {
  const numericStock = Math.max(
    0,
    Number(stock || 0)
  );

  if (numericStock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700 dark:bg-red-950/40 dark:text-red-300">
        <TriangleAlert size={13} />
        Out of stock
      </span>
    );
  }

  if (numericStock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">
        <AlertTriangle size={13} />
        {numericStock} left
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700 dark:bg-green-950/40 dark:text-green-300">
      {numericStock} in stock
    </span>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function Dashboard() {
  const { profile, user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [customersCount, setCustomersCount] =
    useState(0);
  const [couponsCount, setCouponsCount] =
    useState(0);
  const [
    contactMessagesCount,
    setContactMessagesCount,
  ] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const adminName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Admin";

  const fetchDashboardData = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [
          ordersResponse,
          reviewsResponse,
          productsResponse,
          customersResponse,
          couponsResponse,
          contactMessagesResponse,
        ] = await Promise.all([
          supabase
            .from("orders")
            .select(
              `
                *,
                order_items (
                  id,
                  product_id,
                  product_name,
                  price,
                  quantity,
                  image
                )
              `
            )
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("reviews")
            .select(
              `
                id,
                user_id,
                product_id,
                reviewer_name,
                rating,
                comment,
                created_at
              `
            )
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("products")
            .select(
              `
                id,
                name,
                category,
                price,
                image,
                stock,
                active,
                created_at
              `
            )
            .order("created_at", {
              ascending: false,
            }),

          supabase.rpc(
            "admin_list_customers"
          ),

          supabase
            .from("coupons")
            .select("id", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("contact_messages")
            .select("id", {
              count: "exact",
              head: true,
            }),
        ]);

        if (ordersResponse.error) {
          throw ordersResponse.error;
        }

        if (reviewsResponse.error) {
          throw reviewsResponse.error;
        }

        if (productsResponse.error) {
          throw productsResponse.error;
        }

        if (customersResponse.error) {
          throw customersResponse.error;
        }

        if (couponsResponse.error) {
          throw couponsResponse.error;
        }

        if (contactMessagesResponse.error) {
          throw contactMessagesResponse.error;
        }

        setOrders(
          ordersResponse.data ?? []
        );

        setReviews(
          reviewsResponse.data ?? []
        );

        setProducts(
          (
            productsResponse.data ?? []
          ).map((product) => ({
            ...product,
            price: Number(
              product.price || 0
            ),
            stock: Math.max(
              0,
              Number(
                product.stock || 0
              )
            ),
            active:
              product.active !== false,
          }))
        );

        setCustomersCount(
          customersResponse.data?.length ??
            0
        );

        setCouponsCount(
          couponsResponse.count ?? 0
        );

        setContactMessagesCount(
          contactMessagesResponse.count ?? 0
        );

        if (silent) {
          toast.success(
            "Dashboard updated."
          );
        }
      } catch (error) {
        console.error(
          "Failed to load admin dashboard:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statistics = useMemo(() => {
    const totalRevenue = orders.reduce(
      (total, order) =>
        total +
        Number(order.total || 0),
      0
    );

    const totalProductsSold =
      orders.reduce((total, order) => {
        const quantity =
          order.order_items?.reduce(
            (itemsTotal, item) =>
              itemsTotal +
              Number(
                item.quantity || 0
              ),
            0
          ) || 0;

        return total + quantity;
      }, 0);

    const pendingOrders =
      orders.filter(
        (order) =>
          String(
            order.status || "pending"
          ).toLowerCase() ===
          "pending"
      ).length;

    const deliveredOrders =
      orders.filter(
        (order) =>
          String(
            order.status || ""
          ).toLowerCase() ===
          "delivered"
      ).length;

    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
            (total, review) =>
              total +
              Number(
                review.rating || 0
              ),
            0
          ) / reviews.length
        : 0;

    const activeProducts =
      products.filter(
        (product) => product.active
      ).length;

    const hiddenProducts =
      products.filter(
        (product) => !product.active
      ).length;

    const lowStockProducts =
      products.filter(
        (product) =>
          product.active &&
          Number(product.stock) > 0 &&
          Number(product.stock) <= 5
      );

    const outOfStockProducts =
      products.filter(
        (product) =>
          product.active &&
          Number(product.stock) === 0
      );

    const totalStock =
      products.reduce(
        (total, product) =>
          total +
          Number(
            product.stock || 0
          ),
        0
      );

    const inventoryValue =
      products.reduce(
        (total, product) =>
          total +
          Number(
            product.stock || 0
          ) *
            Number(
              product.price || 0
            ),
        0
      );

    return {
      totalRevenue,
      totalProductsSold,
      pendingOrders,
      deliveredOrders,
      averageRating,
      activeProducts,
      hiddenProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStock,
      inventoryValue,
    };
  }, [orders, reviews, products]);

  const recentOrders =
    orders.slice(0, 5);

  const recentReviews =
    reviews.slice(0, 4);

  const recentProducts =
    products.slice(0, 4);

  const inventoryAlerts = [
    ...statistics.outOfStockProducts,
    ...statistics.lowStockProducts,
  ].sort(
    (a, b) =>
      Number(a.stock || 0) -
      Number(b.stock || 0)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-zinc-950 dark:text-white">
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle
              size={40}
              className="animate-spin"
            />

            <p className="font-semibold">
              Loading admin dashboard...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-zinc-950 dark:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <section className="overflow-hidden rounded-[32px] bg-black px-6 py-9 text-white shadow-xl dark:bg-white dark:text-black sm:px-9">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold dark:bg-black/10">
                <Crown size={17} />
                Administrator panel
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Welcome back, {adminName}
              </h1>

              <p className="mt-4 max-w-2xl text-gray-300 dark:text-gray-600">
                Manage products, stock,
                customers, orders and reviews
                from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchDashboardData({
                  silent: true,
                })
              }
              disabled={refreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-bold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-black dark:text-white dark:hover:bg-zinc-800"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh data"}
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            to="/admin/products"
            className="flex items-center justify-between rounded-3xl bg-blue-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700"
          >
            <div>
              <p className="text-sm font-bold text-blue-100">
                Management
              </p>

              <p className="mt-2 text-xl font-black">
                Products
              </p>
            </div>

            <Boxes size={30} />
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center justify-between rounded-3xl bg-purple-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:bg-purple-700"
          >
            <div>
              <p className="text-sm font-bold text-purple-100">
                Management
              </p>

              <p className="mt-2 text-xl font-black">
                Orders
              </p>
            </div>

            <ShoppingBag size={30} />
          </Link>

          <Link
            to="/admin/reviews"
            className="flex items-center justify-between rounded-3xl bg-yellow-500 p-6 text-black shadow-lg transition hover:-translate-y-1 hover:bg-yellow-400"
          >
            <div>
              <p className="text-sm font-bold text-yellow-900">
                Management
              </p>

              <p className="mt-2 text-xl font-black">
                Reviews
              </p>
            </div>

            <MessageSquareText
              size={30}
            />
          </Link>

          <Link
            to="/admin/customers"
            className="flex items-center justify-between rounded-3xl bg-green-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:bg-green-700"
          >
            <div>
              <p className="text-sm font-bold text-green-100">
                Management
              </p>

              <p className="mt-2 text-xl font-black">
                Customers
              </p>
            </div>

            <Users size={30} />
          </Link>

          <Link
            to="/admin/coupons"
            className="flex items-center justify-between rounded-3xl bg-orange-500 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:bg-orange-600"
          >
            <div>
              <p className="text-sm font-bold text-orange-100">
                Management
              </p>

              <p className="mt-2 text-xl font-black">
                Coupons
              </p>
            </div>

            <Ticket size={30} />
          </Link>

          <Link
            to="/admin/contact-messages"
            className="flex items-center justify-between rounded-3xl bg-cyan-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:bg-cyan-700"
          >
            <div>
              <p className="text-sm font-bold text-cyan-100">
                Management
              </p>

              <p className="mt-2 text-xl font-black">
                Contact Messages
              </p>
            </div>

            <Mail size={30} />
          </Link>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total products"
            value={products.length}
            description={`${statistics.activeProducts} active`}
            icon={Boxes}
            to="/admin/products"
          />

          <StatCard
            title="Total stock"
            value={statistics.totalStock}
            description="All available units"
            icon={PackagePlus}
            to="/admin/products"
          />

          <StatCard
            title="Low stock"
            value={
              statistics
                .lowStockProducts.length
            }
            description="5 units or fewer"
            icon={AlertTriangle}
            to="/admin/products"
            tone="warning"
          />

          <StatCard
            title="Out of stock"
            value={
              statistics
                .outOfStockProducts.length
            }
            description="Products unavailable"
            icon={TriangleAlert}
            to="/admin/products"
            tone="danger"
          />

          <StatCard
            title="Customers"
            value={customersCount}
            description="Registered accounts"
            icon={Users}
            to="/admin/customers"
          />

          <StatCard
            title="Coupons"
            value={couponsCount}
            description="Discount codes"
            icon={Ticket}
            to="/admin/coupons"
          />

          <StatCard
            title="Contact messages"
            value={contactMessagesCount}
            description="Customer support messages"
            icon={Mail}
            to="/admin/contact-messages"
          />

          <StatCard
            title="Total orders"
            value={orders.length}
            description="All customer orders"
            icon={ShoppingBag}
            to="/admin/orders"
          />

          <StatCard
            title="Total revenue"
            value={formatCurrency(
              statistics.totalRevenue
            )}
            description="Revenue from orders"
            icon={CircleDollarSign}
            to="/admin/orders"
            tone="success"
          />

          <StatCard
            title="Inventory value"
            value={formatCurrency(
              statistics.inventoryValue
            )}
            description="Current stock value"
            icon={CircleDollarSign}
            to="/admin/products"
          />

          <StatCard
            title="Reviews"
            value={reviews.length}
            description={`${statistics.averageRating.toFixed(
              1
            )} average rating`}
            icon={MessageSquareText}
            to="/admin/reviews"
          />

          <StatCard
            title="Products sold"
            value={
              statistics.totalProductsSold
            }
            description="Total item quantities"
            icon={Boxes}
            to="/admin/orders"
          />

          <StatCard
            title="Pending orders"
            value={
              statistics.pendingOrders
            }
            description="Waiting for processing"
            icon={Clock3}
            to="/admin/orders"
            tone="warning"
          />

          <StatCard
            title="Delivered orders"
            value={
              statistics.deliveredOrders
            }
            description="Successfully delivered"
            icon={PackageCheck}
            to="/admin/orders"
            tone="success"
          />

          <StatCard
            title="Average rating"
            value={statistics.averageRating.toFixed(
              1
            )}
            description="Out of 5 stars"
            icon={Star}
            to="/admin/reviews"
          />

          <StatCard
            title="Active products"
            value={
              statistics.activeProducts
            }
            description="Visible in the shop"
            icon={Eye}
            to="/admin/products"
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-zinc-800 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black">
                  Inventory alerts
                </h2>

                {inventoryAlerts.length >
                  0 && (
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-black text-white">
                    {
                      inventoryAlerts.length
                    }
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Products requiring stock
                attention
              </p>
            </div>

            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
            >
              Manage inventory
              <ArrowRight size={16} />
            </Link>
          </div>

          {inventoryAlerts.length ===
          0 ? (
            <div className="px-6 py-14 text-center">
              <PackageCheck
                size={44}
                className="mx-auto text-green-500"
              />

              <h3 className="mt-4 text-lg font-black">
                Stock looks good
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No active product is low or out
                of stock.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-zinc-800">
              {inventoryAlerts.map(
                (product) => (
                  <article
                    key={product.id}
                    className="flex flex-col gap-5 px-6 py-5 transition hover:bg-gray-50 dark:hover:bg-zinc-800/50 sm:flex-row sm:items-center"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-800">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`h-full w-full object-cover ${
                            Number(
                              product.stock
                            ) === 0
                              ? "opacity-60 grayscale"
                              : ""
                          }`}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Boxes
                            size={30}
                            className="text-gray-400"
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        {product.category}
                      </p>

                      <h3 className="mt-1 truncate text-lg font-black">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Product #{product.id}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                      <StockBadge
                        stock={product.stock}
                      />

                      <p className="min-w-24 font-black">
                        {formatCurrency(
                          product.price
                        )}
                      </p>

                      <Link
                        to="/admin/products"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                      >
                        <Pencil size={16} />
                        Edit stock
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-black">
                Recent products
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Latest products added
              </p>
            </div>

            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Boxes
                size={40}
                className="mx-auto text-gray-400"
              />

              <p className="mt-4 font-bold">
                No products yet
              </p>
            </div>
          ) : (
            <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentProducts.map(
                (product) => (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800"
                  >
                    <div className="h-44 bg-gray-100 dark:bg-zinc-800">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Boxes
                            size={36}
                            className="text-gray-400"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-xs font-bold uppercase text-gray-400">
                        {product.category}
                      </p>

                      <h3 className="mt-1 truncate font-black">
                        {product.name}
                      </h3>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="font-black">
                          {formatCurrency(
                            product.price
                          )}
                        </p>

                        <StockBadge
                          stock={product.stock}
                        />
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
              <h2 className="text-xl font-black">
                Recent orders
              </h2>

              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
              >
                View all
                <ArrowRight size={16} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <ShoppingBag
                  size={38}
                  className="mx-auto text-gray-400"
                />

                <p className="mt-4 font-bold">
                  No orders yet
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-zinc-950">
                    <tr>
                      <th className="px-6 py-4">
                        Order
                      </th>

                      <th className="px-6 py-4">
                        Customer
                      </th>

                      <th className="px-6 py-4">
                        Date
                      </th>

                      <th className="px-6 py-4">
                        Total
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {recentOrders.map(
                      (order) => (
                        <tr
                          key={order.id}
                        >
                          <td className="px-6 py-5 font-bold">
                            #{order.id}
                          </td>

                          <td className="px-6 py-5">
                            {order.full_name ||
                              order.customer_name ||
                              order.email ||
                              "Customer"}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-500">
                            {formatDate(
                              order.created_at
                            )}
                          </td>

                          <td className="px-6 py-5 font-bold">
                            {formatCurrency(
                              order.total
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={
                                order.status
                              }
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
              <h2 className="text-xl font-black">
                Recent reviews
              </h2>

              <Link
                to="/admin/reviews"
                className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
              >
                View all
                <ArrowRight size={16} />
              </Link>
            </div>

            {recentReviews.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <MessageSquareText
                  size={38}
                  className="mx-auto text-gray-400"
                />

                <p className="mt-4 font-bold">
                  No reviews yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                {recentReviews.map(
                  (review) => (
                    <article
                      key={review.id}
                      className="px-6 py-5"
                    >
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-bold">
                            {review.reviewer_name ||
                              "Customer"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Product #
                            {review.product_id}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
                          <Star
                            size={14}
                            fill="currentColor"
                          />

                          {review.rating}
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        {review.comment}
                      </p>
                    </article>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}