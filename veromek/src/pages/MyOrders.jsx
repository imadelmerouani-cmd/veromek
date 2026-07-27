import { useEffect, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Download,
  LoaderCircle,
  Package,
  ShoppingBag,
  Ticket,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { generateOrderInvoice } from "../utils/generateInvoice";

export default function MyOrders() {
  const { user, authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] =
    useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setOrdersLoading(true);

      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              id,
              product_id,
              product_name,
              price,
              quantity,
              image
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        setOrders(data || []);
      } catch (error) {
        console.error("Failed to load orders:", error);

        toast.error(
          error?.message ||
            "Failed to load your orders."
        );
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading]);

  const formatPrice = (value) => {
    return Number(value || 0).toFixed(2);
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const handleDownloadInvoice = (order) => {
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

  if (authLoading || ordersLoading) {
    return (
      <Layout>
        <section className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="text-center">
            <LoaderCircle
              className="mx-auto animate-spin text-gray-600 dark:text-gray-300"
              size={40}
            />

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading your orders...
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <section className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Package
              className="mx-auto mb-5 text-gray-500"
              size={50}
            />

            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
              Login Required
            </h1>

            <p className="mb-8 text-gray-600 dark:text-gray-400">
              Log in to view your previous orders.
            </p>

            <Link
              to="/login"
              state={{
                from: "/orders",
              }}
              className="inline-flex rounded-xl bg-black px-7 py-3 font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Login
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Account
            </p>

            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
              My Orders
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            {orders.length}{" "}
            {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <ShoppingBag
              className="mx-auto mb-5 text-gray-400"
              size={56}
            />

            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              No Orders Yet
            </h2>

            <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-400">
              Products you order will appear here.
            </p>

            <Link
              to="/shop"
              className="inline-flex rounded-xl bg-black px-7 py-3 font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="grid gap-5 border-b border-gray-200 bg-gray-50 p-6 md:grid-cols-4 dark:border-gray-800 dark:bg-gray-950">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Order
                    </p>

                    <p className="font-bold text-gray-900 dark:text-white">
                      #{order.id}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <CalendarDays size={14} />
                      Placed On
                    </p>

                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <CreditCard size={14} />
                      Payment
                    </p>

                    <p className="capitalize font-medium text-gray-900 dark:text-white">
                      {order.payment_method ||
                        "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </p>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : order.status === "processing"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : order.status === "shipped"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {order.status}
                    </span>

                    <p className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
                      ${formatPrice(order.total)}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadInvoice(
                          order
                        )
                      }
                      className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-900 transition hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                    >
                      <Download size={16} />
                      Download Invoice
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
                    Order Items
                  </h2>

                  <div className="space-y-4">
                    {(order.order_items || []).map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-5 rounded-2xl border border-gray-200 p-4 dark:border-gray-800"
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.product_name}
                                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                                <Package
                                  size={25}
                                  className="text-gray-500"
                                />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900 dark:text-white">
                                {item.product_name}
                              </p>

                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>

                          <p className="shrink-0 font-bold text-gray-900 dark:text-white">
                            $
                            {formatPrice(
                              Number(item.price) *
                                item.quantity
                            )}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-6 grid gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 dark:border-gray-800">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                        <Truck size={19} />
                        Shipping Address
                      </h3>

                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          {order.first_name}{" "}
                          {order.last_name}
                        </p>

                        <p>{order.address}</p>

                        <p>
                          {order.city}, {order.country}
                        </p>

                        <p>{order.phone}</p>

                        <p>{order.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3 md:ml-auto md:w-full md:max-w-xs">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal</span>

                        <span>
                          ${formatPrice(order.subtotal)}
                        </span>
                      </div>

                      {order.coupon_code &&
                        Number(order.discount || 0) > 0 && (
                          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex min-w-0 items-center gap-2 font-semibold text-green-700 dark:text-green-300">
                                <Ticket
                                  size={17}
                                  className="shrink-0"
                                />

                                <span className="truncate">
                                  Coupon {order.coupon_code}
                                </span>
                              </span>

                              <span className="shrink-0 font-bold text-green-700 dark:text-green-300">
                                -${formatPrice(order.discount)}
                              </span>
                            </div>
                          </div>
                        )}

                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Shipping</span>

                        <span>
                          {Number(order.shipping) === 0
                            ? "FREE"
                            : `$${formatPrice(
                                order.shipping
                              )}`}
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-gray-200 pt-3 text-xl font-bold text-gray-900 dark:border-gray-800 dark:text-white">
                        <span>Total</span>

                        <span>
                          ${formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}