import { View, TouchableOpacity, Text } from "react-native"
import { ArrowsOutSimpleIcon, CaretLeftIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { useToolStore } from '@/store/useToolStore'

export default function NoteHeader() {
    const router = useRouter()
    const clearCanvas = useToolStore((s) => s.clearPage);

    return <>
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
    </>
}