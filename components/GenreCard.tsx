import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GenreCardProps = {
  genreName: string;
  ImageComponent: React.FC<any>; 
  onPress: () => void;
};

export function GenreCard({ genreName, ImageComponent, onPress }: GenreCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
    
      <View style={styles.imageContainer}>
       
        <ImageComponent 
          width="100%" 
          height="100%" 
          style={StyleSheet.absoluteFill} 
          preserveAspectRatio="xMidYMid slice" 
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        />
       
        <Text style={styles.text}>{genreName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    
    shadowColor: '#000',
    shadowOffset: {
      width: -4,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  imageContainer: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end', 
    // Sombra para Android
    elevation: 8,
    backgroundColor: '#2C2C2C',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  text: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    padding: 20,
    zIndex: 1, 
  },
});