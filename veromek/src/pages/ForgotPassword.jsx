import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import {
  Link,
  useLocation,
} from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const location = useLocation();

  const initialEmail =
    typeof location.state?.email === "string"
      ? location.state.email
      : "";

  const [email, setEmail] = useState(
    initialEmail.trim().toLowerCase()
  );

  const [loading, setLoading] =
    useState(false);

  const [emailSent, setEmailSent] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail) {
      toast.error(
        "Please enter your email address."
      );

      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: redirectUrl,
          }
        );

      if (error) {
        throw error;
      }

      setEmail(cleanEmail);
      setEmailSent(true);

      toast.success(
        "Password reset email sent."
      );
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      const message =
        String(
          error?.message || ""
        ).toLowerCase();

      if (
        message.includes("rate limit") ||
        message.includes(
          "email rate limit"
        )
      ) {
        toast.error(
          "Too many requests. Wait a moment and try again."
        );
      } else {
        toast.error(
          error?.message ||
            "Failed to send the reset email."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Layout>
        <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300">
              <CheckCircle2 size={32} />
            </div>

            <h1 className="mt-6 text-3xl font-black text-gray-950 dark:text-white">
              Check Your Email
            </h1>

            <p className="mt-4 text-gray-500 dark:text-gray-400">
              We sent a password reset link to:
            </p>

            <p className="mt-2 break-all font-bold text-gray-950 dark:text-white">
              {email}
            </p>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-left text-sm leading-6 text-gray-600 dark:bg-zinc-950 dark:text-gray-300">
              Open the email and press the password
              reset link. Check the spam folder if
              the email does not appear.
            </div>

            <button
              type="button"
              onClick={() =>
                setEmailSent(false)
              }
              className="mt-7 w-full rounded-xl border border-gray-300 py-3 font-bold text-gray-950 transition hover:bg-gray-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
            >
              Use Another Email
            </button>

            <Link
              to="/login"
              className="mt-5 inline-flex items-center justify-center gap-2 font-semibold text-gray-600 transition hover:text-black hover:underline dark:text-gray-300 dark:hover:text-white"
            >
              <ArrowLeft size={17} />
              Back to Login
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <LockKeyhole size={26} />
            </div>

            <h1 className="text-3xl font-black text-gray-950 dark:text-white">
              Forgot Password?
            </h1>

            <p className="mt-3 leading-7 text-gray-500 dark:text-gray-400">
              Enter your email address and we will
              send you a secure password reset link.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-2 block text-sm font-semibold text-gray-950 dark:text-white"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-4 text-gray-950 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <Link
            to="/login"
            className="mt-7 flex items-center justify-center gap-2 font-semibold text-gray-600 transition hover:text-black hover:underline dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Login
          </Link>
        </div>
      </section>
    </Layout>
  );
}