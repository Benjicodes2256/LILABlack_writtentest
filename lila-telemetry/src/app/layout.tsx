import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LILA BLACK Telemetry Visualizer",
  description:
    "Interactive player behavior visualization tool for Level Designers. Explore player journeys, kills, deaths, and heatmaps across LILA BLACK maps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
