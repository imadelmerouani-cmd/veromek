import Navbar from "./Navbar";
import Footer from "./Footer";

function TopBar() {
  return (
    <div className="border-b border-zinc-800 bg-black px-4 py-2 text-xs text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
        <span>🚚 Free shipping on eligible orders</span>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href="https://wa.me/34610982845?text=Hello%20VeroMek%2C%20I%20need%20help."
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            💬 +34 610 982 845
          </a>

          <a
            href="mailto:veromek00@proton.me"
            className="hover:underline"
          >
            ✉️ veromek00@proton.me
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <>
      <TopBar />
      <Navbar />

      <main className="min-h-screen">
        {children}
      </main>

      <Footer />
    </>
  );
}