import { colors } from "@/assets/colors";
import NoteHeader from '@/components/note/NoteHeader';
import { useNoteWebSocket } from '@/hooks/useNoteWebSocket';
import { supportedNoteColors } from "@/lib/utils";
import { useToolStore } from "@/store/useToolStore";
import { DrawingTool, StrokeStartEvent } from "@/types";
import Slider from "@react-native-community/slider";
import {
  BlendMode,
  Canvas,
  Line,
  Path,
  Skia,
  SkPath,
  useCanvasSize
} from "@shopify/react-native-skia";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { shareAsync } from 'expo-sharing';
import {
  ArrowBendUpLeftIcon,
  ArrowBendUpRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  EraserIcon,
  ImageIcon,
  PenIcon,
  ScribbleIcon
} from "phosphor-react-native";
import { useState } from "react";
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Popover from "react-native-popover-view";
import { SafeAreaView } from "react-native-safe-area-context";
import ColorPicker, { Swatches } from "reanimated-color-picker";

interface CurrentPathData {
  path: SkPath;
  color: string | undefined;
  strokeWidth: number | undefined;
}

export default function NoteScreen() {
  const router = useRouter();
  const currentPage = useToolStore((s) => s.currentPage);
  const totalPages = useToolStore((s) => s.totalPages);
  const pages = useToolStore((s) => s.pages);
  const goToPage = useToolStore((s) => s.goToPage);
  const addPage = useToolStore((s) => s.addPage);
  const undoStack = pages[currentPage].undoStack;
  const redoStack = pages[currentPage].redoStack;
  const activeTool = useToolStore((s) => s.activeTool);
  const store = useToolStore();
  const activeToolSettings = store[activeTool];
  const pushStroke = useToolStore((s) => s.pushStroke);
  const undo = useToolStore((s) => s.undo);
  const redo = useToolStore((s) => s.redo);
  const setActiveTool = useToolStore((s) => s.setActiveTool);
  const clearCanvas = useToolStore((s) => s.clearPage);
  const updateTool = useToolStore((s) => s.updateTool);
  const [isReadMode, setIsReadMode] = useState(false)

  const [currentPath, setCurrentPath] = useState<CurrentPathData | null>(null);
  const [showSnapshotMessage, setShowSnapshotMessage] = useState(false);

  const { send, connected } = useNoteWebSocket((msg) => {
    console.log("SERVER MESSAGE -----", msg)
  });

  // const { send } = useNoteWebSocket((msg) => {
  //   console.log("SERVER MESSAGE -----", msg)
  // }, ipCode)

  // DRAWING CANVAS
  const {
    ref: canvasRef,
    size: { width },
  } = useCanvasSize();

  const { width: windowWidth } = useWindowDimensions()

  const computedToolClass = (tool: DrawingTool) => {
    return activeTool == tool
      ? "rounded-full bg-stone-600   w-fit p-2"
      : "rounded-full   w-fit p-2";
  };

  const swipeGesture = Gesture.Fling().onStart(({ x, y }) => {

  }).onEnd(() => {
    if (isReadMode) {
      goToPage(currentPage + 1)
    }
  })

  const [currentStrokeId, setCurrentStrokeId] = useState<string | null>(null);

  const drawingGesture = Gesture.Pan()
    .onStart(({ x, y }) => {
      // setCurrentStrokeId(Crypto.randomUUID());
      const newPath = Skia.Path.Make();
      newPath.moveTo(x, y);
      const pathData = {
        path: newPath,
        color: activeTool == DrawingTool.eraser ? 'white' : activeToolSettings.color,
        strokeWidth: activeToolSettings.strokeWidth,
      };
      setCurrentPath(pathData as any);

      // send stroke start event
      send({
        type: "stroke_start",
        page: currentPage,
        x,
        y,
        color: activeToolSettings.color || "#000000",
        strokeWidth: activeToolSettings.strokeWidth || 3,
        tool: activeTool,
        strokeId: currentStrokeId as string,
        mode: "draw"
      });
    })
    .onUpdate(({ x, y }) => {
      if (currentPath as any) {
        currentPath?.path?.lineTo(x, y);
        send({
          type: "stroke_move",
          strokeId: currentStrokeId as string,
          x, y
        });
        setCurrentPath({ ...(currentPath as any) });
      }
    })
    .onEnd(() => {
      send({
        type: "stroke_end",
        strokeId: currentStrokeId as string
      });
      if (currentPath) {
        pushStroke(currentPath);
        setCurrentPath(null);
      }
      setCurrentStrokeId(null);
    })
    .runOnJS(true);


  const saveImage = async () => {
    const image = canvasRef.current?.makeImageSnapshot();
    if (image) {
      const base64data = image.encodeToBase64();
      const filename = `skia_snapshot_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      try {
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your page as image',
          UTI: `Page-${currentPage}.png`,
        });

      } catch (e) {
        Alert.alert('Error', 'Failed to save image');
      }
    } else {
      Alert.alert('Error', 'Could not create image snapshot');
    }
  };

  const onSelectColor = ({ hex }: { hex: string }) => {
    "worklet";
    updateTool(DrawingTool.ballpoint, {
      color: hex,
    });
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView className="bg-black flex-1 relative">
        <StatusBar barStyle='light-content' />

        <NoteHeader clearEvent={() => send({ type: "clear_page", page: currentPage })} />
        <View className="flex-1 bg-stone-800 flex justify-center">
          {/* <View className="h-[10%]" /> */}

          <View className="flex-1 max-w-[800px] mx-auto border-[1px] w-full">
            <GestureDetector gesture={isReadMode ? swipeGesture : drawingGesture}>
              <Canvas
                style={{
                  flex: 1,
                  backgroundColor: "white",
                }}
                ref={canvasRef}
              >
                {/* Render history strokes */}
                {undoStack.map((item, i) => (
                  <Path
                    key={i}
                    path={item.path}
                    color={item.color}
                    strokeWidth={item.strokeWidth}
                    style="stroke"
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

                {Array.from({ length: 100 }).map((_, i) => {
                  const y = i * 40; // line spacing (adjust)
                  return (
                    <Line
                      key={`line-${i}`}
                      p1={{ x: 0, y }}
                      p2={{ x: windowWidth, y }}
                      color="rgba(0,0,255,0.3)" // very light blue notebook line
                      strokeWidth={1}
                    />
                  );
                })}

              </Canvas>
            </GestureDetector>
          </View>

        </View>
        <View className="flex justify-end min-h-[8%]">
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
                          className="rounded-full w-7 h-7 border-white p-1 border-[1px]"
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
                    onPress={saveImage}
                    className="w-fit p-2"
                  >
                    <ImageIcon size={22} color={colors.secondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="w-fit p-2"
                    disabled={undoStack.length == 0}
                    onPress={() => { undo(); send({ type: "undo" }) }}
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
                    onPress={() => { redo(); send({ type: "redo" }) }}
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
                <TouchableOpacity
                  disabled={currentPage <= 1}
                  onPress={() => goToPage(currentPage - 1)}
                >
                  <CaretLeftIcon
                    color={currentPage <= 1 ? "#6b7280" : "white"}
                    size={18}
                  />
                </TouchableOpacity>
                <Text className="text-white text-xl tracking-widest">
                  {currentPage}
                </Text>
                <TouchableOpacity onPress={() => goToPage(currentPage + 1)}>
                  <CaretRightIcon color="white" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
