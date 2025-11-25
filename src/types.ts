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


export interface DrawingStrokeSendEventData {
  type: "stroke-start" | "stroke-end" | "stroke-move";
  page: number;
  x: number;
  y: number;
  color: string;
  strokeWidth: number;
  tool: DrawingTool;
  strokeId: string;
  mode: "draw" | "erase";
}

export interface StrokeStartEvent {
  type: "stroke_start";
  page: number;
  x: number;
  y: number;
  color: string;
  strokeWidth: number;
  tool: DrawingTool;
  strokeId: string;
  mode: "draw" | "erase";
}

export interface StokeMoveEvent {
  type: "stroke_move";
  x: number;
  y: number;
  strokeId: string;

}

export interface StrokeEndEvent {
  type: "stroke_end";
  strokeId: string;
}

export interface UndoRedoEvent {
  type: "undo" | "redo";
}

export interface ClearPageEvent {
  type: "clear_page";
  page: number;
}

export type DrawingEvent = StrokeStartEvent | StokeMoveEvent | StrokeEndEvent | UndoRedoEvent | ClearPageEvent;