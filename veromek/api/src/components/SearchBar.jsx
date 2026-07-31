import { useTranslation } from "react-i18next";

export default function SearchBar({ search, setSearch }) {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t("shop.search")}
        className="w-full rounded-xl border border-gray-300 px-5 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  );
}
