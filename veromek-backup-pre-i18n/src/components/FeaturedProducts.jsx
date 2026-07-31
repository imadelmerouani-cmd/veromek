import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  LoaderCircle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

import ProductCard from "./product/ProductCard";
import { supabase } from "../lib/supabase";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const fetchFeaturedProducts = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

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
              created_at
            `
          )
          .eq("active", true)
          .order("created_at", {
            ascending: false,
          })
          .limit(4);

        if (error) {
          throw error;
        }

        const normalizedProducts = (
          data ?? []
        ).map((product) => ({
          ...product,
          price: Number(product.price || 0),
          rating: Number(product.rating || 0),
          reviews: Number(product.reviews || 0),
          stock: Math.max(
            0,
            Number(product.stock || 0)
          ),
          images: Array.isArray(product.images)
            ? product.images
            : [],
          active: product.active !== false,
        }));

        setProducts(normalizedProducts);

        if (silent) {
          toast.success(
            "Featured products updated."
          );
        }
      } catch (error) {
        console.error(
          "Failed to load featured products:",
          error
        );

        const message =
          error?.message ||
          "Failed to load featured products.";

        setErrorMessage(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Featured Products
          </h2>

          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Discover our newest premium products.
          </p>
        </div>

        {!loading && (
          <button
            type="button"
            onClick={() =>
              fetchFeaturedProducts({
                silent: true,
              })
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 font-bold transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-80 items-center justify-center">
          <div className="text-center">
            <LoaderCircle
              size={42}
              className="mx-auto animate-spin"
            />

            <p className="mt-4 font-semibold text-gray-500 dark:text-gray-400">
              Loading featured products...
            </p>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900 dark:bg-red-950/30">
          <ShoppingBag
            size={46}
            className="mx-auto text-red-500"
          />

          <h3 className="mt-5 text-2xl font-black text-red-700 dark:text-red-300">
            Featured products could not be loaded
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-red-600 dark:text-red-400">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchFeaturedProducts()
            }
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            <RefreshCw size={18} />
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 px-6 py-16 text-center dark:border-zinc-700">
          <ShoppingBag
            size={46}
            className="mx-auto text-gray-400"
          />

          <h3 className="mt-5 text-2xl font-black">
            No featured products
          </h3>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Active products will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}