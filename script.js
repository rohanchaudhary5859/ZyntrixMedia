// Navigation toggle
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  var overlay = document.querySelector('.site-overlay');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    if (overlay) overlay.classList.toggle('show', open);
  });
  // Close on link click (mobile)
  menu.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    if (overlay) overlay.classList.remove('show');
  });
  if (overlay) {
    overlay.addEventListener('click', function () {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
      overlay.classList.remove('show');
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
      if (overlay) overlay.classList.remove('show');
      toggle.focus();
    }
  });
})();

// Accordion behavior
(function () {
  var accordion = document.querySelector('[data-accordion]');
  if (!accordion) return;
  accordion.addEventListener('click', function (e) {
    var button = e.target.closest('.accordion-item');
    if (!button) return;
    var expanded = button.getAttribute('aria-expanded') === 'true';
    var panel = button.querySelector('.panel');
    // Close others
    accordion.querySelectorAll('.accordion-item[aria-expanded="true"]').forEach(function (el) {
      if (el !== button) {
        el.setAttribute('aria-expanded', 'false');
        var p = el.querySelector('.panel');
        if (p) { p.hidden = true; }
      }
    });
    // Toggle current
    button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    if (panel) { panel.hidden = expanded; }
  });
})();

// Current year
(function () {
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// Smooth scrolling handled via CSS: html { scroll-behavior: smooth }

// Scrollspy for active nav link
(function () {
  var sections = ['#work', '#services', '#about', '#faq', '#contact'].map(function (id) { return document.querySelector(id); }).filter(Boolean);
  var links = Array.prototype.slice.call(document.querySelectorAll('#nav-menu a'));
  if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;
  var map = new Map();
  sections.forEach(function (sec) {
    var href = '#' + sec.id;
    var link = links.find(function (l) { return l.getAttribute('href') === href; });
    if (link) map.set(sec, link);
  });
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = map.get(entry.target);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
    });
  }, { threshold: 0.6 });
  map.forEach(function (_link, sec) { observer.observe(sec); });
})();

// Reveal work cards on scroll
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.work-card'));
  var revealContainers = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.work-tabs .tab'));
  var grid = document.querySelector('[data-work-grid]');
  if ((!cards.length && !revealContainers.length) || !('IntersectionObserver' in window)) {
    cards.forEach(function (c) { c.classList.add('reveal-in'); });
    revealContainers.forEach(function (el) { el.classList.add('in'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    cards.forEach(function (c) { observer.observe(c); });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealContainers.forEach(function (el) { revealObserver.observe(el); });
  }

  // Tabs filter
  if (tabs.length) {
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
        t.classList.add('active');
        t.setAttribute('aria-selected','true');
        var f = t.getAttribute('data-filter');
        cards.forEach(function (c) {
          var show = f === 'all' || c.getAttribute('data-category') === f;
          c.style.display = show ? '' : 'none';
        });
        if (grid) grid.scrollIntoView({ behavior:'smooth', block:'start' });
      });
    });
  }
})();

