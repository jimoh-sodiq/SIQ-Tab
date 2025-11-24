import { colors } from '@/assets/colors';
import { supportedNoteColors } from '@/lib/utils';
import { useToolStore } from '@/store/useToolStore';
import { DrawingTool } from '@/types';
import Slider from '@react-native-community/slider';
import { useCanvasSize } from '@shopify/react-native-skia';
import { ScribbleIcon, PenIcon, EraserIcon, ImageIcon, ArrowBendUpLeftIcon, ArrowBendUpRightIcon, CaretLeftIcon, CaretRightIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Text, Alert } from 'react-native';
import Popover from 'react-native-popover-view';
import ColorPicker, { Swatches } from "reanimated-color-picker";
import * as FileSystem from "expo-file-system/legacy";
import { shareAsync } from 'expo-sharing';

export default function NoteFooter() {

    const store = useToolStore();
    const activeTool = useToolStore((s) => s.activeTool);
    const activeToolSettings = store[activeTool];
    const setActiveTool = useToolStore((s) => s.setActiveTool);
    const updateTool = useToolStore((s) => s.updateTool);
    const currentPage = useToolStore((s) => s.currentPage);
    const pages = useToolStore((s) => s.pages);
    const undoStack = pages[currentPage].undoStack;
    const redoStack = pages[currentPage].redoStack;
    const undo = useToolStore((s) => s.undo);
    const redo = useToolStore((s) => s.redo);
    const goToPage = useToolStore((s) => s.goToPage);

    const [showSnapshotMessage, setShowSnapshotMessage] = useState(false);

    const computedToolClass = (tool: DrawingTool) => {
        return activeTool == tool
            ? "rounded-full bg-stone-600   w-fit p-2"
            : "rounded-full   w-fit p-2";
    };

    const onSelectColor = ({ hex }) => {
        "worklet";
        updateTool(DrawingTool.ballpoint, {
            color: hex,
        });
    };

    // DRAWING CANVAS
    const {
        ref: canvasRef,
        size: { width },
    } = useCanvasSize();

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

    return <>
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
                                            className="rounded-full w-6 h-6 border border-[1px] border-gray-200"
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
    </>
}