/**
 * Vaughan embed script
 *
 * Usage — paste before </body> on any page:
 *   <script src="https://your-domain.com/embed.js?clientId=demo" async></script>
 *
 * Optional query params:
 *   clientId  — which agent config to load  (default: "demo")
 *   color     — override brand hex color    (default: "#1a365d")
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

  var srcUrl = new URL(scriptEl.src);
  var origin = srcUrl.origin;
  var clientId = srcUrl.searchParams.get('clientId') || 'demo';
  var brandColor = srcUrl.searchParams.get('color') || '#1a365d';

  /* RGB components for glow shadows */
  function hexRgb(hex) {
    return parseInt(hex.slice(1, 3), 16) + ',' +
           parseInt(hex.slice(3, 5), 16) + ',' +
           parseInt(hex.slice(5, 7), 16);
  }
  var rgb = hexRgb(brandColor);

  /* ── 2. Avoid double-init ────────────────────────────────────────────────── */
  if (window.__vaughanLoaded) return;
  window.__vaughanLoaded = true;

  /* ── 3. Detect mobile ────────────────────────────────────────────────────── */
  function isMobile() {
    return window.innerWidth <= 768;
  }

  /* ── 4. Animations ───────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent =
    '@keyframes ea-pop-in{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}' +
    '@keyframes ea-widget-in{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    '@keyframes ea-radar{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.2);opacity:0}}';
  document.head.appendChild(style);

  /* ── 5. Build the FAB bubble ─────────────────────────────────────────────── */
  var fabWrap = document.createElement('div');
  Object.assign(fabWrap.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483647',
    width: '64px',
    height: '64px',
  });

  /* Radar ping — single ring, expands and fades every 2s */
  var radar = document.createElement('span');
  Object.assign(radar.style, {
    position: 'absolute',
    inset: '0',
    borderRadius: '50%',
    border: '2px solid rgba(' + rgb + ',0.7)',
    animation: 'ea-radar 2s cubic-bezier(0.2,0.6,0.4,1) 1.2s infinite',
    pointerEvents: 'none',
    boxSizing: 'border-box',
  });

  var fab = document.createElement('button');
  fab.setAttribute('aria-label', 'Open chat');

  /* Speech bubble with lightning bolt inside */
  fab.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">' +
      /* Rounded speech bubble body */
      '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h15A2.5 2.5 0 0 1 24 5.5v11A2.5 2.5 0 0 1 21.5 19H15l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 16.5V5.5Z" fill="white" opacity="0.95"/>' +
      /* Lightning bolt */
      '<path d="M15.5 8l-3 5h2.5l-1 5 4-6h-2.5l1.5-4z" fill="' + brandColor + '"/>' +
    '</svg>';

  Object.assign(fab.style, {
    position: 'absolute',
    inset: '0',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, ' + brandColor + ' 0%, rgba(' + rgb + ',0.8) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 22px rgba(' + rgb + ',0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
    animation: 'ea-pop-in 0.45s cubic-bezier(0.34,1.4,0.64,1) 0.5s both',
    transition: 'transform 0.15s ease, box-shadow 0.2s ease',
  });

  fab.addEventListener('mouseover', function () {
    fab.style.transform = 'scale(1.1)';
    fab.style.boxShadow = '0 6px 30px rgba(' + rgb + ',0.8), inset 0 1px 0 rgba(255,255,255,0.25)';
  });
  fab.addEventListener('mouseout', function () {
    fab.style.transform = 'scale(1)';
    fab.style.boxShadow = '0 4px 22px rgba(' + rgb + ',0.6), inset 0 1px 0 rgba(255,255,255,0.25)';
  });

  fabWrap.appendChild(radar);
  fabWrap.appendChild(fab);

  /* ── 6. Build the widget container ──────────────────────────────────────── */
  var container = document.createElement('div');

  function applyContainerSize() {
    if (isMobile()) {
      Object.assign(container.style, {
        top: '0',
        left: '0',
        bottom: 'auto',
        right: 'auto',
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        borderRadius: '0',
        boxShadow: 'none',
      });
    } else {
      Object.assign(container.style, {
        top: 'auto',
        left: 'auto',
        bottom: '96px',
        right: '16px',
        width: '380px',
        height: '580px',
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 120px)',
        borderRadius: '16px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.28)',
      });
    }
  }

  Object.assign(container.style, {
    position: 'fixed',
    zIndex: '2147483646',
    overflow: 'hidden',
    display: 'none',
    transformOrigin: 'bottom right',
  });
  applyContainerSize();

  window.addEventListener('resize', function () {
    if (isOpen) applyContainerSize();
  });

  var iframe = document.createElement('iframe');
  iframe.src = origin + '/widget?clientId=' + encodeURIComponent(clientId);
  iframe.title = 'Vaughan chat';
  iframe.setAttribute('allow', 'clipboard-write');
  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  });

  container.appendChild(iframe);

  /* ── 7. Close-on-outside-click overlay ──────────────────────────────────── */
  var overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483645',
    display: 'none',
  });
  overlay.addEventListener('click', closeWidget);

  /* ── 8. Toggle logic ─────────────────────────────────────────────────────── */
  var isOpen = false;

  var chatInner =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">' +
      '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h15A2.5 2.5 0 0 1 24 5.5v11A2.5 2.5 0 0 1 21.5 19H15l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 16.5V5.5Z" fill="white" opacity="0.95"/>' +
      '<path d="M15.5 8l-3 5h2.5l-1 5 4-6h-2.5l1.5-4z" fill="' + brandColor + '"/>' +
    '</svg>';

  var closeInner =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  function openWidget() {
    isOpen = true;
    applyContainerSize();
    container.style.display = 'block';
    container.style.animation = 'ea-widget-in 0.28s cubic-bezier(0.22,1,0.36,1) both';
    overlay.style.display = isMobile() ? 'none' : 'block';
    fab.innerHTML = closeInner;
    fab.setAttribute('aria-label', 'Close chat');
  }

  function closeWidget() {
    isOpen = false;
    container.style.display = 'none';
    overlay.style.display = 'none';
    fab.innerHTML = chatInner;
    fab.setAttribute('aria-label', 'Open chat');
  }

  fab.addEventListener('click', function () {
    if (isOpen) { closeWidget(); } else { openWidget(); }
  });

  /* ── 9. Escape to close ──────────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeWidget();
  });

  /* ── 10. Mount ───────────────────────────────────────────────────────────── */
  function mount() {
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    document.body.appendChild(fabWrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
