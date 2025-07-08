import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { getMovieDetails, getImageUrl } from '@/lib/tmdb';

export default function ListDetailScreen() {
  const { listType, title } = useLocalSearchParams<{ listType: string, title: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListMovies = useCallback(async () => {
    if (!listType) return;
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilizador não encontrado");

      
      const columnMap = {
        favorites: 'is_favorite',
        watchlist: 'is_watchlist',
        watched: 'is_watched',
      };
      const columnName = columnMap[listType as keyof typeof columnMap];

      if (!columnName) {
        throw new Error(`Tipo de lista inválido: ${listType}`);
      }

      const { data: listData, error } = await supabase
        .from('user_movie_lists')
        .select('movie_id')
        .eq('user_id', user.id)
        .eq(columnName, true);

      if (error) throw error;
      
      const movieIds = listData.map(item => item.movie_id);
      if (movieIds.length === 0) {
        setMovies([]);
        setLoading(false); 
        return;
      }

      const moviePromises = movieIds.map(id => getMovieDetails(id));
      const allMovieDetails = await Promise.all(moviePromises);
      
      setMovies(allMovieDetails.filter(movie => movie !== null)); 

    } catch (e) {
      console.error("Erro ao buscar a lista de filmes:", e);
      setMovies([]); 
    } finally {
      setLoading(false);
    }
  }, [listType]);

  useFocusEffect(
    useCallback(() => {
      fetchListMovies();
    }, [fetchListMovies])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFBB38" style={{ flex: 1 }}/>
      ) : (
        <FlatList
          data={movies}
          renderItem={({ item }) => (
            <Link href={`/movie/${item.id}`} asChild>
              <TouchableOpacity style={styles.gridItem}>
                <Image source={{ uri: getImageUrl(item.poster_path) }} style={styles.poster} />
              </TouchableOpacity>
            </Link>
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Esta lista está vazia.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#453a29' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#3a3a3a' 
  },
  backButton: { 
    padding: 5 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 22, 
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  listContent: { 
    padding: 10 
  },
  gridItem: { 
    flex: 1/2, 
    aspectRatio: 2/3, 
    margin: 5 
  },
  poster: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 12 
  },
  emptyContainer: { 
    flex: 1, 
    marginTop: 100, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { 
    color: '#a0a0a0', 
    fontSize: 16 
  },
});