"use client";

import { useMemo } from "react";
import { EventData, EVENT_COLORS, EVENT_LABELS } from "@/lib/types";

interface Props {
  events: EventData[];
  currentTime: number;
  onEventClick: (t: number) => void;
  showEvents: Record<string, boolean>;
}

export default function EventLog({
  events,
  currentTime,
  onEventClick,
  showEvents,
}: Props) {
  const combatEvents = useMemo(() => {
    return events
      .filter(
        (ev) =>
          ev.e !== "Position" &&
          ev.e !== "BotPosition" &&
          (showEvents[ev.e] ?? true)
      )
      .sort((a, b) => a.t - b.t);
  }, [events, showEvents]);

  const tsStart = events.length > 0 ? Math.min(...events.map((e) => e.t)) : 0;

  const formatTime = (ms: number) => {
    const totalSec = Math.floor((ms - tsStart) / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <aside className="w-64 border-l border-gray-700/50 bg-[#111827]/60 backdrop-blur-xl overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Event Log ({combatEvents.length})
        </h3>
        <div className="space-y-1">
          {combatEvents.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No events in this match</p>
          ) : (
            combatEvents.map((ev, i) => {
              const isPast = ev.t <= (currentTime || 0);
              const isCurrent =
                ev.t <= (currentTime || 0) &&
                ev.t > (currentTime || 0) - 2000;
              return (
                <button
                  key={i}
                  onClick={() => onEventClick(ev.t)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border ${
                    isCurrent
                      ? "bg-cyan-500/15 border-cyan-500/30"
                      : isPast
                      ? "opacity-60 border-transparent hover:bg-gray-700/30"
                      : "border-transparent hover:bg-gray-700/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-medium"
                      style={{ color: EVENT_COLORS[ev.e] }}
                    >
                      {EVENT_LABELS[ev.e] || ev.e}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTime(ev.t)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {ev.h ? "Human" : "Bot"} • {ev.uid.slice(0, 8)}...
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
