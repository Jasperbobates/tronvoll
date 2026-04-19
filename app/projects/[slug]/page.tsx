import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getProjectBySlug, projects } from "@/data/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-20">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.14em] text-black/55">
          {project.city ? `${project.city}, ` : ""}
          {project.country} · {project.year}
        </p>
        <h1 className="mt-4 font-serif text-5xl tracking-tight md:text-6xl">{project.title}</h1>
        <p className="mt-5 text-base leading-relaxed text-black/75 md:text-lg">{project.description}</p>
      </header>

      <section className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2">
        {project.gallery.map((imagePath, index) => (
          <figure key={imagePath} className="relative overflow-hidden bg-neutral-100">
            <Image
              src={imagePath}
              alt={`${project.title} image ${index + 1}`}
              width={1800}
              height={1200}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-auto w-full object-cover"
              priority={index === 0}
            />
          </figure>
        ))}
      </section>
    </main>
  );
}
