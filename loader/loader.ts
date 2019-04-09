import { Yalcs } from 'types/yalcs';

declare global {
  namespace NodeJS {
    interface Process {
      enve: Yalcs.Env.Loader;
    }
  }
}

let iframe: HTMLIFrameElement;

/**
 * Create a 'closed' iframe (showing fab instead of chat window).
 */
function createIframe(): void {
  iframe = document.createElement('iframe');
  iframe.style.transition = '0.5s';
  iframe.style.position = 'fixed';
  iframe.style.zIndex = '999999999';
  iframe.style.border = 'none';
  iframe.style.bottom = '0';
  iframe.style.height = '80px';
  iframe.style.right = process.enve.FAB_ON_RIGHT ? '0' : '';
  iframe.style.width = '225px';
  iframe.src = process.enve.YALCS_WEB_URL;
  document.body.appendChild(iframe);
}

/**
 * Determine if the iframe should be inserted on the current route.
 */
function isRouteAllowed(): boolean {
  for (let route of process.enve.ROUTES) {
    if (new RegExp(route).test(location.href)) return true;
  }
  return false;
}

// Listen for changes to the web app's `state.show` value so we can change
// the iframe's size accordingly
window.addEventListener('message', event => {
  const { yalcs, show } = event.data as Yalcs.EventData;
  if (!yalcs || !iframe) return;

  // Display chat window
  if (show) {
    // Modal
    if (window.innerWidth > 600) {
      iframe.style.height = '500px';
      iframe.style.width = '350px';
    }
    // Fullscreen
    else {
      iframe.style.height = '100vh';
      iframe.style.width = '100vw';
    }
  }
  // Display fab
  else {
    iframe.style.height = '80px';
    iframe.style.width = '225px';
  }
});

// Listen for URL changes so we can add or remove iframe
window.addEventListener('popstate', () => {
  const allowed = isRouteAllowed();

  // Insert iframe if allowed and not already inserted
  if (allowed && !iframe) {
    createIframe();
  }
  // Remove iframe if not allowed and currently inserted
  else if (!allowed && iframe) {
    iframe.remove();
    iframe = null;
  }
});

// Create iframe if needed
if (isRouteAllowed()) createIframe();
