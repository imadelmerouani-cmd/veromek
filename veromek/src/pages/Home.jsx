import Layout from "../components/layout/Layout";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";

export default function Home() {
  return (
    <Layout>
      <Hero />
      <Categories />
      <FeaturedProducts />
    </Layout>
  );
}