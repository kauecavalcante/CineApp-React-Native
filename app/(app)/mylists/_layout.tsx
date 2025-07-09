import { Stack } from 'expo-router';

export default function MyListsStackLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        animation: 'simple_push',
        contentStyle: { backgroundColor: '#453a29' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[listType]" />
    </Stack>
  );
}