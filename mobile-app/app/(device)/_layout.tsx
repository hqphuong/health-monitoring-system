import { Stack } from "expo-router";
import { Colors } from "../../constants/Colors";

export default function DeviceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.neutral.background },
      }}
    >
      <Stack.Screen
        name="add"
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="detail"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
