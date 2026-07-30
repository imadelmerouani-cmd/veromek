import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  LoaderCircle,
  Minus,
  PackageX,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

export default function Cart() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    syncCartStock,
  } = useCart();

  const [stockLoading, setStockLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const refreshCartStock = useCallback(
    async ({ silent = false } = {}) => {
      if (cart.length === 0) {
        setStockLoading(false);
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setStockLoading(true);
      }

      try {
        const productIds = [
          ...new Set(
            cart
              .map((item) =>
                Number(item.id)
              )
              .filter(Number.isFinite)
          ),
        ];

        const variantIds = [
          ...new Set(
            cart
              .map((item) =>
                Number(
                  item.variant_id
                )
              )
              .filter(Number.isFinite)
          ),
        ];

        const productRequest =
          supabase
            .from("products")
            .select(
              `
                id,
                name,
                category,
                price,
                image,
                images,
                description,
                rating,
                reviews,
                stock,
                active
              `
            )
            .in("id", productIds);

        const variantRequest =
          variantIds.length > 0
            ? supabase
                .from(
                  "product_variants"
                )
                .select(
                  `
                    id,
                    product_id,
                    size,
                    color,
                    stock,
                    sku,
                    is_active
                  `
                )
                .in("id", variantIds)
            : Promise.resolve({
                data: [],
                error: null,
              });

        const [
          productResponse,
          variantResponse,
        ] = await Promise.all([
          productRequest,
          variantRequest,
        ]);

        if (productResponse.error) {
          throw productResponse.error;
        }

        if (variantResponse.error) {
          throw variantResponse.error;
        }

        syncCartStock(
          productResponse.data ?? [],
          variantResponse.data ?? []
        );

        if (silent) {
          toast.success(
            "Cart stock updated."
          );
        }
      } catch (error) {
        console.error(
          "Failed to refresh cart stock:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to check product stock."
        );
      } finally {
        setStockLoading(false);
        setRefreshing(false);
      }
    },
    [cart.length, syncCartStock]
  );

  useEffect(() => {
    refreshCartStock();
  }, [refreshCartStock]);

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const shipping =
    cart.length === 0 ||
    subtotal > 150
      ? 0
      : 15;

  const total = subtotal + shipping;

  const hasUnavailableItems =
    cart.some(
      (item) =>
        item.active === false ||
        Number(item.stock || 0) <= 0 ||
        Number(item.quantity || 0) >
          Number(item.stock || 0)
    );

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Shopping Cart
            </h1>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Review your items before checkout.
            </p>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={() =>
                refreshCartStock({
                  silent: true,
                })
              }
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 font-bold transition hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh stock
            </button>
          )}
        </div>

        {stockLoading &&
        cart.length > 0 ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={42}
                className="mx-auto animate-spin"
              />

              <p className="mt-4 font-semibold text-gray-500">
                Checking stock...
              </p>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <ShoppingBag
              size={50}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-5 text-2xl font-black">
              Your cart is empty
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Add some products to start shopping.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {cart.map((item) => {
                const stock = Math.max(
                  0,
                  Number(item.stock || 0)
                );

                const outOfStock =
                  item.active === false ||
                  stock <= 0;

                const atMaximum =
                  item.quantity >= stock;

                return (
                  <article
                    key={
                      item.cart_key ||
                      item.variant_id ||
                      item.id
                    }
                    className={`rounded-3xl border bg-white p-5 dark:bg-zinc-900 ${
                      outOfStock
                        ? "border-red-300 dark:border-red-900"
                        : "border-gray-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-800">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className={`h-full w-full object-cover ${
                              outOfStock
                                ? "opacity-60 grayscale"
                                : ""
                            }`}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <PackageX
                              size={34}
                              className="text-gray-400"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold uppercase tracking-wide text-gray-400">
                          {item.category}
                        </p>

                        <Link
                          to={`/product/${item.id}`}
                          className="mt-1 block truncate text-xl font-black hover:underline"
                        >
                          {item.name}
                        </Link>

                        {(item.size ||
                          item.color) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.size && (
                              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-bold dark:border-zinc-700 dark:bg-zinc-800">
                                Size: {item.size}
                              </span>
                            )}

                            {item.color &&
                              item.color !==
                                "Default" && (
                                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-bold dark:border-zinc-700 dark:bg-zinc-800">
                                  Color:{" "}
                                  {item.color}
                                </span>
                              )}
                          </div>
                        )}

                        <p className="mt-3 text-xl font-black">
                          {formatCurrency(
                            item.price
                          )}
                        </p>

                        <p
                          className={`mt-3 text-sm font-bold ${
                            outOfStock
                              ? "text-red-600"
                              : stock <= 5
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {outOfStock
                            ? "Out of stock"
                            : `${stock} available`}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.cart_key ||
                                  item.variant_id ||
                                  item.id
                              )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={17} />
                          </button>

                          <span className="w-9 text-center text-lg font-black">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.cart_key ||
                                  item.variant_id ||
                                  item.id
                              )
                            }
                            disabled={
                              outOfStock ||
                              atMaximum
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={17} />
                          </button>
                        </div>

                        {atMaximum &&
                          !outOfStock && (
                            <p className="mt-2 text-xs font-bold text-yellow-600 dark:text-yellow-400">
                              Maximum reached
                            </p>
                          )}

                        <p className="mt-4 text-lg font-black">
                          {formatCurrency(
                            Number(
                              item.price || 0
                            ) *
                              Number(
                                item.quantity ||
                                  0
                              )
                          )}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.cart_key ||
                                item.variant_id ||
                                item.id
                            )
                          }
                          className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:underline"
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-3xl border border-gray-200 bg-white p-6 lg:sticky lg:top-28 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-2xl font-black">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-bold">
                    {formatCurrency(
                      subtotal
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-bold">
                    {shipping === 0
                      ? "FREE"
                      : formatCurrency(
                          shipping
                        )}
                  </span>
                </div>

                <hr className="border-gray-200 dark:border-zinc-700" />

                <div className="flex justify-between text-2xl font-black">
                  <span>Total</span>

                  <span>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {hasUnavailableItems && (
                <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  Remove unavailable products before
                  checkout.
                </div>
              )}

              {hasUnavailableItems ? (
                <button
                  type="button"
                  disabled
                  className="mt-7 block w-full cursor-not-allowed rounded-xl bg-gray-300 py-4 text-center text-lg font-semibold text-gray-500 dark:bg-zinc-700 dark:text-zinc-400"
                >
                  Checkout unavailable
                </button>
              ) : (
                <Link
                  to="/checkout"
                  className="mt-7 block w-full rounded-xl bg-black py-4 text-center text-lg font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Proceed to Checkout
                </Link>
              )}
            </aside>
          </div>
        )}
      </section>
    </Layout>
  );
}