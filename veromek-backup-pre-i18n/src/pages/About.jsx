import {
  CheckCircle2,
  Globe2,
  HeartHandshake,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "../components/layout/Layout";

const VALUES = [
  {
    icon: PackageCheck,
    title: "Curated products",
    description:
      "We focus on a clear, carefully selected catalogue rather than an overwhelming shopping experience.",
  },
  {
    icon: ShieldCheck,
    title: "Secure experience",
    description:
      "We build the store around secure accounts, protected order handling and transparent policies.",
  },
  {
    icon: HeartHandshake,
    title: "Customer support",
    description:
      "We aim to communicate clearly and help customers before, during and after an order.",
  },
  {
    icon: Sparkles,
    title: "Modern design",
    description:
      "VeroMek combines a premium visual identity with a simple and responsive shopping experience.",
  },
];

const PRINCIPLES = [
  "Clear product information and pricing.",
  "Transparent shipping and return policies.",
  "Respect for customer privacy and security.",
  "Continuous improvement of the shopping experience.",
];

export default function About() {
  return (
    <Layout>
      <section className="overflow-hidden bg-black text-white dark:bg-white dark:text-black">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center sm:py-24">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-600">
              About VeroMek
            </p>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
              Premium style.
              <br />
              Simple shopping.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300 dark:text-gray-600">
              VeroMek is an online store built
              around modern design, carefully
              presented products and a customer
              experience that stays clear from
              discovery to delivery.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800"
              >
                Explore the shop
              </Link>

              <Link
                to="/contact"
                className="rounded-xl border border-white/30 px-6 py-3 font-bold transition hover:bg-white/10 dark:border-black/30 dark:hover:bg-black/10"
              >
                Contact us
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl dark:bg-black/10" />

            <div className="relative grid gap-4 sm:grid-cols-2">
              <div className="rounded-[32px] bg-white/10 p-7 backdrop-blur dark:bg-black/10">
                <ShoppingBag size={32} />

                <p className="mt-8 text-4xl font-black">
                  Easy
                </p>

                <p className="mt-2 text-gray-300 dark:text-gray-600">
                  Simple browsing, cart and checkout.
                </p>
              </div>

              <div className="rounded-[32px] bg-white p-7 text-black dark:bg-black dark:text-white sm:mt-12">
                <Globe2 size={32} />

                <p className="mt-8 text-4xl font-black">
                  Modern
                </p>

                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Responsive and ready for customers.
                </p>
              </div>

              <div className="rounded-[32px] bg-white p-7 text-black dark:bg-black dark:text-white">
                <ShieldCheck size={32} />

                <p className="mt-8 text-4xl font-black">
                  Secure
                </p>

                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Protected accounts and order handling.
                </p>
              </div>

              <div className="rounded-[32px] bg-white/10 p-7 backdrop-blur dark:bg-black/10 sm:mt-12">
                <Users size={32} />

                <p className="mt-8 text-4xl font-black">
                  Human
                </p>

                <p className="mt-2 text-gray-300 dark:text-gray-600">
                  Clear support when customers need help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            Our purpose
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            A store customers can understand
            and trust
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Our goal is to remove unnecessary
            friction from online shopping. Product
            information, delivery expectations,
            order status and support should all
            remain easy to find.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {VALUES.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <article
                key={title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-xl font-black">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </article>
            )
          )}
        </div>

        <div className="mt-16 grid gap-10 rounded-[36px] border border-gray-200 bg-gray-50 p-7 dark:border-zinc-800 dark:bg-zinc-950 lg:grid-cols-2 lg:p-12">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
              Our approach
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Built for long-term improvement
            </h2>

            <p className="mt-5 leading-8 text-gray-600 dark:text-gray-400">
              VeroMek is designed as a flexible
              ecommerce platform. The catalogue,
              branding, policies, payment methods
              and delivery options can evolve as
              the business grows.
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h3 className="text-xl font-black">
              What guides us
            </h3>

            <ul className="mt-6 space-y-4">
              {PRINCIPLES.map(
                (principle) => (
                  <li
                    key={principle}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                    />

                    <span className="leading-7 text-gray-600 dark:text-gray-400">
                      {principle}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-16 rounded-[36px] bg-black px-7 py-12 text-center text-white dark:bg-white dark:text-black sm:px-12">
          <h2 className="text-3xl font-black sm:text-4xl">
            Questions about VeroMek?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-300 dark:text-gray-600">
            Our support page includes contact
            details, assistance hours and a secure
            contact form.
          </p>

          <Link
            to="/contact"
            className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800"
          >
            Contact our team
          </Link>
        </div>
      </section>
    </Layout>
  );
}