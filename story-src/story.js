(() => {
  'use strict';
  const root = document.getElementById('storyContent');
  const memories = JSON.parse(document.getElementById('our-journey-data').textContent);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const assetBase = new URL('assets/story/', location.protocol === 'file:' ? 'https://1602033615-ai.github.io/letter-for-you/' : document.baseURI);
  const asset = name => new URL(name, assetBase).href;
  const escape = value => String(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  let routeStep = 0, busy = false, routeAnimation = null, routeEpoch = 0;
  let active = 0, selectedMedia = 0, returnFocus = null, priorOverflow = '', detailMemory = null, restoreMusic = false;
  root.innerHTML = `
    <div class="story-atmosphere" aria-hidden="true"><div class="story-aurora"></div>${Array.from({length:22},(_,i)=>`<i style="--left:${(i*47+9)%100}%;--top:${(i*31+5)%100}%;--delay:${i*-.9}s;--duration:${6+i%5}s">${i%5===0?'♡':i%3===0?'✧':'·'}</i>`).join('')}<span class="story-shooting-star"></span></div>
    <p class="journey-intro">有一条路线，终点是你。<br>也有七次见面，悄悄把我们连在一起。</p>
    <div id="journeyGate" class="journey-gate">
      <div class="gate-starlight" aria-hidden="true"></div><span class="gate-moon" aria-hidden="true">☾</span>
      <div class="gate-heading"><div><p class="journey-kicker">A LITTLE WAY TO YOU</p><h3>下一站，见到你</h3></div><div class="gate-ticket">FOR TWO ONLY<b>3 → 11</b></div></div>
      <div class="school-pair">
        <figure class="school-card"><span class="school-person">你在这里 ♡</span><img src="${asset('gate-tiangong.webp')}" alt="天津工业大学校门，你所在的学校" width="1206" height="679" loading="lazy"><figcaption>天津工业大学<small>大学城站 · 3 号线</small></figcaption></figure>
        <div class="school-heart" aria-hidden="true">♡</div>
        <figure class="school-card"><span class="school-person">我在这里 ♡</span><img src="${asset('gate-nankai.webp')}" alt="夜色中的南开大学校门，我所在的学校" width="1440" height="1080" loading="lazy"><figcaption>南开大学<small>南开大学八里台站 · 11 号线</small></figcaption></figure>
      </div>
      <p class="route-instruction">把<b>你的学校</b>和<b>我的学校</b>连起来，<br>就是打开回忆的专属暗号。</p>
      <div class="route-souvenir"><button type="button" id="routePhotos">看看我们坐过的这条路 ↗</button></div>
      <div class="route-board" id="routeBoard" role="group" aria-label="地铁连线小游戏，依次点亮大学城、吴家窑、南开大学八里台">
        <svg class="route-map" viewBox="0 0 800 252" preserveAspectRatio="none" aria-hidden="true">
          <path class="route-backbone" d="M100 86H250Q275 86 292 104L360 150Q380 166 400 166Q420 166 440 150L508 104Q525 86 550 86H700"/>
          <path class="route-lit blue" id="routeLine3" pathLength="1" d="M100 86H250Q275 86 292 104L360 150Q380 166 400 166"/>
          <path class="route-lit rose" id="routeLine11" pathLength="1" d="M400 166Q420 166 440 150L508 104Q525 86 550 86H700"/>
          <g class="map-dots"><circle cx="195" cy="86" r="4"/><circle cx="309" cy="115" r="4"/><circle cx="491" cy="115" r="4"/><circle cx="605" cy="86" r="4"/></g>
        </svg>
        <button type="button" class="route-stop current" data-stop="0" aria-label="从大学城站出发，乘坐三号线"><span class="stop-dot"></span><strong>大学城</strong><small>从你身边出发</small></button>
        <button type="button" class="route-stop" data-stop="1" aria-label="在吴家窑站，从三号线换乘十一号线"><span class="stop-dot"></span><strong>吴家窑</strong><small>3 号线 ⇄ 11 号线</small></button>
        <button type="button" class="route-stop" data-stop="2" aria-label="抵达南开大学八里台站"><span class="stop-dot"></span><strong>南开大学八里台</strong><small>向我的方向靠近</small></button>
        <div class="route-train" id="routeTrain" aria-hidden="true"><svg viewBox="0 0 44 36"><rect x="5" y="3" width="34" height="27" rx="8" fill="#fff9fc" stroke="#a47fb9" stroke-width="2"/><rect x="10" y="8" width="10" height="11" rx="2" fill="#b6d5e1"/><rect x="24" y="8" width="10" height="11" rx="2" fill="#cdb5de"/><path d="M12 33l3-4m17 4l-3-4M9 23h26" fill="none" stroke="#a47fb9" stroke-width="2" stroke-linecap="round"/><circle cx="13" cy="24" r="2" fill="#dbadbc"/><circle cx="31" cy="24" r="2" fill="#dbadbc"/><path d="M20 5l2-2 2 2" fill="none" stroke="#a47fb9" stroke-width="1.5"/></svg></div>
      </div>
      <div class="route-footer"><p class="route-status" id="routeStatus" role="status" aria-live="polite">轻点「大学城」，让想念出发。</p><button type="button" class="route-reset" id="routeReset">重新连线 ↺</button></div>
      <div class="gate-success" id="gateSuccess" hidden><p>连接成功。原来每一次换乘，都是为了见你。</p><button type="button" class="story-pill" id="enterMemories">检票，进入我们的故事 <span aria-hidden="true">↗</span></button></div>
      <div class="journey-sparks" id="journeySparks" aria-hidden="true"></div>
    </div>
    <div id="journeyAlbum" hidden>
      <div class="journey-pass"><div><p><span class="pass-mark" aria-hidden="true">♡</span>大学城 → 吴家窑 → 八里台</p><small>TWO PEOPLE · ONE DESTINATION</small></div><button type="button" id="replayRoute">重坐这班地铁 ↺</button></div>
      <div class="album-heading"><div><span class="journey-kicker">SEVEN TIMES, CLOSER TO YOU</span><h3>把心动，一站站收藏</h3><p>沿着时间，重温我们的七次「烩面」。</p></div><span class="album-count">01 — 07</span></div>
      <div class="memory-rail" id="memoryRail" role="tablist" aria-label="七次见面时间轴">
        ${memories.map((m,i)=>`<button class="memory-stop" type="button" role="tab" id="memoryTab${i}" data-memory="${i}" aria-controls="memoryStage" aria-selected="${i===0}" tabindex="${i===0?0:-1}"><time>${m.date}</time><span class="rail-dot" aria-hidden="true"></span><small>第${['一','二','三','四','五','六','七'][i]}次</small></button>`).join('')}
      </div>
      <article class="memory-stage" id="memoryStage" role="tabpanel" tabindex="0" aria-labelledby="memoryTab0"></article>
      <div class="memory-bottom"><p class="memory-footnote">点照片，把那一天再过一遍。</p><div class="memory-pager"><button type="button" id="previousMemory" aria-label="上一次见面">←</button><span id="memoryPage" aria-live="polite">01 / 07</span><button type="button" id="nextMemory" aria-label="下一次见面">→</button></div></div>
      <p class="journey-ending">故事刚刚开始，下一站还是我们。<span class="ending-line" aria-hidden="true"></span><a href="#letter">还有些话，写进了信里 <span aria-hidden="true">↓</span></a></p>
    </div>`;

  // The dialog is outside the chapter to avoid stacking/overflow constraints.
  document.getElementById('storyLightbox')?.remove();
  const dialog = document.createElement('dialog');
  dialog.className = 'story-lightbox'; dialog.id = 'storyLightbox';
  dialog.setAttribute('aria-labelledby','storyDetailTitle');
  dialog.innerHTML = `<div class="lightbox-top"><p id="lightboxStation"></p><button type="button" class="lightbox-close" id="closeStoryDetail" aria-label="关闭这一天的回忆">×</button></div><div class="lightbox-body"><h3 id="storyDetailTitle"></h3><p class="lightbox-meta" id="storyDetailMeta"></p><div class="story-media-view" id="storyMediaView"></div><p class="story-media-caption" id="storyMediaCaption" role="status" aria-live="polite"></p><div class="story-thumbs" id="storyThumbs" role="group" aria-label="这一天的照片与视频"></div><div class="story-original"><p class="story-original-label">那天，我写下的 · ORIGINAL DIARY</p><div id="storyOriginalText"></div></div></div>`;
  document.body.append(dialog);
  const $ = id => document.getElementById(id);
  const stops = [...root.querySelectorAll('[data-stop]')];
  const tabs = [...root.querySelectorAll('[data-memory]')];

  function setStatus(message) { $('routeStatus').textContent=message; }
  function updateStops() {
    stops.forEach((el,i)=>{el.classList.toggle('passed',i<routeStep);el.classList.toggle('current',i===routeStep);el.setAttribute('aria-pressed',String(i<routeStep));});
  }
  async function travel(segment) {
    const token=routeEpoch;
    busy=true;
    const train=$('routeTrain');
    $(segment===1?'routeLine3':'routeLine11').classList.add('on');
    const points=segment===1?
      [{left:'12.5%',top:'calc(34% - 35px)'},{left:'31.25%',top:'calc(34% - 35px)',offset:.45},{left:'50%',top:'calc(66% - 35px)'}]:
      [{left:'50%',top:'calc(66% - 35px)'},{left:'68.75%',top:'calc(34% - 35px)',offset:.55},{left:'87.5%',top:'calc(34% - 35px)'}];
    if (!reduce) {
      routeAnimation=train.animate(points,{duration:segment===1?1450:1300,easing:'ease-in-out',fill:'forwards'});
      await routeAnimation.finished.catch(()=>{});
    } else { Object.assign(train.style, points[points.length-1]); }
    if (token!==routeEpoch) return;
    busy=false; routeStep=segment+1;updateStops();
    if (segment===1) setStatus('到吴家窑啦。换乘 11 号线，点亮「南开大学八里台」。');
    else {
      setStatus('已到站：南开大学八里台。两个人的路线，连通了 ♡');
      $('gateSuccess').hidden=false;
      sparkle();
    }
  }
  function chooseStop(index) {
    if (busy) return;
    if (index!==routeStep) {
      if (routeStep===0) setStatus('先来接你呀。我们的起点是「大学城」。');
      else if (routeStep===1) setStatus('还要换乘一次：先点亮「吴家窑」，再去八里台。');
      else if (routeStep===2) setStatus('已经换好 11 号线啦，下一站点亮「南开大学八里台」。');
      return;
    }
    if (index===0) {
      routeStep=1;updateStops();$('routeTrain').classList.add('visible');
      setStatus('3 号线出发。下一步点亮「吴家窑」换乘。');
    } else travel(index);
  }
  stops.forEach((button,i)=>button.addEventListener('click',()=>chooseStop(i)));

  // Dragging between stations also connects them; tapping works on every screen.
  let dragging=false, dragOrigin=-1, suppressClick=false;
  $('routeBoard').addEventListener('pointerdown',event=>{
    const stop=event.target.closest('[data-stop]');
    if(!stop || busy || Number(stop.dataset.stop)!==routeStep) return;
    dragging=true;dragOrigin=Number(stop.dataset.stop);
  });
  $('routeBoard').addEventListener('pointerup',event=>{
    if(!dragging) return;
    dragging=false;
    const candidate=stops.find(el=>{
      const rect=el.getBoundingClientRect();
      return event.clientX>=rect.left-12&&event.clientX<=rect.right+12&&event.clientY>=rect.top-15&&event.clientY<=rect.bottom+15;
    });
    if(candidate&&Number(candidate.dataset.stop)!==dragOrigin){
      if(dragOrigin===0&&routeStep===0)chooseStop(0);
      chooseStop(Number(candidate.dataset.stop));
      suppressClick=true;
      setTimeout(()=>{suppressClick=false;},0);
    }
  });
  $('routeBoard').addEventListener('click',event=>{if(suppressClick)event.stopImmediatePropagation();},true);
  $('routeBoard').addEventListener('pointercancel',()=>{dragging=false;});
  function resetRoute() {
    routeEpoch++;routeAnimation?.cancel();routeAnimation=null;busy=false;routeStep=0;
    $('journeyGate').hidden=false;$('journeyAlbum').hidden=true;$('gateSuccess').hidden=true;
    $('routeLine3').classList.remove('on');$('routeLine11').classList.remove('on');
    $('routeTrain').classList.remove('visible');$('routeTrain').style.cssText='';
    $('journeySparks').replaceChildren();updateStops();setStatus('轻点「大学城」，让想念出发。');
    try{sessionStorage.removeItem('our-journey-connected-v1');}catch{}
  }
  function sparkle() {
    if(reduce) return;
    $('journeySparks').replaceChildren();
    for(let i=0;i<22;i++){
      const dot=document.createElement('i');dot.textContent=i%3===0?'♡':'✧';
      dot.style.setProperty('--x',`${(Math.random()-.5)*800}px`);
      dot.style.setProperty('--y',`${(Math.random()-.5)*500}px`);
      dot.style.animationDelay=`${Math.random()*.3}s`;$('journeySparks').append(dot);
    }
  }
  function enterAlbum(focus=true) {
    $('journeyGate').hidden=true;$('journeyAlbum').hidden=false;
    try{sessionStorage.setItem('our-journey-connected-v1','yes');}catch{}
    renderMemory(active);
    if(focus){
      $('journeyAlbum').scrollIntoView({behavior:reduce?'instant':'smooth',block:'start'});tabs[active].focus({preventScroll:true});
      if(!reduce){
        const arrival=document.createElement('div');arrival.className='story-arrival';arrival.setAttribute('aria-hidden','true');
        arrival.innerHTML='<div><strong>下一站：我们</strong><span>EVERY STOP LEADS TO YOU</span></div>'+Array.from({length:22},(_,i)=>`<i style="--x:${(Math.random()-.5)*1000}px;--y:${(Math.random()-.5)*800}px">${i%3?'✧':'♡'}</i>`).join('');
        document.body.append(arrival);setTimeout(()=>arrival.remove(),2100);
      }
    }
  }
  $('routeReset').addEventListener('click',resetRoute);
  $('replayRoute').addEventListener('click',()=>{resetRoute();$('journeyGate').scrollIntoView({behavior:reduce?'instant':'smooth',block:'start'});stops[0].focus({preventScroll:true});});
  $('enterMemories').addEventListener('click',()=>enterAlbum());

  function renderMemory(index) {
    active=index;
    const m=memories[index];
    tabs.forEach((el,i)=>{el.setAttribute('aria-selected',String(i===index));el.tabIndex=i===index?0:-1;});
    $('memoryRail').style.setProperty('--progress',`${index/6*100}%`);
    const primary=m.media[m.cover];
    let secondaryIndex=m.media.findIndex((item,i)=>i!==m.cover&&item.type==='image');
    if(index===1) secondaryIndex=4;
    const secondary=m.media[secondaryIndex];
    const photo=(item,which,mediaIndex,label)=>`<button type="button" class="memory-photo ${which}" data-label="${escape(label)}" data-open-media="${mediaIndex}" aria-label="查看${escape(item.caption)}${item.type==='video'?'，视频':''}"><span class="photo-wrap"><img src="${asset(item.type==='video'?item.poster:item.src)}" width="${item.width||1280}" height="${item.height||960}" alt="${escape(item.caption)}" decoding="async"></span></button>`;
    $('memoryStage').classList.remove('memory-enter');
    $('memoryStage').setAttribute('aria-labelledby',`memoryTab${index}`);
    $('memoryStage').innerHTML=`<div class="memory-constellation" aria-hidden="true"><svg viewBox="0 0 220 150"><path d="M15 115L55 60 98 90 150 25 200 70"/><circle cx="15" cy="115" r="2"/><circle cx="55" cy="60" r="3"/><circle cx="98" cy="90" r="2"/><circle cx="150" cy="25" r="4"/><circle cx="200" cy="70" r="2"/></svg></div><div class="memory-collage"><span class="memory-tape" aria-hidden="true"></span><span class="memory-twinkle" aria-hidden="true">✧</span>${photo(primary,'primary',m.cover,`见面第 ${String(index+1).padStart(2,'0')} 次 · ${m.date}`)}${secondary?photo(secondary,'secondary',secondaryIndex,secondary.caption):`<button type="button" class="memory-photo secondary" data-label="把那一天再播放一次" data-open-media="1" aria-label="播放第四次见面的小视频"><span class="photo-wrap"><img src="${asset(m.media[0].src)}" width="1280" height="960" alt="那天的小视频预览"><span class="story-video-label">▷ 那天的小视频</span></span></button>`}<span class="memory-handwritten" aria-hidden="true">a little closer to you ♡</span></div><div class="memory-copy"><p class="memory-date">MEETING ${String(m.number).padStart(2,'0')} &nbsp; / &nbsp; ${m.date}</p><h4>${escape(m.title)}</h4><p class="memory-place">${escape(m.place)}</p><blockquote class="memory-quote">“${escape(m.quote)}”</blockquote><p class="memory-intro">${escape(m.intro)}</p><button type="button" class="memory-open" id="openMemory">翻开这一天 <span aria-hidden="true">↗</span></button></div>`;
    // Replacing the content triggers the entry animation without layout reads.
    requestAnimationFrame(()=>$('memoryStage').classList.add('memory-enter'));
    $('memoryPage').textContent=`${String(index+1).padStart(2,'0')} / 07`;
    $('previousMemory').disabled=index===0;$('nextMemory').disabled=index===6;
    $('memoryStage').querySelectorAll('[data-open-media]').forEach(el=>el.addEventListener('click',()=>openDetail(Number(el.dataset.openMedia),el)));
    $('openMemory').addEventListener('click',event=>openDetail(0,event.currentTarget));
  }
  tabs.forEach((el,i)=>el.addEventListener('click',()=>renderMemory(i)));
  $('memoryRail').addEventListener('keydown',event=>{
    let next=active;
    if(event.key==='ArrowRight')next=Math.min(6,active+1);
    else if(event.key==='ArrowLeft')next=Math.max(0,active-1);
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=6;
    else return;
    event.preventDefault();renderMemory(next);tabs[next].focus();
  });
  $('previousMemory').addEventListener('click',()=>renderMemory(Math.max(0,active-1)));
  $('nextMemory').addEventListener('click',()=>renderMemory(Math.min(6,active+1)));

  function paragraphText(text) {
    const sentences=text.match(/[^。！？]+[。！？]?/g)||[text];
    const paragraphs=[];let part='';
    sentences.forEach(sentence=>{part+=sentence;if(part.length>=120){paragraphs.push(part);part='';}});
    if(part)paragraphs.push(part);
    return paragraphs.map(p=>`<p>${escape(p)}</p>`).join('');
  }
  function openDetail(index,trigger,route=false) {
    const m=route?{number:0,date:'3 号线 → 11 号线',title:'有一条路线，终点是你',place:'大学城 · 吴家窑 · 南开大学八里台',text:'你在天津工业大学，我在南开大学。\n从大学城坐上 3 号线，在吴家窑换乘 11 号线，到南开大学八里台。\n两所学校，两个人，一条想见你的路。',media:[{type:'image',src:'platform.webp',caption:'一起经过的地铁站台',width:1440,height:1080},{type:'image',src:'route-photo.webp',caption:'熟悉的 3 号线，通向彼此的方向',width:1440,height:1080},{type:'image',src:'gate-tiangong.webp',caption:'你在天津工业大学',width:1206,height:679},{type:'image',src:'gate-nankai.webp',caption:'我在南开大学',width:1440,height:1080}]}:memories[active];
    detailMemory=m;returnFocus=trigger;
    $('lightboxStation').textContent=route?'OUR ROUTE · 想见你的路线':`OUR STORY · 第 ${m.number} 次「烩面」`;
    dialog.querySelector('.story-original-label').textContent=route?'两所学校 · 一条想见你的路':'那天，我写下的 · ORIGINAL DIARY';
    $('storyDetailTitle').textContent=m.title;
    $('storyDetailMeta').textContent=`${m.date}  ·  ${m.place}`;
    $('storyOriginalText').innerHTML=paragraphText(m.text);
    $('storyThumbs').innerHTML=m.media.map((item,i)=>`<button type="button" class="story-thumb" data-media="${i}" aria-label="${item.type==='video'?'视频':'照片'} ${i+1}：${escape(item.caption)}" aria-pressed="false"><img src="${asset(item.type==='video'?item.poster:item.src)}" alt="" width="57" height="63" loading="lazy">${item.type==='video'?'<span class="thumb-play" aria-hidden="true">▷</span>':''}</button>`).join('');
    $('storyThumbs').querySelectorAll('[data-media]').forEach(el=>el.addEventListener('click',()=>showMedia(Number(el.dataset.media))));
    showMedia(index);priorOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    dialog.showModal();dialog.scrollTop=0;$('closeStoryDetail').focus({preventScroll:true});
  }
  function stopVideo() {
    const video=$('storyMediaView').querySelector('video');
    if(video){video.pause();video.removeAttribute('src');video.load();}
  }
  function showMedia(index) {
    stopVideo();selectedMedia=index;
    const m=detailMemory||memories[active],item=m.media[index],view=$('storyMediaView');
    const arrows=`<button type="button" class="media-arrow prev" aria-label="上一张照片或视频" ${index===0?'disabled':''}>‹</button><button type="button" class="media-arrow next" aria-label="下一张照片或视频" ${index===m.media.length-1?'disabled':''}>›</button>`;
    view.innerHTML=(item.type==='video'?`<video controls playsinline preload="metadata" poster="${asset(item.poster)}" src="${asset(item.src)}" aria-label="${escape(item.caption)}"></video>`:`<img src="${asset(item.src)}" alt="${escape(item.caption)}" width="${item.width}" height="${item.height}" decoding="async">`)+arrows;
    view.querySelector('.prev').addEventListener('click',()=>showMedia(Math.max(0,selectedMedia-1)));
    view.querySelector('.next').addEventListener('click',()=>showMedia(Math.min(m.media.length-1,selectedMedia+1)));
    view.querySelector(item.type==='video'?'video':'img').addEventListener('error',()=>{
      const note=document.createElement('p');note.className='story-media-error';note.innerHTML=`这段回忆暂时没能加载，<a href="${asset(item.src)}" target="_blank" rel="noopener">点这里单独打开 ↗</a>`;view.replaceChildren(note);
    },{once:true});
    if(item.type==='video'){
      const video=view.querySelector('video'),music=$('backgroundMusic');
      video.addEventListener('play',()=>{if(music&&!music.paused){restoreMusic=true;music.pause();}});
      video.addEventListener('pause',()=>{if(restoreMusic&&music){restoreMusic=false;music.play().catch(()=>{});}});
    }
    $('storyMediaCaption').textContent=`${item.caption}  ·  ${index+1} / ${m.media.length}`;
    $('storyThumbs').querySelectorAll('[data-media]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.media)===index)));
  }
  function closeDetail(){if(dialog.open)dialog.close();}
  $('closeStoryDetail').addEventListener('click',closeDetail);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDetail();}});
  dialog.addEventListener('close',()=>{stopVideo();document.body.style.overflow=priorOverflow;returnFocus?.focus({preventScroll:true});});
  dialog.addEventListener('keydown',event=>{
    // Preserve native video controls and their keyboard shortcuts.
    if(event.target.tagName==='VIDEO')return;
    if(event.key==='ArrowRight'&&selectedMedia<(detailMemory||memories[active]).media.length-1){event.preventDefault();showMedia(selectedMedia+1);}
    if(event.key==='ArrowLeft'&&selectedMedia>0){event.preventDefault();showMedia(selectedMedia-1);}
  });
  window.addEventListener('pagehide',()=>{stopVideo();});
  $('routePhotos').addEventListener('click',event=>openDetail(0,event.currentTarget,true));
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{document.body.classList.toggle('viewing-story',entries[0].isIntersecting);},{threshold:.1}).observe(document.getElementById('story'));
  try{if(sessionStorage.getItem('our-journey-connected-v1')==='yes')enterAlbum(false);}catch{}
})();
