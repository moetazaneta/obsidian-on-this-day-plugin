import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { OtdSvelteApp } from "./app";
import { type OtdSettings } from "@/settings";
import { OtdNotes } from "@/notes";

export const VIEW_TYPE_OTD_SVELTE = "on-this-day-svelte";

export class OtdSvelteView extends ItemView {
	private root: OtdSvelteApp;
	private settings: OtdSettings;
	private notes: OtdNotes;

	constructor(leaf: WorkspaceLeaf, settings: OtdSettings) {
		super(leaf);
		this.settings = settings;

		this.registerEvent(this.app.vault.on("create", this.reindex.bind(this)));
		this.registerEvent(this.app.vault.on("delete", this.reindex.bind(this)));
		this.registerEvent(this.app.vault.on("modify", this.reindex.bind(this)));

		this.notes = new OtdNotes(this.app.vault, this.settings);
	}

	getViewType() {
		return VIEW_TYPE_OTD_SVELTE;
	}

	getDisplayText() {
		return "On This Day (Svelte)";
	}

	getIcon() {
		return "calendar-with-checkmark";
	}

	async onClose() {
		if (this.root) {
			this.root.destroy();
		}
	}

	async onOpen() {
		this.root = new OtdSvelteApp(this.contentEl, this.app, this.settings, this.notes);
	}

	async reindex(file?: TFile) {
		if (!file || this.notes.shouldReindex(file)) {
			this.notes.index();
			this.root.rerender();
		}
	}
}