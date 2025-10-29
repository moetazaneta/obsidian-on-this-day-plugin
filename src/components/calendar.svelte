<script lang="ts">
	import { cn } from "@/lib/utils";
	import ChevronLeftIcon from "@/components/icons/chevron-left-icon.svelte";
	import ChevronRightIcon from "@/components/icons/chevron-right-icon.svelte";
	import MonthSelect from "@/components/month-select.svelte";
	import YearSelect from "@/components/year-select.svelte";
	import { getNotesContext } from "@/context";

  let {
    selectedDate = $bindable(),
  }: {
    selectedDate: Date,
  } = $props();

  const notes = getNotesContext();

  const minYear = $derived(notes.earliestNote?.year() ?? new Date().getFullYear());

  let visibleMonth = $state(new Date().getMonth());
  let visibleYear = $state(new Date().getFullYear());
  const isToday = $derived(window.moment(selectedDate).isSame(new Date(), 'day'));

  type Day = {
    date: Date;
    sameMonth: boolean;
    selected: boolean;
    today: boolean;
    past: boolean;
    future: boolean;
    notesCount: number;
  }

  const daysPage = $derived.by(() => {
    const firstDayOfMonth = new Date(visibleYear, visibleMonth, 1);
    const lastDayOfMonth = new Date(visibleYear, visibleMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const dayPromises: Promise<Day>[] = [];

    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      dayPromises.push(createDay(
        new Date(visibleYear, visibleMonth, i - 2),
        selectedDate,
      ));
    }

    for (let i = 0; i < daysInMonth; i++) {
      dayPromises.push(createDay(
        new Date(visibleYear, visibleMonth, i + 1),
        selectedDate,
      ));
    }

    for (let i = 1; i < 7 - lastDayOfMonth.getDay(); i++) {
      dayPromises.push(createDay(
        new Date(visibleYear, visibleMonth + 1, i),
        selectedDate,
      ));
    }

    return Promise.all(dayPromises);
  })

  const displayedDates = $derived.by(async () => {
    return (await daysPage).map(day => day.date);
  })

  const weekDays = $derived.by(async () => {
    const days = await daysPage
    console.log(days);
    console.log(window.moment(days[0].date).format('dd'));
    return Array.from({ length: 7 }, (_, index) => {
      return window.moment(days[index].date).format('dd');
    });
  });

  async function createDay(date: Date, selectedDate: Date): Promise<Day> {
    const mdate = window.moment(date);
    const now = new Date();
    const entries = await notes.getEntries(window.moment(date));

    return {
      date,
      sameMonth: mdate.isSame(window.moment(visibleMonth + 1, 'MM'), 'month'),
      selected: mdate.isSame(selectedDate, 'day'),
      today: mdate.isSame(now, 'day'),
      past: mdate.isBefore(now, 'day'),
      future: mdate.isAfter(now, 'day'),
      notesCount: entries.length,
    }
  }

  function goToPreviousMonth() {
    if (visibleMonth === 0) {
      visibleMonth = 11;
      visibleYear--;
    } else {
      visibleMonth--;
    }
  }

  function goToNextMonth() {
    if (visibleMonth === 11) {
      visibleMonth = 0;
      visibleYear++;
    } else {
      visibleMonth++;
    }
  }

  function goToToday() {
    const now = new Date();
    selectedDate = now;
    visibleMonth = now.getMonth();
    visibleYear = now.getFullYear();
  }

  function isDateDisplayed(date: Date, displayedDates: Date[]): boolean {
    return displayedDates.some(d =>
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  }

  async function handleDayClick(date: Date) {
    selectedDate = date;
    if (!isDateDisplayed(date, await displayedDates)) {
      visibleMonth = date.getMonth();
      visibleYear = date.getFullYear();
    }
  }

  let lastSelectedTs = $state(selectedDate.getTime());
  $effect(() => {
    displayedDates.then(dates => {
      const ts = selectedDate.getTime();
      if (ts !== lastSelectedTs) {
        if (!isDateDisplayed(selectedDate, dates)) {
          visibleMonth = selectedDate.getMonth();
          visibleYear = selectedDate.getFullYear();
        }
        lastSelectedTs = ts;
      }
    });
  });
</script>

<div class="flex flex-col gap-2">
  <div class="w-full flex flex-row flex-wrap gap-2 justify-between items-center">
    <div class="flex flex-row gap-1">
      <YearSelect
        bind:value={visibleYear}
        min={minYear}
      />
      <MonthSelect
        bind:value={visibleMonth}
      />
    </div>
    <div class="ml-auto flex flex-row gap-1">
      {#if !isToday}
        <button onclick={goToToday}>
          Today
        </button>
      {/if}
      <button onclick={goToPreviousMonth}>
        <ChevronLeftIcon />
      </button>
      <button onclick={goToNextMonth}>
        <ChevronRightIcon />
      </button>
    </div>
  </div>
  <div class="grid grid-cols-7">
    {#await Promise.all([daysPage, weekDays])}
      <div></div>
    {:then [days, weekDays]}
      {#each weekDays as day}
        <div class="text-center text-base-50">{day}</div>
      {/each}
      {#each days as day}
        <div
          class={cn(
            "flex flex-col items-center px-1 py-2 gap-1 rounded",
            {
              "font-bold": day.today,
              "text-accent": day.today && !day.selected,
              "bg-accent text-base-10": day.selected,
              "hover:bg-hover": !day.selected,
              "text-base-100": day.sameMonth && !day.selected && !day.today,
              "text-base-50": !day.sameMonth && !day.selected && !day.today,
            }
          )}
          tabindex="0"
          aria-pressed="false"
          role="button"
          onclick={() => handleDayClick(day.date)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleDayClick(day.date);
            }
          }}
        >
          <div>
            {day.date.getDate()}
          </div>
          <div class="flex flex-wrap gap-px justify-center">
            {#each Array.from({ length: day.notesCount }) as _, index}
            <div class={cn(
              "w-1 h-1 rounded-full bg-current/40",
              {
                "bg-current": index === 0 && !day.future,
              }
            )} ></div>
            {/each}
          </div>
        </div>
      {/each}
    {/await}
  </div>
</div>