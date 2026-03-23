"use client";

import { EventData, EVENT_COLORS } from "@/lib/types";

interface Props {
  tsStart: number;
  tsEnd: number;
  currentTime: number;
  onTimeChange: (t: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed: number;
  onSpeedChange: (s: number) => void;
  events: EventData[];
}

export default function TimelineControl({
  tsStart,
  tsEnd,
  currentTime,
  onTimeChange,
  isPlaying,
  onPlayPause,
  playbackSpeed,
  onSpeedChange,
  events,
}: Props) {
  const duration = tsEnd - tsStart;
  const progress = duration > 0 ? ((currentTime - tsStart) / duration) * 100 : 0;

  const formatTime = (ms: number) => {
    const totalSec = Math.floor((ms - tsStart) / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // Collect event markers for the timeline
  const eventMarkers = events.filter(
    (ev) =>
      ev.e !== "Position" &&
      ev.e !== "BotPosition" &&
      ["Kill", "Killed", "BotKill", "BotKilled", "KilledByStorm"].includes(ev.e)
  );

  return (
    <div className="px-6 py-3 border-t border-gray-700/50 bg-[#111827]/80 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 flex items-center justify-center transition-colors"
        >
          {isPlaying ? (
            <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-cyan-400 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Time display */}
        <span className="text-sm font-mono text-gray-300 w-16">
          {formatTime(currentTime || tsStart)}
        </span>

        {/* Timeline slider with event markers */}
        <div className="flex-1 relative h-8 flex items-center">
          {/* Event markers on timeline */}
          {eventMarkers.map((ev, i) => {
            const pos = ((ev.t - tsStart) / duration) * 100;
            return (
              <div
                key={i}
                className="absolute top-0 w-1 h-2 rounded-full cursor-pointer hover:h-4 transition-all"
                style={{
                  left: `${pos}%`,
                  backgroundColor: EVENT_COLORS[ev.e] || "#fff",
                }}
                title={`${ev.e} at ${formatTime(ev.t)}`}
                onClick={() => onTimeChange(ev.t)}
              />
            );
          })}

          {/* Slider track */}
          <input
            type="range"
            min={tsStart}
            max={tsEnd}
            value={currentTime || tsStart}
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, #06b6d4 ${progress}%, #374151 ${progress}%)`,
            }}
          />
        </div>

        {/* End time */}
        <span className="text-sm font-mono text-gray-400 w-16">
          {formatTime(tsEnd)}
        </span>

        <div className="flex items-center gap-1">
          {[0.5, 1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                playbackSpeed === s
                  ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500/40"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
