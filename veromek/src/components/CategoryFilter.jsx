import { useTranslation } from "react-i18next";

const categories = [
  { value: "All", key: "all" },
  { value: "Shoes", key: "shoes" },
  { value: "Clothing", key: "clothing" },
  { value: "Watch", key: "watch" },
  { value: "Bag", key: "bag" },
];

export default function CategoryFilter({ selected, setSelected }) {
  const { t } = useTranslation();

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          type="button"
          key={category.value}
          onClick={() => setSelected(category.value)}
          className={`rounded-lg px-5 py-2 transition ${
            selected === category.value
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "border border-gray-200 hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          }`}
        >
          {t(`shop.${category.key}`)}
        </button>
      ))}
    </div>
  );
}
