import { Drawer } from 'expo-router/drawer';
import { useSegments } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CustomDrawerContent } from '@/components/CustomDrawerContent';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { TouchableOpacity, View } from 'react-native';
import { AnimatedSearchBar } from '@/components/AnimatedSearchBar';

export default function DrawerLayout() {
  const segments: string[] = useSegments();

  const isDeepScreen = 
    (segments.includes('explore') && segments.length > 2) || 
    (segments.includes('mylists') && segments.length > 2);

  return (
    <Drawer
      drawerContent={(props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: !isDeepScreen,
        headerStyle: {
          backgroundColor: '#453a29',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          height: 116, 
        },
        headerTitle: '',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.toggleDrawer()} 
            style={{ marginLeft: 20 }}
          >
            <Feather name="menu" size={28} color="white" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{ marginRight: 20 }}>
            <AnimatedSearchBar />
          </View>
        ),
        drawerActiveTintColor: '#FFBB38',
        drawerInactiveTintColor: '#a0a0a0',
        drawerType: 'front', 
        drawerStyle: {
          backgroundColor: '#2C2C2C', 
          width: 280, 
        },
      })}
    >
      <Drawer.Screen
        name="home"
        options={{
          drawerLabel: 'Início',
          drawerIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="cine-ia"
        options={{
          drawerLabel: 'Cine IA',
          drawerIcon: ({ color, size }) => <Feather name="message-circle" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="explore"
        options={{
          drawerLabel: 'Explorar',
          drawerIcon: ({ color, size }) => <Feather name="search" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="mylists"
        options={{
          drawerLabel: 'Minhas Listas',
          drawerIcon: ({ color, size }) => <Feather name="list" color={color} size={size} />,
        }}
      />

      
      <Drawer.Screen
        name="premium"
        options={{
          drawerLabel: 'Premium',
          drawerIcon: ({ color, size }) => <Feather name="star" color={color} size={size} />,
        }}
      />
      
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Configurações',
          drawerIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} />,
        }}
      />
      
    </Drawer>
  );
}