<script>
  import { draggable } from '$lib/actions/draggable.svelte.js';

  /**
   * @typedef {{x: number, y: number}} MutablePoint
   * @typedef {import('$lib/algebra-engine/linear.js').Line} Line
   */

  /** @type {{
   *   svgEl: SVGSVGElement | undefined,
   *   view: number,
   *   pad: number,
   *   u: number,
   *   mx: (x: number) => number,
   *   my: (y: number) => number,
   *   gridLines: number[],
   *   pts: [{x:number,y:number},{x:number,y:number}],
   *   p1: MutablePoint,
   *   p2: MutablePoint,
   *   anchor1MathY: number,
   *   anchor2MathY: number,
   *   drag1Opts: import('$lib/actions/draggable.svelte.js').DraggableParams,
   *   drag2Opts: import('$lib/actions/draggable.svelte.js').DraggableParams,
   *   showTriangle: boolean,
   *   anchor1X: number,
   *   anchor2X: number,
   *   deltaY: number,
   *   texMath: string,
   *   anchor1Label: string,
   *   anchor2Label: string,
   * }} */
  let {
    svgEl = $bindable(),
    view,
    pad,
    u,
    mx,
    my,
    gridLines,
    pts,
    p1,
    p2,
    anchor1MathY,
    anchor2MathY,
    drag1Opts,
    drag2Opts,
    showTriangle,
    anchor1X,
    anchor2X,
    deltaY,
    texMath,
    anchor1Label,
    anchor2Label,
  } = $props();
</script>

<svg
  bind:this={svgEl}
  viewBox="0 0 {view} {view}"
  preserveAspectRatio="xMidYMid meet"
  class="block w-full max-w-md mx-auto bg-white rounded-lg border border-slate-200"
  style="touch-action:none; aspect-ratio:1/1"
  role="img"
  aria-label="Đồ thị hàm số {texMath}"
>
  <!-- Grid lines (light slate) -->
  {#each gridLines as v}
    <line x1={mx(v)} y1={pad} x2={mx(v)} y2={view - pad} stroke="#e2e8f0" stroke-width="0.5" />
    <line x1={pad} y1={my(v)} x2={view - pad} y2={my(v)} stroke="#e2e8f0" stroke-width="0.5" />
  {/each}

  <!-- Axes (slate-700, thicker) -->
  <line x1={mx(0)} y1={pad} x2={mx(0)} y2={view - pad} stroke="#334155" stroke-width="1.5" />
  <line x1={pad} y1={my(0)} x2={view - pad} y2={my(0)} stroke="#334155" stroke-width="1.5" />

  <!-- Integer axis labels every 2 units -->
  {#each gridLines as v}
    {#if v !== 0 && v % 2 === 0}
      <text x={mx(v)} y={my(0) + 14} text-anchor="middle" font-size="9" fill="#64748b">{v}</text>
      <text x={mx(0) - 5} y={my(v) + 3} text-anchor="end" font-size="9" fill="#64748b">{v}</text>
    {/if}
  {/each}
  <text x={mx(0) - 5} y={my(0) + 14} text-anchor="end" font-size="9" fill="#64748b">0</text>

  <!-- Rise/run triangle overlay (optional) -->
  {#if showTriangle}
    {@const tx1 = mx(anchor1X)}
    {@const ty1 = my(anchor1MathY)}
    {@const tx2 = mx(anchor2X)}
    {@const ty2 = my(anchor2MathY)}
    {@const cornerX = tx2}
    {@const cornerY = ty1}
    <polygon
      points="{tx1},{ty1} {cornerX},{cornerY} {tx2},{ty2}"
      fill="#D7263D" fill-opacity="0.12"
      stroke="#D7263D" stroke-width="1.5" stroke-dasharray="5 3"
    />
    <text x={(tx1 + tx2) / 2} y={cornerY + 14} text-anchor="middle" font-size="11" fill="#D7263D" font-weight="600">Δx = 10</text>
    <text x={tx2 + 6} y={(cornerY + ty2) / 2} text-anchor="start" dominant-baseline="middle" font-size="11" fill="#D7263D" font-weight="600">Δy = {deltaY.toFixed(1)}</text>
  {/if}

  <!-- Line (teal) -->
  <line
    x1={mx(pts[0].x)} y1={my(pts[0].y)}
    x2={mx(pts[1].x)} y2={my(pts[1].y)}
    stroke="#1B998B" stroke-width="2.5" stroke-linecap="round"
  />

  <!-- Anchor 1 (x = anchor1X) -->
  <circle
    cx={p1.x} cy={p1.y} r="12"
    fill="#D7263D" stroke="#fff" stroke-width="2"
    role="button"
    tabindex="0"
    aria-label="{anchor1Label}, y = {anchor1MathY.toFixed(1)} — kéo hoặc dùng phím mũi tên"
    style="cursor:grab; outline:none"
    use:draggable={drag1Opts}
  />

  <!-- Anchor 2 (x = anchor2X) -->
  <circle
    cx={p2.x} cy={p2.y} r="12"
    fill="#D7263D" stroke="#fff" stroke-width="2"
    role="button"
    tabindex="0"
    aria-label="{anchor2Label}, y = {anchor2MathY.toFixed(1)} — kéo hoặc dùng phím mũi tên"
    style="cursor:grab; outline:none"
    use:draggable={drag2Opts}
  />
</svg>
