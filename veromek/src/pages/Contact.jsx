import {
  useState,
} from "react";
import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout";
import { supabase } from "../lib/supabase";

const CONTACT_DETAILS = [
  {
    icon: Mail,
    title: "Email",
    value: "support@veromek.com",
    href: "mailto:support@veromek.com",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+34 000 000 000",
    href: "tel:+34000000000",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Valencia, Spain",
    href: null,
  },
  {
    icon: Clock3,
    title: "Support Hours",
    value: "Monday–Friday, 9:00–18:00",
    href: null,
  },
];

const FAQS = [
  {
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on the destination and selected shipping method. You will see the available option during checkout.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "Contact us as quickly as possible. We can only change or cancel an order before it enters processing.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Your order status appears inside My Orders. Tracking information will also appear there once the order is shipped.",
  },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export default function Contact() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (form.website) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email
        .trim()
        .toLowerCase(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.subject ||
      !payload.message
    ) {
      toast.error(
        "Please complete all fields."
      );

      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert(payload);

      if (error) {
        throw error;
      }

      setForm(INITIAL_FORM);
      setSubmitted(true);

      toast.success(
        "Your message was sent."
      );
    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      toast.error(
        error?.message ||
          "Your message could not be sent."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-24">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
            <MessageSquareText size={26} />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            Customer Support
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-6xl dark:text-white">
            Contact VeroMek
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
            Questions about an order, delivery,
            return or product? Send us a message
            and our support team will help you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_DETAILS.map(
            ({
              icon: Icon,
              title,
              value,
              href,
            }) => {
              const content = (
                <article className="h-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
                    <Icon size={21} />
                  </div>

                  <h2 className="mt-5 font-black">
                    {title}
                  </h2>

                  <p className="mt-2 break-words text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {value}
                  </p>
                </article>
              );

              return href ? (
                <a
                  key={title}
                  href={href}
                  className="block"
                >
                  {content}
                </a>
              ) : (
                <div key={title}>
                  {content}
                </div>
              );
            }
          )}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            {submitted ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300">
                  <CheckCircle2 size={32} />
                </div>

                <h2 className="mt-6 text-3xl font-black">
                  Message received
                </h2>

                <p className="mt-4 max-w-md leading-7 text-gray-500 dark:text-gray-400">
                  Thank you for contacting us.
                  Our support team will reply to
                  your email as soon as possible.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setSubmitted(false)
                  }
                  className="mt-7 rounded-xl bg-black px-6 py-3 font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black">
                  Send us a message
                </h2>

                <p className="mt-3 text-gray-500 dark:text-gray-400">
                  Complete the form below. Do not
                  include passwords or payment
                  card information.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 grid gap-5"
                >
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    tabIndex="-1"
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-bold">
                        Full name
                      </span>

                      <input
                        required
                        name="name"
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        disabled={submitting}
                        placeholder="Your name"
                        className="h-12 rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-black disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-bold">
                        Email
                      </span>

                      <input
                        required
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={submitting}
                        placeholder="you@example.com"
                        className="h-12 rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-black disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold">
                      Subject
                    </span>

                    <input
                      required
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      disabled={submitting}
                      placeholder="How can we help?"
                      className="h-12 rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-black disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold">
                      Message
                    </span>

                    <textarea
                      required
                      name="message"
                      rows="7"
                      value={form.message}
                      onChange={handleChange}
                      disabled={submitting}
                      placeholder="Write your message..."
                      className="resize-none rounded-xl border border-gray-300 bg-white p-4 outline-none transition focus:border-black disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-13 items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle
                          size={19}
                          className="animate-spin"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={19} />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-black p-7 text-white dark:bg-white dark:text-black sm:p-8">
              <h2 className="text-3xl font-black">
                Before contacting us
              </h2>

              <p className="mt-4 leading-7 text-gray-300 dark:text-gray-600">
                For faster support, include your
                order number and the email used
                during checkout.
              </p>

              <div className="mt-7 space-y-4 text-sm">
                <div className="rounded-2xl bg-white/10 p-4 dark:bg-black/10">
                  Order example: #1024
                </div>

                <div className="rounded-2xl bg-white/10 p-4 dark:bg-black/10">
                  Never send passwords or complete
                  payment card details.
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <h2 className="text-2xl font-black">
                Frequently asked
              </h2>

              <div className="mt-6 divide-y divide-gray-200 dark:divide-zinc-800">
                {FAQS.map((faq) => (
                  <details
                    key={faq.question}
                    className="group py-5"
                  >
                    <summary className="cursor-pointer list-none font-bold">
                      {faq.question}
                    </summary>

                    <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}