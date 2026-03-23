# Architecture: LILA BLACK Telemetry Visualizer

## Tech Stack & Why

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Next.js 16 + Tailwind CSS | Fast DX, static export, component-based architecture |
| **Rendering** | HTML5 Canvas | Performs well with 10k+ coordinate points per match — SVG would choke |
| **Data Processing** | Python (pandas + pyarrow) | One-time offline conversion of parquet to JSON — simple, no runtime dependency |
| **Hosting** | Netlify (static site) | Zero server cost, instant deploys from Git, shareable URL |

## Data Flow

```
Raw .nakama-0 parquet files (1,243 files, ~8MB)
        │
        ▼  scripts/process_data.py
        │  • Reads all parquet across Feb 10-14
        │  • Decodes event bytes → string
        │  • Detects bot vs human (UUID = human, numeric = bot)
        │  • Converts world (x,z) → minimap pixels using per-map formula
        │  • Downsamples position events (1-in-3) for performance
        │
        ▼  Static JSON output
        │  • public/data/matches.json (796 match metadata entries)
        │  • public/data/events/{match_id}.json (per-match event arrays)
        │
        ▼  Next.js static export (npm run build → out/)
        │  • Browser fetches matches.json at load
        │  • Fetches per-match event JSON on selection
        │  • Canvas renders minimap + paths + markers + heatmap
        │
        ▼  User sees interactive map in browser
```

## Coordinate Mapping (The Tricky Part)

Each map has a `scale` and `origin` that defines its coordinate system. The minimap images are all 1024×1024 pixels.

**Formula:**
```
u = (world_x - origin_x) / scale        → normalized 0-1
v = (world_z - origin_z) / scale        → normalized 0-1
pixel_x = u * 1024
pixel_y = (1 - v) * 1024                → Y is flipped (image origin = top-left)
```

**Map configs used:**

| Map | Scale | Origin X | Origin Z |
|-----|-------|----------|----------|
| AmbroseValley | 900 | -370 | -473 |
| GrandRift | 581 | -290 | -290 |
| Lockdown | 1000 | -500 | -500 |

**Validation:** World position `(-301.45, -355.55)` on AmbroseValley maps to pixel `(78, 890)` — matches the README example exactly.

Note: The `y` column in the data is elevation/height, not a 2D coordinate. Only `x` and `z` are used for mapping.

## Assumptions & Ambiguity Handling

| Ambiguity | How I Handled It |
|-----------|------------------|
| **Timestamps** | `ts` is `datetime64[ms]` — `.astype('int64')` gives milliseconds directly. These are in-match elapsed time from an epoch base, not wall-clock time. |
| **Bot detection** | Used `user_id` format: UUID pattern = human, numeric string = bot. Confirmed against README examples. |
| **Event bytes** | `event` column stored as binary — decoded with `.decode('utf-8')`. |
| **Match grouping** | Stripped `.nakama-0` suffix from `match_id` to group all players in a match. |
| **Short durations** | Many matches show sub-second durations. This is because each file is one player's journey — a match with 50 players has 50 files, each with a narrow timestamp window. The full match timeline emerges when all files are combined. |

## Major Trade-offs

| Decision | Alternative Considered | Why I Chose This |
|----------|----------------------|------------------|
| **Pre-processed JSON** vs DuckDB-Wasm | DuckDB-Wasm (in-browser SQL) | JSON is simpler, no WASM overhead, data is small enough (~8MB). DuckDB better for 100MB+ datasets. |
| **Canvas** vs SVG | SVG with D3.js | Canvas handles thousands of points without DOM overhead. SVG would create thousands of DOM elements. |
| **Static export** vs SSR | Server-side rendering | No API/database needed — all data is pre-baked. Static = cheaper, faster, Netlify-native. |
| **1-in-3 sampling** vs full data | Render all position events | Full data = larger JSON files + slower Canvas rendering. 1/3 sampling preserves path shape while cutting data 66%. |
| **Client-side only** vs backend | Python/Node API server | Zero ops burden. All computation happens at build time + browser. |
