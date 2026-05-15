/**
 * Reactive state and interaction logic for the Sàng Eratosthenes grid.
 * Call createGridState() once per component; it returns a reactive proxy
 * whose properties are live $state reads (Svelte 5 runes).
 */

import { multiplesOf, isPrime } from '$lib/numtheory-engine/sieve.js';

const STAGGER_MS = 30;

/**
 * Detects prefers-reduced-motion in browser; false on SSR.
 * @returns {boolean}
 */
function detectReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * @param {(p: number, mults: number[]) => string} buildAnnouncement
 */
export function createGridState(buildAnnouncement) {
  /** @type {number[]} */
  let markedPrimes = $state([]);
  /** @type {Map<number, number[]>} */
  let crossings = $state(new Map());
  let rippling = $state(false);
  /** @type {number[]} */
  let pendingTimeouts = $state([]);
  let announcement = $state('');
  let focusIndex = $state(0);
  /** @type {number | null} */
  let shakeIndex = $state(null);
  /** @type {HTMLButtonElement[]} */
  const cellRefs = $state(new Array(100).fill(null));

  const reducedMotion = detectReducedMotion();

  /** @param {number} n */
  function handleCellActivate(n) {
    if (rippling) return;
    if (markedPrimes.includes(n)) return;

    if (!isPrime(n)) {
      shakeIndex = n - 1;
      setTimeout(() => { shakeIndex = null; }, 400);
      return;
    }

    markedPrimes = [...markedPrimes, n];
    const multiples = multiplesOf(n, 100);

    if (reducedMotion) {
      const next = new Map(crossings);
      for (const cell of multiples) {
        next.set(cell, [...(next.get(cell) ?? []), n]);
      }
      crossings = next;
      announcement = buildAnnouncement(n, multiples);
      return;
    }

    rippling = true;
    /** @type {number[]} */
    const newTids = [];

    for (let i = 0; i < multiples.length; i++) {
      const cell = multiples[i];
      const isLast = i === multiples.length - 1;
      const tid = /** @type {number} */ (setTimeout(() => {
        const next = new Map(crossings);
        next.set(cell, [...(next.get(cell) ?? []), n]);
        crossings = next;
        if (isLast) {
          rippling = false;
          announcement = buildAnnouncement(n, multiples);
        }
      }, i * STAGGER_MS));
      newTids.push(tid);
    }

    pendingTimeouts = [...pendingTimeouts, ...newTids];
  }

  function handleReset() {
    for (const tid of pendingTimeouts) clearTimeout(tid);
    pendingTimeouts = [];
    markedPrimes = [];
    crossings = new Map();
    rippling = false;
    announcement = '';
    focusIndex = 0;
  }

  /**
   * @param {KeyboardEvent} e
   * @param {number} idx
   */
  function handleKeydown(e, idx) {
    const row = Math.floor(idx / 10);
    const col = idx % 10;
    let next = idx;

    switch (e.key) {
      case 'ArrowRight': next = row * 10 + Math.min(col + 1, 9); break;
      case 'ArrowLeft':  next = row * 10 + Math.max(col - 1, 0); break;
      case 'ArrowDown':  next = Math.min((row + 1) * 10 + col, 99); break;
      case 'ArrowUp':    next = Math.max((row - 1) * 10 + col, 0); break;
      case 'Home':       next = row * 10; break;
      case 'End':        next = row * 10 + 9; break;
      default: return;
    }

    if (next !== idx) {
      e.preventDefault();
      focusIndex = next;
      cellRefs[next]?.focus();
    }
  }

  // Return a reactive proxy so template reads stay live.
  // Svelte 5 tracks $state access through object property reads.
  return {
    get markedPrimes() { return markedPrimes; },
    get crossings() { return crossings; },
    get rippling() { return rippling; },
    get announcement() { return announcement; },
    get focusIndex() { return focusIndex; },
    get shakeIndex() { return shakeIndex; },
    cellRefs,
    handleCellActivate,
    handleReset,
    handleKeydown,
  };
}
