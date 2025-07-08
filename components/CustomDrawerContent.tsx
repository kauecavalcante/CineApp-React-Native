import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { supabase } from '@/lib/supabase';
import PopcornIcon from '@/assets/images/pipoca.svg';
import { LinearGradient } from 'expo-linear-gradient'; 

export function CustomDrawerContent(props: any) {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Visitante';

  return (
   
    <LinearGradient
      colors={['#453a29', '#2C2C2C']}
      style={{ flex: 1 }}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: 'transparent' }}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Olá, {firstName}</Text>
            <PopcornIcon width={28} height={28} />
          </View>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => supabase.auth.signOut()} style={styles.logoutButton}>
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
    padding: 20,
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