import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BallpointTool } from "../hooks/ballpoint";
import { DrawingTool } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TOOL_MAP: Partial<Record<DrawingTool, any>> = {
  ballpoint: BallpointTool,
};


export const supportedNoteColors = [
  "#000000", // black
  "#0A7A0A", // deep green
  "#004FCC", // deep blue
  "#A00000", // deep red
  "#DC6E00", // dark orange
  "#BBAA00", // muted yellow
  "#5A2A80", // dark purple
  "#008C8C", // deep cyan
  "#D17A9B", // muted pink
  "#5A3A1F", // dark brown
];