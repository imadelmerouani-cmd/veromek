import Layout from "../components/layout/Layout";
import Hero from "../components/Hero";
import TrustBar from "../components/TrustBar";
import FeaturedProducts from "../components/FeaturedProducts";
import DeliveryProof from "../components/DeliveryProof";
import Categories from "../components/Categories";
import WhyChooseUs from "../components/WhyChooseUs";
import SocialProof from "../components/SocialProof";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";

export default function Home() {
  return (
    <Layout>
      <Hero />
      <TrustBar />
      <FeaturedProducts />
      <DeliveryProof />
      <Categories />
      <WhyChooseUs />
      <SocialProof />
      <FAQ />
      <FinalCTA />
    </Layout>
  );
}