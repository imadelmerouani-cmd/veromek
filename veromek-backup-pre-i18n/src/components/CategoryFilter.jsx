const categories = [
  "All",
  "Shoes",
  "Clothing",
  "Watch",
  "Bag",
];

export default function CategoryFilter({ selected, setSelected }) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelected(category)}
          className={`rounded-lg px-5 py-2 transition ${
            selected === category
              ? "bg-black text-white"
              : "border hover:bg-gray-100"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}