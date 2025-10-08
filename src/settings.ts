import OtdPlugin from "main";
import { PluginSettingTab, App, Setting } from "obsidian";


export interface OtdSettings {
	dailyFolder: string;
	whichMonth: number[];
	whichYear: number[];
}

export const DEFAULT_SETTINGS: OtdSettings = {
	dailyFolder: 'daily',
	whichMonth: [1, 6],
	whichYear: [],
}

export class OtdSettingTab extends PluginSettingTab {
	plugin: OtdPlugin;

	constructor(app: App, plugin: OtdPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Daily Folder')
			.setDesc('The folder where daily notes are stored')
			.addText(text => text
				.setPlaceholder('Enter your daily folder')
				.setValue(this.plugin.settings.dailyFolder)
				.onChange(async (value) => {
					this.plugin.settings.dailyFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Which Month')
			.setDesc(`
Numbers of months to show. Separate with commas.
e.g. 1,6
1 is 1 month ago
6 is 6 months ago
`)
			.addText(text => text
				.setPlaceholder('e.g. 1,6')
				.setValue(this.plugin.settings.whichMonth.join(','))
				.onChange(async (value) => {
					this.plugin.settings.whichMonth = value.split(',').filter(Boolean).map(Number);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Which Year')
			.setDesc('For which nth year to show entries. Separate with commas.\nLeave empty to show all years.')
			.addText(text => text
				.setPlaceholder('e.g. 1,2,5,10')
				.setValue(this.plugin.settings.whichYear.join(','))
				.onChange(async (value) => {
					this.plugin.settings.whichYear = value.split(',').filter(Boolean).map(Number);
					await this.plugin.saveSettings();
				}));
	}
}
