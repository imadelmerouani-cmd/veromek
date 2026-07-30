import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Truck,
  X,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function normalizeCouponCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function calculateCouponDiscount(
  coupon,
  subtotal
) {
  if (!coupon) {
    return 0;
  }

  const safeSubtotal = Math.max(
    0,
    Number(subtotal || 0)
  );

  const couponValue = Math.max(
    0,
    Number(coupon.value || 0)
  );

  let discount = 0;

  if (coupon.type === "percentage") {
    discount =
      safeSubtotal *
      (couponValue / 100);
  } else if (coupon.type === "fixed") {
    discount = couponValue;
  }

  return Math.min(
    safeSubtotal,
    Math.max(
      0,
      Math.round(
        (discount +
          Number.EPSILON) *
          100
      ) / 100
    )
  );
}

function getCouponError(
  coupon,
  subtotal
) {
  if (!coupon) {
    return "Coupon code is invalid.";
  }

  if (coupon.active !== true) {
    return "This coupon is currently inactive.";
  }

  if (
    coupon.expires_at &&
    new Date(coupon.expires_at).getTime() <=
      Date.now()
  ) {
    return "This coupon has expired.";
  }

  if (
    coupon.max_uses !== null &&
    coupon.max_uses !== undefined &&
    Number(coupon.used_count || 0) >=
      Number(coupon.max_uses)
  ) {
    return "This coupon has reached its usage limit.";
  }

  const minimumOrder = Math.max(
    0,
    Number(coupon.minimum_order || 0)
  );

  if (
    Number(subtotal || 0) <
    minimumOrder
  ) {
    return `This coupon requires a minimum order of ${formatCurrency(
      minimumOrder
    )}.`;
  }

  if (
    coupon.type !== "percentage" &&
    coupon.type !== "fixed"
  ) {
    return "This coupon has an invalid discount type.";
  }

  if (
    !Number.isFinite(
      Number(coupon.value)
    ) ||
    Number(coupon.value) <= 0
  ) {
    return "This coupon has an invalid discount value.";
  }

  return "";
}

