# Atelier Decorator

## Project overview

Educational dress-up game comparing fixed subclasses with GoF Decorator. HTML, CSS and JavaScript; desktop and mobile browsers. Last updated 2026-10-19.

## Source of truth

Read `docs/STATE.md` for validated status, `docs/gameplan.md` for scope and `docs/tech.md` for the runtime contract. Acceptance criteria are in `docs/milestones/01-atelier.md`. The stack decision is `docs/architectural-decisions/0001-engine-and-stack.md`.

## Architecture

- Preserve double-click startup through `Index.html` and offline operation. Use relative paths and classic scripts, with no runtime dependencies or network requests.
- `model.js` owns both real class hierarchies and the generated educational code. `app.js` renders the result of the model's `visual()` method.
- Keep the four independent clothing pieces equivalent between modes. Traditional mode lists all 16 subsets; Decorator preserves selection order and rebuilds after removal.
- Preserve supplied assets. Render only the idle frame; clothing regions must remain aligned for every skin.
- Preserve `render_game_to_text()` and `advanceTime()` for inspection. The scene has no time-based simulation.

## Commands and verification

- Run: open `Index.html`; no dev server or build is required.
- Model: `node --test tests/model.test.cjs`.
- Browser: `node --test tests/browser.test.cjs`; see README for this machine's QA runtime paths.
- Syntax: `node --check model.js` and `node --check app.js`.

For behavior changes, verify affected combinations through file:// and check browser errors. For visual changes, inspect desktop/mobile screenshots in `output/iterate/`. Record automated validation separately from user playtest in `docs/STATE.md`. Use the make-game live-iterate workflow within the requested static-file scope.
