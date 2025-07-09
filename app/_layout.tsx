import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider, DarkTheme } from '@react-navigation/native';

SplashScreen.preventAutoHideAsync();

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#453a29', 
    card: '#453a29',       
  },
};

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded, error] = useFonts({
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const isAppReady = fontsLoaded && !loading;
    if (!isAppReady) {
      return; 
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inWelcomeGroup = segments[0] === '(welcome)';

    if (session) {
     
      const hasSeenOnboarding = session.user?.user_metadata?.has_seen_onboarding;

      if (!hasSeenOnboarding) {
      
        router.replace('/(welcome)');
      } else if (inAuthGroup || inWelcomeGroup) {
       
        router.replace('/(app)/home');
      }
    } else {
     
      if (!inAuthGroup && !inWelcomeGroup) {
       
        router.replace('/(auth)');
      }
    }

    SplashScreen.hideAsync();

  }, [session, loading, fontsLoaded, segments, router]);

  if (!fontsLoaded || loading) {
    return null;
  }

  return (
      <Stack screenOptions={{ headerShown: false }} />
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={CustomDarkTheme}>
          <StatusBar style="light" />
          <RootLayoutNav />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}