export default function Checkout() {
  const navigate = useNavigate();

  const { cart, clearCart } = useCart();

  const {
    user,
    profile,
    authLoading,
  } = useAuth();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState(null);

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    payment: "stripe",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const profileName =
      profile?.full_name?.trim() || "";

    const nameParts =
      profileName.split(/\s+/);

    setForm((currentForm) => ({
      ...currentForm,

      firstName:
        currentForm.firstName ||
        user.user_metadata?.first_name ||
        nameParts[0] ||
        "",

      lastName:
        currentForm.lastName ||
        user.user_metadata?.last_name ||
        nameParts.slice(1).join(" ") ||
        "",

      email:
        currentForm.email ||
        user.email ||
        "",
    }));
  }, [user, profile]);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
            Number(
              item.quantity || 0
            ),
        0
      ),
    [cart]
  );

  const shipping =
    cart.length === 0 ||
    subtotal > 150
      ? 0
      : 15;

  const discount = useMemo(
    () =>
      calculateCouponDiscount(
        appliedCoupon,
        subtotal
      ),
    [appliedCoupon, subtotal]
  );

  const total = Math.max(
    0,
    subtotal - discount + shipping
  );

  useEffect(() => {
    if (!appliedCoupon) {
      return;
    }

    const couponError = getCouponError(
      appliedCoupon,
      subtotal
    );

    if (couponError) {
      setAppliedCoupon(null);

      toast.error(
        "The applied coupon is no longer valid for this cart."
      );
    }
  }, [appliedCoupon, subtotal]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleApplyCoupon = async () => {
    if (couponLoading) {
      return;
    }

    const cleanCode =
      normalizeCouponCode(couponCode);

    if (!cleanCode) {
      toast.error(
        "Please enter a coupon code."
      );

      return;
    }

    if (subtotal <= 0) {
      toast.error(
        "Add products to your cart before applying a coupon."
      );

      return;
    }

    setCouponLoading(true);

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select(
          `
            id,
            code,
            type,
            value,
            minimum_order,
            max_uses,
            used_count,
            expires_at,
            active
          `
        )
        .ilike("code", cleanCode)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const couponError = getCouponError(
        data,
        subtotal
      );

      if (couponError) {
        throw new Error(couponError);
      }

      const normalizedCoupon = {
        ...data,
        code: normalizeCouponCode(
          data.code
        ),
        value: Number(
          data.value || 0
        ),
        minimum_order: Number(
          data.minimum_order || 0
        ),
        used_count: Number(
          data.used_count || 0
        ),
        max_uses:
          data.max_uses === null ||
          data.max_uses === undefined
            ? null
            : Number(data.max_uses),
      };

      setAppliedCoupon(
        normalizedCoupon
      );

      setCouponCode(
        normalizedCoupon.code
      );

      toast.success(
        `Coupon ${normalizedCoupon.code} applied.`
      );
    } catch (error) {
      console.error(
        "Failed to apply coupon:",
        error
      );

      setAppliedCoupon(null);

      toast.error(
        error?.message ||
          "Failed to apply coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    if (!appliedCoupon) {
      return;
    }

    setAppliedCoupon(null);
    setCouponCode("");

    toast.success(
      "Coupon removed."
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!user) {
      toast.error(
        "You need to log in before placing an order."
      );

      navigate("/login", {
        state: {
          from: "/checkout",
        },
      });

      return;
    }

    if (cart.length === 0) {
      toast.error(
        "Your cart is empty."
      );

      return;
    }

    const invalidCartItem =
      cart.find(
        (item) =>
          !Number.isFinite(
            Number(item.id)
          ) ||
          Number(item.quantity) <= 0
      );

    if (invalidCartItem) {
      toast.error(
        "Your cart contains an invalid product."
      );

      return;
    }

    if (appliedCoupon) {
      const couponError = getCouponError(
        appliedCoupon,
        subtotal
      );

      if (couponError) {
        setAppliedCoupon(null);
        toast.error(couponError);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const rpcItems = cart.map(
        (item) => ({
          product_id: Number(item.id),

          variant_id:
            item.variant_id === null ||
            item.variant_id === undefined
              ? null
              : Number(item.variant_id),

          quantity: Number(
            item.quantity
          ),
        })
      );

      const { data, error } =
        await supabase.rpc(
          "place_order_with_stock",
          {
            p_first_name:
              form.firstName.trim(),

            p_last_name:
              form.lastName.trim(),

            p_email:
              form.email.trim(),

            p_phone:
              form.phone.trim(),

            p_address:
              form.address.trim(),

            p_city:
              form.city.trim(),

            p_country:
              form.country.trim(),

            p_payment_method:
              form.payment,

            p_items: rpcItems,

            p_coupon_code:
              appliedCoupon?.code ||
              null,
          }
        );

      if (error) {
        throw error;
      }

      const result =
        Array.isArray(data)
          ? data[0]
          : data;

      if (!result?.order_id) {
        throw new Error(
          "The order could not be created."
        );
      }

      clearCart();

      setAppliedCoupon(null);
      setCouponCode("");

      toast.success(
        `Order #${result.order_id} was placed successfully.`
      );

      navigate("/orders", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Failed to place order:",
        error
      );

      const message =
        error?.message ||
        "Something went wrong while placing your order.";

      if (
        String(message)
          .toLowerCase()
          .includes("coupon")
      ) {
        setAppliedCoupon(null);
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <section className="flex min-h-[60vh] items-center justify-center px-6">
          <LoaderCircle
            className="animate-spin text-gray-600 dark:text-gray-300"
            size={38}
          />
        </section>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <section className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <ShoppingBag
              className="mx-auto text-gray-400"
              size={48}
            />

            <h1 className="mt-5 text-3xl font-black">
              Login Required
            </h1>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Log in before completing your order.
            </p>

            <Link
              to="/login"
              state={{
                from: "/checkout",
              }}
              className="mt-7 inline-flex rounded-xl bg-black px-7 py-3 font-semibold text-white dark:bg-white dark:text-black"
            >
              Login to Continue
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  if (cart.length === 0) {
    return (
      <Layout>
        <section className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <ShoppingBag
              className="mx-auto text-gray-400"
              size={48}
            />

            <h1 className="mt-5 text-3xl font-black">
              Your Cart Is Empty
            </h1>

            <Link
              to="/shop"
              className="mt-7 inline-flex rounded-xl bg-black px-7 py-3 font-semibold text-white dark:bg-white dark:text-black"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Prices, stock and coupons will be
            verified again when you place the
            order.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="space-y-6 lg:col-span-2"
          >
            <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-2xl font-black">
                Shipping Information
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <input
                  required
                  autoComplete="given-name"
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="rounded-xl border border-gray-300 bg-white p-4 outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-white"
                />

                <input
                  required
                  autoComplete="family-name"
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="rounded-xl border border-gray-300 bg-white p-4 outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-white"
                />

                <input
                  required
                  type="email"
                  autoComplete="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="rounded-xl border border-gray-300 bg-white p-4 outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-white"
                />

                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="rounded-xl border border-gray-300 bg-white p-4 outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-white"
                />

                <input
                  required
                  autoComplete="address-level2"
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="rounded-xl border border-gray-300 bg-white p-4 outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-white"
                />

                <input
                  required
                  autoComplete="country-name"
                  name="country"
                  placeholder="Country"
                  value={form.country}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="rounded-xl border border-gray-300 bg-white p-4 outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-white"
                />

                <textarea
                  required
                  rows="4"
                  autoComplete="street-address"
                  name="address"
                  placeholder="Full Address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="resize-none rounded-xl border border-gray-300 bg-white p-4 outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-white"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <Ticket size={24} />

                <div>
                  <h2 className="text-2xl font-black">
                    Coupon Code
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Apply one discount code to
                    this order.
                  </p>
                </div>
              </div>

              {appliedCoupon ? (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={22}
                        className="mt-0.5 shrink-0 text-green-600 dark:text-green-300"
                      />

                      <div>
                        <p className="font-black text-green-700 dark:text-green-300">
                          {appliedCoupon.code}
                        </p>

                        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                          {appliedCoupon.type ===
                          "percentage"
                            ? `${appliedCoupon.value}% discount`
                            : `${formatCurrency(
                                appliedCoupon.value
                              )} discount`}
                        </p>

                        <p className="mt-1 text-sm font-bold text-green-700 dark:text-green-300">
                          You save{" "}
                          {formatCurrency(
                            discount
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleRemoveCoupon
                      }
                      disabled={isSubmitting}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-green-300 px-4 text-sm font-bold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/50"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Ticket
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={couponCode}
                      onChange={(event) =>
                        setCouponCode(
                          event.target.value.toUpperCase()
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          event.preventDefault();

                          handleApplyCoupon();
                        }
                      }}
                      disabled={
                        couponLoading ||
                        isSubmitting
                      }
                      placeholder="WELCOME10"
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 font-bold uppercase outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleApplyCoupon
                    }
                    disabled={
                      couponLoading ||
                      isSubmitting
                    }
                    className="inline-flex h-12 min-w-32 items-center justify-center gap-2 rounded-xl bg-black px-5 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    {couponLoading ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        Checking...
                      </>
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-2xl font-black">
                Payment Method
              </h2>

              <div className="mt-6 space-y-4">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                    form.payment === "stripe"
                      ? "border-black bg-gray-50 dark:border-white dark:bg-gray-800"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={
                      form.payment ===
                      "stripe"
                    }
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />

                  <CreditCard size={22} />
                  Stripe
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                    form.payment === "paypal"
                      ? "border-black bg-gray-50 dark:border-white dark:bg-gray-800"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={
                      form.payment ===
                      "paypal"
                    }
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />

                  <CreditCard size={22} />
                  PayPal
                </label>
              </div>

              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Payment is not charged yet. This
                step currently creates the order
                and reserves its stock.
              </p>
            </div>
          </form>

          <aside className="h-fit rounded-3xl border border-gray-200 bg-white p-6 lg:sticky lg:top-24 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-2xl font-black">
              Order Summary
            </h2>

            <div className="mt-6 max-h-80 space-y-4 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={
                    item.cart_key ||
                    item.variant_id ||
                    item.id
                  }
                  className="flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {item.name}
                    </p>

                    {(item.size ||
                      item.color) && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {item.size
                          ? `Size: ${item.size}`
                          : ""}

                        {item.size &&
                        item.color &&
                        item.color !==
                          "Default"
                          ? " · "
                          : ""}

                        {item.color &&
                        item.color !==
                          "Default"
                          ? `Color: ${item.color}`
                          : ""}
                      </p>
                    )}

                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <span className="shrink-0 font-bold">
                    {formatCurrency(
                      Number(
                        item.price || 0
                      ) *
                        Number(
                          item.quantity || 0
                        )
                    )}
                  </span>
                </div>
              ))}
            </div>

            <hr className="my-6 border-gray-200 dark:border-gray-700" />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-bold">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {appliedCoupon &&
                discount > 0 && (
                  <div className="flex justify-between gap-4 text-green-600 dark:text-green-400">
                    <span className="flex min-w-0 items-center gap-2">
                      <Ticket
                        size={18}
                        className="shrink-0"
                      />

                      <span className="truncate">
                        Discount (
                        {appliedCoupon.code})
                      </span>
                    </span>

                    <span className="shrink-0 font-bold">
                      -
                      {formatCurrency(
                        discount
                      )}
                    </span>
                  </div>
                )}

              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-gray-500">
                  <Truck size={18} />
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

              <hr className="border-gray-200 dark:border-gray-700" />

              <div className="flex justify-between text-2xl font-black">
                <span>Total</span>

                <span>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
              <ShieldCheck
                size={19}
                className="shrink-0"
              />

              <p>
                Prices, stock and coupon validity
                are checked securely by the
                database.
              </p>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={
                isSubmitting ||
                couponLoading
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    className="animate-spin"
                    size={21}
                  />
                  Placing Order...
                </>
              ) : (
                <>
                  <CreditCard size={21} />
                  Place Order
                </>
              )}
            </button>
          </aside>
        </div>
      </section>
    </Layout>
  );
}