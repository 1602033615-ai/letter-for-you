(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('#hero,#story,#letter,#confess')];
  const reveals = new Set();
  const revealAnimations = new Set();
  let sectionObserver, revealObserver, active = false;
  const ready = () => !document.hidden && !document.body.classList.contains('intro-active') && !document.querySelector('dialog[open]');

  function reveal(element) {
    if (!active || !ready() || reveals.has(element) || !element.animate) return;
    reveals.add(element);
    revealObserver?.unobserve(element);
    const animation = element.animate(
      [{opacity:0,translate:'0 16px'},{opacity:1,translate:'0 0'}],
      {duration:700,easing:'cubic-bezier(.2,.7,.2,1)'}
    );
    revealAnimations.add(animation);
    animation.finished.catch(() => {}).finally(() => revealAnimations.delete(animation));
  }
  function sync() {
    const paused = !ready();
    if (document.body.classList.contains('gentle-paused') !== paused) document.body.classList.toggle('gentle-paused', paused);
    if (active && ready()) {
      document.querySelectorAll('[data-gentle-reveal]').forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.height && rect.top < innerHeight * .95 && rect.bottom > 0) reveal(element);
      });
    }
  }
  function start() {
    if (active || preference.matches) return;
    active = true;
    if ('IntersectionObserver' in window) {
      sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        entry.target.classList.toggle('motion-visible',entry.isIntersecting);
      }), {threshold:0});
      revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      }), {threshold:.08});
    }
    sections.forEach((section,chapter) => {
      section.classList.add('gentle-section');
      const atmosphere = document.createElement('div');
      atmosphere.className = 'gentle-atmosphere';
      atmosphere.setAttribute('aria-hidden','true');
      for (let i=0;i<10;i++) {
        const particle = document.createElement('i');
        particle.style.cssText = `--x:${6+(i*31+chapter*13)%88}%;--y:${12+(i*19+chapter*7)%76}%;--delay:${-i*2.3}s;--duration:${11+i%4*3}s;--drift:${i%2 ? 16 : -16}px`;
        if (i%3===2) particle.textContent = i%2 ? '♡' : '✧';
        atmosphere.append(particle);
      }
      section.prepend(atmosphere);
      if (sectionObserver) sectionObserver.observe(section);
      else section.classList.add('motion-visible');
    });
    document.querySelectorAll('.hero-inner,.chapter-heading,.journey-intro,.journey-gate,.cover-copy,.invitation-area,#confess>h2,.confess-subtitle,.poetry-ribbon,.mood').forEach(element => {
      element.dataset.gentleReveal = '';
      if (!reveals.has(element)) revealObserver?.observe(element);
    });
    sync();
  }
  function stop() {
    active = false;
    sectionObserver?.disconnect();
    revealObserver?.disconnect();
    revealAnimations.forEach(animation => animation.cancel());
    document.querySelectorAll('.gentle-atmosphere').forEach(element => element.remove());
    sections.forEach(section => section.classList.remove('gentle-section','motion-visible'));
    document.body.classList.remove('gentle-paused');
  }
  const bodyObserver = new MutationObserver(sync);
  bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  document.querySelectorAll('dialog').forEach(dialog => bodyObserver.observe(dialog,{attributes:true,attributeFilter:['open']}));
  document.addEventListener('visibilitychange',sync);
  preference.addEventListener('change',() => preference.matches ? stop() : start());
  start();
})();
