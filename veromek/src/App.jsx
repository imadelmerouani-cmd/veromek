import {
  lazy,
  Suspense,
} from "react";
import {
  Routes,
  Route,
} from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import ShippingPolicy from "./pages/ShippingPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import About from "./pages/About";
import EmailConfirmed from "./pages/EmailConfirmed";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import Dashboard from "./admin/Dashboard";
import AdminOrders from "./admin/Orders";
import AdminReviews from "./admin/Reviews";
import AdminProducts from "./admin/Products";
import AdminCustomers from "./admin/Customers";
import AdminCoupons from "./admin/Coupons";
import ContactMessages from "./admin/ContactMessages";

const ForgotPassword = lazy(
  () => import("./pages/ForgotPassword")
);

const ResetPassword = lazy(
  () => import("./pages/ResetPassword")
);

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-950 dark:bg-zinc-950 dark:text-white">
      <div className="flex flex-col items-center gap-4">
        <LoaderCircle
          size={40}
          className="animate-spin"
        />

        <p className="font-semibold">
          Loading page...
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/shipping-policy"
          element={<ShippingPolicy />}
        />

        <Route
          path="/refund-policy"
          element={<RefundPolicy />}
        />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />

        <Route
          path="/terms"
          element={<Terms />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/email-confirmed"
          element={<EmailConfirmed />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/orders"
            element={<MyOrders />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />
        </Route>

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<Dashboard />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route
            path="/admin/reviews"
            element={<AdminReviews />}
          />

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/customers"
            element={<AdminCustomers />}
          />

          <Route
            path="/admin/coupons"
            element={<AdminCoupons />}
          />

          <Route
            path="/admin/contact-messages"
            element={<ContactMessages />}
          />

        </Route>

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </Suspense>
  );
}