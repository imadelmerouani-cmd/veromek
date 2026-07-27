import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Mail,
  PackageOpen,
  RefreshCcw,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";

import Layout from "../components/layout/Layout";

const RETURN_STEPS = [
  {
    icon: Mail,
    title: "Contact support",
    description:
      "Send us your order number, the email used at checkout and the reason for the return.",
  },
  {
    icon: PackageOpen,
    title: "Prepare the item",
    description:
      "Keep the product unused, complete and in its original packaging with all labels and accessories.",
  },
  {
    icon: Truck,
    title: "Ship the return",
    description:
      "Use the return instructions provided by our support team and keep your shipping receipt.",
  },
  {
    icon: RefreshCcw,
    title: "Refund review",
    description:
      "Once the parcel arrives, we inspect the item and notify you about approval or rejection.",
  },
];

const ELIGIBLE_ITEMS = [
  "Unused products returned in their original condition.",
  "Items returned with original packaging, labels and included accessories.",
  "Products reported within the return period stated on this page.",
  "Incorrect, defective or damaged items reported promptly after delivery.",
];

const NON_RETURNABLE_ITEMS = [
  "Products that have been worn, used, washed, altered or damaged after delivery.",
  "Items missing packaging, labels, accessories or proof of purchase.",
  "Personalised, made-to-order or custom products.",
  "Hygiene-sensitive products once opened, where applicable.",
  "Gift cards, downloadable products and final-sale items.",
  "Items returned after the applicable return period without prior approval.",
];

const POLICY_SECTIONS = [
  {
    title: "1. Return period",
    content: [
      "You may request a return within 14 calendar days after receiving your order, unless a longer period is shown on the product page or required by applicable law.",
      "The return request must be submitted before the return period expires.",
      "Contacting us within the return period does not automatically approve the return. The item must also meet the eligibility conditions below.",
    ],
  },
  {
    title: "2. Return eligibility",
    content: [
      "Returned products must be unused, unworn, unwashed and in the same condition in which they were received.",
      "Original packaging, labels, protective materials, accessories and gifts included with the product must be returned.",
      "We may reduce or refuse a refund when the item has lost value because it was handled beyond what is reasonably necessary to inspect it.",
    ],
  },
  {
    title: "3. How to request a return",
    content: [
      "Email support@veromek.com with your order number, full name, the email used at checkout and the reason for the return.",
      "For damaged, defective or incorrect products, include clear photos of the item, packaging and shipping label.",
      "Do not send a parcel before receiving return instructions. Unauthorised returns may be delayed, refused or returned to the sender.",
    ],
  },
  {
    title: "4. Return shipping costs",
    content: [
      "When the return is caused by a change of mind, wrong size selection or customer error, return shipping costs are normally paid by the customer.",
      "When the product is confirmed to be defective, damaged on arrival or incorrect, VeroMek may provide a prepaid label or reimburse reasonable return shipping costs.",
      "Original shipping fees are non-refundable unless required by law or the entire order is returned because of our error.",
    ],
  },
  {
    title: "5. Inspection and approval",
    content: [
      "Returned items are inspected after arrival at the designated return address.",
      "We will notify you by email whether the return has been approved, partially approved or rejected.",
      "Inspection normally takes 3–7 business days after the parcel is received, but may take longer during high-volume periods.",
    ],
  },
  {
    title: "6. Refund method and timing",
    content: [
      "Approved refunds are issued to the original payment method whenever possible.",
      "After approval, the refund is normally initiated within 5–10 business days.",
      "Your bank, card issuer or payment provider may need additional time before the refund appears in your account.",
    ],
  },
  {
    title: "7. Partial refunds",
    content: [
      "A partial refund may apply when an item is returned with signs of use, missing packaging, missing accessories or reduced value.",
      "The deduction will reflect the condition of the returned product and any reasonable loss in value.",
      "We will explain any deduction in the return decision email.",
    ],
  },
  {
    title: "8. Exchanges",
    content: [
      "Direct exchanges may not always be available.",
      "When an exchange is unavailable, you may need to return the original item for a refund and place a new order.",
      "Availability, price and promotional discounts are not guaranteed for replacement orders.",
    ],
  },
  {
    title: "9. Damaged, defective or incorrect items",
    content: [
      "Inspect your order as soon as it arrives.",
      "Report damaged, defective or incorrect items promptly and include clear photos.",
      "Depending on the circumstances, we may offer a replacement, repair, partial refund or full refund.",
    ],
  },
  {
    title: "10. Orders not received",
    content: [
      "If tracking shows delivery but you cannot locate the parcel, first check with household members, neighbours, reception areas and the carrier.",
      "Contact us promptly so we can review the shipment and assist with a carrier investigation.",
      "A refund or replacement may depend on the result of the carrier investigation and the delivery evidence available.",
    ],
  },
  {
    title: "11. Chargebacks and payment disputes",
    content: [
      "Contact us before starting a payment dispute so we have an opportunity to resolve the issue.",
      "Starting a chargeback does not guarantee a refund and may delay the resolution process.",
      "We may provide order, delivery and communication records to the payment provider when responding to a dispute.",
    ],
  },
  {
    title: "12. Consumer rights",
    content: [
      "This policy does not remove any mandatory consumer rights that apply in your country.",
      "Where local law gives you stronger rights than this policy, the applicable legal rights will take priority.",
    ],
  },
];

