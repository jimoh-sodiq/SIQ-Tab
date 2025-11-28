// useNoteWebSocket.ts
import { useEffect } from "react";
import { useWSStore } from "@/store/useWSStore";

export function useNoteWebSocket(onMessage: (msg: any) => void) {
  const send = useWSStore((s) => s.send);
  const connected = useWSStore((s) => s.connected);

  useEffect(() => {
    const handler = (e: any) => {
      onMessage(e.detail);
    };
    // window.addEventListener("ws-message", handler);

    return
  }, []);

  return { send, connected };
}
