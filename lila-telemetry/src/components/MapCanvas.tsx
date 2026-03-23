"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { EventData, EVENT_COLORS } from "@/lib/types";

interface Props {
  mapImage: string;
  events: EventData[];
  currentTime: number;
  tsStart: number;
  tsEnd: number;
  showHumans: boolean;
  showBots: boolean;
  showEvents: Record<string, boolean>;
  showHeatmap: boolean;
  heatmapType: string;
}

export default function MapCanvas({
  mapImage,
  events,
  currentTime,
  tsStart,
  showHumans,
  showBots,
  showEvents,
  showHeatmap,
  heatmapType,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Load minimap image
  useEffect(() => {
    setMapLoaded(false);
    setMapError(false);
    const img = new Image();
    img.src = mapImage;
    img.onload = () => {
      imgRef.current = img;
      // Center the map
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        const mapSize = Math.min(cw, ch) * 0.9;
        scaleRef.current = mapSize / 1024;
        offsetRef.current = {
          x: (cw - mapSize) / 2,
          y: (ch - mapSize) / 2,
        };
      }
      setMapLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load map image:", mapImage);
      setMapError(true);
    };
  }, [mapImage]);

  // Visible events up to current time
  const visibleEvents = useMemo(() => {
    const effectiveStart = tsStart || (events.length > 0 ? events[0].t : 0);
    const effectiveTime = currentTime || effectiveStart;
    return events.filter((ev) => {
      if (ev.t > effectiveTime) return false;
      if (ev.h && !showHumans) return false;
      if (!ev.h && !showBots) return false;
      return true;
    });
  }, [events, currentTime, showHumans, showBots, tsStart]);

  // Heatmap grid
  const heatmapGrid = useMemo(() => {
    if (!showHeatmap) return null;
    const gridSize = 32;
    const cells = gridSize * gridSize;
    const grid = new Float32Array(cells);

    const heatEvents = events.filter((ev) => {
      if (heatmapType === "kills")
        return ["Kill", "BotKill"].includes(ev.e);
      if (heatmapType === "deaths")
        return ["Killed", "BotKilled", "KilledByStorm"].includes(ev.e);
      return ["Position", "BotPosition"].includes(ev.e);
    });

    let max = 0;
    for (const ev of heatEvents) {
      const gx = Math.floor((ev.px / 1024) * gridSize);
      const gy = Math.floor((ev.py / 1024) * gridSize);
      if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
        grid[gy * gridSize + gx]++;
        max = Math.max(max, grid[gy * gridSize + gx]);
      }
    }

    return { grid, gridSize, max };
  }, [events, showHeatmap, heatmapType]);

  // Draw function
  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const container = containerRef.current;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = scaleRef.current;
    const offset = offsetRef.current;

    // Draw minimap
    if (imgRef.current) {
      ctx.drawImage(
        imgRef.current,
        offset.x,
        offset.y,
        1024 * scale,
        1024 * scale
      );
    }

    // Draw heatmap
    if (showHeatmap && heatmapGrid) {
      const { grid, gridSize, max } = heatmapGrid;
      if (max > 0) {
        const cellW = (1024 * scale) / gridSize;
        const cellH = (1024 * scale) / gridSize;
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const val = grid[y * gridSize + x];
            if (val <= 0) continue;
            const intensity = val / max;
            // Red-yellow gradient
            const r = Math.floor(255 * Math.min(1, intensity * 2));
            const g = Math.floor(255 * Math.max(0, intensity * 2 - 1));
            ctx.fillStyle = `rgba(${r}, ${g}, 0, ${0.15 + intensity * 0.5})`;
            ctx.fillRect(
              offset.x + x * cellW,
              offset.y + y * cellH,
              cellW + 1,
              cellH + 1
            );
          }
        }
      }
    }

    // Group events by player for path drawing
    const playerPaths: Map<string, EventData[]> = new Map();
    for (const ev of visibleEvents) {
      if (ev.e !== "Position" && ev.e !== "BotPosition") continue;
      if (!playerPaths.has(ev.uid)) playerPaths.set(ev.uid, []);
      playerPaths.get(ev.uid)!.push(ev);
    }

    // Draw paths
    for (const [, path] of playerPaths) {
      if (path.length < 2) continue;
      const isHuman = path[0].h;
      ctx.strokeStyle = isHuman
        ? "rgba(6, 182, 212, 0.4)"
        : "rgba(249, 115, 22, 0.25)";
      ctx.lineWidth = isHuman ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(
        offset.x + path[0].px * scale,
        offset.y + path[0].py * scale
      );
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(
          offset.x + path[i].px * scale,
          offset.y + path[i].py * scale
        );
      }
      ctx.stroke();
    }

    // Draw current positions (latest position per player)
    const latestPositions: Map<string, EventData> = new Map();
    for (const ev of visibleEvents) {
      if (ev.e === "Position" || ev.e === "BotPosition") {
        latestPositions.set(ev.uid, ev);
      }
    }

    for (const [, ev] of latestPositions) {
      const px = offset.x + ev.px * scale;
      const py = offset.y + ev.py * scale;
      ctx.beginPath();
      ctx.arc(px, py, ev.h ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = ev.h ? "#06b6d4" : "#f97316";
      ctx.fill();
      if (ev.h) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw event markers
    for (const ev of visibleEvents) {
      if (ev.e === "Position" || ev.e === "BotPosition") continue;
      if (!showEvents[ev.e]) continue;

      const px = offset.x + ev.px * scale;
      const py = offset.y + ev.py * scale;
      const color = EVENT_COLORS[ev.e] || "#fff";

      // Draw marker
      ctx.beginPath();
      if (ev.e === "Kill" || ev.e === "BotKill") {
        // Cross/sword marker
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(px - 5, py - 5);
        ctx.lineTo(px + 5, py + 5);
        ctx.moveTo(px + 5, py - 5);
        ctx.lineTo(px - 5, py + 5);
        ctx.stroke();
      } else if (ev.e === "Killed" || ev.e === "BotKilled") {
        // Skull marker (circle with X)
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (ev.e === "KilledByStorm") {
        // Lightning shape - triangle
        ctx.moveTo(px, py - 7);
        ctx.lineTo(px + 5, py + 3);
        ctx.lineTo(px - 5, py + 3);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      } else if (ev.e === "Loot") {
        // Square marker
        ctx.rect(px - 3, py - 3, 6, 6);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  };

  // Redraw on state change
  useEffect(() => {
    if (mapLoaded && !mapError) draw();
  });

  // Mouse handlers for pan/zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // Stop whole page zoom
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const oldScale = scaleRef.current;
      scaleRef.current = Math.max(0.2, Math.min(5, oldScale * delta));
      const ratio = scaleRef.current / oldScale;

      offsetRef.current = {
        x: mx - ratio * (mx - offsetRef.current.x),
        y: my - ratio * (my - offsetRef.current.y),
      };
      draw();
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }); // Run on every render to ensure it captures fresh `draw` closure

  const zoomIn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const oldScale = scaleRef.current;
    scaleRef.current = Math.min(5, oldScale * 1.5);
    const ratio = scaleRef.current / oldScale;
    const mx = canvas.clientWidth / 2;
    const my = canvas.clientHeight / 2;
    offsetRef.current = {
      x: mx - ratio * (mx - offsetRef.current.x),
      y: my - ratio * (my - offsetRef.current.y),
    };
    draw();
  };

  const zoomOut = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const oldScale = scaleRef.current;
    scaleRef.current = Math.max(0.2, oldScale / 1.5);
    const ratio = scaleRef.current / oldScale;
    const mx = canvas.clientWidth / 2;
    const my = canvas.clientHeight / 2;
    offsetRef.current = {
      x: mx - ratio * (mx - offsetRef.current.x),
      y: my - ratio * (my - offsetRef.current.y),
    };
    draw();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    offsetRef.current = {
      x: offsetRef.current.x + (e.clientX - dragStart.current.x),
      y: offsetRef.current.y + (e.clientY - dragStart.current.y),
    };
    dragStart.current = { x: e.clientX, y: e.clientY };
    draw();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0a0e17] relative">
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0e17]/80 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-300 font-medium">Downloading HQ Map Image...</p>
        </div>
      )}
      {mapError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0e17]/80 backdrop-blur-sm">
          <div className="text-red-500 mb-2">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 font-medium">Failed to load map image</p>
          <p className="text-xs text-gray-400 mt-1">{mapImage}</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {/* Zoom Controls Overlay */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-2 bg-[#111827]/90 backdrop-blur-md p-2 rounded-lg border border-gray-700/50 shadow-lg">
        <button
          onClick={zoomIn}
          className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded text-2xl font-bold text-gray-200 transition-colors pointer-events-auto"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded text-3xl font-bold text-gray-200 transition-colors pointer-events-auto leading-none pb-1"
          title="Zoom Out"
        >
          &minus;
        </button>
      </div>
    </div>
  );
}
