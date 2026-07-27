import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ChevronDown,
  Crown,
  Heart,
  LogOut,
  Menu,
  Moon,
  Package,
  ShoppingCart,
  Sun,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] =
    useState(false);

  const accountRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { darkMode, toggleTheme } = useTheme();

  const {
    user,
    profile,
    isAdmin,
    isAuthenticated,
    authLoading,
    logout,
  } = useAuth();

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalWishlist = wishlist.length;

  const profileName = profile?.full_name?.trim();

  const firstName =
    profileName?.split(" ")[0] ||
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      const { error } = await logout();

      if (error) {
        toast.error(error.message);
        return;
      }

      setAccountOpen(false);
      setMenuOpen(false);

      toast.success("Logged out successfully!");

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLogoutLoading(false);
    }
  };

  const navLinks = [
    {
      label: "Home",
      to: "/",
    },
    {
      label: "Shop",
      to: "/shop",
    },
    {
      label: "About",
      to: "/about",
    },
    {
      label: "Contact",
      to: "/contact",
    },
  ];

  const informationLinks = [
    {
      label: "Shipping Policy",
      to: "/shipping-policy",
    },
    {
      label: "Returns & Refunds",
      to: "/refund-policy",
    },
    {
      label: "Privacy Policy",
      to: "/privacy-policy",
    },
    {
      label: "Terms & Conditions",
      to: "/terms",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 text-gray-950 backdrop-blur transition-colors dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={21} />
            </button>

            <Link
              to="/"
              className="text-2xl font-extrabold tracking-tight sm:text-3xl"
            >
              Vero
              <span className="text-gray-500 dark:text-gray-400">
                Mek
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-7 font-medium lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="transition hover:text-gray-500 dark:hover:text-gray-300"
              >
                {link.label}
              </Link>
            ))}

            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 transition hover:text-gray-500 dark:hover:text-gray-300">
                Policies
                <ChevronDown
                  size={16}
                  className="transition group-open:rotate-180"
                />
              </summary>

              <div className="absolute left-1/2 top-[calc(100%+18px)] w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
                {informationLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-gray-100 dark:hover:bg-zinc-800"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            <Link
              to="/wishlist"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              aria-label="Open wishlist"
            >
              <Heart size={20} />

              {totalWishlist > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {!authLoading &&
              (isAuthenticated ? (
                <div
                  ref={accountRef}
                  className="relative hidden sm:block"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setAccountOpen(
                        (current) => !current
                      )
                    }
                    className="flex h-11 max-w-44 items-center gap-2 rounded-xl border border-gray-200 px-4 transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    aria-expanded={accountOpen}
                    aria-label="Open account menu"
                  >
                    <User size={18} />

                    <span className="truncate text-sm font-semibold">
                      {firstName}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition-transform ${
                        accountOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
                      <div className="border-b border-gray-200 px-5 py-4 dark:border-zinc-700">
                        <p className="truncate font-bold">
                          {profile?.full_name ||
                            firstName}
                        </p>

                        <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>

                        {isAdmin && (
                          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                            <Crown size={13} />
                            Administrator
                          </span>
                        )}
                      </div>

                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                          <User size={18} />
                          My Profile
                        </Link>

                        <Link
                          to="/orders"
                          className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                          <Package size={18} />
                          My Orders
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-yellow-700 transition hover:bg-yellow-50 dark:text-yellow-300 dark:hover:bg-yellow-950/30"
                          >
                            <Crown size={18} />
                            Admin Dashboard
                          </Link>
                        )}

                        <div className="my-2 border-t border-gray-200 dark:border-zinc-700" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={logoutLoading}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-950/30"
                        >
                          <LogOut size={18} />

                          {logoutLoading
                            ? "Logging out..."
                            : "Logout"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden h-11 items-center gap-2 rounded-xl border border-gray-200 px-4 transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800 sm:flex"
                >
                  <User size={18} />
                  Login
                </Link>
              ))}

            <Link
              to="/cart"
              className="relative flex h-11 items-center gap-2 rounded-xl bg-black px-3 text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:px-5"
              aria-label="Open cart"
            >
              <ShoppingCart size={19} />

              <span className="hidden sm:inline">
                Cart
              </span>

              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/60"
            aria-label="Close navigation menu"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white text-gray-950 shadow-2xl dark:bg-zinc-950 dark:text-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
              <Link
                to="/"
                className="text-3xl font-extrabold tracking-tight"
              >
                Vero
                <span className="text-gray-500 dark:text-gray-400">
                  Mek
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                aria-label="Close navigation menu"
              >
                <X size={21} />
              </button>
            </div>

            {isAuthenticated && (
              <Link
                to="/profile"
                className="flex items-center gap-3 border-b border-gray-200 px-6 py-5 transition hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                  <User size={21} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold">
                      {profile?.full_name ||
                        firstName}
                    </p>

                    {isAdmin && (
                      <Crown
                        size={16}
                        className="shrink-0 text-yellow-500"
                      />
                    )}
                  </div>

                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </Link>
            )}

            <nav className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="border-b border-gray-100 py-4 text-lg font-semibold transition hover:pl-2 hover:text-gray-500 dark:border-zinc-800 dark:hover:text-gray-300"
                >
                  {link.label}
                </Link>
              ))}

              <p className="pb-2 pt-6 text-xs font-black uppercase tracking-[0.22em] text-gray-400">
                Policies
              </p>

              {informationLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="border-b border-gray-100 py-3 font-semibold transition hover:pl-2 hover:text-gray-500 dark:border-zinc-800 dark:hover:text-gray-300"
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 border-b border-gray-100 py-4 text-lg font-semibold transition hover:pl-2 hover:text-gray-500 dark:border-zinc-800 dark:hover:text-gray-300"
                  >
                    <Package size={20} />
                    My Orders
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 border-b border-yellow-100 py-4 text-lg font-semibold text-yellow-700 transition hover:pl-2 dark:border-yellow-950 dark:text-yellow-300"
                    >
                      <Crown size={20} />
                      Admin Dashboard
                    </Link>
                  )}
                </>
              )}
            </nav>

            <div className="border-t border-gray-200 p-6 dark:border-zinc-800">
              <button
                type="button"
                onClick={toggleTheme}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-semibold transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {darkMode ? (
                  <>
                    <Sun size={18} />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon size={18} />
                    Dark Mode
                  </>
                )}
              </button>

              <Link
                to="/wishlist"
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 font-semibold transition hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <Heart size={18} />
                Wishlist

                {totalWishlist > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {totalWishlist}
                  </span>
                )}
              </Link>

              {!authLoading &&
                (isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                      <User size={18} />
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-black transition hover:bg-yellow-400"
                      >
                        <Crown size={18} />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LogOut size={18} />

                      {logoutLoading
                        ? "Logging out..."
                        : "Logout"}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    <User size={18} />
                    Login
                  </Link>
                ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}