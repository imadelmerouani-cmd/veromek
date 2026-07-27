export default function SearchBar({ search, setSearch }) {
  return (
    <div className="mb-8">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-xl border border-gray-300 px-5 py-3 outline-none transition focus:border-black"
      />
    </div>
  );
}