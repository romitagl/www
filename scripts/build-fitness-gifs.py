#!/usr/bin/env python3
"""Build pose-by-pose GIF guides from the existing catalog's image sheets.
Requires Pillow (scripts/requirements-fitness-gifs.txt) and Node. No network calls.
Existing source images are never edited. --check validates current artifacts.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'assets/images/fitness/animated'
MODULE = ROOT / 'assets/js/fitness/demo-gifs.mjs'
MANIFEST = OUTPUT / 'manifest.json'
WIDTH = 480
STEP_MS = 1100
HOLD_MS = 2400
# These sheets depict isometric holds, even when older catalog entries omit mediaMode.
HOLDS = {'side-plank', 'suitcase-hold', 'forearm-plank', 'squat-hold', 'single-leg-balance', 'single-leg-squat-hold'}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def catalog():
    js = "import {exercises} from './assets/js/fitness/catalog.mjs'; console.log(JSON.stringify(exercises));"
    return json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT, text=True))


def font(size):
    for path in ['/System/Library/Fonts/Supplemental/Arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size=size)


def build(exercise):
    source = ROOT / exercise['image']
    columns, rows = exercise.get('columns', 2), exercise.get('rows', 1)
    hold = exercise['id'] in HOLDS
    with Image.open(source) as original:
        original = original.convert('RGB')
        cell_w, cell_h = original.width / columns, original.height / rows
        height = round(cell_h * WIDTH / cell_w)
        frames = []
        for index, label in enumerate(exercise['frames']):
            col, row = index % columns, index // columns
            if row >= rows:
                raise ValueError(f"Invalid frame grid: {exercise['id']}")
            box = (round(col * cell_w), round(row * cell_h), round((col + 1) * cell_w), round((row + 1) * cell_h))
            crop = original.crop(box).resize((WIDTH, height), Image.Resampling.LANCZOS)
            canvas = Image.new('RGB', (WIDTH, height + 84), '#191c23')
            canvas.paste(crop, (0, 0))
            draw = ImageDraw.Draw(canvas)
            lines = textwrap.wrap(f'{index + 1} / {len(exercise["frames"])}   {label}', width=48)
            draw.text((14, height + 10), '\n'.join(lines[:2]), font=font(17), fill='#f3f5fa', spacing=3)
            draw.text((14, height + 62), 'Hold setup / sides - stay still' if hold else 'Illustrated key positions - follow the written cues', font=font(12), fill='#a8afbd')
            frames.append(canvas)
    prefix = OUTPUT / exercise['id']
    poster, end_poster, gif = prefix.with_suffix('.jpg'), OUTPUT / f'{exercise["id"]}-end.jpg', prefix.with_suffix('.gif')
    frames[0].save(poster, quality=90, optimize=True)
    frames[-1].save(end_poster, quality=90, optimize=True)
    # One common palette avoids color shifts between poses.
    strip = Image.new('RGB', (WIDTH, frames[0].height * len(frames)))
    for index, frame in enumerate(frames):
        strip.paste(frame, (0, index * frame.height))
    palette = strip.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
    indexed = [frame.quantize(palette=palette, dither=Image.Dither.FLOYDSTEINBERG) for frame in frames]
    durations = exercise.get('gifFrameDurationsMs', [HOLD_MS if hold else STEP_MS] * len(frames))
    if len(durations) != len(frames) or any(not isinstance(ms, int) or ms < 20 or ms > 10000 or ms % 10 for ms in durations):
        raise ValueError(f'Invalid GIF frame timing: {exercise["id"]}')
    options = {} if hold else {'loop': 0}
    indexed[0].save(gif, save_all=True, append_images=indexed[1:], duration=durations, disposal=2, optimize=False, **options)
    if gif.stat().st_size > 3 * 1024 * 1024:
        raise ValueError(f'GIF exceeds size budget: {gif}')
    relative = lambda path: str(path.relative_to(ROOT))
    extra = {}
    if exercise.get('gifManualSteps'):
        paths = []
        for index, frame in enumerate(frames):
            path = OUTPUT / f'{exercise["id"]}-step-{index + 1:02d}.jpg'
            frame.save(path, quality=90, optimize=True)
            paths.append(relative(path))
        extra['framePosters'] = paths
    return {
        'src': relative(gif), 'poster': relative(poster), 'endPoster': relative(end_poster),
        'width': WIDTH, 'height': frames[0].height, 'frames': len(frames),
        'durationMs': sum(durations), 'loop': not hold,
        'source': exercise['image'], 'sourceSha256': digest(source),
        'sha256': digest(gif), 'bytes': gif.stat().st_size, **extra,
    }


def check(exercises):
    data = json.loads(MANIFEST.read_text())
    assert set(data) == {item['id'] for item in exercises}, 'GIF coverage differs from the exercise catalog'
    for exercise in exercises:
        item = data[exercise['id']]
        assert digest(ROOT / item['source']) == item['sourceSha256'], f'Stale source: {exercise["id"]}'
        assert digest(ROOT / item['src']) == item['sha256'], f'Changed GIF: {exercise["id"]}'
        with Image.open(ROOT / item['src']) as gif:
            assert gif.n_frames == len(exercise['frames'])
            assert gif.size == (item['width'], item['height'])
            assert (gif.info.get('loop') == 0) == item['loop']
            duration = 0
            for index in range(gif.n_frames):
                gif.seek(index)
                duration += gif.info['duration']
            assert duration == item['durationMs']
        if 'framePosters' in item:
            assert len(item['framePosters']) == len(exercise['frames'])
        for path in [item['poster'], item['endPoster'], *item.get('framePosters', [])]:
            with Image.open(ROOT / path) as image:
                assert image.size == (item['width'], item['height'])
    print(f'PASS: {len(data)} GIFs, source hashes, frame counts, timing, loop modes and posters.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--exercise', help='Regenerate only this exercise and retain other artifacts')
    args = parser.parse_args()
    exercises = catalog()
    if args.check:
        check(exercises)
    else:
        OUTPUT.mkdir(parents=True, exist_ok=True)
        data = json.loads(MANIFEST.read_text()) if args.exercise else {}
        selected = [exercise for exercise in exercises if not args.exercise or exercise['id'] == args.exercise]
        if not selected:
            raise SystemExit('Unknown exercise ID')
        for exercise in selected:
            data[exercise['id']] = build(exercise)
        MANIFEST.write_text(json.dumps(data, indent=2) + '\n')
        public = {key: {k: v for k, v in item.items() if k not in ['sourceSha256', 'sha256', 'bytes']} for key, item in data.items()}
        MODULE.write_text('/** Generated by scripts/build-fitness-gifs.py; do not edit by hand. */\nexport const demoGifs = ' + json.dumps(public, indent=2) + ';\n')
        check(exercises)
        print(f'Generated {len(data)} GIFs, {sum(item["bytes"] for item in data.values()) / 1024 / 1024:.2f} MiB total.')
