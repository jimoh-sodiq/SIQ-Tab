import { View, TouchableOpacity, Text } from "react-native"
import { CaretLeftIcon, PlugsConnectedIcon, PlugsIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { useToolStore } from '@/store/useToolStore'
import { useNoteWebSocket } from '@/hooks/useNoteWebSocket'

export default function NoteHeader({ clearEvent }: { clearEvent: (data?: any) => void }) {
    const router = useRouter()
    const clearCanvas = useToolStore((s) => s.clearPage);

    const { send, connected } = useNoteWebSocket((msg) => {
        console.log("SERVER MESSAGE -----", msg)
    });

    const handleClearCanvas = () => {
        clearCanvas()
        clearEvent()
    }

    return <>
        <View className="px-5 py-2 flex-row items-center gap-4 justify-between">
            <View className="flex-row items-center gap-2">
                <TouchableOpacity onPress={() => router.back()}>
                    <CaretLeftIcon color="white" size={22} />
                </TouchableOpacity>
                <Text className="text-white tracking-widest text-lg">Welcome</Text>
                <View className="flex items-center justify-center px-5">{
                    connected ? <PlugsConnectedIcon color='green' weight='fill' size={22} /> : <PlugsIcon color='red' weight='fill' size={22} />}</View>
            </View>
            <View className="flex flex-row items-center gap-4">
                <TouchableOpacity onPress={handleClearCanvas}>
                    <Text className="text-secondary underline tracking widest">
                        Clear page
                    </Text>
                </TouchableOpacity>
                {/* <TouchableOpacity>
                    <ArrowsOutSimpleIcon size={22} color="white" />
                </TouchableOpacity> */}
            </View>
        </View>
    </>
}