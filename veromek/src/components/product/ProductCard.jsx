import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  Eye,
  Heart,
  ImageIcon,
  ShoppingBag,
  Star,
  LoaderCircle,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { supabase } from "../../lib/supabase";

export default function ProductCard({
  product,
}) {
  const navigate = useNavigate();

  const [adding, setAdding] =
    useState(false);

  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const saved = isInWishlist(
    product.id
  );

  const stock = Math.max(
    0,
    Number(product.stock || 0)
  );

  const outOfStock = stock <= 0;
  const lowStock =
    stock > 0 && stock <= 5;

  const productRating = Number(
    product.rating || 0
  );

  const productReviews = Number(
    product.reviews || 0
  );

  const handleAddToCart = async () => {
    if (adding) {
      return;
    }

    setAdding(true);

    try {
      const {
        data: variants,
        error,
      } = await supabase
        .from("product_variants")
        .select("id")
        .eq("product_id", product.id)
        .eq("is_active", true)
        .limit(1);

      if (error) {
        throw error;
      }

      if ((variants ?? []).length > 0) {
        navigate(`/product/${product.id}`);
        return;
      }

      if (outOfStock) {
        return;
      }

      addToCart(product);
    } catch (error) {
      console.error(
        "Failed to check product variants:",
        error
      );

      navigate(`/product/${product.id}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-200 bg-white text-gray-950 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
      <div className="relative overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <Link
          to={`/product/${product.id}`}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={`h-72 w-full object-cover transition duration-500 group-hover:scale-110 ${
                outOfStock
                  ? "opacity-60 grayscale"
                  : ""
              }`}
            />
          ) : (
            <div className="flex h-72 items-center justify-center">
              <ImageIcon
                size={48}
                className="text-gray-400"
              />
            </div>
          )}
        </Link>

        {outOfStock ? (
          <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
            OUT OF STOCK
          </span>
        ) : lowStock ? (
          <span className="absolute left-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
            ONLY {stock} LEFT
          </span>
        ) : (
          <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-black">
            IN STOCK
          </span>
        )}

        <button
          type="button"
          onClick={() =>
            toggleWishlist(product)
          }
          aria-label={
            saved
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition ${
            saved
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white text-black hover:bg-red-500 hover:text-white dark:bg-zinc-950 dark:text-white dark:hover:bg-red-500"
          }`}
        >
          <Heart
            size={18}
            fill={
              saved
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      <div className="p-5">
        <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {product.category}
        </p>

        <Link
          to={`/product/${product.id}`}
        >
          <h3 className="mt-2 truncate text-xl font-bold text-gray-950 transition hover:text-gray-500 dark:text-white dark:hover:text-gray-300">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-1 text-yellow-500">
          {[1, 2, 3, 4, 5].map(
            (star) => {
              const isFilled =
                star <=
                Math.round(
                  productRating
                );

              return (
                <Star
                  key={star}
                  size={16}
                  fill={
                    isFilled
                      ? "currentColor"
                      : "none"
                  }
                  className={
                    isFilled
                      ? "text-yellow-500"
                      : "text-gray-300 dark:text-zinc-600"
                  }
                />
              );
            }
          )}

          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {productRating > 0
              ? productRating.toFixed(1)
              : "No rating"}
          </span>

          <span className="text-sm text-gray-400 dark:text-gray-500">
            ({productReviews})
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <span className="text-3xl font-extrabold text-gray-950 dark:text-white">
            $
            {Number(
              product.price || 0
            ).toFixed(2)}
          </span>

          <span
            className={`text-sm font-bold ${
              outOfStock
                ? "text-red-500"
                : lowStock
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-green-600 dark:text-green-400"
            }`}
          >
            {outOfStock
              ? "Unavailable"
              : `${stock} available`}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            to={`/product/${product.id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-950 transition hover:bg-gray-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
          >
            <Eye size={18} />
            View
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
          >
            {adding ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <ShoppingBag size={18} />
            )}

            {adding
              ? "Checking..."
              : outOfStock
                ? "Check sizes"
                : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}