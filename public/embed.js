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
    /* Radar / sonar pulse — emanates from circle outward */
    '@keyframes ea-pulse{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.6);opacity:0}}';
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

    /* On mobile always use bottom-right — admin positions are desktop-only */
    if (isMobile()) {
      Object.assign(fabWrap.style, {
        bottom: '24px', top: 'auto', right: '24px', left: 'auto',
        animation: 'ea-fab-er 0.6s cubic-bezier(0.22,1,0.36,1) 2s both',
      });
      return;
    }

    var isLeft    = _pos.indexOf('left')  !== -1;
    var isFloated = _pos === 'middle-left'  || _pos === 'middle-right' ||
                    _pos === 'lower-left'   || _pos === 'lower-right';
    var topVal    = _pos === 'lower-left'   || _pos === 'lower-right' ? '72%' : '50%';
    var anim      = isFloated
      ? (isLeft ? 'ea-fab-eml' : 'ea-fab-emr')
      : (isLeft ? 'ea-fab-el'  : 'ea-fab-er');

    Object.assign(fabWrap.style, {
      bottom: isFloated ? 'auto'  : '24px',
      top:    isFloated ? topVal  : 'auto',
      right:  isLeft    ? 'auto'  : '24px',
      left:   isLeft    ? '24px'  : 'auto',
      animation: anim + ' 0.6s cubic-bezier(0.22,1,0.36,1) 2s both',
    });

    /* Apply any drag offset saved this session (overrides admin position,
       but only until the user closes the tab / clears the session) */
    try {
      var saved = sessionStorage.getItem('__vaughan_fab_' + clientId);
      if (saved && !isMobile()) {
        var p = JSON.parse(saved);
        var c = _clampFab(p.x, p.y);
        Object.assign(fabWrap.style, {
          bottom: 'auto', right: 'auto',
          left: c[0] + 'px', top: c[1] + 'px',
          animation: 'none',
        });
        _dragged = true;
      }
    } catch (_) {}
  }

  /* ── Drag (desktop only) ─────────────────────────────────────────────── */
  var _dragged     = false; // true once the FAB has been dragged at least once
  var _dragging    = false; // true during an active drag move
  var _justDragged = false; // used to swallow the click that follows a drag-end

  function _clampFab(x, y) {
    var pad = 8;
    return [
      Math.max(pad, Math.min(window.innerWidth  - 64 - pad, x)),
      Math.max(pad, Math.min(window.innerHeight - 64 - pad, y)),
    ];
  }

  function _repoContainer() {
    var rect = fabWrap.getBoundingClientRect();
    var cw = 380, ch = 580, gap = 12, pad = 8;
    var fx = rect.left, fy = rect.top;
    // Prefer left of FAB when FAB is in the right half of the screen, else right
    var left = fx > window.innerWidth / 2
      ? fx - cw - gap
      : fx + 64 + gap;
    left = Math.max(pad, Math.min(window.innerWidth - cw - pad, left));
    // Prefer above FAB when in the bottom half, else below
    var top = fy + ch > window.innerHeight - pad
      ? fy - ch + 64
      : fy;
    top = Math.max(pad, Math.min(window.innerHeight - ch - pad, top));
    Object.assign(container.style, {
      left: left + 'px', top: top + 'px',
      right: 'auto', bottom: 'auto', transform: 'none',
    });
  }

  fabWrap.addEventListener('mousedown', function (e) {
    if (isMobile() || e.button !== 0) return;
    var rect = fabWrap.getBoundingClientRect();
    var startX = rect.left, startY = rect.top;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    _dragging = false;

    /* Snapshot current visual position as top/left so we can freely move it */
    fabWrap.style.animation = 'none';
    fabWrap.style.bottom = 'auto'; fabWrap.style.right = 'auto';
    fabWrap.style.left = startX + 'px'; fabWrap.style.top = startY + 'px';

    function onMove(ev) {
      var nx = ev.clientX - dx, ny = ev.clientY - dy;
      if (!_dragging && (Math.abs(nx - startX) > 4 || Math.abs(ny - startY) > 4)) {
        _dragging = true;
        _dragged  = true;
        document.body.style.userSelect = 'none';
      }
      if (!_dragging) return;
      var c = _clampFab(nx, ny);
      fabWrap.style.left = c[0] + 'px';
      fabWrap.style.top  = c[1] + 'px';
      if (isOpen) _repoContainer();
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      document.body.style.userSelect = '';
      if (_dragging) {
        _justDragged = true;
        try {
          var rect2 = fabWrap.getBoundingClientRect();
          sessionStorage.setItem('__vaughan_fab_' + clientId,
            JSON.stringify({ x: rect2.left, y: rect2.top }));
        } catch (_) {}
      }
      _dragging = false;
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });

  /* Clamp FAB back on-screen if window is resized after dragging */
  window.addEventListener('resize', function () {
    if (_dragged && !isMobile()) {
      var rect = fabWrap.getBoundingClientRect();
      var c = _clampFab(rect.left, rect.top);
      fabWrap.style.left = c[0] + 'px';
      fabWrap.style.top  = c[1] + 'px';
    }
    if (isOpen) { if (_dragged && !isMobile()) { _repoContainer(); } else { applyContainerSize(); } }
  });

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

  /* Reset-position button — appears on hover when FAB has been dragged */
  var resetBtn = document.createElement('button');
  resetBtn.setAttribute('aria-label', 'Reset position');
  resetBtn.setAttribute('title', 'Reset position');
  resetBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>' +
      '<path d="M3 3v5h5"/>' +
    '</svg>';
  Object.assign(resetBtn.style, {
    position:        'absolute',
    top:             '-8px',
    right:           '-8px',
    width:           '22px',
    height:          '22px',
    borderRadius:    '50%',
    border:          'none',
    background:      'rgba(30,30,40,0.92)',
    color:           'rgba(255,255,255,0.75)',
    cursor:          'pointer',
    display:         'none',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         '0',
    boxShadow:       '0 2px 8px rgba(0,0,0,0.4)',
    zIndex:          '1',
    transition:      'background 0.15s ease',
  });
  resetBtn.addEventListener('mouseover', function () { resetBtn.style.background = 'rgba(60,60,80,0.98)'; });
  resetBtn.addEventListener('mouseout',  function () { resetBtn.style.background = 'rgba(30,30,40,0.92)'; });
  resetBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    try { sessionStorage.removeItem('__vaughan_fab_' + clientId); } catch (_) {}
    _dragged = false;
    resetBtn.style.display = 'none';
    /* Re-apply the admin position */
    applyFabPosition(_pos);
    if (isOpen) applyContainerSize();
  });

  fabWrap.addEventListener('mouseover', function () {
    if (_dragged && !isMobile()) resetBtn.style.display = 'flex';
  });
  fabWrap.addEventListener('mouseout', function (e) {
    if (!fabWrap.contains(e.relatedTarget)) resetBtn.style.display = 'none';
  });

  fabWrap.appendChild(radar);
  fabWrap.appendChild(fab);
  fabWrap.appendChild(resetBtn);

  /* ── 6. Widget container ─────────────────────────────────────────────────── */
  var container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed', zIndex: '2147483646',
    overflow: 'hidden', display: 'none', transformOrigin: 'bottom right',
  });

  function applyContainerSize() {
    if (isMobile()) {
      Object.assign(container.style, {
        top: '50%', left: '12px', right: '12px', bottom: 'auto',
        width: 'auto', height: '65dvh',
        maxWidth: 'none', maxHeight: '75dvh',
        borderRadius: '16px', boxShadow: '0 12px 48px rgba(0,0,0,0.32)',
        transform: 'translateY(-50%)',
      });
    } else {
      var isLeft    = _pos.indexOf('left') !== -1;
      var isFloated = _pos === 'middle-left' || _pos === 'middle-right' ||
                      _pos === 'lower-left'  || _pos === 'lower-right';
      var topVal    = _pos === 'lower-left' || _pos === 'lower-right'
        ? 'calc(72% - 290px)' : 'calc(50% - 290px)';
      Object.assign(container.style, {
        right:     isLeft    ? 'auto'  : '96px',
        left:      isLeft    ? '96px'  : 'auto',
        bottom:    isFloated ? 'auto'  : '96px',
        top:       isFloated ? topVal  : 'auto',
        width:     '380px',
        height:    '580px',
        maxWidth:  'calc(100vw - 110px)',
        maxHeight: isFloated ? 'calc(100vh - 40px)' : 'calc(100vh - 120px)',
        borderRadius: '16px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.28)',
      });
    }
  }

  applyContainerSize();

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
    if (_dragged && !isMobile()) { _repoContainer(); } else { applyContainerSize(); }
    container.style.display   = 'block';
    container.style.animation = 'ea-widget-in 0.28s cubic-bezier(0.22,1,0.36,1) both';
    overlay.style.display     = isMobile() ? 'block' : 'block';
    fabWrap.style.display     = 'flex';
    radar.style.animationPlayState = 'paused';
    fab.innerHTML = closeInner;
    fab.setAttribute('aria-label', 'Close chat');
  }

  function closeFab() {
    isOpen = false;
    container.style.display = 'none';
    overlay.style.display   = 'none';
    fabWrap.style.display   = 'flex';
    radar.style.animationPlayState = 'running';
    fab.innerHTML = _chatInner;
    fab.setAttribute('aria-label', 'Open chat');
  }

  /* ── 8. Apply brand colour ──────────────────────────────────────────────── */
  function applyColor(hex) {
    var rgb = hexRgb(hex);

    /* Radar pulse ring — expands outward from circle using brand colour */
    radar.style.borderColor = 'rgba(' + rgb + ',0.55)';
    radar.style.animation   = 'ea-pulse 3s ease-out 2.8s infinite';

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
      if (_justDragged) { _justDragged = false; return; }
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
