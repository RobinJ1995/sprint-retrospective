// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config) {
  if (!(process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator)) {
    console.debug('Skipping service worker registration.', {
      "process.env.NODE_ENV === 'production'": process.env.NODE_ENV === 'production',
      "'serviceWorker' in navigator": 'serviceWorker' in navigator
    });
    return;
  }

  // The URL constructor is available in all browsers that support SW.
  const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  if (publicUrl.origin !== window.location.origin) {
    // Our service worker won't work if PUBLIC_URL is on a different origin
    // from what our page is served on. This might happen if a CDN is used to
    // serve assets; see https://github.com/facebook/create-react-app/issues/2374
    console.debug('Skipping servuice worker registration.', {
      'publicUrl.origin': publicUrl.origin,
      'window.location.origin': window.location.origin
    });
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    if (isLocalhost) {
      console.debug('Running on localhost.');

      // This is running on localhost. Let's check if a service worker still exists or not.
      checkValidServiceWorker(swUrl, config);

      // Add some additional logging to localhost, pointing developers to the
      // service worker/PWA documentation.
      navigator.serviceWorker.ready.then(() => {
        console.log(
          'This web app is being served cache-first by a service ' +
            'worker. To learn more, visit https://cra.link/PWA'
        );
      });
    } else {
      // Is not localhost. Just register service worker
      registerValidSW(swUrl, config);
    }
  });
}

function registerValidSW(swUrl: string, config?: Config) {
  console.debug('Registering service worker...', {
    swUrl,
    config
  });
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.debug('Service worker registered.', { registration });
      registration.onupdatefound = () => {
        console.debug('Service worker: update found...');
        const installingWorker = registration.installing;

        if (installingWorker == null) {
          console.debug('Service worker: update found, but installingWorker==null. Doing nothing.', {
            registration,
            installingWorker
          });
          return;
        }

        installingWorker.onstatechange = () => {
          console.debug('Service worker: Installing worker: state changed...');
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                console.debug('Service worker: Triggering onUpdate callback.', { config });
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                console.debug('Service worker: Triggering onSuccess callback.', { config });
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        console.debug('No service worker found. Scheduling page reload.');
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else if ([500, 503].includes(response.status)) {
        // Kubernetes went into meltdown again. Let's just leave it for now...
        console.debug(`Service worker check failed with HTTP ${response.status} response. Doing nothing.`);
        return;
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    console.debug('Unregistering service worker...');
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
