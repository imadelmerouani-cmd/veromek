import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-950 transition-colors dark:from-zinc-950 dark:via-zinc-900 dark:to-black dark:text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2">
        <div>
          <span className="inline-block rounded-full bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">
            New Collection 2026
          </span>

          <h1 className="mt-6 text-5xl font-black leading-tight lg:text-7xl">
            Elevate Your
            <span className="block text-gray-500 dark:text-gray-400">
              Style.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600 dark:text-gray-300">
            Discover premium shoes, clothing, jewelry, bags and watches
            designed for people who love quality and modern fashion.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="flex items-center gap-2 rounded-xl bg-black px-8 py-4 font-semibold text-white transition hover:scale-105 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <ShoppingBag size={20} />
              Shop Now
            </Link>

            <Link
              to="/shop"
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-8 py-4 font-semibold text-gray-950 transition hover:bg-gray-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
            >
              Explore
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="overflow-hidden rounded-3xl bg-white p-5 shadow-2xl transition-colors dark:bg-zinc-900">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"
              alt="Red sneakers"
              className="h-[500px] w-[450px] rounded-2xl object-cover transition duration-500 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}