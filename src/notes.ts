import { getDateFromFile } from "@/lib/utils";
import type { OtdSettings } from "@/settings";
import { Vault, normalizePath, TFile } from "obsidian";

export type OtdEntry = {
  name: string;
  files: {
    file: TFile;
    title: string;
    date: moment.Moment | null;
  }[];
}

export class OtdNotes {
  private dailyNotes = new Map<string, TFile[]>();
  public earliestNote: moment.Moment | null = null;
  private latestNote: moment.Moment | null = null;

  constructor(
    private vault: Vault,
    private settings: OtdSettings,
  ) {
    this.index();
  }

  public shouldReindex(file: TFile) {
    // new file is from daily folder
    if (file.parent?.path === this.settings.dailyFolder) return true;

    // no parent = deleted
    // file deleted not from daily folder, we don't care
    if (file.parent && file.parent.path !== this.settings.dailyFolder) return false;

    // file has a date in the name
    return getDateFromFile(file);
  }

  public index() {
    const dailyNotesFolder = this.vault.getFolderByPath(normalizePath(this.settings.dailyFolder));
    if (!dailyNotesFolder) {
      throw new Error("Failed to find daily notes folder");
    }

    this.dailyNotes.clear();
    this.earliestNote = null;
    this.latestNote = null;

    Vault.recurseChildren(dailyNotesFolder, (note) => {
      if (!(note instanceof TFile)) return;

      const noteDate = getDateFromFile(note);

      if (!noteDate) return;

      const key = this.getDateKey(noteDate);
      const newNotes = [...(this.dailyNotes.get(key) ?? []), note];
      this.dailyNotes.set(key, newNotes);

      if (!this.earliestNote || noteDate.isBefore(this.earliestNote)) {
        this.earliestNote = noteDate;
      }
      if (!this.latestNote || noteDate.isAfter(this.latestNote)) {
        this.latestNote = noteDate;
      }
    });
  }

  private getDateKey(m: moment.Moment) {
    return m.format('YYYY-MM-DD');
  }

  private getDateGroups(m: moment.Moment) {
    if (!this.earliestNote) return [];

    type DateGroup = {
      name: string;
      files: TFile[];
    }
    const dates: DateGroup[] = []

    const todayGroup = {
      name: 'Today',
      files: this.dailyNotes.get(this.getDateKey(m)) ?? [],
    }
    if (todayGroup.files.length > 0) {
      dates.push(todayGroup);
    }

    const whichMonth = this.settings.whichMonth.length > 0
      ? this.settings.whichMonth.slice()
      : Array.from(
        { length: m.month() - this.earliestNote.month() },
        (_, i) => i + 1
      );

    while (whichMonth.length > 0) {
      const month = whichMonth.shift()!;
      const date = m.clone().subtract(month, 'month');

      if (this.earliestNote?.isAfter(date)) {
        return dates;
      }

      const monthGroup = {
        name: `${month} month ago`,
        files: this.dailyNotes.get(this.getDateKey(date)) ?? [],
      }
      if (monthGroup.files.length > 0) {
        dates.push(monthGroup);
      }
    }

    const whichYear = this.settings.whichYear.length > 0
      ? this.settings.whichYear.slice()
      : Array.from(
        { length: m.year() - this.earliestNote.year() },
        (_, i) => i + 1
      );

    while (whichYear.length > 0) {
      const year = whichYear.shift();
      const date = m.clone().subtract(year, 'year');

      if (this.earliestNote?.isAfter(date)) {
        return dates;
      }

      const yearGroup = {
        name: `${year} year ago`,
        files: this.dailyNotes.get(this.getDateKey(date)) ?? [],
      }
      if (yearGroup.files.length > 0) {
        dates.push(yearGroup);
      }
    }

    return dates;
  }

  public async getEntries(m: moment.Moment): Promise<OtdEntry[]> {
    const groups = this.getDateGroups(m);

    return Promise.all(groups.map(async (group) => {
      const files = await Promise.all(group.files.map(async (file) => {
        const title = await this.getTitle(file);
        return {
          file,
          title,
          date: getDateFromFile(file),
        };
      }));

      return {
        name: group.name,
        files,
      }
    }));
  }

  async getTitle(note: TFile) {
    try {
      const text = await note.vault.cachedRead(note);
      const content = this.getContentWithoutMetadata(text);
      const contentParts = content.split('\n')
      const titleMd = contentParts[0]!;
      const title = titleMd.replace(/^#*/, '').trim();
      return title;
    } catch (error) {
      return 'Broken note';
    }
  }

  private getContentWithoutMetadata(text: string) {
    const trimmed = text.trim();
    if (!trimmed.startsWith('---')) return text;

    const content = trimmed.split('---')[2];
    if (!content) return text;

    return content.trim();
  }
}
