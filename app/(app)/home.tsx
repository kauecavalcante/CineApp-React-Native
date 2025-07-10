import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/AuthProvider';
import { AdBanner } from '@/components/AdBanner';
import { TrendingMovieCard } from '@/components/TrendingMovieCard';
import { MovieTabs } from '@/components/MovieTabs';
import { MovieListItem } from '@/components/MovieListItem';
import { 
  getTrendingWeeklyMovies,
  getPopularMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies, 
  getTopRatedMovies 
} from '@/lib/tmdb';
import { ThemedText } from '@/components/ThemedText';

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
};

const TABS = ['Populares', 'Em Cartaz', 'Próximos Lançamentos', 'Mais Votados'];

export default function MovieHomeScreen() {
  const { isPremium } = useAuth();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [listedMovies, setListedMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [loading, setLoading] = useState({ trending: true, list: true });

 
  useEffect(() => {
    async function loadTrending() {
      try {
        const movies = await getTrendingWeeklyMovies();
        setTrendingMovies(movies);
      } catch (error) {
        console.error("Erro ao buscar filmes em destaque:", error);
      } finally {
        setLoading(prev => ({ ...prev, trending: false }));
      }
    }
    loadTrending();
  }, []);

 
  const loadMoviesByTab = useCallback(async (tab: string) => {
    setLoading(prev => ({ ...prev, list: true }));
    let movieGetter;
    switch (tab) {
      case 'Em Cartaz': movieGetter = getNowPlayingMovies; break;
      case 'Próximos Lançamentos': movieGetter = getUpcomingMovies; break;
      case 'Mais Votados': movieGetter = getTopRatedMovies; break;
      case 'Populares': default: movieGetter = getPopularMovies; break;
    }
    try {
      const movies = await movieGetter();
      setListedMovies(movies);
    } catch (error) {
      console.error(`Erro ao buscar filmes para a aba ${tab}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  }, []);

  
  useEffect(() => {
    loadMoviesByTab(activeTab);
  }, [activeTab, loadMoviesByTab]);

  return (
   
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <LinearGradient
        colors={['#453a29', '#2C2C2C']}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <FlatList
        data={listedMovies}
        renderItem={({ item }) => <MovieListItem movie={item} activeCertifications={[]} />}
        keyExtractor={(item) => `list-${item.id}`}
        ListHeaderComponent={
          <>
            <View style={styles.section}>
              <ThemedText type="title" style={styles.sectionTitle}>Em Destaque</ThemedText>
              {loading.trending ? (
                <ActivityIndicator size="large" color="#fff" style={{ height: 260 }}/>
              ) : (
                <FlatList
                  data={trendingMovies.slice(0, 5)}
                  renderItem={({ item, index }) => <TrendingMovieCard movie={item} rank={index + 1} />}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.trendingList}
                />
              )}
            </View>
            <MovieTabs tabs={TABS} activeTab={activeTab} onTabPress={setActiveTab} />
          </>
        }
        ListFooterComponent={loading.list ? <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 20 }} /> : null}
        contentContainerStyle={styles.mainListContainer}
      />
      
      {!isPremium && <AdBanner />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { 
      flex: 1 
    },
    mainListContainer: {
        paddingBottom: 20,
    },
    section: { 
     
      marginTop: 20,
    },
    sectionTitle: {
        color: 'white',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    trendingList: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
});