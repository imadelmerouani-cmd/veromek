import {
  CheckCircle2,
  LoaderCircle,
  LogIn,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import {
  Link,
  useLocation,
} from "react-router-dom";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Layout from "../components/layout/Layout";
import { supabase } from "../lib/supabase";

export default function EmailConfirmed() {
  const location = useLocation();

  const [status, setStatus] =
    useState("checking");

  const [message, setMessage] =
    useState(
      "We are confirming your email address."
    );

  const errorDescription = useMemo(() => {
    const searchParams =
      new URLSearchParams(location.search);

    const hashParams =
      new URLSearchParams(
        location.hash.replace(/^#/, "")
      );

    return (
      searchParams.get(
        "error_description"
      ) ||
      hashParams.get(
        "error_description"
      ) ||
      searchParams.get("error") ||
      hashParams.get("error")
    );
  }, [location.hash, location.search]);

  useEffect(() => {
    let mounted = true;

    const checkConfirmation = async () => {
      if (errorDescription) {
        if (mounted) {
          setStatus("error");
          setMessage(
            decodeURIComponent(
              errorDescription.replace(
                /\+/g,
                " "
              )
            )
          );
        }

        return;
      }

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        setStatus("success");
        setMessage(
          session
            ? "Your email has been verified and your account is ready."
            : "Your email has been verified successfully. You can now log in."
        );
      } catch (error) {
        console.error(
          "Email confirmation check failed:",
          error
        );

        if (mounted) {
          setStatus("error");
          setMessage(
            error?.message ||
              "We could not verify this confirmation link."
          );
        }
      }
    };

    checkConfirmation();

    return () => {
      mounted = false;
    };
  }, [errorDescription]);

  return (
    <Layout>
      <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-[32px] border border-gray-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
          {status === "checking" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
                <LoaderCircle
                  size={32}
                  className="animate-spin"
                />
              </div>

              <h1 className="mt-6 text-3xl font-black">
                Confirming your email
              </h1>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300">
                <CheckCircle2 size={34} />
              </div>

              <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-green-600 dark:text-green-300">
                Confirmation successful
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight">
                Email verified
              </h1>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                <TriangleAlert size={34} />
              </div>

              <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-red-600 dark:text-red-300">
                Confirmation problem
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight">
                Link unavailable
              </h1>
            </>
          )}

          <p className="mx-auto mt-5 max-w-md leading-7 text-gray-500 dark:text-gray-400">
            {message}
          </p>

          {status !== "checking" && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 font-bold transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <LogIn size={18} />
                Go to login
              </Link>

              <Link
                to="/shop"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-5 font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <ShoppingBag size={18} />
                Start shopping
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}