import Link from "next/link";

export default function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-28 md:px-10 md:py-36">
      <p className="text-xs uppercase tracking-[0.14em] text-black/55">About</p>
      <div className="mt-7 max-w-3xl space-y-6">
        <h2 className="font-serif text-4xl leading-tight md:text-5xl">
          Quiet observations of people, landscapes, and architecture.
        </h2>
        <p className="text-base leading-relaxed text-black/75 md:text-lg">
          Mette Tronvoll is a photographer living and working in Oslo, Norway. Her practice explores
          geography as narrative, using light and distance to shape intimate visual stories.
        </p>
        <Link href="/biography" className="inline-block text-sm underline underline-offset-4">
          Read full biography, exhibitions, and collections
        </Link>
      </div>
    </section>
  );
}
