/**
 * @param {HTMLElement | () => HTMLElement} el element
 * @param {MutationCallback} callback callback
 * @param {MutationObserverInit | undefined} options options
 * @returns {() => void} cancel
 */
export default function useMutationObserver(el, callback, options) {
  el = typeof el === "function" ? el() : el;
  if (!el) {
    return () => {};
  }
  const obs = new MutationObserver(callback);
  obs.observe(el, options ?? {});
  return () => {
    obs.disconnect();
  };
}