// Header shadow on scroll
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var lastY = window.scrollY;
  var ticking = false;
  function update() {
    var y = window.scrollY;
    if (y > 4) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    var goingDown = y > lastY && y > 80;
    header.classList.toggle('nav-hidden', goingDown);
    lastY = y;
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();

// Subtle parallax for hero media
(function () {
  var area = document.querySelector('[data-parallax]');
  if (!area) return;
  var cards = Array.prototype.slice.call(area.querySelectorAll('.media-card'));
  var rect;
  function onMove(e) {
    if (!rect) rect = area.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;
    cards.forEach(function (c, i) {
      var depth = (i + 1) * 1.5;
      c.style.transform = 'translate(' + (x * depth * 6) + 'px,' + (y * depth * 6) + 'px)';
    });
  }
  function reset() { cards.forEach(function (c) { c.style.transform = 'translate(0,0)'; }); rect = null; }
  area.addEventListener('mousemove', onMove, { passive: true });
  area.addEventListener('mouseleave', reset);
})();

// 3D Tilt interaction for cards (mouse/pointer + touch friendly)
(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // respect user
  var supportsPointer = window.PointerEvent;
  var selector = '.media-card, .work-card, .t-card, .service';
  var nodes = Array.prototype.slice.call(document.querySelectorAll(selector));
  if(!nodes.length) return;

  nodes.forEach(function(el){
    el.classList.add('tiltable');
    // Use pointer events when available
    var active = false;
    var rect = null;

    function updateVars(rx, ry, tz){
      el.style.setProperty('--rx', rx + 'deg');
      el.style.setProperty('--ry', ry + 'deg');
      el.style.setProperty('--tz', (tz || 8) + 'px');
    }

    function reset(){
      el.style.transition = 'transform 420ms cubic-bezier(.2,.9,.3,1)';
      updateVars(0,0,0);
      setTimeout(function(){ el.style.transition = ''; }, 420);
    }

    function onMove(clientX, clientY){
      if(!rect) rect = el.getBoundingClientRect();
      var px = (clientX - rect.left) / rect.width;
      var py = (clientY - rect.top) / rect.height;
      var rx = (0.5 - py) * 2 * 6; // up to ~12deg
      var ry = (px - 0.5) * 2 * 6;
      updateVars(rx, ry, 12);
      // adjust shadow for depth
      el.style.boxShadow = '0 22px 60px rgba(2,6,23,0.16)';
    }

    if(supportsPointer){
      el.addEventListener('pointerenter', function(e){ rect = el.getBoundingClientRect(); active = true; el.setPointerCapture && el.setPointerCapture(e.pointerId); });
      el.addEventListener('pointermove', function(e){ if(!active) return; onMove(e.clientX, e.clientY); });
      el.addEventListener('pointerleave', function(e){ active = false; rect = null; reset(); });
    } else {
      // fallback to mouse/touch
      el.addEventListener('mousemove', function(e){ onMove(e.clientX, e.clientY); });
      el.addEventListener('mouseleave', reset);
      el.addEventListener('touchstart', function(e){ rect = el.getBoundingClientRect(); });
      el.addEventListener('touchmove', function(e){ if(!e.touches || !e.touches[0]) return; onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      el.addEventListener('touchend', function(){ rect = null; reset(); });
    }
  });
})();

// Hero contained canvas particles
(function(){
  var canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var particles = [];
  var running = true;
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sizeCanvas(){
    var rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
  }

  function rand(min,max){ return Math.random() * (max-min) + min; }

  function init(){
    particles.length = 0;
    var rect = canvas.getBoundingClientRect();
    var baseCount = Math.max(24, Math.floor(rect.width * rect.height / 42000));
    var count = prefersReduced ? Math.floor(baseCount*0.4) : baseCount;
    for(var i=0;i<count;i++){
      particles.push({
        x: rand(0, canvas.width),
        y: rand(0, canvas.height),
        vx: rand(-0.2,0.2) * dpr,
        vy: rand(-0.2,0.2) * dpr,
        r: rand(1.2, 2.4) * dpr,
        a: rand(0.25, 0.6)
      });
    }
  }

  function tick(){
    if(!running) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(function(p){
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
      g.addColorStop(0, 'rgba(99,102,241,'+p.a+')');
      g.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r*6, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(tick);
  }

  function onResize(){ sizeCanvas(); init(); }

  sizeCanvas();
  init();
  requestAnimationFrame(tick);
  window.addEventListener('resize', onResize);

  // Pause when out of view to save CPU
  if('IntersectionObserver' in window){
    var section = document.querySelector('.hero');
    if(section){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){ running = entry.isIntersecting; if(running) requestAnimationFrame(tick); });
      }, { threshold: 0.05 });
      io.observe(section);
    }
  }
})();

