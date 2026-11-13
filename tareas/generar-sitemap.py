#!/usr/bin/env python3
"""Genera sitemap.xml con todas las páginas públicas (.html) y los PDF de descargas/.
- La URL de cada página es la misma que su <link rel="canonical">.
- Se excluyen las páginas con noindex (p. ej. 404.html).
- lastmod = fecha del último commit que tocó el archivo.
Uso, desde la raíz del repo:  python3 tareas/generar-sitemap.py
"""
import glob, os, re, subprocess
BASE = 'https://saberparainvertir.com/'
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

def lastmod(p):
    d = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', p], capture_output=True, text=True).stdout.strip()
    return d or subprocess.run(['date', '+%F'], capture_output=True, text=True).stdout.strip()

urls, avisos = [], []
for p in sorted(glob.glob('**/*.html', recursive=True)):
    if p.startswith('tareas/'):
        continue
    s = open(p, encoding='utf8').read()
    if re.search(r'<meta name="robots"[^>]*noindex', s):
        continue
    m = re.search(r'<link rel="canonical" href="([^"]+)"', s)
    if not m:
        avisos.append(p); continue
    urls.append((m.group(1), lastmod(p)))
for p in sorted(glob.glob('descargas/*.pdf')):
    urls.append((BASE + p, lastmod(p)))

home = [u for u in urls if u[0] == BASE]
urls = home + [u for u in urls if u[0] != BASE]
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
xml += [f'  <url><loc>{u}</loc><lastmod>{d}</lastmod></url>' for u, d in urls]
xml.append('</urlset>')
open('sitemap.xml', 'w', encoding='utf8').write('\n'.join(xml) + '\n')
print(len(urls), 'URL en sitemap.xml')
if avisos:
    print('Sin canonical (no incluidas):', ', '.join(avisos))
