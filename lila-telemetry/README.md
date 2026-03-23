# LILA BLACK Telemetry Visualizer

Interactive web tool for Level Designers to explore player behavior on LILA BLACK maps.

![Screenshot](https://img.shields.io/badge/Status-Live-brightgreen)

## Features

- **Interactive Minimap** — Canvas-based rendering of all 3 maps (Ambrose Valley, Grand Rift, Lockdown)
- **Player Paths** — Movement trails for humans (cyan) and bots (orange)  
- **Event Markers** — Distinct icons for Kills, Deaths, Loot, and Storm Deaths
- **Timeline Playback** — Scrub through match time with 1x–10x speed control
- **Heatmap Overlays** — Kill zones, death zones, and traffic density
- **Filters** — By map, date, match, player type, and event type
- **Event Log** — Clickable sidebar to jump to specific combat moments

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + Tailwind CSS |
| Rendering | HTML5 Canvas |
| Data | Python (pandas/pyarrow) → Static JSON |
| Hosting | Netlify |

## Run Locally

### Prerequisites
- Node.js 18+
- Python 3.10+ (only for data processing)

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd lila-telemetry

# Install frontend dependencies
npm install

# (Optional) Reprocess data from raw parquet files
pip install pandas pyarrow
python ../scripts/process_data.py
# Then copy: cp -r ../public/data public/data

# Start dev server
npm run dev
# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
# Static output in out/ directory
```

### Environment Variables

No environment variables required. All data is pre-baked as static JSON.

## Project Structure

```
lila-telemetry/
├── public/
│   ├── data/
│   │   ├── matches.json          # Match metadata index (796 entries)
│   │   └── events/{match_id}.json # Per-match event data
│   └── minimaps/                  # 3 minimap images (1024x1024)
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main page (state orchestrator)
│   │   ├── layout.tsx            # Root layout + SEO
│   │   └── globals.css           # Design tokens
│   ├── components/
│   │   ├── MapCanvas.tsx         # Canvas rendering + zoom/pan
│   │   ├── TimelineControl.tsx   # Playback slider + speed
│   │   ├── FilterSidebar.tsx     # Map/date/match/event filters
│   │   └── EventLog.tsx          # Clickable combat event list
│   └── lib/
│       └── types.ts              # Shared types + constants
├── ARCHITECTURE.md               # Tech decisions & data flow
├── INSIGHTS.md                   # 3 game insights from the data
├── netlify.toml                  # Netlify build config
└── next.config.ts                # Static export config
```

## Data Processing

The raw `.nakama-0` parquet files are pre-processed into static JSON by `scripts/process_data.py`. This script:

1. Reads 1,243 parquet files across 5 days
2. Decodes event bytes, detects bot vs human
3. Converts world coordinates to minimap pixels
4. Outputs match metadata + per-match event JSON

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details on the coordinate mapping approach.
