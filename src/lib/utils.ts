import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DrawingTool } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const supportedNoteColors = [
  "#000000", // black
  "#00A000", // green
  "#0077FF", // blue
  "#FF0000", // red
  "#FF7F00", // orange
  "#FFFF00", // yellow
  "#800080", // purple
  "#00FFFF", // cyan
  "#FFC0CB", // pink
  "#8B4513", // brown
];