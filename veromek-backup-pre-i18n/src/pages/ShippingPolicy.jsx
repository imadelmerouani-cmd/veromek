import {
  Clock3,
  Globe2,
  Mail,
  MapPin,
  PackageCheck,
  Plane,
  ShieldCheck,
  Truck,
} from "lucide-react";

import Layout from "../components/layout/Layout";

const SHIPPING_METHODS = [
  {
    icon: Truck,
    title: "Standard Shipping",
    time: "5–10 business days",
    description:
      "Available for most destinations. Delivery time starts after your order has been processed.",
  },
  {
    icon: Plane,
    title: "Express Shipping",
    time: "2–5 business days",
    description:
      "Available for selected destinations. Extra charges may apply depending on the delivery address.",
  },
  {
    icon: Globe2,
    title: "International Shipping",
    time: "7–20 business days",
    description:
      "International delivery times may vary because of customs processing and local carrier delays.",
  },
];

const POLICY_SECTIONS = [
  {
    title: "1. Order processing",
    content: [
      "Orders are normally processed within 1–3 business days after payment confirmation.",
      "Orders placed on weekends or public holidays are processed on the next business day.",
      "Processing times may be longer during sales, product launches, high-demand periods or holidays.",
    ],
  },
  {
    title: "2. Shipping costs",
    content: [
      "Shipping costs are displayed during checkout before you place your order.",
      "Free shipping may be offered when the order reaches the minimum amount shown at checkout.",
      "Promotional shipping offers may be limited by country, destination, product or campaign period.",
    ],
  },
  {
    title: "3. Delivery estimates",
    content: [
      "Delivery times are estimates and are not guaranteed unless explicitly stated.",
      "Delivery may be delayed by customs, weather, carrier disruption, incorrect address information or events outside our control.",
      "VeroMek is not responsible for delays caused by the shipping carrier after the parcel has been handed over, but we will assist you when possible.",
    ],
  },
  {
    title: "4. Tracking information",
    content: [
      "When tracking is available, the tracking number will appear in your order details after shipment.",
      "Tracking updates may take up to 48 hours to appear after the parcel has been collected by the carrier.",
      "Customers are responsible for monitoring tracking updates and delivery attempts.",
    ],
  },
  {
    title: "5. Delivery address",
    content: [
      "Customers must provide a complete and accurate delivery address during checkout.",
      "Contact us immediately if you notice an address error. We cannot guarantee changes after an order begins processing.",
      "Additional shipping charges caused by an incorrect or incomplete address may be charged to the customer.",
    ],
  },
  {
    title: "6. Customs, duties and taxes",
    content: [
      "International orders may be subject to customs duties, import taxes, brokerage fees or local charges.",
      "Unless stated otherwise at checkout, these charges are not included in the product price or shipping fee.",
      "The customer is responsible for paying any customs or import charges required by the destination country.",
    ],
  },
  {
    title: "7. Missed or refused delivery",
    content: [
      "If delivery is missed, follow the carrier instructions to arrange redelivery or collection.",
      "Orders returned because of repeated failed delivery, refusal, unpaid customs charges or an incorrect address may be refunded after return costs and non-refundable charges are deducted.",
    ],
  },
  {
    title: "8. Lost or damaged parcels",
    content: [
      "Contact us as soon as possible if your parcel arrives visibly damaged or does not arrive within a reasonable period after the estimated delivery date.",
      "Keep the packaging, shipping label and clear photos of any damage because the carrier may require evidence.",
      "Claims are reviewed with the shipping carrier before a replacement or refund decision is made.",
    ],
  },
];

export default function ShippingPolicy() {
  return (
    <Layout>
      <section className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-24">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
            <Truck size={27} />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            Delivery Information
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-6xl dark:text-white">
            Shipping Policy
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
            Learn how orders are processed,
            shipped and delivered.
          </p>

          <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
            Last updated: July 27, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {SHIPPING_METHODS.map(
            ({
              icon: Icon,
              title,
              time,
              description,
            }) => (
              <article
                key={title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
                  <Icon size={23} />
                </div>

                <h2 className="mt-5 text-xl font-black">
                  {title}
                </h2>

                <p className="mt-2 font-bold">
                  {time}
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </article>
            )
          )}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
          <article className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-9">
            <div className="flex items-start gap-4 rounded-2xl bg-blue-50 p-5 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
              <ShieldCheck
                size={23}
                className="mt-0.5 shrink-0"
              />

              <p className="text-sm leading-6">
                Shipping options, prices and
                estimated delivery times shown at
                checkout take priority over general
                estimates on this page.
              </p>
            </div>

            <div className="mt-9 space-y-10">
              {POLICY_SECTIONS.map(
                (section) => (
                  <section key={section.title}>
                    <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                      {section.title}
                    </h2>

                    <div className="mt-4 space-y-3 text-[15px] leading-7 text-gray-600 dark:text-gray-400">
                      {section.content.map(
                        (paragraph) => (
                          <p key={paragraph}>
                            {paragraph}
                          </p>
                        )
                      )}
                    </div>
                  </section>
                )
              )}
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[32px] bg-black p-7 text-white dark:bg-white dark:text-black">
              <PackageCheck size={30} />

              <h2 className="mt-5 text-2xl font-black">
                Before ordering
              </h2>

              <ul className="mt-5 space-y-4 text-sm leading-6 text-gray-300 dark:text-gray-600">
                <li>
                  Confirm your full delivery address.
                </li>

                <li>
                  Add a valid phone number and email.
                </li>

                <li>
                  Review the delivery estimate at checkout.
                </li>

                <li>
                  Check whether customs charges may apply.
                </li>
              </ul>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
              <Clock3 size={28} />

              <h2 className="mt-5 text-xl font-black">
                Need shipping help?
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Include your order number when
                contacting support.
              </p>

              <a
                href="mailto:support@veromek.com"
                className="mt-5 inline-flex items-center gap-2 font-bold hover:underline"
              >
                <Mail size={17} />
                support@veromek.com
              </a>

              <div className="mt-5 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>Valencia, Spain</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}