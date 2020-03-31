import { Yalcs } from 'types/yalcs';

declare global {
  namespace NodeJS {
    interface Process {
      enve: Yalcs.Env.Loader;
    }
  }
}

let iframe: HTMLIFrameElement | undefined;

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
 * Called on URL change to determine if we should add or remove iframe.
 */
function onRouteChange(): void {
  // Determine if the iframe should be inserted on the current route
  let allowed = false;
  for (let route of process.enve.ROUTES) {
    if (new RegExp(route).test(location.href)) {
      allowed = true;
      break;
    }
  }

  // Insert iframe if allowed and not already inserted
  if (allowed && !iframe) {
    createIframe();
  }
  // Remove iframe if not allowed and currently inserted
  else if (!allowed && iframe) {
    iframe.remove();
    iframe = undefined;
  }
}

window.addEventListener('message', event => {
  if(event.data == 'get_context') {
    console.log('yalcs get context');
    console.log('context is :', window.yalcs_context);
    if(window.yalcs_context) {
      event.source.postMessage(window.yalcs_context, '*');
    }
  }
  const { yalcs, show, link } = event.data as Yalcs.EventData;
  if (!yalcs || !iframe) return;

  // Open link from iframe in a new tab
  if (link) return window.open(link);

  // Listen for changes to the web app's `state.show` value so we can change
  // the iframe's size accordingly

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
window.addEventListener('popstate', onRouteChange);

// These don't trigger popstate events so we need to replace them
const { replaceState, pushState } = window.history;
window.history.replaceState = function() {
  // @ts-ignore
  replaceState.call(window.history, ...arguments);
  onRouteChange();
};
window.history.pushState = function() {
  // @ts-ignore
  pushState.call(window.history, ...arguments);
  onRouteChange();
};

onRouteChange();
