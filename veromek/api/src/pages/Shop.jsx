import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  LoaderCircle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Layout from "../components/layout/Layout";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/product/ProductCard";
import { supabase } from "../lib/supabase";

export default function Shop() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("All");
  const [sortBy, setSortBy] =
    useState("featured");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const category = searchParams.get("category");

    if (category) {
      setSelected(category);
    } else {
      setSelected("All");
    }
  }, [searchParams]);

  const fetchProducts = useCallback(
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
          });

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
          stock: Number(product.stock || 0),
          images: Array.isArray(product.images)
            ? product.images
            : [],
        }));

        setProducts(normalizedProducts);

        if (silent) {
          toast.success(t("shop.updated"));
        }
      } catch (error) {
        console.error(
          "Failed to load products:",
          error
        );

        const message =
          error?.message ||
          t("shop.loadError");

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
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const cleanSearch = search
      .trim()
      .toLowerCase();

    const filtered = products.filter(
      (product) => {
        const matchSearch =
          !cleanSearch ||
          product.name
            ?.toLowerCase()
            .includes(cleanSearch) ||
          product.description
            ?.toLowerCase()
            .includes(cleanSearch) ||
          product.category
            ?.toLowerCase()
            .includes(cleanSearch);

        const matchCategory =
          selected === "All" ||
          product.category === selected;

        return matchSearch && matchCategory;
      }
    );

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (
            Number(a.price) - Number(b.price)
          );

        case "price-high":
          return (
            Number(b.price) - Number(a.price)
          );

        case "name":
          return String(a.name).localeCompare(
            String(b.name)
          );

        case "rating":
          return (
            Number(b.rating || 0) -
            Number(a.rating || 0)
          );

        case "newest":
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );

        default:
          return 0;
      }
    });
  }, [products, search, selected, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setSelected("All");
    setSortBy("featured");
  };

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-950 sm:text-5xl dark:text-white">
              {t("shop.title")}
            </h1>

            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {t("shop.subtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchProducts({
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
              ? t("shop.refreshing")
              : t("shop.refresh")}
          </button>
        </div>

        <div className="mt-10">
          <SearchBar
            search={search}
            setSearch={setSearch}
          />
        </div>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter
            selected={selected}
            setSelected={setSelected}
          />

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
          >
            <option value="featured">
              {t("shop.sortFeatured")}
            </option>

            <option value="newest">
              {t("shop.sortNewest")}
            </option>

            <option value="price-low">
              {t("shop.sortLow")}
            </option>

            <option value="price-high">
              {t("shop.sortHigh")}
            </option>

            <option value="name">
              {t("shop.sortName")}
            </option>

            <option value="rating">
              {t("shop.sortRating")}
            </option>
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={42}
                className="mx-auto animate-spin"
              />

              <p className="mt-4 font-semibold text-gray-500 dark:text-gray-400">
                {t("shop.loading")}
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900 dark:bg-red-950/30">
            <ShoppingBag
              size={46}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-5 text-2xl font-black text-red-700 dark:text-red-300">
              {t("shop.couldNotLoad")}
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-red-600 dark:text-red-400">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => fetchProducts()}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
            >
              <RefreshCw size={18} />
              {t("shop.tryAgain")}
            </button>
          </div>
        ) : (
          <>
            <p className="mb-8 mt-6 text-gray-500 dark:text-gray-400">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? t("shop.product")
                : t("shop.products")}{" "}
              {t("shop.found")}
            </p>

            {filteredProducts.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
                <ShoppingBag
                  size={46}
                  className="mx-auto text-gray-400"
                />

                <h2 className="mt-5 text-2xl font-black">
                  {t("shop.none")}
                </h2>

                <p className="mt-3 text-gray-500 dark:text-gray-400">
                  {t("shop.changeFilters")}
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-xl bg-black px-6 py-3 font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {t("shop.reset")}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
}