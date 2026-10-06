"""Check the Town's script, asset and journey contracts without a browser."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,subprocess,itertools
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.scripts=[];self.current=None
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if 'id' in attrs:self.ids.append(attrs['id'])
        if tag=='script':self.current={'attrs':attrs,'body':''};self.scripts.append(self.current)
    def handle_data(self,data):
        if self.current is not None:self.current['body']+=data
    def handle_endtag(self,tag):
        if tag=='script':self.current=None
def main():
    scripts=[];count=0
    pages=[ROOT/'index.html',*(ROOT/p/'index.html' for p in ['bookshop','newsstand','tarot','rummage-yard','gossip-well','mushroom-post-office','free-chaos-merch','wavy-days-issue-01','not-my-fucking-fire-zine'])]
    tripper=ROOT.parent/'LOCAL_ACIDGOBLIN-TRIPPER'/'index.html'
    if tripper.exists():pages.append(tripper)
    for path in pages:
        p=Page();p.feed(path.read_text(encoding='utf-8'))
        assert len(p.ids)==len(set(p.ids)),f'Duplicate element IDs: {path}'
        if path==tripper:assert 'Town pathways' in path.read_text(encoding='utf-8')
        else:assert 'town-journey.js' in path.read_text(encoding='utf-8')
        for script in p.scripts:
            src=script['attrs'].get('src')
            if src:
                if not src.startswith(('http:','https:','data:')):
                    asset=(path.parent/src.split('?')[0]).resolve()
                    assert asset.exists(),f'Missing script {src} in {path}'
            elif script['body'].strip():scripts.append({'name':str(path.relative_to(ROOT.parent)),'body':script['body']})
        count+=1
    for path in ROOT.rglob('*.js'):
        if path.name=='bg-data.js':continue
        scripts.append({'name':str(path.relative_to(ROOT)),'body':path.read_text(encoding='utf-8')})
    runner="const vm=require('node:vm'),fs=require('node:fs');const all=JSON.parse(fs.readFileSync(0,'utf8'));for(const s of all)new vm.Script(s.body,{filename:s.name});console.log('Compiled '+all.length+' scripts');"
    subprocess.run(['node','-e',runner],input=json.dumps(scripts),text=True,check=True)
    for name in ['town-journey.css','town-arrival.css']:
        css=(ROOT/name).read_text(encoding='utf-8')
        for match in re.findall(r'url\(["\']?([^)"\']+)',css):
            if not match.startswith(('http','data:','#')):assert (ROOT/match).exists(),match
    yard=(ROOT/'rummage-yard/yard.js').read_text(encoding='utf-8')
    recipes=re.findall(r"'([0-7],[0-7])\|([^|]+)\|([^|]+)\|([^|]+)\|",yard)
    keepsakes=(ROOT/'mushroom-post-office/keepsakes.js').read_text(encoding='utf-8')
    items=json.loads(keepsakes[keepsakes.index('['):keepsakes.rfind(']')+1])
    assert len(recipes)==len(items)==28
    assert {tuple(map(int,pair.split(','))) for pair,*_ in recipes}==set(itertools.combinations(range(8),2))
    for (pair,name,line,opinion),item in zip(recipes,items):
        assert [int(i) for i in pair.split(',')]==item['pair']
        assert (name,line,opinion)==(item['name'],item['line'],item['opinion']),name
    state_runner=r"""
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[1],'utf8'),prefix=source.slice(0,source.indexOf('const destinations='))+'\n})();';
function boot(seed,blocked=false){let written=null;const win={dispatchEvent(){}};
const ctx={window:win,document:{currentScript:{src:'https://example.org/ACIDGOBLIN/town-journey.js'},body:{dataset:{townPlace:'town'}}},location:{search:''},URL,URLSearchParams,Event,
 localStorage:{getItem(){if(blocked)throw new Error('blocked');return seed;},setItem(k,v){if(blocked)throw new Error('blocked');written=JSON.parse(v);}}};
vm.runInNewContext(prefix,ctx);return {api:win.TownJourney,last:()=>written};}
let t=boot('{broken');assert.equal(t.api.has('star'),false);t.api.hear('star');assert.deepEqual(t.last().heard,['star']);
t=boot(JSON.stringify({found:['mushroom','__proto__',false],heard:[null,'bookmark'],inventions:[0,27,28,-1,'1'],reading:{summary:5,card:'x'}}));
assert.equal(t.api.has('mushroom'),true);assert.equal(t.api.has('__proto__'),false);assert.equal(t.api.reading(),null);
t.api.keepInvention(2,'Lockpick for Lunch');assert.deepEqual(t.last().inventions,[0,27,2]);assert.equal(t.last().inventionNames['2'],'Lockpick for Lunch');
const before=JSON.stringify(t.last());t.api.keepInvention(99,'invalid');assert.equal(JSON.stringify(t.last()),before);t.api.hear('__proto__');assert.equal(JSON.stringify(t.last()),before);
t.api.keepReading({summary:'One small useful nudge.',card:'The Melting Magician'});assert.equal(t.api.reading().card,'The Melting Magician');
t=boot(null,true);t.api.hear('star');t.api.keepInvention(1,'Supper Alarm');assert.equal(t.last(),null);
assert.match(t.api.url('mushroom-post-office/?invention=1'),/^https:\/\/example.org\/ACIDGOBLIN\//);
console.log('Journey state: malformed and blocked storage, rejected IDs, labels, reading and base URLs passed');
"""
    subprocess.run(['node','-e',state_runner,str(ROOT/'town-journey.js')],check=True)
    print(f'{count} pages: unique IDs and script references passed')
    print('All 28 inventions retain the same pair, name and story on the postcard')
    print('All new stylesheet artwork references resolve')
if __name__=='__main__':main()
