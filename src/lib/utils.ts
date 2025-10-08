import { clsx, type ClassValue } from "clsx";
import { TFile } from "obsidian";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getDateFromFile(file: TFile) {
	const noteDate = window.moment(file.basename.slice(0, 10));

	if (!noteDate.isValid()) return null;

	return noteDate
}