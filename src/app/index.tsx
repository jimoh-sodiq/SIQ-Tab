import { useWSStore } from '@/store/useWSStore';
import { useRouter } from "expo-router";
import { ArrowDownIcon } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const ipCode = useWSStore(s => s.encodedIp)
  const decodedIp = useWSStore(s => s.decodedIp)
  const decodeIpArray = useWSStore(s => s.decodeIpArray)
  const setEncodedIp = useWSStore(s => s.setEncodedIp);
  const connect = useWSStore(s => s.connect);
  const connectIps = useWSStore(s => s.connectIps);
  const disconnect = useWSStore(s => s.disconnect);
  const isConnected = useWSStore(s => s.connected);
  const [connectionText, setConnectionText] = useState("Connect")
  const connectionTimeOut = useRef<number | null>(null)

  const handleConnect = async () => {
    if (isConnected) {
      router.push("/note");
      return;
    }
    if (!ipCode || ipCode.trim().length === 0) {
      Alert.alert("Error", "Please enter a connection code");
      return;
    }

    setConnectionText("Connecting...");

    try {
      // await connect();
      await connectIps()

      // await new Promise(res => setTimeout(res, 2000));

      setConnectionText("Connect");
      router.push("/note");
    } catch (err) {
      Alert.alert("Error", "Failed to create connection, try a different code");
      setConnectionText("Connect");
    }
  };



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
          <View className="gap-3 items-center justify-center w-full mb-5 max-w-[500px] mx-auto">
            <View className='w-full gap-5 px-1'>
              <TextInput readOnly={isConnected} className='border h-[60px] px-5  border-[1px] text-xl text-center tracking-widest rounded-lg border-gray-300 text-[#1e1e1e]' value={ipCode || ""} onChangeText={(text) => setEncodedIp(text)} />
              <TouchableOpacity onPress={handleConnect} className='w-full shrink-0 bg-primary rounded-lg p-4'>
                <Text className='text-center tracking-wider text-secondary rounded'>{isConnected ? 'Continue' : connectionText}</Text>
              </TouchableOpacity>
              {/* <Text>{ipCode}</Text> */}
              {/* <Text>{decodedIp}</Text> */}
              {/* <Text>{decodeIpArray(ipCode || "").length}</Text> */}
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
