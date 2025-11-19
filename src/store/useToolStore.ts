import { create } from "zustand";
import { DrawingTool, DrawingToolOptions, DrawingToolProperty } from "@/types";

interface Store extends Record<DrawingTool, DrawingToolProperty> {
  activeTool: DrawingTool;
  totalPages: number;
  currentPage: number;
  pages: Record<number, UniquePageData>;
  undoStack: Array<any>;
  redoStack: Array<any>;
  setActiveTool: (tool: DrawingTool) => void;
  updateTool: (tool: DrawingTool, payload: DrawingToolProperty) => void;
  pushStroke: (stroke: any) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
}

interface UniquePageData {
  undoStack: Array<any>;
  redoStack: Array<any>;
}

export const useToolStore = create<Store>((set) => ({
  activeTool: "ballpoint" as DrawingTool,

  totalPages: 1,
  currentPage: 1,

  pages: {
    0: { undoStack: [], redoStack: [] },
  },

  activeToolGroup: "scribble" as DrawingToolOptions,

  // PEN SETTINGS
  ballpoint: {
    strokeWidth: 3,
    color: "#000000",
    opacity: 1,
    style: "stroke", // fill or stroke
  },

  eraser: {
    strokeWidth: 20,
    color: "white", // use background color
    mode: "stroke",
    opacity: 1,
    style: "stroke",
  },

  viewport: {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  },

  undoStack: [],
  redoStack: [],

  // ACTIONS
  setActiveTool: (tool: DrawingTool) => set({ activeTool: tool }),

  updateTool: (tool: DrawingTool, payload: Partial<DrawingToolProperty>) =>
    set((state) => ({
      [tool]: { ...state[tool], ...payload },
    })),

  addPage: () =>
    set((state) => {
      const newIndex = state.totalPages;
      return {
        totalPages: newIndex + 1,
        currentPage: newIndex,
        pages: {
          ...state.pages,
          [newIndex]: { undoStack: [], redoStack: [] },
        },
      };
    }),

  goToPage: (pageIndex: number) =>
    set((state) => ({
      currentPage: Math.max(0, Math.min(state.totalPages - 1, pageIndex)),
    })),

    
  pushStroke: (stroke: any) =>
    set((state) => ({
      undoStack: [...state.undoStack, stroke],
      redoStack: [],
    })),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state;

      const popped = state.undoStack[state.undoStack.length - 1];
      return {
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, popped],
      };
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;

      const popped = state.redoStack[state.redoStack.length - 1];
      return {
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, popped],
      };
    }),

  clearCanvas: () => {
    set((state) => ({
      undoStack: [],
      redoStack: [],
    }));
  },
}));
