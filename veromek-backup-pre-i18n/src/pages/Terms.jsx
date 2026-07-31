import {
  AlertTriangle,
  FileCheck2,
  Gavel,
  Mail,
  Scale,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
} from "lucide-react";

import Layout from "../components/layout/Layout";

const TERMS_CARDS = [
  {
    icon: ShoppingBag,
    title: "Orders",
    description:
      "Orders are subject to availability, verification and acceptance.",
  },
  {
    icon: ShieldCheck,
    title: "Payments",
    description:
      "Payments must be authorised and may be reviewed for fraud prevention.",
  },
  {
    icon: UserCheck,
    title: "Accounts",
    description:
      "You are responsible for keeping your account details and password secure.",
  },
  {
    icon: Gavel,
    title: "Legal terms",
    description:
      "These terms govern your use of the website and purchases from VeroMek.",
  },
];

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of these terms",
    content: [
      "By accessing this website, creating an account or placing an order, you agree to these Terms & Conditions.",
      "If you do not agree with these terms, do not use the website or place an order.",
      "You must have the legal capacity required in your country to enter into a purchase agreement.",
    ],
  },
  {
    title: "2. About VeroMek",
    content: [
      "VeroMek operates this online store and provides the products and services displayed on the website.",
      "You can contact us at support@veromek.com for customer support or legal notices.",
    ],
  },
  {
    title: "3. Accounts",
    content: [
      "You must provide accurate, complete and current information when creating an account.",
      "You are responsible for keeping your password confidential and for activity performed through your account.",
      "Notify us immediately if you believe your account has been accessed without permission.",
      "We may suspend or close accounts used for fraud, abuse, unlawful activity or repeated violations of these terms.",
    ],
  },
  {
    title: "4. Product information",
    content: [
      "We aim to present product descriptions, images, colours, prices and availability accurately.",
      "Colours and appearance may vary depending on the device, display settings and photography.",
      "Minor differences that do not materially affect the product may not be considered defects.",
      "We may correct errors, update information or withdraw products without prior notice.",
    ],
  },
  {
    title: "5. Prices and taxes",
    content: [
      "Prices are shown in the currency displayed on the website and may change without notice.",
      "The price confirmed at checkout applies to your order, subject to correction of obvious pricing errors.",
      "Taxes, duties, customs charges and shipping fees may apply depending on the destination and will be shown where possible.",
    ],
  },
  {
    title: "6. Orders and acceptance",
    content: [
      "Submitting an order is an offer to purchase the selected products.",
      "An order confirmation acknowledges receipt but does not always mean the order has been finally accepted.",
      "We may reject or cancel an order because of unavailable stock, payment failure, suspected fraud, pricing error, delivery restrictions or legal requirements.",
      "If we cancel a paid order, we will refund the amount received for the cancelled items.",
    ],
  },
  {
    title: "7. Payment",
    content: [
      "You must use a valid and authorised payment method.",
      "Payments may be processed by third-party providers under their own terms and privacy policies.",
      "We may perform security, identity or fraud checks before accepting or fulfilling an order.",
      "You must not attempt to use stolen, unauthorised or fraudulent payment information.",
    ],
  },
  {
    title: "8. Coupons and promotions",
    content: [
      "Coupons and promotions are subject to their stated conditions, including expiry dates, minimum order values and usage limits.",
      "Unless stated otherwise, only one coupon may be used per order.",
      "Coupons have no cash value and cannot be transferred, resold or exchanged for money.",
      "We may cancel promotional benefits obtained through fraud, abuse, technical error or violation of campaign rules.",
    ],
  },
  {
    title: "9. Shipping and delivery",
    content: [
      "Shipping options, costs and estimates are shown during checkout and explained in our Shipping Policy.",
      "Delivery dates are estimates unless expressly guaranteed.",
      "You are responsible for providing a complete and accurate delivery address.",
      "Risk and responsibility for the parcel may transfer according to applicable law and the selected delivery method.",
    ],
  },
  {
    title: "10. Returns and refunds",
    content: [
      "Returns, exchanges and refunds are governed by our Return & Refund Policy.",
      "Products must meet the eligibility conditions and be returned within the applicable period.",
      "Mandatory consumer rights available under local law are not limited by these terms.",
    ],
  },
  {
    title: "11. Reviews and user content",
    content: [
      "Reviews and other submitted content must be honest, relevant and lawful.",
      "You must not submit abusive, defamatory, misleading, discriminatory, infringing or fraudulent content.",
      "You grant us a non-exclusive right to display and use submitted content for operating and promoting the store.",
      "We may remove content that violates these terms or applicable law.",
    ],
  },
  {
    title: "12. Intellectual property",
    content: [
      "The website design, text, graphics, logos, software and original content are protected by intellectual-property laws.",
      "You may use the website only for personal and lawful shopping purposes.",
      "You must not copy, reproduce, distribute, scrape, reverse engineer or commercially exploit website content without permission.",
      "Third-party trademarks and content remain the property of their respective owners.",
    ],
  },
  {
    title: "13. Prohibited use",
    content: [
      "You must not use the website for unlawful, fraudulent or harmful activity.",
      "You must not interfere with security, introduce malicious code, overload systems or attempt unauthorised access.",
      "You must not impersonate another person, submit false information or manipulate prices, stock, coupons or reviews.",
    ],
  },
  {
    title: "14. Service availability",
    content: [
      "We do not guarantee that the website will always be uninterrupted, error-free or available.",
      "We may suspend, update or discontinue parts of the website for maintenance, security or business reasons.",
      "We are not responsible for temporary unavailability caused by events outside our reasonable control.",
    ],
  },
  {
    title: "15. Limitation of liability",
    content: [
      "To the maximum extent permitted by law, we are not liable for indirect, incidental or consequential losses arising from use of the website.",
      "Nothing in these terms excludes liability that cannot legally be excluded, including mandatory consumer protections.",
      "Our total liability relating to a purchase will not exceed the amount paid for the affected order, except where law requires otherwise.",
    ],
  },
  {
    title: "16. Indemnity",
    content: [
      "Where permitted by law, you agree to compensate us for reasonable losses caused by your unlawful use of the website or serious breach of these terms.",
    ],
  },
  {
    title: "17. Changes to these terms",
    content: [
      "We may update these terms to reflect changes in law, services, technology or business practices.",
      "The current version will be posted on this page with an updated revision date.",
      "Changes apply from publication unless a later date is stated.",
    ],
  },
  {
    title: "18. Governing law and disputes",
    content: [
      "These terms are governed by the law applicable to the business and customer relationship, subject to mandatory consumer protections.",
      "Before starting formal proceedings, contact us so we can try to resolve the issue.",
      "Consumers may have rights to use local courts or recognised dispute-resolution procedures.",
    ],
  },
  {
    title: "19. Contact",
    content: [
      "Questions about these terms can be sent to support@veromek.com.",
    ],
  },
];

