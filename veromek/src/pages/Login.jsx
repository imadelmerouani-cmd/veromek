import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

function getSafeRedirectPath(locationState) {
  const requestedPath = locationState?.from;

  if (
    typeof requestedPath !== "string" ||
    !requestedPath.startsWith("/") ||
    requestedPath.startsWith("//") ||
    requestedPath === "/login" ||
    requestedPath === "/register" ||
    requestedPath === "/forgot-password" ||
    requestedPath === "/reset-password"
  ) {
    return "/";
  }

  return requestedPath;
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
    authLoading,
  } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const redirectPath = getSafeRedirectPath(
    location.state
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const email = form.email
      .trim()
      .toLowerCase();

    const password = form.password;

    if (!email || !password) {
      toast.error(
        t("login.fillAll")
      );

      return;
    }

    try {
      setLoading(true);

      const { error } = await login({
        email,
        password,
      });

      if (error) {
        const errorMessage =
          error.message?.toLowerCase() || "";

        if (
          errorMessage.includes(
            "invalid login credentials"
          )
        ) {
          toast.error(
            t("login.incorrect")
          );
        } else if (
          errorMessage.includes(
            "email not confirmed"
          )
        ) {
          toast.error(
            t("login.confirmEmail")
          );
        } else {
          toast.error(
            error.message ||
              t("login.failed")
          );
        }

        return;
      }

      toast.success(t("login.welcome"));

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      toast.error(
        error?.message ||
          t("login.somethingWrong")
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle
              size={40}
              className="animate-spin"
            />

            <p className="font-semibold text-gray-500 dark:text-gray-400">
              {t("login.checking")}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={redirectPath}
        replace
      />
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

            <h1 className="text-4xl font-bold">
              {t("login.title")}
            </h1>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              {t("login.subtitle")}
            </p>
          </div>

          {redirectPath !== "/" && (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              {t("login.redirectNotice")}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                {t("login.email")}
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-4 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold"
                >
                  {t("login.password")}
                </label>

                <Link
                  to="/forgot-password"
                  state={{
                    email: form.email
                      .trim()
                      .toLowerCase(),
                  }}
                  className="text-sm font-semibold text-gray-600 transition hover:text-black hover:underline dark:text-gray-300 dark:hover:text-white"
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  autoComplete="current-password"
                  placeholder={t("login.passwordPlaceholder")}
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-12 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? t("login.hidePassword")
                      : t("login.showPassword")
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
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

                  {t("login.loggingIn")}
                </>
              ) : (
                t("login.button")
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-gray-500 dark:text-gray-400">
            {t("login.noAccount")} {" "}
            <Link
              to="/register"
              className="font-semibold text-black hover:underline dark:text-white"
            >
              {t("login.createAccount")}
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}