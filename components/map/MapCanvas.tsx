"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Project } from "@/data/projects";
import ProjectPanel from "@/components/map/ProjectPanel";

type MapCanvasProps = {
  projects: Project[];
};

const DEFAULT_CENTER: [number, number] = [10, 20];
const DEFAULT_ZOOM = 1.5;
const DEFAULT_PITCH = 16;
const DEFAULT_BEARING = 0;
const MOBILE_MIN_ZOOM = 0;

const createCircularMarkerImage = (imageUrl: string) =>
  new Promise<ImageData>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const size = 64;
      const inset = 4;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Failed to create marker context"));
        return;
      }

      const drawableSize = size - inset * 2;
      const scale = Math.max(drawableSize / image.width, drawableSize / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const drawX = (size - drawWidth) / 2;
      const drawY = (size - drawHeight) / 2;

      context.save();
      context.beginPath();
      context.arc(size / 2, size / 2, drawableSize / 2, 0, Math.PI * 2);
      context.closePath();
      context.clip();
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      context.restore();
      context.beginPath();
      context.arc(size / 2, size / 2, drawableSize / 2, 0, Math.PI * 2);
      context.strokeStyle = "#ffffff";
      context.lineWidth = 3;
      context.stroke();

      resolve(context.getImageData(0, 0, size, size));
    };

    image.onerror = () => {
      reject(new Error(`Failed to load marker image: ${imageUrl}`));
    };

    image.src = imageUrl;
  });

