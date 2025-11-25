import { View, TouchableOpacity, Text } from "react-native"
import { ArrowsOutSimpleIcon, CaretLeftIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { useToolStore } from '@/store/useToolStore'

export default function NoteHeader({ clearEvent }: { clearEvent: (data?: any) => void }) {
    const router = useRouter()
    const clearCanvas = useToolStore((s) => s.clearPage);

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
            </View>
            <View className="flex flex-row items-center gap-4">
                <TouchableOpacity onPress={handleClearCanvas}>
                    <Text className="text-secondary underline tracking widest">
                        Clear page
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <ArrowsOutSimpleIcon size={22} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    </>
}