/**
 * EstateAssist embed script
 *
 * Usage — paste before </body> on any page:
 *   <script src="https://your-domain.com/embed.js?clientId=demo" async></script>
 *
 * Optional query params:
 *   clientId  — which agent config to load  (default: "demo")
 *   color     — override the tab hex color  (default: "#1a365d")
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
  var tabColor = srcUrl.searchParams.get('color') || '#1a365d';

  /* Derive a legible foreground colour for any background hex */
  function contrastColor(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#111111' : '#ffffff';
  }
  var tabFg = contrastColor(tabColor);

  /* ── 2. Avoid double-init ────────────────────────────────────────────────── */
  if (window.__montyLoaded) return;
  window.__montyLoaded = true;

  /* ── 3. Animations ───────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    /* Tab slides in from the right edge with a spring */
    '@keyframes ea-tab-in{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}',
    /* Widget pops up from bottom-right */
    '@keyframes ea-widget-in{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}',
  ].join('');
  document.head.appendChild(style);

  /* ── 4. Build the sticky tab ─────────────────────────────────────────────── */
  var tab = document.createElement('button');
  tab.setAttribute('aria-label', 'Open property chat');

  /* Pill shape flush with the right edge — rounded on left, flat on right */
  Object.assign(tab.style, {
    position: 'fixed',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: '2147483647',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '13px 18px 13px 16px',
    border: 'none',
    borderRadius: '10px 0 0 10px',
    cursor: 'pointer',
    background: tabColor,
    boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
    color: tabFg,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    fontSize: '13.5px',
    fontWeight: '600',
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    lineHeight: '1',
    /* Spring entrance — delayed slightly so page loads first */
    animation: 'ea-tab-in 0.55s cubic-bezier(0.34,1.4,0.64,1) 0.6s both',
    transition: 'background 0.2s ease, box-shadow 0.2s ease, padding-right 0.2s ease',
    WebkitFontSmoothing: 'antialiased',
  });

  var chatIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
    '</svg>';

  function setTabIdle() {
    tab.innerHTML = chatIcon + '<span>Chat with us</span>';
    tab.setAttribute('aria-label', 'Open property chat');
  }

  function setTabActive() {
    var closeIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>';
    tab.innerHTML = closeIcon + '<span>Close</span>';
    tab.setAttribute('aria-label', 'Close property chat');
  }

  setTabIdle();

  /* Hover: nudge left slightly to hint it's clickable */
  tab.addEventListener('mouseover', function () {
    tab.style.paddingRight = '22px';
    tab.style.boxShadow = '-6px 0 28px rgba(0,0,0,0.26)';
  });
  tab.addEventListener('mouseout', function () {
    tab.style.paddingRight = '18px';
    tab.style.boxShadow = '-4px 0 24px rgba(0,0,0,0.18)';
  });

  /* ── 5. Build the widget container ──────────────────────────────────────── */
  var container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '24px',
    right: '16px',
    zIndex: '2147483646',
    width: '380px',
    height: '580px',
    maxWidth: 'calc(100vw - 24px)',
    maxHeight: 'calc(100vh - 40px)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
    display: 'none',
    transformOrigin: 'bottom right',
  });

  var iframe = document.createElement('iframe');
  iframe.src = origin + '/widget?clientId=' + encodeURIComponent(clientId);
  iframe.title = 'Monty chat';
  iframe.setAttribute('allow', 'clipboard-write');
  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '16px',
    display: 'block',
  });

  container.appendChild(iframe);

  /* ── 6. Close-on-outside-click overlay ──────────────────────────────────── */
  var overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483645',
    display: 'none',
  });
  overlay.addEventListener('click', closeWidget);

  /* ── 7. Toggle logic ─────────────────────────────────────────────────────── */
  var isOpen = false;

  function openWidget() {
    isOpen = true;
    container.style.display = 'block';
    container.style.animation = 'ea-widget-in 0.28s cubic-bezier(0.22,1,0.36,1) both';
    overlay.style.display = 'block';
    setTabActive();
  }

  function closeWidget() {
    isOpen = false;
    container.style.display = 'none';
    overlay.style.display = 'none';
    setTabIdle();
  }

  tab.addEventListener('click', function () {
    if (isOpen) { closeWidget(); } else { openWidget(); }
  });

  /* ── 8. Escape to close ──────────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeWidget();
  });

  /* ── 9. Mount ────────────────────────────────────────────────────────────── */
  function mount() {
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    document.body.appendChild(tab);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
