import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Search,
  Star,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/layout/Navbar";
import { supabase } from "../lib/supabase";

const RATING_FILTERS = [
  {
    value: "all",
    label: "All ratings",
  },
  {
    value: "5",
    label: "5 stars",
  },
  {
    value: "4",
    label: "4 stars",
  },
  {
    value: "3",
    label: "3 stars",
  },
  {
    value: "2",
    label: "2 stars",
  },
  {
    value: "1",
    label: "1 star",
  },
];

function formatDate(value) {
  if (!value) {
    return "Unknown date";
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

function RatingStars({ rating }) {
  const normalizedRating = Math.max(
    0,
    Math.min(5, Number(rating) || 0)
  );

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${normalizedRating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map(
        (_, index) => {
          const active = index < normalizedRating;

          return (
            <Star
              key={index}
              size={17}
              className={
                active
                  ? "text-yellow-500"
                  : "text-gray-300 dark:text-zinc-700"
              }
              fill={
                active
                  ? "currentColor"
                  : "none"
              }
            />
          );
        }
      )}
    </div>
  );
}

function ReviewCard({
  review,
  deleting,
  onDelete,
}) {
  const reviewerName =
    review.reviewer_name ||
    review.user_name ||
    review.full_name ||
    "Customer";

  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
            <User size={21} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-black">
              {reviewerName}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Product #{review.product_id}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <RatingStars
                rating={review.rating}
              />

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                {review.rating}/5
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(review)}
          disabled={deleting}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:hover:bg-red-950/30"
        >
          {deleting ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={18} />
          )}

          {deleting
            ? "Deleting..."
            : "Delete"}
        </button>
      </div>

      <div className="mt-5 rounded-2xl bg-gray-50 p-5 dark:bg-zinc-950">
        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-300">
          {review.comment ||
            "No written comment."}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
        <span>
          Review ID: {review.id}
        </span>

        <span>
          {formatDate(review.created_at)}
        </span>
      </div>
    </article>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] =
    useState("");
  const [ratingFilter, setRatingFilter] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [deletingReviewId, setDeletingReviewId] =
    useState(null);

  const fetchReviews = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
              created_at
            `
          )
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        setReviews(data ?? []);

        if (silent) {
          toast.success("Reviews updated.");
        }
      } catch (error) {
        console.error(
          "Failed to load admin reviews:",
          error
        );

        toast.error(
          error.message ||
            "Failed to load reviews."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async (
    review
  ) => {
    const reviewerName =
      review.reviewer_name || "this customer";

    const confirmed = window.confirm(
      `Delete the review from ${reviewerName}?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingReviewId(review.id);

    try {
      const { data, error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Supabase did not delete this review. Check the reviews DELETE policy and your admin role."
        );
      }

      setReviews((currentReviews) =>
        currentReviews.filter(
          (currentReview) =>
            String(currentReview.id) !==
            String(review.id)
        )
      );

      toast.success(
        "Review deleted successfully."
      );
    } catch (error) {
      console.error(
        "Failed to delete review:",
        error
      );

      toast.error(
        error.message ||
          "Failed to delete review."
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    const cleanSearch = searchTerm
      .trim()
      .toLowerCase();

    return reviews.filter((review) => {
      const matchesRating =
        ratingFilter === "all" ||
        Number(review.rating) ===
          Number(ratingFilter);

      if (!matchesRating) {
        return false;
      }

      if (!cleanSearch) {
        return true;
      }

      const searchableValues = [
        review.id,
        review.product_id,
        review.reviewer_name,
        review.comment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableValues.includes(
        cleanSearch
      );
    });
  }, [reviews, searchTerm, ratingFilter]);

  const statistics = useMemo(() => {
    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
            (total, review) =>
              total +
              Number(review.rating || 0),
            0
          ) / reviews.length
        : 0;

    return {
      total: reviews.length,
      average: averageRating,
      fiveStars: reviews.filter(
        (review) =>
          Number(review.rating) === 5
      ).length,
      fourStars: reviews.filter(
        (review) =>
          Number(review.rating) === 4
      ).length,
      lowRatings: reviews.filter(
        (review) =>
          Number(review.rating) <= 2
      ).length,
    };
  }, [reviews]);

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
              Loading reviews...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-zinc-950 dark:text-white">
      <Navbar />

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
              Review management
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              View customer feedback, filter
              ratings and remove inappropriate
              reviews.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchReviews({
                silent: true,
              })
            }
            disabled={refreshing}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-5 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
              : "Refresh reviews"}
          </button>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <MessageSquareText className="text-gray-400" />

            <p className="mt-4 text-2xl font-black">
              {statistics.total}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total reviews
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Star
              className="text-yellow-500"
              fill="currentColor"
            />

            <p className="mt-4 text-2xl font-black">
              {statistics.average.toFixed(1)}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Average rating
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Star
              className="text-yellow-500"
              fill="currentColor"
            />

            <p className="mt-4 text-2xl font-black">
              {statistics.fiveStars}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Five-star reviews
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Star
              className="text-blue-500"
              fill="currentColor"
            />

            <p className="mt-4 text-2xl font-black">
              {statistics.fourStars}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Four-star reviews
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Star className="text-red-500" />

            <p className="mt-4 text-2xl font-black">
              {statistics.lowRatings}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Low ratings
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
                placeholder="Search customer, comment, product or review ID..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              />
            </label>

            <label className="relative block">
              <select
                value={ratingFilter}
                onChange={(event) =>
                  setRatingFilter(
                    event.target.value
                  )
                }
                className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-11 font-semibold outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
              >
                {RATING_FILTERS.map(
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
                {filteredReviews.length}
              </strong>{" "}
              of{" "}
              <strong className="text-black dark:text-white">
                {reviews.length}
              </strong>{" "}
              reviews
            </p>

            {(searchTerm ||
              ratingFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setRatingFilter("all");
                }}
                className="font-bold text-black hover:underline dark:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          {filteredReviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900 lg:col-span-2">
              <MessageSquareText
                size={48}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-5 text-xl font-black">
                No reviews found
              </h2>

              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Try changing your search or rating
                filter.
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                deleting={
                  String(deletingReviewId) ===
                  String(review.id)
                }
                onDelete={
                  handleDeleteReview
                }
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}