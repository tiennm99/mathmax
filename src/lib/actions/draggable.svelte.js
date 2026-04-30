import { clientToSvg, clampToViewBox } from '$lib/utils/svg.js';

/**
 * @typedef {{x: number, y: number}} MutablePoint
 * @typedef {{
 *   point: MutablePoint;
 *   svg: SVGSVGElement | (() => SVGSVGElement | null);
 *   viewBox: { w: number; h: number };
 *   projector?: (p: import('$lib/geom-engine/vec.js').Vec2) => import('$lib/geom-engine/vec.js').Vec2;
 *   pad?: number;
 *   keyStep?: number;
 *   keyShiftStep?: number;
 *   onChange?: () => void;
 * }} DraggableParams
 */

/**
 * Svelte action: makes the host element draggable inside an SVG viewBox.
 * Mutates `params.point.x/y` so reactivity propagates through `$state`.
 * Also wires arrow-key movement for accessibility.
 *
 * @param {SVGGraphicsElement} node
 * @param {DraggableParams} params
 */
export function draggable(node, params) {
  let active = -1; // pointerId, -1 = idle
  let current = params;

  const getSvg = () => (typeof current.svg === 'function' ? current.svg() : current.svg);

  const apply = (/** @type {{x:number,y:number}} */ raw) => {
    const projected = current.projector ? current.projector(raw) : raw;
    const clamped = current.pad === 0 ? projected : clampToViewBox(projected, current.viewBox.w, current.viewBox.h, current.pad);
    current.point.x = clamped.x;
    current.point.y = clamped.y;
    current.onChange?.();
  };

  const onPointerDown = (/** @type {PointerEvent} */ e) => {
    active = e.pointerId;
    node.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (/** @type {PointerEvent} */ e) => {
    if (active !== e.pointerId) return;
    const svg = getSvg();
    if (!svg) return;
    apply(clientToSvg(svg, e.clientX, e.clientY, current.viewBox.w, current.viewBox.h));
  };

  const onPointerEnd = (/** @type {PointerEvent} */ e) => {
    if (active !== e.pointerId) return;
    if (node.hasPointerCapture(e.pointerId)) node.releasePointerCapture(e.pointerId);
    active = -1;
  };

  const onKeyDown = (/** @type {KeyboardEvent} */ e) => {
    const step = e.shiftKey ? (current.keyShiftStep ?? 10) : (current.keyStep ?? 2);
    let dx = 0;
    let dy = 0;
    switch (e.key) {
      case 'ArrowLeft': dx = -step; break;
      case 'ArrowRight': dx = step; break;
      case 'ArrowUp': dy = -step; break;
      case 'ArrowDown': dy = step; break;
      default: return;
    }
    e.preventDefault();
    apply({ x: current.point.x + dx, y: current.point.y + dy });
  };

  node.addEventListener('pointerdown', onPointerDown);
  node.addEventListener('pointermove', onPointerMove);
  node.addEventListener('pointerup', onPointerEnd);
  node.addEventListener('pointercancel', onPointerEnd);
  node.addEventListener('keydown', onKeyDown);

  return {
    /** @param {DraggableParams} next */
    update(next) {
      current = next;
    },
    destroy() {
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerup', onPointerEnd);
      node.removeEventListener('pointercancel', onPointerEnd);
      node.removeEventListener('keydown', onKeyDown);
    },
  };
}
