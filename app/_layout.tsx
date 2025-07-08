import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) {
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

  }, [session, loading, segments, router]);

  if (loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" /> 
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(welcome)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}