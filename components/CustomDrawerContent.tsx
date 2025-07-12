import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import PopcornIcon from '@/assets/images/pipoca.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HIDDEN_ROUTES = ['search', 'movie/[id]'];

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { session } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Hook para obter as margens seguras

  const [displayName, setDisplayName] = useState(
    session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Visitante'
  );

  useEffect(() => {
    if (!session?.user?.id) return;

    const userId = session.user.id;

    const fetchProfileName = async () => {
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      
      if (profileData?.full_name) {
        setDisplayName(profileData.full_name.split(' ')[0] || 'Visitante');
      }
    };
    
    fetchProfileName();

    const channel = supabase.channel(`profile-updates-${userId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${userId}` 
        },
        fetchProfileName
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);
  
  const newRoutes = props.state.routes.filter(route => !HIDDEN_ROUTES.includes(route.name));
  const originalActiveRoute = props.state.routes[props.state.index];
  const activeRouteKey = originalActiveRoute ? originalActiveRoute.key : null;
  const newIndex = activeRouteKey ? newRoutes.findIndex(route => route.key === activeRouteKey) : -1;
  
  const filteredState = {
    ...props.state,
    routes: newRoutes,
    index: newIndex === -1 ? 0 : newIndex,
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)');
  };

  return (
    <LinearGradient
      colors={['#453a29', '#2C2C2C']}
      style={{ flex: 1 }}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <DrawerContentScrollView {...props}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Olá, {displayName}</Text>
            <PopcornIcon width={28} height={28} />
          </View>
          <DrawerItemList {...props} state={filteredState} />
        </DrawerContentScrollView>

        {/* MARGEM INFERIOR AUMENTADA AQUI */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
              <Feather name="log-out" size={22} color="#a0a0a0" />
              <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    color: 'white', 
    fontSize: 22,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    backgroundColor: 'transparent' 
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#a0a0a0',
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '500',
  },
});