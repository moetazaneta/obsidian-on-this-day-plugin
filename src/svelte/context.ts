import type { OtdNotes } from "@/notes";
import type { OtdSettings } from "@/settings";
import type { App } from "obsidian";
import { getContext, setContext } from "svelte";

export function setAppContext(app: App) {
  setContext('app', app);
}

export function getAppContext(): App {
  return getContext('app');
}

export function setSettingsContext(settings: OtdSettings) {
  setContext('settings', settings);
}

export function getSettingsContext(): OtdSettings {
  return getContext('settings');
}

export function setNotesContext(notes: OtdNotes) {
  setContext('notes', notes);
}

export function getNotesContext(): OtdNotes {
  return getContext('notes');
}