// Chatbot interactions
(function () {
  var root = document.querySelector('[data-chatbot]');
  if (!root) return;

  var fab = root.querySelector('.chatbot-toggle');
  var panel = root.querySelector('#chatbot-panel');
  var close = root.querySelector('.chatbot-close');
  var form = root.querySelector('.chatbot-input');
  var input = form.querySelector('input[name="message"]');
  var body = root.querySelector('.chatbot-body');

  // ====== Conversation History (persist across visits) ======
  var historyKey = 'zyntrix_chat_history';
  var history = [];
  try { history = JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch(_e) { history = []; }
  function saveHistory(){ try { localStorage.setItem(historyKey, JSON.stringify(history)); } catch(_e){} }
  function renderHistory(){
    if(!Array.isArray(history)) return;
    body.innerHTML = '';
    history.forEach(function(entry){
      if(entry.type === 'msg'){
        var div = document.createElement('div');
        div.className = 'chat-msg ' + (entry.who || 'bot');
        div.textContent = entry.text || '';
        body.appendChild(div);
      } else if(entry.type === 'actions' && Array.isArray(entry.labels)){
        var wrap = document.createElement('div');
        wrap.className = 'chat-msg bot';
        entry.labels.forEach(function(label){
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = label;
          btn.style.marginRight = '6px';
          btn.className = 'btn-mini';
          // Recreate limited behavior for restored buttons: disabled state
          btn.disabled = true;
          wrap.appendChild(btn);
        });
        body.appendChild(wrap);
      }
    });
    body.scrollTop = body.scrollHeight;
  }

  // ====== Config ======
  var OWNER_EMAIL = (window.CHAT_OWNER_EMAIL || 'rohankumarchaudhry550@gmail.com');
  var MAIL_WEBHOOK = (window.CHAT_MAIL_WEBHOOK || '');

  // ====== Draggable floating button ======
  (function(){
    var dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
    function clamp(val, min, max){ return Math.max(min, Math.min(max, val)); }
    function onDown(e){
      var point = e.touches ? e.touches[0] : e;
      dragging = true;
      root.classList.add('dragging');
      startX = point.clientX; startY = point.clientY;
      var rect = root.getBoundingClientRect();
      startLeft = rect.left; startTop = rect.top;
      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchend', onUp);
    }
    function onMove(e){
      if(!dragging) return;
      var point = e.touches ? e.touches[0] : e;
      var dx = point.clientX - startX;
      var dy = point.clientY - startY;
      var vw = window.innerWidth, vh = window.innerHeight;
      var rect = root.getBoundingClientRect();
      var newLeft = clamp(startLeft + dx, 6, vw - rect.width - 6);
      var newTop = clamp(startTop + dy, 6, vh - rect.height - 6);
      root.style.left = newLeft + 'px';
      root.style.top = newTop + 'px';
      root.style.right = 'auto';
      root.style.bottom = 'auto';
      e.preventDefault();
    }
    function onUp(){ dragging = false; root.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    }
    fab.addEventListener('mousedown', onDown);
    fab.addEventListener('touchstart', onDown, { passive: true });
  })();

  panel.classList.add('closed');

  function openChat() {
    panel.classList.remove('closed');
    fab.setAttribute('aria-expanded', 'true');
    input.focus();
  }

  function closeChat() {
    panel.classList.add('closed');
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  fab.addEventListener('click', function () {
    if (panel.classList.contains('closed')) openChat();
    else closeChat();
  });

  close.addEventListener('click', closeChat);

  function appendMsg(text, who) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + (who || 'bot');
    div.textContent = text;
    body.appendChild(div);
    history.push({ type: 'msg', who: (who || 'bot'), text: text, ts: Date.now() });
    saveHistory();
    body.scrollTop = body.scrollHeight;
  }

  // Typing indicator helpers
  function showTyping(){
    hideTyping();
    var wrap = document.createElement('div');
    wrap.className = 'chat-msg bot';
    var tip = document.createElement('div');
    tip.className = 'chat-typing';
    for(var i=0;i<3;i++){ var d = document.createElement('span'); d.className='dot'; tip.appendChild(d); }
    wrap.appendChild(tip);
    wrap.setAttribute('data-typing','1');
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping(){
    var t = body.querySelector('[data-typing="1"]');
    if(t) t.remove();
  }

  function appendActions(actions){
    var wrap = document.createElement('div');
    wrap.className = 'chat-msg bot';
    actions.forEach(function(a){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = a.label;
      btn.style.marginRight = '6px';
      btn.className = 'btn-mini';
      btn.addEventListener('click', a.onClick);
      wrap.appendChild(btn);
    });
    body.appendChild(wrap);
    history.push({ type: 'actions', labels: actions.map(function(a){ return a.label; }), ts: Date.now() });
    saveHistory();
    body.scrollTop = body.scrollHeight;
  }

  // ====== Knowledge Base ======
  // Small built-in KB. You can replace/extend this with a `faq.json` file if you host the site
  var KB = {
    company: {
      name: 'Zyntrix',
      tagline: 'Web Design & Digital Marketing for Modern Businesses',
      whatsapp: 'wa.me/917986678730',
      services: ['Web Design & Development','Mobile App Development','UI/UX Design','E‑commerce Development','SEO & Digital Marketing','Branding & Identity','Analytics & BI'],
      timelines: { website: '2–4 weeks', uiux: '4–8 weeks', fullstack: '6–12 weeks' },
      sellingPoints: ['Fast delivery','Modern UX/UI','SEO‑focused','Mobile‑first','Full‑stack solutions','Reliable support'],
      process: 'Discovery → Design → Build → QA → Launch → Support',
      pricing: 'Fixed‑price packages for defined scope or sprint‑based for evolving needs.'
    },
    faqs: [
      { q: 'what services', a: 'We provide Web, Mobile, UI/UX, E‑commerce, SEO/Marketing, Branding, and Analytics.' },
      { q: 'timeline', a: 'Websites: 2–4 weeks; UI/UX: 4–8 weeks; Full builds: 6–12 weeks depending on scope.' },
      { q: 'pricing', a: 'We offer fixed‑price packages or sprint-based billing. Share your scope for a fast quote.' },
      { q: 'contact', a: 'Reach us on WhatsApp at wa.me/917986678730 or use the Contact buttons.' },
      { q: 'support', a: 'We provide maintenance, SEO monitoring, performance optimization, and support plans.' }
    ]
  };

  // Try to load optional faq.json (non-blocking). If present, merge/override KB.faqs
  (function tryLoadExternalFAQ(){
    try{
      fetch('faq.json', { cache: 'no-store' }).then(function(res){
        if(!res.ok) return null; return res.json();
      }).then(function(json){
        if(!json || !Array.isArray(json.faqs)) return;
        // merge with built-in, giving priority to external
        var map = {};
        KB.faqs.forEach(function(f){ map[(f.q||'').toLowerCase()] = f; });
        json.faqs.forEach(function(f){ if(f && f.q) map[(f.q||'').toLowerCase()] = f; });
        KB.faqs = Object.keys(map).map(k => map[k]);
        try { buildFAQIndex(); } catch (e) { /* ignore */ }
      }).catch(function(){ /* ignore */ });
    }catch(e){}
  })();

  // Fuse index will be built if Fuse is available. Fallback uses token overlap.
  var fuse = null;
  function buildFAQIndex(){
    try{
      if(window.Fuse && Array.isArray(KB.faqs)){
        // create a copy to avoid side-effects
        var data = KB.faqs.map(function(x){ return { q: x.q || '', a: x.a || '' }; });
        fuse = new Fuse(data, { keys: ['q','a'], threshold: 0.4, includeScore: true, minMatchCharLength: 2 });
      }
    }catch(e){ fuse = null; }
  }
  // build initially from built-in KB
  try { buildFAQIndex(); } catch(e){}

  var HINGLISH = /\b(namaste|hello|hi|hey|kaise|kaam|banwana|website|app|kiraya|kimat|daam|price|budget|estimate|kitna|kab|time|timeline|email|mail|phone|number|whatsapp|sahayta|madad)\b/i;

  function detectIntent(m){
    if (/(price|cost|budget|quote|estimate|daam|kimat|kiraya)/i.test(m)) return 'pricing';
    if (/(service|offer|do you do|capabilit|help with|kya karte|services)/i.test(m)) return 'services';
    if (/(time|timeline|how long|duration|deadline|kab|kitne din)/i.test(m)) return 'timeline';
    if (/(contact|whatsapp|reach|email|phone|mobile|number)/i.test(m)) return 'contact';
    if (/(process|how work|workflow|steps)/i.test(m)) return 'process';
    if (/(seo|ui|ux|branding|e-?commerce|app|mobile|website|analytics)/i.test(m)) return 'topic';
    if (/(support|maintain|maintenance|support karo)/i.test(m)) return 'support';
    if (/(hello|hi|hey|namaste|salaam)/i.test(m)) return 'greet';
    if (HINGLISH.test(m)) return 'open';
    return 'open';
  }

  // Simple fuzzy match: score text similarity by token overlap and character closeness
  function fuzzyFindFAQ(query){
    if(!query) return null;
    var q = String(query || '').trim();
    // If Fuse is available, prefer it (returns array with { item, score })
    try{
      if(window.Fuse && fuse){
        var results = fuse.search(q);
        if(results && results.length){
          var top = results[0];
          // lower score is better in Fuse: 0 is exact match.
          var score = typeof top.score === 'number' ? top.score : 1;
          // high confidence
          if(score <= 0.45){
            return top.item; // return faq object
          }
          // low confidence suggestion: return wrapper indicating suggestion
          return { suggestion: top.item, score: score, lowConfidence: true };
        }
      }
    }catch(e){ /* ignore and fall back */ }

    // fallback token overlap (lighter)
    var lq = q.toLowerCase().replace(/[?!.]/g,'').trim();
    var qTokens = lq.split(/\s+/).filter(Boolean);
    var best = { score: 0, faq: null };
    KB.faqs.forEach(function(f){
      var text = (f.q + ' ' + (f.a||'')).toLowerCase();
      var tTokens = text.split(/\s+/).filter(Boolean);
      var overlap = qTokens.filter(function(t){ return tTokens.indexOf(t) !== -1; }).length;
      var common = 0;
      for(var i=0;i<Math.min(lq.length, text.length); i++){
        if(lq[i] === text[i]) common++; else break;
      }
      var score = overlap * 2 + Math.min(common, 6);
      if(text.indexOf(lq) !== -1) score += 4;
      if(score > best.score){ best.score = score; best.faq = f; }
    });
    if(best.score >= 3) return best.faq; // require slightly higher overlap for fallback
    return null;
  }

  function formatList(items){ return items.map(x => '• ' + x).join('\n'); }

  // ====== Lead Capture ======
  var lead = JSON.parse(localStorage.getItem('zyntrix_lead') || 'null') || {
    name: '', email: '', phone: '', company: '',
    projectType: '', features: '', budget: '', timeline: '', notes: ''
  };

  function saveLead(){ localStorage.setItem('zyntrix_lead', JSON.stringify(lead)); }

  function missingFields(){
    var req = ['name','email','phone','projectType','features','budget','timeline'];
    return req.filter(k => !lead[k]);
  }

  function normalizeBudget(raw){
    var t = String(raw || '').trim();
    if(!t) return '';
    // Normalize common formats: 5k, 50k, 2 lakh, 1.5 cr, 2-3L, 50,000 etc.
    var lower = t.toLowerCase();
    // Convert lakh/crore to numbers
    var num = null; var symbol = '₹';
    // Range like 50k-60k or 2-3 lakh -> pick midpoint
    var range = lower.match(/([0-9]+(?:\.[0-9]+)?)\s*(k|m|l|lac|lakh|cr|crore)?\s*[-–to]+\s*([0-9]+(?:\.[0-9]+)?)\s*(k|m|l|lac|lakh|cr|crore)?/);
    function mulFor(u){
      if(!u) return 1;
      if(u === 'k') return 1e3;
      if(u === 'm') return 1e6;
      if(u === 'l' || u === 'lac' || u === 'lakh') return 1e5;
      if(u === 'cr' || u === 'crore') return 1e7;
      return 1;
    }
    if(range){
      var a = parseFloat(range[1]) * mulFor(range[2]);
      var b = parseFloat(range[3]) * mulFor(range[4] || range[2]);
      num = Math.round((a + b) / 2);
      return symbol + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
    }
    var m = lower.match(/(\₹|rs\.?|inr|usd|\$)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(k|m|l|lac|lakh|cr|crore)?/i);
    if(m){
      var sym = (m[1] || '').toUpperCase();
      if(sym.includes('USD') || sym === '$') symbol = '$';
      var base = parseFloat((m[2] || '0').replace(/,/g,''));
      var unit = (m[3] || '').toLowerCase();
      num = Math.round(base * mulFor(unit));
      try { return symbol + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num); }
      catch(_e){ return symbol + String(num); }
    }
    return t; // fallback to raw
  }

  function extractEntities(text){
    var t = text;
    var miss = missingFields()[0];

    // Name
    if(miss === 'name' || /\bi am\b|\bi'm\b|\bmy name\b/i.test(t)){
      var m = t.replace(/.*(i am|i'm|my name is)\s*/i,'').split(/[,.;\n]/)[0].trim();
      if(!m && miss === 'name') m = t.trim();
      if(m && m.length <= 40) lead.name = m;
    }

    // Email
    var email = (t.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0];
    if(email) lead.email = email;

    // Phone
    var phone = (t.replace(/[^0-9+]/g,'').match(/\+?\d{10,13}/) || [])[0];
    if(phone) lead.phone = phone;

    // Budget (improved)
    var budm = t.match(/(\₹|rs\.?|inr|usd|\$)?\s*[0-9][0-9,]*(?:\.[0-9]+)?\s*(k|m|l|lac|lakh|cr|crore)?/i);
    if(budm) lead.budget = normalizeBudget(budm[0]);

    // Timeline
    var time = (t.match(/(\d+\s*(day|days|week|weeks|month|months))|([1-9]\d?\s*(din|hafta|mahina))/i) || [])[0];
    if(time) lead.timeline = time;

    // Project type
    if(/\b(app|application|mobile)\b/i.test(t)) lead.projectType = lead.projectType || 'Mobile App';
    if(/\bwebsite|site|landing\b/i.test(t)) lead.projectType = lead.projectType || 'Website';
    if(/e-?commerce|store|shop|woocommerce|shopify/i.test(t)) lead.projectType = lead.projectType || 'E‑commerce';

    // Company
    if(/\b(company|firm|agency)\b/i.test(t)){
      var c = t.replace(/.*(company|firm|agency)\s*(name|is|:)?\s*/i,'').split(/[,.;\n]/)[0].trim();
      if(c && c.length <= 60) lead.company = lead.company || c;
    }

    // Features free text
    if(/,/.test(t) && t.split(',').length >= 2) lead.features = lead.features || t;

    saveLead();
  }

  function leadSummary(){
    return (
      'Lead Summary (Zyntrix Chatbot)\n' +
      '— Name: ' + (lead.name||'-') + '\n' +
      '— Email: ' + (lead.email||'-') + '\n' +
      '— Phone: ' + (lead.phone||'-') + '\n' +
      '— Company: ' + (lead.company||'-') + '\n' +
      '— Project: ' + (lead.projectType||'-') + '\n' +
      '— Features: ' + (lead.features||'-') + '\n' +
      '— Budget: ' + (lead.budget||'-') + '\n' +
      '— Timeline: ' + (lead.timeline||'-') + '\n' +
      '— Notes: ' + (lead.notes||'-') + '\n' +
      '\nSent automatically from zyntrixmedia.xyz'
    );
  }

  function promptForMissing(){
    var miss = missingFields();
    if(!miss.length) { offerSend(); return; }
    var map = {
      name: 'Aapka naam?',
      email: 'Aapka email?',
      phone: 'Phone/WhatsApp number?',
      projectType: 'Project type (Website, App, E‑commerce)?',
      features: 'Key features? (comma separated)',
      budget: 'Approx budget (₹/USD)?',
      timeline: 'Timeline/deadline?'
    };
    state.awaiting = miss[0];
    appendMsg(map[miss[0]] || ('Please share: ' + miss[0]), 'bot');
  }

  function offerSend(){
    appendMsg('Sab details mil gayi. Kya mai summary email kar du?', 'bot');
    appendActions([
      { label: 'Send Email', onClick: function(){ sendEmail(); } },
      { label: 'Download JSON', onClick: function(){ downloadJSON(); } },
      { label: 'Edit Details', onClick: function(){ appendMsg('Kis field ko update karna hai? (name, email, phone, company, project, features, budget, timeline, notes)', 'bot'); } }
    ]);
  }

  function sendEmail(){
    var subject = encodeURIComponent('New Lead from Zyntrix Chatbot');
    var bodyTxt = encodeURIComponent(leadSummary());
    if(MAIL_WEBHOOK){
      try {
        fetch(MAIL_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: OWNER_EMAIL, subject: 'New Lead from Zyntrix Chatbot', text: leadSummary(), lead: lead }) })
          .then(r => r.ok ? r.text() : Promise.reject(new Error('Webhook failed')))
          .then(() => appendMsg('Email/webhook sent successfully ✅', 'bot'))
          .catch(() => window.location.href = 'mailto:'+OWNER_EMAIL+'?subject='+subject+'&body='+bodyTxt);
      } catch(_e){
        window.location.href = 'mailto:'+OWNER_EMAIL+'?subject='+subject+'&body='+bodyTxt;
      }
    } else {
      window.location.href = 'mailto:'+OWNER_EMAIL+'?subject='+subject+'&body='+bodyTxt;
    }
  }

  function downloadJSON(){
    var blob = new Blob([JSON.stringify(lead, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'zyntrix-lead.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function replyFor(message) {
    var m = message.trim();
    extractEntities(m);
    var intent = detectIntent(m);
    var c = KB.company;

    // First, check if the message directly matches a FAQ via fuzzy match
    var faq = fuzzyFindFAQ(m);
    if(faq){
      return faq.a || faq.q;
    }

    switch(intent){
      case 'pricing':
        return 'Pricing: ' + c.pricing + '\nApna budget approx bata dein, mai estimate share karunga.';
      case 'services':
        return 'Our core services:\n' + formatList(c.services) + '\nAap kya build karna chahte hain?';
      case 'timeline':
        return 'Typical timelines:\n• Website: ' + c.timelines.website + '\n• Product UI/UX: ' + c.timelines.uiux + '\n• Full build: ' + c.timelines.fullstack + '\nDeadline share karenge to mai milestones bata dunga.';
      case 'contact':
        return 'WhatsApp: ' + c.whatsapp + '\nEmail bhi bhej sakte hain. Aapka email/number share karein?';
      case 'process':
        return 'Our process: ' + c.process + '\nIsse delivery fast aur transparent rehti hai.';
      case 'topic':
        return 'Yes, we can help with that. Zyntrix focuses on: ' + c.sellingPoints.join(', ') + '.\nThoda details dein—features, audience, goals?';
      case 'support':
        return 'Post‑launch support: maintenance, SEO monitoring, performance optimization, and optional support plans.';
      case 'greet':
        return 'Hello! Namaste! Main Zyntrix assistant hoon. Services, pricing, ya timelines pooch sakte hain. Aap kya build karna chahte hain?';
      default:
        // handle open / unknown queries gracefully: attempt FAQ again with more relaxed rules
        var relaxed = fuzzyFindFAQ(m + ' ' + (m.split(' ').slice(0,3).join(' ')));
        if(relaxed) return relaxed.a || relaxed.q;

        var miss = missingFields();
        if(miss.length){
          // Ask for missing field(s) specifically
          setTimeout(promptForMissing, 100);
          return 'Samajh gaya. Chaliye missing info complete karte hain.';
        } else {
          // If we have all lead info, offer to send. Otherwise provide a helpful fallback
          setTimeout(offerSend, 100);
          return 'Thanks! Sab info mil gayi. Agar aapke paas specific question hai, pooch lijiye — mai turant help karunga.';
        }
    }
  }

  // ====== Guided Q&A state ======
  var state = { awaiting: '' };

  // Restore any previous conversation
  if(history.length){
    renderHistory();
  } else {
    // Avoid duplicate greeting: only add if body has no messages
    if(!body.querySelector('.chat-msg')){
      appendMsg('Hi! I’m here to help with Zyntrix services, pricing, and timelines. Aap apni requirements share karein — main summary email kar dunga.', 'bot');
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = (input.value || '').trim();
    if (!text) return;
    appendMsg(text, 'me');
    input.value = '';
    // If we are awaiting a specific field, capture it first, then move to next
    if(state.awaiting){
      var key = state.awaiting;
      // naive assignment; extractEntities already tries too, but ensure direct capture
      if(key === 'budget'){
        lead.budget = lead.budget || normalizeBudget(text);
      } else if(key === 'features'){
        lead.features = lead.features || text;
      } else if(key === 'timeline'){
        lead.timeline = lead.timeline || text;
      } else if(key === 'projectType'){
        lead.projectType = lead.projectType || text;
      } else if(key === 'name'){
        lead.name = lead.name || text;
      } else if(key === 'email'){
        // prefer regex capture in extractEntities, but fall back to raw
        lead.email = lead.email || text;
      } else if(key === 'phone'){
        lead.phone = lead.phone || text;
      }
      saveLead();
      state.awaiting = '';
      var still = missingFields();
      if(still.length){
        setTimeout(promptForMissing, 150);
      } else {
        setTimeout(offerSend, 150);
      }
      return;
    }
    showTyping();
    setTimeout(function(){ hideTyping(); appendMsg(replyFor(text), 'bot'); }, 500 + Math.min(1400, Math.max(300, text.length * 25)));
  });
})();


// ...existing code...
(function(){
  // Pricing toggle: monthly <-> yearly, update amounts and CTA links
  var toggle = document.getElementById('billing-toggle');
  if (!toggle) return;

  var cards = Array.prototype.slice.call(document.querySelectorAll('.price-card'));
  function parseAmount(text){
    if(!text) return null;
    if(/custom/i.test(text)) return null;
    var m = text.replace(/\s+/g,'').match(/([₹$€£]?)([0-9.,]+)([kKmM]?)/);
    if(!m) return null;
    var sym = m[1] || '₹';
    var num = parseFloat(m[2].replace(/,/g,'')) || 0;
    var suf = (m[3] || '').toLowerCase();
    if(suf === 'k') num *= 1000;
    if(suf === 'm') num *= 1000000;
    return { value: num, symbol: sym };
  }
  function fmt(n, sym){
    if(n == null) return '-';
    // Use Indian grouping for rupees; fallback to default
    try {
      return (sym || '') + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n));
    } catch (e) {
      return (sym || '') + Math.round(n).toString();
    }
  }

  // Build model for each card
  var model = cards.map(function(card){
    var amountEl = card.querySelector('.amount');
    var periodEl = card.querySelector('.period');
    var title = (card.querySelector('h3') && card.querySelector('h3').textContent.trim()) || 'Plan';
    var cta = card.querySelector('a') || null;

    var dataMonthly = card.getAttribute('data-monthly');
    var dataYearly = card.getAttribute('data-yearly');

    var parsed = parseAmount(amountEl ? amountEl.textContent : '');
    var monthly = dataMonthly ? parseFloat(dataMonthly) : (parsed ? parsed.value : null);
    var symbol = parsed ? parsed.symbol : '₹';

    var yearly;
    if (dataYearly) yearly = parseFloat(dataYearly);
    else if (monthly != null) yearly = Math.round(monthly * 10); // 2 months free as default
    else yearly = null;

    return { card, amountEl, periodEl, title, cta, monthly, yearly, symbol };
  });

  function applyBilling(isYearly){
    model.forEach(function(m){
      if(!m.amountEl) return;
      if(isYearly && m.yearly != null){
        m.amountEl.textContent = fmt(m.yearly, m.symbol);
        if(m.periodEl) m.periodEl.textContent = '/yr';
        m.card.classList.add('yearly');
      } else if(!isYearly && m.monthly != null){
        m.amountEl.textContent = fmt(m.monthly, m.symbol);
        if(m.periodEl) m.periodEl.textContent = '/mo';
        m.card.classList.remove('yearly');
      }
      // Update CTA prefill (WhatsApp) if CTA points to wa.me
      if(m.cta && m.cta.href && m.cta.href.includes('wa.me')){
        try {
          var plan = encodeURIComponent(m.title + (isYearly ? ' (yearly)' : ' (monthly)'));
          var budget = m.monthly ? encodeURIComponent(' Budget: ' + (isYearly ? fmt(m.yearly,m.symbol) : fmt(m.monthly,m.symbol))) : '';
          // Build base wa link (strip existing text param)
          var href = m.cta.getAttribute('href').split('?')[0];
          var text = 'Hi Zyntrix, I am interested in the ' + m.title + (isYearly ? ' (yearly plan).' : ' (monthly plan).') + (budget ? ' My budget is approx ' + (isYearly ? fmt(m.yearly,m.symbol) : fmt(m.monthly,m.symbol)) + '.' : '');
          var encoded = encodeURIComponent(text);
          m.cta.setAttribute('href', href + '?text=' + encoded);
        } catch (e) { /* non-fatal */ }
      }
    });
    // toggle class on pricing section for CSS hooks
    var pricing = document.querySelector('.pricing');
    if(pricing) pricing.classList.toggle('billing-yearly', isYearly);
  }

  // init
  applyBilling(toggle.checked);

  toggle.addEventListener('change', function(){
    applyBilling(toggle.checked);
  });

})();
{ /* end pricing toggle IIFE */ }
// ...existing code...

// Scroll-based parallax for deeper 3D feeling
(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-depth]'));
  if(!els.length) return;

  var ticking = false;

  function update(){
    var vw = window.innerHeight;
    els.forEach(function(el){
      var depth = parseFloat(el.getAttribute('data-depth') || '1');
      var rect = el.getBoundingClientRect();
      // Calculate progress between -1..1 where 0 is center of viewport
      var progress = (rect.top + rect.height/2 - window.innerHeight/2) / (window.innerHeight/2);
      // translate more for deeper elements (positive downwards)
      var ty = Math.round(progress * depth * 18); // px
      el.style.setProperty('--ty', ty + 'px');
    });
    ticking = false;
  }

  function onScroll(){ if(!ticking){ requestAnimationFrame(update); ticking = true; } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  // init
  requestAnimationFrame(update);
})();

