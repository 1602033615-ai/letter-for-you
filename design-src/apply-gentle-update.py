"""Apply the four requested copy fixes and embed the lightweight motion layer."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
page = ROOT / 'index.html'
html = page.read_text(encoding='utf-8')
match = re.search(r'(<script id="our-journey-data" type="application/json">)([\s\S]*?)(</script>)', html)
memories = json.loads(match.group(2))
captions = {
    'm6-9844f2fda52e.webp': '偷拍被四坤折磨的你',
    'm6-82083d71ae69.webp': '偷偷记录认真玩头发的你',
    'm1-7c45c45fd74f.webp': '地铁站里的你',
}
for memory in memories:
    for media in memory['media']:
        if media['src'] in captions:
            media['caption'] = captions[media['src']]
    if memory['number'] == 7:
        memory['text'] = memory['text'].replace('因为今天问我确实有点人机', '因为今天的我真的有点人机')
data = json.dumps(memories, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
html = html[:match.start(2)] + data + html[match.end(2):]
js = (ROOT / 'story-src/story.js').read_text(encoding='utf-8')
html = re.sub(r'(<script id="our-journey-script">)[\s\S]*?(</script>)', lambda m: m.group(1)+'\n'+js+'\n'+m.group(2), html)
for kind, name in [('style', 'gentle-motion-style'), ('script', 'gentle-motion-script')]:
    html = re.sub(fr'<{kind} id="{name}">[\s\S]*?</{kind}>\s*', '', html)
css = (ROOT / 'design-src/gentle-motion.css').read_text(encoding='utf-8')
motion = (ROOT / 'design-src/gentle-motion.js').read_text(encoding='utf-8')
html = html.replace('</head>', f'<style id="gentle-motion-style">\n{css}\n</style>\n</head>')
html = html.replace('</body>', f'<script id="gentle-motion-script">\n{motion}\n</script>\n</body>')
page.write_text(html, encoding='utf-8', newline='\n')
print('Updated three captions, one sentence, and gentle page/photo motion.')
