import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CheckCircle2,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { supabase } from "../lib/supabase";

const EMPTY_FORM = {
  size: "",
  color: "Default",
  stock: "0",
  sku: "",
  is_active: true,
};

function normalizeVariant(variant) {
  return {
    ...variant,
    stock: Math.max(
      0,
      Number(variant.stock || 0)
    ),
    is_active:
      variant.is_active !== false,
  };
}

export default function VariantModal({
  open,
  product,
  onClose,
  onChanged,
}) {
  const [variants, setVariants] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [editingVariant, setEditingVariant] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const resetForm = useCallback(() => {
    setEditingVariant(null);
    setForm(EMPTY_FORM);
  }, []);

  const fetchVariants = useCallback(
    async ({ silent = false } = {}) => {
      if (!product?.id) {
        setVariants([]);
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const { data, error } =
          await supabase
            .from("product_variants")
            .select(
              `
                id,
                product_id,
                size,
                color,
                stock,
                sku,
                is_active,
                created_at,
                updated_at
              `
            )
            .eq("product_id", product.id)
            .order("size", {
              ascending: true,
            })
            .order("color", {
              ascending: true,
            });

        if (error) {
          throw error;
        }

        setVariants(
          (data ?? []).map(
            normalizeVariant
          )
        );

        if (silent) {
          toast.success(
            "Variants updated."
          );
        }
      } catch (error) {
        console.error(
          "Failed to load variants:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to load variants."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [product?.id]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    resetForm();
    fetchVariants();
  }, [
    open,
    fetchVariants,
    resetForm,
  ]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !product) {
    return null;
  }

  const handleChange = (event) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const startEditing = (variant) => {
    setEditingVariant(variant);

    setForm({
      size: variant.size || "",
      color:
        variant.color || "Default",
      stock: String(
        variant.stock ?? 0
      ),
      sku: variant.sku || "",
      is_active:
        variant.is_active !== false,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const size = form.size.trim();
    const color =
      form.color.trim() || "Default";

    const stock = Number(form.stock);

    const sku =
      form.sku.trim() || null;

    if (!size) {
      toast.error(
        "Size is required."
      );
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      toast.error(
        "Stock must be a positive whole number."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        product_id: product.id,
        size,
        color,
        stock,
        sku,
        is_active: form.is_active,
      };

      if (editingVariant) {
        const { data, error } =
          await supabase
            .from("product_variants")
            .update(payload)
            .eq(
              "id",
              editingVariant.id
            )
            .select(
              `
                id,
                product_id,
                size,
                color,
                stock,
                sku,
                is_active,
                created_at,
                updated_at
              `
            )
            .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "The variant was not updated."
          );
        }

        setVariants(
          (currentVariants) =>
            currentVariants.map(
              (variant) =>
                String(variant.id) ===
                String(data.id)
                  ? normalizeVariant(data)
                  : variant
            )
        );

        toast.success(
          "Variant updated."
        );
      } else {
        const { data, error } =
          await supabase
            .from("product_variants")
            .insert(payload)
            .select(
              `
                id,
                product_id,
                size,
                color,
                stock,
                sku,
                is_active,
                created_at,
                updated_at
              `
            )
            .single();

        if (error) {
          throw error;
        }

        setVariants(
          (currentVariants) => [
            ...currentVariants,
            normalizeVariant(data),
          ]
        );

        toast.success(
          "Variant added."
        );
      }

      resetForm();

      onChanged?.({
        productId: product.id,
      });
    } catch (error) {
      console.error(
        "Failed to save variant:",
        error
      );

      const message =
        String(
          error?.message || ""
        ).includes(
          "product_variants_unique_option"
        )
          ? "This size and color already exist for this product."
          : error?.message ||
            "Failed to save variant.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (variant) => {
    const confirmed = window.confirm(
      `Delete size "${variant.size}"${
        variant.color &&
        variant.color !== "Default"
          ? ` in ${variant.color}`
          : ""
      }?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(variant.id);

    try {
      const { data, error } =
        await supabase
          .from("product_variants")
          .delete()
          .eq("id", variant.id)
          .select("id")
          .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "The variant was not deleted."
        );
      }

      setVariants(
        (currentVariants) =>
          currentVariants.filter(
            (currentVariant) =>
              String(
                currentVariant.id
              ) !==
              String(variant.id)
          )
      );

      if (
        String(
          editingVariant?.id
        ) === String(variant.id)
      ) {
        resetForm();
      }

      toast.success(
        "Variant deleted."
      );

      onChanged?.({
        productId: product.id,
      });
    } catch (error) {
      console.error(
        "Failed to delete variant:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to delete variant."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalStock = variants.reduce(
    (total, variant) =>
      total +
      Number(variant.stock || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/65 px-4 py-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900">
        <header className="flex flex-col justify-between gap-5 border-b border-gray-200 px-6 py-5 dark:border-zinc-800 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Product #{product.id}
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Manage variants
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {product.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                fetchVariants({
                  silent: true,
                })
              }
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold transition hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              aria-label="Close variants"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        <div className="grid gap-8 p-6 lg:grid-cols-[0.9fr_1.4fr]">
          <section>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black">
                    {editingVariant
                      ? "Edit variant"
                      : "Add variant"}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Size, color and stock.
                  </p>
                </div>

                {editingVariant && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white"
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    Size
                  </span>

                  <input
                    type="text"
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    placeholder="42 or M"
                    disabled={saving}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none transition focus:border-black disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    Color
                  </span>

                  <input
                    type="text"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="White"
                    disabled={saving}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none transition focus:border-black disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    Stock
                  </span>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    disabled={saving}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none transition focus:border-black disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    SKU (optional)
                  </span>

                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="SHOE-WHITE-42"
                    disabled={saving}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none transition focus:border-black disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                  <span>
                    <span className="block text-sm font-bold">
                      Active variant
                    </span>

                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Available for customers
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    disabled={saving}
                    className="h-5 w-5 accent-black dark:accent-white"
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {saving ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : editingVariant ? (
                    <Pencil size={18} />
                  ) : (
                    <Plus size={18} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingVariant
                      ? "Save changes"
                      : "Add variant"}
                </button>
              </form>
            </div>
          </section>

          <section>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h3 className="text-xl font-black">
                  Current variants
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {variants.length} variant
                  {variants.length === 1
                    ? ""
                    : "s"}{" "}
                  · {totalStock} units
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-72 items-center justify-center rounded-3xl border border-gray-200 dark:border-zinc-800">
                <LoaderCircle
                  size={34}
                  className="animate-spin"
                />
              </div>
            ) : variants.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 px-6 py-16 text-center dark:border-zinc-700">
                <Plus
                  size={40}
                  className="mx-auto text-gray-400"
                />

                <h4 className="mt-4 text-lg font-black">
                  No variants yet
                </h4>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Add the first size for this
                  product.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant) => (
                  <article
                    key={variant.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-black px-3 py-1 text-sm font-black text-white dark:bg-white dark:text-black">
                          Size {variant.size}
                        </span>

                        {variant.color &&
                          variant.color !==
                            "Default" && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold dark:bg-zinc-800">
                              {variant.color}
                            </span>
                          )}

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                            variant.is_active
                              ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          }`}
                        >
                          <CheckCircle2
                            size={13}
                          />

                          {variant.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-3 font-black">
                        Stock: {variant.stock}
                      </p>

                      {variant.sku && (
                        <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                          SKU: {variant.sku}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            variant
                          )
                        }
                        disabled={
                          deletingId !== null
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold transition hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            variant
                          )
                        }
                        disabled={
                          deletingId ===
                          variant.id
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/30"
                      >
                        {deletingId ===
                        variant.id ? (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={15} />
                        )}

                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}