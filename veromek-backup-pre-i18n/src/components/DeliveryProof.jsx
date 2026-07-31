import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  PackageCheck,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

const proofModules = import.meta.glob(
  "/src/assets/delivery-proof/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default",
    query: "?url",
  }
);

function getProofItems() {
  return Object.entries(proofModules)
    .map(([path, src]) => ({
      id: path,
      src,
      name:
        path
          .split("/")
          .pop()
          ?.replace(/\.[^.]+$/, "")
          ?.replace(/[-_]+/g, " ") ||
        "Verified delivery",
    }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
      })
    );
}

export default function DeliveryProof() {
  const proofItems = useMemo(
    () => getProofItems(),
    []
  );

  const [selectedIndex, setSelectedIndex] =
    useState(null);

  const selectedItem =
    selectedIndex === null
      ? null
      : proofItems[selectedIndex];

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const showPrevious = () => {
    setSelectedIndex((current) => {
      if (current === null) {
        return null;
      }

      return (
        current -
        1 +
        proofItems.length
      ) % proofItems.length;
    });
  };

  const showNext = () => {
    setSelectedIndex((current) => {
      if (current === null) {
        return null;
      }

      return (
        current + 1
      ) % proofItems.length;
    });
  };

  useEffect(() => {
    if (selectedIndex === null) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedIndex, proofItems.length]);

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700 dark:bg-green-950/40 dark:text-green-300">
            <PackageCheck size={17} />
            Real customer deliveries
          </div>

          <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            Delivered. Verified. Shared by customers.
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Real delivery confirmations and customer
            screenshots from completed VeroMek orders.
            Personal details are hidden for privacy.
          </p>
        </div>

        {proofItems.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
            <ImageIcon
              size={48}
              className="mx-auto text-gray-400"
            />

            <h3 className="mt-5 text-2xl font-black">
              Delivery proof coming soon
            </h3>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-gray-500 dark:text-gray-400">
              Add privacy-safe customer screenshots
              inside{" "}
              <code className="rounded bg-gray-200 px-2 py-1 text-sm dark:bg-zinc-800">
                src/assets/delivery-proof
              </code>
              .
            </p>
          </div>
        ) : (
          <div className="relative">
            <div
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Customer delivery proofs"
            >
              {proofItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelectedIndex(index)
                  }
                  className="group w-[84%] shrink-0 snap-start overflow-hidden rounded-3xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:w-[46%] lg:w-[31%]"
                  aria-label="Open verified customer delivery"
                >
                  <div className="border-b border-gray-200 bg-black px-5 py-4 text-white dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-black tracking-tight">
                          Vero
                          <span className="text-gray-400">
                            Mek
                          </span>
                        </p>

                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                          Customer delivery
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                        <CheckCircle2 size={14} />
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-5 dark:bg-zinc-950">
                    <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-[22px] border border-gray-200 bg-black shadow-xl dark:border-zinc-700">
                      <img
                        src={item.src}
                        alt="Verified VeroMek customer delivery"
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-black">
                        Verified customer delivery
                      </p>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Swipe to see more
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700 dark:bg-green-950/40 dark:text-green-300">
                      <CheckCircle2 size={14} />
                      Verified
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <p className="mt-2 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
              Swipe horizontally to browse more deliveries.
            </p>
          </div>
        )}
      </section>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delivery proof preview"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200"
            aria-label="Close preview"
          >
            <X size={22} />
          </button>

          {proofItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200 sm:left-6"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200 sm:right-6"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <figure className="w-full max-w-3xl overflow-hidden rounded-[30px] bg-white p-3 shadow-2xl">
            <div className="relative mx-auto aspect-[4/5] max-h-[76vh] overflow-hidden rounded-2xl bg-black">
              <img
                src={selectedItem.src}
                alt="Verified VeroMek customer delivery"
                className="h-full w-full object-cover object-center"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>

            <figcaption className="px-3 pb-2 pt-4 text-center font-black text-black">
              Verified VeroMek delivery
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}