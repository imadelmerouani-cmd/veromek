import { CheckCircle2, HeartHandshake, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../components/layout/Layout";

const icons = [PackageCheck, ShieldCheck, HeartHandshake, Sparkles];

export default function About() {
  const { t } = useTranslation();
  const values = t("about.values", { returnObjects: true });
  const principles = t("about.principles", { returnObjects: true });

  return (
    <Layout>
      <section className="overflow-hidden bg-black text-white dark:bg-white dark:text-black">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-600">{t("about.eyebrow")}</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{t("about.title1")}<br />{t("about.title2")}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300 dark:text-gray-600">{t("about.intro")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop" className="rounded-xl bg-white px-6 py-3 font-bold text-black dark:bg-black dark:text-white">{t("about.shop")}</Link>
              <Link to="/contact" className="rounded-xl border border-white/30 px-6 py-3 font-bold dark:border-black/30">{t("about.contact")}</Link>
            </div>
          </div>
          <div className="rounded-[36px] bg-white/10 p-8 dark:bg-black/10">
            <h2 className="text-3xl font-black">{t("about.storyTitle")}</h2>
            <p className="mt-5 text-lg leading-8 text-gray-300 dark:text-gray-600">{t("about.story")}</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-4xl font-black">{t("about.valuesTitle")}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {values.map((item,index)=>{ const Icon=icons[index]; return <article key={item.title} className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"><Icon size={24}/><h3 className="mt-5 text-xl font-black">{item.title}</h3><p className="mt-3 leading-7 text-gray-500 dark:text-gray-400">{item.text}</p></article>; })}
        </div>
        <div className="mt-16 grid gap-8 rounded-[36px] bg-gray-50 p-8 dark:bg-zinc-950 lg:grid-cols-2">
          <h2 className="text-3xl font-black">{t("about.principlesTitle")}</h2>
          <ul className="space-y-4">{principles.map(item=><li key={item} className="flex gap-3"><CheckCircle2 className="shrink-0" size={21}/><span>{item}</span></li>)}</ul>
        </div>
        <div className="mt-16 rounded-[36px] bg-black p-10 text-center text-white dark:bg-white dark:text-black"><h2 className="text-4xl font-black">{t("about.ctaTitle")}</h2><p className="mx-auto mt-4 max-w-2xl text-gray-300 dark:text-gray-600">{t("about.ctaText")}</p><Link to="/shop" className="mt-7 inline-flex rounded-xl bg-white px-7 py-3 font-black text-black dark:bg-black dark:text-white">{t("about.ctaButton")}</Link></div>
      </section>
    </Layout>
  );
}
