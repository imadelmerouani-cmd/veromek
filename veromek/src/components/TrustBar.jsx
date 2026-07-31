import {
  BadgeCheck,
  Headphones,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TrustBar() {
  const { t } = useTranslation();

  const items = [
    {
      icon: PackageCheck,
      title: t("trustBar.trackedDeliveryTitle"),
      text: t("trustBar.trackedDeliveryText"),
    },
    {
      icon: ShieldCheck,
      title: t("trustBar.secureShoppingTitle"),
      text: t("trustBar.secureShoppingText"),
    },
    {
      icon: BadgeCheck,
      title: t("trustBar.selectedProductsTitle"),
      text: t("trustBar.selectedProductsText"),
    },
    {
      icon: Headphones,
      title: t("trustBar.realSupportTitle"),
      text: t("trustBar.realSupportText"),
    },
  ];

  return (
    <section className="border-y border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-4 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="flex gap-4 rounded-2xl p-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-900">
              <Icon size={21} />
            </div>

            <div>
              <h2 className="font-black">
                {title}
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
