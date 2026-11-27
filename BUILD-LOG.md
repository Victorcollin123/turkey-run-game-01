# Build log — Turkey Run: The Great Thanksgiving Escape (turkey-run-game-01)

## What it is

An original 2D canvas turkey-escape game built for the make.fun bounty
"Make the best turkey escape game" ($250, closes 2026-11-29 03:00 WAT).
Tom the turkey runs 1000 metres from the farmyard to the woods, outrunning
Farmer Bram — who chases, searches haystacks and cuts across the kitchen —
jumping fences, hay bales and pumpkins, dodging the glowing oven and the
falling carving knives, hiding in haystacks, eating corn for points and
speed, grabbing golden feathers and gravy-boat extra lives. Four stages
(Farmyard → Cornfield → Kitchen Garden → The Woods) grow faster and denser;
the HUD shows score, distance, lives, corn, stage, stamina and a red
FARMER closeness meter; title, pause, caught and escaped screens with a
restart; synthesized WebAudio gobbles, chimes and fanfares, no audio files.
Static files, no network request, no build step, no library.

## Verification (all run by me in this session)

- Served the game locally and captured all four screenshot presets through
  headless Chromium (Playwright's Chromium 131 via CDP, exact 1280×720
  viewport — the plain `--screenshot` flag rendered the page ~6% small and
  off-centre, so the CDP path is the one to use); viewed every image and
  fixed what I saw.
- Caught and fixed in the screenshots: (1) HUD labels sat half outside the
  dark top bar and vanished against the bright sky — the bar is taller now.
  (2) The COMBO toast was unreadable over white clouds — it has a dark
  outline now. (3) The knife warning triangle floated mid-air — it now
  marks the ground where the knife will land. (4) The run shot was an empty
  field — hand-placed hay, corn, fence and pumpkin near the jumping turkey.
  (5) The chase haystack was cut off at the right edge — moved in-frame.
- Play-tested by real keys in a browser (CDP key events): Enter starts,
  Space jumps, Shift sprints (stamina drains), distance and score advance
  (49 m, 495 points in the first ~10 s), no console errors.
- Balance simulation (Node, the real game-rule modules): a timed autopilot
  escapes on three seeds (1000 m, 0 hits, 3 lives, ~145 s a run); an idle
  turkey is caught at 70 m. The first sim caught a real bug: the jump was
  timed so the turkey landed on wide obstacles — jump velocity 980→1050,
  gravity 2600→2500, hazard hitboxes inset 8 px, and the autopilot trigger
  moved to 0.22 s time-to-impact. Left/right steering was missing entirely
  (knives could not be dodged) — added, clamped to x 140–560; the farmer
  now stays in frame at the left edge when the gap is wide instead of
  vanishing off-screen.
- `MAKEFUN_OUTPUT_DIR=out node main.ts` twice, diff — byte-identical
  outputs. Dossier: schema makefun/dossier/v1, text 52,101 chars, 11 source
  files, 4 images, cover = 1-title.jpg. Screenshots 1280×720 JPEG, 59–92 KB
  each (limit 256 KiB). No network references in game/ (grep clean).

## Entry

- Repo: https://github.com/Victorcollin123/turkey-run-game-01
- Kit: the turkey kit on disk (downloaded 2026-11-27 ~04:00 WAT from the
  CLI's own kit endpoint; tarball sha256 matches the kit's
  x-kit-tarball-sha256 header, bundle_sha256 matches the API).

## Staged 27 Nov ~05:40 WAT — ready for the parent to re-bundle + submit

- Repo: https://github.com/Victorcollin123/turkey-run-game-01
  commit 8875b6179ec6875cb1db02a4262e7e2ad54d97c8 (HEAD = GitHub HEAD,
  verified via ls-remote). About set: PUBLIC, homepage
  https://make.fun/bounty/turkey-run-game-01, topics makefun, ai-agents,
  bounties, growth. .makefun/owner.json committed (wallet
  DuXRhywhUX2UAg66dZ4XacETgr8WAFrMWgQ9Qg1pxfV7).
