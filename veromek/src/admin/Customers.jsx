import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Crown,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const ROLE_FILTERS = [
  {
    value: "all",
    label: "All roles",
  },
  {
    value: "customer",
    label: "Customers",
  },
  {
    value: "admin",
    label: "Administrators",
  },
  {
    value: "super_admin",
    label: "Store owner",
  },
];

const EDITABLE_ROLES = [
  {
    value: "customer",
    label: "Customer",
  },
  {
    value: "admin",
    label: "Administrator",
  },
];

function normalizeRole(role) {
  const value = String(
    role || "customer"
  ).toLowerCase();

  if (
    value === "admin" ||
    value === "super_admin"
  ) {
    return value;
  }

  return "customer";
}

function formatDate(value) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getInitials(name, email) {
  const value =
    String(name || "").trim() ||
    String(email || "").split("@")[0] ||
    "User";

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function RoleBadge({ role }) {
  const normalizedRole =
    normalizeRole(role);

  if (normalizedRole === "super_admin") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
        <KeyRound size={13} />
        Store owner
      </span>
    );
  }

  if (normalizedRole === "admin") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">
        <Crown size={13} />
        Administrator
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
      <UserRound size={13} />
      Customer
    </span>
  );
}

function ConfirmationBadge({ confirmed }) {
  if (confirmed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-300">
        <CheckCircle2 size={13} />
        Confirmed
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 dark:bg-zinc-800 dark:text-gray-300">
      Unconfirmed
    </span>
  );
}

function RoleControl({
  customer,
  currentUserId,
  isSuperAdmin,
  updating,
  onChange,
}) {
  const customerRole = normalizeRole(
    customer.role
  );

  const isCurrentUser =
    String(customer.id) ===
    String(currentUserId);

  if (customerRole === "super_admin") {
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-900 dark:bg-purple-950/30">
        <p className="flex items-center gap-2 text-sm font-bold text-purple-700 dark:text-purple-300">
          <LockKeyhole size={16} />
          Store owner
        </p>

        <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
          Protected account
        </p>
      </div>
    );
  }

  if (isCurrentUser) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950">
        <p className="font-bold">
          {customerRole === "admin"
            ? "Administrator"
            : "Customer"}
        </p>

        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Your account
        </p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950">
        <p className="font-bold">
          {customerRole === "admin"
            ? "Administrator"
            : "Customer"}
        </p>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <LockKeyhole size={13} />
          Owner permission required
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={customerRole}
        onChange={(event) =>
          onChange(
            customer,
            event.target.value
          )
        }
        disabled={updating}
        className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm font-bold outline-none transition focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-900"
      >
        {EDITABLE_ROLES.map((role) => (
          <option
            key={role.value}
            value={role.value}
          >
            {role.label}
          </option>
        ))}
      </select>

      {updating ? (
        <LoaderCircle
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
        />
      ) : (
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        />
      )}
    </div>
  );
}

