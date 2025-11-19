import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowBendUpLeftIcon,
  ArrowBendUpRightIcon,
  ArrowsOutSimpleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  EraserIcon,
  ImageIcon,
  PenIcon,
  ScribbleIcon,
} from "phosphor-react-native";
import { useRouter } from "expo-router";
import { colors } from "@/assets/colors";
import { useState, useRef } from "react";
import {
  Canvas,
  useCanvasSize,
  Skia,
  Path,
  SkPath,
  Line,
} from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { DrawingTool } from "@/types";
import Popover from "react-native-popover-view";
import { useToolStore } from "@/store/useToolStore";
import * as FileSystem from "expo-file-system";
import ColorPicker, { Swatches } from "reanimated-color-picker";
import { supportedNoteColors } from "@/lib/utils";
import Slider from "@react-native-community/slider";

interface CurrentPathData {
  path: SkPath;
  color: string | undefined;
  strokeWidth: number | undefined;
}

export default function NoteScreen() {
  const router = useRouter();
  const undoStack = useToolStore((s) => s.undoStack);
  const redoStack = useToolStore((s) => s.redoStack);
  const activeTool = useToolStore((s) => s.activeTool);
  const store = useToolStore();
  const activeToolSettings = store[activeTool];
  const pushStroke = useToolStore((s) => s.pushStroke);
  const undo = useToolStore((s) => s.undo);
  const redo = useToolStore((s) => s.redo);
  const setActiveTool = useToolStore((s) => s.setActiveTool);
  const clearCanvas = useToolStore((s) => s.clearCanvas);
  const updateTool = useToolStore((s) => s.updateTool);

  const [currentPath, setCurrentPath] = useState<CurrentPathData | null>(null);
  const [showSnapshotMessage, setShowSnapshotMessage] = useState(false);

  // DRAWING CANVAS
  const {
    ref: canvasRef,
    size: { width },
  } = useCanvasSize();

  const computedToolClass = (tool: DrawingTool) => {
    return activeTool == tool
      ? "rounded-full bg-stone-600   w-fit p-2"
      : "rounded-full   w-fit p-2";
  };

  const drawingGesture = Gesture.Pan()
    .onStart(({ x, y }) => {
      const newPath = Skia.Path.Make(); // set the color for eraser and dashed line styling when moving, then set the mode to fill and the stroke to fill, for the saved one, for the live one, set it to the dashed line if the mode is set to fill
      newPath.moveTo(x, y);
      const pathData = {
        path: newPath,
        color: activeToolSettings.color,
        strokeWidth: activeToolSettings.strokeWidth,
      };
      setCurrentPath(pathData as any);
    })
    .onUpdate(({ x, y }) => {
      if (currentPath as any) {
        currentPath?.path?.lineTo(x, y);
        setCurrentPath({ ...(currentPath as any) });
      }
    })
    .onEnd(() => {
      if (currentPath) {
        pushStroke(currentPath);
        setCurrentPath(null);
      }
    })
    .runOnJS(true);

  const takeCanvasSnapshot = async () => {
    const image = canvasRef.current?.makeImageSnapshot();
    if (!image) {
      Alert.alert("Failed to export image, please try again");
      return;
    }

    try {
      const bytes = image.encodeToBytes();
      const filePath = `siq-note-${Date.now()}.jpg`;

      // const base64 = Buffer.from(bytes).toString("base64");
      const file = new FileSystem.File(
        new FileSystem.Directory(FileSystem.Paths.document),
        filePath
      );
      file.create({
        intermediates: true,
      });
      file.write(bytes, { encoding: "base64" });

      // new FileSystem.File(FileSystem.Paths.document, "SIQ-Notes", filePath)
      //   .create()
      //   .write(bytes, {
      //     encoding: "base64",
      //   });
      console.log("file", file.uri);

      setShowSnapshotMessage(true);
      setTimeout(() => setShowSnapshotMessage(false), 3000);

      // console.log("Saved at:", filePath);
    } catch (error) {
      console.error(error);
      Alert.alert("Something went wrong while saving image");
    }
  };

  const onSelectColor = ({ hex }) => {
    "worklet";
    updateTool(DrawingTool.ballpoint, {
      color: hex,
    });
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView className="bg-black flex-1 relative">
        <View className="px-5 py-2 flex-row items-center gap-4 justify-between">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => router.back()}>
              <CaretLeftIcon color="white" size={22} />
            </TouchableOpacity>
            <Text className="text-white tracking-widest text-lg">Welcome</Text>
          </View>
          <View className="flex flex-row items-center gap-4">
            <TouchableOpacity onPress={clearCanvas}>
              <Text className="text-secondary underline tracking widest">
                Clear page
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <ArrowsOutSimpleIcon size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-1 bg-stone-800 flex justify-center">
          {/* <View className="h-[10%]" /> */}

          {/* #d6d3d1 */}
          <GestureDetector gesture={drawingGesture}>
            <Canvas
              style={{
                flex: 1,
                backgroundColor: "white",
              }}
              ref={canvasRef}
            >
              {Array.from({ length: 100 }).map((_, i) => {
                const y = i * 40; // line spacing (adjust)
                return (
                  <Line
                    key={`line-${i}`}
                    p1={{ x: 0, y }}
                    p2={{ x: width, y }}
                    color="rgba(0,0,255,0.3)" // very light blue notebook line
                    strokeWidth={1}
                  />
                );
              })}
              {/* Render history strokes */}
              {undoStack.map((item, i) => (
                <Path
                  key={i}
                  path={item.path}
                  color={item.color}
                  strokeWidth={item.strokeWidth}
                  style='stroke'
                  strokeJoin="round"
                  strokeCap="round"
                />
              ))}

              {/* Live stroke */}
              {currentPath && (
                <Path
                  path={currentPath.path}
                  color={activeToolSettings.color}
                  style="stroke"
                  strokeWidth={activeToolSettings.strokeWidth}
                />
              )}
            </Canvas>
          </GestureDetector>

          <View className="flex justify-end min-h-[8%]">
            {showSnapshotMessage && (
              <Text className="px-5 pb-2 text-sm text-green-600 font-medium tracking-widest">
                Image snapshot saved to documents
              </Text>
            )}
            <View className="flex-row w-full items-center justify-between">
              <View className=" flex-row items-center px-5 py-1 gap-2">
                <TouchableOpacity className="rounded-full border-stone-600 border-[1px]   w-fit p-2">
                  <ScribbleIcon size={22} color={colors.secondary} />
                </TouchableOpacity>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row items-center gap-5 pl-3">
                    <TouchableOpacity
                      onPress={() => setActiveTool(DrawingTool.ballpoint)}
                      className={computedToolClass(DrawingTool.ballpoint)}
                    >
                      <PenIcon size={22} color={colors.secondary} />
                    </TouchableOpacity>
                    <Popover
                      backgroundStyle={{
                        backgroundColor: "transparent",
                        opacity: 1,
                      }}
                      popoverStyle={{ backgroundColor: "gray" }}
                      from={
                        <TouchableOpacity>
                          <View
                            className="rounded-full w-6 h-6"
                            style={{ backgroundColor: store.ballpoint.color }}
                          />
                        </TouchableOpacity>
                      }
                    >
                      <View className="p-4 w-fit h-fit max-w-[400px]">
                        <ColorPicker
                          style={{ width: "100%" }}
                          value={activeToolSettings.color}
                          onComplete={onSelectColor}
                        >
                          <Swatches colors={supportedNoteColors} />
                        </ColorPicker>
                        <View className="flex flex-row items-center gap-1">
                          <Text className=" text-stone-950 tracking-wider">
                            Stroke Width (1-14)
                          </Text>
                          <Slider
                            style={{ flex: 1, height: 40 }}
                            minimumValue={1}
                            step={1}
                            maximumValue={14}
                            minimumTrackTintColor={store.ballpoint.color}
                            thumbTintColor={store.ballpoint.color}
                            maximumTrackTintColor="#000000"
                            value={store.ballpoint.strokeWidth}
                            onValueChange={(value) =>
                              updateTool(DrawingTool.ballpoint, {
                                strokeWidth: value,
                              })
                            }
                          />
                          <Text className="text-stone-950 tracking-wider">
                            {store.ballpoint.strokeWidth}
                          </Text>
                        </View>
                      </View>
                    </Popover>

                    <TouchableOpacity
                      onPress={() => setActiveTool(DrawingTool.eraser)}
                      className={computedToolClass(DrawingTool.eraser)}
                    >
                      <EraserIcon
                        size={22}
                        color={colors.secondary}
                        weight="fill"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={takeCanvasSnapshot}
                      className="w-fit p-2"
                    >
                      <ImageIcon size={22} color={colors.secondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="w-fit p-2"
                      disabled={undoStack.length == 0}
                      onPress={undo}
                    >
                      <ArrowBendUpLeftIcon
                        size={22}
                        color={
                          undoStack.length == 0 ? "#6b7280" : colors.secondary
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-fit p-2"
                      disabled={redoStack.length == 0}
                      onPress={redo}
                    >
                      <ArrowBendUpRightIcon
                        size={22}
                        color={
                          redoStack.length == 0 ? "#6b7280" : colors.secondary
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity>
                    <CaretLeftIcon color="#6b7280" size={18} />
                  </TouchableOpacity>
                  <Text className="text-white text-xl tracking-widest">1</Text>
                  <TouchableOpacity>
                    <CaretRightIcon color="white" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