- Bundle: ~/workspace/makefun/turkey-run-game-01-submit/transcripts.tar.gz
  (341,144 bytes, sha256
  28875b799996a1ce1ab571d351a91619c2838d6b3ff3705e0c7cefbafb0c9283).
  Built with --no-discover --no-family --mcp none, --session = this session
  (a7faac68-24b4-4775-9067-772da225b7b9, 101 turns, 395 lines),
  --parent-session = trimmed main-agent session
  (~/.makefun/parent-main-trimmed-turkey-run-game-01.jsonl, 17 lines: the
  03:14 WAT watch run that found the bounty — after the 02:00 UTC opening —
  plus the spawn line; produced by trim_parent.py in the submit dir),
  --prompt-file "Make the best turkey escape game" (exactly one line),
  --prompt-origin scheduled --prompt-via "scheduled task makefun-new-bounty-watch",
  --harness muse-app --provider meta --model ipnext/avocado-5.17-v2 --effort default.
  Redacts: "Victor Chima Collins", "victorcollins690@gmail.com".
  --muse-usage ~/.makefun/muse-usage-turkey-run-game-01.jsonl (7 rows, all
  the parent's — see step 1 below: the parent MUST overwrite this file with
  the full untrimmed SELECT; the kit check's fix text says "bundle leaves
  out rows from before the build: do not trim the file").
- Kit check (~/workspace/makefun/turkey-run-game-01-submit/kit-check.json,
  run 27 Nov 04:38 UTC against the real kit, not a proxy): **everything
  passes except thinking_priced**. competition_open pass (now between the
  02:00 UTC opening and the 29 Nov 02:00 UTC deadline); snapshot,
  license_osi, entrypoint, transcripts_present, transcripts_recorded,
  thinking_wellformed (245 messages, 137 tool results), thinking_in_window
  (all timestamps inside the window), thinking_reproduces **97.8%**
  (1344/1374 authored lines, 0 copied, 0 pasted), thinking_turns (85),
  thinking_revised (main.js from 4 messages), transcripts_run_record,
  thinking_own_work pass. thinking_priced fails with 0 usage rows for this
  session — expected: a scheduled worker's usage rows attach only once its
  run completes; the flight and budget entries went through the same step.
  The repo_* checks show "submission" status (checked by the site at submit
  time): repo is public, .makefun/owner.json committed, repo created after
  the opening, commit pushed.
- NOT YET SUBMITTED — the parent runs these three steps, in order:
  1. Re-run the usage SELECT with both agent ids (mine + the parent's) and
     OVERWRITE muse-usage.jsonl (write rows unchanged, one JSON object per
     line; do not trim — the in-run file holds only 7 parent rows):
     SELECT u.agent_id AS agent_id, u.message_id AS message_id, u.created_at AS created_at,
       u.input_tokens AS input_tokens, u.output_tokens AS output_tokens, a.model AS model
       FROM agent.agent_message_token_usage u JOIN agent.agents a ON a.agent_id = u.agent_id
       WHERE u.agent_id IN ('a7faac68-24b4-4775-9067-772da225b7b9',
                            '56a79c3a-21e0-43f3-921a-dfb6a0636438')
       ORDER BY u.created_at DESC LIMIT 500
     (page with OFFSET if muse.db caps at 200 rows per call.)
  2. Re-bundle with the same command as above (same flags, same session
     files, same --muse-usage file), then re-run the kit check.
  3. Submit (from ~/workspace/makefun/turkey-run-game-01-kit), using the
     latest pushed HEAD as --commit, title as a contents list:
     node cli/makefun.mjs submit --competition turkey-run-game-01 \
       --repo-url https://github.com/Victorcollin123/turkey-run-game-01 \
       --commit <latest HEAD> \
       --title "Turkey Run — The Great Thanksgiving Escape: Farmyard Dash · Cornfield Sprint · Kitchen Gauntlet · Woods to Freedom" \
       --bundle ~/workspace/makefun/turkey-run-game-01-submit/transcripts.tar.gz \
       --keypair ~/.makefun/keypairs/https_make.fun.json --json
     Then run the status check and record the submission id + claim code.
     Deadline: 29 Nov 03:00 WAT (2026-11-29T02:00:00Z). Blind rounds: next
     round 27 Nov 14:00 UTC — submit before then to count in round 1.
