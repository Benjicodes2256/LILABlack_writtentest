// Shared types for the telemetry visualizer

export interface MatchMeta {
  id: string;
  map: string;
  date: string;
  humans: number;
  bots: number;
  ts_start: number;
  ts_end: number;
  duration_s: number;
  events: Record<string, number>;
  total_events: number;
}

export interface EventData {
  uid: string;
  e: string;       // event type
  px: number;       // pixel x
  py: number;       // pixel y
  t: number;        // timestamp ms
  h: boolean;       // is human
}

export const MAP_IMAGES: Record<string, string> = {
  AmbroseValley: "/minimaps/AmbroseValley_Minimap.png",
  GrandRift: "/minimaps/GrandRift_Minimap.png",
  Lockdown: "/minimaps/Lockdown_Minimap.jpg",
};

export const EVENT_COLORS: Record<string, string> = {
  Kill: "#ef4444",
  Killed: "#a855f7",
  BotKill: "#fb923c",
  BotKilled: "#c084fc",
  KilledByStorm: "#eab308",
  Loot: "#22c55e",
  Position: "#06b6d4",
  BotPosition: "#f97316",
};

export const EVENT_LABELS: Record<string, string> = {
  Kill: "Player Kill",
  Killed: "Player Death",
  BotKill: "Bot Kill",
  BotKilled: "Killed by Bot",
  KilledByStorm: "Storm Death",
  Loot: "Loot Pickup",
};

export const DATES = [
  "February_10",
  "February_11",
  "February_12",
  "February_13",
  "February_14",
];

export const MAPS = ["AmbroseValley", "GrandRift", "Lockdown"];
