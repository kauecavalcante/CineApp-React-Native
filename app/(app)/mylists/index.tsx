import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';


const ListCard = ({ title, iconName, href }: { title: string, iconName: any, href: any }) => (
  <Link href={href} asChild>
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardContent}>
        <Feather name={iconName} size={28} color="#FFBB38" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Feather name="chevron-right" size={24} color="#a0a0a0" />
    </TouchableOpacity>
  </Link>
);


export default function MyListsIndexScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#453a29', '#2C2C2C']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.pageTitle}>Minhas Listas</Text>
        
        <ListCard 
          title="Meus Favoritos" 
          iconName="heart" 
          href={{ 
            pathname: '/mylists/[listType]', 
            params: { listType: 'favorites', title: 'Meus Favoritos' } 
          }}
        />
        <ListCard 
          title="Quero Assistir" 
          iconName="bookmark" 
          href={{ 
            pathname: '/mylists/[listType]', 
            params: { listType: 'watchlist', title: 'Quero Assistir' } 
          }}
        />
        <ListCard 
          title="Já Assisti" 
          iconName="check-circle" 
          href={{ 
            pathname: '/mylists/[listType]', 
            params: { listType: 'watched', title: 'Já Assisti' } 
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, paddingTop: 40 },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});