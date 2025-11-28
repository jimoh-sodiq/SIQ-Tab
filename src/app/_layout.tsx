import { Stack } from "expo-router";
import "../assets/css/main.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='note' options={{ orientation: 'landscape' }} />
    </Stack>
  );
}
