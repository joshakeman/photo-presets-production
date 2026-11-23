import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../context/authContext";
import products from "../../lib/products.generated.json";
import Logo from "../../public/images/hero-image/logo-no-background.png";
import Portmanteau from "../../public/images/assets/portmanteau.webp";
import Star from "../../public/images/assets/starette.webp";

const catalogue = Object.entries(products).map(([id, product]) => ({ id, ...product }));

function CollectionCard({ collection }) {
  const presetCount = collection.sets.reduce(
    (total, set) => total + (set.presets?.length || 0),
    0,
  );

  return (
    <li className="grid gap-6 border-t border-accent/35 py-8 first:border-t-0 first:pt-0 sm:grid-cols-[12rem_1fr] sm:items-center sm:gap-8">
      <div className="mx-auto w-full max-w-[15rem] sm:max-w-none">
        {collection.menuImage ? (
          <img
            src={collection.menuImage}
            alt={collection.menuImageAlt || `${collection.title} artwork`}
            className="aspect-square w-full rounded-2xl border border-accent/50 object-cover shadow-lg"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-2xl border border-accent/50 bg-black/30">
            <Image src={Star} alt="" className="h-auto w-16" />
          </div>
        )}
      </div>
      <div className="min-w-0 text-center sm:text-left">
        <h2 className="bourbonbase text-3xl leading-tight text-accent sm:text-4xl">
          {collection.title}
        </h2>
        <p className="french-news mt-2 text-lg leading-relaxed text-white/80 sm:text-xl">
          {collection.sets.map((set) => set.title).join(" · ")}
        </p>
        <p className="french-news mt-2 text-base text-white/60">
          {presetCount} presets in {collection.sets.length} volumes
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          {collection.downloadUrl ? (
            <a
              href={collection.downloadUrl}
              className="menu-btn-lg bourbonbase letterpress-button inline-flex min-h-12 items-center justify-center px-6 py-3 text-xl text-accent"
              download
            >
              Download Collection
            </a>
          ) : (
            <span
              className="menu-btn-lg bourbonbase letterpress-button inline-flex min-h-12 cursor-not-allowed items-center justify-center px-6 py-3 text-xl text-accent/60 opacity-70"
              title="The downloadable archive has not been added yet"
            >
              Files Being Prepared
            </span>
          )}
          <Link
            href="/manual"
            className="french-news text-lg text-accent underline decoration-1 underline-offset-4 hover:text-white"
          >
            Read the installation manual
          </Link>
        </div>
      </div>
    </li>
  );
}

export default function DownloadsPage() {
  const { user, authReady } = useAuth();
  const [collections, setCollections] = useState([]);
  const [libraryReady, setLibraryReady] = useState(false);
  const [error, setError] = useState("");
  const isLocalPreview = user?.id === "local-preview-user";

  useEffect(() => {
    if (!authReady || !user) return;

    if (isLocalPreview) {
      setCollections(catalogue);
      setLibraryReady(true);
      return;
    }

    let active = true;
    async function loadLibrary() {
      try {
        const response = await fetch("/api/purchases");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "We couldn't open your library.");
        if (active) setCollections(data.collections || []);
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLibraryReady(true);
      }
    }

    loadLibrary();
    return () => {
      active = false;
    };
  }, [authReady, user, isLocalPreview]);

  return (
    <>
      <Head>
        <title>Your Library | Photo Presets</title>
        <meta
          name="description"
          content="Download your purchased Photo Presets collections and revisit the installation manual."
        />
      </Head>
      <div className="min-h-screen bg-backgroundBlueFaded bg-victorianPattern bg-auto bg-repeat bg-blend-soft-light">
        <header className="grid min-h-[4.5rem] grid-cols-[5.5rem_1fr_4.5rem] items-center gap-2 bg-accent px-3 py-1 sm:min-h-36 sm:grid-cols-[12rem_1fr_8rem] sm:px-8 lg:px-14">
          <Link
            href="/"
            aria-label="Photo Presets home"
            className="w-full transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <Image src={Logo} alt="" className="h-auto w-full" priority />
          </Link>
          <h1 className="bourbonbase text-center text-4xl leading-none text-black sm:text-7xl lg:text-8xl">
            Your Library
          </h1>
          <Image src={Portmanteau} alt="" className="mx-auto h-14 w-auto object-contain sm:h-24" priority />
        </header>

        <main className="mx-auto w-full max-w-4xl px-5 py-6 pb-16 sm:px-10 sm:py-10">
          <section className="rounded-[2.25rem] border-2 border-accent bg-darkCard px-6 py-9 text-white shadow-cool-shadow sm:rounded-[2.75rem] sm:px-12 sm:py-12 lg:px-16">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <div className="mb-5 flex items-center justify-center gap-5">
                <Image src={Star} alt="" className="h-auto w-10 sm:w-12" />
                <Image src={Portmanteau} alt="A vintage portmanteau" className="h-auto w-28 sm:w-36" />
                <Image src={Star} alt="" className="h-auto w-10 sm:w-12" />
              </div>
              <h2 className="bourbonbase text-4xl leading-tight text-accent sm:text-5xl">
                The Collection Cabinet
              </h2>
              <p className="french-news mt-4 text-xl leading-relaxed text-white/85 sm:text-2xl">
                Every collection you acquire is kept safely here, ready to be summoned again whenever you need it.
              </p>
              {isLocalPreview && (
                <p className="french-news mt-4 inline-block rounded-full border border-accent/60 px-4 py-1 text-base text-accent">
                  Local preview — showing the complete catalogue
                </p>
              )}
            </div>

            {!authReady || (user && !libraryReady) ? (
              <p className="french-news py-12 text-center text-2xl text-accent">Unlocking the cabinet…</p>
            ) : !user ? (
              <div className="border-t border-accent/35 py-10 text-center">
                <p className="french-news text-2xl leading-relaxed">Log in to see the collections waiting in your cabinet.</p>
                <Link href="/account?returnTo=/downloads" className="menu-btn-lg bourbonbase letterpress-button mx-auto mt-7 inline-flex px-8 py-3 text-xl text-accent">
                  Log In
                </Link>
              </div>
            ) : error ? (
              <div className="border-t border-accent/35 py-10 text-center" role="alert">
                <p className="french-news text-2xl text-red-300">{error}</p>
                <p className="french-news mt-3 text-lg text-white/75">Please try again shortly, or send us a note if the cabinet remains stubborn.</p>
                <Link href="/contact" className="french-news mt-5 inline-block text-lg text-accent underline underline-offset-4">Contact us</Link>
              </div>
            ) : collections.length > 0 ? (
              <ul aria-label="Your purchased collections">
                {collections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </ul>
            ) : (
              <div className="border-t border-accent/35 py-10 text-center">
                <p className="french-news text-2xl leading-relaxed">Your cabinet is still awaiting its first collection.</p>
                <Link href="/#collections" className="menu-btn-lg bourbonbase letterpress-button mx-auto mt-7 inline-flex px-8 py-3 text-xl text-accent">
                  Explore the Gallery
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
