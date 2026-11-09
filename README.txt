Deploy (HTTPS required):
1) Upload everything in this folder as-is (index.html, sw.js, manifest.webmanifest, icons/) to GitHub Pages / Netlify / Cloudflare Pages.
2) Open the link once while online so the app gets cached.
3) Android Chrome: menu > Install app (round icon). iPhone Safari: Share > Add to Home Screen. Desktop: install icon in address bar.
4) On every update: bump CACHE = 'firmo-v6' in sw.js and re-upload.
Note: double-clicking the file (file://) does not support install or Service Worker.
