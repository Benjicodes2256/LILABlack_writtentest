# Insights: What We Learned About LILA BLACK

Three data-driven observations from analyzing 796 matches across 5 days of gameplay.

---

## Insight 1: Ambrose Valley Dominates — 71% of All Matches

**What caught my eye:** An overwhelming majority of matches are played on Ambrose Valley.

**The data:**

| Map | Matches | % of Total |
|-----|---------|------------|
| AmbroseValley | 566 | 71.1% |
| GrandRift | 59 | 7.4% |
| Lockdown | 171 | 21.5% |

**Actionable:** This concentration suggests either player preference or matchmaking weighting. If Ambrose Valley is simply the default queue, Grand Rift may be underutilized due to discoverability, not quality. **Metrics affected:** Map rotation engagement rate, queue time per map. **Action items:** Consider map rotation incentives, analyze if GrandRift has higher churn signals, run an A/B test featuring GrandRift in the primary slot.

**Why a Level Designer should care:** If 71% of your player hours are on one map, that's where 71% of your balance, loot placement, and flow issues will surface. The other maps may have undetected problems because of low sample size.

---

## Insight 2: Bot Encounters Vastly Outnumber PvP — Only 6 Human-vs-Human Kills in 5 Days

**What caught my eye:** Across 89,000 events, there are only 3 `Kill` and 3 `Killed` events (human-vs-human combat). But there are 2,415 `BotKill` and 700 `BotKilled` events.

**The data:**

| Event Type | Count | Interpretation |
|------------|-------|----------------|
| BotKill (Human kills Bot) | 2,415 | Players frequently engage bots |
| BotKilled (Bot kills Human) | 700 | Bots are a real threat |
| Kill (Human kills Human) | 3 | Almost no PvP |
| Killed (Human killed by Human) | 3 | Almost no PvP |
| KilledByStorm | 39 | Storm is a minor death cause |

**Actionable:** The game currently plays more like PvE than PvP. If PvP tension is a design goal, the matchmaking may need to place more humans together, or hot zones need to funnel human players into encounters. **Metrics affected:** PvP engagement rate, session intensity score. **Action items:** Analyze spawn-point proximity between humans, create "contested loot" zones that force human encounters.

**Why a Level Designer should care:** Map flow is currently optimized around bot encounters. If the studio shifts toward more PvP, level geometry needs chokepoints and sightlines designed for human-vs-human fights, not just bot patrol routes.

---

## Insight 3: Storm Deaths Are Rare (39 total) — The Storm May Not Be Punishing Enough

**What caught my eye:** Only 39 `KilledByStorm` events across 796 matches and 5 days.

**The data:**
- 39 storm deaths vs 700 bot-kills and 2,415 bot-kills-by-players.
- Storm deaths represent just 0.04% of all events.

**Actionable:** If the storm is meant to create urgency and force extraction, it's currently too easy to avoid. Alternatively, players may have already learned optimal routes. **Metrics affected:** Match pacing, average extraction time, late-game engagement. **Action items:** Analyze storm death locations to see if they cluster at specific map edges (indicating geometry traps). Consider increasing storm speed or narrowing safe zones to increase urgency. Test a "storm surge" event that temporarily accelerates the storm.

**Why a Level Designer should care:** The storm is a core map mechanic — it shapes where players go and when. If players almost never die to it, the storm isn't doing its job as a "map boundary enforcer." The level geometry might be allowing too-easy escape routes.
