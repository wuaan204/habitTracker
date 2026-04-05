<script lang="ts">
  import { fly, fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { habitStore } from '$lib/stores/habitStore';
  import YearGrid from '$lib/components/YearGrid.svelte';
  import { getDaysInYear, formatFullDate } from '$lib/utils/gridUtils';

  const CURRENT_YEAR = new Date().getFullYear();

  // ── Local UI state ──────────────────────────────────────────────────────────
  let year = CURRENT_YEAR;
  let selectedDate: string | null = null;
  let showAddModal = false;

  // Modal form state — isolated so typing never touches the store or grid
  let modalName = '';
  let modalDesc = '';
  let modalNameEl: HTMLInputElement;

  // ── Store-derived reactivity ─────────────────────────────────────────────────
  $: ({ habits, activeHabitId } = $habitStore);
  $: activeHabit = habits.find((h) => h.id === activeHabitId) ?? habits[0] ?? null;

  $: yearKey = String(year);
  $: completedArr = activeHabit?.completedDates[yearKey] ?? [];
  $: completedDates = new Set<string>(completedArr);
  $: completedCount = completedDates.size;
  $: totalDays = getDaysInYear(year);
  $: pct = totalDays > 0 ? completedCount / totalDays : 0;

  // ── Event handlers ───────────────────────────────────────────────────────────
  function handleDayClick(dateStr: string) {
    selectedDate = dateStr;
    if (activeHabit) {
      habitStore.toggleDate(activeHabit.id, year, dateStr);
    }
  }

  function openModal() {
    modalName = '';
    modalDesc = '';
    showAddModal = true;
    // Focus the name input on the next tick after modal mounts
    setTimeout(() => modalNameEl?.focus(), 50);
  }

  function closeModal() {
    showAddModal = false;
  }

  function submitHabit() {
    if (!modalName.trim()) return;
    habitStore.addHabit(modalName, modalDesc);
    closeModal();
  }

  function handleModalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && !e.shiftKey) submitHabit();
  }

  function handleResetAll() {
    if (confirm('Clear all habits and data? This cannot be undone.')) {
      habitStore.resetAll();
      selectedDate = null;
    }
  }

  function prevYear() {
    year -= 1;
    selectedDate = null;
  }
  function nextYear() {
    year += 1;
    selectedDate = null;
  }
</script>

