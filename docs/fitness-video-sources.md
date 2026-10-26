# Fitness video source audit

Updated 2026-10-19 after the user selected **free, openly licensed media only**.

## Approved clips

**Push-up: continuous 3D animation**, `assets/models/fitness/push-up.glb`.

- Source: https://assiamahs.github.io/opengym3d/assets/push_up.glb
- Provenance manifest: https://github.com/AssiamahS/opengym3d/blob/main/assets/ASSET_LIBRARY.json
- Body: MPFB2 / MakeHuman base mesh and rig, CC0-1.0.
- Motion: Mesh2Motion Human Addon animation `Pushup`, CC0-1.0. The original project explicitly licenses models, rigs and animations CC0: https://github.com/Mesh2Motion/mesh2motion-app#licenses
- Combined export: OpenGym3D, whose published per-exercise manifest identifies the push-up as CC0 and redistributable: https://assiamahs.github.io/opengym3d/exercises.json
- Original SHA256: `67bfd1bf9c9c679dfd81f34202c661f954ce0ec4b15baac56a5781a372d11326`.
- Modification: removed the unrelated `Human` animation track targeting morph weights from a mesh with no morph targets. Retained `Human.rig`, its baked bone motion and geometry. No motion interpolation from still pictures was added.
- Reviewed the original 12-frame motion strip for the complete lowering/pressing cycle; not a professional form assessment.
- License: https://creativecommons.org/publicdomain/zero/1.0/
- Viewer: Three.js 0.170.0, MIT, with LICENSE retained under `assets/js/vendor/three-0.170.0/`. The loader imports were changed to relative paths for static hosting.

The other 27 exercises still need suitable open animations. The MP4 catalog remains empty.

## Rejected or incomplete sources

- The 27 proposed YouTube clips had available embed metadata, but no verified open license. Removed from the production catalog. Original-host embedding permission alone does not meet the user's requirement.
- wger's public video API exposes individual license and author metadata, including CC BY-SA 4.0 clips. The examined catalog did not cover all 28 exact exercise variants. Candidate clips need individual movement review before inclusion; equipment and setup must match.
- Free SVG/keyframe catalogs that alternate two or three poses do not meet the continuous-animation requirement.
- Commercial paid libraries are excluded by the user's preference.

## Required record for each approved asset

Record exercise ID, local MP4 path, original asset URL, original creator, exact open-license URL, verification date, movement/variation review, modifications and required attribution. For share-alike media, preserve applicable license notices and license derivative media accordingly. Do not assume an entire API's code license applies to all its media.

## Verification limit

The push-up model and controls were checked in Safari. The original motion strip was also reviewed. This is not a professional biomechanics review. Other exercise animations remain unfinished.
