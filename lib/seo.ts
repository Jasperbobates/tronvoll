import type { Metadata } from "next";

const siteUrl = "https://mette-tronvoll.com";

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mette Tronvoll — Photography",
    template: "%s — Mette Tronvoll",
  },
  description:
    "Fine art and editorial photography portfolio with geographically organized projects.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Mette Tronvoll",
    title: "Mette Tronvoll — Photography",
    description:
      "Fine art and editorial photography portfolio with geographically organized projects.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mette Tronvoll — Photography",
    description:
      "Fine art and editorial photography portfolio with geographically organized projects.",
  },
};

export const siteConfig = {
  name: "Mette Tronvoll",
  url: siteUrl,
  email: "studio@mette-tronvoll.com",
};
