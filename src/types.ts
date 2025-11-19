import { SkColor } from "@shopify/react-native-skia";

export enum DrawingToolGroup {
  PEN = "pen",
  HIGHLIGHT = "highlight",
  ERASER = "eraser",
  SELECTION = "selection",
  SINGLE_ACTION = "single_action", // like undo or redo
}

export enum DrawingTool {
  ballpoint = "ballpoint",
  // pencil = "pencil",
  // fountain = "fountain",
  // gelpen = "gelpen",
  // highlighter = "highlighter",
  // brush = "brush",
  eraser = "eraser",
  // selector = "selector",
  // zoom = "zoom", //Two finger
  // pan = "pan", // Two finger
  viewport = "viewport",
}

export enum DrawingToolOptions {
  SCRIBBLE = "scribble",
  TEXT = "text",
}

export type StrokeColor = string | SkColor;

export interface DrawingToolProperty {
  strokeWidth?: number;
  color?: string;
  opacity?: number;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  style?: "fill" | "stroke";
}
