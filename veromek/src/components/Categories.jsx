import { Link } from "react-router-dom";

const categories = [
  { name: "Shoes", icon: "👟" },
  { name: "Clothing", icon: "👕" },
  { name: "Jewelry", icon: "💎" },
  { name: "Bag", icon: "👜" },
  { name: "Watch", icon: "⌚" },
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-12 text-center text-4xl font-bold text-gray-900 dark:text-white">
        Shop by Category
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={`/shop?category=${category.name}`}
            className="group rounded-2xl border border-gray-200 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-white"
          >
            <div className="text-5xl transition-transform duration-300 group-hover:scale-110">
              {category.icon}
            </div>

            <h3 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}