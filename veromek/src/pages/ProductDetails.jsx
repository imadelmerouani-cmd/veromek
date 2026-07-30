import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  LoaderCircle,
  MessageSquare,
  PackageX,
  Pencil,
  ShoppingBag,
  Star,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function RatingStars({
  rating,
  size = 18,
  interactive = false,
  onChange,
}) {
  const [hoveredRating, setHoveredRating] =
    useState(0);

  const displayedRating =
    hoveredRating || rating;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHoveredRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => {
            if (interactive) {
              setHoveredRating(star);
            }
          }}
          onClick={() => {
            if (interactive && onChange) {
              onChange(star);
            }
          }}
          className={
            interactive
              ? "cursor-pointer transition hover:scale-110"
              : "cursor-default"
          }
          aria-label={
            interactive
              ? `Give ${star} star${
                  star > 1 ? "s" : ""
                }`
              : undefined
          }
        >
          <Star
            size={size}
            className={
              star <= displayedRating
                ? "text-yellow-500"
                : "text-gray-300 dark:text-gray-600"
            }
            fill={
              star <= displayedRating
                ? "currentColor"
                : "none"
            }
          />
        </button>
      ))}
    </div>
  );
}

function formatReviewDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function ProductDetails() {
  const { id } = useParams();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } =
    useWishlist();
  const { user, profile, authLoading } =
    useAuth();

  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] =
    useState(true);
  const [productError, setProductError] =
    useState("");

  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] =
    useState(true);
  const [variantsError, setVariantsError] =
    useState("");
  const [selectedColor, setSelectedColor] =
    useState("");
  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState(null);

  const [selectedImage, setSelectedImage] =
    useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [
    reviewSubmitting,
    setReviewSubmitting,
  ] = useState(false);

  const [reviewDeleting, setReviewDeleting] =
    useState(false);

  const fetchProduct = useCallback(async () => {
    setProductLoading(true);
    setProductError("");

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
        .eq("id", id)
        .eq("active", true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setProduct(null);
        return;
      }

      const normalizedProduct = {
        ...data,
        price: Number(data.price || 0),
        rating: Number(data.rating || 0),
        reviews: Number(data.reviews || 0),
        stock: Number(data.stock || 0),
        images: Array.isArray(data.images)
          ? data.images
          : [],
      };

      setProduct(normalizedProduct);

      setSelectedImage(
        normalizedProduct.images?.[0] ||
          normalizedProduct.image ||
          ""
      );
    } catch (error) {
      console.error(
        "Failed to load product:",
        error
      );

      setProductError(
        error?.message ||
          "Failed to load product."
      );
    } finally {
      setProductLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const fetchVariants = useCallback(async () => {
    setVariantsLoading(true);
    setVariantsError("");
    setSelectedVariantId(null);

    try {
      const { data, error } = await supabase
        .from("product_variants")
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
        .eq("product_id", id)
        .eq("is_active", true);

      if (error) {
        throw error;
      }

      const normalizedVariants = (data ?? [])
        .map((variant) => ({
          ...variant,
          size: String(variant.size || "").trim(),
          color:
            String(variant.color || "Default").trim() ||
            "Default",
          stock: Math.max(
            0,
            Number(variant.stock || 0)
          ),
        }))
        .filter((variant) => variant.size)
        .sort((first, second) => {
          const colorComparison =
            first.color.localeCompare(
              second.color,
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              }
            );

          if (colorComparison !== 0) {
            return colorComparison;
          }

          return first.size.localeCompare(
            second.size,
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            }
          );
        });

      setVariants(normalizedVariants);

      const firstAvailableVariant =
        normalizedVariants.find(
          (variant) => variant.stock > 0
        ) || normalizedVariants[0];

      setSelectedColor(
        firstAvailableVariant?.color || ""
      );
    } catch (error) {
      console.error(
        "Failed to load product variants:",
        error
      );

      setVariants([]);
      setSelectedColor("");
      setVariantsError(
        error?.message ||
          "Failed to load product sizes."
      );
    } finally {
      setVariantsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const variantColors = useMemo(() => {
    return [
      ...new Set(
        variants.map(
          (variant) => variant.color
        )
      ),
    ];
  }, [variants]);

  const visibleVariants = useMemo(() => {
    if (!selectedColor) {
      return variants;
    }

    return variants.filter(
      (variant) =>
        variant.color === selectedColor
    );
  }, [variants, selectedColor]);

  const selectedVariant = useMemo(() => {
    return (
      variants.find(
        (variant) =>
          String(variant.id) ===
          String(selectedVariantId)
      ) || null
    );
  }, [variants, selectedVariantId]);

  const totalVariantStock = useMemo(() => {
    return variants.reduce(
      (total, variant) =>
        total + Number(variant.stock || 0),
      0
    );
  }, [variants]);

  const fetchReviews = useCallback(async () => {
    if (!product?.id) {
      setReviews([]);
      setReviewsLoading(false);
      return;
    }

    setReviewsLoading(true);

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
            id,
            user_id,
            product_id,
            reviewer_name,
            rating,
            comment,
            created_at,
            updated_at
          `
        )
        .eq("product_id", String(product.id))
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setReviews(data ?? []);
    } catch (error) {
      console.error(
        "Failed to load reviews:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to load reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  }, [product?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const userReview = useMemo(() => {
    if (!user) {
      return null;
    }

    return (
      reviews.find(
        (review) =>
          String(review.user_id) ===
          String(user.id)
      ) || null
    );
  }, [reviews, user]);

  useEffect(() => {
    if (userReview) {
      setRating(Number(userReview.rating));
      setComment(userReview.comment || "");
      return;
    }

    setRating(5);
    setComment("");
  }, [userReview, product?.id]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    return total / reviews.length;
  }, [reviews]);

  const ratingSummary = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter(
        (review) =>
          Number(review.rating) === star
      ).length;

      const percentage =
        reviews.length > 0
          ? (count / reviews.length) * 100
          : 0;

      return {
        star,
        count,
        percentage,
      };
    });
  }, [reviews]);

  const getReviewerName = () => {
    const profileName =
      profile?.full_name?.trim();

    const firstName =
      user?.user_metadata?.first_name || "";

    const lastName =
      user?.user_metadata?.last_name || "";

    const metadataName =
      `${firstName} ${lastName}`.trim();

    return (
      profileName ||
      metadataName ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "VeroMek Customer"
    );
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error(
        "Please log in to write a review."
      );
      return;
    }

    if (!product) {
      toast.error("Product not found.");
      return;
    }

    const cleanComment = comment.trim();

    if (rating < 1 || rating > 5) {
      toast.error("Please choose a rating.");
      return;
    }

    if (cleanComment.length < 3) {
      toast.error(
        "Your review must contain at least 3 characters."
      );
      return;
    }

    if (cleanComment.length > 1000) {
      toast.error(
        "Your review cannot exceed 1000 characters."
      );
      return;
    }

    setReviewSubmitting(true);

    try {
      const reviewData = {
        user_id: user.id,
        product_id: String(product.id),
        reviewer_name: getReviewerName(),
        rating,
        comment: cleanComment,
      };

      if (userReview) {
        const { data, error } = await supabase
          .from("reviews")
          .update({
            reviewer_name:
              reviewData.reviewer_name,
            rating: reviewData.rating,
            comment: reviewData.comment,
          })
          .eq("id", userReview.id)
          .eq("user_id", user.id)
          .select("id")
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "Review was not updated."
          );
        }

        toast.success(
          "Your review was updated."
        );
      } else {
        const { error } = await supabase
          .from("reviews")
          .insert(reviewData);

        if (error) {
          throw error;
        }

        toast.success(
          "Your review was published."
        );
      }

      await fetchReviews();
    } catch (error) {
      console.error(
        "Failed to save review:",
        error
      );

      if (error?.code === "23505") {
        toast.error(
          "You already reviewed this product."
        );
      } else {
        toast.error(
          error?.message ||
            "Failed to save your review."
        );
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!user || !userReview) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmed) {
      return;
    }

    setReviewDeleting(true);

    try {
      const { data, error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", userReview.id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Review was not deleted."
        );
      }

      setRating(5);
      setComment("");

      toast.success(
        "Your review was deleted."
      );

      await fetchReviews();
    } catch (error) {
      console.error(
        "Failed to delete review:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to delete your review."
      );
    } finally {
      setReviewDeleting(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    if (variantsLoading) {
      toast.error(
        "Product sizes are still loading."
      );
      return;
    }

    if (variantsError) {
      toast.error(
        "Product sizes could not be loaded."
      );
      return;
    }

    if (variants.length === 0) {
      toast.error(
        "No sizes are configured for this product."
      );
      return;
    }

    if (!selectedVariant) {
      toast.error(
        "Please select a size."
      );
      return;
    }

    if (selectedVariant.stock <= 0) {
      toast.error(
        "This size is out of stock."
      );
      return;
    }

    addToCart({
      ...product,
      variant_id: selectedVariant.id,
      size: selectedVariant.size,
      color: selectedVariant.color,
      sku: selectedVariant.sku || null,
      stock: selectedVariant.stock,
    });
  };

  if (productLoading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <LoaderCircle
              size={44}
              className="mx-auto animate-spin"
            />

            <p className="mt-4 font-semibold text-gray-500 dark:text-gray-400">
              Loading product...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (productError) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <PackageX
            size={48}
            className="text-red-500"
          />

          <h1 className="mt-5 text-4xl font-black text-gray-900 dark:text-white">
            Product could not be loaded
          </h1>

          <p className="mt-4 text-red-600 dark:text-red-400">
            {productError}
          </p>

          <button
            type="button"
            onClick={fetchProduct}
            className="mt-6 rounded-xl bg-black px-6 py-3 font-bold text-white dark:bg-white dark:text-black"
          >
            Try again
          </button>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <PackageX
            size={48}
            className="text-gray-400"
          />

          <h1 className="mt-5 text-4xl font-black text-gray-900 dark:text-white">
            Product not found
          </h1>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            This product does not exist or is
            currently hidden.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </Link>
        </div>
      </Layout>
    );
  }

  const galleryImages = [
    ...new Set(
      [
        ...(product.images || []),
        product.image,
      ].filter(Boolean)
    ),
  ];

  const wishlistActive = isInWishlist(
    product.id
  );

  const outOfStock =
    !variantsLoading &&
    variants.length > 0 &&
    totalVariantStock <= 0;

  const sizesUnavailable =
    !variantsLoading &&
    !variantsError &&
    variants.length === 0;

  const selectedStock =
    selectedVariant?.stock ?? totalVariantStock;

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <Link
          to="/shop"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Shop
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="group overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-900">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-[520px] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-[520px] items-center justify-center">
                  <ShoppingBag
                    size={60}
                    className="text-gray-400"
                  />
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {galleryImages.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(image)
                      }
                      className={`overflow-hidden rounded-2xl border-2 transition ${
                        selectedImage === image
                          ? "border-black dark:border-white"
                          : "border-transparent hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                      aria-label={`Show product image ${
                        index + 1
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${
                          index + 1
                        }`}
                        className="h-28 w-full object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="lg:py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              {product.category}
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <RatingStars
                rating={Math.round(
                  averageRating
                )}
              />

              <span className="font-semibold text-gray-900 dark:text-white">
                {reviews.length > 0
                  ? averageRating.toFixed(1)
                  : "No rating"}
              </span>

              <a
                href="#customer-reviews"
                className="text-sm text-gray-500 transition hover:text-black dark:text-gray-400 dark:hover:text-white"
              >
                ({reviews.length}{" "}
                {reviews.length === 1
                  ? "review"
                  : "reviews"}
                )
              </a>
            </div>

            <p className="mt-7 text-4xl font-extrabold text-gray-900 dark:text-white">
              $
              {Number(product.price).toFixed(
                2
              )}
            </p>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              {product.description ||
                "No product description available."}
            </p>

            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Select size
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Choose an available size before
                    adding this product to your cart.
                  </p>
                </div>

                {selectedVariant && (
                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    {selectedVariant.stock} available
                  </span>
                )}
              </div>

              {variantsLoading ? (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-gray-200 p-4 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                  Loading available sizes...
                </div>
              ) : variantsError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  <p>{variantsError}</p>

                  <button
                    type="button"
                    onClick={fetchVariants}
                    className="mt-3 font-bold underline"
                  >
                    Try loading sizes again
                  </button>
                </div>
              ) : variants.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-300">
                  Sizes have not been configured for
                  this product yet.
                </div>
              ) : (
                <>
                  {variantColors.length > 1 && (
                    <div className="mt-5">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Color
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3">
                        {variantColors.map(
                          (color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                setSelectedColor(color);
                                setSelectedVariantId(
                                  null
                                );
                              }}
                              className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                                selectedColor === color
                                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                  : "border-gray-300 bg-white text-gray-900 hover:border-black dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-white"
                              }`}
                            >
                              {color}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {visibleVariants.map(
                      (variant) => {
                        const selected =
                          String(
                            selectedVariantId
                          ) ===
                          String(variant.id);

                        const unavailable =
                          variant.stock <= 0;

                        return (
                          <button
                            key={variant.id}
                            type="button"
                            disabled={unavailable}
                            onClick={() =>
                              setSelectedVariantId(
                                variant.id
                              )
                            }
                            className={`relative min-h-14 rounded-xl border px-3 py-3 text-sm font-black transition ${
                              selected
                                ? "border-black bg-black text-white ring-2 ring-black/10 dark:border-white dark:bg-white dark:text-black dark:ring-white/20"
                                : unavailable
                                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
                                  : "border-gray-300 bg-white text-gray-900 hover:border-black dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-white"
                            }`}
                            aria-pressed={
                              selected
                            }
                          >
                            {variant.size}

                            {unavailable && (
                              <span className="mt-1 block text-[10px] font-semibold no-underline">
                                Sold out
                              </span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Free standard delivery
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Easy returns within 30 days.
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    outOfStock
                      ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      : selectedStock <= 5
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300"
                        : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                  }`}
                >
                  {outOfStock
                    ? "Out of stock"
                    : selectedVariant
                      ? `${selectedVariant.stock} in selected size`
                      : `${totalVariantStock} across all sizes`}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
                  outOfStock ||
                  sizesUnavailable ||
                  variantsLoading ||
                  Boolean(variantsError)
                }
                className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-black px-8 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <ShoppingBag size={20} />

                {outOfStock
                  ? "Out of Stock"
                  : sizesUnavailable
                    ? "Sizes Unavailable"
                    : "Add to Cart"}
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleWishlist(product)
                }
                className={`flex items-center justify-center gap-3 rounded-2xl border px-8 py-4 font-semibold transition ${
                  wishlistActive
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-gray-300 bg-white text-black hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                }`}
              >
                <Heart
                  size={20}
                  fill={
                    wishlistActive
                      ? "currentColor"
                      : "none"
                  }
                />

                {wishlistActive
                  ? "Saved"
                  : "Wishlist"}
              </button>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Product details
              </h2>

              <div className="mt-4 space-y-3 text-gray-600 dark:text-gray-300">
                <p>Premium VeroMek quality.</p>
                <p>
                  Comfortable and durable design.
                </p>
                <p>
                  Selected materials and modern
                  finish.
                </p>
                <p>
                  Product ID: {product.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="customer-reviews"
        className="border-t border-gray-200 dark:border-gray-800"
      >
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Customer feedback
            </p>

            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-white">
              Reviews & Ratings
            </h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-7 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Average rating
                </p>

                <div className="mt-4 flex items-end gap-3">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                    {reviews.length > 0
                      ? averageRating.toFixed(1)
                      : "0.0"}
                  </span>

                  <span className="pb-1 text-gray-500 dark:text-gray-400">
                    out of 5
                  </span>
                </div>

                <div className="mt-4">
                  <RatingStars
                    rating={Math.round(
                      averageRating
                    )}
                    size={22}
                  />
                </div>

                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Based on {reviews.length}{" "}
                  {reviews.length === 1
                    ? "review"
                    : "reviews"}
                </p>

                <div className="mt-7 space-y-3">
                  {ratingSummary.map((item) => (
                    <div
                      key={item.star}
                      className="flex items-center gap-3"
                    >
                      <span className="w-7 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.star}
                      </span>

                      <Star
                        size={14}
                        className="shrink-0 text-yellow-500"
                        fill="currentColor"
                      />

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-yellow-500 transition-all"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>

                      <span className="w-7 text-right text-sm text-gray-500 dark:text-gray-400">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {!authLoading && !user && (
                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-7 text-center dark:border-gray-800 dark:bg-gray-900">
                  <MessageSquare
                    className="mx-auto mb-4 text-gray-500"
                    size={35}
                  />

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Share your experience
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Log in to rate and review this
                    product.
                  </p>

                  <Link
                    to="/login"
                    state={{
                      from: `/product/${product.id}`,
                    }}
                    className="mt-5 inline-flex rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    Login to Review
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-8 lg:col-span-2">
              {user && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="rounded-3xl border border-gray-200 bg-white p-7 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userReview
                          ? "Edit Your Review"
                          : "Write a Review"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Tell other customers what
                        you think about this
                        product.
                      </p>
                    </div>

                    {userReview && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <Pencil size={14} />
                        Your review
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <label className="mb-3 block font-semibold text-gray-900 dark:text-white">
                      Your rating
                    </label>

                    <RatingStars
                      rating={rating}
                      size={30}
                      interactive
                      onChange={setRating}
                    />

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {rating} out of 5 stars
                    </p>
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="review-comment"
                      className="mb-3 block font-semibold text-gray-900 dark:text-white"
                    >
                      Your review
                    </label>

                    <textarea
                      id="review-comment"
                      rows="5"
                      maxLength="1000"
                      required
                      value={comment}
                      onChange={(event) =>
                        setComment(
                          event.target.value
                        )
                      }
                      placeholder="What did you like or dislike about this product?"
                      className="w-full resize-none rounded-2xl border border-gray-300 bg-white p-4 text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-black dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-white"
                    />

                    <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Minimum 3 characters
                      </span>

                      <span>
                        {comment.length}/1000
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="flex items-center justify-center gap-2 rounded-xl bg-black px-7 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                      {reviewSubmitting ? (
                        <>
                          <LoaderCircle
                            className="animate-spin"
                            size={19}
                          />
                          Saving...
                        </>
                      ) : userReview ? (
                        <>
                          <Pencil size={18} />
                          Update Review
                        </>
                      ) : (
                        <>
                          <Star size={18} />
                          Publish Review
                        </>
                      )}
                    </button>

                    {userReview && (
                      <button
                        type="button"
                        disabled={reviewDeleting}
                        onClick={
                          handleDeleteReview
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-300 px-7 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        {reviewDeleting ? (
                          <LoaderCircle
                            className="animate-spin"
                            size={19}
                          />
                        ) : (
                          <Trash2 size={18} />
                        )}

                        Delete Review
                      </button>
                    )}
                  </div>
                </form>
              )}

              <div>
                <h3 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white">
                  Customer Reviews
                </h3>

                {reviewsLoading ? (
                  <div className="flex min-h-52 items-center justify-center rounded-3xl border border-gray-200 dark:border-gray-800">
                    <div className="text-center">
                      <LoaderCircle
                        className="mx-auto animate-spin text-gray-500"
                        size={35}
                      />

                      <p className="mt-3 text-gray-500 dark:text-gray-400">
                        Loading reviews...
                      </p>
                    </div>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 px-6 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
                    <MessageSquare
                      className="mx-auto mb-4 text-gray-400"
                      size={42}
                    />

                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      No Reviews Yet
                    </h4>

                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      Be the first customer to
                      review this product.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <article
                        key={review.id}
                        className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold uppercase text-white dark:bg-white dark:text-black">
                              {review.reviewer_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "V"}
                            </div>

                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">
                                {review.reviewer_name ||
                                  "Customer"}
                              </p>

                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatReviewDate(
                                  review.created_at
                                )}
                              </p>
                            </div>
                          </div>

                          <RatingStars
                            rating={Number(
                              review.rating
                            )}
                          />
                        </div>

                        <p className="mt-5 whitespace-pre-wrap leading-7 text-gray-700 dark:text-gray-300">
                          {review.comment}
                        </p>

                        {review.updated_at &&
                          review.created_at &&
                          new Date(
                            review.updated_at
                          ).getTime() >
                            new Date(
                              review.created_at
                            ).getTime() +
                              1000 && (
                            <p className="mt-3 text-xs italic text-gray-400">
                              Edited
                            </p>
                          )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}