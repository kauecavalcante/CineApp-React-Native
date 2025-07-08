import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { searchMovies } from '@/lib/tmdb';
import { MovieListItem } from '@/components/MovieListItem';

const SearchScreen = () => {
  const params = useLocalSearchParams<{ query: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  
  const [searchQuery, setSearchQuery] = useState(params.query || '');
 
  const [submittedQuery, setSubmittedQuery] = useState(params.query || '');

  const [movies, setMovies] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchMovies = useCallback(async (query: string, currentPage: number) => {
    
    if (!query) {
      setMovies([]);
      setLoading(false);
      return;
    };
    
    if (currentPage > 1) setLoadingMore(true);
    else setLoading(true);

    try {
      const data = await searchMovies(query, currentPage);
      setMovies(prev => currentPage === 1 ? data.results : [...prev, ...data.results]);
      setHasNextPage(data.page < data.total_pages);
    } catch (error) {
      console.error("Erro ao buscar filmes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);
  
 
  useEffect(() => {
    setMovies([]);
    setPage(1);
    fetchMovies(submittedQuery, 1);
  }, [submittedQuery, fetchMovies]);

 
  const handleSearchSubmit = () => {
    setSubmittedQuery(searchQuery);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(submittedQuery, nextPage);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.searchBarContainer}>
          <Feather name="search" size={20} color="#a0a0a0" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Pesquisar..."
            placeholderTextColor="#a0a0a0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus={true} 
          />
        </View>
      </View>

      
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#FFBB38" style={{ marginTop: 50 }}/>
      ) : (
        <FlatList
          data={movies}
          renderItem={({ item }) => <MovieListItem movie={item} activeCertifications={[]} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} color="#FFBB38" /> : null}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {submittedQuery ? `Nenhum filme encontrado para "${submittedQuery}".` : 'Comece a digitar para buscar um filme.'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#453a29' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#3a3a3a' },
  backButton: { paddingRight: 10 },
  searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', borderRadius: 12, paddingHorizontal: 15, height: 44 },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: 'white' },
  listContent: { padding: 20 },
  emptyContainer: { flex: 1, marginTop: 100, alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { color: '#a0a0a0', fontSize: 16, textAlign: 'center' },
});

export default SearchScreen;