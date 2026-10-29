/* DarkPhilosophy portfolio — vanilla JS, no framework or analytics. */
(() => {
  'use strict';
  const $ = (selector, base = document) => base.querySelector(selector);
  const $$ = (selector, base = document) => [...base.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // Accessible in-page navigation and scroll reveals.
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const io = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
      }
    }, { threshold: 0.09, rootMargin: '0px 0px -20px 0px' });
    reveals.forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 45}ms`; io.observe(el); });
  } else reveals.forEach(el => el.classList.add('is-visible'));

  const progress = $('#reading-progress');
  let scrollScheduled = false;
  function updateScroll() {
    const limit = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (progress) progress.style.width = `${clamp(scrollY / limit * 100, 0, 100)}%`;
    scrollScheduled = false;
  }
  addEventListener('scroll', () => {
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();

  const sections = ['work','worlds','principles','sites'].map(id => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('[data-nav]').forEach(a => a.classList.toggle('is-active', a.dataset.nav === entry.target.id));
      }
    }), { rootMargin: '-25% 0px -60% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }
  const menuButton = $('#menu-toggle'), mobileNav = $('#mobile-nav');
  const closeMobile = () => { if (!menuButton || !mobileNav) return; mobileNav.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); };
  menuButton?.addEventListener('click', () => {
    mobileNav.hidden = !mobileNav.hidden;
    menuButton.setAttribute('aria-expanded', String(!mobileNav.hidden));
  });
  $$('.mobile-nav a').forEach(a => a.addEventListener('click', closeMobile));

  // Project tags filter. Cards remain in the DOM; no third-party data required.
  const filters = $$('[data-filter]'), cards = $$('.project-card[data-category]');
  function filterProjects(category) {
    for (const button of filters) {
      const active = button.dataset.filter === category;
      button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active));
    }
    for (const card of cards) card.hidden = !(category === 'all' || card.dataset.category.split(' ').includes(category));
  }
  filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));

  // Timehacker: a visual concept interaction, not a claim about real in-game mechanics.
  const scene = $('#timehacker-scene'), rewindButton = $('#rewind-button');
  let rewindState = 0;
  function rewind() {
    if (!scene) return;
    rewindState = (rewindState + 1) % 3;
    scene.classList.toggle('rewound', rewindState !== 0);
    const timeText = ['00:00:12', '00:00:00', '23:59:48'];
    const stateText = ['PRESENT / ANCHOR LOCKED', 'REWIND / −12 SECONDS', 'TIMELINE / −24 SECONDS'];
    $('#time-index').textContent = timeText[rewindState];
    $('#time-state').textContent = stateText[rewindState];
    rewindButton.lastChild && (rewindButton.title = rewindState === 2 ? 'Return to present' : 'Rewind again');
  }
  rewindButton?.addEventListener('click', rewind);

  // Peersus is an interaction-only prototype. This sends no files, keys or data.
  const peersusButton = $('#peersus-trigger');
  const peersusDemo = $('.peersus-demo');
  const peersusStatus = $('#peersus-status');
  let peersusTimer;
  peersusButton?.addEventListener('click', () => {
    if (!peersusDemo || !peersusStatus) return;
    clearTimeout(peersusTimer);
    peersusDemo.classList.remove('is-complete','is-running');
    void peersusDemo.offsetWidth;
    peersusDemo.classList.add('is-running');
    peersusButton.disabled = true;
    peersusStatus.textContent = 'SIMULATING LOCAL VISUAL HANDOFF';
    peersusTimer = setTimeout(() => {
      peersusDemo.classList.remove('is-running');
      peersusDemo.classList.add('is-complete');
      peersusStatus.textContent = 'DEMO COMPLETE — NO FILES SENT';
      peersusButton.disabled = false;
    }, reducedMotion ? 80 : 1350);
  });

  // Command palette: Ctrl+K and Cmd+K; real keyboard navigation, real destinations.
  const dialog = $('#command-dialog'), input = $('#command-input'), resultPane = $('#command-results');
  const commands = [
    { label: 'Selected work', subtitle: 'Browse public engineering projects', icon: '↗', href: '#work' },
    { label: 'In the lab', subtitle: 'Attyx, Heresia & Peersus', icon: '⌘', href: '#lab' },
    { label: 'Peersus', subtitle: 'P2P file sharing, pairing and clipboard sync / concept', icon: '◈', href: '#peersus-heading' },
    { label: 'Game worlds', subtitle: 'Timehacker & Project Pandorium', icon: '◈', href: '#worlds' },
    { label: 'Timehacker — rewind', subtitle: 'Run the visual time-warp interaction', icon: '⟲', action: rewind, href: '#worlds' },
    { label: 'Engineering method', subtitle: 'Observe → Engineer → Evolve', icon: '⌁', href: '#principles' },
    { label: 'About Alex', subtitle: 'System Architect & game creator', icon: '◌', href: '#about' },
    { label: 'Collaborate', subtitle: 'Contact & external links', icon: '✳', href: '#contact' },
    { label: 'GitHub profile', subtitle: 'github.com/DarkPhilosophy', icon: '↗', href: 'https://github.com/DarkPhilosophy', external: true },
    { label: 'Independent websites', subtitle: 'AXXA.dev, poo.wang & isy.ro', icon: '⌁', href: '#sites' },
    { label: 'AXXA.DEV', subtitle: 'Independent engineering', icon: '↗', href: 'https://axxa.dev', external: true },
    { label: 'poo.wang', subtitle: 'Playful side project', icon: '↗', href: 'https://poo.wang', external: true },
    { label: 'isy.ro', subtitle: 'Independent web build', icon: '↗', href: 'https://isy.ro', external: true }
  ];
  let currentCommands = commands, selected = 0;
  function selectRow(index) {
    const rows = $$('.command-row', resultPane);
    if (!rows.length) return;
    selected = (index + rows.length) % rows.length;
    rows.forEach((row, i) => {
      row.classList.toggle('is-selected', i === selected);
      row.setAttribute('aria-selected', String(i === selected));
    });
    rows[selected].scrollIntoView({ block: 'nearest' });
  }
  function runCommand(index) {
    const command = currentCommands[index];
    if (!command) return;
    dialog?.close();
    if (command.href?.startsWith('#')) {
      document.querySelector(command.href)?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
    }
    if (command.action) command.action();
    else if (command.external) window.open(command.href, '_blank', 'noopener,noreferrer');
  }
  function renderCommands(term = '') {
    const needle = term.toLowerCase().trim();
    currentCommands = commands.filter(c => `${c.label} ${c.subtitle}`.toLowerCase().includes(needle));
    selected = 0;
    resultPane.replaceChildren();
    if (!currentCommands.length) { const empty = document.createElement('div'); empty.className='command-empty'; empty.textContent='No matching command.'; resultPane.append(empty); return; }
    currentCommands.forEach((c, i) => {
      const row = document.createElement('button'); row.type='button'; row.className=`command-row${i===0?' is-selected':''}`; row.setAttribute('role','option'); row.setAttribute('aria-selected', String(i===0));
      const icon = document.createElement('span'); icon.className='command-row-icon'; icon.textContent = c.icon;
      const label = document.createElement('span'); label.textContent=c.label;
      const desc = document.createElement('span'); desc.className='command-row-desc'; desc.textContent=c.subtitle;
      row.append(icon,label,desc); row.addEventListener('click',() => runCommand(i));
      row.addEventListener('mousemove',() => { if (selected !== i) selectRow(i); });
      resultPane.append(row);
    });
  }
  function openCommand() {
    if (!dialog || !dialog.showModal) return;
    if (dialog.open) return;
    renderCommands(); input.value=''; dialog.showModal(); input.focus();
  }
  $$('[data-open-command]').forEach(button => button.addEventListener('click', openCommand));
  $('#command-close')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  input?.addEventListener('input', () => renderCommands(input.value));
  input?.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); selectRow(selected + (e.key==='ArrowDown'?1:-1)); }
    if (e.key === 'Enter') { e.preventDefault(); runCommand(selected); }
  });
  addEventListener('keydown', e => {
    const editable = e.target.matches?.('input,textarea,[contenteditable]');
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dialog?.open ? dialog.close() : openCommand(); }
    if (!editable && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'r' && !dialog?.open) {
      const rect = scene?.getBoundingClientRect();
      if (rect && rect.top < innerHeight && rect.bottom > 0) rewind();
    }
  });

  // Accurate Romanian civil time (EET/EEST changes automatically).
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bucharest', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23' });
  function updateClock() {
    const now = new Date(); const time = formatter.format(now);
    const abbr = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bucharest', timeZoneName:'short' }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || 'RO';
    $('#system-time').textContent = `${time} ${abbr}`;
    $('#footer-time').textContent = `${time.slice(0,5)} RO`;
    $('#footer-year').textContent = String(now.getFullYear());
  }
  updateClock(); setInterval(updateClock, 10_000);

  // Optional, actual GitHub API data. Never generate fake social proof.
  async function loadGitHub() {
    const status = $('#api-status'), controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    try {
      const headers = { 'Accept': 'application/vnd.github+json' };
      const [profileRes, reposRes] = await Promise.all([
        fetch('https://api.github.com/users/DarkPhilosophy', { signal:controller.signal, headers }),
        fetch('https://api.github.com/users/DarkPhilosophy/repos?per_page=100&type=owner', { signal:controller.signal, headers })
      ]);
      if (!profileRes.ok || !reposRes.ok) throw new Error('GitHub API unavailable');
      const [profile, repos] = await Promise.all([profileRes.json(), reposRes.json()]);
      if (!Array.isArray(repos)) throw new Error('Unusable API data');
      $('#metric-repos').textContent = String(profile.public_repos ?? '—');
      $('#metric-followers').textContent = String(profile.followers ?? '—');
      $('#metric-stars').textContent = String(repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0));
      for (const star of $$('[data-stars]')) {
        const repo = repos.find(r => r.name.toLowerCase() === star.dataset.stars.toLowerCase());
        if (!repo) continue;
        $('span', star).textContent = String(repo.stargazers_count ?? 0); star.hidden = false;
      }
      status.textContent = '● LIVE DATA'; status.classList.remove('is-error');
    } catch {
      status.textContent = 'API UNAVAILABLE'; status.classList.add('is-error');
      // Dashes already make absence of verified metrics explicit.
    } finally { clearTimeout(timeout); }
  }
  loadGitHub();

  // Efficient, high-DPI orbit renderer. Limited to 30 fps, paused when out of view/hidden.
  const canvas = $('#system-canvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d', { alpha:true });
  if (!ctx) return;
  let width=700, height=700, dpr=1, active=true, last=0, elapsed=0;
  let pointer = {x:0,y:0}, smoothPointer={x:0,y:0};
  function resize() {
    const rect=canvas.getBoundingClientRect();
    width=Math.max(100,rect.width);height=Math.max(100,rect.height);
    dpr=Math.min(devicePixelRatio || 1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if (reducedMotion) draw(0);
  }
  resize();
  new ResizeObserver(resize).observe(canvas);
  const orbit = canvas.parentElement;
  orbit?.addEventListener('pointermove', e => {
    const r = orbit.getBoundingClientRect();
    pointer.x = ((e.clientX-r.left)/r.width - .5)*2;
    pointer.y = ((e.clientY-r.top)/r.height - .5)*2;
  });
  orbit?.addEventListener('pointerleave', () => { pointer.x=0;pointer.y=0; });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { active=es.some(e=>e.isIntersecting); },{threshold:.01}).observe(canvas);
  function draw(t) {
    ctx.clearRect(0,0,width,height);
    const size=Math.min(width,height), cx=width/2 + smoothPointer.x*size*.023, cy=height/2 + smoothPointer.y*size*.023;
    const s=size/700;
    ctx.save(); ctx.translate(cx,cy); ctx.scale(s,s);
    const breathe=1+Math.sin(t*.0007)*.017;
    // Graduated circular technical rings.
    for (let ring=0;ring<7;ring++) {
      const radius=(105+ring*33)*breathe;
      ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);
      ctx.strokeStyle=ring%2===0?'rgba(190,238,155,.22)':'rgba(128,176,130,.085)';
      ctx.lineWidth=ring%2===0?1:.6;ctx.stroke();
    }
    // Three tilted satellite paths and their signal nodes.
    const orbits=[{rad:244,flatten:.43,speed:.0002,rot:.30}, {rad:218,flatten:.72,speed:-.00014,rot:-.47}, {rad:175,flatten:.27,speed:.00036,rot:1.04}];
    for (let j=0;j<orbits.length;j++) {
      const o=orbits[j], angle=t*o.speed+o.rot;
      ctx.save();ctx.rotate(o.rot);
      ctx.beginPath();ctx.ellipse(0,0,o.rad,o.rad*o.flatten,0,0,Math.PI*2);
      ctx.strokeStyle=j===0?'rgba(203,244,147,.52)':'rgba(178,224,153,.28)';ctx.lineWidth=j===0?1.6:1;ctx.stroke();
      for (let i=0;i<2;i++) {
        const a=angle + i*Math.PI;
        const x=Math.cos(a)*o.rad, y=Math.sin(a)*o.rad*o.flatten;
        ctx.beginPath();ctx.arc(x,y,i===0?5.3:3.2,0,Math.PI*2);
        ctx.fillStyle=i===0?'#dcff96':'#6ca077';ctx.shadowColor='#c5fa87';ctx.shadowBlur=i===0?23:8;ctx.fill();ctx.shadowBlur=0;
        if (i===0) {ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.strokeStyle='#b9eda58a';ctx.stroke();}
      }
      ctx.restore();
    }
    // Low-cost segmented angular ruler.
    ctx.rotate(t*.000025);
    for(let i=0;i<96;i++){
      const a=(i/96)*Math.PI*2;
      const inner=i%8===0?275:289, outer=298;
      ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);
      ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);
      ctx.strokeStyle=i%8===0?'rgba(203,244,147,.7)':'rgba(203,244,147,.17)';ctx.lineWidth=i%8===0?1.5:1;ctx.stroke();
    }
    // Sparse deterministic data points, no flashing noise.
    for (let k=0;k<60;k++) {
      const a=k*2.399963229728653, r=119+((k*47)%183);
      const x=Math.cos(a)*r,y=Math.sin(a)*r;
      const alpha=.13+.17*Math.sin(t*.0004+k);
      ctx.fillStyle=`rgba(184,241,151,${Math.max(.04,alpha)})`;
      ctx.fillRect(x,y,k%6===0?2:1,k%6===0?2:1);
    }
    ctx.restore();
  }
  function frame(t) {
    requestAnimationFrame(frame);
    if (document.hidden || !active || (t-last<33 && !reducedMotion)) return;
    if (reducedMotion && last) return;
    last=t;elapsed=t;
    smoothPointer.x += (pointer.x-smoothPointer.x)*.07;
    smoothPointer.y += (pointer.y-smoothPointer.y)*.07;
    draw(elapsed);
  }
  requestAnimationFrame(frame);
})();
