import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    isAuthenticated,
    authLoading,
  } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.error(t("register.fillAll"));
      return;
    }

    if (form.password.length < 6) {
      toast.error(
        t("register.passwordLength")
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error(t("register.passwordMismatch"));
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await register({
        firstName,
        lastName,
        email,
        password: form.password,
      });

      if (error) {
        const errorMessage =
          error.message?.toLowerCase() || "";

        if (
          errorMessage.includes(
            "already exists"
          )
        ) {
          toast.error(
            t("register.duplicateEmail")
          );
        } else {
          toast.error(error.message);
        }

        return;
      }

      if (data.session) {
        toast.success(t("register.created"));
        navigate("/", { replace: true });
        return;
      }

      toast.success(
        t("register.checkEmail")
      );

      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(t("register.somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black dark:border-zinc-700 dark:border-t-white" />
        </div>
      </Layout>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <UserPlus size={26} />
            </div>

            <h1 className="text-4xl font-bold">
              {t("register.title")}
            </h1>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              {t("register.subtitle")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-semibold"
                >
                  {t("register.firstName")}
                </label>

                <div className="relative">
                  <User
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    placeholder={t("register.firstNamePlaceholder")}
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-4 outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-semibold"
                >
                  {t("register.lastName")}
                </label>

                <div className="relative">
                  <User
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    placeholder={t("register.lastNamePlaceholder")}
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-4 outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                {t("register.email")}
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder={t("register.emailPlaceholder")}
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-4 outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                {t("register.password")}
              </label>

              <div className="relative">
                <LockKeyhole
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  placeholder={t("register.passwordPlaceholder")}
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-12 outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? t("register.hidePassword")
                      : t("register.showPassword")
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white"
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
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold"
              >
                {t("register.confirmPassword")}
              </label>

              <div className="relative">
                <LockKeyhole
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder={t("register.confirmPasswordPlaceholder")}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-4 outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black py-4 text-lg font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {loading
                ? t("register.creating")
                : t("register.button")}
            </button>
          </form>

          <p className="mt-7 text-center text-gray-500 dark:text-gray-400">
            {t("register.alreadyAccount")} {" "}
            <Link
              to="/login"
              className="font-semibold text-black hover:underline dark:text-white"
            >
              {t("register.login")}
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}