export default function RefundPolicy() {
  return (
    <Layout>
      <section className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-24">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
            <RefreshCcw size={27} />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            Returns & Refunds
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-6xl dark:text-white">
            Return & Refund Policy
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
            Read the conditions, deadlines and
            process for returning an order or
            requesting a refund.
          </p>

          <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
            Last updated: July 27, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {RETURN_STEPS.map(
            ({
              icon: Icon,
              title,
              description,
            },
            index) => (
              <article
                key={title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
                    <Icon size={23} />
                  </div>

                  <span className="text-sm font-black text-gray-300 dark:text-zinc-700">
                    0{index + 1}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-black">
                  {title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </article>
            )
          )}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <article className="rounded-[32px] border border-green-200 bg-green-50 p-7 dark:border-green-900 dark:bg-green-950/20 sm:p-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600 dark:text-green-300" />

              <h2 className="text-2xl font-black text-green-800 dark:text-green-200">
                Usually eligible
              </h2>
            </div>

            <ul className="mt-6 space-y-4 text-sm leading-6 text-green-800 dark:text-green-300">
              {ELIGIBLE_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[32px] border border-red-200 bg-red-50 p-7 dark:border-red-900 dark:bg-red-950/20 sm:p-8">
            <div className="flex items-center gap-3">
              <XCircle className="text-red-600 dark:text-red-300" />

              <h2 className="text-2xl font-black text-red-800 dark:text-red-200">
                Usually not eligible
              </h2>
            </div>

            <ul className="mt-6 space-y-4 text-sm leading-6 text-red-800 dark:text-red-300">
              {NON_RETURNABLE_ITEMS.map(
                (item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <XCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          </article>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
          <article className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-9">
            <div className="flex items-start gap-4 rounded-2xl bg-amber-50 p-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertCircle
                size={23}
                className="mt-0.5 shrink-0"
              />

              <p className="text-sm leading-6">
                Do not return an item before
                receiving instructions from our
                support team. The approved return
                address may be different from the
                address printed on the parcel.
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
              <Clock3 size={30} />

              <h2 className="mt-5 text-2xl font-black">
                Return deadline
              </h2>

              <p className="mt-4 text-4xl font-black">
                14 days
              </p>

              <p className="mt-4 text-sm leading-6 text-gray-300 dark:text-gray-600">
                Request the return within 14
                calendar days after delivery,
                unless another period applies.
              </p>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
              <ShieldCheck size={28} />

              <h2 className="mt-5 text-xl font-black">
                Request a return
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Include your order number, email
                and reason for the return.
              </p>

              <a
                href="mailto:support@veromek.com"
                className="mt-5 inline-flex items-center gap-2 font-bold hover:underline"
              >
                <Mail size={17} />
                support@veromek.com
              </a>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
              <PackageOpen size={28} />

              <h2 className="mt-5 text-xl font-black">
                Keep your evidence
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Keep the original packaging,
                photos, tracking number and return
                shipping receipt until the case is
                closed.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}