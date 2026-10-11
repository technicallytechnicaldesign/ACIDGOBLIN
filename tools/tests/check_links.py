from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import sys,re,json
ROOT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[2]
errors=[];checked=0
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[];self.ids=set()
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.add(a['id'])
        for k in ['href','src','poster','data-src']:
            if k in a:self.links.append(a[k])
def check(value,file):
    global checked
    parsed=urlsplit(value)
    if parsed.scheme or parsed.netloc or value.startswith('/') or '${' in value:return
    target=file.parent/unquote(parsed.path)
    if not parsed.path:target=file
    if target.is_dir():target=target/'index.html'
    checked+=1
    if not target.exists():errors.append(f'{file.relative_to(ROOT)}: {value}')
for file in ROOT.rglob('*.html'):
    if any(p in ['tools','.git','node_modules','_site'] for p in file.relative_to(ROOT).parts):continue
    p=Links();p.feed(file.read_text(encoding='utf8'))
    for value in p.links:check(value,file)
for file in ROOT.rglob('*.css'):
    if any(p in ['tools','.git','node_modules','_site'] for p in file.relative_to(ROOT).parts):continue
    for value in re.findall(r'url\(\s*["\']?([^\)"\']+)',file.read_text(encoding='utf8')):check(value.strip(),file)
if errors:print('\n'.join(errors));sys.exit(1)
print(f'{checked} HTML and CSS references resolve.')
