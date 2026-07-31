import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200 bg-white text-gray-900 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link
            to="/"
            className="text-2xl font-bold"
          >
            Vero
            <span className="text-gray-500 dark:text-gray-400">
              Mek
            </span>
          </Link>

          <p className="mt-4 max-w-xs leading-7 text-gray-500 dark:text-gray-400">
            Premium fashion for a modern
            lifestyle.
          </p>

        </div>

        <div>
          <h3 className="mb-4 font-semibold">
            Shop
          </h3>

          <ul className="space-y-3 text-gray-500 dark:text-gray-400">
            <li>
              <Link
                to="/shop"
                className="transition hover:text-black dark:hover:text-white"
              >
                All products
              </Link>
            </li>

            <li>
              <Link
                to="/cart"
                className="transition hover:text-black dark:hover:text-white"
              >
                Shopping cart
              </Link>
            </li>

            <li>
              <Link
                to="/wishlist"
                className="transition hover:text-black dark:hover:text-white"
              >
                Wishlist
              </Link>
            </li>

            <li>
              <Link
                to="/orders"
                className="transition hover:text-black dark:hover:text-white"
              >
                My orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">
            Support
          </h3>

          <ul className="space-y-3 text-gray-500 dark:text-gray-400">
            <li>
              <Link
                to="/contact"
                className="transition hover:text-black dark:hover:text-white"
              >
                Contact us
              </Link>
            </li>

            <li>
              <Link
                to="/shipping-policy"
                className="transition hover:text-black dark:hover:text-white"
              >
                Shipping policy
              </Link>
            </li>

            <li>
              <Link
                to="/refund-policy"
                className="transition hover:text-black dark:hover:text-white"
              >
                Returns & refunds
              </Link>
            </li>

            <li>
              <Link
                to="/privacy-policy"
                className="transition hover:text-black dark:hover:text-white"
              >
                Privacy policy
              </Link>
            </li>

            <li>
              <Link
                to="/terms"
                className="transition hover:text-black dark:hover:text-white"
              >
                Terms & conditions
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                className="transition hover:text-black dark:hover:text-white"
              >
                About us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">
            Contact
          </h3>

          <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
            <li className="flex gap-3">
              <Mail
                size={18}
                className="mt-0.5 shrink-0"
              />

              <a
                href="mailto:veromek00@proton.me"
                className="break-all transition hover:text-black dark:hover:text-white"
              >
                veromek00@proton.me
              </a>
            </li>

            <li className="flex gap-3">
              <Phone
                size={18}
                className="mt-0.5 shrink-0"
              />

              <a
                href="https://wa.me/34610982845?text=Hello%20VeroMek%2C%20I%20need%20help."
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with VeroMek on WhatsApp"
                className="transition hover:text-black dark:hover:text-white"
              >
                +34 610 982 845
              </a>
            </li>

            <li className="flex gap-3">
              <MapPin
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>
                Valencia, Spain
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 px-6 py-6 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-sm text-gray-500 dark:text-gray-400 sm:flex-row sm:text-left">
          <p>
            © 2026 VeroMek. All rights
            reserved.
          </p>

          <p>
            Secure shopping powered by
            Supabase.
          </p>
        </div>
      </div>
    </footer>
  );
}