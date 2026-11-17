"""Apply the shared paper/ink visual design without rewriting the site's copy."""
from pathlib import Path
import hashlib,re

ROOT=Path(__file__).resolve().parents[1]
page=ROOT/'index.html'
html=page.read_text(encoding='utf-8')
css=(ROOT/'design-src/paper-rose.css').read_text(encoding='utf-8')
html=re.sub(r'<style id="paper-rose-style">[\s\S]*?</style>\s*','',html)
html=html.replace('</head>',f'<style id="paper-rose-style">\n{css}\n</style>\n</head>')

# Native vector art reuses the letter's botanical motif, as ink on paper.
if 'class="confess-botanical' not in html:
    html=html.replace('<section id="confess" class="confession">','''<section id="confess" class="confession">
  <div class="confess-botanical left" aria-hidden="true"><img src="assets/ink-rose.svg" data-letter-asset width="220" height="370" alt=""></div>
  <div class="confess-botanical right" aria-hidden="true"><img src="assets/ink-rose.svg" data-letter-asset width="220" height="370" alt=""></div>''')

# Keep both answers in place. The existing words and confirmation paths remain.
start=html.index("  $('noBtn').addEventListener('click',()=>{")
end=html.index("  document.querySelectorAll('header nav a').forEach",start)
html=html[:start]+'''  $('noBtn').addEventListener('click',()=>{
    rejectCount++;
    resetRejectPosition();
    $('answerFeedback').textContent='好呀，慢慢想。';
    $('thoughtPanel').hidden=false;
  });
'''+html[end:]

# Remove perpetual screen-wide hearts; the intended celebrations stay available.
if "  document.querySelectorAll('.ambient-romance').forEach" in html:
    start=html.index("  document.querySelectorAll('.ambient-romance').forEach")
    end=html.index("  document.querySelector('.starfield').replaceChildren();",start)
    html=html[:start]+"  // The paper-and-ink design keeps ambient decoration within each chapter.\n"+html[end:]
html=html.replace("  document.addEventListener('click',e=>{if(!e.target.closest('button,input,textarea,a,dialog'))hearts(e.clientX,e.clientY,1);});",'')
html=html.replace("const colors = ['#c16fe3', '#ff82b0', '#f4c75e', '#aa88f0', '#68cace'];","const colors = ['#b36d87', '#e3b3b7', '#d5b47c', '#b59bb8', '#f1d9b3'];")
html=html.replace('<meta name="theme-color" content="#b8a0ca">','<meta name="theme-color" content="#684555">')
font_hash=hashlib.sha256((ROOT/'assets/letter-hand.woff2').read_bytes()).hexdigest()[:10]
html=re.sub(r'letter-hand\.woff2\?v=[^\x27\x22]+',f'letter-hand.woff2?v={font_hash}',html)
page.write_text(html,encoding='utf-8',newline='\n')
print('Applied shared paper-and-ink design; existing page wording preserved.')
