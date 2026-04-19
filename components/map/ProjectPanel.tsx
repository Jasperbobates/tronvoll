import Link from "next/link";
import Image from "next/image";

import type { Project } from "@/data/projects";

type ProjectPanelProps = {
  project: Project;
};

export default function ProjectPanel({ project }: ProjectPanelProps) {
  const [mainImage, ...additionalImages] = project.gallery;

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

      <aside className="absolute bottom-3 right-3 z-10 w-[calc(100vw-1.5rem)] max-w-sm bg-white/92 p-4 shadow-sm backdrop-blur-sm md:bottom-6 md:right-6 md:w-[min(24rem,calc(100vw-3rem))] md:p-6">
        {mainImage && (
          <figure className="relative mb-4 aspect-[4/3] w-full overflow-hidden bg-neutral-100 md:hidden">
            <Image
              src={mainImage}
              alt={`${project.title} main image`}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </figure>
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
