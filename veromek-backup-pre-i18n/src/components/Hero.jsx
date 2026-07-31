import { ArrowRight, CheckCircle2, LockKeyhole, MessageCircle, PackageCheck, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: PackageCheck, label: "Tracked delivery" },
  { icon: LockKeyhole, label: "Secure checkout" },
  { icon: CheckCircle2, label: "Carefully selected" },
  { icon: MessageCircle, label: "Responsive support" },
];

export default function Hero() {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-950 transition-colors dark:from-zinc-950 dark:via-zinc-900 dark:to-black dark:text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-black">Limited drops · New styles</span>
          <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">Premium fashion.<span className="block text-gray-500 dark:text-gray-400">Made to stand out.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">Discover trending shoes, clothing and accessories selected for modern style, quality and everyday wear.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"><ShoppingBag size={20} />Shop best sellers</Link>
            <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 px-8 py-4 font-bold transition hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900">Explore all products<ArrowRight size={18} /></Link>
          </div>
          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {benefits.map(({ icon: Icon, label }) => <div key={label} className="rounded-2xl border border-gray-200 bg-white/70 p-3 text-sm font-bold backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70"><Icon size={18} className="mb-2" />{label}</div>)}
          </div>
        </div>
        <div className="relative">
          <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white p-3 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <img src="/LOGO1.jpg" alt="VeroMek fashion collection" className="h-[460px] w-full rounded-[28px] object-cover sm:h-[560px]" />
            <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-black/75 p-4 text-white backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.2em] text-gray-300">VeroMek selection</p><p className="mt-1 text-lg font-black">Trending fashion, selected for you.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
