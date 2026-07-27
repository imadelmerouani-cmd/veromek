import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const {
    isAuthenticated,
    isAdmin,
    authLoading,
    profileLoading,
  } = useAuth();

  const location = useLocation();

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-950 dark:bg-zinc-950 dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle
            size={38}
            className="animate-spin"
          />

          <p className="font-semibold">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}