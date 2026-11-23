import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Manual from "../../public/images/assets/manual.webp";
import Logo from "../../public/images/hero-image/logo-no-background.png";
import Star from "../../public/images/assets/starette.webp";

const questions = [
  {
    number: "I",
    title: "What Is a Photo Preset?",
    content: (
      <>
        <p>
          A preset is a small packet of photographic alchemy: a saved recipe of
          color, contrast, tone, grain, and other adjustments that Lightroom can
          apply to a photograph in a single click.
        </p>
        <p>
          It does not replace your original photograph, and it does not trap you
          in its choices. After applying one, every adjustment remains yours to
          refine. Think of the preset as the opening move—not the final word.
        </p>
      </>
    ),
  },
  {
    number: "II",
    title: "How Do I Download My Presets?",
    content: (
      <>
        <p>
          After checkout, download your collection to the computer where you use
          Lightroom. It will arrive as a <strong>ZIP file</strong>. On desktop,
          leave that ZIP closed; Lightroom is perfectly capable of opening the
          parcel itself.
        </p>
        <p>
          Keep a copy somewhere safe after installation. Presets are tiny, but
          losing them into the dark attic of one’s Downloads folder is remarkably
          easy.
        </p>
      </>
    ),
  },
  {
    number: "III",
    title: "How Do I Install Them in Lightroom?",
    content: (
      <ol className="space-y-3 border-l border-accent/40 pl-4 sm:pl-5 [&_strong]:text-accent">
        <li><strong>1.</strong> Open Lightroom on your Mac or Windows computer.</li>
        <li><strong>2.</strong> From the menu bar, choose <strong>File → Import Profiles &amp; Presets</strong>.</li>
        <li><strong>3.</strong> Select the downloaded Photo Presets ZIP file. You do not need to unzip it first.</li>
        <li><strong>4.</strong> Choose <strong>Import</strong>.</li>
        <li><strong>5.</strong> Open a photograph, reveal the Presets panel, and look for your new collection.</li>
      </ol>
    ),
  },
  {
    number: "IV",
    title: "What About Lightroom Classic?",
    content: (
      <ol className="space-y-3 border-l border-accent/40 pl-4 sm:pl-5 [&_strong]:text-accent">
        <li><strong>1.</strong> Open Lightroom Classic and enter the <strong>Develop</strong> module.</li>
        <li><strong>2.</strong> Find the <strong>Presets</strong> panel on the left.</li>
        <li><strong>3.</strong> Click the <strong>+</strong> beside Presets and choose <strong>Import Presets</strong>.</li>
        <li><strong>4.</strong> Select your ZIP file—or the enclosed XMP files—and choose <strong>Import</strong>.</li>
        <li><strong>5.</strong> If the collection does not appear immediately, restart Lightroom Classic and look again.</li>
      </ol>
    ),
  },
  {
    number: "V",
    title: "Can I Use Them on My Phone or Tablet?",
    content: (
      <>
        <p>
          Yes. The easiest route is through the clouds—Adobe’s clouds, in this
          instance. Import the collection into Lightroom desktop while signed in
          to the same Adobe account you use on mobile. Once syncing finishes, the
          presets should appear in Lightroom on your phone or tablet.
        </p>
        <p>
          If they seem reluctant to materialize, confirm that syncing is enabled
          on both devices and that each is using the same Adobe account.
        </p>
      </>
    ),
  },
  {
    number: "VI",
    title: "How Do I Use a Preset?",
    content: (
      <>
        <p>
          Open a photograph, enter the editing view, and choose a preset from the
          Presets panel. Hovering over a preset on desktop previews its effect;
          clicking applies it.
        </p>
        <p>
          Every photograph brings its own peculiar weather. After applying a
          preset, you may wish to adjust Exposure, White Balance, or Intensity.
          This is not a failure of the spell. It is the pleasure of finishing it.
        </p>
      </>
    ),
  },
  {
    number: "VII",
    title: "Can I Re-download a Collection?",
    content: (
      <p>
        Yes. Sign in to your Photo Presets account and open{" "}
        <Link href="/downloads" className="text-accent underline decoration-1 underline-offset-4 hover:text-white">
          Your Library
        </Link>
        . Your purchased collections will be kept there for another expedition.
      </p>
    ),
  },
  {
    number: "VIII",
    title: "Something Has Gone Sideways. What Now?",
    content: (
      <>
        <ul className="list-disc space-y-2 pl-6">
          <li>Make sure you are importing the original ZIP or its XMP files.</li>
          <li>Check that Lightroom is up to date.</li>
          <li>Restart Lightroom after importing.</li>
          <li>In Lightroom Classic, confirm that you are looking in the Develop module’s Presets panel.</li>
          <li>Search the Presets panel for the collection or preset name.</li>
        </ul>
        <p>
          Still stranded? Send us a note through the{" "}
          <Link href="/contact" className="text-accent underline decoration-1 underline-offset-4 hover:text-white">
            Contact page
          </Link>
          . Tell us which version of Lightroom and which operating system you are
          using, and describe where the machinery stopped. We’ll bring a lantern.
        </p>
      </>
    ),
  },
];

