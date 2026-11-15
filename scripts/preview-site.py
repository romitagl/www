#!/usr/bin/env python3
"""Preview www and the built Web Tools locally; never publishes or modifies sources.
Run Web Tools' `npm run build` first, then: python3 scripts/preview-site.py
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import unquote, urlsplit

WWW = Path(__file__).resolve().parents[1]
TOOLS = WWW.parent / 'web-tools' / 'dist'
WIKI = WWW.parent / 'www-wiki'
PORTS = {'site': 8766, 'tools': 8767}

# Preview-only link routing keeps cross-domain links on the local versions.
# Metadata and production source URLs remain unchanged.
PREVIEW_SCRIPT = '''<script>
(() => {
 const origins = {'romitagl.com':'http://127.0.0.1:8766','www.romitagl.com':'http://127.0.0.1:8766','web-tools.romitagl.com':'http://127.0.0.1:8767'};
 function routeLinks() {
  for (const link of document.querySelectorAll('a[href]')) {
   const url = new URL(link.getAttribute('href'), location.href);
   if (origins[url.hostname]) link.href = origins[url.hostname]+url.pathname+url.search+url.hash;
  }
 }
 document.addEventListener('DOMContentLoaded', () => {
  routeLinks();
  new MutationObserver(routeLinks).observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['href']});
 });
 const fetchOriginal = window.fetch.bind(window);
 window.fetch = (input, options) => {
  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  if (url.hostname === 'raw.githubusercontent.com' && url.pathname.startsWith('/wiki/romitagl/www/')) {
   return fetchOriginal('http://127.0.0.1:8766/__wiki/'+url.pathname.split('/').pop(), options);
  }
  return fetchOriginal(input, options);
 };
})();
</script>'''


def review_index():
    pages = [('Homepage', '/'), ('Knowledge Wiki', '/wiki.html'), ('Motors / SAE', '/wiki.html#motors'),
             ('Rider Fit', '/fitness.html'), ('FIAT guide · EN', '/fiat500l-wiki.html'),
             ('Guida FIAT · IT', '/fiat500l-wiki-it.html'), ('FIAT experience', '/fiat500L.html'),
             ('About & contact', '/about.html'), ('Privacy', '/privacy.html'), ('Programming lab', '/programming.html')]
    tools = [('All tools', '/'), ('PDF & Image Merger', '/pdf-merger/'), ('PDF Compressor', '/pdf-compressor/'),
             ('Animated GIF Maker', '/gif-maker/'), ('Video Speed Controller', '/video-speed-controller/'),
             ('QR Generator & Scanner', '/qr-code-tool/'), ('Code Formatter', '/code-formatter/'),
             ('Base64', '/base64-encoder-decoder/'), ('CIDR Calculator', '/cidr-calculator/'), ('Website Scraper', '/website-scraper/')]
    def links(items, port):
        return ''.join(f'<a href="http://127.0.0.1:{port}{path}">{title} <span>↗</span></a>' for title, path in items)
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local site review</title>
<style>*{{box-sizing:border-box}}body{{margin:0;background:#101217;color:#f3f5fa;font:15px/1.6 system-ui,sans-serif}}main{{max-width:1050px;margin:auto;padding:48px 24px}}h1{{font-size:clamp(2.3rem,5vw,3.5rem);line-height:1.1;letter-spacing:-.055em}}p{{color:#a8afbd;max-width:740px}}.badge{{color:#c5f277;font-size:12px}}.columns{{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:32px}}section{{padding:24px;border:1px solid #303540;border-radius:16px;background:#191c23}}h2{{font-size:20px;margin-top:0}}a{{display:flex;justify-content:space-between;gap:15px;padding:11px 0;border-bottom:1px solid #303540;color:#f3f5fa;text-decoration:none}}a:hover,a:focus-visible{{color:#c5f277}}small{{display:block;color:#a8afbd;margin-top:28px}}@media(max-width:650px){{.columns{{grid-template-columns:1fr}}}}</style></head><body><main><span class="badge">LOCAL REVIEW · UNPUBLISHED</span><h1>Ready to explore.</h1><p>The approved sidebar layout, B's headline and tool spotlight, charcoal surfaces, lime actions, and teal/amber accents across romitagl.com and Web Tools.</p><p>Links between these two sites stay on the local versions. Wiki text uses the local Wiki snapshots. File tools run locally; external service links and the Website Scraper still access the internet when used.</p><div class="columns"><section><h2>Personal site</h2>{links(pages, PORTS['site'])}</section><section><h2>Web Tools</h2>{links(tools, PORTS['tools'])}</section></div><small>Resize your browser to review mobile layouts. No changes have been pushed or published. Rebuild Web Tools after editing its React/CSS source.</small></main></body></html>'''


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, root, **kwargs):
        self.root = root
        super().__init__(*args, directory=str(root), **kwargs)

    def translate_path(self, path):
        pathname = unquote(urlsplit(path).path)
        if pathname.startswith('/__wiki/'):
            candidate = (WIKI / pathname.rsplit('/', 1)[-1]).resolve()
            return str(candidate if candidate.parent == WIKI and candidate.suffix == '.md' else WWW / '__missing__')
        candidate = (self.root / pathname.lstrip('/')).resolve()
        if not candidate.is_relative_to(self.root) or any(part.startswith('.') for part in candidate.relative_to(self.root).parts):
            return str(self.root / '__missing__')
        # GitHub Pages copies public/ into the deployed root.
        public = (self.root / 'public' / pathname.lstrip('/')).resolve()
        if not candidate.exists() and public.is_relative_to(self.root / 'public') and public.is_file():
            candidate = public
        return str(candidate)

    def do_GET(self):
        if urlsplit(self.path).path == '/__review/':
            return self.send_html(review_index())
        candidate = Path(self.translate_path(self.path))
        if candidate.is_dir():
            candidate = candidate / 'index.html'
        if candidate.is_file() and candidate.suffix == '.html':
            html = candidate.read_text()
            if candidate.name != 'fiat500L.html':
                html = html.replace('</head>', PREVIEW_SCRIPT + '</head>', 1)
            return self.send_html(html)
        return super().do_GET()

    def send_html(self, html):
        data = html.encode()
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def list_directory(self, path):
        self.send_error(404)


if __name__ == '__main__':
    if not (TOOLS / 'index.html').exists():
        raise SystemExit('Build Web Tools first: cd ../web-tools && npm run build')
    servers = []
    try:
        for key, root in [('site', WWW), ('tools', TOOLS)]:
            server = ThreadingHTTPServer(('127.0.0.1', PORTS[key]), partial(PreviewHandler, root=root))
            servers.append(server)
            Thread(target=server.serve_forever, daemon=True).start()
        print('Full-site local review: http://127.0.0.1:8766/__review/', flush=True)
        print('Homepage: http://127.0.0.1:8766/ | Tools: http://127.0.0.1:8767/', flush=True)
        import threading
        threading.Event().wait()
    except KeyboardInterrupt:
        pass
    finally:
        for server in servers:
            server.shutdown()
            server.server_close()