function CustomerCard({
  customer,
  currentUserId,
  isSuperAdmin,
  updating,
  onRoleChange,
}) {
  const initials = getInitials(
    customer.full_name,
    customer.email
  );

  const isCurrentUser =
    String(customer.id) ===
    String(currentUserId);

  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black text-lg font-black uppercase text-white dark:bg-white dark:text-black">
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="truncate text-lg font-black">
                {customer.full_name ||
                  "Unnamed user"}
              </h2>

              {isCurrentUser && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold dark:bg-zinc-800">
                  You
                </span>
              )}
            </div>

            <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Mail
                size={16}
                className="shrink-0"
              />

              <span className="truncate">
                {customer.email ||
                  "No email address"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <RoleBadge
                role={customer.role}
              />

              <ConfirmationBadge
                confirmed={
                  customer.email_confirmed_at
                }
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-56">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
            Account role
          </p>

          <RoleControl
            customer={customer}
            currentUserId={currentUserId}
            isSuperAdmin={isSuperAdmin}
            updating={updating}
            onChange={onRoleChange}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-gray-200 pt-5 text-sm dark:border-zinc-800 sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Registered
          </p>

          <p className="mt-2 font-semibold">
            {formatDate(
              customer.created_at
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Last sign in
          </p>

          <p className="mt-2 font-semibold">
            {formatDate(
              customer.last_sign_in_at
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Profile updated
          </p>

          <p className="mt-2 font-semibold">
            {formatDate(
              customer.updated_at
            )}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function AdminCustomers() {
  const {
    user,
    isSuperAdmin,
  } = useAuth();

  const [customers, setCustomers] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [
    updatingCustomerId,
    setUpdatingCustomerId,
  ] = useState(null);

  const fetchCustomers = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const { data, error } =
          await supabase.rpc(
            "admin_list_customers"
          );

        if (error) {
          throw error;
        }

        setCustomers(
          (data ?? []).map((customer) => ({
            ...customer,
            role: normalizeRole(
              customer.role
            ),
          }))
        );

        if (silent) {
          toast.success(
            "Customers updated."
          );
        }
      } catch (error) {
        console.error(
          "Failed to load customers:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to load customers."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleRoleChange = async (
    customer,
    newRole
  ) => {
    if (!isSuperAdmin) {
      toast.error(
        "Only the store owner can change roles."
      );
      return;
    }

    const previousRole = normalizeRole(
      customer.role
    );

    if (previousRole === newRole) {
      return;
    }

    const accountName =
      customer.full_name ||
      customer.email ||
      "this user";

    const message =
      newRole === "admin"
        ? `Make "${accountName}" an administrator?`
        : `Remove administrator access from "${accountName}"?`;

    const confirmed =
      window.confirm(message);

    if (!confirmed) {
      return;
    }

    setUpdatingCustomerId(customer.id);

    try {
      const { data, error } =
        await supabase.rpc(
          "admin_set_user_role",
          {
            target_user_id: customer.id,
            new_role: newRole,
          }
        );

      if (error) {
        throw error;
      }

      const updatedProfile =
        Array.isArray(data)
          ? data[0]
          : data;

      if (!updatedProfile) {
        throw new Error(
          "User role was not updated."
        );
      }

      setCustomers((currentCustomers) =>
        currentCustomers.map(
          (currentCustomer) =>
            String(currentCustomer.id) ===
            String(customer.id)
              ? {
                  ...currentCustomer,
                  role: normalizeRole(
                    updatedProfile.role
                  ),
                  full_name:
                    updatedProfile.full_name ||
                    currentCustomer.full_name,
                  updated_at:
                    updatedProfile.updated_at ||
                    currentCustomer.updated_at,
                }
              : currentCustomer
        )
      );

      toast.success(
        newRole === "admin"
          ? "Administrator access granted."
          : "Administrator access removed."
      );
    } catch (error) {
      console.error(
        "Failed to update user role:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to update user role."
      );
    } finally {
      setUpdatingCustomerId(null);
    }
  };

  const filteredCustomers = useMemo(() => {
    const cleanSearch = searchTerm
      .trim()
      .toLowerCase();

    return customers.filter((customer) => {
      const normalizedRole =
        normalizeRole(customer.role);

      const matchesRole =
        roleFilter === "all" ||
        normalizedRole === roleFilter;

      if (!matchesRole) {
        return false;
      }

      if (!cleanSearch) {
        return true;
      }

      return [
        customer.id,
        customer.full_name,
        customer.email,
        customer.role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(cleanSearch);
    });
  }, [
    customers,
    searchTerm,
    roleFilter,
  ]);

  const statistics = useMemo(() => {
    const owners = customers.filter(
      (customer) =>
        normalizeRole(customer.role) ===
        "super_admin"
    ).length;

    const admins = customers.filter(
      (customer) =>
        normalizeRole(customer.role) ===
        "admin"
    ).length;

    const normalCustomers =
      customers.length - admins - owners;

    const confirmed = customers.filter(
      (customer) =>
        Boolean(customer.email_confirmed_at)
    ).length;

    return {
      total: customers.length,
      customers: normalCustomers,
      admins,
      owners,
      confirmed,
    };
  }, [customers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-zinc-950 dark:text-white">
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle
              size={40}
              className="animate-spin"
            />

            <p className="font-semibold">
              Loading customers...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-zinc-950 dark:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-black dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft size={17} />
              Back to dashboard
            </Link>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Customer management
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
              View accounts and manage administrator
              permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchCustomers({
                silent: true,
              })
            }
            disabled={refreshing}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-5 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh customers"}
          </button>
        </div>

        <section
          className={`mt-8 rounded-3xl border p-5 sm:p-6 ${
            isSuperAdmin
              ? "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/20"
              : "border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isSuperAdmin
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-zinc-800"
              }`}
            >
              {isSuperAdmin ? (
                <KeyRound size={22} />
              ) : (
                <LockKeyhole size={22} />
              )}
            </div>

            <div>
              <h2 className="font-black">
                {isSuperAdmin
                  ? "Store owner access"
                  : "Administrator access"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {isSuperAdmin
                  ? "You are the store owner. Only your account can grant or remove administrator permissions."
                  : "You can view customer accounts, but only the store owner can change administrator permissions."}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Users className="text-gray-400" />
            <p className="mt-4 text-2xl font-black">
              {statistics.total}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Total accounts
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <UserRound className="text-blue-500" />
            <p className="mt-4 text-2xl font-black">
              {statistics.customers}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Customers
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Crown className="text-yellow-500" />
            <p className="mt-4 text-2xl font-black">
              {statistics.admins}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Administrators
            </p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-900 dark:bg-purple-950/20">
            <KeyRound className="text-purple-500" />
            <p className="mt-4 text-2xl font-black">
              {statistics.owners}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Store owner
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <ShieldCheck className="text-green-500" />
            <p className="mt-4 text-2xl font-black">
              {statistics.confirmed}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Confirmed emails
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search name, email or role..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 outline-none transition focus:border-black focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
              />
            </label>

            <label className="relative block">
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
                    event.target.value
                  )
                }
                className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-11 font-semibold outline-none dark:border-zinc-700 dark:bg-zinc-950"
              >
                {ROLE_FILTERS.map((filter) => (
                  <option
                    key={filter.value}
                    value={filter.value}
                  >
                    {filter.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
              />
            </label>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Showing{" "}
            <strong className="text-black dark:text-white">
              {filteredCustomers.length}
            </strong>{" "}
            of{" "}
            <strong className="text-black dark:text-white">
              {customers.length}
            </strong>{" "}
            accounts
          </p>
        </section>

        <section className="mt-6 grid gap-5">
          {filteredCustomers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <Users
                size={48}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-5 text-xl font-black">
                No customers found
              </h2>
            </div>
          ) : (
            filteredCustomers.map(
              (customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  currentUserId={user?.id}
                  isSuperAdmin={
                    isSuperAdmin
                  }
                  updating={
                    String(
                      updatingCustomerId
                    ) ===
                    String(customer.id)
                  }
                  onRoleChange={
                    handleRoleChange
                  }
                />
              )
            )
          )}
        </section>
      </main>
    </div>
  );
}