"""Build the inline story chapter from the user's original local materials."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, re, shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('D:/桌面/我们的故事')
ASSETS = ROOT / 'assets/story'
ASSETS.mkdir(parents=True, exist_ok=True)

meta = [
    ('第一次', '10.31', '初见，雨里也很近', '南开校园 · 滨江路', '虽说有些坎坷两人也有些拘束，但跟你在一块就觉得很放松很舒服。', '从一点点拘束，到舍不得说再见。', 0,
     ['第一次一起出门', '地铁里的你', '一起带走的小纪念']),
    ('第二次', '11.05', '突然出现的惊喜', '西南村 · 天工校园', '比上一次感觉轻松多了呢。', '想见你，所以提前出现在你的世界里。', 2,
     ['镜头里的小表情', '那天的聊天记录', '秋天的校园和你', '老吃家的螺蛳粉', '把影子也拍在一起']),
    ('第三次', '11.09', '把生日心意收好', '天工食堂 · 小吃街', '吃啥不重要，跟你吃才重要。', '礼物和信，都被我认真放进了心里。', 2,
     ['并排坐着的小片刻', '你准备的生日礼物', '你写给我的信']),
    ('第四次', '11.11', '那一晚，心照不宣', '球场 · 回程地铁', '很开心能得到你的理解，真的，至于表达了啥，心照不宣了哈哈哈哈。', '从一起打球，到一些藏不住的心动。', 0,
     ['球场之外，也要一起好好吃饭']),
    ('第五次', '11.12', '把温暖送到你手里', '栗子 · 暖宝宝', '你的暖宝宝真暖和，握了一路，第二天还暖着呢。', '不能替你承担的，就用陪伴慢慢抱住。', 1,
     ['带给你的投喂', '手心里的暖宝宝']),
    ('第六次', '11.14', '越来越像真实的我们', '图书馆 · 校园跑 · 艺缘中心', '我也觉得，好像不能再等太久了，有点沦陷了。', '在你身边，慢慢变成最真实的自己。', 3,
     ['一起消磨的小日常', '镜头里的我们', '偷拍认真玩头发的你', '又一次一起吃饭', '两个老吃家的快乐']),
    ('第七次', '11.16', '普通一天，也被你治愈', '西南村 · 图书馆 · 711', '我很幸运能碰到一个能包容我，让我做自己的女孩。', '见面不必每次都热闹，安心也很珍贵。', 3,
     ['在图书馆，偷偷准备这份惊喜', '夜里的校园', '中午的过桥米线', '被你教会的地锅鸡吃法']),
]

def photo(path, name, width=1440, digest=None):
    target=ASSETS/name
    if digest and target.exists():
        with Image.open(target) as cached:
            return {'src':name,'width':cached.width,'height':cached.height}
    image = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    image.thumbnail((width, width*2))
    image.save(ASSETS/name, 'WEBP', quality=84, method=6)
    # Re-encoding deliberately omits EXIF, GPS and camera metadata.
    return {'src': name, 'width': image.width, 'height': image.height}

memories=[]
manifest={}
for number, (prefix, date, title, place, quote, intro, cover, captions) in enumerate(meta,1):
    folder=next(p for p in SOURCE.iterdir() if p.name.startswith(prefix))
    media=[]
    for index, path in enumerate(sorted(folder.glob('*.jpg'))):
        digest=hashlib.sha256(path.read_bytes()).hexdigest()
        name=f'm{number}-{digest[:12]}.webp'
        item=photo(path, name, digest=digest)
        item.update(type='image', caption=captions[index])
        manifest[name]={'meeting':number,'source':path.name,'sha256':digest}
        media.append(item)
    for index, path in enumerate(sorted(folder.glob('*.mp4'))):
        name=f'm{number}-clip-{index+1}.mp4'
        shutil.copyfile(path, ASSETS/name)
        media.append({'src':name, 'type':'video', 'poster':media[0]['src'], 'caption':f'那天的小视频 · {index+1}'})
        manifest[name]={'meeting':number,'source':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    text=next(folder.glob('*.txt')).read_text(encoding='utf-8-sig').strip()
    memories.append(dict(number=number,date=date,title=title,place=place,quote=quote,intro=intro,cover=cover,text=text,media=media))

# Only remove generated meeting assets that no longer occur in the source folder.
# Content-based names also prevent stale browser/CDN images after a replacement.
asset_root=ASSETS.resolve()
for obsolete in ASSETS.glob('m[1-7]-*'):
    assert obsolete.resolve().parent==asset_root
    if obsolete.name not in manifest: obsolete.unlink()
(ROOT/'story-src/media-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

route=next(p for p in SOURCE.iterdir() if p.name.startswith('路线'))
for original,name in [
    ('c47e2942d8076ec8a29ead6f25aa8274.jpg','gate-nankai.webp'),
    ('d32007958587255cfb77f06d1b2a5e3d.png','gate-tiangong.webp'),
    ('0f24fff858f6bce6d58b3baff163a812.jpg','platform.webp'),
    ('5b6c5c263e7c59c5deae3f8914492786.jpg','route-photo.webp'),
]: photo(route/original,name)

page=ROOT/'index.html'
html=page.read_text(encoding='utf-8')
html=re.sub(r'<style id="our-journey-style">[\s\S]*?</style>\s*','',html)
html=re.sub(r'<script id="our-journey-data"[\s\S]*?</script>\s*','',html)
html=re.sub(r'<script id="our-journey-script">[\s\S]*?</script>\s*','',html)
css=(ROOT/'story-src/story.css').read_text(encoding='utf-8')
js=(ROOT/'story-src/story.js').read_text(encoding='utf-8')
html=html.replace('</head>',f'<style id="our-journey-style">\n{css}\n</style>\n</head>')
html=re.sub(r'<div id="storyContent" class="story-content">[\s\S]*?</div>\s*</section>\s*<section id="letter"',
    '<div id="storyContent" class="story-content"><noscript>请启用 JavaScript，乘上通往我们故事的列车。</noscript></div>\n</section>\n<section id="letter"',html,count=1)
data=json.dumps(memories,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
html=html.replace('</body>',f'<script id="our-journey-data" type="application/json">{data}</script>\n<script id="our-journey-script">\n{js}\n</script>\n</body>')
page.write_text(html,encoding='utf-8')
print(f'Built {len(memories)} memories, {sum(len(m["media"]) for m in memories)} photos/videos; story assets {sum(p.stat().st_size for p in ASSETS.iterdir())/1024/1024:.2f} MiB')
