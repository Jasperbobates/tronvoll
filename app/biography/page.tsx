import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  groupExhibitions,
  installationImagesByEntry,
  publicCollections,
  soloExhibitions,
  type ChronologySection,
} from "@/data/biography";

export const metadata: Metadata = {
  title: "Biography & CV",
  description:
    "Biography, selected solo and group exhibitions, and public collections for Mette Tronvoll.",
  alternates: {
    canonical: "/biography",
  },
};

function ChronologyList({ title, sections }: { title: string; sections: ChronologySection[] }) {
  return (
    <section>
      <h2 className="font-serif text-3xl tracking-tight md:text-4xl">{title}</h2>
      <div className="mt-6 space-y-3">
        {sections.map((section, index) => (
          <details key={`${section.year}-${index}`} open className="border border-black/10 bg-white">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm uppercase tracking-[0.14em] text-black/70">
              {section.year}
            </summary>
            <ul className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-black/80 md:text-base">
              {section.entries.map((entry) => {
                const keyByYear = `${section.year}|${entry}`;
                const installationImages = installationImagesByEntry[keyByYear] ?? [];

                return (
                  <li key={entry}>
                    <p>{entry}</p>
                    {installationImages.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {installationImages.map((imagePath, index) => (
                          <figure key={`${entry}-${imagePath}`} className="overflow-hidden border border-black/10 bg-neutral-100">
                            <Image
                              src={imagePath}
                              alt={`Installation view for ${entry} (${index + 1})`}
                              width={1400}
                              height={900}
                              sizes="(max-width: 768px) 100vw, 420px"
                              className="h-auto w-full"
                            />
                          </figure>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function BiographyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-20">
      <Link href="/" className="text-xs uppercase tracking-[0.14em] text-black/55 underline underline-offset-4">
        Back to map
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.14em] text-black/55">Biography & CV</p>
        <h1 className="mt-4 font-serif text-5xl tracking-tight md:text-6xl">Mette Tronvoll</h1>
        <p className="mt-5 text-base leading-relaxed text-black/75 md:text-lg">
          A structured overview of exhibitions and collections. Entries are grouped by year and can be expanded as needed
          for easier reading.
        </p>
      </header>

      <div className="mt-14 space-y-16">
        <ChronologyList title="Solo Exhibitions" sections={soloExhibitions} />
        <ChronologyList title="Group Exhibitions" sections={groupExhibitions} />

        <section>
          <h2 className="font-serif text-3xl tracking-tight md:text-4xl">Public Collections</h2>
          <ul className="mt-6 space-y-2 text-sm leading-relaxed text-black/80 md:text-base">
            {publicCollections.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
