"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { Project } from "@/data/projects";

type ProjectsSectionProps = {
  projects: Project[];
};

const colorProjectOrderSlugs = [
  "men-in-underwear",
  "age-women-25-90",
  "couples",
  "double-portraits",
  "isortoq-unartoq",
  "nairobi",
  "masai-mara",
  "arusha",
  "zambia",
  "portraits-and-architecture",
  "svalbard",
  "dagalisuiten",
  "mongolia",
  "rena-006",
  "goto-fukue",
  "rennebu",
  "vindoldalen",
  "akerselva-2020",
  "flekkefjord",
];

const colorProjectOrderRank = new Map(colorProjectOrderSlugs.map((slug, index) => [slug, index]));

const projectColorBySlug = new Map<string, string>([
  ["men-in-underwear", "blue"],
  ["age-women-25-90", "red"],
  ["couples", "black"],
  ["double-portraits", "pink"],
  ["isortoq-unartoq", "blue"],
  ["nairobi", "white"],
  ["masai-mara", "white"],
  ["arusha", "green"],
  ["zambia", "blue"],
  ["portraits-and-architecture", "grey"],
  ["svalbard", "white"],
  ["new-portraits", "green"],
  ["dagalisuiten", "green"],
  ["mongolia", "grey"],
  ["rena-006", "white"],
  ["goto-fukue", "beige"],
  ["rennebu", "green"],
  ["vindoldalen", "green"],
  ["akerselva-2020", "brown"],
  ["flekkefjord", "blue"],
]);

const colorOrder = ["blue", "red", "black", "pink", "white", "green", "grey", "beige", "brown"];
const colorRank = new Map(colorOrder.map((color, index) => [color, index]));

type SortMode = "year" | "title" | "color";

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [sortMode, setSortMode] = useState<SortMode>("color");

  const sortedProjects = useMemo(() => {
    const items = [...projects];

    if (sortMode === "year") {
      // Newest first.
      return items.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
    }

    if (sortMode === "title") {
      return items.sort((a, b) => a.title.localeCompare(b.title));
    }

    return items.sort((a, b) => {
      const colorA = projectColorBySlug.get(a.slug);
      const colorB = projectColorBySlug.get(b.slug);
      const rankA = colorA ? (colorRank.get(colorA) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
      const rankB = colorB ? (colorRank.get(colorB) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      const projectRankA = colorProjectOrderRank.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
      const projectRankB = colorProjectOrderRank.get(b.slug) ?? Number.MAX_SAFE_INTEGER;

      if (projectRankA !== projectRankB) {
        return projectRankA - projectRankB;
      }

      // Keep unlisted projects stable and predictable.
      return a.year - b.year;
    });
  }, [projects, sortMode]);

  return (
    <section id="projects" className="pb-28 md:pb-36">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 md:px-10">
        <p className="text-xs uppercase tracking-[0.14em] text-black/55">Projects</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortMode("year")}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition ${
              sortMode === "year"
                ? "border-black/40 bg-black text-white"
                : "border-black/20 bg-white text-black hover:border-black/35"
            }`}
          >
            Year ↓
          </button>
          <button
            type="button"
            onClick={() => setSortMode("title")}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition ${
              sortMode === "title"
                ? "border-black/40 bg-black text-white"
                : "border-black/20 bg-white text-black hover:border-black/35"
            }`}
          >
            A-Z
          </button>
          <button
            type="button"
            onClick={() => setSortMode("color")}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition ${
              sortMode === "color"
                ? "border-black/40 bg-black text-white"
                : "border-black/20 bg-white text-black hover:border-black/35"
            }`}
          >
            Color
          </button>
        </div>
      </div>
      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 md:px-10 lg:grid-cols-3">
        {sortedProjects.map((project) => {
          const previewImage = project.coverImage || project.gallery[0];

          return (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group block overflow-hidden border border-black/10 bg-white transition hover:border-black/30"
            >
              <figure className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={previewImage}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </figure>
              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-black/55">
                  {project.city ? `${project.city}, ` : ""}
                  {project.country} · {project.year}
                </p>
                <h3 className="mt-2 font-serif text-2xl leading-tight tracking-tight">{project.title}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