export default function Terms() {
  return (
    <Layout>
      <section className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-24">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
            <Scale size={27} />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            Legal Information
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-6xl dark:text-white">
            Terms & Conditions
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
            These terms explain the rules that
            apply when you use VeroMek or place
            an order.
          </p>

          <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
            Last updated: July 27, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {TERMS_CARDS.map(
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

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
          <article className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-9">
            <div className="flex items-start gap-4 rounded-2xl bg-amber-50 p-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle
                size={23}
                className="mt-0.5 shrink-0"
              />

              <p className="text-sm leading-6">
                These terms are a general store
                template. Before launch, update
                business details and review them
                for the laws that apply to your
                actual activity and customers.
              </p>
            </div>

            <div className="mt-9 space-y-10">
              {TERMS_SECTIONS.map(
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
              <FileCheck2 size={30} />

              <h2 className="mt-5 text-2xl font-black">
                By using VeroMek
              </h2>

              <ul className="mt-5 space-y-4 text-sm leading-6 text-gray-300 dark:text-gray-600">
                <li>
                  Provide accurate information.
                </li>

                <li>
                  Use authorised payment methods.
                </li>

                <li>
                  Respect website security and content.
                </li>

                <li>
                  Follow the applicable policies.
                </li>
              </ul>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
              <Gavel size={28} />

              <h2 className="mt-5 text-xl font-black">
                Consumer rights
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Mandatory consumer rights under
                applicable law remain protected.
              </p>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
              <Mail size={28} />

              <h2 className="mt-5 text-xl font-black">
                Legal questions
              </h2>

              <a
                href="mailto:support@veromek.com"
                className="mt-5 inline-flex items-center gap-2 font-bold hover:underline"
              >
                <Mail size={17} />
                support@veromek.com
              </a>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}