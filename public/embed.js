/**
 * Vaughan embed script
 *
 * Usage — paste before </body> on any page:
 *   <script src="https://app.vaughanai.co/embed.js?clientId=demo" async></script>
 *
 * Optional query params:
 *   clientId  — which agent config to load  (default: "demo")
 *   color     — override brand hex color    (auto-fetched from server if omitted)
 *
 * Modes:
 *   Unified button — when teaserText is set: single charcoal pill (icon + text)
 *                    replaces the circular FAB entirely.
 *   Standard FAB   — when no teaserText: regular circular chat button.
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
  var style = document.createElement('style');
  style.textContent =
    '@keyframes ea-pop-in{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}' +
    '@keyframes ea-widget-in{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    '@keyframes ea-radar{0%{transform:scale(1);opacity:0.85}100%{transform:scale(2.8);opacity:0}}';
  document.head.appendChild(style);

  /* ── 5. Unified launcher button (used when teaserText is set) ───────────── */
  var launcher = document.createElement('button');
  launcher.setAttribute('aria-label', 'Open chat');
  Object.assign(launcher.style, {
    position:      'fixed',
    zIndex:        '2147483647',
    background:    '#3a3a3a',
    color:         '#ffffff',
    fontSize:      '14px',
    fontWeight:    '600',
    letterSpacing: '0.01em',
    fontFamily:    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding:       '12px 20px 12px 16px',
    borderRadius:  '14px',
    border:        'none',
    outline:       'none',
    boxShadow:     '0 4px 20px rgba(0,0,0,0.28), 0 1px 6px rgba(0,0,0,0.15)',
    whiteSpace:    'nowrap',
    cursor:        'pointer',
    display:       'none',
    alignItems:    'center',
    gap:           '9px',
    transition:    'transform 0.15s ease, box-shadow 0.15s ease',
    animation:     'ea-pop-in 0.4s cubic-bezier(0.34,1.4,0.64,1) 0.8s both',
  });
  launcher.addEventListener('mouseover', function () {
    launcher.style.transform  = 'scale(1.04)';
    launcher.style.boxShadow  = '0 6px 28px rgba(0,0,0,0.35), 0 1px 6px rgba(0,0,0,0.15)';
  });
  launcher.addEventListener('mouseout', function () {
    launcher.style.transform  = 'scale(1)';
    launcher.style.boxShadow  = '0 4px 20px rgba(0,0,0,0.28), 0 1px 6px rgba(0,0,0,0.15)';
  });

  /* ── 6. Standard circular FAB (used when no teaserText) ─────────────────── */
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

  /* Overlay (desktop click-outside to close) */
  var overlay = document.createElement('div');
  Object.assign(overlay.style, { position: 'fixed', inset: '0', zIndex: '2147483645', display: 'none' });

  /* ── 8. Sizing / positioning ─────────────────────────────────────────────── */
  var unifiedMode = false; // set true once we know teaserText is configured

  function applyContainerSize() {
    if (isMobile()) {
      Object.assign(container.style, {
        top: '0', left: '0', bottom: 'auto', right: 'auto',
        width: '100vw', height: '100dvh',
        maxWidth: '100vw', maxHeight: '100dvh',
        borderRadius: '0', boxShadow: 'none', transform: 'none',
      });
    } else if (unifiedMode) {
      /* Unified: open to the left of the launcher pill */
      Object.assign(container.style, {
        top: 'calc(65% - 290px)', right: '195px', bottom: 'auto', left: 'auto',
        width: '380px', height: '580px',
        maxWidth: 'calc(100vw - 220px)', maxHeight: 'calc(100vh - 40px)',
        borderRadius: '16px', boxShadow: '0 12px 48px rgba(0,0,0,0.28)', transform: 'none',
      });
    } else {
      /* Standard: open above the FAB */
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
      });
    } else {
      Object.assign(launcher.style, {
        top: '65%', right: '30px',
        bottom: 'auto', transform: 'translateY(-50%)',
      });
    }
  }

  applyContainerSize();
  window.addEventListener('resize', function () {
    if (unifiedMode) applyLauncherPosition();
    if (isOpen) applyContainerSize();
  });

  /* ── 9. Open / close helpers ─────────────────────────────────────────────── */
  var isOpen = false;

  var closeIconSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  var chatIconSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:0.9">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
    '</svg>';

  function showLauncher(labelHtml) {
    if (unifiedMode) {
      launcher.innerHTML = chatIconSvg + '<span>' + labelHtml + '</span>';
      launcher.style.display = 'flex';
      launcher.setAttribute('aria-label', 'Open chat');
    } else {
      fabWrap.style.display = 'flex';
    }
  }

  function hideLauncherOrShowClose() {
    if (unifiedMode) {
      if (isMobile()) {
        launcher.style.display = 'none';
      } else {
        /* Stay visible as a close button */
        launcher.innerHTML = closeIconSvg + '<span>Close</span>';
        launcher.setAttribute('aria-label', 'Close chat');
      }
    } else {
      fabWrap.style.display = isMobile() ? 'none' : 'flex';
    }
  }

  function doOpen() {
    isOpen = true;
    applyContainerSize();
    container.style.display   = 'block';
    container.style.animation = 'ea-widget-in 0.28s cubic-bezier(0.22,1,0.36,1) both';
    overlay.style.display     = isMobile() ? 'none' : 'block';
    hideLauncherOrShowClose();
  }

  function doClose(labelHtml) {
    isOpen = false;
    container.style.display = 'none';
    overlay.style.display   = 'none';
    showLauncher(labelHtml);
  }

  /* Overlay click / Escape / postMessage close */
  overlay.addEventListener('click', function () { doClose(launcher._label); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) doClose(launcher._label);
  });
  window.addEventListener('message', function (e) {
    if (e.data === 'vaughan:close' && isOpen) doClose(launcher._label);
  });

  /* ── 10. Apply brand colour ─────────────────────────────────────────────── */
  var fabCloseInner =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  function applyColor(hex) {
    var rgb = hexRgb(hex);

    /* Standard FAB styling */
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
        doClose('');
      } else {
        fab.innerHTML = fabCloseInner;
        fab.setAttribute('aria-label', 'Close chat');
        doOpen();
      }
    });
  }

  /* ── 11. Mount ───────────────────────────────────────────────────────────── */
  function mount() {
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    document.body.appendChild(launcher);
    document.body.appendChild(fabWrap);

    if (colorArg) {
      applyColor(colorArg);
      /* No teaserText in inline-color mode — standard FAB */
      fabWrap.style.display = 'flex';
    } else {
      fetch(origin + '/api/client-config/' + encodeURIComponent(clientId))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          applyColor(d.brandColour || '#1a365d');

          if (d.teaserText) {
            /* Unified button mode */
            unifiedMode = true;
            fabWrap.style.display = 'none'; // hide circular FAB forever
            launcher._label = d.teaserText;
            launcher.innerHTML = chatIconSvg + '<span>' + d.teaserText + '</span>';
            applyLauncherPosition();
            launcher.style.display = 'flex';

            launcher.onclick = null;
            launcher.addEventListener('click', function () {
              if (isOpen) { doClose(d.teaserText); } else { doOpen(); }
            });
          } else {
            /* Standard FAB mode */
            fabWrap.style.display = 'flex';
          }
        })
        .catch(function () {
          applyColor('#1a365d');
          fabWrap.style.display = 'flex';
        });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
