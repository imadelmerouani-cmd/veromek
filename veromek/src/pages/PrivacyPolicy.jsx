import {
  Cookie,
  Database,
  Eye,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import Layout from "../components/layout/Layout";

const PRIVACY_CARDS = [
  {
    icon: Database,
    title: "Data we collect",
    description:
      "Account details, order information, contact messages, device information and payment-related records.",
  },
  {
    icon: ShieldCheck,
    title: "Why we use it",
    description:
      "To operate the store, process orders, provide support, prevent fraud and improve our services.",
  },
  {
    icon: LockKeyhole,
    title: "How we protect it",
    description:
      "We use access controls, secure providers and reasonable technical and organisational safeguards.",
  },
  {
    icon: UserCheck,
    title: "Your choices",
    description:
      "You may request access, correction, deletion or restriction of certain personal data where applicable.",
  },
];

const POLICY_SECTIONS = [
  {
    title: "1. Who we are",
    content: [
      "VeroMek operates this online store and is responsible for the personal information described in this Privacy Policy.",
      "For privacy questions or requests, contact us at support@veromek.com.",
    ],
  },
  {
    title: "2. Information we collect",
    content: [
      "Account information, such as your name, email address, profile details and authentication records.",
      "Order and delivery information, including your billing details, shipping address, phone number, purchased products, order history and payment method.",
      "Contact information and message content when you submit a support request or contact form.",
      "Technical information, including IP address, browser type, device information, operating system, pages visited and approximate location derived from technical data.",
      "Cookie and usage information used to remember preferences, maintain sessions, analyse performance and improve the store.",
    ],
  },
  {
    title: "3. How we use personal information",
    content: [
      "To create and manage customer accounts.",
      "To process orders, payments, refunds, returns and deliveries.",
      "To provide customer support and respond to messages.",
      "To prevent fraud, abuse, unauthorised access and security incidents.",
      "To maintain, troubleshoot, improve and personalise the website.",
      "To comply with legal, tax, accounting and regulatory obligations.",
      "To send service-related messages, such as order confirmations, password resets and shipping updates.",
      "To send marketing communications only where permitted and where you have provided the required consent.",
    ],
  },
  {
    title: "4. Legal bases for processing",
    content: [
      "We may process personal information because it is necessary to perform a contract with you, such as processing an order.",
      "We may process information to comply with legal obligations, including tax, accounting and fraud-prevention requirements.",
      "We may rely on legitimate interests to secure, improve and operate the store, provided those interests do not override your rights.",
      "Where required, we rely on your consent, including for certain cookies or marketing communications.",
    ],
  },
  {
    title: "5. Payment information",
    content: [
      "Payment transactions may be processed by third-party payment providers.",
      "We do not intentionally store complete payment card numbers or security codes in our application.",
      "Payment providers process payment data according to their own privacy policies and security standards.",
    ],
  },
  {
    title: "6. How we share information",
    content: [
      "We may share necessary information with hosting providers, database providers, payment processors, delivery companies, email services, analytics providers and customer-support tools.",
      "We may share information with professional advisers, auditors, insurers, authorities or courts when required by law or reasonably necessary to protect legal rights.",
      "We do not sell personal information in exchange for money.",
      "Service providers may only use personal information to provide the services requested from them, subject to their contracts and legal obligations.",
    ],
  },
  {
    title: "7. International data transfers",
    content: [
      "Some service providers may process data in countries outside your country of residence.",
      "Where required, we use recognised safeguards for international data transfers, such as contractual protections or providers operating under approved legal mechanisms.",
    ],
  },
  {
    title: "8. Data retention",
    content: [
      "We keep personal information only for as long as reasonably necessary for the purposes described in this policy.",
      "Order, tax, payment and transaction records may be retained for longer periods where required by law.",
      "Support messages and account information may be retained while your account is active and for a reasonable period afterward.",
      "When information is no longer needed, we may delete, anonymise or securely archive it.",
    ],
  },
  {
    title: "9. Cookies and similar technologies",
    content: [
      "The website may use essential cookies to keep you signed in, remember cart contents, protect sessions and provide core functionality.",
      "Analytics, preference or marketing cookies may be used only where legally permitted and, when required, after consent.",
      "You may control cookies through your browser settings, but disabling essential cookies may prevent parts of the website from working correctly.",
    ],
  },
  {
    title: "10. Your privacy rights",
    content: [
      "Depending on your location, you may have the right to access the personal information we hold about you.",
      "You may request correction of inaccurate or incomplete information.",
      "You may request deletion, restriction, objection or portability where those rights apply.",
      "You may withdraw consent at any time where processing is based on consent.",
      "You may also have the right to complain to your local data-protection authority.",
    ],
  },
  {
    title: "11. Account and security responsibilities",
    content: [
      "Keep your password confidential and use a strong, unique password.",
      "Notify us promptly if you believe your account has been accessed without permission.",
      "We will never ask you to send your password or complete payment card details by email or contact form.",
    ],
  },
  {
    title: "12. Children’s privacy",
    content: [
      "This store is not intended for children who are not legally able to enter into online purchase agreements in their country.",
      "We do not knowingly collect personal information from children where parental consent is legally required.",
      "If you believe a child has provided personal information improperly, contact us so we can review the situation.",
    ],
  },
  {
    title: "13. Third-party links",
    content: [
      "The website may contain links to third-party websites or services.",
      "We are not responsible for the privacy practices, security or content of third-party services.",
      "Review the privacy policy of any third-party service before providing personal information.",
    ],
  },
  {
    title: "14. Changes to this policy",
    content: [
      "We may update this Privacy Policy to reflect changes in our services, providers, legal obligations or business practices.",
      "The latest version will be posted on this page with an updated revision date.",
      "Material changes may also be communicated through the website or by email where appropriate.",
    ],
  },
  {
    title: "15. Contact us",
    content: [
      "For privacy questions, data requests or complaints, contact support@veromek.com.",
      "To help us verify and process your request, include your full name, account email and a clear description of the request.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <Layout>
      <section className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-24">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
            <ShieldCheck size={27} />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            Data Protection
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-6xl dark:text-white">
            Privacy Policy
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
            This policy explains what personal
            information we collect, why we use it
            and the choices available to you.
          </p>

          <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
            Last updated: July 27, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PRIVACY_CARDS.map(
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
            <div className="flex items-start gap-4 rounded-2xl bg-blue-50 p-5 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
              <LockKeyhole
                size={23}
                className="mt-0.5 shrink-0"
              />

              <p className="text-sm leading-6">
                We use reasonable safeguards, but
                no online service can guarantee
                absolute security. Use a strong
                password and contact us if you
                notice suspicious activity.
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
              <Eye size={30} />

              <h2 className="mt-5 text-2xl font-black">
                Your privacy choices
              </h2>

              <ul className="mt-5 space-y-4 text-sm leading-6 text-gray-300 dark:text-gray-600">
                <li>
                  Request access to your data.
                </li>

                <li>
                  Correct inaccurate information.
                </li>

                <li>
                  Request deletion where applicable.
                </li>

                <li>
                  Withdraw consent where applicable.
                </li>
              </ul>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
              <Cookie size={28} />

              <h2 className="mt-5 text-xl font-black">
                Cookies
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Essential cookies help keep the
                website secure and functional.
                Additional cookies may require
                consent.
              </p>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
              <FileText size={28} />

              <h2 className="mt-5 text-xl font-black">
                Privacy request
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Include your name, account email
                and a clear description of your
                request.
              </p>

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