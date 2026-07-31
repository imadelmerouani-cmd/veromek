import { Navigate } from "react-router-dom";
import { Calendar, LogOut, Mail, User } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const {
    user,
    authLoading,
    isAuthenticated,
    logout,
  } = useAuth();

  const handleLogout = async () => {
    const { error } = await logout();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t("profile.loggedOut"));
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black dark:border-zinc-700 dark:border-t-white" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const firstName =
    user?.user_metadata?.first_name || "";

  const lastName =
    user?.user_metadata?.last_name || "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    user.email.split("@")[0];

  const createdAt = new Intl.DateTimeFormat(
    i18n.resolvedLanguage || "en",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(new Date(user.created_at));

  return (
    <Layout>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-40 bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300" />

          <div className="-mt-14 px-8 pb-10">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-black text-white dark:border-zinc-900 dark:bg-white dark:text-black">
              <User size={42} />
            </div>

            <h1 className="mt-6 text-4xl font-bold">
              {fullName}
            </h1>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {t("profile.welcomeBack")}
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-5 dark:border-zinc-700">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <User size={18} />
                  {t("profile.firstName")}
                </div>

                <p>{firstName || "-"}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 dark:border-zinc-700">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <User size={18} />
                  {t("profile.lastName")}
                </div>

                <p>{lastName || "-"}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 dark:border-zinc-700">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <Mail size={18} />
                  {t("profile.email")}
                </div>

                <p className="break-all">
                  {user.email}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 dark:border-zinc-700">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <Calendar size={18} />
                  {t("profile.memberSince")}
                </div>

                <p>{createdAt}</p>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                <LogOut size={18} />
                {t("profile.logout")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
