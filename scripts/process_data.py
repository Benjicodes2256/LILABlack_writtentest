"""
LILA BLACK Telemetry Data Processor
Converts raw .nakama-0 parquet files into static JSON for the web frontend.

Output:
  public/data/matches.json   - Match metadata index
  public/data/events/{match_id}.json - Per-match event data
"""

import pandas as pd
import pyarrow.parquet as pq
import os
import json
import re
from pathlib import Path

# ─── Map Configuration ───────────────────────────────────────────────────────
MAP_CONFIG = {
    "AmbroseValley": {"scale": 900, "originX": -370, "originZ": -473},
    "GrandRift":     {"scale": 581, "originX": -290, "originZ": -290},
    "Lockdown":      {"scale": 1000, "originX": -500, "originZ": -500},
}

DATA_ROOT = Path(__file__).parent.parent / "player_data"
OUTPUT_ROOT = Path(__file__).parent.parent / "public" / "data"
DAYS = ["February_10", "February_11", "February_12", "February_13", "February_14"]

UUID_PATTERN = re.compile(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE
)


def is_human(user_id: str) -> bool:
    """UUID user_id = human, numeric = bot."""
    return bool(UUID_PATTERN.match(user_id))


def world_to_pixel(x: float, z: float, map_id: str) -> tuple:
    """Convert world coordinates to minimap pixel coordinates (1024x1024)."""
    cfg = MAP_CONFIG.get(map_id)
    if not cfg:
        return (0, 0)
    u = (x - cfg["originX"]) / cfg["scale"]
    v = (z - cfg["originZ"]) / cfg["scale"]
    pixel_x = u * 1024
    pixel_y = (1 - v) * 1024
    return (round(pixel_x, 1), round(pixel_y, 1))


def load_all_data() -> pd.DataFrame:
    """Load all parquet files across all days into a single DataFrame."""
    frames = []
    total_files = 0
    for day in DAYS:
        day_path = DATA_ROOT / day
        if not day_path.exists():
            print(f"  Skipping {day} (not found)")
            continue
        files = [f for f in os.listdir(day_path) if not f.startswith('.')]
        print(f"  {day}: {len(files)} files")
        for fname in files:
            fpath = day_path / fname
            try:
                t = pq.read_table(str(fpath))
                df = t.to_pandas()
                df['date'] = day  # tag with date folder
                frames.append(df)
                total_files += 1
            except Exception as e:
                print(f"    WARN: Skipping {fname}: {e}")
    print(f"\n  Total files loaded: {total_files}")
    return pd.concat(frames, ignore_index=True)


def process_and_export(df: pd.DataFrame):
    """Process the combined DataFrame and export JSON files."""

    # --- Decode event bytes ---
    df['event'] = df['event'].apply(
        lambda x: x.decode('utf-8') if isinstance(x, bytes) else str(x)
    )

    # --- Detect humans vs bots ---
    df['is_human'] = df['user_id'].apply(is_human)

    # --- Convert timestamps to milliseconds (numeric) ---
    # ts is datetime64[ms], so .astype('int64') gives milliseconds directly
    df['ts_ms'] = df['ts'].astype('int64')

    # --- Normalize match_id (strip .nakama-0 suffix for cleaner keys) ---
    df['match_id_clean'] = df['match_id'].str.replace('.nakama-0', '', regex=False)

    # --- Compute pixel coordinates ---
    pixels = df.apply(lambda r: world_to_pixel(r['x'], r['z'], r['map_id']), axis=1)
    df['px'] = pixels.apply(lambda p: p[0])
    df['py'] = pixels.apply(lambda p: p[1])

    # --- Build match metadata index ---
    matches = []
    grouped = df.groupby('match_id_clean')
    print(f"\n  Total unique matches: {len(grouped)}")

    events_dir = OUTPUT_ROOT / "events"
    events_dir.mkdir(parents=True, exist_ok=True)

    for match_id, mdf in grouped:
        # Compute match-level metadata
        map_id = mdf['map_id'].iloc[0]
        date = mdf['date'].iloc[0]
        human_ids = mdf[mdf['is_human']]['user_id'].nunique()
        bot_ids = mdf[~mdf['is_human']]['user_id'].nunique()
        ts_min = int(mdf['ts_ms'].min())
        ts_max = int(mdf['ts_ms'].max())
        event_counts = mdf['event'].value_counts().to_dict()

        matches.append({
            "id": match_id,
            "map": map_id,
            "date": date,
            "humans": human_ids,
            "bots": bot_ids,
            "ts_start": ts_min,
            "ts_end": ts_max,
            "duration_s": round((ts_max - ts_min) / 1000, 1),
            "events": event_counts,
            "total_events": len(mdf),
        })

        # --- Export per-match event file ---
        # Downsample position events for performance (keep every 3rd position)
        positions = mdf[mdf['event'].isin(['Position', 'BotPosition'])]
        non_positions = mdf[~mdf['event'].isin(['Position', 'BotPosition'])]

        # Sample positions: keep every 3rd row per player (preserving all columns)
        sampled_parts = []
        for uid, group in positions.groupby('user_id'):
            sampled_parts.append(group.iloc[::3])
        sampled_positions = pd.concat(sampled_parts, ignore_index=True) if sampled_parts else positions.iloc[:0]

        match_df = pd.concat([sampled_positions, non_positions], ignore_index=True)
        match_df = match_df.sort_values('ts_ms')

        events_data = []
        for _, row in match_df.iterrows():
            events_data.append({
                "uid": row['user_id'],
                "e": row['event'],
                "px": row['px'],
                "py": row['py'],
                "t": int(row['ts_ms']),
                "h": bool(row['is_human']),
            })

        with open(events_dir / f"{match_id}.json", 'w') as f:
            json.dump(events_data, f, separators=(',', ':'))

    # --- Sort matches by date then map ---
    matches.sort(key=lambda m: (m['date'], m['map'], m['id']))

    # --- Export matches index ---
    with open(OUTPUT_ROOT / "matches.json", 'w') as f:
        json.dump(matches, f, indent=2)

    print(f"  Exported {len(matches)} match files to {events_dir}")
    print(f"  Exported matches.json to {OUTPUT_ROOT / 'matches.json'}")


if __name__ == "__main__":
    print("Loading parquet files...")
    df = load_all_data()
    print(f"\n  Total rows: {len(df)}")
    print(f"  Columns: {list(df.columns)}")
    print(f"  Event distribution:\n{df['event'].apply(lambda x: x.decode('utf-8') if isinstance(x, bytes) else x).value_counts()}")

    print("\nProcessing and exporting...")
    process_and_export(df)

    print("\n✓ Done!")
