import { YALCS } from 'types/yalcs';

declare global {
  namespace NodeJS {
    interface Process {
      enve: YALCS.Env.Loader;
    }
  }
}

const iframe: HTMLIFrameElement = document.createElement('iframe');
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

window.addEventListener('message', event => {
  const { yalcs, show } = event.data as YALCS.EventData;
  if (!yalcs) return;

  // Display chat window
  if (show) {
    // Modal
    if (window.innerWidth > 600) {
      iframe.style.height = '500px';
      iframe.style.width = '300px';
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
