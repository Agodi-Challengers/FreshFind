

const PROPERTY_ID = import.meta.env.VITE_TAWK_PROPERTY_ID;
const WIDGET_ID = import.meta.env.VITE_TAWK_WIDGET_ID;

export const tawkConfigured = Boolean(PROPERTY_ID && WIDGET_ID);

let loading = false;
let pendingOpen = false;

function api() {
  return window.Tawk_API;
}

export function loadTawk() {
  if (!tawkConfigured || loading || typeof window === 'undefined') return;
  loading = true;
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  const T = window.Tawk_API;
  T.customStyle = { visibility: { desktop: { position: 'br' }, mobile: { position: 'br' } } };
  T.onLoad = () => {
    if (pendingOpen) {
      pendingOpen = false;
      T.showWidget();
      T.maximize();
    } else {
      T.hideWidget();
    }
  };
  T.onChatMinimized = () => T.hideWidget();

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');
  document.body.appendChild(script);
}


export function openChat() {
  if (!tawkConfigured) return false;
  const T = api();
  if (T && typeof T.maximize === 'function') {
    T.showWidget();
    T.maximize();
  } else {
    pendingOpen = true;
    loadTawk();
  }
  return true;
}
