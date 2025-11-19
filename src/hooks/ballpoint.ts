import { useToolStore } from "@/store/useToolStore";
import { Skia, SkPath } from "@shopify/react-native-skia";
import { GestureStateChangeEvent } from "react-native-gesture-handler";
import { PanGestureHandlerEventPayload } from "react-native-screens";

type GestureEventType = GestureStateChangeEvent<PanGestureHandlerEventPayload>;
export const BallpointTool = {
  path: null as SkPath | null,

  onStart(g: GestureEventType) {
    const settings = useToolStore.getState().ballpoint;
    const p = Skia.Path.Make();
    p.moveTo(g.x, g.y);
    this.path = p;
  },

  onUpdate(g: GestureEventType) {
    if (!this.path) return;
    this.path.lineTo(g.x, g.y);
  },

  onEnd() {
    if (this.path) {
      const s = useToolStore.getState();
      s.undoStack.push({
        type: "stroke",
        tool: "ballpoint",
        path: this.path,
        ...s.ballpoint,
      });
    }
    this.path = null;
  },

  render() {
    if (!this.path) return null;
    const settings = useToolStore.getState().ballpoint;
    return {
      path: this.path,
      color: settings.color,
      strokeWidth: settings.strokeWidth,
    };
  },
};
