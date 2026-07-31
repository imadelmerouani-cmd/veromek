import { Camera, MessageSquareQuote, PackageCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SocialProof() {
  const { t } = useTranslation();
  const items = [
    { icon: PackageCheck, title: t("socialProof.deliveryTitle"), text: t("socialProof.deliveryText") },
    { icon: Camera, title: t("socialProof.contentTitle"), text: t("socialProof.contentText") },
    { icon: MessageSquareQuote, title: t("socialProof.feedbackTitle"), text: t("socialProof.feedbackText") },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-[36px] bg-black px-6 py-12 text-white dark:bg-white dark:text-black sm:px-10 lg:px-14">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-gray-400">{t("socialProof.eyebrow")}</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t("socialProof.title")}</h2>
          <p className="mt-5 text-lg leading-8 text-gray-300 dark:text-gray-600">{t("socialProof.description")}</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-3xl bg-white/10 p-6 dark:bg-black/10">
              <Icon size={26} />
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-gray-300 dark:text-gray-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
