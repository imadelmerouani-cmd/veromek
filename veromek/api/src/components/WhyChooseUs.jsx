import { Gem, MessageCircle, PackageSearch, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WhyChooseUs() {
  const { t } = useTranslation();
  const reasons = [
    { icon: Gem, title: t("whyChooseUs.curatedTitle"), text: t("whyChooseUs.curatedText") },
    { icon: PackageSearch, title: t("whyChooseUs.detailsTitle"), text: t("whyChooseUs.detailsText") },
    { icon: ShieldCheck, title: t("whyChooseUs.saferTitle"), text: t("whyChooseUs.saferText") },
    { icon: MessageCircle, title: t("whyChooseUs.supportTitle"), text: t("whyChooseUs.supportText") },
  ];

  return (
    <section className="bg-gray-50 py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-gray-400">{t("whyChooseUs.eyebrow")}</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t("whyChooseUs.title")}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-400">{t("whyChooseUs.description")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black"><Icon size={23} /></div>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-gray-500 dark:text-gray-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
