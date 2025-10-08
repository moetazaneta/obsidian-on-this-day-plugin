import { Plugin } from 'obsidian';
import { OtdSettingTab, DEFAULT_SETTINGS, type OtdSettings } from 'src/settings';
import { OtdSvelteView, VIEW_TYPE_OTD_SVELTE } from '@/svelte/view';

export default class OtdPlugin extends Plugin {
	public settings: OtdSettings;
	private view: OtdSvelteView;

	onunload() {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE_OTD_SVELTE)
			.forEach((leaf) => leaf.detach());
	}

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new OtdSettingTab(this.app, this));

		this.registerView(
			VIEW_TYPE_OTD_SVELTE,
			(leaf) => (this.view = new OtdSvelteView(leaf, this.settings))
		);

		if (this.app.workspace.layoutReady) {
			this.initLeaf();
		}
		else {
			this.app.workspace.onLayoutReady(() => {
				this.initLeaf();
			})
		}
	}

	initLeaf() {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE_OTD_SVELTE).length === 0) {
			this.app.workspace.getRightLeaf(false)?.setViewState({
				type: VIEW_TYPE_OTD_SVELTE,
			});
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.view.reindex()
	}
}
