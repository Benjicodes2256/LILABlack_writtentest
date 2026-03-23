"use client";

import { MatchMeta, MAPS, DATES, EVENT_LABELS } from "@/lib/types";

interface Props {
  selectedMap: string;
  onMapChange: (map: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedMatch: string;
  onMatchChange: (match: string) => void;
  filteredMatches: MatchMeta[];
  showHumans: boolean;
  onShowHumansChange: (v: boolean) => void;
  showBots: boolean;
  onShowBotsChange: (v: boolean) => void;
  showEvents: Record<string, boolean>;
  onShowEventsChange: (v: Record<string, boolean>) => void;
  showHeatmap: boolean;
  onShowHeatmapChange: (v: boolean) => void;
  heatmapType: string;
  onHeatmapTypeChange: (v: string) => void;
  currentMatch: MatchMeta | undefined;
}

export default function FilterSidebar({
  selectedMap,
  onMapChange,
  selectedDate,
  onDateChange,
  selectedMatch,
  onMatchChange,
  filteredMatches,
  showHumans,
  onShowHumansChange,
  showBots,
  onShowBotsChange,
  showEvents,
  onShowEventsChange,
  showHeatmap,
  onShowHeatmapChange,
  heatmapType,
  onHeatmapTypeChange,
  currentMatch,
}: Props) {
  return (
    <aside className="w-72 border-r border-gray-700/50 bg-[#111827]/60 backdrop-blur-xl overflow-y-auto flex-shrink-0">
      <div className="p-4 space-y-5">
        {/* Map Selector */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Map
          </h3>
          <div className="grid grid-cols-1 gap-1">
            {MAPS.map((map) => (
              <button
                key={map}
                onClick={() => onMapChange(map)}
                className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${
                  selectedMap === map
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-gray-300 hover:bg-gray-700/50 border border-transparent"
                }`}
              >
                {map.replace(/([A-Z])/g, " $1").trim()}
              </button>
            ))}
          </div>
        </section>

        {/* Date Selector */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Date
          </h3>
          <select
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Dates</option>
            {DATES.map((d) => (
              <option key={d} value={d}>
                {d.replace("_", " ")}
              </option>
            ))}
          </select>
        </section>

        {/* Match Selector */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Match ({filteredMatches.length})
          </h3>
          <select
            value={selectedMatch}
            onChange={(e) => onMatchChange(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
          >
            {filteredMatches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id.slice(0, 8)}... ({m.humans}H/{m.bots}B)
              </option>
            ))}
          </select>
        </section>

        {/* Match Stats */}
        {currentMatch && (
          <section className="bg-gray-800/30 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Match Stats
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-sm">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Humans</span>
                <p className="text-cyan-400 font-semibold leading-tight">{currentMatch.humans}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Bots</span>
                <p className="text-orange-400 font-semibold leading-tight">{currentMatch.bots}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">P. Kills</span>
                <p className="text-red-400 font-semibold leading-tight">{currentMatch.events.Kill || 0}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">B. Kills</span>
                <p className="text-orange-400 font-semibold leading-tight">{currentMatch.events.BotKill || 0}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Loot</span>
                <p className="text-green-400 font-semibold leading-tight">{currentMatch.events.Loot || 0}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Dur.</span>
                <p className="text-gray-200 font-semibold leading-tight">{currentMatch.duration_s}s</p>
              </div>
            </div>
          </section>
        )}

        {/* Player Type Toggle */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Players
          </h3>
          <div className="space-y-1">
            <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/30 cursor-pointer">
              <input
                type="checkbox"
                checked={showHumans}
                onChange={(e) => onShowHumansChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-800"
              />
              <span className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Humans
              </span>
            </label>
            <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/30 cursor-pointer">
              <input
                type="checkbox"
                checked={showBots}
                onChange={(e) => onShowBotsChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500 bg-gray-800"
              />
              <span className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                Bots
              </span>
            </label>
          </div>
        </section>

        {/* Event Type Toggles */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Events
          </h3>
          <div className="space-y-1">
            {Object.entries(EVENT_LABELS).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-700/30 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={showEvents[key] ?? true}
                  onChange={(e) =>
                    onShowEventsChange({
                      ...showEvents,
                      [key]: e.target.checked,
                    })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-800"
                />
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Heatmap */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Heatmap Overlay
          </h3>
          <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/30 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => onShowHeatmapChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800"
            />
            <span className="text-sm text-gray-300">Show Heatmap</span>
          </label>
          {showHeatmap && (
            <select
              value={heatmapType}
              onChange={(e) => onHeatmapTypeChange(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="kills">Kill Zones</option>
              <option value="deaths">Death Zones</option>
              <option value="traffic">High Traffic</option>
            </select>
          )}
        </section>
      </div>
    </aside>
  );
}