<!-- ══════════════════════════════════════════════════════════════════════════
     EMPTY STATE — shown when no habits exist
     ══════════════════════════════════════════════════════════════════════════ -->
{#if habits.length === 0}
  <div
    class="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6"
    in:fade={{ duration: 300 }}
  >
    <div class="text-center max-w-sm w-full">
      <!-- Ghost label -->
      <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-10">
        Habit Tracker · {CURRENT_YEAR}
      </p>

      <!-- Decorative ghost grid -->
      <div class="flex justify-center gap-[3px] mb-12 opacity-[0.12]" aria-hidden="true">
        {#each Array(26) as _, col}
          <div class="flex flex-col gap-[3px]">
            {#each Array(7) as _, row}
              <div
                class="w-[14px] h-[14px] rounded-full border border-gray-400"
                style="opacity: {Math.random() > 0.7 ? 0.6 : 0.2};"
              />
            {/each}
          </div>
        {/each}
      </div>

      <h2 class="text-2xl font-bold text-gray-300 mb-2">Nothing tracked yet.</h2>
      <p class="text-sm text-gray-300 mb-10">Add your first habit and start filling in the year.</p>

      <button
        on:click={openModal}
        class="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      >
        <span class="text-lg leading-none">+</span>
        Add your first habit
      </button>
    </div>
  </div>

<!-- ══════════════════════════════════════════════════════════════════════════
     MAIN UI — habit tracker with grid
     ══════════════════════════════════════════════════════════════════════════ -->
{:else}
  <div class="min-h-screen bg-[#FAFAFA]">
    <div class="max-w-5xl mx-auto px-6 py-12 md:py-16">

      <!-- ── Header ──────────────────────────────────────────────────────────── -->
      <div in:fly={{ y: -16, duration: 350, easing: cubicOut }}>
        <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-3">
          Habit Tracker · {year}
        </p>

        {#key activeHabit?.id}
          <div in:fly={{ y: 8, duration: 280, easing: cubicOut }}>
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-1">
              {activeHabit?.name ?? ''}
            </h1>
            {#if activeHabit?.description}
              <p class="text-sm text-gray-400 font-medium mt-1">
                {activeHabit.description}
              </p>
            {/if}
          </div>
        {/key}
      </div>

      <!-- ── Habit Tabs ──────────────────────────────────────────────────────── -->
      <div class="flex items-center gap-2 flex-wrap mt-8 mb-10">
        {#each habits as h (h.id)}
          <div class="group flex items-center gap-0.5" in:scale={{ duration: 200, start: 0.8 }}>
            <!-- Select tab -->
            <button
              on:click={() => habitStore.setActiveHabit(h.id)}
              class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
                     {h.id === activeHabitId
                       ? 'bg-gray-900 text-white'
                       : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}"
            >
              {h.name}
            </button>

            <!-- Delete tab (hover reveal) -->
            <button
              on:click={() => habitStore.removeHabit(h.id)}
              title="Delete {h.name}"
              class="flex items-center justify-center w-6 h-6 rounded-full
                     opacity-0 group-hover:opacity-100 transition-all duration-200
                     text-gray-300 hover:text-red-400 hover:bg-red-50 focus:outline-none"
            >
              <!-- Inline trash icon — no lucide import needed -->
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          </div>
        {/each}

        <!-- Add habit button -->
        <button
          on:click={openModal}
          title="Add habit"
          class="w-8 h-8 flex items-center justify-center rounded-full text-lg font-light
                 bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600
                 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          +
        </button>
      </div>

      <!-- ── Year Navigation + Progress ─────────────────────────────────────── -->
      <div class="flex items-center gap-5 mb-6">
        <button
          on:click={prevYear}
          class="w-7 h-7 flex items-center justify-center rounded-full text-gray-400
                 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150 focus:outline-none"
          aria-label="Previous year"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <span class="text-sm font-bold text-gray-700 tabular-nums w-10 text-center">{year}</span>

        <button
          on:click={nextYear}
          class="w-7 h-7 flex items-center justify-center rounded-full text-gray-400
                 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150 focus:outline-none"
          aria-label="Next year"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <!-- Progress bar — CSS transform avoids layout recalc -->
        <div class="hidden sm:block w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-gray-900 rounded-full origin-left transition-transform duration-700 ease-out"
            style="transform: scaleX({pct});"
          />
        </div>

        <span class="hidden sm:block text-xs font-semibold text-gray-400 tabular-nums">
          {completedCount} / {totalDays}
        </span>
      </div>

      <!-- ── 365-Day Grid ────────────────────────────────────────────────────── -->
      <!--
        CSS Containment: `contain: layout style paint` tells the browser's
        layout engine that nothing inside this box can affect geometry outside
        it, and nothing outside can affect rendering inside — so adding a new
        habit tab above does NOT trigger a layout recalc for the 365 circles.

        `content-visibility: auto` lets the browser skip layout + paint
        entirely when this region is off-screen (helpful on shorter viewports).
        `contain-intrinsic-size` provides the estimated height so the scrollbar
        doesn't jump while the grid is skipped.
      -->
      <div
        style="
          contain: layout style paint;
          content-visibility: auto;
          contain-intrinsic-size: 0 148px;
        "
      >
        {#key year}
          <div in:fade={{ duration: 200 }}>
            <YearGrid
              {year}
              {completedDates}
              {selectedDate}
              onDayClick={handleDayClick}
            />
          </div>
        {/key}
      </div>

      <!-- ── Date Inspector ─────────────────────────────────────────────────── -->
      <div class="min-h-[52px] mt-4">
        {#if selectedDate}
          <div
            class="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-50"
            in:fly={{ y: 8, duration: 250, easing: cubicOut }}
          >
            <span class="text-sm font-semibold text-gray-700">
              {formatFullDate(selectedDate)}
            </span>
            <span class="w-px h-4 bg-gray-200" />
            {#if completedDates.has(selectedDate)}
              <span class="text-[11px] font-bold text-gray-900 uppercase tracking-wide">✓ Done</span>
            {:else}
              <span class="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Not done</span>
            {/if}
            <span class="w-px h-4 bg-gray-200" />
            <span class="text-[11px] font-semibold text-gray-400 tabular-nums">
              {completedCount} day{completedCount !== 1 ? 's' : ''} this year
            </span>
          </div>
        {:else}
          <p class="text-sm text-gray-300 mt-1 pl-1">Click any circle to mark a day.</p>
        {/if}
      </div>

      <!-- ── Footer ──────────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-center gap-4 mt-16 pt-8 border-t border-gray-100">
        <p class="text-xs text-gray-300">Data stored locally · never leaves your device</p>
        <span class="text-gray-200 select-none">·</span>
        <button
          on:click={handleResetAll}
          class="text-xs text-gray-300 hover:text-red-400 transition-colors duration-200 focus:outline-none"
        >
          Clear all data
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ══════════════════════════════════════════════════════════════════════════
     ADD HABIT MODAL — mounted outside the conditional block so transitions
     always play cleanly regardless of empty/filled state.
     ══════════════════════════════════════════════════════════════════════════ -->
{#if showAddModal}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 flex items-end sm:items-center justify-center p-4"
    on:click|self={closeModal}
    in:fade={{ duration: 180 }}
    out:fade={{ duration: 150 }}
  >
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <!-- Modal card -->
    <div
      class="w-full max-w-sm bg-white rounded-2xl p-7 z-50"
      in:scale={{ duration: 220, start: 0.94, easing: cubicOut }}
      out:scale={{ duration: 160, start: 0.94 }}
      on:keydown={handleModalKeydown}
      role="dialog"
      aria-modal="true"
      aria-label="Add new habit"
    >
      <h2 class="text-lg font-bold text-gray-900 mb-6">New Habit</h2>

      <!-- Habit Name -->
      <div class="mb-5">
        <label for="habit-name" class="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
          Name
        </label>
        <input
          id="habit-name"
          bind:this={modalNameEl}
          bind:value={modalName}
          type="text"
          placeholder="e.g. Read 20 pages"
          maxlength="60"
          class="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800
                 placeholder:text-gray-300 focus:outline-none focus:bg-gray-100
                 transition-colors duration-150"
        />
      </div>

      <!-- Description -->
      <div class="mb-7">
        <label for="habit-desc" class="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
          Description <span class="text-gray-300 normal-case font-medium">(optional)</span>
        </label>
        <input
          id="habit-desc"
          bind:value={modalDesc}
          type="text"
          placeholder="e.g. Build a consistent reading habit"
          maxlength="120"
          class="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium text-gray-600
                 placeholder:text-gray-300 focus:outline-none focus:bg-gray-100
                 transition-colors duration-150"
        />
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          on:click={closeModal}
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400
                 bg-gray-50 hover:bg-gray-100 transition-colors duration-150 focus:outline-none"
        >
          Cancel
        </button>
        <button
          on:click={submitHabit}
          disabled={!modalName.trim()}
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-white
                 bg-gray-900 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed
                 transition-all duration-150 focus:outline-none"
        >
          Add Habit
        </button>
      </div>
    </div>
  </div>
{/if}
