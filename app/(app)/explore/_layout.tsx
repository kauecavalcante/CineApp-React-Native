import { Stack } from 'expo-router';

export default function ExploreStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="genre/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}