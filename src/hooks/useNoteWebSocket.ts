import { DrawingEvent } from '@/types';
import { useEffect, useRef } from "react";

export function useNoteWebSocket(onMessage: (msg: any) => void) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://192.168.52.40:8080");  //192.168.1.214  //ws://10.0.2.2:8080

    ws.current.onopen = () => console.log("[WS] connected");
    ws.current.onerror = (e) => console.log("[WS] error", e);
    ws.current.onmessage = (e) => onMessage(JSON.parse(e.data));

    return () => ws.current?.close();
  }, []);

  const send = (data: DrawingEvent) => {
    if (ws.current?.readyState === ws.current?.OPEN) {
      ws.current?.send(JSON.stringify(data));
    }
    console.log("[WS] sending", JSON.stringify(data));
  };

  return { send };
}
