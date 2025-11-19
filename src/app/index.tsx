import { Text, View, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/assets/colors";
import {
  ListIcon,
  DotsThreeVerticalIcon,
  MagnifyingGlassIcon,
  SortAscendingIcon,
  ArrowDownIcon,
  PenIcon,
  NotePencilIcon,
} from "phosphor-react-native";
import { useRouter } from "expo-router";

const DATA = [
  { id: "1", title: "First Item" },
  { id: "2", title: "Second Item" },
  { id: "3", title: "Third Item" },
  { id: "4", title: "Fourth Item" },
  { id: "5", title: "Fifth Item" },
  { id: "6", title: "Sixth Item" },
];

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black py-5 px-4 relative">
      <View className="gap-1 p-5 items-center justify-center">
        <Text className="text-xl tracking-widest font-medium text-center text-primary ">
          SimpliedIQ Notes
        </Text>
        <Text className="text-sm font-medium text-center text-secondary tracking-wider">
          6 notes
        </Text>
      </View>
      <View className="flex-1 grow-1 gap-3">
        <View className="flex-row items-center justify-between gap-4">
          <ListIcon color={colors.secondary} size={20} />
          <View className="flex-row items-center gap-4">
            <MagnifyingGlassIcon color={colors.secondary} size={20} />
            <DotsThreeVerticalIcon color={colors.secondary} size={20} />
          </View>
        </View>
        <View className="flex-row items-center justify-end gap-4">
          <View className="flex-row items-center gap-1">
            <SortAscendingIcon color="#6b7280" size={20} />
            <Text className="text-gray-500 text-xs">Date modified</Text>
          </View>
          <View className="h-4 w-[1px] bg-gray-400" />
          <ArrowDownIcon size={18} color="#6b7280" />
        </View>
        <View className="flex-row flex-wrap gap-4">
          {DATA.map((item) => (
            <View key={item.id} className=" grow rounded-lg bg-zinc-800 p-4 w-1/4 h-[200px]">
              <Text className="text-white text-sm"> {item.title}</Text>
            </View>
          ))}
          {/* <FlatList
            ItemSeparatorComponent={() => <View className=" w-4 h-4" />}
            numColumns={2}
            showsVerticalScrollIndicator
            data={DATA}
            renderItem={({ item }) => (
              <View className=" grow rounded-lg bg-zinc-800 p-4 w-1/2 h-[200px]">
                <Text className="text-white text-sm"> {item.title}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
          /> */}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/note")}
        className="absolute z-50 bottom-10 right-10 rounded-full p-4 bg-zinc-300"
      >
        <NotePencilIcon size={24} color={colors.primary} weight="fill" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
