/**
 * Observe one image source without starting a fetch or owning presentation.
 *
 * Callbacks receive the image; onError also receives an Error. All callbacks
 * commit in microtasks, and only while the image is connected. onPending runs
 * at most once; exactly one of onReady/onError can follow. Disposing suppresses
 * even callbacks already queued by a completed decode. Dispose and watch again
 * when changing an image's source. Removing a scene should dispose its watchers.
 *
 * @param {HTMLImageElement} image
 * @param {{onReady?: Function, onError?: Function, onPending?: Function}} options
 * @returns {() => void}
 */
export function watchImage(image, {onReady, onError, onPending} = {}) {
  if (!image || typeof image.addEventListener !== 'function' || typeof image.removeEventListener !== 'function') {
    throw new TypeError('watchImage requires an image element');
  }

  let disposed = false;
  let settled = false;
  let decoding = false;

  const removeListeners = () => {
    image.removeEventListener('load', loaded);
    image.removeEventListener('error', failed);
  };
  const commit = (callback, ...args) => {
    if (!disposed && image.isConnected && typeof callback === 'function') callback(image, ...args);
  };
  const finish = (error) => {
    if (disposed || settled) return;
    settled = true;
    removeListeners();
    // Keep user callbacks outside the decode promise chain: a callback cannot
    // turn an otherwise handled decode rejection into an unhandled rejection.
    queueMicrotask(() => error ? commit(onError, error) : commit(onReady));
  };
  const decoded = (error) => {
    if (disposed || settled) return;
    // Some browsers reject decode() for an image they can still display.
    // Intrinsic width is the usability check, for both resolution and rejection.
    finish(image.naturalWidth > 0 ? undefined : error || new Error('Image has no usable pixels'));
  };
  function loaded() {
    if (disposed || settled || decoding) return;
    if (!(image.naturalWidth > 0)) {
      finish(new Error('Image failed to load'));
      return;
    }
    if (typeof image.decode !== 'function') {
      finish();
      return;
    }
    decoding = true;
    try {
      // Never decode an incomplete image merely because it is being watched:
      // doing so could eagerly fetch an offscreen loading="lazy" image.
      Promise.resolve(image.decode()).then(() => decoded(), error => decoded(error));
    } catch (error) {
      decoded(error);
    }
  }
  function failed() {
    finish(new Error('Image failed to load'));
  }

  image.addEventListener('load', loaded);
  image.addEventListener('error', failed);
  queueMicrotask(() => {
    if (!settled) commit(onPending);
  });
  // Listeners go on first so the cached check cannot miss an intervening load.
  if (image.complete) loaded();

  return () => {
    disposed = true;
    removeListeners();
  };
}

/** Watch a static snapshot, including root itself when it is an image. */
export function watchImages(root, options) {
  const images = new Set(root?.querySelectorAll?.('img') || []);
  if (root?.matches?.('img')) images.add(root);
  const cleanups = [...images].map(image => watchImage(image, options));
  return () => cleanups.forEach(cleanup => cleanup());
}
