import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getMoviesByGenre } from '@/lib/tmdb';
import { MovieListItem } from '@/components/MovieListItem';

import LAIcon from '@/assets/images/L.svg';
import DezAIcon from '@/assets/images/10a.svg';
import DozeAIcon from '@/assets/images/12a.svg';
import QuatorzeAIcon from '@/assets/images/14a.svg';
import DezesseisAIcon from '@/assets/images/16a.svg';
import DezoitoAIcon from '@/assets/images/18a.svg';

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  [key: string]: any; 
}

const CERTIFICATIONS = [
  { name: 'L', Icon: LAIcon }, { name: '10', Icon: DezAIcon },
  { name: '12', Icon: DozeAIcon }, { name: '14', Icon: QuatorzeAIcon },
  { name: '16', Icon: DezesseisAIcon }, { name: '18', Icon: DezoitoAIcon },
];

const GenreMoviesScreen = () => {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [activeCertifications, setActiveCertifications] = useState<string[]>([]);
  const [tempCertifications, setTempCertifications] = useState<string[]>([]);

  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast({ visible: false, message: '' }));
    }, 2000);
  };

  const genreName = Array.isArray(name) ? name[0] : name;

  const fetchMovies = useCallback(async (currentPage: number, certifications: string[]) => {
    if (!id) return;
    if (currentPage > 1) setLoadingMore(true);
    else setLoading(true);
    try {
      const genreId = Array.isArray(id) ? id[0] : id;
      const data = await getMoviesByGenre(parseInt(genreId, 10), currentPage, certifications);
      
      setMovies(prev => {
        const newMovies = (data.results as Movie[]) || [];
        const allMovies = currentPage === 1 ? newMovies : [...prev, ...newMovies];
        const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.id, movie])).values());
        return uniqueMovies;
      });

      setHasNextPage(data.page < data.total_pages);
    } catch (error) {
      console.error("Erro ao buscar filmes por gênero:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      setMovies([]);
      setPage(1);
      fetchMovies(1, activeCertifications);
    }
  }, [id, activeCertifications, fetchMovies]);

  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage, activeCertifications);
    }
  };
  
  const openFilterModal = () => {
    setTempCertifications(activeCertifications);
    setFilterModalVisible(true);
  };

  const handleToggleTempCertification = (certName: string) => {
    setTempCertifications(prev => {
      const isSelected = prev.includes(certName);
      if (isSelected) {
        return prev.filter(c => c !== certName);
      }
      return [...prev, certName];
    });
  };

  const handleApplyFilters = () => {
    setActiveCertifications(tempCertifications);
    setFilterModalVisible(false);
    if (tempCertifications.length > 0) {
      showToast('Filtros aplicados!');
    } else {
      showToast('Filtros removidos!');
    }
  };

  const handleClearFilters = () => {
    setTempCertifications([]);
    showToast('Seleção limpa!');
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#FFBB38" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={28} color="white" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{genreName}</Text>
          <TouchableOpacity onPress={openFilterModal} style={styles.filterButton}>
            <Feather name="filter" size={24} color="white" />
            {activeCertifications.length > 0 && (
              <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{activeCertifications.length}</Text></View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={movies}
        renderItem={({ item }) => (
          <MovieListItem movie={item} activeCertifications={activeCertifications} />
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} color="#FFBB38" /> : null}
        ListEmptyComponent={() => !loading && <View style={styles.emptyContainer}><Text style={styles.emptyText}>Nenhum filme encontrado.</Text></View>}
      />

      <Modal animationType="fade" transparent={true} visible={isFilterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterModalVisible(false)} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filtrar por Classificação</Text>
          <View style={styles.certificationsContainer}>
            {CERTIFICATIONS.map(({ name, Icon }) => (
              <TouchableOpacity key={name} style={[styles.certButton, tempCertifications.includes(name) && styles.certButtonSelected]} onPress={() => handleToggleTempCertification(name)}>
                <Icon width={40} height={40} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}><Text style={styles.clearButtonText}>Limpar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}><Text style={styles.applyButtonText}>Aplicar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {toast.visible && (
        <Animated.View style={[styles.toastContainer, { opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] }]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#453a29' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2C2C2C' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#3a3a3a' },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  filterButton: { padding: 5, position: 'relative' },
  filterBadge: { position: 'absolute', right: 0, top: 0, backgroundColor: '#FFBB38', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { color: 'black', fontWeight: 'bold', fontSize: 12 },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  emptyContainer: { flex: 1, marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#a0a0a0', fontSize: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  modalContent: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#333333', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  certificationsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
  certButton: { padding: 10, borderRadius: 12, borderWidth: 2, borderColor: '#555' },
  certButtonSelected: { borderColor: '#FFBB38', backgroundColor: 'rgba(255, 187, 56, 0.1)' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, gap: 15 },
  clearButton: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#444' },
  clearButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  applyButton: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#FFBB38' },
  applyButtonText: { color: 'black', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  toastContainer: { position: 'absolute', bottom: 60, alignSelf: 'center', backgroundColor: '#222', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, elevation: 5 },
  toastText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default GenreMoviesScreen;