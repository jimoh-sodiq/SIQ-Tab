import { DrawingTool, DrawingToolOptions, DrawingToolProperty } from "@/types";
import { create } from "zustand";

interface Store extends Record<DrawingTool, DrawingToolProperty> {
  activeTool: DrawingTool;
  currentPage: number;
  pages: Record<number, UniquePageData>;
  totalPages: number;
  undoStack: Array<any>;
  redoStack: Array<any>;
  ipCode: string;
  setIpCode: (code: string) => void;
  setActiveTool: (tool: DrawingTool) => void;
  updateTool: (tool: DrawingTool, payload: DrawingToolProperty) => void;
  pushStroke: (stroke: any) => void;
  undo: () => void;
  redo: () => void;
  clearPage: () => void;
  addPage: () => void;
  goToPage: (i: number) => void;
}

interface UniquePageData {
  undoStack: Array<any>;
  redoStack: Array<any>;
}

export const useToolStore = create<Store>((set, get) => ({
  activeTool: "ballpoint" as DrawingTool,
  ipCode: "",

  currentPage: 1,

  pages: {
    1: { undoStack: [], redoStack: [] },
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

  // GETTERS

  get totalPages() {
    return Object.keys(get().pages).length;
  },

  // ACTIONS
  setIpCode: (code: string) => set({ ipCode: code }),
  setActiveTool: (tool: DrawingTool) => set({ activeTool: tool }),

  updateTool: (tool: DrawingTool, payload: Partial<DrawingToolProperty>) =>
    set((state) => ({
      [tool]: { ...state[tool], ...payload },
    })),

  addPage: () =>
    set((state) => {
      const newIndex = state.totalPages + 1;
      return {
        totalPages: newIndex + 1,
        currentPage: newIndex,
        pages: {
          ...state.pages,
          [newIndex]: { undoStack: [], redoStack: [] },
        },
      };
    }),

  goToPage: (page: number) =>
    set((state) => {
      if (!state.pages[page]) {
        state.pages[page] = {
          undoStack: [],
          redoStack: [],
        };
      }
      return { currentPage: page };
    }),


  pushStroke: (stroke) =>
    set((state) => {
      const page = state.currentPage;
      const pageData = state.pages[page];

      return {
        pages: {
          ...state.pages,
          [page]: {
            undoStack: [...pageData.undoStack, stroke],
            redoStack: [],
          },
        },
      };
    }),

  undo: () => {
    const state = get();
    const page = state.currentPage;
    const pageData = state.pages[page];

    if (pageData.undoStack.length === 0) return;

    const popped = pageData.undoStack.at(-1);

    set({
      pages: {
        ...state.pages,
        [page]: {
          undoStack: pageData.undoStack.slice(0, -1),
          redoStack: [...pageData.redoStack, popped],
        },
      },
    });
  },

  redo: () => {
    const state = get();
    const page = state.currentPage;
    const pageData = state.pages[page];

    if (pageData.redoStack.length === 0) return;

    const popped = pageData.redoStack.at(-1);

    set({
      pages: {
        ...state.pages,
        [page]: {
          redoStack: pageData.redoStack.slice(0, -1),
          undoStack: [...pageData.undoStack, popped],
        },
      },
    });
  },

  clearPage: () => {
    const state = get();
    const page = state.currentPage;

    set({
      pages: {
        ...state.pages,
        [page]: { undoStack: [], redoStack: [] },
      },
    });
  },
}));
