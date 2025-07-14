import React from 'react';
import { Text, StyleSheet, ImageBackground, Pressable } from 'react-native';


type GenreCardProps = {
  genreName: string;
  imageSource: any; 
  onPress: () => void;
};


export const GenreCard = React.memo(({ genreName, imageSource, onPress }: GenreCardProps) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <ImageBackground
        source={imageSource}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <Text style={styles.genreText}>{genreName}</Text>
      </ImageBackground>
    </Pressable>
  );
});


GenreCard.displayName = 'GenreCard';

const styles = StyleSheet.create({
  container: {
    height: 120,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden', 
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    borderRadius: 15,
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});