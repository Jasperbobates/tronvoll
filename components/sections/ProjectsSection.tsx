import Image from "next/image";
import Link from "next/link";

import type { Project } from "@/data/projects";

type ProjectsSectionProps = {
  projects: Project[];
};

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="pb-28 md:pb-36">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <p className="text-xs uppercase tracking-[0.14em] text-black/55">Projects</p>
      </div>
      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 md:px-10 lg:grid-cols-3">
        {projects.map((project) => {
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
