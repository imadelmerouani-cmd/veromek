import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function FinalCTA() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="overflow-hidden rounded-[36px] bg-gradient-to-r from-zinc-950 to-zinc-800 px-7 py-14 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-gray-400">{t("finalCta.eyebrow")}</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">{t("finalCta.title")}</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">{t("finalCta.description")}</p>
        </div>
        <Link to="/shop" className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:-translate-y-0.5 hover:bg-gray-200 lg:mt-0">
          <ShoppingBag size={20} />{t("finalCta.button")}<ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
