import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getImageUrl } from '@/lib/tmdb';
import { Link } from 'expo-router'; 

type TrendingMovieCardProps = {
  movie: any;
  rank: number;
};

export function TrendingMovieCard({ movie, rank }: TrendingMovieCardProps) {
  return (
   
    <Link href={`/movie/${movie.id}`} asChild>
      <TouchableOpacity>
        <View style={styles.cardContainer}>
          <View>
            <Image
              source={{ uri: getImageUrl(movie.poster_path) }}
              style={styles.poster}
            />
            <Text style={styles.rankNumber}>{rank}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
            <Text style={styles.movieYear}>{movie.release_date?.split('-')[0] || ''}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 150,
    marginRight: 15,
  },
  poster: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  rankNumber: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    fontSize: 96,
    fontWeight: 'bold',
    color: '#FFBB38',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  infoContainer: {
    marginTop: 10,
  },
  movieTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  movieYear: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 2,
  },
});