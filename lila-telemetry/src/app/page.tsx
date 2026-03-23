"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { MatchMeta, EventData, MAP_IMAGES, MAPS, DATES } from "@/lib/types";
import MapCanvas from "@/components/MapCanvas";
import TimelineControl from "@/components/TimelineControl";
import FilterSidebar from "@/components/FilterSidebar";
import EventLog from "@/components/EventLog";

export default function Home() {
  const [matches, setMatches] = useState<MatchMeta[]>([]);
  const [selectedMap, setSelectedMap] = useState<string>("AmbroseValley");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [events, setEvents] = useState<EventData[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showHumans, setShowHumans] = useState(true);
  const [showBots, setShowBots] = useState(true);
  const [showEvents, setShowEvents] = useState<Record<string, boolean>>({
    Kill: true,
    Killed: true,
    BotKill: true,
    BotKilled: true,
    KilledByStorm: true,
    Loot: true,
  });
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapType, setHeatmapType] = useState<string>("kills");
  const [loading, setLoading] = useState(true);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const animRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);


  // Load matches index
  useEffect(() => {
    fetch("/data/matches.json")
      .then((r) => r.json())
      .then((data: MatchMeta[]) => {
        setMatches(data);
        setLoading(false);
      });
  }, []);

  // Filtered matches
  const filteredMatches = matches.filter((m) => {
    if (m.map !== selectedMap) return false;
    if (selectedDate !== "all" && m.date !== selectedDate) return false;
    return true;
  });

  // Aggregate stats for the filtered matches
  const aggStats = useMemo(() => {
    const fm = filteredMatches.length > 0 ? filteredMatches : matches;
    const totalHumans = fm.reduce((s, m) => s + m.humans, 0);
    const totalBots = fm.reduce((s, m) => s + m.bots, 0);
    const totalEvents = fm.reduce((s, m) => s + m.total_events, 0);
    const totalLoot = fm.reduce((s, m) => s + (m.events.Loot || 0), 0);
    const totalKills = fm.reduce((s, m) => s + (m.events.Kill || 0) + (m.events.BotKill || 0), 0);
    const totalDeaths = fm.reduce((s, m) => s + (m.events.Killed || 0) + (m.events.BotKilled || 0) + (m.events.KilledByStorm || 0), 0);
    const totalPositions = fm.reduce((s, m) => s + (m.events.Position || 0) + (m.events.BotPosition || 0), 0);
    return { count: fm.length, totalHumans, totalBots, totalEvents, totalLoot, totalKills, totalDeaths, totalPositions };
  }, [filteredMatches, matches]);

  // Load match events
  useEffect(() => {
    if (!selectedMatch) return;
    const meta = matches.find((m) => m.id === selectedMatch);
    setLoadingMatch(true);
    fetch(`/data/events/${selectedMatch}.json`)
      .then((r) => r.json())
      .then((data: EventData[]) => {
        setEvents(data);
        setLoadingMatch(false);
        // Initialize to ts_end so all events are visible by default
        setCurrentTime(meta?.ts_end ?? 0);
        setIsPlaying(false);
      })
      .catch(() => setLoadingMatch(false));
  }, [selectedMatch, matches]);

  // Auto-select first match when filter changes
  useEffect(() => {
    if (filteredMatches.length > 0 && !filteredMatches.find((m) => m.id === selectedMatch)) {
      setSelectedMatch(filteredMatches[0].id);
    }
  }, [selectedMap, selectedDate, filteredMatches, selectedMatch]);

  // Get current match metadata
  const currentMatch = matches.find((m) => m.id === selectedMatch);

  // Playback animation loop
  useEffect(() => {
    if (!isPlaying || !currentMatch) return;

    const tick = (timestamp: number) => {
      if (!lastTickRef.current) lastTickRef.current = timestamp;
      const delta = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + delta * playbackSpeed;
        if (next >= currentMatch.ts_end) {
          setIsPlaying(false);
          return currentMatch.ts_end;
        }
        return next;
      });

      animRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = 0;
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, playbackSpeed, currentMatch]);

  const handleTimeChange = useCallback((t: number) => {
    setCurrentTime(t);
  }, []);

  const handleEventClick = useCallback((t: number) => {
    setCurrentTime(t);
    setIsPlaying(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading telemetry data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-700/50 bg-[#111827]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold">
            L
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight">
              LILA BLACK Telemetry
            </h1>
            <p className="text-xs text-gray-400">
              Level Design Analytics Tool
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{matches.length} matches</span>
          <span className="text-cyan-400">{selectedMap.replace(/([A-Z])/g, " $1").trim()}</span>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-700/30 bg-[#0f1520]/90 overflow-x-auto flex-shrink-0">
        <div className="flex flex-col pr-4 mr-4 border-r border-gray-700/50 min-w-fit">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Lila Black</span>
          <span className="text-sm font-bold text-white whitespace-nowrap">Weekly Dashboard</span>
        </div>
        {[
          { label: "Matches", value: aggStats.count, icon: "📊" },
          { label: "Humans", value: aggStats.totalHumans, icon: "👤", color: "text-cyan-400" },
          { label: "Bots", value: aggStats.totalBots, icon: "🤖", color: "text-orange-400" },
          { label: "Positions", value: aggStats.totalPositions.toLocaleString(), icon: "📍", color: "text-blue-400" },
          { label: "Loot", value: aggStats.totalLoot.toLocaleString(), icon: "💎", color: "text-green-400" },
          { label: "Kills", value: aggStats.totalKills.toLocaleString(), icon: "⚔️", color: "text-red-400" },
          { label: "Deaths", value: aggStats.totalDeaths.toLocaleString(), icon: "💀", color: "text-purple-400" },
          { label: "Events", value: aggStats.totalEvents.toLocaleString(), icon: "⚡" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/40 border border-gray-700/30 min-w-fit"
          >
            <span className="text-sm">{stat.icon}</span>
            <div className="flex flex-col">
              <span className={`text-sm font-semibold ${stat.color || "text-gray-200"}`}>
                {stat.value}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider leading-none">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Filters */}
        <FilterSidebar
          selectedMap={selectedMap}
          onMapChange={setSelectedMap}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedMatch={selectedMatch}
          onMatchChange={setSelectedMatch}
          filteredMatches={filteredMatches}
          showHumans={showHumans}
          onShowHumansChange={setShowHumans}
          showBots={showBots}
          onShowBotsChange={setShowBots}
          showEvents={showEvents}
          onShowEventsChange={setShowEvents}
          showHeatmap={showHeatmap}
          onShowHeatmapChange={setShowHeatmap}
          heatmapType={heatmapType}
          onHeatmapTypeChange={setHeatmapType}
          currentMatch={currentMatch}
        />

        {/* Center - Map */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative overflow-hidden">
            {loadingMatch && (
              <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <MapCanvas
              mapImage={MAP_IMAGES[selectedMap]}
              events={events}
              currentTime={currentTime}
              tsStart={currentMatch?.ts_start ?? 0}
              tsEnd={currentMatch?.ts_end ?? 0}
              showHumans={showHumans}
              showBots={showBots}
              showEvents={showEvents}
              showHeatmap={showHeatmap}
              heatmapType={heatmapType}
            />
          </div>

          {/* Timeline */}
          {currentMatch && (
            <TimelineControl
              tsStart={currentMatch.ts_start}
              tsEnd={currentMatch.ts_end}
              currentTime={currentTime}
              onTimeChange={handleTimeChange}
              isPlaying={isPlaying}
              onPlayPause={() => {
                if (currentTime >= currentMatch.ts_end) {
                  setCurrentTime(currentMatch.ts_start);
                }
                setIsPlaying(!isPlaying);
              }}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
              events={events}
            />
          )}
        </div>

        {/* Right Sidebar - Event Log */}
        <EventLog
          events={events}
          currentTime={currentTime}
          onEventClick={handleEventClick}
          showEvents={showEvents}
        />
      </div>
    </div>
  );
}
