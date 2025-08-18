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
