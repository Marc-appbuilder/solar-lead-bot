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
    return window.innerWidth <= 640;
  }

  /* ── 4. Animations ───────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent =
    '@keyframes ea-pop-in{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}' +
    '@keyframes ea-widget-in{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    '@keyframes ea-glow-pulse{0%,100%{box-shadow:0 4px 24px rgba(' + rgb + ',0.5),0 0 0 0 rgba(' + rgb + ',0.3)}' +
    '50%{box-shadow:0 6px 32px rgba(' + rgb + ',0.7),0 0 0 8px rgba(' + rgb + ',0)}}';
  document.head.appendChild(style);

  /* ── 5. Build the FAB bubble ─────────────────────────────────────────────── */
  var fab = document.createElement('button');
  fab.setAttribute('aria-label', 'Open chat');
  fab.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
    '</svg>';

  Object.assign(fab.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483647',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    background: brandColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 24px rgba(' + rgb + ',0.5)',
    animation: 'ea-pop-in 0.4s cubic-bezier(0.34,1.4,0.64,1) 0.5s both, ea-glow-pulse 2.5s ease-in-out 1s infinite',
    transition: 'transform 0.15s ease',
  });

  fab.addEventListener('mouseover', function () { fab.style.transform = 'scale(1.1)'; });
  fab.addEventListener('mouseout',  function () { fab.style.transform = 'scale(1)'; });

  /* ── 6. Build the widget container ──────────────────────────────────────── */
  var container = document.createElement('div');

  function applyContainerSize() {
    if (isMobile()) {
      Object.assign(container.style, {
        bottom: '0',
        right: '0',
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        borderRadius: '0',
        boxShadow: 'none',
      });
    } else {
      Object.assign(container.style, {
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

  var closeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5" stroke-linecap="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  var chatIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
    '</svg>';

  function openWidget() {
    isOpen = true;
    applyContainerSize();
    container.style.display = 'block';
    container.style.animation = 'ea-widget-in 0.28s cubic-bezier(0.22,1,0.36,1) both';
    overlay.style.display = isMobile() ? 'none' : 'block';
    fab.innerHTML = closeIcon;
    fab.setAttribute('aria-label', 'Close chat');
  }

  function closeWidget() {
    isOpen = false;
    container.style.display = 'none';
    overlay.style.display = 'none';
    fab.innerHTML = chatIcon;
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
    document.body.appendChild(fab);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
