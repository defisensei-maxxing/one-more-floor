# One More Floor

A browser tower heist built for Project Treetop, October 2026. Collect treasure, dodge patrols, and decide whether to escape or climb. Every carried item makes the getaway harder.

## Play locally

No build or package installation required. Requires Python 3 to serve files:

```sh
npm start
# Open http://localhost:8080
```

Any static server can serve `dist/`. JavaScript modules require HTTP rather than opening index.html directly from the filesystem.

## Controls

- WASD / arrows: move
- Space (hold): sneak, silencing coins and reducing vision range
- E: interact near the green escape hatch or purple stairs
- Q: drop the last collected treasure (2-second pickup cooldown)
- P / Escape: pause
- Mobile: directional pad, Sneak, Interact and Drop buttons

## Mechanics

Gold bars reduce movement speed (floor: 45%). Diamonds expand guard vision. Coin purses create a noise radius when moving without sneaking. Walls block both vision and hearing. Guards require sustained detection to catch you. Traps pulse on and off from floor two. A bag holds 12 items. Escaping banks the score; being caught loses the current haul. Climbing increases treasure values and patrol difficulty without banking. Random runs vary loot placements; the UTC daily tower uses a shared deterministic seed. Personal bests are stored only in the current browser. No global leaderboard, account or wallet connection.

## Source

- `dist/engine.js`: deterministic floor generation, collision, detection and state transitions
- `dist/game.js`: canvas renderer, input, audio and interface
- `dist/style.css`, `dist/index.html`: responsive game shell
- `tests/engine.test.js`: reachability, collision, loot effects and run state tests

All game artwork is original procedural Canvas artwork. Fonts: Barlow Condensed and DM Sans via Google Fonts, with local system fallbacks. Sound effects are synthesized with Web Audio. AI-assisted implementation using Codex, directed by Salim / Defi Sensei. Work began 14 October 2026.

## Tests

```sh
npm test
```

## Deployment

Host the contents of `dist/` on any static host. The Sites hosting manifest is deployment-specific and is not needed by other hosts. The initial hosted preview is private; a publicly accessible URL and public source repository/archive are needed before contest submission. This repository does not submit to the contest or transfer funds.

## Menu music

“Spy Showdown” by Fablefly Music. Licensed under Creative Commons Attribution 4.0 International.
Source: https://fablefly-music.itch.io/spy-showdown
License: https://creativecommons.org/licenses/by/4.0/
The original audio file is included; playback is looped at reduced volume in the main menu.

## Guard progression

From floor five onward guards choose new destinations and change direction at irregular intervals. Daily-tower retries retain deterministic patrol decisions.
