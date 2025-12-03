import { Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, StatusBar, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ScrollView } from 'react-native';
import { ArrowDownIcon, PlugsConnectedIcon } from 'phosphor-react-native';
import { useWSStore } from '@/store/useWSStore';

export default function Index() {
  const router = useRouter();
  const ipCode = useWSStore(s => s.encodedIp)
  const setEncodedIp = useWSStore(s => s.setEncodedIp);
  const connect = useWSStore(s => s.connect);
  const disconnect = useWSStore(s => s.disconnect);
  const isConnected = useWSStore(s => s.connected);

  const handleConnect = () => {
    if (!ipCode || ipCode.length == 0) {
      Alert.alert("Error", "Please enter a connection code");
      return;
    }
    connect()
    if (!isConnected) {
      Alert.alert("Error", "failed to create connection, try a different code")
      return;
    }
    router.push("/note")
  }

  return (
    <SafeAreaView className="flex-1 bg-white py-5 px-4 relative">
      <StatusBar barStyle='dark-content' />
      <ScrollView className='flex-1'>
        <KeyboardAvoidingView behavior='position' className='flex-1 jusify-between'>
          <View className="p-5 items-center justify-center">
            <Image className='h-20 w-[210px] object' resizeMode='contain' source={require("@/assets/images/SIQlogo.png")} />
            <Text className='italic text-xl tracking-widest font-medium text-center text-primary'>Writing tab</Text>
          </View>
          <View className='gap-2 mb-8'>
            <Text className='text-gray-200 tracking-widest font-medium text-lg text-center text-stone-800 underline'>Instructions</Text>
            <Text className='text-[#1e1e1e] text-sm tracking-wide text-center'>* Connect your  tablet to the PC via usb thethering / same wireless network</Text>
            <Text className='text-[#1e1e1e] text-sm tracking-wide text-center'>* A connection code would be presented to you on the exam portal</Text>
            <Text className='text-[#1e1e1e] text-sm tracking-wide text-center'>* Enter the connection code below and click on the connect button</Text>
            {/* <Text className='text-[#1e1e1e] text-sm tracking-wide'>* A green <PlugsConnectedIcon color='green' size={22} /> signifies a successful connection on the note page</Text> */}
          </View>
          <View className="gap-3 items-center justify-center w-full mb-5">
            <View className='w-full gap-5 px-1'>
              <TextInput className='border h-[60px] px-5  border-[1px] text-xl text-center tracking-widest rounded-lg border-gray-300 text-[#1e1e1e]' value={ipCode || ""} onChangeText={(text) => setEncodedIp(text)} />
              <TouchableOpacity onPress={handleConnect} className='w-full shrink-0 bg-primary rounded-lg p-4'>
                <Text className='text-center tracking-wider text-secondary rounded'>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className='w-full gap-5 '>
            <Text className='text-sm font-medium tracking-wider text-stone-500 text-center'>
              Or proceed without connecting
            </Text>
            <View className='w-full items-center justify-center'>
              <ArrowDownIcon size={24} color="grey" weight="light" />
            </View>
            <View className='w-fit flex items-center jusify-center'>
              <TouchableOpacity
                onPress={() => router.push("/note")}
                className=" rounded-full w-fit p-4 bg-zinc-300"
              >
                <Text>I just want to write</Text>
                {/* <NotePencilIcon size={24} color={colors.primary} weight="fill" /> */}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
