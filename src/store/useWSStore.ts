// useWSStore.ts
import { create } from "zustand";
import { DrawingEvent } from "@/types";

interface WSState {
  ws: WebSocket | null;
  encodedIp: string | null;
  decodedIp: string | null;
  connected: boolean;

  setEncodedIp: (ip: string) => void;
  decodeIp: (encoded: string) => string;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  send: (data: DrawingEvent) => void;
}

export const useWSStore = create<WSState>((set, get) => ({
  ws: null,
  encodedIp: null,
  decodedIp: null,
  connected: false,

  decodeIp(encoded) {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let num = 0;
    for (let c of encoded) {
      num = num * 62 + chars.indexOf(c);
    }

    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join(".");
  },

  setEncodedIp(encodedIp) {
    const decodedIp = get().decodeIp(encodedIp);
    set({ encodedIp, decodedIp });
  },

  connect() {
    const { ws, decodedIp } = get();

    if (!decodedIp) {
      console.warn("⚠ No IP set yet.");
      return;
    }

    if (ws) {
      console.log("[WS] Already connected");
      return;
    }

    const socket = new WebSocket(`ws://${decodedIp}:8080/ws`);
    console.log("socket", socket);

    socket.onopen = () => {
      console.log("[WS] Connected");
      set({ connected: true });
    };

    socket.onclose = () => {
      console.log("[WS] Disconnected");
      set({ ws: null, connected: false });
    };

    socket.onerror = (err) => {
      console.log("[WS] Error", err);
    };

    socket.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        // Broadcast to subscribers
        window.dispatchEvent(
          new CustomEvent("ws-message", { detail: msg })
        );
      } catch (err) {
        console.log("WS parse error", err);
      }
    };

    set({ ws: socket });
  },

  disconnect() {
    const { ws } = get();
    if (ws) {
      ws.close();
    }
    set({ ws: null, connected: false });
  },

  reconnect() {
    const { disconnect, connect } = get();
    disconnect();
    connect();
  },

  send(data) {
    const { ws } = get();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
      console.log("[WS] sending", JSON.stringify(data));
    }
  },
}));
