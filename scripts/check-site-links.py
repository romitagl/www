#!/usr/bin/env python3
"""Audit root HTML pages, rendered shared menus, and referenced local CSS.
Run with --external to check public destinations using real GET requests.
Reports distinguish missing links from destinations that block verification.
"""
import argparse
import concurrent.futures
import json
from datetime import datetime, timezone
from tempfile import NamedTemporaryFile
from pathlib import Path
import re
import subprocess
from html.parser import HTMLParser
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REVIEW_FILE = ROOT / 'docs/link-verifications.json'
REVIEWS = json.loads(REVIEW_FILE.read_text()) if REVIEW_FILE.is_file() else {}
ORIGIN = 'https://romitagl.com/'

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.references = []; self.ids = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'): self.ids.add(attrs['id'])
        if attrs.get('name') and tag == 'a': self.ids.add(attrs['name'])
        # Connection hints and canonical metadata do not represent clickable destinations.
        if tag == 'link' and attrs.get('rel') in ('preconnect', 'dns-prefetch'): return
        for key in ('href', 'src', 'poster'):
            if attrs.get(key): self.references.append(attrs[key])
        if attrs.get('srcset'):
            self.references.extend(item.strip().split()[0] for item in attrs['srcset'].split(','))


def rendered_components(page):
    code = """
const fs = require('node:fs'); const vm = require('node:vm');
const targets = ['navigation', 'footer'].map(component => ({dataset:{component},innerHTML:''}));
vm.runInNewContext(fs.readFileSync('components.js','utf8'), {
 location:{pathname:'/'+process.argv[1],hash:'',hostname:'localhost'},
 document:{addEventListener:(event,fn)=>{if(event==='DOMContentLoaded')fn();},querySelectorAll:()=>targets,querySelector:()=>null}
}); process.stdout.write(targets.map(target=>target.innerHTML).join('\\n'));
"""
    return subprocess.check_output(['node', '-e', code, page.name], cwd=ROOT, text=True)


def source_path(path):
    relative = unquote(path).lstrip('/') or 'index.html'
    if relative.endswith('/'): relative += 'index.html'
    candidate = ROOT / relative
    if not candidate.is_file(): candidate = ROOT / 'public' / relative
    return candidate


def audit_external(url):
    with NamedTemporaryFile() as body:
        command = ['curl', '--silent', '--show-error', '--location', '--max-redirs', '5',
                   '--connect-timeout', '8', '--max-time', '20', '--compressed',
                   '--output', body.name, '--write-out', '%{http_code}\t%{url_effective}', url]
        run = subprocess.run(command, capture_output=True, text=True)
        content = Path(body.name).read_text(errors='replace')
    parts = run.stdout.split('\t', 1)
    status = int(parts[0]) if parts and parts[0].isdigit() else 0
    effective = parts[1] if len(parts) > 1 else url
    state = 'pass' if run.returncode == 0 and 200 <= status < 300 else ('unverified' if status in (401, 403, 429) else 'fail')
    title_match = re.search(r'<title[^>]*>(.*?)</title>', content, re.S | re.I)
    title = re.sub(r'\s+', ' ', title_match[1]).strip() if title_match else ''
    if state == 'pass' and re.search(r'(^404\b|page not found|site not found|domain not found)', title, re.I): state = 'fail'
    result = {'url': url, 'state': state, 'status': status, 'effective_url': effective,
              'title': title, 'error': run.stderr.strip() if run.returncode else ''}
    review = REVIEWS.get(url)
    today = datetime.now(timezone.utc).date().isoformat()
    if state == 'unverified' and review and status == review['status'] and review['checked_on'] <= today <= review['expires_on']:
        result['state'] = 'reviewed'; result['review'] = review
    return result


def main():
    args = argparse.ArgumentParser(); args.add_argument('--external', action='store_true'); args.add_argument('--report', default='docs/link-audit.json'); options = args.parse_args()
    documents = {}; references = []; css_files = set()
    for page in sorted(ROOT.glob('*.html')):
        parser = Links(); text = page.read_text()
        parser.feed(text)
        if 'data-component=' in text: parser.feed(rendered_components(page))
        documents[page] = parser
        references.extend((page.name, value) for value in parser.references)
    local = []; external = {}
    def check_reference(owner, value):
        absolute = urljoin(urljoin(ORIGIN, owner), value)
        url = urlsplit(absolute)
        if url.scheme not in ('http', 'https'): return
        if url.netloc != 'romitagl.com':
            external.setdefault(absolute.split('#')[0], set()).add(owner); return
        target = source_path(url.path)
        state = 'pass' if target.is_file() else 'fail'
        note = ''
        if state == 'pass' and url.fragment and target.suffix == '.html':
            parser = documents.get(target)
            if parser is None:
                parser = Links(); parser.feed(target.read_text())
            if unquote(url.fragment) not in parser.ids:
                if target.name == 'fitness.html' and url.fragment in ('circuits', 'library', 'progress'):
                    note = 'Application hash route (checked by fitness integration checks)'
                else: state = 'fail'; note = 'Missing fragment target'
        local.append({'source':owner,'reference':value,'state':state,'note':note})
        if target.is_file() and target.suffix == '.css': css_files.add(target)
    for owner, value in references: check_reference(owner, value)
    # Runtime fitness attribution links are rendered from these catalogs.
    catalogs = ['assets/js/fitness/demo-models.mjs', 'assets/js/fitness/demo-videos.mjs']
    for catalog in catalogs:
        code = f"const m = await import('./{catalog}'); console.log(JSON.stringify(m.demoModels || m.demoVideos));"
        data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code], cwd=ROOT, text=True))
        for item in data.values():
            for value in (item.get('src'), item.get('sourceUrl'), item.get('license', {}).get('url')):
                if value: check_reference('fitness.html', value)
    scanned = set()
    while css_files - scanned:
        css = next(iter(css_files - scanned)); scanned.add(css)
        for value in re.findall(r'url\(\s*[\'\"]?([^\'\")]+)', css.read_text()):
            if not value.startswith('data:'): check_reference(str(css.relative_to(ROOT)), value.strip())
    checks = []
    if options.external:
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            for result in pool.map(audit_external, sorted(external)):
                result['sources'] = sorted(external[result['url']]); checks.append(result)
                print(f"{result['state'].upper()} HTTP {result['status']} {result['url']}", flush=True)
    report = {'checked_at':datetime.now(timezone.utc).isoformat(), 'scope':'All root HTML pages, generated shared navigation/footer, referenced CSS assets, configured fitness demo media and attribution links',
              'local_references':local,'external_checks':checks,'external_not_checked':[] if options.external else sorted(external)}
    (ROOT/options.report).write_text(json.dumps(report, indent=2)+'\n')
    failures = [item for item in local if item['state'] != 'pass']
    for item in failures: print(f"FAIL {item['source']}: {item['reference']} {item['note']}")
    print(f"Local: {len(local)-len(failures)}/{len(local)} passed. External: {sum(item['state']=='pass' for item in checks)} HTTP passes, {sum(item['state']=='reviewed' for item in checks)} time-limited alternate verifications, {len(checks)} total.")
    return bool(failures or any(item['state'] not in ('pass', 'reviewed') for item in checks))

if __name__ == '__main__': raise SystemExit(main())
