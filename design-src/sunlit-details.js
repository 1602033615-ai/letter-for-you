(() => {
  'use strict';
  const sticker = (type, extra = '') => `<span class="personal-sticker sticker-${type} ${extra}" aria-hidden="true"><img src="assets/sunlit/personal-stickers.webp" data-letter-asset width="1536" height="1024" alt=""></span>`;
  document.getElementById('hero').insertAdjacentHTML('beforeend', `
    <p class="hero-note">写给虾虾 · 一点点偏心</p>
    <svg class="hero-flower" viewBox="0 0 80 100" aria-hidden="true"><g fill="#fff9e7" stroke="#e2ac70" stroke-width="1.3"><ellipse cx="40" cy="24" rx="10" ry="17"/><ellipse cx="40" cy="24" rx="10" ry="17" transform="rotate(60 40 40)"/><ellipse cx="40" cy="24" rx="10" ry="17" transform="rotate(120 40 40)"/><ellipse cx="40" cy="24" rx="10" ry="17" transform="rotate(180 40 40)"/><ellipse cx="40" cy="24" rx="10" ry="17" transform="rotate(240 40 40)"/><ellipse cx="40" cy="24" rx="10" ry="17" transform="rotate(300 40 40)"/></g><circle cx="40" cy="40" r="11" fill="#f1bf63"/><path d="M40 53q-5 20 4 38m-4-15q-17 2-20-12 15-3 20 12" fill="#a9c79b" stroke="#95b38a" stroke-width="2"/></svg>
    <figure class="sunlit-postcard"><img src="assets/sunlit/hero-postcard.webp" data-letter-asset width="640" height="854" fetchpriority="high" alt="秋日校园里你的背影"><figcaption>秋天和你 ♡</figcaption></figure>
    ${sticker('summer','hero-girl')}`);
  document.querySelector('.invitation-area').insertAdjacentHTML('beforeend',sticker('letter','letter-friend'));
  document.getElementById('confess').insertAdjacentHTML('afterbegin',sticker('heart','confession-friend')+sticker('pink','confession-meme'));
  document.getElementById('thoughtPanel').insertAdjacentHTML('afterbegin',sticker('pink','thought-friend'));
  document.querySelector('.result-companions').innerHTML=`<div class="result-personal">${sticker('heart')}${sticker('orange')}${sticker('letter')}</div>`;
  document.getElementById('introScreen').insertAdjacentHTML('beforeend',sticker('letter','intro-friend'));
  document.getElementById('journeyGate').insertAdjacentHTML('beforeend',sticker('orange','gate-little-friend'));
  const stage = document.getElementById('memoryStage');
  function addMemorySticker(){const collage=stage.querySelector('.memory-collage');if(collage&&!collage.querySelector('.memory-personal'))collage.insertAdjacentHTML('beforeend',sticker('scarf','memory-personal'));}
  new MutationObserver(addMemorySticker).observe(stage,{childList:true});
  addMemorySticker();
})();
