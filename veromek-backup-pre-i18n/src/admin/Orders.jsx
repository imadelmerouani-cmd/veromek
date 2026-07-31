import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Box,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  LoaderCircle,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Ticket,
  Truck,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/layout/Navbar";
import { supabase } from "../lib/supabase";
import { generateOrderInvoice } from "../utils/generateInvoice";

const ORDER_STATUSES = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

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

function normalizeStatus(status) {
  return String(status || "pending").toLowerCase();
}

function getStatusStyles(status) {
  const normalizedStatus = normalizeStatus(status);

  const styles = {
    pending:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300",
    processing:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
    shipped:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300",
    delivered:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300",
    cancelled:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  };

  return styles[normalizedStatus] || styles.pending;
}

function getStatusIcon(status) {
  const normalizedStatus = normalizeStatus(status);

  const icons = {
    pending: Clock3,
    processing: Package,
    shipped: Truck,
    delivered: Check,
    cancelled: XCircle,
  };

  return icons[normalizedStatus] || Clock3;
}

function getCustomerName(order) {
  return (
    order.full_name ||
    order.customer_name ||
    order.shipping_name ||
    order.name ||
    order.email ||
    "Customer"
  );
}

function getCustomerEmail(order) {
  return (
    order.email ||
    order.customer_email ||
    order.shipping_email ||
    ""
  );
}

function getCustomerPhone(order) {
  return (
    order.phone ||
    order.customer_phone ||
    order.shipping_phone ||
    ""
  );
}

function getShippingAddress(order) {
  const directAddress =
    order.address ||
    order.shipping_address ||
    order.customer_address;

  if (directAddress) {
    return directAddress;
  }

  const parts = [
    order.street,
    order.city,
    order.state,
    order.postal_code,
    order.zip_code,
    order.country,
  ].filter(Boolean);

  return parts.join(", ");
}

function OrderStatusSelect({
  order,
  updating,
  onStatusChange,
}) {
  const StatusIcon = getStatusIcon(order.status);
  const statusClassName = getStatusStyles(
    order.status
  );

  return (
    <div className="relative">
      <StatusIcon
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"
      />

      <select
        value={normalizeStatus(order.status)}
        onChange={(event) =>
          onStatusChange(
            order.id,
            event.target.value
          )
        }
        disabled={updating}
        className={`h-11 w-full appearance-none rounded-xl border py-2 pl-10 pr-10 text-sm font-bold outline-none transition focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-white/10 ${statusClassName}`}
      >
        {ORDER_STATUSES.map((status) => (
          <option
            key={status.value}
            value={status.value}
            className="bg-white text-black dark:bg-zinc-900 dark:text-white"
          >
            {status.label}
          </option>
        ))}
      </select>

      {updating ? (
        <LoaderCircle
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
        />
      ) : (
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        />
      )}
    </div>
  );
}

