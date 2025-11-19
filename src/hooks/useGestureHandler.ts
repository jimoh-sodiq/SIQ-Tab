import { Gesture } from "react-native-gesture-handler";
import { useToolStore } from "@/store/useToolStore";
import { DrawingTool } from "@/types";
import { TOOL_MAP } from '@/lib/utils';


export function useCanvasGestures() {
  const activeTool = useToolStore((s) => s.activeTool);

  const tool = TOOL_MAP[activeTool];

  return Gesture.Pan()
    .onStart((e) => tool.onStart?.(e))
    .onUpdate((e) => tool.onUpdate?.(e))
    .onEnd(() => tool.onEnd?.())
    .runOnJS(true);
}
