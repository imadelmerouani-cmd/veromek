import Layout from "../components/layout/Layout";
import ProductCard from "../components/product/ProductCard";
import { useWishlist } from "../context/WishlistContext";

export default function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="mb-8 text-4xl font-bold">
          ❤️ My Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center">
            <h2 className="text-2xl font-semibold">
              Your wishlist is empty
            </h2>

            <p className="mt-3 text-gray-500">
              Add products by clicking the heart icon.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}