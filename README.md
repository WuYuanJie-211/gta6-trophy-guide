[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/WuYuanJie-211/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/WuYuanJie-211/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# GTA VI Trophy Guide & Tracker

The best offline guide and tracker for the 55 PlayStation 5 trophies of **Grand Theft Auto VI** — built for the [make.fun competition gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **Tracker** — all 55 trophies (1 Platinum, 2 Gold, 6 Silver, 46 Bronze) with official names, descriptions and grades. Check them off; progress is saved in your browser (localStorage), and can be exported to a file and imported back.
- **Filters** — by category (story, side characters, collectibles, activities, robberies, money, explore, misc), by grade, by earned/not earned, and by missable. Full-text search.
- **Spoiler-safe mode** — hides the names and descriptions of hidden story trophies until you earn them.
- **Road to Platinum** — the order to earn them in (~200 hours, 4/10 difficulty, 1 playthrough, 0 online trophies), with the one potentially missable trophy flagged.
- **A guide for every trophy** — written in the author's own words (what to do, where, and when it can be missed), each with its source cited beside it.

## Honesty note

GTA VI launched 19 November 2026 and public guides are still incomplete. **4 trophies had no public guide at all** when this was built — *In The Beginning…*, *Bad Luck, I Guess*, *The Truth Is Out There*, *Ten Pin*. They are marked honestly as “No public guide yet” in the app instead of guessing. Everything else is sourced from PowerPyx's GTA 6 Trophy Guide & Roadmap, cross-checked against PlayStationTrophies.org, PSNProfiles, TrueTrophies and Exophase where available. No other guide's text was copied.

## Run it

Static files, zero network requests, works with the network off:

```sh
# any static server with app/ at its root, e.g.
npx serve app
# or
python3 -m http.server --directory app 8080
```

Then open `http://localhost:8080`.

## Build the entry (dossier)

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/app + out/screenshots + out/dossier.json
```

Run it twice — the output is byte-identical.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the app (hand-written, no libraries)
- `app/data/trophies.json` — all 55 trophies with guides and sources
- `app/data/roadmap.json` — the road to platinum, missables, and notes
- `main.ts` — build script (copies app/ + screenshots/ to /output, writes dossier.json)
- `vendor/makefun-frontend.ts` — the kit's scorer library, unchanged
- `screenshots/` — 4 real renders of the app (1280×720)

## License

MIT. Unofficial fan guide — not affiliated with Rockstar Games, PlayStation, or Take-Two Interactive. No Rockstar logo, artwork, or game assets are included.
