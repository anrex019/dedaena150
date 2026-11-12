# დედაენა 150 — Georgian Digital Museum

An interactive educational museum for Mother Tongue Day: four doors, a historical library, a Georgian vocabulary collection, a playable 2D platformer, and letters to the year 2126.

## Run

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

Routes live in the URL hash (`#/history`, `#/words`, `#/game`, `#/future`), so a refresh keeps the current room without a server rewrite.

## Edit content

- Door titles: `src/data/doors.ts`
- Biography, timeline, book pages, sources: `src/data/history.ts`
- Vocabulary: `src/data/words.ts`
- Platformer levels: `src/data/levels.ts`
- Student name placeholders: `src/data/students.ts`

Visitor-facing copy is Georgian. Source code and this file are English.

## What is real

- Four doors navigate to separate rooms, with a short opening animation unless reduced motion is on.
- Historical dates follow the National Parliamentary Library of Georgia (New Style: 27 October 1840 – 14 June 1912) and the 1876 first edition record. No quotations are invented. The portrait is an illustration, not an archival photograph.
- The vocabulary is a data list of plain definitions and examples. Etymologies are intentionally absent.
- The platformer is Phaser 3, loaded only when the third door opens. It has running, jumping, gravity, platform collision, collectibles, checkpoints, score, three lives, pause, restart, three levels, keyboard controls, and touch buttons.
- Favorites, letters, settings, and level progress are stored in `localStorage` on this browser only.
- Music and effects are original synthesized tones, off until a visitor turns them on. There is no recorded soundtrack.
- Pronunciation uses the device speech engine only when a Georgian (`ka`) voice is installed. Otherwise the listen button is hidden.

## Known limits

- There are no licensed sprite sheets, archival photos, or recorded student voices in the repository. Game art is drawn on a canvas at runtime.
- Letters are not published to a shared server.
- Student names are placeholders.
- A teacher should review the historical pages against the linked sources before the competition.
- The 2013 intangible-heritage note is marked for that review.
- Jump distances were tuned for the three built-in levels. Very large custom gaps in `levels.ts` may be impossible.