function OrderCard({
  order,
  updating,
  onStatusChange,
}) {
  const [expanded, setExpanded] = useState(false);

  const customerName = getCustomerName(order);
  const customerEmail = getCustomerEmail(order);
  const customerPhone = getCustomerPhone(order);
  const shippingAddress =
    getShippingAddress(order);

  const items = order.order_items ?? [];

  const totalQuantity = items.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const handleDownloadInvoice = () => {
    try {
      generateOrderInvoice(order);

      toast.success(
        `Invoice for order #${order.id} downloaded.`
      );
    } catch (error) {
      console.error(
        "Failed to generate invoice:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to generate invoice."
      );
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
              <ShoppingBag size={22} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-black">
                  Order #{order.id}
                </h2>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusStyles(
                    order.status
                  )}`}
                >
                  {normalizeStatus(order.status)}
                </span>

                {order.coupon_code &&
                  Number(order.discount || 0) > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
                      <Ticket size={13} />
                      {order.coupon_code}
                    </span>
                  )}
              </div>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[520px]">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Customer
              </p>

              <p className="mt-1 truncate font-bold">
                {customerName}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Items
              </p>

              <p className="mt-1 font-bold">
                {totalQuantity}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Total
              </p>

              <p className="mt-1 font-black">
                {formatCurrency(order.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-gray-200 pt-5 dark:border-zinc-800 lg:grid-cols-[1fr_240px_auto_auto] lg:items-end">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customerEmail && (
              <div className="flex min-w-0 items-center gap-3 text-sm">
                <Mail
                  size={17}
                  className="shrink-0 text-gray-400"
                />

                <span className="truncate">
                  {customerEmail}
                </span>
              </div>
            )}

            {customerPhone && (
              <div className="flex min-w-0 items-center gap-3 text-sm">
                <Phone
                  size={17}
                  className="shrink-0 text-gray-400"
                />

                <span className="truncate">
                  {customerPhone}
                </span>
              </div>
            )}

            {shippingAddress && (
              <div className="flex min-w-0 items-center gap-3 text-sm">
                <MapPin
                  size={17}
                  className="shrink-0 text-gray-400"
                />

                <span className="truncate">
                  {shippingAddress}
                </span>
              </div>
            )}
          </div>

          <OrderStatusSelect
            order={order}
            updating={updating}
            onStatusChange={onStatusChange}
          />

          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 font-bold transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <Download size={18} />
            Invoice
          </button>

          <button
            type="button"
            onClick={() =>
              setExpanded((current) => !current)
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 font-bold transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <Box size={18} />

            {expanded
              ? "Hide products"
              : "View products"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/60 sm:p-6">
          <h3 className="font-black">
            Order products
          </h3>

          {items.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-gray-400">
              No products found for this order.
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={
                            item.product_name ||
                            "Product"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package
                            size={26}
                            className="text-gray-400"
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">
                        {item.product_name ||
                          "Unnamed product"}
                      </p>

                      {item.product_id && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Product ID:{" "}
                          {item.product_id}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-5 text-sm sm:text-right">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Price
                        </p>

                        <p className="mt-1 font-bold">
                          {formatCurrency(
                            item.price
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Quantity
                        </p>

                        <p className="mt-1 font-bold">
                          {item.quantity}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Subtotal
                        </p>

                        <p className="mt-1 font-black">
                          {formatCurrency(
                            Number(item.price || 0) *
                              Number(
                                item.quantity || 0
                              )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <h4 className="font-black">
                    Payment summary
                  </h4>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span>

                      <span className="font-bold text-gray-950 dark:text-white">
                        {formatCurrency(order.subtotal)}
                      </span>
                    </div>

                    {order.coupon_code &&
                      Number(order.discount || 0) > 0 && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                          <div className="flex justify-between gap-4 text-green-700 dark:text-green-300">
                            <span className="flex min-w-0 items-center gap-2 font-bold">
                              <Ticket
                                size={16}
                                className="shrink-0"
                              />

                              <span className="truncate">
                                Coupon {order.coupon_code}
                              </span>
                            </span>

                            <span className="shrink-0 font-black">
                              -
                              {formatCurrency(
                                order.discount
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                    <div className="flex justify-between gap-4 text-gray-600 dark:text-gray-400">
                      <span>Shipping</span>

                      <span className="font-bold text-gray-950 dark:text-white">
                        {Number(order.shipping) === 0
                          ? "FREE"
                          : formatCurrency(
                              order.shipping
                            )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-lg font-black dark:border-zinc-800">
                      <span>Total</span>

                      <span>
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  const fetchOrders = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const { data, error } = await supabase
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
          });

        if (error) {
          throw error;
        }

        setOrders(data ?? []);

        if (silent) {
          toast.success("Orders updated.");
        }
      } catch (error) {
        console.error(
          "Failed to load admin orders:",
          error
        );

        toast.error(
          error.message ||
            "Failed to load orders."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    const currentOrder = orders.find(
      (order) =>
        String(order.id) === String(orderId)
    );

    if (!currentOrder) {
      toast.error("Order not found.");
      return;
    }

    const previousStatus = normalizeStatus(
      currentOrder.status
    );

    if (previousStatus === newStatus) {
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq("id", orderId)
        .select("id, status")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Supabase did not update this order. Check the orders UPDATE policy and your admin role."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          String(order.id) === String(orderId)
            ? {
                ...order,
                status: data.status,
              }
            : order
        )
      );

      toast.success(
        `Order #${orderId} changed to ${data.status}.`
      );
    } catch (error) {
      console.error(
        "Order status update error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const cleanSearch = searchTerm
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const normalizedStatus = normalizeStatus(
        order.status
      );

      const matchesStatus =
        statusFilter === "all" ||
        normalizedStatus === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!cleanSearch) {
        return true;
      }

      const searchableValues = [
        order.id,
        getCustomerName(order),
        getCustomerEmail(order),
        getCustomerPhone(order),
        getShippingAddress(order),
        order.coupon_code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableValues.includes(
        cleanSearch
      );
    });
  }, [orders, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          normalizeStatus(order.status) ===
          "pending"
      ).length,

      processing: orders.filter(
        (order) =>
          normalizeStatus(order.status) ===
          "processing"
      ).length,

      shipped: orders.filter(
        (order) =>
          normalizeStatus(order.status) ===
          "shipped"
      ).length,

      delivered: orders.filter(
        (order) =>
          normalizeStatus(order.status) ===
          "delivered"
      ).length,

      revenue: orders.reduce(
        (total, order) =>
          total + Number(order.total || 0),
        0
      ),
    };
  }, [orders]);

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
              Loading orders...
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
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-black dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft size={17} />
              Back to dashboard
            </Link>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Order management
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              View customer orders, inspect products
              and update delivery status.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchOrders({
                silent: true,
              })
            }
            disabled={refreshing}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-5 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <RefreshCw
              size={18}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh orders"}
          </button>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <ShoppingBag className="text-gray-400" />

            <p className="mt-4 text-2xl font-black">
              {statistics.total}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              All orders
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Clock3 className="text-yellow-500" />

            <p className="mt-4 text-2xl font-black">
              {statistics.pending}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pending
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Package className="text-blue-500" />

            <p className="mt-4 text-2xl font-black">
              {statistics.processing}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Processing
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Truck className="text-purple-500" />

            <p className="mt-4 text-2xl font-black">
              {statistics.shipped}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Shipped
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Check className="text-green-500" />

            <p className="mt-4 text-2xl font-black">
              {statistics.delivered}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Delivered
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <CircleDollarSign className="text-green-500" />

            <p className="mt-4 truncate text-2xl font-black">
              {formatCurrency(
                statistics.revenue
              )}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Revenue
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search order number, customer, email or phone..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              />
            </label>

            <label className="relative block">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-11 font-semibold outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              >
                <option value="all">
                  All statuses
                </option>

                {ORDER_STATUSES.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
            <p>
              Showing{" "}
              <strong className="text-black dark:text-white">
                {filteredOrders.length}
              </strong>{" "}
              of{" "}
              <strong className="text-black dark:text-white">
                {orders.length}
              </strong>{" "}
              orders
            </p>

            {(searchTerm ||
              statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="font-bold text-black hover:underline dark:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-5">
          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <ShoppingBag
                size={48}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-5 text-xl font-black">
                No orders found
              </h2>

              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Try changing your search or status
                filter.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                updating={
                  String(updatingOrderId) ===
                  String(order.id)
                }
                onStatusChange={
                  handleStatusChange
                }
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}