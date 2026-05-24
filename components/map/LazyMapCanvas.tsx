"use client";

import dynamic from "next/dynamic";

import type { Project } from "@/data/projects";

const MapCanvas = dynamic(() => import("@/components/map/MapCanvas"), {
  ssr: false,
  loading: () => <section className="h-screen w-full animate-pulse bg-neutral-100" aria-label="Loading map" />,
});

type LazyMapCanvasProps = {
  projects: Project[];
};

export default function LazyMapCanvas({ projects }: LazyMapCanvasProps) {
  return <MapCanvas projects={projects} />;
}
