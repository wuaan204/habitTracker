<script lang="ts">
  import {
    generateYearGrid,
    getTodayStr,
    MONTH_NAMES,
    DAY_LABELS,
    DAY_LABEL_VISIBLE,
  } from '$lib/utils/gridUtils';

  export let year: number;
  export let completedDates: Set<string>;
  export let selectedDate: string | null;
  export let onDayClick: (dateStr: string) => void;

  // ── SVG layout constants ───────────────────────────────────────────────────
  const CELL = 15; // bounding box per cell
  const GAP  = 3;  // gap between cells
  const R    = 6;  // circle radius
  const LW   = 22; // left gutter (day-label column)
  const TH   = 18; // top header (month-label row)

  // ── Reactive grid data ─────────────────────────────────────────────────────
  $: gridData = generateYearGrid(year);
  $: ({ weeks, monthLabels } = gridData);
  $: todayStr = getTodayStr();

  $: svgW = LW + weeks.length * (CELL + GAP) - GAP;
  $: svgH = TH + 7 * (CELL + GAP) - GAP;

  /** X center of the circle at column wi */
  function cx(wi: number): number {
    return LW + wi * (CELL + GAP) + CELL / 2;
  }
  /** Y center of the circle at row di */
  function cy(di: number): number {
    return TH + di * (CELL + GAP) + CELL / 2;
  }

  /**
   * SVG path for a small tick mark centered on (x, y).
   * Rendered as a <path> with pointer-events:none so clicks pass through
   * to the <circle> sitting beneath it.
   */
  function checkPath(x: number, y: number): string {
    return `M${x - 3.5} ${y + 0.5} L${x - 0.5} ${y + 3} L${x + 4} ${y - 3}`;
  }
</script>

<!--
  A single <svg> containing every day of the year as an SVG <circle>.
  Each circle has its own Svelte on:click — Svelte compiles these to native
  addEventListener calls (not React synthetic events), so 365 listeners
  adds negligible overhead while keeping the code idiomatic.
  CSS @keyframes and :hover/:active on .day-circle run on the GPU compositor.
-->
<div
  class="overflow-x-auto select-none pb-3"
  style="
    will-change: transform, opacity;
    transform: translateZ(0);
  "
>
  <!--
    translateZ(0) promotes this element to its own GPU composite layer.
    The browser hands the entire SVG to the GPU for rasterisation — the
    CPU only needs to update circle attributes when state changes; actual
    pixel drawing is off-thread.
  -->
  <svg
    width={svgW}
    height={svgH}
    viewBox="0 0 {svgW} {svgH}"
    role="grid"
    aria-label="{year} habit tracking grid"
    style="display: block; font-family: inherit; overflow: visible;"
  >
    <!-- ── Month labels ──────────────────────────────────────────────────────── -->
    {#each monthLabels as { month, weekIdx }}
      <text
        x={cx(weekIdx) - CELL / 2}
        y={TH - 6}
        font-size="9"
        font-weight="600"
        fill="#9CA3AF"
        letter-spacing="0.5"
      >
        {MONTH_NAMES[month]}
      </text>
    {/each}

    <!-- ── Day-of-week labels (M / W / F only) ─────────────────────────────── -->
    {#each DAY_LABELS as label, i}
      {#if DAY_LABEL_VISIBLE[i]}
        <text
          x={LW - 5}
          y={cy(i) + 3.5}
          font-size="9"
          font-weight="600"
          fill="#9CA3AF"
          text-anchor="end"
        >
          {label}
        </text>
      {/if}
    {/each}

    <!-- ── 365 Day circles ──────────────────────────────────────────────────── -->
    {#each weeks as week, wi}
      {#each week as day, di}
        {#if day?.isInYear}
          {@const x   = cx(wi)}
          {@const y   = cy(di)}
          {@const done     = completedDates.has(day.dateStr)}
          {@const selected = day.dateStr === selectedDate}
          {@const today    = day.dateStr === todayStr}

          <!-- Selected-date ring (decorative, no pointer events) -->
          {#if selected}
            <circle
              cx={x}
              cy={y}
              r={R + 3.5}
              fill="none"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-dasharray="3 2"
              style="pointer-events: none;"
            />
          {/if}

          <!--
            Main day circle.
            on:click is attached directly here — Svelte compiles this to a
            single native addEventListener per circle, not a React wrapper.
            CSS :hover / :active transitions run entirely off the main thread.
          -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-interactive-supports-focus -->
          <circle
            cx={x}
            cy={y}
            r={R}
            class="day-circle"
            fill={done ? '#111111' : 'transparent'}
            stroke={done ? '#111111' : today ? '#9CA3AF' : '#E5E7EB'}
            stroke-width="1.5"
            role="checkbox"
            aria-checked={done}
            aria-label={day.dateStr}
            on:click={() => onDayClick(day.dateStr)}
            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && onDayClick(day.dateStr)}
          />

          <!--
            Checkmark <path> drawn via CSS @keyframes habitCheck.
            pointer-events:none lets clicks fall through to the circle below.
          -->
          {#if done}
            <path
              class="habit-check"
              d={checkPath(x, y)}
              stroke="white"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
              style="pointer-events: none;"
            />
          {/if}
        {/if}
      {/each}
    {/each}
  </svg>
</div>
