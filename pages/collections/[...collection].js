import Head from "next/head";
import Image from "next/image";
import Collection from "../../components/collection";
import Layout from "../../components/layout";
import { useCart } from "../../context/CartContext";
import products from "../../lib/products.generated.json";
import StarSea from "../../public/images/starsea.png";

export default function CollectionPage({ productId, product }) {
  const { addToCart, isInCart, cartReady } = useCart();
  const cartProduct = { slug: productId, ...product };
  const isAdded = isInCart(cartProduct);
  const setNames = product.sets.map((set) => set.title);
  const presetCount = product.sets.reduce(
    (total, set) => total + (set.presets?.length || 0),
    0,
  );

  return (
    <>
      <Head>
        <title>{`${product.title} | ${presetCount} Photo Presets`}</title>
        <meta
          name="description"
          content={product.description || `Explore ${product.title}, featuring ${setNames.join(", ")}.`}
        />
      </Head>

      <Layout
        backgroundColor="bg-backgroundBlueFaded"
        backgroundImage="bg-victorianPattern"
      >
        <main className="mx-auto mt-20 w-full pb-16 sm:mt-24">
          <header className="mx-auto flex w-full max-w-3xl flex-col items-center px-2 text-center sm:px-6">
            <div className="flex w-full items-center justify-center gap-2 sm:gap-5">
              <Image src={StarSea} alt="" className="h-auto w-[22%] max-w-40" priority />
              {product.buttonImage ? (
                <img
                  src={product.buttonImage}
                  alt={`${product.title} emblem`}
                  className="h-auto w-[38%] max-w-64"
                />
              ) : (
                <h1 className="bourbonbase text-4xl text-accent sm:text-6xl">
                  {product.title}
                </h1>
              )}
              <Image src={StarSea} alt="" className="h-auto w-[22%] max-w-40" priority />
            </div>

            <h1 className="sr-only">{product.title}</h1>
            <button
              type="button"
              className="menu-btn-lg-gold bourbonbase letterpress-button mt-2 block min-w-[12rem] px-5 py-3 text-base disabled:cursor-default disabled:opacity-75 sm:text-2xl"
              onClick={() => addToCart(cartProduct)}
              disabled={!cartReady || isAdded}
              aria-label={isAdded ? `${product.title} is in your portmanteau` : `Add ${product.title} to your portmanteau for $${product.price}`}
            >
              {isAdded ? (
                "In Portmanteau"
              ) : (
                <>
                  Add to Portmanteau · <span className="french-news">$</span>{product.price}
                </>
              )}
            </button>

            <p className="french-news mt-5 max-w-2xl text-xl leading-relaxed text-black sm:text-2xl">
              {setNames.join(" · ")}
            </p>
            <p className="french-news mt-2 max-w-2xl text-lg leading-relaxed text-black/75 sm:text-xl">
              {product.description}
            </p>
          </header>

          <div className="mt-8 space-y-10 sm:mt-12 sm:space-y-14">
            {product.sets.map((set) => (
              <Collection
                key={set.title}
                title={set.title}
                titleCard={set.titleCard}
                assets={set.presets}
              />
            ))}
          </div>
        </main>
      </Layout>
    </>
  );
}

export function getStaticPaths() {
  return {
    paths: Object.values(products).map((product) => ({
      params: { collection: product.href.split("/") },
    })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const href = params.collection.join("/");
  const entry = Object.entries(products).find(([, product]) => product.href === href);

  if (!entry) return { notFound: true };
  const [productId, product] = entry;

  return { props: { productId, product } };
}
