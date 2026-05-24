import type { Metadata } from "next";

import MapCanvas from "@/components/map/MapCanvas";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ContactSection from "@/components/sections/ContactSection";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Photography Map Portfolio",
  description: "A minimalist photography portfolio navigated through a world map.",
};

export default function Home() {
  return (
    <main className="bg-white text-black">
      <MapCanvas projects={projects} />
      <AboutSection />
      <ProjectsSection projects={projects} />
      <ContactSection />
    </main>
  );
}
