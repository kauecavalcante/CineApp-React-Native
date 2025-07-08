import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getImageUrl } from '@/lib/tmdb';
import UserIcon from '@/assets/images/user.svg';

type CastCardProps = {
  actor: any;
};

export function CastCard({ actor }: CastCardProps) {
  const imageUrl = actor.profile_path
    ? getImageUrl(actor.profile_path)
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
          />
        ) : (
          <UserIcon width="100%" height="100%" />
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>{actor.name}</Text>
     
      <Text style={styles.character} numberOfLines={2}>{actor.character}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    marginRight: 15,
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#333',
    marginBottom: 8,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  
  character: {
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});