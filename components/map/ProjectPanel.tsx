"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import type { Project } from "@/data/projects";

type ProjectPanelProps = {
  project: Project;
};

export default function ProjectPanel({ project }: ProjectPanelProps) {
  const [showSwipeArrow, setShowSwipeArrow] = useState(true);
  const [mainImage, ...additionalImages] = project.gallery;
  const mobileImages = project.gallery;

  useEffect(() => {
    setShowSwipeArrow(true);
  }, [project.slug]);

  const handleReelScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    if (showSwipeArrow && event.currentTarget.scrollLeft > 8) {
      setShowSwipeArrow(false);
    }
  };

  return (
    <>
      <aside className="absolute left-6 top-6 bottom-6 z-10 hidden w-[min(42rem,58vw)] overflow-y-auto bg-white/92 p-4 shadow-sm backdrop-blur-sm md:block">
        {mainImage && (
          <figure className="w-full overflow-hidden bg-neutral-100">
            <Image
              src={mainImage}
              alt={`${project.title} main image`}
              width={1800}
              height={1200}
              sizes="(max-width: 1024px) 55vw, 42rem"
              className="block h-auto w-full"
              priority
            />
          </figure>
        )}
        {additionalImages.length > 0 && (
          <div className="mt-3 space-y-3 pb-1">
            {additionalImages.map((imagePath, index) => (
              <figure key={imagePath} className="w-full overflow-hidden bg-neutral-100">
                <Image
                  src={imagePath}
                  alt={`${project.title} image ${index + 2}`}
                  width={1800}
                  height={1200}
                  sizes="(max-width: 1024px) 55vw, 42rem"
                  className="block h-auto w-full"
                />
              </figure>
            ))}
          </div>
        )}
      </aside>

      <aside className="absolute bottom-3 right-3 z-10 w-[calc(100vw-1.5rem)] max-w-sm bg-white/92 p-4 shadow-sm backdrop-blur-sm md:bottom-auto md:right-6 md:top-6 md:w-[min(24rem,calc(100vw-3rem))] md:p-6">
        {mobileImages.length > 0 && (
          <div className="relative mb-4 md:hidden">
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-2" onScroll={handleReelScroll}>
              {mobileImages.map((imagePath, index) => (
                <figure key={imagePath} className="min-w-[calc(100%-1.6rem)] snap-center overflow-hidden bg-neutral-100">
                  <Image
                    src={imagePath}
                    alt={`${project.title} image ${index + 1}`}
                    width={1800}
                    height={1200}
                    sizes="(max-width: 768px) 94vw, 100vw"
                    className="block h-auto w-full"
                    priority={index === 0}
                  />
                </figure>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/90 to-transparent" />
            {showSwipeArrow && (
              <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/35" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        )}
        <p className="text-xs uppercase tracking-[0.14em] text-black/50">
          {project.city ? `${project.city}, ` : ""}
          {project.country} · {project.year}
        </p>
        <h2 className="mt-3 font-serif text-2xl leading-tight tracking-tight md:text-3xl">{project.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-black/70">{project.description}</p>
        <Link href={`/projects/${project.slug}`} className="mt-6 inline-block text-sm underline underline-offset-4">
          View project
        </Link>
      </aside>
    </>
  );
}