export default function MapCanvas({ projects }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fitAllProjectsInView = (map: Map) => {
    map.easeTo({
      center: DEFAULT_CENTER,
      zoom: MOBILE_MIN_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      duration: 700,
      essential: true,
    });
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const isMobileViewport = window.innerWidth < 768;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: isMobileViewport ? MOBILE_MIN_ZOOM : 1.2,
      maxZoom: 10,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      attributionControl: false,
      dragPan: true,
      dragRotate: false,
      touchZoomRotate: true,
      touchPitch: false,
      scrollZoom: false,
      doubleClickZoom: true,
      renderWorldCopies: true,
    });

    map.on("load", async () => {
      const style = map.getStyle();
      for (const layer of style.layers) {
        if (layer.type !== "symbol") {
          continue;
        }

        const textField = layer.layout?.["text-field"];
        if (!textField) {
          continue;
        }

        try {
          map.setLayoutProperty(layer.id, "text-field", [
            "coalesce",
            ["get", "name_en"],
            ["get", "name:en"],
            ["get", "name"],
          ]);
        } catch {
          // Some symbol layers are not place labels; ignore unsupported overrides.
        }
      }

      await Promise.all(
        projects.map(async (project) => {
          const imageId = `project-thumb-${project.slug}`;
          if (map.hasImage(imageId)) {
            return;
          }

          try {
            const imageUrl = new URL(project.coverImage, window.location.origin).toString();
            const markerImage = await createCircularMarkerImage(imageUrl);
            map.addImage(imageId, markerImage, { pixelRatio: 2 });
          } catch {
            // Keep default point for this project if image marker creation fails.
          }
        }),
      );

      map.addSource("projects", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: projects.map((project) => ({
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [project.longitude, project.latitude],
            },
            properties: {
              slug: project.slug,
              title: project.title,
              imageId: `project-thumb-${project.slug}`,
            },
          })),
        },
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 30,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "projects",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#111111",
          "circle-radius": ["step", ["get", "point_count"], 16, 6, 20, 12, 24],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "projects",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-anchor": "center",
          "text-justify": "center",
          "text-offset": [0, 0],
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "projects",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#111111",
          "circle-radius": 10,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      map.addLayer({
        id: "unclustered-photo",
        type: "symbol",
        source: "projects",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": ["get", "imageId"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 1.5, 1.24, 5, 1.84, 10, 2.36],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      const handleClusterClick = (event: maplibregl.MapLayerMouseEvent) => {
        const clusterFeature = event.features?.[0];
        if (!clusterFeature) {
          return;
        }

        const clusterId = clusterFeature?.properties?.cluster_id;
        if (clusterId === undefined) {
          return;
        }

        const source = map.getSource("projects") as GeoJSONSource;
        source
          .getClusterLeaves(clusterId, Infinity, 0)
          .then((leaves) => {
            const points = leaves
              .map((leaf) => (leaf.geometry.type === "Point" ? leaf.geometry.coordinates : null))
              .filter((coordinates): coordinates is [number, number] => coordinates !== null);

            if (points.length === 0) {
              return;
            }

            const bounds = points.reduce(
              (accumulator, [longitude, latitude]) =>
                accumulator.extend([longitude, latitude] as maplibregl.LngLatLike),
              new maplibregl.LngLatBounds(points[0], points[0]),
            );

            map.fitBounds(bounds, {
              padding: { top: 80, right: 80, bottom: 80, left: 80 },
              maxZoom: 10,
              duration: 700,
              essential: true,
            });
          })
          .catch(() => {
            return;
          });
      };

      map.on("click", "clusters", handleClusterClick);
      map.on("click", "cluster-count", handleClusterClick);

      const handleProjectPointClick = (event: maplibregl.MapLayerMouseEvent) => {
        const pointFeature = event.features?.[0];
        const slug = pointFeature?.properties?.slug;
        if (!slug) {
          return;
        }

        const project = projects.find((item) => item.slug === slug);
        if (!project) {
          return;
        }

        setActiveProject(project);
        const horizontalOffset = window.innerWidth >= 768 ? Math.round(window.innerWidth * 0.16) : 0;
        map.easeTo({
          center: [project.longitude, project.latitude],
          zoom: 5,
          offset: [horizontalOffset, 0],
          duration: 700,
          essential: true,
        });
      };

      map.on("click", "unclustered-point", handleProjectPointClick);
      map.on("click", "unclustered-photo", handleProjectPointClick);

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseenter", "cluster-count", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mouseleave", "cluster-count", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseenter", "unclustered-photo", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mouseleave", "unclustered-photo", () => {
        map.getCanvas().style.cursor = "";
      });

      if (window.innerWidth < 768) {
        fitAllProjectsInView(map);
      }

    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [projects]);

  const resetMapView = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (window.innerWidth < 768) {
      fitAllProjectsInView(map);
      return;
    }

    map.easeTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      duration: 700,
      essential: true,
    });
  };

  const handleResetView = () => {
    setActiveProject(null);
    setIsMobileMenuOpen(false);
    resetMapView();
  };

  const handleScrollToSection = (sectionId: string) => {
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
      return;
    }

    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setIsMobileMenuOpen(false);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-neutral-50">
      <div
        ref={containerRef}
        className="h-full w-full [transform:perspective(1400px)_rotateX(1.4deg)] [transform-origin:center_top]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/25" />
      <button
        type="button"
        onClick={handleResetView}
        className="absolute right-3 top-3 z-10 border border-black/15 bg-white/90 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-white md:right-6 md:top-6 md:px-4 md:text-xs"
      >
        Reset View
      </button>
      {activeProject && <ProjectPanel project={activeProject} />}
      {!activeProject && (
        <>
          <div className="absolute left-3 top-3 max-w-[60vw] text-black md:left-8 md:top-8 md:max-w-sm">
            <h1 className="font-serif text-3xl tracking-tight md:text-5xl">Mette Tronvoll</h1>
            <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-black/70 md:mt-3 md:text-sm">
              Photographic Projects by Place
            </p>
          </div>
        </>
      )}
      <nav className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 bg-white/88 p-1.5 shadow-sm backdrop-blur-sm md:flex">
        <Link
          href="/biography"
          className="border border-black/15 px-3 py-2 text-center text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-white md:text-xs"
        >
          CV
        </Link>
        <button
          type="button"
          onClick={() => handleScrollToSection("about")}
          className="border border-black/15 px-3 py-2 text-center text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-white md:text-xs"
        >
          About
        </button>
        <button
          type="button"
          onClick={() => handleScrollToSection("projects")}
          className="border border-black/15 px-3 py-2 text-center text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-white md:text-xs"
        >
          Projects
        </button>
        <button
          type="button"
          onClick={() => handleScrollToSection("contact")}
          className="border border-black/15 px-3 py-2 text-center text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-white md:text-xs"
        >
          Contact
        </button>
      </nav>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-10 md:hidden"
        />
      )}

      <div className="fixed bottom-3 right-3 z-20 md:hidden">
        {isMobileMenuOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-44 bg-white/95 p-2 shadow-sm backdrop-blur-sm">
            <Link
              href="/biography"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block border border-black/15 px-3 py-2 text-center text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-white"
            >
              CV
            </Link>
            <button
              type="button"
              onClick={() => handleScrollToSection("about")}
              className="mt-2 block w-full border border-black/15 px-3 py-2 text-center text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-white"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handleScrollToSection("projects")}
              className="mt-2 block w-full border border-black/15 px-3 py-2 text-center text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-white"
            >
              Projects
            </button>
            <button
              type="button"
              onClick={() => handleScrollToSection("contact")}
              className="mt-2 block w-full border border-black/15 px-3 py-2 text-center text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-white"
            >
              Contact
            </button>
          </div>
        )}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="border border-black/15 bg-white/95 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-black shadow-sm transition hover:bg-white"
        >
          Menu
        </button>
      </div>
    </section>
  );
}
