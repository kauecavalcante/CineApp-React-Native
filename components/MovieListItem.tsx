import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getImageUrl, getMovieDetails } from '@/lib/tmdb';
import StarIcon from '@/assets/images/Star.svg';
import { Link } from 'expo-router';

type MovieListItemProps = {
  movie: any;
  activeCertifications: string[];
};

const formatDuration = (minutes: number) => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export function MovieListItem({ movie, activeCertifications }: MovieListItemProps) {
  const [details, setDetails] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      try {
        const movieDetails = await getMovieDetails(movie.id);
        
        const brRelease = movieDetails.release_dates?.results.find(
          (r: any) => r.iso_3166_1 === 'BR'
        );
        
        const certificationValue = brRelease?.release_dates[0]?.certification;
        const certification = certificationValue && certificationValue.trim() !== '' ? certificationValue : 'N/A';

        if (activeCertifications.length > 0 && !activeCertifications.includes(certification)) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }

        setDetails({
          runtime: movieDetails.runtime,
          certification: certification,
        });

      } catch (error) {
        console.error(`Erro ao buscar detalhes para o filme ${movie.id}:`, error);
        setIsVisible(false);
      }
    }
    loadDetails();
  }, [movie.id, activeCertifications]);

  if (!isVisible) {
    return null;
  }

  return (
    <Link
      href={{
        
        pathname: "/movie/[id]",
        params: { id: movie.id }
      }}
      asChild
    >
      <TouchableOpacity style={styles.container}>
        <Image source={{ uri: getImageUrl(movie.poster_path) }} style={styles.poster} />

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
          
          <Text style={styles.detailsText}>
            {details ? `${details.certification} | ${formatDate(movie.release_date)}` : formatDate(movie.release_date)}
          </Text>

          <View style={styles.durationContainer}>
            <Feather name="clock" size={14} color="#a0a0a0" />
            {details ? (
              <Text style={styles.detailsText}> {formatDuration(details.runtime)}</Text>
            ) : (
              <ActivityIndicator size="small" color="#a0a0a0" />
            )}
          </View>
        </View>

        <View style={styles.ratingContainer}>
          <StarIcon width={20} height={20} />
          <Text style={styles.ratingText}>{movie.vote_average?.toFixed(1) || 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    borderRadius: 16,
    marginBottom: 15,
    padding: 12,
  },
  poster: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
    paddingRight: 65,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  detailsText: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingContainer: {
    position: 'absolute',
    top: 0,
    right: 20,
    backgroundColor: '#FFBB38',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  ratingText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
});