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
const MOBILE_DEFAULT_CENTER: [number, number] = [30, 20];
const MOBILE_PITCH = 0;
const MAX_MAP_ZOOM = 14;
const CLUSTER_MAX_ZOOM = 12;
const CLUSTER_FIT_MAX_ZOOM = 14;
const PREVIEW_MARKER_SIZE = 44;
const PREVIEW_MARKER_INSET = 3;
const PREVIEW_BATCH_SIZE = 6;

const createCircularMarkerImage = (imageUrl: string) =>
  new Promise<ImageData>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const size = PREVIEW_MARKER_SIZE;
      const inset = PREVIEW_MARKER_INSET;
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
      context.lineWidth = 2;
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
      center: MOBILE_DEFAULT_CENTER,
      zoom: MOBILE_MIN_ZOOM,
      pitch: MOBILE_PITCH,
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
      center: isMobileViewport ? MOBILE_DEFAULT_CENTER : DEFAULT_CENTER,
      zoom: isMobileViewport ? MOBILE_MIN_ZOOM : DEFAULT_ZOOM,
      minZoom: isMobileViewport ? MOBILE_MIN_ZOOM : 1.2,
      maxZoom: MAX_MAP_ZOOM,
      pitch: isMobileViewport ? MOBILE_PITCH : DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      attributionControl: false,
      dragPan: true,
      dragRotate: false,
      touchZoomRotate: true,
      touchPitch: false,
      scrollZoom: true,
      doubleClickZoom: true,
      renderWorldCopies: !isMobileViewport,
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
            },
          })),
        },
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
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
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1.5, 6, 5, 9, 10, 11],
          "circle-color": "#111111",
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
          "icon-image": ["concat", "project-thumb-", ["get", "slug"]],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 1.5, 1, 5, 1.15, 10, 1.3],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      const loadedPreviewSlugs = new Set<string>();
      const loadingPreviewSlugs = new Set<string>();
      let scheduledIdleHandle: number | null = null;
      let scheduledTimeoutHandle: ReturnType<typeof setTimeout> | null = null;

      const cancelScheduledPreviewLoad = () => {
        if (scheduledIdleHandle !== null) {
          window.cancelIdleCallback(scheduledIdleHandle);
          scheduledIdleHandle = null;
        }

        if (scheduledTimeoutHandle !== null) {
          clearTimeout(scheduledTimeoutHandle);
          scheduledTimeoutHandle = null;
        }
      };

      const loadPreviewMarker = async (project: Project) => {
        const imageId = `project-thumb-${project.slug}`;
        if (map.hasImage(imageId) || loadedPreviewSlugs.has(project.slug) || loadingPreviewSlugs.has(project.slug)) {
          return;
        }

        loadingPreviewSlugs.add(project.slug);

        try {
          const imageUrl = new URL(project.coverImage, window.location.origin).toString();
          const markerImage = await createCircularMarkerImage(imageUrl);
          if (!map.hasImage(imageId)) {
            map.addImage(imageId, markerImage, { pixelRatio: 2 });
          }
          loadedPreviewSlugs.add(project.slug);
        } catch {
          // Keep fallback circle marker for this project if preview loading fails.
        } finally {
          loadingPreviewSlugs.delete(project.slug);
        }
      };

      const getVisibleProjects = () => {
        const bounds = map.getBounds();
        return projects.filter((project) => bounds.contains([project.longitude, project.latitude]));
      };

      const loadVisiblePreviewMarkers = () => {
        const visibleProjects = getVisibleProjects();
        const candidates = visibleProjects
          .filter((project) => !loadedPreviewSlugs.has(project.slug) && !loadingPreviewSlugs.has(project.slug))
          .slice(0, PREVIEW_BATCH_SIZE);

        for (const project of candidates) {
          void loadPreviewMarker(project);
        }
      };

      const scheduleVisiblePreviewLoad = () => {
        cancelScheduledPreviewLoad();
        if ("requestIdleCallback" in window && "cancelIdleCallback" in window) {
          scheduledIdleHandle = window.requestIdleCallback(() => {
            loadVisiblePreviewMarkers();
            scheduledIdleHandle = null;
          }, { timeout: 250 });
          return;
        }

        scheduledTimeoutHandle = setTimeout(() => {
          loadVisiblePreviewMarkers();
          scheduledTimeoutHandle = null;
        }, 50);
      };

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
              padding: {
                top: isMobileViewport ? 72 : 120,
                right: isMobileViewport ? 40 : 120,
                bottom: isMobileViewport ? 72 : 120,
                left: isMobileViewport ? 40 : 120,
              },
              maxZoom: CLUSTER_FIT_MAX_ZOOM,
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
        const isMobileViewport = window.innerWidth < 768;
        const horizontalOffset = isMobileViewport ? 0 : Math.round(window.innerWidth * 0.16);
        const verticalOffset = isMobileViewport
          ? -Math.round(window.innerHeight * 0.30)
          : Math.round(window.innerHeight * 0.08);
        map.easeTo({
          center: [project.longitude, project.latitude],
          zoom: 5,
          offset: [horizontalOffset, verticalOffset],
          duration: 700,
          essential: true,
        });
      };

      map.on("click", "unclustered-point", handleProjectPointClick);
      map.on("click", "unclustered-photo", handleProjectPointClick);

      const handleMapDragStart = () => {
        setActiveProject(null);
      };

      map.on("dragstart", handleMapDragStart);

      const handleMapBackgroundClick = (event: maplibregl.MapMouseEvent) => {
        const projectFeatures = map.queryRenderedFeatures(event.point, {
          layers: ["unclustered-point", "unclustered-photo"],
        });

        if (projectFeatures.length > 0) {
          return;
        }

        setActiveProject(null);
      };

      map.on("click", handleMapBackgroundClick);

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

      map.on("moveend", scheduleVisiblePreviewLoad);
      map.on("idle", scheduleVisiblePreviewLoad);

      scheduleVisiblePreviewLoad();

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

  const handleZoomIn = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.zoomIn({ duration: 300, essential: true });
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.zoomOut({ duration: 300, essential: true });
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
      <div className="absolute bottom-3 right-3 z-30 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={handleZoomIn}
            className="border border-black/15 bg-white/90 px-3 py-2 text-sm leading-none text-black transition hover:bg-white md:px-4"
          >
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={handleZoomOut}
            className="border border-black/15 bg-white/90 px-3 py-2 text-sm leading-none text-black transition hover:bg-white md:px-4"
          >
            -
          </button>
        </div>
        <button
          type="button"
          onClick={handleResetView}
          className="border border-black/15 bg-white/90 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-white md:px-4 md:text-xs"
        >
          Reset View
        </button>
      </div>
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
      <nav className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 bg-white/88 p-1.5 shadow-sm backdrop-blur-sm md:left-[65%] md:flex">
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

      <div className="fixed right-3 top-3 z-20 md:hidden">
        {isMobileMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white/95 p-2 shadow-sm backdrop-blur-sm">
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
