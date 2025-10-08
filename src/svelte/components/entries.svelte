<script lang="ts">
	import ChevronLeftIcon from "@/svelte/components/icons/chevron-left-icon.svelte";
	import ChevronRightIcon from "@/svelte/components/icons/chevron-right-icon.svelte";
  import { getAppContext, getNotesContext, getSettingsContext } from "@/svelte/context";
	import { TFile } from "obsidian";

  let {
    selectedDate = $bindable(),
  }: {
    selectedDate: Date,
  } = $props();

  const notes = getNotesContext();
  const app = getAppContext();

  const todayLabel = $derived.by(() => {
    const mdate = window.moment(selectedDate);

    if (mdate.isSame(window.moment(), 'day')) return 'Today';
    if (mdate.isSame(window.moment().add(1, 'day'), 'day')) return 'Tomorrow';
    if (mdate.isSame(window.moment().subtract(1, 'day'), 'day')) return 'Yesterday';

    if (mdate.isSame(window.moment(), 'year')) {
      return mdate.format('MMM D');
    }

    // format: "2024 Oct 4"
    return mdate.format('YYYY MMM D');
  })
</script>

{#snippet dayButtons()}
  <div class="flex flex-row gap-1">
    <button
      class="px-3!"
      onclick={() => selectedDate = window.moment(selectedDate).subtract(1, 'day').toDate()}
    >
      <ChevronLeftIcon />
    </button>
    <button
      class="px-3!"
      onclick={() => selectedDate = window.moment(selectedDate).add(1, 'day').toDate()}
    >
      <ChevronRightIcon />
    </button>
  </div>
{/snippet}

<div class="flex flex-col gap-1">
  <div class="text-sm font-bold flex flex-row items-center justify-between">
    <div class="text-sm font-bold">{todayLabel}</div>
    {@render dayButtons()}
  </div>
  <div class="flex flex-col gap-4">
    {#await notes.getEntries(window.moment(selectedDate))}
      <div></div>
    {:then groups}
      {#each groups as group}
        <div class="flex flex-col gap-2">
          {#if group.name !== 'Today'}
            <div class="flex flex-row gap-1 items-center justify-between">
              <div class="text-sm font-bold">{group.name}</div>
            </div>
          {/if}
          {#each group.files as { file, title }}
            <span><a
              href={file.path}
              onclick={() => app.workspace.openLinkText(file.basename, file.path)}
            >{file.name}</a> {title}</span>
          {/each}
        </div>
      {/each}
      {#if groups.length === 0}
        <div class="flex flex-row gap-1 items-center justify-between">
          <div class="text-sm text-base-70">Nothing on this day</div>
        </div>
      {/if}
    {/await}
  </div>
</div>