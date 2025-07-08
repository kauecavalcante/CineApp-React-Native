import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';


SplashScreen.preventAutoHideAsync();

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
    const isReady = !loading && fontsLoaded;

    if (!isReady) {
      return; 
    }

    
    const hasSeenOnboarding = session?.user?.user_metadata?.has_seen_onboarding;

    
    const inAppGroup = segments[0] === '(app)';

    if (session) {
     
      if (!hasSeenOnboarding) {
        
        router.replace('/(welcome)');
      } else if (!inAppGroup) {
        
        router.replace('/(app)/home');
      }
    } else if (!session && inAppGroup) {
      
      router.replace('/(auth)');
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
      <StatusBar style="light" />
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}