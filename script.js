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

  // Simple bot replies
  function replyFor(message) {
    var m = message.toLowerCase();
    if (m.includes('service') || m.includes('what do you do')) return 'We offer brand, UI/UX, web and mobile development, e‑commerce, SEO, analytics, and hosting/support.';
    if (m.includes('price') || m.includes('cost')) return 'We scope fixed‑price packages or sprint‑based engagements. Share your scope and we’ll estimate quickly.';
    if (m.includes('time') || m.includes('timeline')) return 'Typical ranges: website 2–4 weeks, product UI/UX 4–8 weeks, full build 6–12 weeks depending on scope.';
    if (m.includes('contact') || m.includes('whatsapp')) return 'You can reach us on WhatsApp at wa.me/917986678730 — or use the Contact button above.';
    return 'Got it. Tell me about your goals, features, or deadlines and I’ll guide you.';
  }

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
