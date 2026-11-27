# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Victorcollin123/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Victorcollin123/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Turkey Run — The Great Thanksgiving Escape: Farmyard Dash · Cornfield Sprint · Kitchen Gauntlet · Woods to Freedom. Tom the turkey is on the menu tonight — unless he makes the woods. Outrun Farmer Bram across four stages, jump the fences and hay bales, dodge the glowing oven and the falling carving knives, hide in the haystacks when Bram gets close, and eat corn to pull away. Three lives, a stamina bar for sprinting, golden feathers, gravy-boat extra lives, and a caught-or-escaped end screen with a restart. Playable offline in a desktop browser from static files — no network request, no build step.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. ↑ or Space jumps, ↓ ducks and hides in haystacks, ← → steer, Shift sprints (stamina), P pauses, M mutes, R restarts. Click or press Enter to start the run.

## How it plays

- Run 1000 metres from the farmyard to the woods: Farmyard → Cornfield → Kitchen Garden → The Woods, each faster and denser than the last.
- Farmer Bram chases from behind — the red FARMER meter shows how close he is. Hitting an obstacle or wading through mud lets him gain; corn, sprinting and golden feathers pull away.
- Hide in a haystack (hold ↓ beside one) and Bram stops to search it, then gives up and falls back. In the Kitchen Garden he tries to cut you off — watch for the warning.
- Corn is 100 points, a golden feather 250 plus three seconds of untouchable sprint, a gravy boat an extra life. Distance pays 10 points a metre.
- Caught with no lives left, or reaching the woods, ends the run with a score breakdown and a restart.

## Files

- `game/` — the playable game as static files (`index.html`, `src/`).
- `game/src/config.js` — tuning, the four zones and the autumn palette; `random.js` — seeded RNG; `input.js` — keyboard + mouse; `audio.js` — synthesized gobbles and chimes; `world.js` — obstacle and pickup spawning; `turkey.js` — Tom's run, jump, duck and hide; `farmer.js` — Bram's chase, search and cornering; `render.js` — farm, characters, HUD, title and end screens; `shots.js` — screenshot presets; `main.js` — boot and the game loop.
- `screenshots/` — title, mid-run, kitchen chase and escaped screens, real renders of the game.
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to the output directory and writes `dossier.json`.
