# Walkthrough: LILA BLACK Telemetry Visualizer

## What Was Built

A web-based telemetry visualization tool that turns raw `.nakama-0` parquet files into an interactive map explorer for Level Designers. The tool runs entirely in the browser as a static site and features a real-time **Weekly Dashboard** for aggregate data analysis.

## New Features Added

- **Weekly Dashboard**: A top-bar dashboard showing aggregate weekly metrics for the selected map.
- **Granular Match Stats**: Detailed per-match stats (Human Kills, Bot Kills, Loot Pickups) in the sidebar.
- **Dedicated Zoom & Playback Controls**: Isolated [+] and [-] zoom buttons and variable playback speeds (0.5x to 10x) for in-depth gameplay review.

### Data Pipeline (`scripts/process_data.py`)
- Parses 1,243 parquet files across 5 days → 796 match JSON files
- Converts world coordinates to minimap pixel coordinates using per-map config
- Detects humans vs bots via UUID pattern matching
- Downsamples position events (1-in-3) for performance

### Frontend (`lila-telemetry/`)

| Component | Purpose |
|-----------|---------|
| [page.tsx](file:///d:/LILA%20games/lila-telemetry/src/app/page.tsx) | Main state orchestrator — match loading, playback, filters, and aggregate stats computation |
| [MapCanvas.tsx](file:///d:/LILA%20games/lila-telemetry/src/components/MapCanvas.tsx) | HTML5 Canvas rendering — minimap, paths, event markers, heatmap, zoom/pan, and dedicated zoom UI |
| [TimelineControl.tsx](file:///d:/LILA%20games/lila-telemetry/src/components/TimelineControl.tsx) | Playback slider with speed control and event markers |
| [FilterSidebar.tsx](file:///d:/LILA%20games/lila-telemetry/src/components/FilterSidebar.tsx) | Map/date/match selector, player toggles, event filters, heatmap |
| [EventLog.tsx](file:///d:/LILA%20games/lila-telemetry/src/components/EventLog.tsx) | Clickable combat event list with timestamps |

### Documentation
- [README.md](file:///d:/LILA%20games/lila-telemetry/README.md) — local setup guide
- [ARCHITECTURE.md](file:///d:/LILA%20games/lila-telemetry/ARCHITECTURE.md) — tech decisions, data flow, coordinate mapping
- [INSIGHTS.md](file:///d:/LILA%20games/lila-telemetry/INSIGHTS.md) — 3 data-driven game insights

## Bugs Fixed During Development

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| All durations 0s | `datetime64[ms]` int64 divided by 1M unnecessarily | Removed division — int64 is already ms |
| uid: NaN in events | `groupby().apply(include_groups=False)` drops grouping col | Replaced with explicit loop |
| No events/paths rendered | `currentTime` initialized to 0, but timestamps are epoch ms | Initialize to `ts_end` so all events visible |

## Project Structure

The project was consolidated into a single root repository for ease of review and deployment:

```text
/
├── lila-telemetry/        # Next.js Web Application
├── scripts/               # Data Processing Pipeline (Python)
├── player_data/           # Raw .nakama-0 Parquet Files (32MB)
├── ARCHITECTURE.md        # Technical Design Document
├── INSIGHTS.md            # Game Behavior Analysis
├── README.md              # Setup and Usage Guide
├── netlify.toml           # Root-level Netlify configuration for subdir builds
└── task.md                # Development Checklist
```

## What Was Tested

### Visual Verification
- ✅ All 3 maps load correctly (Ambrose Valley, Grand Rift, Lockdown)
- ✅ Player paths render as cyan (human) and orange (bot) lines
- ✅ Event markers render with distinct icons (✕ kills, ● deaths, ■ loot, ▲ storm)
- ✅ Timeline playback with 1x-10x speed
- ✅ Heatmap overlay (kill zones, death zones, traffic)
- ✅ Event log populates with clickable entries
- ✅ Map switching, date filtering, match selection

### Build Verification
- ✅ `npm run build` succeeds with zero errors
- ✅ Static export generates `out/` directory
- ✅ TypeScript strict mode passes

## Screenshots

````carousel
![Weekly Dashboard and Refined Stats](C:/Users/Aashish Benjamin/.gemini/antigravity/brain/01f0261c-2d45-4f92-aa3e-90f421118572/telemetry_verification_1774294075971.png)
<!-- slide -->
![Global Stats View](C:/Users/Aashish Benjamin/.gemini/antigravity/brain/01f0261c-2d45-4f92-aa3e-90f421118572/final_telemetry_view_1774293620611.png)
<!-- slide -->
![Map Zoomed in with Dedicated Controls](C:/Users/Aashish Benjamin/.gemini/antigravity/brain/01f0261c-2d45-4f92-aa3e-90f421118572/canvas_area_1774293534986.png)
<!-- slide -->
![Heatmap and Event Playback](C:/Users/Aashish Benjamin/.gemini/antigravity/brain/01f0261c-2d45-4f92-aa3e-90f421118572/heatmap_and_playback_1774290805880.png)
````

## Deployment

The project is hosted on GitHub and configured for Netlify:
1. **GitHub**: [LILABlack_writtentest](https://github.com/Benjicodes2256/LILABlack_writtentest)
2. **Netlify**: Connect the repo. Netlify will automatically use the root `netlify.toml` which is configured to:
   - **Base directory**: `lila-telemetry`
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
