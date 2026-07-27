import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  LoaderCircle,
  Percent,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Ticket,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/layout/Navbar";
import { supabase } from "../lib/supabase";

const EMPTY_FORM = {
  code: "",
  type: "percentage",
  value: "",
  minimum_order: "0",
  max_uses: "",
  expires_at: "",
  active: true,
};

const TYPE_OPTIONS = [
  {
    value: "percentage",
    label: "Percentage",
  },
  {
    value: "fixed",
    label: "Fixed amount",
  },
];

const STATUS_FILTERS = [
  {
    value: "all",
    label: "All statuses",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
  {
    value: "expired",
    label: "Expired",
  },
  {
    value: "exhausted",
    label: "Usage limit reached",
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
    return "No expiration";
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

function toDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function normalizeCoupon(coupon) {
  return {
    ...coupon,
    code: String(coupon.code || "").toUpperCase(),
    type:
      coupon.type === "fixed"
        ? "fixed"
        : "percentage",
    value: Number(coupon.value || 0),
    minimum_order: Number(
      coupon.minimum_order || 0
    ),
    max_uses:
      coupon.max_uses === null ||
      coupon.max_uses === undefined
        ? null
        : Number(coupon.max_uses),
    used_count: Number(
      coupon.used_count || 0
    ),
    active: coupon.active !== false,
  };
}

function isExpired(coupon) {
  if (!coupon.expires_at) {
    return false;
  }

  const expiration = new Date(
    coupon.expires_at
  ).getTime();

  return (
    Number.isFinite(expiration) &&
    expiration <= Date.now()
  );
}

function isExhausted(coupon) {
  return (
    coupon.max_uses !== null &&
    Number(coupon.used_count || 0) >=
      Number(coupon.max_uses || 0)
  );
}

function getCouponStatus(coupon) {
  if (isExpired(coupon)) {
    return "expired";
  }

  if (isExhausted(coupon)) {
    return "exhausted";
  }

  if (!coupon.active) {
    return "inactive";
  }

  return "active";
}

function StatusBadge({ coupon }) {
  const status = getCouponStatus(coupon);

  const styles = {
    active:
      "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
    inactive:
      "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300",
    expired:
      "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    exhausted:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  };

  const labels = {
    active: "Active",
    inactive: "Inactive",
    expired: "Expired",
    exhausted: "Limit reached",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function CouponModal({
  open,
  coupon,
  saving,
  onClose,
  onSave,
}) {
  const dialogRef = useRef(null);

  const [form, setForm] = useState(
    EMPTY_FORM
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (coupon) {
      setForm({
        code: coupon.code || "",
        type:
          coupon.type === "fixed"
            ? "fixed"
            : "percentage",
        value: String(coupon.value ?? ""),
        minimum_order: String(
          coupon.minimum_order ?? 0
        ),
        max_uses:
          coupon.max_uses === null ||
          coupon.max_uses === undefined
            ? ""
            : String(coupon.max_uses),
        expires_at: toDateTimeLocal(
          coupon.expires_at
        ),
        active: coupon.active !== false,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, coupon]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return undefined;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";

      if (dialog.open) {
        dialog.close();
      }
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanCode = form.code
      .trim()
      .toUpperCase();

    const numericValue = Number(
      form.value
    );

    const minimumOrder = Number(
      form.minimum_order || 0
    );

    const maxUses =
      form.max_uses === ""
        ? null
        : Number(form.max_uses);

    if (!cleanCode) {
      toast.error(
        "Coupon code is required."
      );
      return;
    }

    if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      toast.error(
        "Use only letters, numbers, hyphens or underscores in the code."
      );
      return;
    }

    if (
      !Number.isFinite(numericValue) ||
      numericValue <= 0
    ) {
      toast.error(
        "Enter a valid discount value."
      );
      return;
    }

    if (
      form.type === "percentage" &&
      numericValue > 100
    ) {
      toast.error(
        "Percentage discount cannot exceed 100%."
      );
      return;
    }

    if (
      !Number.isFinite(minimumOrder) ||
      minimumOrder < 0
    ) {
      toast.error(
        "Minimum order must be zero or more."
      );
      return;
    }

    if (
      maxUses !== null &&
      (!Number.isInteger(maxUses) ||
        maxUses < 1)
    ) {
      toast.error(
        "Maximum uses must be a positive whole number."
      );
      return;
    }

    let expirationValue = null;

    if (form.expires_at) {
      const expirationDate = new Date(
        form.expires_at
      );

      if (
        Number.isNaN(
          expirationDate.getTime()
        )
      ) {
        toast.error(
          "Enter a valid expiration date."
        );
        return;
      }

      expirationValue =
        expirationDate.toISOString();
    }

    onSave({
      code: cleanCode,
      type: form.type,
      value: numericValue,
      minimum_order: minimumOrder,
      max_uses: maxUses,
      expires_at: expirationValue,
      active: form.active,
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-0 h-screen w-screen max-w-none overflow-y-auto bg-transparent p-0 text-inherit backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();

        if (!saving) {
          onClose();
        }
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className="relative z-[10000] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900"
          onMouseDown={(event) => event.stopPropagation()}
        >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-black">
              {coupon
                ? "Edit coupon"
                : "Add coupon"}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {coupon
                ? `Editing ${coupon.code}`
                : "Create a new discount code"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Close coupon form"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-bold">
                Coupon code
              </span>

              <input
                type="text"
                name="code"
                value={form.code}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    code: event.target.value
                      .toUpperCase()
                      .replace(/\s+/g, ""),
                  }))
                }
                placeholder="WELCOME10"
                maxLength={40}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 font-black uppercase tracking-wide outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold">
                Discount type
              </span>

              <div className="relative">
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-11 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                >
                  {TYPE_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                />
              </div>
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold">
                Discount value
              </span>

              <div className="relative">
                {form.type ===
                "percentage" ? (
                  <Percent
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                ) : (
                  <CircleDollarSign
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                )}

                <input
                  type="number"
                  name="value"
                  value={form.value}
                  onChange={handleChange}
                  min="0.01"
                  max={
                    form.type ===
                    "percentage"
                      ? "100"
                      : undefined
                  }
                  step="0.01"
                  placeholder={
                    form.type ===
                    "percentage"
                      ? "10"
                      : "25"
                  }
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />
              </div>
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold">
                Minimum order
              </span>

              <input
                type="number"
                name="minimum_order"
                value={form.minimum_order}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold">
                Maximum uses
              </span>

              <input
                type="number"
                name="max_uses"
                value={form.max_uses}
                onChange={handleChange}
                min="1"
                step="1"
                placeholder="Unlimited"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-bold">
                Expiration date
              </span>

              <input
                type="datetime-local"
                name="expires_at"
                value={form.expires_at}
                onChange={handleChange}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Leave empty for no expiration.
              </p>
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-950 sm:col-span-2">
              <span>
                <span className="block text-sm font-bold">
                  Active coupon
                </span>

                <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  Customers can use this code when active.
                </span>
              </span>

              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="h-5 w-5 accent-black dark:accent-white"
              />
            </label>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-12 rounded-2xl border border-gray-200 px-6 font-bold transition hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-6 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {saving ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : coupon ? (
                <Pencil size={18} />
              ) : (
                <Plus size={18} />
              )}

              {saving
                ? "Saving..."
                : coupon
                  ? "Save changes"
                  : "Add coupon"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </dialog>
  );
}

function CouponCard({
  coupon,
  deleting,
  toggling,
  onEdit,
  onDelete,
  onToggle,
}) {
  const status = getCouponStatus(coupon);

  const discountText =
    coupon.type === "percentage"
      ? `${coupon.value}% off`
      : `${formatCurrency(coupon.value)} off`;

  const usageText =
    coupon.max_uses === null
      ? `${coupon.used_count} used / unlimited`
      : `${coupon.used_count} / ${coupon.max_uses} used`;

  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
            <Ticket size={25} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="truncate text-xl font-black tracking-wide">
                {coupon.code}
              </h2>

              <StatusBadge coupon={coupon} />
            </div>

            <p className="mt-2 text-lg font-black text-orange-600 dark:text-orange-400">
              {discountText}
            </p>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Minimum order: {formatCurrency(
                coupon.minimum_order
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(coupon)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 font-bold transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <Pencil size={17} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onToggle(coupon)}
            disabled={
              toggling ||
              status === "expired" ||
              status === "exhausted"
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 font-bold transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {toggling ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : coupon.active ? (
              <ToggleRight size={19} />
            ) : (
              <ToggleLeft size={19} />
            )}

            {coupon.active
              ? "Disable"
              : "Enable"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(coupon)}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/30"
          >
            {deleting ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={17} />
            )}

            Delete
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-gray-200 pt-5 text-sm dark:border-zinc-800 sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Usage
          </p>

          <p className="mt-2 font-bold">
            {usageText}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Expires
          </p>

          <p className="mt-2 font-bold">
            {formatDate(coupon.expires_at)}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Created
          </p>

          <p className="mt-2 font-bold">
            {formatDate(coupon.created_at)}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [saving, setSaving] =
    useState(false);
  const [deletingCouponId, setDeletingCouponId] =
    useState(null);
  const [togglingCouponId, setTogglingCouponId] =
    useState(null);

  const [modalOpen, setModalOpen] =
    useState(false);
  const [editingCoupon, setEditingCoupon] =
    useState(null);

  const fetchCoupons = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
              active,
              created_at
            `
          )
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        setCoupons(
          (data ?? []).map(normalizeCoupon)
        );

        if (silent) {
          toast.success("Coupons updated.");
        }
      } catch (error) {
        console.error(
          "Failed to load coupons:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to load coupons."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSaveCoupon = async (
    couponValues
  ) => {
    setSaving(true);

    try {
      if (editingCoupon) {
        const { data, error } = await supabase
          .from("coupons")
          .update(couponValues)
          .eq("id", editingCoupon.id)
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
              active,
              created_at
            `
          )
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "Coupon was not updated. Check the coupons UPDATE policy."
          );
        }

        const updatedCoupon =
          normalizeCoupon(data);

        setCoupons((currentCoupons) =>
          currentCoupons.map((coupon) =>
            String(coupon.id) ===
            String(updatedCoupon.id)
              ? updatedCoupon
              : coupon
          )
        );

        toast.success(
          "Coupon updated successfully."
        );
      } else {
        const { data, error } = await supabase
          .from("coupons")
          .insert({
            ...couponValues,
            used_count: 0,
          })
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
              active,
              created_at
            `
          )
          .single();

        if (error) {
          throw error;
        }

        setCoupons((currentCoupons) => [
          normalizeCoupon(data),
          ...currentCoupons,
        ]);

        toast.success(
          "Coupon added successfully."
        );
      }

      setModalOpen(false);
      setEditingCoupon(null);
    } catch (error) {
      console.error(
        "Failed to save coupon:",
        error
      );

      if (error?.code === "23505") {
        toast.error(
          "A coupon with this code already exists."
        );
      } else {
        toast.error(
          error?.message ||
            "Failed to save coupon."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCoupon = async (
    coupon
  ) => {
    const nextActive = !coupon.active;

    setTogglingCouponId(coupon.id);

    try {
      const { data, error } = await supabase
        .from("coupons")
        .update({
          active: nextActive,
        })
        .eq("id", coupon.id)
        .select("id, active")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Coupon status was not updated."
        );
      }

      setCoupons((currentCoupons) =>
        currentCoupons.map(
          (currentCoupon) =>
            String(currentCoupon.id) ===
            String(coupon.id)
              ? {
                  ...currentCoupon,
                  active: data.active,
                }
              : currentCoupon
        )
      );

      toast.success(
        data.active
          ? "Coupon activated."
          : "Coupon disabled."
      );
    } catch (error) {
      console.error(
        "Failed to change coupon status:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to change coupon status."
      );
    } finally {
      setTogglingCouponId(null);
    }
  };

  const handleDeleteCoupon = async (
    coupon
  ) => {
    const confirmed = window.confirm(
      `Delete coupon "${coupon.code}" permanently?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingCouponId(coupon.id);

    try {
      const { data, error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", coupon.id)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Coupon was not deleted. Check the coupons DELETE policy."
        );
      }

      setCoupons((currentCoupons) =>
        currentCoupons.filter(
          (currentCoupon) =>
            String(currentCoupon.id) !==
            String(coupon.id)
        )
      );

      toast.success(
        "Coupon deleted successfully."
      );
    } catch (error) {
      console.error(
        "Failed to delete coupon:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to delete coupon."
      );
    } finally {
      setDeletingCouponId(null);
    }
  };

  const filteredCoupons = useMemo(() => {
    const cleanSearch = searchTerm
      .trim()
      .toLowerCase();

    return coupons.filter((coupon) => {
      const status = getCouponStatus(coupon);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!cleanSearch) {
        return true;
      }

      return [
        coupon.id,
        coupon.code,
        coupon.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(cleanSearch);
    });
  }, [coupons, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    const active = coupons.filter(
      (coupon) =>
        getCouponStatus(coupon) ===
        "active"
    ).length;

    const inactive = coupons.filter(
      (coupon) =>
        getCouponStatus(coupon) ===
        "inactive"
    ).length;

    const expired = coupons.filter(
      (coupon) =>
        getCouponStatus(coupon) ===
        "expired"
    ).length;

    const totalUses = coupons.reduce(
      (total, coupon) =>
        total +
        Number(coupon.used_count || 0),
      0
    );

    return {
      total: coupons.length,
      active,
      inactive,
      expired,
      totalUses,
    };
  }, [coupons]);

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
              Loading coupons...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-zinc-950 dark:text-white">
      <Navbar />

      <CouponModal
        open={modalOpen}
        coupon={editingCoupon}
        saving={saving}
        onClose={closeModal}
        onSave={handleSaveCoupon}
      />

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
              Coupon management
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              Create discount codes, set usage
              limits and control expiration dates.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                fetchCoupons({
                  silent: true,
                })
              }
              disabled={refreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 font-bold transition hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
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
                : "Refresh"}
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-5 font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <Plus size={19} />
              Add coupon
            </button>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Ticket className="text-gray-400" />
            <p className="mt-4 text-2xl font-black">
              {statistics.total}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total coupons
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/20">
            <CheckCircle2 className="text-green-500" />
            <p className="mt-4 text-2xl font-black">
              {statistics.active}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Active coupons
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <ToggleLeft className="text-gray-500" />
            <p className="mt-4 text-2xl font-black">
              {statistics.inactive}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Inactive coupons
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20">
            <Clock3 className="text-red-500" />
            <p className="mt-4 text-2xl font-black">
              {statistics.expired}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Expired coupons
            </p>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900 dark:bg-orange-950/20">
            <Percent className="text-orange-500" />
            <p className="mt-4 text-2xl font-black">
              {statistics.totalUses}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total uses
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
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
                placeholder="Search coupon code, type or ID..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
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
                className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-11 font-semibold outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
              >
                {STATUS_FILTERS.map(
                  (filter) => (
                    <option
                      key={filter.value}
                      value={filter.value}
                    >
                      {filter.label}
                    </option>
                  )
                )}
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
                {filteredCoupons.length}
              </strong>{" "}
              of{" "}
              <strong className="text-black dark:text-white">
                {coupons.length}
              </strong>{" "}
              coupons
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
          {filteredCoupons.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <Ticket
                size={48}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-5 text-xl font-black">
                No coupons found
              </h2>

              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Create a coupon or change the
                current filters.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-5 font-bold text-white dark:bg-white dark:text-black"
              >
                <Plus size={18} />
                Add coupon
              </button>
            </div>
          ) : (
            filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                deleting={
                  String(deletingCouponId) ===
                  String(coupon.id)
                }
                toggling={
                  String(togglingCouponId) ===
                  String(coupon.id)
                }
                onEdit={openEditModal}
                onDelete={handleDeleteCoupon}
                onToggle={handleToggleCoupon}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}