import { c as create_ssr_component, b as add_attribute, e as escape, d as each, a as subscribe, v as validate_component } from "../../chunks/ssr.js";
import { w as writable } from "../../chunks/index.js";
const EMPTY_STATE = {
  habits: [],
  activeHabitId: ""
};
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function persist(state) {
  return state;
}
function createHabitStore() {
  const { subscribe: subscribe2, set, update } = writable(EMPTY_STATE);
  return {
    subscribe: subscribe2,
    addHabit(name, description) {
      update((state) => {
        const newHabit = {
          id: generateId(),
          name: name.trim() || "New Habit",
          description: description.trim(),
          completedDates: {},
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        return persist({
          habits: [...state.habits, newHabit],
          activeHabitId: newHabit.id
        });
      });
    },
    removeHabit(id) {
      update((state) => {
        const next = state.habits.filter((h) => h.id !== id);
        return persist({
          habits: next,
          activeHabitId: next.length === 0 ? "" : state.activeHabitId === id ? next[0].id : state.activeHabitId
        });
      });
    },
    setActiveHabit(id) {
      update((state) => persist({ ...state, activeHabitId: id }));
    },
    toggleDate(habitId, year, dateStr) {
      update((state) => {
        const yearKey = String(year);
        return persist({
          ...state,
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const existing = h.completedDates[yearKey] ?? [];
            const isDone = existing.includes(dateStr);
            return {
              ...h,
              completedDates: {
                ...h.completedDates,
                [yearKey]: isDone ? existing.filter((d) => d !== dateStr) : [...existing, dateStr]
              }
            };
          })
        });
      });
    },
    resetAll() {
      set(EMPTY_STATE);
    }
  };
}
const habitStore = createHabitStore();
function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function generateYearGrid(year) {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  const jan1Dow = jan1.getDay();
  const offsetToMonday = jan1Dow === 0 ? -6 : 1 - jan1Dow;
  const gridStart = new Date(jan1);
  gridStart.setDate(gridStart.getDate() + offsetToMonday);
  const dec31Dow = dec31.getDay();
  const offsetToSunday = dec31Dow === 0 ? 0 : 7 - dec31Dow;
  const gridEnd = new Date(dec31);
  gridEnd.setDate(gridEnd.getDate() + offsetToSunday);
  const weeks = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        date: new Date(cursor),
        dateStr: toDateStr(cursor),
        isInYear: cursor.getFullYear() === year
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  const monthLabels = [];
  for (let m = 0; m < 12; m++) {
    const firstOfMonth = toDateStr(new Date(year, m, 1));
    const weekIdx = weeks.findIndex((week) => week.some((day) => day?.dateStr === firstOfMonth));
    if (weekIdx !== -1) {
      monthLabels.push({ month: m, weekIdx });
    }
  }
  return { weeks, monthLabels };
}
function getTodayStr() {
  const now = /* @__PURE__ */ new Date();
  return toDateStr(now);
}
function getDaysInYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
}
function formatFullDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_LABEL_VISIBLE = [true, false, true, false, true, false, false];
const CELL = 15;
const GAP = 3;
const R = 6;
const LW = 22;
const TH = 18;
function cx(wi) {
  return LW + wi * (CELL + GAP) + CELL / 2;
}
function cy(di) {
  return TH + di * (CELL + GAP) + CELL / 2;
}
function checkPath(x, y) {
  return `M${x - 3.5} ${y + 0.5} L${x - 0.5} ${y + 3} L${x + 4} ${y - 3}`;
}
const YearGrid = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let gridData;
  let weeks;
  let monthLabels;
  let todayStr;
  let svgW;
  let svgH;
  let { year } = $$props;
  let { completedDates } = $$props;
  let { selectedDate } = $$props;
  let { onDayClick } = $$props;
  if ($$props.year === void 0 && $$bindings.year && year !== void 0) $$bindings.year(year);
  if ($$props.completedDates === void 0 && $$bindings.completedDates && completedDates !== void 0) $$bindings.completedDates(completedDates);
  if ($$props.selectedDate === void 0 && $$bindings.selectedDate && selectedDate !== void 0) $$bindings.selectedDate(selectedDate);
  if ($$props.onDayClick === void 0 && $$bindings.onDayClick && onDayClick !== void 0) $$bindings.onDayClick(onDayClick);
  gridData = generateYearGrid(year);
  ({ weeks, monthLabels } = gridData);
  todayStr = getTodayStr();
  svgW = LW + weeks.length * (CELL + GAP) - GAP;
  svgH = TH + 7 * (CELL + GAP) - GAP;
  return ` <div class="overflow-x-auto select-none pb-3" style="will-change: transform;"><svg${add_attribute("width", svgW, 0)}${add_attribute("height", svgH, 0)} viewBox="${"0 0 " + escape(svgW, true) + " " + escape(svgH, true)}" role="grid" aria-label="${escape(year, true) + " habit tracking grid"}" style="display: block; font-family: inherit; overflow: visible;">${each(monthLabels, ({ month, weekIdx }) => {
    return `<text${add_attribute("x", cx(weekIdx) - CELL / 2, 0)}${add_attribute("y", TH - 6, 0)} font-size="9" font-weight="600" fill="#9CA3AF" letter-spacing="0.5">${escape(MONTH_NAMES[month])}</text>`;
  })}${each(DAY_LABELS, (label, i) => {
    return `${DAY_LABEL_VISIBLE[i] ? `<text${add_attribute("x", LW - 5, 0)}${add_attribute("y", cy(i) + 3.5, 0)} font-size="9" font-weight="600" fill="#9CA3AF" text-anchor="end">${escape(label)}</text>` : ``}`;
  })}${each(weeks, (week, wi) => {
    return `${each(week, (day, di) => {
      return `${day?.isInYear ? (() => {
        let x = cx(wi), y = cy(di), done = completedDates.has(day.dateStr), selected = day.dateStr === selectedDate, today = day.dateStr === todayStr;
        return `      ${selected ? `<circle${add_attribute("cx", x, 0)}${add_attribute("cy", y, 0)}${add_attribute("r", R + 3.5, 0)} fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-dasharray="3 2" style="pointer-events: none;"></circle>` : ``}    <circle${add_attribute("cx", x, 0)}${add_attribute("cy", y, 0)}${add_attribute("r", R, 0)} class="day-circle"${add_attribute("fill", done ? "#111111" : "transparent", 0)}${add_attribute("stroke", done ? "#111111" : today ? "#9CA3AF" : "#E5E7EB", 0)} stroke-width="1.5" role="checkbox"${add_attribute("aria-checked", done, 0)}${add_attribute("aria-label", day.dateStr, 0)}></circle>  ${done ? `<path class="habit-check"${add_attribute("d", checkPath(x, y), 0)} stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none" style="pointer-events: none;"></path>` : ``}`;
      })() : ``}`;
    })}`;
  })}</svg></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let habits;
  let activeHabitId;
  let activeHabit;
  let yearKey;
  let completedArr;
  let completedDates;
  let completedCount;
  let totalDays;
  let pct;
  let $habitStore, $$unsubscribe_habitStore;
  $$unsubscribe_habitStore = subscribe(habitStore, (value) => $habitStore = value);
  const CURRENT_YEAR = /* @__PURE__ */ (/* @__PURE__ */ new Date()).getFullYear();
  let year = CURRENT_YEAR;
  let selectedDate = null;
  function handleDayClick(dateStr) {
    selectedDate = dateStr;
    if (activeHabit) {
      habitStore.toggleDate(activeHabit.id, year, dateStr);
    }
  }
  ({ habits, activeHabitId } = $habitStore);
  activeHabit = habits.find((h) => h.id === activeHabitId) ?? habits[0] ?? null;
  yearKey = String(year);
  completedArr = activeHabit?.completedDates[yearKey] ?? [];
  completedDates = new Set(completedArr);
  completedCount = completedDates.size;
  totalDays = getDaysInYear(year);
  pct = totalDays > 0 ? completedCount / totalDays : 0;
  $$unsubscribe_habitStore();
  return ` ${habits.length === 0 ? `<div class="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6"><div class="text-center max-w-sm w-full"> <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-10">Habit Tracker · ${escape(CURRENT_YEAR)}</p>  <div class="flex justify-center gap-[3px] mb-12 opacity-[0.12]" aria-hidden="true">${each(Array(26), (_, col) => {
    return `<div class="flex flex-col gap-[3px]">${each(Array(7), (_2, row) => {
      return `<div class="w-[14px] h-[14px] rounded-full border border-gray-400" style="${"opacity: " + escape(Math.random() > 0.7 ? 0.6 : 0.2, true) + ";"}"></div>`;
    })} </div>`;
  })}</div> <h2 class="text-2xl font-bold text-gray-300 mb-2" data-svelte-h="svelte-90ncmi">Nothing tracked yet.</h2> <p class="text-sm text-gray-300 mb-10" data-svelte-h="svelte-1s6bk90">Add your first habit and start filling in the year.</p> <button class="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" data-svelte-h="svelte-6cx6ng"><span class="text-lg leading-none">+</span>
        Add your first habit</button></div></div> ` : `<div class="min-h-screen bg-[#FAFAFA]"><div class="max-w-5xl mx-auto px-6 py-12 md:py-16"> <div><p class="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-3">Habit Tracker · ${escape(year)}</p> <div><h1 class="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-1">${escape(activeHabit?.name ?? "")}</h1> ${activeHabit?.description ? `<p class="text-sm text-gray-400 font-medium mt-1">${escape(activeHabit.description)}</p>` : ``}</div></div>  <div class="flex items-center gap-2 flex-wrap mt-8 mb-10">${each(habits, (h) => {
    return `<div class="group flex items-center gap-0.5"> <button class="${"px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 " + escape(
      h.id === activeHabitId ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700",
      true
    )}">${escape(h.name)}</button>  <button title="${"Delete " + escape(h.name, true)}" class="flex items-center justify-center w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-300 hover:text-red-400 hover:bg-red-50 focus:outline-none"> <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path></svg></button> </div>`;
  })}  <button title="Add habit" class="w-8 h-8 flex items-center justify-center rounded-full text-lg font-light bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400" data-svelte-h="svelte-1hj3i53">+</button></div>  <div class="flex items-center gap-5 mb-6"><button class="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150 focus:outline-none" aria-label="Previous year" data-svelte-h="svelte-1lnl52j"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg></button> <span class="text-sm font-bold text-gray-700 tabular-nums w-10 text-center">${escape(year)}</span> <button class="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150 focus:outline-none" aria-label="Next year" data-svelte-h="svelte-1iucbti"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg></button>  <div class="hidden sm:block w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-gray-900 rounded-full origin-left transition-transform duration-700 ease-out" style="${"transform: scaleX(" + escape(pct, true) + ");"}"></div></div> <span class="hidden sm:block text-xs font-semibold text-gray-400 tabular-nums">${escape(completedCount)} / ${escape(totalDays)}</span></div>   <div>${validate_component(YearGrid, "YearGrid").$$render(
    $$result,
    {
      year,
      completedDates,
      selectedDate,
      onDayClick: handleDayClick
    },
    {},
    {}
  )}</div>  <div class="min-h-[52px] mt-4">${selectedDate ? `<div class="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-50"><span class="text-sm font-semibold text-gray-700">${escape(formatFullDate(selectedDate))}</span> <span class="w-px h-4 bg-gray-200"></span> ${completedDates.has(selectedDate) ? `<span class="text-[11px] font-bold text-gray-900 uppercase tracking-wide" data-svelte-h="svelte-i9nlt">✓ Done</span>` : `<span class="text-[11px] font-medium text-gray-400 uppercase tracking-wide" data-svelte-h="svelte-ond2ky">Not done</span>`} <span class="w-px h-4 bg-gray-200"></span> <span class="text-[11px] font-semibold text-gray-400 tabular-nums">${escape(completedCount)} day${escape(completedCount !== 1 ? "s" : "")} this year</span></div>` : `<p class="text-sm text-gray-300 mt-1 pl-1" data-svelte-h="svelte-1ee0ap4">Click any circle to mark a day.</p>`}</div>  <div class="flex items-center justify-center gap-4 mt-16 pt-8 border-t border-gray-100"><p class="text-xs text-gray-300" data-svelte-h="svelte-1ynkf1m">Data stored locally · never leaves your device</p> <span class="text-gray-200 select-none" data-svelte-h="svelte-noc049">·</span> <button class="text-xs text-gray-300 hover:text-red-400 transition-colors duration-200 focus:outline-none" data-svelte-h="svelte-1rb42hj">Clear all data</button></div></div></div>`}  ${``}`;
});
export {
  Page as default
};
