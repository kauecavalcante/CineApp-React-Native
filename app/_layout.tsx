import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Asset } from 'expo-asset';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';


const imagesToPreload = [
  require('@/assets/images/genres/acao.png'),
  require('@/assets/images/genres/animacao.png'),
  require('@/assets/images/genres/aventura.png'),
  require('@/assets/images/genres/comedia.png'),
  require('@/assets/images/genres/documentario.png'),
  require('@/assets/images/genres/drama.png'),
  require('@/assets/images/genres/familia.png'),
  require('@/assets/images/genres/ficcao.png'),
  require('@/assets/images/genres/romance.png'),
  require('@/assets/images/genres/terror.png'),
];

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

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
  });

 
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  
  useEffect(() => {
    if (fontError) throw fontError;

    async function loadResourcesAsync() {
      try {
        await Asset.loadAsync(imagesToPreload);
      } catch (e) {
        console.warn(e);
      } finally {
        setAssetsLoaded(true);
      }
    }

    if (fontsLoaded) {
      loadResourcesAsync();
    }
  }, [fontsLoaded, fontError]);

  
  useEffect(() => {
    
    const isAppReady = fontsLoaded && assetsLoaded && !loading;
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

  }, [session, loading, fontsLoaded, assetsLoaded, segments, router]);

  
  if (!fontsLoaded || !assetsLoaded || loading) {
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