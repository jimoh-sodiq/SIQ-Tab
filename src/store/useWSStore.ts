// useWSStore.ts
import { create } from "zustand";
import { DrawingEvent } from "@/types";

interface WSState {
  ws: WebSocket | null;
  encodedIp: string | null;
  decodedIp: string | null;
  decodedIpArray: string[];
  connected: boolean;

  setEncodedIp: (ip: string) => void;
  decodeIp: (encoded: string) => string;
  decodeIpArray: (encoded: string) => string[];
  connect: () => Promise<void>;
  connectIps: () => Promise<void>;
  attemptSingleConnection: (ip: string) => Promise<void>;
  disconnect: () => void;
  reconnect: () => void;
  send: (data: DrawingEvent) => void;
}

function fromBase62(char: string) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return chars.indexOf(char);
}

export const useWSStore = create<WSState>((set, get) => ({
  ws: null,
  encodedIp: null,
  decodedIp: null,
  connected: false,
  decodedIpArray: [],

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

  decodeIpArray(str: string) {
    const result: string[] = [];
    let i = 0;

    while (i < str.length) {
      // 1. Read length prefix (Base62 digit)
      const lenChar = str[i];
      const len = fromBase62(lenChar);
      i++;

      // 2. Extract encoded IP
      const encodedIp = str.slice(i, i + len);
      i += len;

      // 3. Decode IP
      result.push(get().decodeIp(encodedIp));
    }

    return result;
  },



  setEncodedIp(encodedIp) {
    const decodedIp = get().decodeIp(encodedIp);
    const decodedIpArray = get().decodeIpArray(encodedIp);
    set({ encodedIp, decodedIp, decodedIpArray });
  },

  connect() {
    const { ws, decodedIp, } = get();

    return new Promise<void>((resolve, reject) => {
      if (!decodedIp) {
        console.warn("⚠ No IP set yet.");
        reject("No IP");
        return;
      }

      if (ws) {
        console.log("[WS] Already connected");
        resolve();
        return;
      }

      const socket = new WebSocket(`ws://${decodedIp}:8080/ws`);

      socket.onopen = () => {
        console.log("[WS] Connected");
        set({ connected: true });
        resolve();
      };

      socket.onerror = (err) => {
        console.log("[WS] Error", err);
        reject(err);
      };

      socket.onclose = () => {
        console.log("[WS] Disconnected");
        set({ ws: null, connected: false });
      };

      socket.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          window.dispatchEvent(
            new CustomEvent("ws-message", { detail: msg })
          );
        } catch (err) {
          console.log("WS parse error", err);
        }
      };

      set({ ws: socket });
    });
  }
  ,

  attemptSingleConnection(ip: string) {
    return new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(`ws://${ip}:8080/ws`);

      let resolvedOrRejected = false;

      socket.onopen = () => {
        if (resolvedOrRejected) return;
        console.log("[WS] Connected", ip);
        set({ ws: socket, connected: true });
        resolvedOrRejected = true;
        resolve();
      };

      socket.onerror = (err) => {
        if (resolvedOrRejected) return;
        resolvedOrRejected = true;
        socket.close();
        reject(err);
      };

      socket.onclose = () => {
        if (!resolvedOrRejected) {
          resolvedOrRejected = true;
          reject("Closed before opening");
        }
        set({ ws: null, connected: false });
      };

      socket.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          window.dispatchEvent(
            new CustomEvent("ws-message", { detail: msg })
          );
        } catch (err) {
          console.log("WS parse error", err);
        }
      };
    });
  },

  connectIps() {
    const { ws, decodedIpArray } = get();

    return new Promise<void>(async (resolve, reject) => {
      if (!decodedIpArray || decodedIpArray.length === 0) {
        console.warn("⚠ No IP list provided.");
        reject("No IP");
        return;
      }

      if (ws) {
        console.log("[WS] Already connected");
        resolve();
        return;
      }

      console.log("🔍 Trying IPs:", decodedIpArray);

      // Try each IP one-by-one
      for (let i = 0; i < decodedIpArray.length; i++) {
        const ip = decodedIpArray[i];
        console.log(`🔌 Attempting connection to ${ip}...`);

        try {
          await get().attemptSingleConnection(ip);
          console.log(`✅ Connected to ${ip}`);
          resolve();
          return; // stop trying more IPs
        } catch (err) {
          console.log(`❌ Failed to connect to ${ip}`);
          // continue to next IP
        }
      }

      console.log("🚫 No IP reachable");
      reject("No IP reachable");
    });
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
