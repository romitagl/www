# Rider Fit

Fitness is a tab within the Knowledge Wiki at `wiki.html#fitness`. Its circuits, exercise library and journal open in `fitness.html`, which stays within the Wiki navigation hierarchy and links back to the Fitness tab. Homepage and footer entry points go through the Wiki tab; Fitness is not a top-level navigation item. Existing workout URLs and saved progress remain valid. The normal GitHub Pages copy step includes its modules, styles and assets. No bundler or application server is required.

## Run locally

From the repository root:

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

Open `http://localhost:8767/fitness.html`. ES modules require HTTP; opening the production page with `file://` is unsupported.

## Organization

- `fitness.html`: document shell, metadata, shared components, readable no-script fallback.
- `css/fitness.css`: feature-scoped layout, mobile styles and appearance.
- `assets/js/fitness/catalog.mjs`: stable exercise/circuit IDs, cues, prescriptions and media metadata.
- `demo-guides.mjs`: numbered instructions and matching storyboard frames for the previously unclear movements.
- `pdf-program.mjs`: additional conditioning workouts and per-circuit doses. Legacy internal IDs preserve existing journals; public pages use descriptive names and URL slugs.
- `amrap-core.mjs` / `amrap.mjs`: the timed workout’s independent 20-minute clock and rounds-plus-extra-repetitions score.
- `session.mjs`: pure session transitions, bounds and validation.
- `storage.mjs`: versioned browser storage, validation and memory fallback.
- `media.mjs`: native video lifecycle, visibility cleanup and illustration error handling.
- `demo-videos.mjs`: open-license eligibility checks and the approved local video catalog.
- `demo-models.mjs` / `model-demo.mjs`: approved CC0 3D assets and a lazy viewer with abortable loading, GPU cleanup and picture-guide fallback.
- `views.mjs`: escaped rendering, semantic controls and route views.
- `app.mjs`: hash navigation, event handling, optional timers and persistence.
- `assets/images/fitness/`: self-hosted optimized JPEG key-position sheets.
- `docs/fitness-media.md`: complete image prompts and provenance.
- `tests/fitness/`: Node built-in tests; no test dependencies.

## Behavior

Users choose 1–10 rounds per circuit. That number controls the session, between-round recovery, completion summary and journal entry. A session includes a warm-up, the chosen sets, recovery between rounds and a cooldown. Completing timers never advances an exercise automatically. Timed unilateral holds show a halfway cue and require both sides before completion.

Sessions pause when the tab is hidden, when navigating away, and on reload. Unfinished sessions can be resumed. A completed entry is saved only after the final cooldown confirmation, keyed by session ID to avoid duplicate saves. Duration includes all breaks and time away. The journal retains the most recent 200 sessions, uses local device dates, and can be cleared after an inline confirmation.

Only settings, the unfinished session and the journal are stored, under `romitagl.fitness.v1`. No account, backend or third-party fitness API is used. In browsers that block storage, the section works in memory and shows a persistence notice. Existing site-level external resources are separate from fitness data; no workout data is sent to them.

## Demos

Exercise pages, guided circuits and AMRAP share the same demo component. The user requires **free, openly licensed media only**. The previous YouTube candidates were removed because embedding availability does not establish an open license. No external players are loaded.

The push-up now has a self-hosted CC0 3D model with a baked continuous animation, play/pause, speed and orbit controls. `demo-models.mjs` records its source and license. Three.js 0.170.0 is vendored under `assets/js/vendor/`, loaded only for a 3D exercise. The other 27 exercises still use picture guides; animation coverage is unfinished. The MP4 video catalog remains empty.

The player is ready for self-hosted MP4s with native play/pause, repeat and fullscreen, plus 0.5×/1× speed selection. It never autoplays. Hiding the tab or disposing a route pauses playback independently of workout timers. A video appears only with a local asset path, publisher, original source URL and a recorded verified open license. Supported license identifiers are CC0-1.0, CC-BY-4.0 and CC-BY-SA-4.0; add other verified open licenses explicitly when needed. Preserve attribution and share-alike requirements for licensed assets.

Before approving a clip, check its exact variation, continuous movement, public-site reuse terms, required attribution and any modifications. Record these in `docs/fitness-video-sources.md`. Never relabel a few still frames as an animation or substitute a different exercise merely to fill coverage.

## Workout options

All six workouts appear in the same circuit grid. Bodyweight conditioning and Agility & endurance use a suggested 3–4 rounds and 240-second recovery between rounds. Their station-specific counts override the general wiki doses. Public copy describes the workout itself, without document provenance or a separate imported-plan section. Descriptive URL slugs map to stable internal IDs so existing journal entries and unfinished sessions remain valid.

The 20-minute AMRAP uses a time target rather than a fixed round target. Its clock counts recovery while the tracker is visible, can be paused, and pauses when hidden or when the tracker is left. Reaching zero requests partial repetitions of the next exercise. Saved scores include full rounds, complete extra exercises and partial repetitions; early finishes retain actual work time. An unfinished attempt may be resumed or discarded without altering completed journal entries.

The exercise-ball sequence and its images are excluded. Legacy bookmarks for the former plan/stability pages open the general workout selection.

## Checks

```sh
node --test tests/fitness/*.test.mjs
node scripts/check-fitness.mjs
```

The first checks round-dependent session completion, recovery, validation, local-storage failure handling and media references. The second validates site integration and parses all feature modules. Browser QA should cover mobile and desktop, static picture sequences, selecting a non-default round count, a complete session, refresh/resume, denied storage, and keyboard focus.

The feature is prepared in this working tree. Publishing remains part of the repository's existing GitHub Pages workflow; no new hosting project is needed. The workflow runs fitness checks before copying pages and assets, and includes the media provenance documentation. The homepage and privacy page describe the journal's browser-local storage.

## Release review — 2026-10-26

Safari desktop and 390 × 844 responsive checks covered the Wiki entry point, 3D playback, mobile navigation, three-round selection (18 sets) and refresh restoring the timer paused. Automated regressions cover inherited storage keys, invalid types and phase-specific timer limits, model-library failure fallback and navigation before the viewer loads. Deployment includes the source audit and vendor license. Continuous animation coverage remains one of 28 exercises; the remaining exercises retain their picture guides.
