import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { OtdApp } from "./app";
import { type OtdSettings } from "@/settings";
import { OtdNotes } from "@/notes";

export const VIEW_TYPE_OTD = "tem-on-this-day";

export class OtdView extends ItemView {
	private root: OtdApp;
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
		return VIEW_TYPE_OTD;
	}

	getDisplayText() {
		return "On This Day";
	}

	getIcon() {
		return "calendar-days";
	}

	async onClose() {
		if (this.root) {
			this.root.destroy();
		}
	}

	async onOpen() {
		this.root = new OtdApp(this.contentEl, this.app, this.settings, this.notes);
	}

	async reindex(file?: TFile) {
		if (!file || this.notes.shouldReindex(file)) {
			this.notes.index();
			this.root.rerender();
		}
	}
}