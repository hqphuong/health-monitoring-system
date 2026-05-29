import { Stack } from "expo-router";
import { Colors } from "../../constants/Colors";

export default function ExerciseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.neutral.background },
      }}
    >
      <Stack.Screen
        name="session"
        options={{
          animation: "slide_from_bottom",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          animation: "fade",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
