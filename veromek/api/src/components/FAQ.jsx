import { useTranslation } from "react-i18next";

export default function FAQ() {
  const { t } = useTranslation();
  const faqs = t("faq.items", { returnObjects: true });

  return (
    <section className="bg-gray-50 py-20 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-gray-400">{t("faq.eyebrow")}</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t("faq.title")}</h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-gray-600 dark:text-gray-400">{t("faq.description")}</p>
        </div>
        <div className="divide-y divide-gray-200 rounded-3xl border border-gray-200 bg-white px-6 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {Array.isArray(faqs) && faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="cursor-pointer list-none pr-8 text-lg font-black">{faq.question}</summary>
              <p className="mt-3 max-w-2xl leading-7 text-gray-500 dark:text-gray-400">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
