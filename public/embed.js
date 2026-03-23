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
  var colorArg = srcUrl.searchParams.get('color');

  /* ── 2. Avoid double-init ────────────────────────────────────────────────── */
  if (window.__vaughanLoaded) return;
  window.__vaughanLoaded = true;

  /* ── 3. Helpers ──────────────────────────────────────────────────────────── */
  function hexRgb(hex) {
    return parseInt(hex.slice(1, 3), 16) + ',' +
           parseInt(hex.slice(3, 5), 16) + ',' +
           parseInt(hex.slice(5, 7), 16);
  }

  function isMobile() { return window.innerWidth <= 768; }

  /* ── 4. Keyframes ───────────────────────────────────────────────────────── */
  var styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ea-widget-in{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    /* Slide-in variants: right/left × bottom/middle */
    '@keyframes ea-fab-er{from{opacity:0;transform:translateX(110px)}to{opacity:1;transform:translateX(0)}}' +
    '@keyframes ea-fab-el{from{opacity:0;transform:translateX(-110px)}to{opacity:1;transform:translateX(0)}}' +
    '@keyframes ea-fab-emr{from{opacity:0;transform:translateX(110px) translateY(-50%)}to{opacity:1;transform:translateX(0) translateY(-50%)}}' +
    '@keyframes ea-fab-eml{from{opacity:0;transform:translateX(-110px) translateY(-50%)}to{opacity:1;transform:translateX(0) translateY(-50%)}}' +
    /* Gentle breathing glow */
    '@keyframes ea-breathe{0%,100%{box-shadow:var(--ea-glow-rest)}50%{box-shadow:var(--ea-glow-peak)}}' +
    /* Live dot pulse */
    '@keyframes ea-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(0.7);opacity:0.5}}';
  document.head.appendChild(styleEl);

  /* ── 5. FAB wrapper ─────────────────────────────────────────────────────── */
  var _pos = 'bottom-right'; // resolved from config

  var fabWrap = document.createElement('div');
  Object.assign(fabWrap.style, {
    position: 'fixed',
    zIndex:   '2147483647',
    width:    '64px',
    height:   '64px',
    overflow: 'visible',
  });

  function applyFabPosition(pos) {
    _pos = pos || 'bottom-right';
    var isLeft = _pos === 'bottom-left' || _pos === 'middle-left';
    var isMid  = _pos === 'middle-left' || _pos === 'middle-right';
    var anim   = isMid
      ? (isLeft ? 'ea-fab-eml' : 'ea-fab-emr')
      : (isLeft ? 'ea-fab-el'  : 'ea-fab-er');

    Object.assign(fabWrap.style, {
      bottom:    isMid ? 'auto'  : '24px',
      top:       isMid ? '50%'   : 'auto',
      right:     isLeft ? 'auto' : '24px',
      left:      isLeft ? '24px' : 'auto',
      animation: anim + ' 0.6s cubic-bezier(0.22,1,0.36,1) 2s both',
    });
  }

  /* Radar ring */
  var radar = document.createElement('span');
  Object.assign(radar.style, {
    position:        'absolute',
    top:             '0',
    left:            '0',
    width:           '64px',
    height:          '64px',
    borderRadius:    '50%',
    border:          '3px solid transparent',
    boxSizing:       'border-box',
    pointerEvents:   'none',
    transformOrigin: 'center center',
  });

  /* FAB button */
  var fab = document.createElement('button');
  fab.setAttribute('aria-label', 'Open chat');
  Object.assign(fab.style, {
    position:       'absolute',
    top:            '0',
    left:           '0',
    width:          '64px',
    height:         '64px',
    borderRadius:   '50%',
    border:         'none',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    transition:     'transform 0.15s ease',
  });
  fab.addEventListener('mouseover', function () { fab.style.transform = 'scale(1.1)'; });
  fab.addEventListener('mouseout',  function () { fab.style.transform = 'scale(1)'; });

  /* Live dot — gold, top-right corner of the circle */
  var liveDot = document.createElement('span');
  Object.assign(liveDot.style, {
    position:     'absolute',
    top:          '2px',
    right:        '2px',
    width:        '12px',
    height:       '12px',
    borderRadius: '50%',
    background:   '#c9a84c',
    border:       '2px solid #ffffff',
    boxSizing:    'border-box',
    animation:    'ea-dot 2.4s ease-in-out 2.6s infinite',
    zIndex:       '1',
    pointerEvents:'none',
  });

  fabWrap.appendChild(radar);
  fabWrap.appendChild(fab);
  fabWrap.appendChild(liveDot);

  /* ── 6. Widget container ─────────────────────────────────────────────────── */
  var container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed', zIndex: '2147483646',
    overflow: 'hidden', display: 'none', transformOrigin: 'bottom right',
  });

  function applyContainerSize() {
    if (isMobile()) {
      Object.assign(container.style, {
        top: '0', left: '0', bottom: 'auto', right: 'auto',
        width: '100vw', height: '100dvh',
        maxWidth: '100vw', maxHeight: '100dvh',
        borderRadius: '0', boxShadow: 'none',
      });
    } else {
      var isLeft = _pos === 'bottom-left' || _pos === 'middle-left';
      var isMid  = _pos === 'middle-left' || _pos === 'middle-right';
      Object.assign(container.style, {
        right:     isLeft ? 'auto'  : '96px',
        left:      isLeft ? '96px'  : 'auto',
        bottom:    isMid  ? 'auto'  : '96px',
        top:       isMid  ? 'calc(50% - 290px)' : 'auto',
        width:     '380px',
        height:    '580px',
        maxWidth:  isLeft ? 'calc(100vw - 110px)' : 'calc(100vw - 110px)',
        maxHeight: isMid  ? 'calc(100vh - 40px)'  : 'calc(100vh - 120px)',
        borderRadius: '16px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.28)',
      });
    }
  }

  applyContainerSize();
  window.addEventListener('resize', function () { if (isOpen) applyContainerSize(); });

  var iframe = document.createElement('iframe');
  iframe.src = origin + '/widget?clientId=' + encodeURIComponent(clientId);
  iframe.title = 'Vaughan chat';
  iframe.setAttribute('allow', 'clipboard-write');
  Object.assign(iframe.style, { width: '100%', height: '100%', border: 'none', display: 'block' });
  container.appendChild(iframe);

  var overlay = document.createElement('div');
  Object.assign(overlay.style, { position: 'fixed', inset: '0', zIndex: '2147483645', display: 'none' });

  /* ── 7. Toggle state ─────────────────────────────────────────────────────── */
  var isOpen = false;

  var closeInner =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  overlay.addEventListener('click', function () { if (isOpen) closeFab(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) closeFab(); });
  window.addEventListener('message', function (e) { if (e.data === 'vaughan:close' && isOpen) closeFab(); });

  var _chatInner = '';

  function openFab() {
    isOpen = true;
    applyContainerSize();
    container.style.display   = 'block';
    container.style.animation = 'ea-widget-in 0.28s cubic-bezier(0.22,1,0.36,1) both';
    overlay.style.display     = isMobile() ? 'none' : 'block';
    fabWrap.style.display     = isMobile() ? 'none' : 'flex';
    liveDot.style.display     = 'none';
    fab.innerHTML = closeInner;
    fab.setAttribute('aria-label', 'Close chat');
  }

  function closeFab() {
    isOpen = false;
    container.style.display = 'none';
    overlay.style.display   = 'none';
    fabWrap.style.display   = 'flex';
    liveDot.style.display   = 'block';
    fab.innerHTML = _chatInner;
    fab.setAttribute('aria-label', 'Open chat');
  }

  /* ── 8. Apply brand colour ──────────────────────────────────────────────── */
  function applyColor(hex) {
    var rgb = hexRgb(hex);

    /* Radar ring */
    radar.style.borderColor = 'rgba(' + rgb + ',0.5)';

    /* FAB background */
    fab.style.background = 'linear-gradient(135deg, ' + hex + ' 0%, rgba(' + rgb + ',0.82) 100%)';
    fab.style.boxShadow  = 'var(--ea-glow-rest)';

    /* CSS custom props for breathing animation */
    fab.style.setProperty('--ea-glow-rest',
      '0 4px 20px rgba(' + rgb + ',0.35), inset 0 1px 0 rgba(255,255,255,0.22)');
    fab.style.setProperty('--ea-glow-peak',
      '0 6px 36px rgba(' + rgb + ',0.65), 0 0 18px rgba(' + rgb + ',0.3), inset 0 1px 0 rgba(255,255,255,0.22)');

    /* Start breathing glow (delayed to after entrance) */
    fab.style.animation = 'ea-breathe 3.5s ease-in-out 2.6s infinite';

    /* Chat icon */
    _chatInner =
      '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 32 32" fill="none">' +
        '<path d="M16 3C9.373 3 4 7.925 4 14c0 3.13 1.387 5.958 3.636 8.003L6 29l6.5-3.25A13.6 13.6 0 0 0 16 26c6.627 0 12-4.925 12-11S22.627 3 16 3Z" fill="white" opacity="0.95"/>' +
        '<circle cx="11" cy="14" r="1.5" fill="' + hex + '" opacity="0.9"/>' +
        '<circle cx="16" cy="14" r="1.5" fill="' + hex + '" opacity="0.9"/>' +
        '<circle cx="21" cy="14" r="1.5" fill="' + hex + '" opacity="0.9"/>' +
      '</svg>';

    fab.innerHTML = _chatInner;
    fab.onclick = null;
    fab.addEventListener('click', function () {
      if (isOpen) { closeFab(); } else { openFab(); }
    });
  }

  /* ── 9. Mount ───────────────────────────────────────────────────────────── */
  function mount() {
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    document.body.appendChild(fabWrap);

    if (colorArg) {
      applyFabPosition('bottom-right');
      applyColor(colorArg);
    } else {
      fetch(origin + '/api/client-config/' + encodeURIComponent(clientId))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          applyFabPosition(d.widgetPosition || 'bottom-right');
          applyColor(d.brandColour || '#1a365d');
        })
        .catch(function () {
          applyFabPosition('bottom-right');
          applyColor('#1a365d');
        });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
