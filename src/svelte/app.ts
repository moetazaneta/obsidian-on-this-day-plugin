import OtdView from "./components/otd-view.svelte";
import { App } from 'obsidian';
import { type OtdSettings } from "@/settings";
import { OtdNotes } from "@/notes";
import { mount, unmount } from "svelte";

export class OtdSvelteApp {
  private root: {};

  constructor(
    private contentEl: HTMLElement,
    private app: App,
    private settings: OtdSettings,
    private notes: OtdNotes,
  ) {
    this.mount();
  }

  public mount() {
    this.root = mount(OtdView, {
      target: this.contentEl,
      props: {
        app: this.app,
        settings: this.settings,
        notes: this.notes,
      }
    });
  }

  public destroy() {
    if (!this.root) return;
    unmount(this.root);
  }

  public rerender() {
    this.destroy();
    this.mount();
  }
}