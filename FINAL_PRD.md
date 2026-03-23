# FINAL PRD: LILA Games Telemetry Visualizer

**Strategic Goal**: Solve spatial-temporal visualization friction to improve **Retention** for Level Designers.

---

## 1. Executive Summary
Level Designers struggle to extract actionable insights from raw telemetry due to "Spaghetti Noise" (overlapping paths) and lack of temporal context. This tool provides a high-performance, browser-based Canvas visualizer with dynamic heatmaps and event scrubbing.

---

## 2. The User (Persona: Arjun)
- **Role**: Lead Level Designer.
- **Pain**: *"I design in 3D, but I'm forced to analyze in spreadsheets. I can't see the 'story' of the match."*
- **Success**: Identifying a "Dead Zone" or "Storm Bottleneck" in < 5 minutes.

---

## 3. P0 Problem Statement
> **"Level Designers at LILA Games struggle to identify actionable map insights because raw coordinate data is visually overwhelming and lacks temporal context, leading to suboptimal map balance and lower player retention."**

---

## 4. Proposed Solution (High-Level)

### 4.1 Unified Temporal Heatmap
- **Mechanic**: A density overlay that evolves as the user scrubs the timeline.
- **Benefit**: Eliminates "Spaghetti Noise" by aggregating paths into intensity zones.

### 4.2 Event Replay Log (Combat & Storm)
- **Mechanic**: A clickable sidebar of key events (Kills, Storm Deaths, Boss Fights).
- **Benefit**: "Single-click context"—jumps map and timeline to the exact moment of interest.

### 4.3 Integrated Playback Dashboard
- **Controls**: 1x-5x playback, zoom/pan map, and bot/human toggle.

---

## 5. Success Metrics

| Metric Type | Metric Name | Target |
|-------------|-------------|--------|
| **Activation** | First Heatmap Use | 80% of users toggle Heatmap within 60s of loading a match. |
| **Engagement** | Timeline Scrubbing | Average of 5+ "Scrub actions" per session. |
| **Outcome** | Map Iteration Speed | 30% reduction in time between "Data Review" and "Map Fix". |

---

## 6. Risk Mitigation (Pitfalls)

| Assumption at risk | Failure mode | Impact/Likelihood | Mitigation | Detection Signal |
|--------------------|--------------|-------------------|------------|------------------|
| **Performance** | Tool lags with 100k+ points. | H / M | Implement **Point Sampling** (render 1/5 points if N > 50k). | FPS < 30 |
| **Coordinate Drift**| Markers offset from visual terrain. | H / L | Add **Manual Offset Calibrator** in settings. | User reports of "walking in walls". |
| **User Logic** | Heatmap is confusing. | M / M | Use industry-standard **Red/Blue gradients** and persistent legend. | Toggle usage drop-off. |

---

## 7. Build Scope (Phase 1)
- [x] Parquet Loading (DuckDB-Wasm)
- [x] Canvas Map with Zoom/Pan
- [x] Timeline Scrubbing
- [x] Heatmap Layer
- [x] Bot/Human Distinction
- [x] Event Markers (Kills/Deaths/Loot/Storm)
