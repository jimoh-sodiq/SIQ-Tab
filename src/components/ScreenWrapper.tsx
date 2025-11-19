import { Children, PropsWithChildren } from "react";
import { View } from "react-native-reanimated/lib/typescript/Animated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenWrapper(props: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 m-0 p-0 ">
      {props.children}
    </SafeAreaView>
  );
}
