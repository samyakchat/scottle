# Scottle

A minimalist daily reflex game built with Vite, React, and TypeScript. One chat arrives each day; spot its five double-meaning setups before the next line appears.

## Run it

```sh
npm install
npm run dev
```

`npm run build` validates the conversation file, type-checks the app, and creates a static site in `dist/`. Preview a production build with `npm run preview`.

## Add a day

Copy one JSON object in `public/conversations.jsonl` onto a new line. Change the date and title, edit the lines, and mark exactly five setups with `1` in the third tuple position. Keep each conversation between 12 and 30 lines, with no adjacent setups. Run `npm run validate` before committing.

## Decisions

- Data, timing, scoring, and storage remain separate from the React UI.
- Message bubbles, the conversation header, buttons, dialogs, and results are React components styled with Tailwind CSS; `#2a9cd3` is the shared accent color.
- Missing dates use a stable day offset from November 19, 2026, wrapping through the available conversations.
- A reload after starting an attempt completes the day from saved progress. Storage errors are caught, so play still works, but a browser that blocks storage cannot enforce the daily limit across reloads.
- Line pacing starts at 3.7 seconds for the opening line and eases down to about 1.1 seconds at the end, with a small readability bonus for longer messages.
- Conversation data is a public static file. Curious players can inspect future conversations; this is acceptable for a front-end-only version.
- Today and the next-day countdown use the player's local timezone. The countdown rolls over at local midnight.

## Structure

- `public/conversations.jsonl`: hand-editable daily puzzles.
- `scripts/validate-conversations.mjs`: validates dates, line tuples, setup count, and adjacency.
- `src/config.ts`: pacing constants, local date, and puzzle numbering.
- `src/data/conversations.ts`: JSONL loading and deterministic date lookup.
- `src/game/`: timing decisions and score calculations.
- `src/storage/storage.ts`: guarded local storage, attempt persistence, and streaks.
- `src/components/`: reusable buttons, message bubbles, conversation header/thread, dialogs, and results.
- `src/App.tsx` and `src/main.tsx`: game screens, interactions, and the React entry point.
- `src/style.css`: Tailwind import, theme tokens, animation definitions, and the reduced-motion base rule.
