/**
 * @typedef {import('./vec.js').Vec2} Vec2
 * @typedef {Readonly<{x1: number, y1: number, x2: number, y2: number}>} TickSegment
 */

const DEFAULT_LEN = 6;
const DEFAULT_SPACING = 5;

/**
 * Compute tick-mark segments perpendicular to side p1→p2, centered on the
 * midpoint. `count` ticks indicate side identity (1/2/3 = side group).
 * Returns [] for degenerate sides (length < 1).
 *
 * @param {Vec2} p1 @param {Vec2} p2
 * @param {1|2|3} count
 * @param {{length?: number, spacing?: number}} [opts]
 * @returns {TickSegment[]}
 */
export function tickPositions(p1, p2, count, opts = {}) {
  const length = opts.length ?? DEFAULT_LEN;
  const spacing = opts.spacing ?? DEFAULT_SPACING;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return [];

  const dirX = dx / len;
  const dirY = dy / len;
  const perpX = -dirY;
  const perpY = dirX;
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const start = -((count - 1) * spacing) / 2;

  /** @type {TickSegment[]} */
  const out = [];
  for (let i = 0; i < count; i++) {
    const offset = start + i * spacing;
    const cx = midX + dirX * offset;
    const cy = midY + dirY * offset;
    out.push({
      x1: cx + perpX * length,
      y1: cy + perpY * length,
      x2: cx - perpX * length,
      y2: cy - perpY * length,
    });
  }
  return out;
}
