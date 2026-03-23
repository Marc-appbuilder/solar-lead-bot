/**
 * Vaughan embed script
 *
 * Usage — paste before </body> on any page:
 *   <script src="https://app.vaughanai.co/embed.js?clientId=demo" async></script>
 *
 * Optional query params:
 *   clientId  — which agent config to load  (default: "demo")
 *   color     — override brand hex color    (auto-fetched from server if omitted)
 */
(function () {
  'use strict';

  /* ── 1. Parse params ─────────────────────────────────────────────────────── */
  var scriptEl =
    document.currentScript ||
    (function () {
      var all = document.getElementsByTagName('script');
      return all[all.length - 1];
    })();

  var srcUrl   = new URL(scriptEl.src);
  var origin   = srcUrl.origin;
  var clientId = srcUrl.searchParams.get('clientId') || 'demo';
  var colorArg = srcUrl.searchParams.get('color');   // may be null

  /* ── 2. Avoid double-init ────────────────────────────────────────────────── */
  if (window.__vaughanLoaded) return;
  window.__vaughanLoaded = true;

  /* ── 3. Helpers ──────────────────────────────────────────────────────────── */
  function hexRgb(hex) {
    return parseInt(hex.slice(1, 3), 16) + ',' +
           parseInt(hex.slice(3, 5), 16) + ',' +
           parseInt(hex.slice(5, 7), 16);
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  /* ── 4. Build DOM (colour applied later) ────────────────────────────────── */
  /* Keyframes */
  var style = document.createElement('style');
  style.textContent =
    '@keyframes ea-pop-in{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}' +
    '@keyframes ea-widget-in{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    '@keyframes ea-radar{0%{transform:scale(1);opacity:0.85}100%{transform:scale(2.8);opacity:0}}';
  document.head.appendChild(style);

  /* Teaser label (shown above FAB when set, hidden when chat opens) */
  var teaserEl = document.createElement('div');
  Object.assign(teaserEl.style, {
    position:      'fixed',
    bottom:        '100px',
    right:         '24px',
    zIndex:        '2147483647',
    background:    'rgba(255,255,255,0.85)',
    color:         '#3a3a3a',
    fontSize:      '13px',
    fontWeight:    '500',
    letterSpacing: '0.01em',
    fontFamily:    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding:       '8px 16px',
    borderRadius:  '999px',
    border:        '1px solid transparent',
    boxShadow:     '0 2px 8px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)',
    whiteSpace:    'nowrap',
    pointerEvents: 'none',
    display:       'none',
    animation:     'ea-pop-in 0.35s cubic-bezier(0.34,1.4,0.64,1) 1.2s both',
  });

  /* FAB wrapper */
  var fabWrap = document.createElement('div');
  Object.assign(fabWrap.style, {
    position:   'fixed',
    bottom:     '24px',
    right:      '24px',
    zIndex:     '2147483647',
    width:      '64px',
    height:     '64px',
    overflow:   'visible',
  });

  /* Radar ring — positioned relative to fabWrap centre */
  var radar = document.createElement('span');
  Object.assign(radar.style, {
    position:     'absolute',
    top:          '0',
    left:         '0',
    width:        '64px',
    height:       '64px',
    borderRadius: '50%',
    border:       '3px solid transparent',   /* colour set in applyColor */
    boxSizing:    'border-box',
    animation:    'ea-radar 2s cubic-bezier(0.2,0.6,0.4,1) 1s infinite',
    pointerEvents:'none',
    transformOrigin: 'center center',
  });

  /* FAB button */
  var fab = document.createElement('button');
  fab.setAttribute('aria-label', 'Open chat');
  Object.assign(fab.style, {
    position:     'absolute',
    top:          '0',
    left:         '0',
    width:        '64px',
    height:       '64px',
    borderRadius: '50%',
    border:       'none',
    cursor:       'pointer',
    display:      'flex',
    alignItems:   'center',
    justifyContent:'center',
    animation:    'ea-pop-in 0.45s cubic-bezier(0.34,1.4,0.64,1) 0.5s both',
    transition:   'transform 0.15s ease, box-shadow 0.2s ease',
  });

  fab.addEventListener('mouseover', function () { fab.style.transform = 'scale(1.1)'; });
  fab.addEventListener('mouseout',  function () { fab.style.transform = 'scale(1)'; });

  fabWrap.appendChild(radar);
  fabWrap.appendChild(fab);

  /* Widget container */
  var container = document.createElement('div');

  function applyContainerSize() {
    if (isMobile()) {
      Object.assign(container.style, {
        top: '0', left: '0', bottom: 'auto', right: 'auto',
        width: '100vw', height: '100dvh',
        maxWidth: '100vw', maxHeight: '100dvh',
        borderRadius: '0', boxShadow: 'none',
      });
    } else {
      Object.assign(container.style, {
        top: 'auto', left: 'auto',
        bottom: '96px', right: '16px',
        width: '380px', height: '580px',
        maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 120px)',
        borderRadius: '16px', boxShadow: '0 12px 48px rgba(0,0,0,0.28)',
      });
    }
  }

  Object.assign(container.style, {
    position: 'fixed',
    zIndex:   '2147483646',
    overflow: 'hidden',
    display:  'none',
    transformOrigin: 'bottom right',
  });
  applyContainerSize();
  window.addEventListener('resize', function () { if (isOpen) applyContainerSize(); });

  var iframe = document.createElement('iframe');
  iframe.src = origin + '/widget?clientId=' + encodeURIComponent(clientId);
  iframe.title = 'Vaughan chat';
  iframe.setAttribute('allow', 'clipboard-write');
  Object.assign(iframe.style, { width: '100%', height: '100%', border: 'none', display: 'block' });
  container.appendChild(iframe);

  /* Overlay */
  var overlay = document.createElement('div');
  Object.assign(overlay.style, { position: 'fixed', inset: '0', zIndex: '2147483645', display: 'none' });
  overlay.addEventListener('click', function () {
    isOpen = false;
    container.style.display = 'none';
    overlay.style.display   = 'none';
    if (teaserEl.textContent) teaserEl.style.display = 'block';
  });

  /* ── 5. Apply brand colour (called once colour is resolved) ─────────────── */
  var closeInner =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  function applyColor(hex) {
    var rgb = hexRgb(hex);

    /* Radar ring colour */
    radar.style.borderColor = 'rgba(' + rgb + ',0.9)';

    /* FAB background + glow */
    fab.style.background  = 'linear-gradient(135deg, ' + hex + ' 0%, rgba(' + rgb + ',0.8) 100%)';
    fab.style.boxShadow   = '0 4px 22px rgba(' + rgb + ',0.6), inset 0 1px 0 rgba(255,255,255,0.25)';

    fab.addEventListener('mouseover', function () {
      fab.style.boxShadow = '0 6px 30px rgba(' + rgb + ',0.8), inset 0 1px 0 rgba(255,255,255,0.25)';
    });
    fab.addEventListener('mouseout', function () {
      fab.style.boxShadow = '0 4px 22px rgba(' + rgb + ',0.6), inset 0 1px 0 rgba(255,255,255,0.25)';
    });

    /* Chat icon — premium chat bubble */
    var chatInner =
      '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 32 32" fill="none">' +
        '<path d="M16 3C9.373 3 4 7.925 4 14c0 3.13 1.387 5.958 3.636 8.003L6 29l6.5-3.25A13.6 13.6 0 0 0 16 26c6.627 0 12-4.925 12-11S22.627 3 16 3Z" fill="white" opacity="0.95"/>' +
        '<circle cx="11" cy="14" r="1.5" fill="' + hex + '" opacity="0.9"/>' +
        '<circle cx="16" cy="14" r="1.5" fill="' + hex + '" opacity="0.9"/>' +
        '<circle cx="21" cy="14" r="1.5" fill="' + hex + '" opacity="0.9"/>' +
      '</svg>';

    fab.innerHTML = chatInner;

    /* Re-wire toggle with correct chatInner */
    fab.onclick = null;
    fab.addEventListener('click', function () {
      if (isOpen) {
        isOpen = false;
        container.style.display  = 'none';
        overlay.style.display    = 'none';
        fabWrap.style.display    = 'flex';
        if (teaserEl.textContent) teaserEl.style.display = 'block';
        fab.innerHTML = chatInner;
        fab.setAttribute('aria-label', 'Open chat');
      } else {
        isOpen = true;
        applyContainerSize();
        container.style.display   = 'block';
        container.style.animation = 'ea-widget-in 0.28s cubic-bezier(0.22,1,0.36,1) both';
        overlay.style.display     = isMobile() ? 'none' : 'block';
        /* Hide FAB on mobile — it sits over the send button */
        fabWrap.style.display     = isMobile() ? 'none' : 'flex';
        teaserEl.style.display    = 'none';
        fab.innerHTML = closeInner;
        fab.setAttribute('aria-label', 'Close chat');
      }
    });
  }

  /* ── 6. Toggle state ─────────────────────────────────────────────────────── */
  var isOpen = false;

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      container.style.display = 'none';
      overlay.style.display   = 'none';
      fabWrap.style.display   = 'flex';
      if (teaserEl.textContent) teaserEl.style.display = 'block';
    }
  });

  window.addEventListener('message', function (e) {
    if (e.data === 'vaughan:close' && isOpen) {
      isOpen = false;
      container.style.display = 'none';
      overlay.style.display   = 'none';
      fabWrap.style.display   = 'flex';
      if (teaserEl.textContent) teaserEl.style.display = 'block';
    }
  });

  /* ── 7. Mount then resolve colour ───────────────────────────────────────── */
  function mount() {
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    document.body.appendChild(teaserEl);
    document.body.appendChild(fabWrap);

    if (colorArg) {
      /* Colour supplied inline — apply immediately, no teaser (no config fetch) */
      applyColor(colorArg);
    } else {
      /* Fetch config from server */
      fetch(origin + '/api/client-config/' + encodeURIComponent(clientId))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var colour = d.brandColour || '#1a365d';
          applyColor(colour);
          teaserEl.style.borderColor = d.borderColour || colour;
          if (d.teaserText) {
            teaserEl.textContent    = d.teaserText;
            teaserEl.style.display  = 'block';
          }
        })
        .catch(function () { applyColor('#1a365d'); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
