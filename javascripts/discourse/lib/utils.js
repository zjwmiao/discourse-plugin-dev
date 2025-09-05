/**
 * @template {function} T
 * @param {T} fn fn
 * @param {number} delay dealy
 * @returns {T}
 */
export function debounce(fn, delay = 10) {
  let timeout;
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
      clearTimeout(timeout);
      timeout = null;
    }, delay);
  };
}

const seqGenerator = (function* () {
  let i = 0;
  while (true) {
    yield i++;
  }
})();

/**
 * @param {string} selector css selector
 * @param {(HTMLElement) => void} callback callback
 * @param {boolean} once
 * @returns cancel function
 */
export function onNodeInserted(selector, callback, once) {
  const css = document.createElement("style");
  const detectorName = `__nodeInserted_${seqGenerator.next().value}`;
  css.innerHTML =
    `@keyframes ${detectorName} { from { transform: none; } to { transform: none; } }` +
    `${selector} { animation-duration: 0.01s; animation-name: ${detectorName}; }`;
  document.head.appendChild(css);

  const handler = (event) => {
    if (event.animationName === detectorName) {
      event.stopImmediatePropagation();
      if (once) {
        document.head.removeChild(css);
        document.removeEventListener("animationstart", handler);
      }
      callback(event.target);
    }
  };
  document.addEventListener("animationstart", handler);

  return () => {
    document.head.removeChild(css);
    document.removeEventListener("animationstart", handler);
  };
}
