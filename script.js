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

// Smooth scroll for in-page links
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var el = id && id.length > 1 ? document.querySelector(id) : null;
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', id);
    });
  });
})();

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
  function onScroll() {
    var y = window.scrollY;
    if (y > 4) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    var goingDown = y > lastY && y > 80;
    header.classList.toggle('nav-hidden', goingDown);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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
  area.addEventListener('mousemove', onMove);
  area.addEventListener('mouseleave', reset);
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

  // ====== Config ======
  var OWNER_EMAIL = (window.CHAT_OWNER_EMAIL || 'rohankumarchaudhry550@gmail.com');
  var MAIL_WEBHOOK = (window.CHAT_MAIL_WEBHOOK || ''); // e.g., Formspree/Make webhook URL

  // ====== Draggable floating button ======
  (function(){
    var dragging = false;
    var startX = 0, startY = 0, startLeft = 0, startTop = 0;
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
      var vw = window.innerWidth; var vh = window.innerHeight;
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

  // Panel closed initially
  panel.classList.add('closed');

  // Open chat
  function openChat() {
    panel.classList.remove('closed');
    fab.setAttribute('aria-expanded', 'true');
    input.focus();
  }

  // Close chat
  function closeChat() {
    panel.classList.add('closed');
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  // Toggle button
  fab.addEventListener('click', function () {
    if (panel.classList.contains('closed')) openChat();
    else closeChat();
  });

  // Close button
  close.addEventListener('click', closeChat);

  // Append messages
  function appendMsg(text, who) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + (who || 'bot');
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
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
    body.scrollTop = body.scrollHeight;
  }

  // ====== Rich intent-based replies with Zyntrix knowledge ======
  var KB = {
    company: {
      name: 'Zyntrix',
      tagline: 'Web Design & Digital Marketing for Modern Businesses',
      whatsapp: 'wa.me/917986678730',
      services: ['Web Design & Development','Mobile App Development','UI/UX Design','E‑commerce Development','SEO & Digital Marketing','Branding & Identity','Analytics & BI'],
      timelines: {
        website: '2–4 weeks', uiux: '4–8 weeks', fullstack: '6–12 weeks'
      },
      sellingPoints: ['Fast delivery','Modern UX/UI','SEO‑focused','Mobile‑first','Full‑stack solutions','Reliable support'],
      process: 'Discovery → Design → Build → QA → Launch → Support',
      pricing: 'Fixed‑price packages for defined scope or sprint‑based for evolving needs.'
    },
    faqs: [
      { q: 'what services', a: 'We provide Web, Mobile, UI/UX, E‑commerce, SEO/Marketing, Branding, and Analytics.' },
      { q: 'timeline', a: 'Websites: 2–4 weeks; UI/UX: 4–8 weeks; Full builds: 6–12 weeks depending on scope.' },
      { q: 'pricing', a: 'We offer fixed‑price packages or sprint‑based billing. Share your scope for a fast quote.' },
      { q: 'contact', a: 'Reach us on WhatsApp at wa.me/917986678730 or use the Contact buttons.' },
      { q: 'support', a: 'We provide maintenance, SEO monitoring, performance optimization, and support plans.' }
    ]
  };

  // Basic multilingual synonyms
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

  function formatList(items){ return items.map(function(x){ return '• ' + x; }).join('\n'); }

  // ====== Lightweight NLU and lead capture ======
  var lead = JSON.parse(localStorage.getItem('zyntrix_lead') || 'null') || {
    name: '', email: '', phone: '', company: '',
    projectType: '', features: '', budget: '', timeline: '', notes: ''
  };

  function saveLead(){ localStorage.setItem('zyntrix_lead', JSON.stringify(lead)); }

  function extractEntities(text){
    var t = text;
    // Email
    var email = (t.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0];
    if(email) lead.email = email;
    // Phone (10-13 digits)
    var phone = (t.replace(/[^0-9+]/g,'').match(/\+?\d{10,13}/) || [])[0];
    if(phone) lead.phone = phone;
    // Budget (₹, rs, USD)
    var bud = (t.match(/(₹|rs\.?|inr|usd|\$)\s?([0-9,.]+\s?[kKmM]?)/i) || [])[0];
    if(bud) lead.budget = bud;
    // Timeline (weeks/months)
    var time = (t.match(/(\d+\s*(day|days|week|weeks|month|months))|([1-9]\d?\s*(din|hafta|mahina))/i) || [])[0];
    if(time) lead.timeline = time;
    // Project type keywords
    if(/\b(app|application|mobile)\b/i.test(t)) lead.projectType = lead.projectType || 'Mobile App';
    if(/\bwebsite|site|landing\b/i.test(t)) lead.projectType = lead.projectType || 'Website';
    if(/e-?commerce|store|shop|woocommerce|shopify/i.test(t)) lead.projectType = lead.projectType || 'E‑commerce';
    // Name simple cue
    if(/\bi am\b|\bi'm\b|\bmy name\b/i.test(t)){
      var m = t.replace(/.*(i am|i'm|my name is)\s*/i,'').split(/[,.;\n]/)[0].trim();
      if(m && m.length <= 40) lead.name = lead.name || m;
    }
    // Company
    if(/\b(company|firm|agency)\b/i.test(t)){
      var c = t.replace(/.*(company|firm|agency)\s*(name|is|:)?\s*/i,'').split(/[,.;\n]/)[0].trim();
      if(c && c.length <= 60) lead.company = lead.company || c;
    }
    // Features free text if user lists with commas
    if(/,/.test(t) && t.split(',').length >= 2){
      lead.features = lead.features || t;
    }
    saveLead();
  }

  function missingFields(){
    var req = ['name','email','phone','projectType','features','budget','timeline'];
    return req.filter(function(k){ return !lead[k]; });
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
          .then(function(r){ return r.ok ? r.text() : Promise.reject(new Error('Webhook failed')); })
          .then(function(){ appendMsg('Email/webhook sent successfully ✅', 'bot'); })
          .catch(function(){ window.location.href = 'mailto:'+OWNER_EMAIL+'?subject='+subject+'&body='+bodyTxt; });
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
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  }

  function replyFor(message) {
    var m = message.trim();
    extractEntities(m);
    var intent = detectIntent(m);
    var c = KB.company;
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
        // Fallback with helpful CTA + start lead capture
        setTimeout(promptForMissing, 100);
        return 'Samajh gaya. Project type, features, budget, aur timeline share karein. Main notes bana raha hoon.';
    }
  }

  // Seed welcome message
  appendMsg('Hi! I’m here to help with Zyntrix services, pricing, and timelines. Aap apni requirements share karein — main summary email kar dunga.', 'bot');

  // Form submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = (input.value || '').trim();
    if (!text) return;
    appendMsg(text, 'me');
    input.value = '';
    setTimeout(function () { appendMsg(replyFor(text), 'bot'); }, 400);
  });
})();
