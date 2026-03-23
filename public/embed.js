/**
 * Vaughan embed script
 *
 * Usage — paste before </body> on any page:
 *   <script src="https://app.vaughanai.co/embed.js?clientId=demo" async></script>
 *
 * Modes:
 *   Unified button — when teaserText is set: premium pill (white bg, brand colour)
 *   Standard FAB   — when no teaserText: circular chat button
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
    /* Standard FAB animations */
    '@keyframes ea-pop-in{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}' +
    '@keyframes ea-widget-in{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    '@keyframes ea-radar{0%{transform:scale(1);opacity:0.85}100%{transform:scale(2.8);opacity:0}}' +
    /* Unified pill: slide in from right */
    '@keyframes ea-slide-in{from{opacity:0;transform:translateY(-50%) translateX(110%)}to{opacity:1;transform:translateY(-50%) translateX(0)}}' +
    '@keyframes ea-slide-in-mob{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:translateX(0)}}' +
    /* Gentle breathing glow — colour injected via JS */
    '@keyframes ea-breathe{0%,100%{box-shadow:var(--ea-shadow-rest)}50%{box-shadow:var(--ea-shadow-glow)}}' +
    /* Live dot pulse */
    '@keyframes ea-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(0.75);opacity:0.55}}';
  document.head.appendChild(styleEl);

  /* ── 5. Unified launcher pill ───────────────────────────────────────────── */
  var launcher = document.createElement('button');
  launcher.setAttribute('aria-label', 'Open chat');
  Object.assign(launcher.style, {
    position:      'fixed',
    zIndex:        '2147483647',
    background:    '#ffffff',
    border:        'none',
    outline:       'none',
    borderRadius:  '999px',
    padding:       '11px 20px 11px 15px',
    cursor:        'pointer',
    display:       'none',
    alignItems:    'center',
    gap:           '10px',
    whiteSpace:    'nowrap',
    transition:    'transform 0.18s ease',
  });
  launcher.addEventListener('mouseover', function () { launcher.style.transform = isMobile() ? 'scale(1.03)' : 'translateY(-50%) scale(1.03)'; });
  launcher.addEventListener('mouseout',  function () { launcher.style.transform = isMobile() ? 'scale(1)'    : 'translateY(-50%)'; });

  /* Live availability dot */
  var liveDot = document.createElement('span');
  Object.assign(liveDot.style, {
    display:      'inline-block',
    width:        '8px',
    height:       '8px',
    borderRadius: '50%',
    background:   '#c9a84c',
    flexShrink:   '0',
    animation:    'ea-dot 2.2s ease-in-out infinite',
  });

  /* ── 6. Standard circular FAB ───────────────────────────────────────────── */
  var fabWrap = document.createElement('div');
  Object.assign(fabWrap.style, {
    position: 'fixed', bottom: '24px', right: '24px',
    zIndex: '2147483647', width: '64px', height: '64px', overflow: 'visible',
  });

  var radar = document.createElement('span');
  Object.assign(radar.style, {
    position: 'absolute', top: '0', left: '0',
    width: '64px', height: '64px', borderRadius: '50%',
    border: '3px solid transparent', boxSizing: 'border-box',
    animation: 'ea-radar 2s cubic-bezier(0.2,0.6,0.4,1) 1s infinite',
    pointerEvents: 'none', transformOrigin: 'center center',
  });

  var fab = document.createElement('button');
  fab.setAttribute('aria-label', 'Open chat');
  Object.assign(fab.style, {
    position: 'absolute', top: '0', left: '0',
    width: '64px', height: '64px', borderRadius: '50%', border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'ea-pop-in 0.45s cubic-bezier(0.34,1.4,0.64,1) 0.5s both',
    transition: 'transform 0.15s ease, box-shadow 0.2s ease',
  });
  fab.addEventListener('mouseover', function () { fab.style.transform = 'scale(1.1)'; });
  fab.addEventListener('mouseout',  function () { fab.style.transform = 'scale(1)'; });
  fabWrap.appendChild(radar);
  fabWrap.appendChild(fab);

  /* ── 7. Widget container ─────────────────────────────────────────────────── */
  var container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed', zIndex: '2147483646',
    overflow: 'hidden', display: 'none', transformOrigin: 'bottom right',
  });

  var iframe = document.createElement('iframe');
  iframe.src = origin + '/widget?clientId=' + encodeURIComponent(clientId);
  iframe.title = 'Vaughan chat';
  iframe.setAttribute('allow', 'clipboard-write');
  Object.assign(iframe.style, { width: '100%', height: '100%', border: 'none', display: 'block' });
  container.appendChild(iframe);

  var overlay = document.createElement('div');
  Object.assign(overlay.style, { position: 'fixed', inset: '0', zIndex: '2147483645', display: 'none' });

  /* ── 8. Sizing / positioning ─────────────────────────────────────────────── */
  var unifiedMode = false;

  function applyContainerSize() {
    if (isMobile()) {
      Object.assign(container.style, {
        top: '0', left: '0', bottom: 'auto', right: 'auto',
        width: '100vw', height: '100dvh',
        maxWidth: '100vw', maxHeight: '100dvh',
        borderRadius: '0', boxShadow: 'none', transform: 'none',
      });
    } else if (unifiedMode) {
      Object.assign(container.style, {
        top: 'calc(65% - 290px)', right: '195px', bottom: 'auto', left: 'auto',
        width: '380px', height: '580px',
        maxWidth: 'calc(100vw - 220px)', maxHeight: 'calc(100vh - 40px)',
        borderRadius: '16px', boxShadow: '0 12px 48px rgba(0,0,0,0.28)', transform: 'none',
      });
    } else {
      Object.assign(container.style, {
        top: 'auto', left: 'auto', bottom: '96px', right: '16px',
        width: '380px', height: '580px',
        maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 120px)',
        borderRadius: '16px', boxShadow: '0 12px 48px rgba(0,0,0,0.28)', transform: 'none',
      });
    }
  }

  function applyLauncherPosition() {
    if (isMobile()) {
      Object.assign(launcher.style, {
        bottom: '80px', right: '20px',
        top: 'auto', transform: 'none',
        animation: 'ea-slide-in-mob 0.55s cubic-bezier(0.22,1,0.36,1) 2s both',
      });
    } else {
      Object.assign(launcher.style, {
        top: '65%', right: '30px',
        bottom: 'auto', transform: 'translateY(-50%)',
        animation: 'ea-slide-in 0.55s cubic-bezier(0.22,1,0.36,1) 2s both',
      });
    }
  }

  applyContainerSize();
  window.addEventListener('resize', function () {
    if (unifiedMode) applyLauncherPosition();
    if (isOpen) applyContainerSize();
  });

  /* ── 9. Open / close ─────────────────────────────────────────────────────── */
  var isOpen = false;

  function buildOpenInner(hex) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="' + hex + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
      '</svg>';
  }

  var closeIconSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  function buildLauncherOpen(hex, label) {
    launcher.innerHTML =
      buildOpenInner(hex) +
      '<span style="font-size:14px;font-weight:600;letter-spacing:0.02em;color:' + hex + ';font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif">' + label + '</span>';
    launcher.appendChild(liveDot);
    launcher.setAttribute('aria-label', 'Open chat');
    /* Re-apply breathing animation each time launcher is restored */
    launcher.style.animation = isMobile()
      ? 'ea-breathe 3.5s ease-in-out 2.6s infinite'
      : 'ea-breathe 3.5s ease-in-out 2.6s infinite';
  }

  function buildLauncherClose(hex) {
    launcher.innerHTML =
      closeIconSvg +
      '<span style="font-size:14px;font-weight:600;letter-spacing:0.02em;color:' + hex + ';font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif">Close</span>';
    launcher.setAttribute('aria-label', 'Close chat');
    launcher.style.animation = 'none';
  }

  function showLauncher(hex, label) {
    if (unifiedMode) {
      buildLauncherOpen(hex, label);
      launcher.style.display = 'flex';
    } else {
      fabWrap.style.display = 'flex';
    }
  }

  function hideLauncherOrShowClose(hex) {
    if (unifiedMode) {
      if (isMobile()) {
        launcher.style.display = 'none';
      } else {
        buildLauncherClose(hex);
      }
    } else {
      fabWrap.style.display = isMobile() ? 'none' : 'flex';
    }
  }

  function doOpen(hex) {
    isOpen = true;
    applyContainerSize();
    container.style.display   = 'block';
    container.style.animation = 'ea-widget-in 0.28s cubic-bezier(0.22,1,0.36,1) both';
    overlay.style.display     = isMobile() ? 'none' : 'block';
    hideLauncherOrShowClose(hex);
  }

  function doClose(hex, label) {
    isOpen = false;
    container.style.display = 'none';
    overlay.style.display   = 'none';
    showLauncher(hex, label);
  }

  /* ── 10. Apply brand colour ─────────────────────────────────────────────── */
  var fabCloseInner =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  function applyColor(hex) {
    var rgb = hexRgb(hex);

    /* Standard FAB */
    radar.style.borderColor = 'rgba(' + rgb + ',0.9)';
    fab.style.background    = 'linear-gradient(135deg, ' + hex + ' 0%, rgba(' + rgb + ',0.8) 100%)';
    fab.style.boxShadow     = '0 4px 22px rgba(' + rgb + ',0.6), inset 0 1px 0 rgba(255,255,255,0.25)';
    fab.addEventListener('mouseover', function () {
      fab.style.boxShadow = '0 6px 30px rgba(' + rgb + ',0.8), inset 0 1px 0 rgba(255,255,255,0.25)';
    });
    fab.addEventListener('mouseout', function () {
      fab.style.boxShadow = '0 4px 22px rgba(' + rgb + ',0.6), inset 0 1px 0 rgba(255,255,255,0.25)';
    });

    var fabChatInner =
      '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 32 32" fill="none">' +
        '<path d="M16 3C9.373 3 4 7.925 4 14c0 3.13 1.387 5.958 3.636 8.003L6 29l6.5-3.25A13.6 13.6 0 0 0 16 26c6.627 0 12-4.925 12-11S22.627 3 16 3Z" fill="white" opacity="0.95"/>' +
        '<circle cx="11" cy="14" r="1.5" fill="' + hex + '" opacity="0.9"/>' +
        '<circle cx="16" cy="14" r="1.5" fill="' + hex + '" opacity="0.9"/>' +
        '<circle cx="21" cy="14" r="1.5" fill="' + hex + '" opacity="0.9"/>' +
      '</svg>';

    fab.innerHTML = fabChatInner;
    fab.onclick = null;
    fab.addEventListener('click', function () {
      if (isOpen) {
        fab.innerHTML = fabChatInner;
        fab.setAttribute('aria-label', 'Open chat');
        doClose(hex, '');
      } else {
        fab.innerHTML = fabCloseInner;
        fab.setAttribute('aria-label', 'Close chat');
        doOpen(hex);
      }
    });

    /* Unified pill: set CSS custom props for breathing glow */
    launcher.style.setProperty('--ea-shadow-rest',
      '0 4px 18px rgba(' + rgb + ',0.18), 0 1px 4px rgba(0,0,0,0.08)');
    launcher.style.setProperty('--ea-shadow-glow',
      '0 6px 32px rgba(' + rgb + ',0.42), 0 1px 4px rgba(0,0,0,0.08)');
    /* Static border tint using brand colour */
    launcher.style.boxShadow = 'var(--ea-shadow-rest)';
    /* Subtle brand-tinted border */
    launcher.style.border = '1px solid rgba(' + rgb + ',0.15)';
  }

  /* ── 11. Mount ───────────────────────────────────────────────────────────── */
  function mount() {
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    document.body.appendChild(launcher);
    document.body.appendChild(fabWrap);

    if (colorArg) {
      applyColor(colorArg);
      fabWrap.style.display = 'flex';
    } else {
      fetch(origin + '/api/client-config/' + encodeURIComponent(clientId))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var hex = d.brandColour || '#1a365d';
          applyColor(hex);

          if (d.teaserText) {
            unifiedMode = true;
            fabWrap.style.display = 'none';
            launcher._label = d.teaserText;
            launcher._hex   = hex;
            applyLauncherPosition();
            buildLauncherOpen(hex, d.teaserText);
            launcher.style.display = 'flex';

            launcher.onclick = null;
            launcher.addEventListener('click', function () {
              if (isOpen) { doClose(hex, d.teaserText); } else { doOpen(hex); }
            });
          } else {
            fabWrap.style.display = 'flex';
          }
        })
        .catch(function () {
          applyColor('#1a365d');
          fabWrap.style.display = 'flex';
        });
    }
  }

  overlay.addEventListener('click', function () { doClose(launcher._hex, launcher._label); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) doClose(launcher._hex, launcher._label);
  });
  window.addEventListener('message', function (e) {
    if (e.data === 'vaughan:close' && isOpen) doClose(launcher._hex, launcher._label);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