// Accessible Blog Modal: parse JSON, populate modal, focus-trap, ESC/outside click
(function(){
  var dataEl = document.getElementById('blog-data');
  if(!dataEl) return;
  var posts = {};
  try{ posts = JSON.parse(dataEl.textContent); } catch(e){ posts = {}; }

  var modal = document.getElementById('blogModal');
  if(!modal) return;
  // Ensure modal is a direct child of body to avoid positioning being affected by transformed ancestors
  try { if(modal.parentNode !== document.body) document.body.appendChild(modal); } catch(e) {}
  var modalTitle = modal.querySelector('.blog-modal-title');
  var modalSub = modal.querySelector('.blog-modal-sub');
  var modalBody = document.getElementById('blogModalBody');
  var modalClose = document.getElementById('blogModalClose');
  var content = modal.querySelector('.blog-modal-content');
  if(!modalTitle || !modalBody || !modalClose || !content) return;

  var lastFocus = null;
  var firstFocusable = null, lastFocusable = null;
  var _savedScrollY = 0;

  function setupTrap(){
    var focusable = 'a[href],area[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex="-1"])';
    var nodes = Array.prototype.slice.call(content.querySelectorAll(focusable));
    if(nodes.length === 0) nodes = [modalClose];
    firstFocusable = nodes[0];
    lastFocusable = nodes[nodes.length - 1];
  }

  function releaseTrap(){ firstFocusable = null; lastFocusable = null; }

  function handleTab(e){
    if(!firstFocusable) return;
    if(e.shiftKey && document.activeElement === firstFocusable){ e.preventDefault(); lastFocusable.focus(); }
    else if(!e.shiftKey && document.activeElement === lastFocusable){ e.preventDefault(); firstFocusable.focus(); }
  }

  function open(id){
    try { console.debug('modal.open called for id:', id, 'jsonPresent:', !!posts[id]); } catch(e){}
    var p = posts && posts[id];
    // fallback: if no JSON post, read from DOM card
    var cardFallback = null;
    if(!p){
      cardFallback = document.querySelector('.work-card[data-post="' + id + '"]');
      if(cardFallback){
        p = {
          title: (cardFallback.querySelector('h3') && cardFallback.querySelector('h3').textContent) || '',
          body: (cardFallback.querySelector('p') && cardFallback.querySelector('p').textContent) || ''
        };
      }
    }
    if(!p) {
      // nothing to show — debug info and bail out
      try { console.info('No post found for id:', id); } catch(e){}
      return;
    }

    lastFocus = document.activeElement;
    modalTitle.textContent = p.title || '';
    // modalSub comes from excerpt if available
    modalSub.textContent = p.excerpt || '';

    // populate body safely (no innerHTML)
    while(modalBody.firstChild) modalBody.removeChild(modalBody.firstChild);
    var para = document.createElement('p'); para.textContent = p.body || '';
    modalBody.appendChild(para);

    // show modal (CSS toggles on aria-hidden)
    modal.setAttribute('aria-hidden','false');

    // Lock scroll without causing the browser to jump: capture current scroll and freeze body
    try {
      _savedScrollY = window.scrollY || window.pageYOffset || 0;
      // apply fixed positioning so the viewport doesn't jump when overflow is hidden
      document.body.style.position = 'fixed';
      document.body.style.top = (-_savedScrollY) + 'px';
      document.body.classList.add('no-scroll');
    } catch (e) { document.body.classList.add('no-scroll'); }

    // prefer focusing the close button so screen reader users get a clear action
    try { if (modalClose.focus) modalClose.focus({ preventScroll: true }); else modalClose.focus(); } catch (e) { try { modalClose.focus(); } catch(e){} }
    setupTrap();
    document.addEventListener('keydown', onKey);
    modal.addEventListener('click', onClickOutside);
  }

  function close(){
    modal.setAttribute('aria-hidden','true');
    // restore scroll state
    try {
      document.body.classList.remove('no-scroll');
      document.body.style.position = '';
      document.body.style.top = '';
      if(_savedScrollY) window.scrollTo(0, _savedScrollY);
      _savedScrollY = 0;
    } catch (e) { document.body.classList.remove('no-scroll'); }
    document.removeEventListener('keydown', onKey);
    modal.removeEventListener('click', onClickOutside);
    releaseTrap();
    if(lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function onKey(e){
    if(e.key === 'Escape') { close(); }
    if(e.key === 'Tab') { handleTab(e); }
  }

  function onClickOutside(e){ if(e.target === modal) close(); }

  modalClose.addEventListener('click', function(e){ e.preventDefault(); close(); });

  // wire up triggers on cards
  var cards = Array.prototype.slice.call(document.querySelectorAll('.work-card'));
  cards.forEach(function(card){
    var id = card.getAttribute('data-post');
    var btn = card.querySelector('.btn');
    if(btn) btn.addEventListener('click', function(ev){ ev.preventDefault(); ev.stopPropagation(); try{ console.debug('card button clicked, id=', id); }catch(e){}; open(id); });
    card.addEventListener('click', function(ev){ if(ev.target.closest('button')) return; try{ console.debug('card clicked, id=', id); }catch(e){}; open(id); });
  });

})();