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
  Gift,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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

  const [upsellProducts, setUpsellProducts] =
    useState([]);
  const [upsellLoading, setUpsellLoading] =
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
          toast.success(t("cart.stockUpdated"));
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


  useEffect(() => {
    let mounted = true;

    const fetchUpsellProducts = async () => {
      if (cart.length === 0) {
        if (mounted) {
          setUpsellProducts([]);
        }
        return;
      }

      const sourceProductId = Number(
        cart[0]?.id
      );

      if (!Number.isFinite(sourceProductId)) {
        if (mounted) {
          setUpsellProducts([]);
        }
        return;
      }

      setUpsellLoading(true);

      try {
        const {
          data: recommendationRows,
          error: recommendationError,
        } = await supabase
          .from("product_recommendations")
          .select(
            "recommended_product_id, sort_order"
          )
          .eq("product_id", sourceProductId)
          .order("sort_order", {
            ascending: true,
          })
          .limit(3);

        if (recommendationError) {
          throw recommendationError;
        }

        const cartProductIds = new Set(
          cart.map((item) =>
            String(item.id)
          )
        );

        const recommendationIds = (
          recommendationRows ?? []
        )
          .map((row) =>
            String(row.recommended_product_id)
          )
          .filter(
            (productId) =>
              productId &&
              !cartProductIds.has(productId)
          );

        if (recommendationIds.length === 0) {
          if (mounted) {
            setUpsellProducts([]);
          }
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select(
            `
              id,
              name,
              category,
              price,
              image,
              stock,
              active
            `
          )
          .in("id", recommendationIds)
          .eq("active", true);

        if (error) {
          throw error;
        }

        const productMap = new Map(
          (data ?? []).map((item) => [
            String(item.id),
            {
              ...item,
              price: Number(item.price || 0),
              stock: Math.max(
                0,
                Number(item.stock || 0)
              ),
            },
          ])
        );

        const orderedProducts =
          recommendationIds
            .map((productId) =>
              productMap.get(productId)
            )
            .filter(
              (item) =>
                item &&
                item.stock > 0
            );

        if (mounted) {
          setUpsellProducts(
            orderedProducts
          );
        }
      } catch (error) {
        console.error(
          "Failed to load cart recommendations:",
          error
        );

        if (mounted) {
          setUpsellProducts([]);
        }
      } finally {
        if (mounted) {
          setUpsellLoading(false);
        }
      }
    };

    fetchUpsellProducts();

    return () => {
      mounted = false;
    };
  }, [cart]);

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

  const freeShippingThreshold = 150;
  const freeShippingRemaining = Math.max(
    0,
    freeShippingThreshold - subtotal
  );
  const freeShippingProgress = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );

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
              {t("cart.title")}
            </h1>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              {t("cart.subtitle")}
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

              {t("cart.refreshStock")}
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
                {t("cart.checkingStock")}
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
              {t("cart.emptyTitle")}
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              {t("cart.emptyText")}
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black"
            >
              {t("cart.continueShopping")}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
                <Gift size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-black">
                  {freeShippingRemaining > 0
                    ? t("cart.addMore", {
                        amount: formatCurrency(
                          freeShippingRemaining
                        ),
                      })
                    : t("cart.freeUnlocked")}
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("cart.freeInfo", {
                    amount: formatCurrency(
                      freeShippingThreshold
                    ),
                  })}
                </p>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-500 dark:bg-white"
                    style={{
                      width: `${freeShippingProgress}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-right text-xs font-black text-gray-500 dark:text-gray-400">
                  {Math.round(
                    freeShippingProgress
                  )}
                  %
                </p>
              </div>
            </div>
          </div>

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
                                {t("cart.size", {
                                  size: item.size,
                                })}
                              </span>
                            )}

                            {item.color &&
                              item.color !==
                                "Default" && (
                                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-bold dark:border-zinc-700 dark:bg-zinc-800">
                                  {t("cart.color", {
                                    color: item.color,
                                  })}
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
                            ? t("cart.outOfStock")
                            : t("cart.available", {
                                count: stock,
                              })}
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
                            aria-label={t("cart.decrease", { name: item.name })}
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
                            aria-label={t("cart.increase", { name: item.name })}
                          >
                            <Plus size={17} />
                          </button>
                        </div>

                        {atMaximum &&
                          !outOfStock && (
                            <p className="mt-2 text-xs font-bold text-yellow-600 dark:text-yellow-400">
                              {t("cart.maximumReached")}
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
                          {t("cart.remove")}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-3xl border border-gray-200 bg-white p-6 lg:sticky lg:top-28 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-2xl font-black">
                {t("cart.summary")}
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {t("cart.subtotal")}
                  </span>

                  <span className="font-bold">
                    {formatCurrency(
                      subtotal
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {t("cart.shipping")}
                  </span>

                  <span className="font-bold">
                    {shipping === 0
                      ? t("cart.free")
                      : formatCurrency(
                          shipping
                        )}
                  </span>
                </div>

                <hr className="border-gray-200 dark:border-zinc-700" />

                <div className="flex justify-between text-2xl font-black">
                  <span>{t("cart.total")}</span>

                  <span>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="flex items-start gap-3">
                  <Truck
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-black">
                      {t("cart.deliveryTitle")}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {t("cart.deliveryText")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 dark:border-zinc-700">
                  <ShieldCheck size={20} />
                  <span className="text-sm font-black">
                    {t("cart.secureCheckout")}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 dark:border-zinc-700">
                  <RotateCcw size={20} />
                  <span className="text-sm font-black">
                    {t("cart.returnsPolicy")}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 dark:border-zinc-700">
                  <Headphones size={20} />
                  <span className="text-sm font-black">
                    {t("cart.support")}
                  </span>
                </div>
              </div>

              {hasUnavailableItems && (
                <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  {t("cart.removeUnavailable")}
                </div>
              )}

              {hasUnavailableItems ? (
                <button
                  type="button"
                  disabled
                  className="mt-7 block w-full cursor-not-allowed rounded-xl bg-gray-300 py-4 text-center text-lg font-semibold text-gray-500 dark:bg-zinc-700 dark:text-zinc-400"
                >
                  {t("cart.checkoutUnavailable")}
                </button>
              ) : (
                <Link
                  to="/checkout"
                  className="mt-7 block w-full rounded-xl bg-black py-4 text-center text-lg font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {t("cart.proceed")}
                </Link>
              )}

              <div className="mt-5 rounded-2xl bg-gray-50 p-4 dark:bg-zinc-800">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} />

                  <div>
                    <p className="text-sm font-black">
                      {t("cart.securePayment")}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {t("cart.paymentText")}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
          </>
        )}

        {cart.length > 0 &&
          (upsellLoading ||
            upsellProducts.length > 0) && (
            <section className="mt-16 border-t border-gray-200 pt-14 dark:border-zinc-800">
              <div className="mb-8">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  {t("cart.completeOrder")}
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  {t("cart.recommended")}
                </h2>

                <p className="mt-3 text-gray-500 dark:text-gray-400">
                  {t("cart.recommendText")}
                </p>
              </div>

              {upsellLoading ? (
                <div className="flex min-h-48 items-center justify-center rounded-3xl border border-gray-200 dark:border-zinc-800">
                  <LoaderCircle
                    size={36}
                    className="animate-spin"
                  />
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {upsellProducts.map(
                    (upsellProduct) => (
                      <article
                        key={upsellProduct.id}
                        className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <img
                          src={upsellProduct.image}
                          alt={upsellProduct.name}
                          className="h-52 w-full bg-gray-100 object-cover dark:bg-zinc-800"
                        />

                        <div className="p-5">
                          <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                            {upsellProduct.category}
                          </p>

                          <h3 className="mt-2 text-xl font-black">
                            {upsellProduct.name}
                          </h3>

                          <p className="mt-3 text-2xl font-black">
                            {formatCurrency(
                              upsellProduct.price
                            )}
                          </p>

                          <Link
                            to={`/product/${upsellProduct.id}`}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-black text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                          >
                            {t("cart.chooseOptions")}
                            <ArrowRight size={17} />
                          </Link>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          )}
      </section>
    </Layout>
  );
}