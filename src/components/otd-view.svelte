<script lang="ts">
	import type { OtdNotes } from "@/notes";
	import type { OtdSettings } from "@/settings";
	import type { App } from "obsidian";
	import { setAppContext, setSettingsContext, setNotesContext } from '@/context';
  import Calendar from "@/components/calendar.svelte";
	import Entries from "@/components/entries.svelte";

  let {
    app,
    settings,
    notes,
  }: {
    app: App,
    settings: OtdSettings,
    notes: OtdNotes,
  } = $props();

  setAppContext(app);
  setSettingsContext(settings);
  setNotesContext(notes);

  let selectedDate = $state(new Date());
</script>

<div class="flex flex-col gap-4">
  <Calendar bind:selectedDate />
  <Entries bind:selectedDate />
</div>