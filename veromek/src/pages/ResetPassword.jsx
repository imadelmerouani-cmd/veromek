import {
  useEffect,
  useState,
} from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout";
import { supabase } from "../lib/supabase";

function validatePassword(password) {
  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }

  return "";
}

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [
    recoverySessionAvailable,
    setRecoverySessionAvailable,
  ] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [passwordUpdated, setPasswordUpdated] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
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

        if (session?.user) {
          setRecoverySessionAvailable(true);
        }
      } catch (error) {
        console.error(
          "Failed to check recovery session:",
          error
        );
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          return;
        }

        if (
          event === "PASSWORD_RECOVERY" &&
          session?.user
        ) {
          setRecoverySessionAvailable(true);
          setCheckingSession(false);
        }

        if (
          event === "SIGNED_IN" &&
          session?.user
        ) {
          setRecoverySessionAvailable(true);
          setCheckingSession(false);
        }

        if (event === "SIGNED_OUT") {
          setRecoverySessionAvailable(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!recoverySessionAvailable) {
      toast.error(
        "This password reset link is invalid or expired."
      );

      return;
    }

    const passwordError =
      validatePassword(password);

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        "The passwords do not match."
      );

      return;
    }

    setSubmitting(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      setPasswordUpdated(true);

      toast.success(
        "Your password was updated successfully."
      );

      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        console.error(
          "Sign-out after password reset failed:",
          signOutError
        );
      }
    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      const message =
        error?.message?.toLowerCase() || "";

      if (
        message.includes(
          "new password should be different"
        )
      ) {
        toast.error(
          "Choose a password different from your previous password."
        );
      } else if (
        message.includes("expired") ||
        message.includes("invalid")
      ) {
        setRecoverySessionAvailable(false);

        toast.error(
          "This reset link is invalid or expired."
        );
      } else {
        toast.error(
          error?.message ||
            "Failed to update your password."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <Layout>
        <section className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <LoaderCircle
              size={42}
              className="animate-spin"
            />

            <p className="font-semibold text-gray-500 dark:text-gray-400">
              Verifying your reset link...
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  if (passwordUpdated) {
    return (
      <Layout>
        <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300">
              <CheckCircle2 size={32} />
            </div>

            <h1 className="mt-6 text-3xl font-black">
              Password Updated
            </h1>

            <p className="mt-4 leading-7 text-gray-500 dark:text-gray-400">
              Your password was changed successfully.
              You can now log in using your new
              password.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/login", {
                  replace: true,
                })
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <LockKeyhole size={20} />
              Go to Login
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  if (!recoverySessionAvailable) {
    return (
      <Layout>
        <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900 dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <ShieldAlert size={31} />
            </div>

            <h1 className="mt-6 text-3xl font-black">
              Invalid Reset Link
            </h1>

            <p className="mt-4 leading-7 text-gray-500 dark:text-gray-400">
              This password reset link is invalid,
              expired, or has already been used.
            </p>

            <Link
              to="/forgot-password"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <KeyRound size={20} />
              Request New Link
            </Link>

            <Link
              to="/login"
              className="mt-4 inline-flex font-semibold text-gray-600 transition hover:text-black hover:underline dark:text-gray-300 dark:hover:text-white"
            >
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
              <KeyRound size={26} />
            </div>

            <h1 className="text-3xl font-black">
              Create New Password
            </h1>

            <p className="mt-3 leading-7 text-gray-500 dark:text-gray-400">
              Choose a strong password for your
              account.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-semibold"
              >
                New Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="new-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  disabled={submitting}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-12 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={submitting}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black disabled:opacity-50 dark:hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold"
              >
                Confirm Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  disabled={submitting}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-12 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  disabled={submitting}
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black disabled:opacity-50 dark:hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-600 dark:bg-zinc-950 dark:text-gray-300">
              <p className="font-bold">
                Password requirements:
              </p>

              <p className="mt-1">
                At least 8 characters, one uppercase
                letter, one lowercase letter and one
                number.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
                  />
                  Updating Password...
                </>
              ) : (
                <>
                  <KeyRound size={20} />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}