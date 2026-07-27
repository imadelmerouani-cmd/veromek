import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Eye,
  EyeOff,
  ImageIcon,
  LoaderCircle,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/layout/Navbar";
import { supabase } from "../lib/supabase";

const CATEGORIES = [
  "Shoes",
  "Clothing",
  "Jewelry",
  "Bag",
  "Watch",
];

const EMPTY_FORM = {
  name: "",
  category: "Shoes",
  price: "",
  stock: "",
  image: "",
  images: "",
  description: "",
  active: true,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function normalizeProduct(product) {
  return {
    ...product,
    images: Array.isArray(product.images)
      ? product.images
      : [],
    active: product.active !== false,
  };
}

function parseImages(value, mainImage) {
  const imageList = String(value || "")
    .split("\n")
    .map((image) => image.trim())
    .filter(Boolean);

  if (
    mainImage &&
    !imageList.includes(mainImage.trim())
  ) {
    imageList.unshift(mainImage.trim());
  }

  return [...new Set(imageList)];
}

function ProductModal({
  open,
  product,
  saving,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (product) {
      setForm({
        name: product.name || "",
        category: product.category || "Shoes",
        price: String(product.price ?? ""),
        stock: String(product.stock ?? ""),
        image: product.image || "",
        images: Array.isArray(product.images)
          ? product.images.join("\n")
          : "",
        description: product.description || "",
        active: product.active !== false,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, product]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, checked, type } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const category = form.category.trim();
    const description = form.description.trim();
    const mainImage = form.image.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!name) {
      toast.error("Product name is required.");
      return;
    }

    if (!category) {
      toast.error("Category is required.");
      return;
    }

    if (
      form.price === "" ||
      Number.isNaN(price) ||
      price < 0
    ) {
      toast.error("Enter a valid price.");
      return;
    }

    if (
      form.stock === "" ||
      Number.isNaN(stock) ||
      stock < 0 ||
      !Number.isInteger(stock)
    ) {
      toast.error(
        "Stock must be a positive whole number."
      );
      return;
    }

    onSave({
      name,
      category,
      price,
      stock,
      image: mainImage || null,
      images: parseImages(
        form.images,
        mainImage
      ),
      description,
      active: form.active,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/65 px-4 py-8">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-black">
              {product
                ? "Edit product"
                : "Add product"}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {product
                ? `Editing product #${product.id}`
                : "Create a new store product"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Close product form"
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
                Product name
              </span>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nike Air Max"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold">
                Category
              </span>

              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-11 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
                >
                  {CATEGORIES.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                />
              </div>
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold">
                Price
              </span>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="129"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              />
            </label>

            <label>
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
                placeholder="20"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              />
            </label>

            <label className="flex items-end">
              <span className="flex h-12 w-full cursor-pointer items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 dark:border-zinc-700 dark:bg-zinc-950">
                <span>
                  <span className="block text-sm font-bold">
                    Active product
                  </span>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Visible inside the shop
                  </span>
                </span>

                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="h-5 w-5 accent-black dark:accent-white"
                />
              </span>
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-bold">
                Main image URL
              </span>

              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-bold">
                Gallery images
              </span>

              <textarea
                name="images"
                value={form.images}
                onChange={handleChange}
                rows={4}
                placeholder={
                  "Put one image URL per line\nhttps://...\nhttps://..."
                }
                className="w-full resize-y rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-bold">
                Description
              </span>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Product description..."
                className="w-full resize-y rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              />
            </label>
          </div>

          {form.image && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-bold">
                Image preview
              </p>

              <div className="h-48 overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-800">
                <img
                  src={form.image}
                  alt="Product preview"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              </div>
            </div>
          )}

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
              ) : product ? (
                <Pencil size={18} />
              ) : (
                <Plus size={18} />
              )}

              {saving
                ? "Saving..."
                : product
                  ? "Save changes"
                  : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  deleting,
  toggling,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative h-60 bg-gray-100 dark:bg-zinc-800">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon
              size={44}
              className="text-gray-400"
            />
          </div>
        )}

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${
            product.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {product.active ? "Active" : "Hidden"}
        </span>

        <span className="absolute right-4 top-4 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          Stock: {product.stock}
        </span>
      </div>

      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
          {product.category}
        </p>

        <h2 className="mt-2 truncate text-xl font-black">
          {product.name}
        </h2>

        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {product.description ||
            "No product description."}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-2xl font-black">
            {formatCurrency(product.price)}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            #{product.id}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 font-bold transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <Pencil size={17} />
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onToggleActive(product)
            }
            disabled={toggling}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 font-bold transition hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {toggling ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : product.active ? (
              <EyeOff size={17} />
            ) : (
              <Eye size={17} />
            )}

            {product.active ? "Hide" : "Show"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(product)}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/30"
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
    </article>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] =
    useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] =
    useState(null);
  const [togglingProductId, setTogglingProductId] =
    useState(null);

  const [modalOpen, setModalOpen] =
    useState(false);
  const [editingProduct, setEditingProduct] =
    useState(null);

  const fetchProducts = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const { data, error } = await supabase
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
              active,
              created_at,
              updated_at
            `
          )
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        setProducts(
          (data ?? []).map(normalizeProduct)
        );

        if (silent) {
          toast.success("Products updated.");
        }
      } catch (error) {
        console.error(
          "Failed to load products:",
          error
        );

        toast.error(
          error.message ||
            "Failed to load products."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (
    productValues
  ) => {
    setSaving(true);

    try {
      if (editingProduct) {
        const { data, error } = await supabase
          .from("products")
          .update(productValues)
          .eq("id", editingProduct.id)
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
              active,
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
            "Supabase did not update this product. Check the products UPDATE policy."
          );
        }

        const updatedProduct =
          normalizeProduct(data);

        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            String(product.id) ===
            String(updatedProduct.id)
              ? updatedProduct
              : product
          )
        );

        toast.success(
          "Product updated successfully."
        );
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert({
            ...productValues,
            rating: 0,
            reviews: 0,
          })
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
              active,
              created_at,
              updated_at
            `
          )
          .single();

        if (error) {
          throw error;
        }

        setProducts((currentProducts) => [
          normalizeProduct(data),
          ...currentProducts,
        ]);

        toast.success(
          "Product added successfully."
        );
      }

      setModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error(
        "Failed to save product:",
        error
      );

      toast.error(
        error.message ||
          "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (
    product
  ) => {
    const confirmed = window.confirm(
      `Delete "${product.name}" permanently?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingProductId(product.id);

    try {
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Supabase did not delete this product. Check the products DELETE policy."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (currentProduct) =>
            String(currentProduct.id) !==
            String(product.id)
        )
      );

      toast.success(
        "Product deleted successfully."
      );
    } catch (error) {
      console.error(
        "Failed to delete product:",
        error
      );

      toast.error(
        error.message ||
          "Failed to delete product."
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleToggleActive = async (
    product
  ) => {
    const newActiveValue = !product.active;

    setTogglingProductId(product.id);

    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          active: newActiveValue,
        })
        .eq("id", product.id)
        .select("id, active")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Supabase did not update this product."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.map(
          (currentProduct) =>
            String(currentProduct.id) ===
            String(product.id)
              ? {
                  ...currentProduct,
                  active: data.active,
                }
              : currentProduct
        )
      );

      toast.success(
        data.active
          ? "Product is now visible."
          : "Product is now hidden."
      );
    } catch (error) {
      console.error(
        "Failed to change product visibility:",
        error
      );

      toast.error(
        error.message ||
          "Failed to change visibility."
      );
    } finally {
      setTogglingProductId(null);
    }
  };

  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const cleanSearch = searchTerm
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === "all" ||
        product.category === categoryFilter;

      if (!matchesCategory) {
        return false;
      }

      if (!cleanSearch) {
        return true;
      }

      return [
        product.id,
        product.name,
        product.category,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(cleanSearch);
    });
  }, [
    products,
    searchTerm,
    categoryFilter,
  ]);

  const statistics = useMemo(() => {
    return {
      total: products.length,
      active: products.filter(
        (product) => product.active
      ).length,
      hidden: products.filter(
        (product) => !product.active
      ).length,
      stock: products.reduce(
        (total, product) =>
          total + Number(product.stock || 0),
        0
      ),
      value: products.reduce(
        (total, product) =>
          total +
          Number(product.stock || 0) *
            Number(product.price || 0),
        0
      ),
    };
  }, [products]);

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
              Loading products...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-zinc-950 dark:text-white">
      <Navbar />

      <ProductModal
        open={modalOpen}
        product={editingProduct}
        saving={saving}
        onClose={closeModal}
        onSave={handleSaveProduct}
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
              Product management
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              Add products, update information,
              control stock and manage shop
              visibility.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                fetchProducts({
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
              <PackagePlus size={19} />
              Add product
            </button>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Boxes className="text-gray-400" />

            <p className="mt-4 text-2xl font-black">
              {statistics.total}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total products
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <CheckCircle2 className="text-green-500" />

            <p className="mt-4 text-2xl font-black">
              {statistics.active}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Active products
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <EyeOff className="text-red-500" />

            <p className="mt-4 text-2xl font-black">
              {statistics.hidden}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Hidden products
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Boxes className="text-blue-500" />

            <p className="mt-4 text-2xl font-black">
              {statistics.stock}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total stock
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <CircleDollarSign className="text-green-500" />

            <p className="mt-4 truncate text-2xl font-black">
              {formatCurrency(statistics.value)}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Inventory value
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
                placeholder="Search product name, category or ID..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              />
            </label>

            <label className="relative block">
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
                className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-11 font-semibold outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              >
                <option value="all">
                  All categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
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
                {filteredProducts.length}
              </strong>{" "}
              of{" "}
              <strong className="text-black dark:text-white">
                {products.length}
              </strong>{" "}
              products
            </p>

            {(searchTerm ||
              categoryFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}
                className="font-bold text-black hover:underline dark:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900 md:col-span-2 xl:col-span-3">
              <Boxes
                size={48}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-5 text-xl font-black">
                No products found
              </h2>

              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Add a product or change the current
                filters.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-5 font-bold text-white dark:bg-white dark:text-black"
              >
                <Plus size={18} />
                Add product
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                deleting={
                  String(deletingProductId) ===
                  String(product.id)
                }
                toggling={
                  String(togglingProductId) ===
                  String(product.id)
                }
                onEdit={openEditModal}
                onDelete={handleDeleteProduct}
                onToggleActive={
                  handleToggleActive
                }
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}