export default function ManualPage() {
  return (
    <>
      <Head>
        <title>Manual | Photo Presets</title>
        <meta
          name="description"
          content="Learn how to download, install, and use Photo Presets in Adobe Lightroom and Lightroom Classic."
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

          <h1 className="bourbonbase text-center text-5xl leading-none text-black sm:text-7xl lg:text-8xl">
            Manual
          </h1>

          <Image
            src={Manual}
            alt=""
            className="mx-auto h-14 w-auto -rotate-90 object-contain sm:h-24"
            priority
          />
        </header>

        <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-10 sm:py-8 lg:pb-20">
          <article className="rounded-[2.25rem] border-2 border-accent bg-darkCard px-6 py-9 text-white shadow-cool-shadow sm:rounded-[2.75rem] sm:px-14 sm:py-12 lg:px-20">
            <div className="flex items-center justify-center gap-6 sm:gap-12">
              <Image src={Star} alt="" className="hidden h-auto w-20 sm:block" />
              <Image
                src={Manual}
                alt="A vintage how-to manual"
                className="h-auto w-32 sm:w-44"
                priority
              />
              <Image src={Star} alt="" className="hidden h-auto w-20 sm:block" />
            </div>

            <div className="mt-6 text-center sm:mt-8">
              <p className="bourbonbase text-3xl leading-[1.15] text-accent sm:text-5xl">
                Answers to
              </p>
              <p className="french-news mt-1 text-4xl uppercase leading-[1.1] text-[#e4a64f] sm:text-6xl">
                Questions
              </p>
              <p className="bourbonbase mt-1 text-3xl leading-[1.15] text-accent sm:text-5xl">
                You May Have
              </p>
            </div>

            <nav className="mx-auto mt-10 max-w-2xl border-y border-accent/50 py-6 sm:mt-12 sm:py-7" aria-label="Manual contents">
              <p className="french-news mb-5 text-center text-base uppercase tracking-[0.14em] text-accent sm:text-lg">
                Open to a Question
              </p>
              <ol className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
                {questions.map((question) => (
                  <li key={question.number}>
                    <a
                      href={`#question-${question.number.toLowerCase()}`}
                      className="french-news block text-base leading-[1.45] text-white/80 transition-colors hover:text-accent focus-visible:text-accent sm:text-lg"
                    >
                      {question.number}. {question.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mx-auto mt-12 max-w-2xl space-y-12 sm:mt-16 sm:space-y-16">
              {questions.map((question) => (
                <section
                  id={`question-${question.number.toLowerCase()}`}
                  key={question.number}
                  className="scroll-mt-6 border-t border-accent/25 pt-8 sm:pt-10"
                >
                  <h2 className="grid grid-cols-[2.25rem_1fr] items-start gap-2 font-normal text-[#e4a64f] sm:grid-cols-[3rem_1fr] sm:gap-3">
                    <span className="bourbonbase text-2xl leading-[1.35] text-accent sm:text-3xl">
                      {question.number}.
                    </span>
                    <span className="french-news text-2xl leading-[1.35] sm:text-3xl">
                      {question.title}
                    </span>
                  </h2>
                  <div className="french-news mt-5 space-y-5 text-lg leading-[1.65] text-white/85 sm:ml-[3.75rem] sm:mt-6 sm:text-xl sm:leading-[1.7]">
                    {question.content}
                  </div>
                </section>
              ))}
            </div>

            <Image src={Star} alt="" className="mx-auto mt-16 h-auto w-16 sm:mt-20 sm:w-20" />
          </article>
        </main>
      </div>
    </>
  );
}
