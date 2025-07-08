import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Image, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getBackdropUrl, getImageUrl, getMovieDetails } from '@/lib/tmdb';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { supabase } from '@/lib/supabase';
import { CastCard } from '@/components/CastCard';


import LAIcon from '@/assets/images/L.svg';
import DezAIcon from '@/assets/images/10a.svg';
import DozeAIcon from '@/assets/images/12a.svg';
import QuatorzeAIcon from '@/assets/images/14a.svg';
import DezesseisAIcon from '@/assets/images/16a.svg';
import DezoitoAIcon from '@/assets/images/18a.svg';
import StarIcon from '@/assets/images/StarYellow.svg';

const TABS = ['Sobre o Filme', 'Onde Assistir', 'Elenco & Equipe'];

const MovieDetailTabs = ({ tabs, activeTab, onTabPress }: { tabs: string[], activeTab: string, onTabPress: (tab: string) => void }) => (
  <View style={styles.tabsContainer}>
    {tabs.map((tab) => (
      <TouchableOpacity key={tab} onPress={() => onTabPress(tab)}>
        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
          {tab}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const ageRatingIcons: { [key: string]: React.FC<any> } = {
  'L': LAIcon, '10': DezAIcon, '12': DozeAIcon,
  '14': QuatorzeAIcon, '16': DezesseisAIcon, '18': DezoitoAIcon,
};

const MovieDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [ageRating, setAgeRating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [isTrailerVisible, setTrailerVisible] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  const [listStatus, setListStatus] = useState({ is_favorite: false, is_watchlist: false, is_watched: false });
  const [user, setUser] = useState<any>(null);

  const movieId = parseInt(id as string, 10);

  const fetchListStatus = useCallback(async (currentUser: any) => {
    if (!currentUser || !movieId) return;
    try {
      const { data, error } = await supabase
        .from('user_movie_lists')
        .select('is_favorite, is_watchlist, is_watched')
        .eq('user_id', currentUser.id)
        .eq('movie_id', movieId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setListStatus(data);
      } else {
        setListStatus({ is_favorite: false, is_watchlist: false, is_watched: false });
      }
    } catch (e) {
      console.error("Erro ao buscar estado da lista:", e);
    }
  }, [movieId]);

  useFocusEffect(
    useCallback(() => {
      const checkUserAndFetch = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        if (currentUser) {
          fetchListStatus(currentUser);
        }
      };
      checkUserAndFetch();
    }, [fetchListStatus])
  );

  useEffect(() => {
    const resetState = () => {
      setMovieDetails(null);
      setAgeRating(null);
      setTrailerKey(null);
      setTrailerVisible(false);
      setActiveTab(TABS[0]);
    };
    async function loadDetails() {
      if (id) {
        try {
          const details = await getMovieDetails(parseInt(id as string, 10));
          setMovieDetails(details);
          const brRelease = details.release_dates?.results.find((r: any) => r.iso_3166_1 === 'BR');
          const certification = brRelease?.release_dates[0]?.certification || null;
          setAgeRating(certification);
        } catch (error) {
          console.error("Erro ao buscar detalhes do filme:", error);
          Alert.alert("Erro", "Não foi possível carregar os detalhes do filme.");
          router.back();
        }
      }
    }
    resetState();
    loadDetails();
  }, [id, router]);

  const toggleListStatus = async (listType: 'is_favorite' | 'is_watchlist' | 'is_watched') => {
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para adicionar filmes às suas listas.");
      return;
    }
    const currentStatus = listStatus[listType];
    const newStatus = { ...listStatus, [listType]: !currentStatus };
    if (listType === 'is_watched' && !currentStatus) {
      newStatus.is_watchlist = false;
    }
    if (listType === 'is_watchlist' && !currentStatus) {
      newStatus.is_watched = false;
    }
    setListStatus(newStatus);
    try {
      const { error } = await supabase
        .from('user_movie_lists')
        .upsert({ user_id: user.id, movie_id: movieId, ...newStatus }, { onConflict: 'user_id, movie_id' });
      if (error) throw error;
    } catch (e) {
      console.error("Erro ao atualizar a lista:", e);
      setListStatus(listStatus);
      Alert.alert("Erro", "Não foi possível atualizar a sua lista.");
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return 'Não divulgado';
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const handlePlayTrailer = () => {
    const videos = movieDetails?.videos?.results;
    if (!videos || videos.length === 0) {
      Alert.alert('Trailer não encontrado', 'Não há vídeos disponíveis para este filme.');
      return;
    }
    const trailer = videos.find((video: any) => video.site === 'YouTube' && video.type === 'Trailer') || videos.find((video: any) => video.site === 'YouTube');
    if (trailer?.key) {
      setTrailerKey(trailer.key);
      setTrailerVisible(true);
    } else {
      Alert.alert('Trailer não encontrado', 'Não foi possível encontrar um trailer no formato compatível (YouTube).');
    }
  };

  const renderTabContent = () => {
    if (!movieDetails) return <ActivityIndicator color="#fff" style={{ marginTop: 50 }} />;
    switch (activeTab) {
      case 'Sobre o Filme':
        return (
          <View>
            <Text style={styles.synopsis}>{movieDetails.overview || 'Sinopse não disponível.'}</Text>
            {(movieDetails.budget > 0 || movieDetails.revenue > 0) && (
              <View>
                <View style={styles.divider} />
                {movieDetails.budget > 0 && <View style={styles.financialItem}><Text style={styles.financialTitle}>Orçamento</Text><Text style={styles.financialValue}>{formatCurrency(movieDetails.budget)}</Text></View>}
                {movieDetails.revenue > 0 && <View style={styles.financialItem}><Text style={styles.financialTitle}>Receita</Text><Text style={styles.financialValue}>{formatCurrency(movieDetails.revenue)}</Text></View>}
              </View>
            )}
          </View>
        );
      case 'Onde Assistir':
        const providers = movieDetails['watch/providers']?.results?.BR?.flatrate || [];
        if (providers.length === 0) return <Text style={styles.synopsis}>Não disponível para assinatura em serviços de streaming no Brasil.</Text>;
        return <View style={styles.providerContainer}>{providers.map((provider: any) => <Image key={provider.provider_id} source={{ uri: getImageUrl(provider.logo_path) }} style={styles.providerLogo} />)}</View>;
      case 'Elenco & Equipe':
        const crew = movieDetails.credits?.crew || [];
        const director = crew.find((member: any) => member.job === 'Director');
        const writers = crew.filter((member: any) => member.job === 'Screenplay' || member.job === 'Writer' || member.job === 'Story').slice(0, 2);
        return (
          <View>
            {director && <View style={styles.crewSection}><Text style={styles.crewName}>{director.name}</Text><Text style={styles.crewJob}>Diretor</Text></View>}
            {writers.map((writer: any, index: number) => <View key={writer.credit_id} style={[styles.crewSection, { marginTop: director || index > 0 ? 15 : 0 }]}><Text style={styles.crewName}>{writer.name}</Text><Text style={styles.crewJob}>Roteirista</Text></View>)}
            <View style={styles.divider} />
            <Text style={styles.sectionHeader}>Elenco Principal</Text>
            <FlatList data={movieDetails.credits?.cast.slice(0, 15) || []} renderItem={({ item }) => <CastCard actor={item} />} keyExtractor={(item) => item.id.toString()} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 15 }} />
          </View>
        );
      default: return null;
    }
  };

  if (!movieDetails) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  const getFormattedDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getFormattedRuntime = (runtime: number) => {
    if (!runtime) return '';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}min`;
  };

  const genre = movieDetails.genres?.[0]?.name || ''; 
  const AgeRatingIcon = ageRating ? ageRatingIcons[(ageRating.replace(' anos', '').startsWith('1') ? ageRating.slice(0, 2) : ageRating) as keyof typeof ageRatingIcons] : null;

  return (
    <View style={styles.rootContainer}>
     
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView}>
        
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { top: insets.top + 10 }]}>
          <Feather name="arrow-left" size={28} color="white" />
        </TouchableOpacity>

        <ImageBackground source={{ uri: getBackdropUrl(movieDetails.backdrop_path || movieDetails.poster_path) }} style={styles.backgroundImage}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayTrailer}><Feather name="play" size={40} color="white" style={styles.playIcon} /></TouchableOpacity>
          <LinearGradient colors={['transparent', 'rgba(44,44,44,0.6)', '#2C2C2C']} style={styles.gradient} />
        </ImageBackground>
        <View style={styles.infoContainer}>
            <Text style={styles.title}>{movieDetails.title}</Text>
            <View style={styles.detailsRow}>
              <View style={styles.ageRatingContainer}>{AgeRatingIcon ? (<AgeRatingIcon width={45} height={22} />) : (<Text style={styles.detailText}>N/A</Text>)}</View>
              <Text style={styles.detailText}>{getFormattedDate(movieDetails.release_date)}</Text>
              <Text style={styles.detailText}>•</Text>
              <Text style={styles.detailText}>{getFormattedRuntime(movieDetails.runtime)}</Text>
              <Text style={styles.detailText}>•</Text>
              <Text style={[styles.detailText, { flexShrink: 1 }]}>{genre}</Text> 
            </View>
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={() => toggleListStatus('is_favorite')}><Feather name="heart" size={26} color={listStatus.is_favorite ? '#FFBB38' : 'white'} /><Text style={styles.actionText}>Favorito</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => toggleListStatus('is_watchlist')}><Feather name="bookmark" size={26} color={listStatus.is_watchlist ? '#FFBB38' : 'white'} /><Text style={styles.actionText}>Quero Ver</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => toggleListStatus('is_watched')}><Feather name="check-circle" size={26} color={listStatus.is_watched ? '#FFBB38' : 'white'} /><Text style={styles.actionText}>Assistido</Text></TouchableOpacity>
            </View>
            <View style={styles.ratingCard}>
              <StarIcon width={24} height={24} fill="#FF8700" />
              <Text style={styles.ratingValue}>{movieDetails.vote_average?.toFixed(1)}</Text>
            </View>
        </View>
        <MovieDetailTabs tabs={TABS} activeTab={activeTab} onTabPress={setActiveTab} />
        <View style={styles.contentSection}>{renderTabContent()}</View>
      </ScrollView>
      <Modal animationType="slide" transparent={false} visible={isTrailerVisible} onRequestClose={() => setTrailerVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={[styles.closeButton, { top: insets.top || 20 }]} onPress={() => setTrailerVisible(false)}><Feather name="x" size={30} color="white" /></TouchableOpacity>
          <WebView style={{ flex: 1, backgroundColor: 'black' }} javaScriptEnabled={true} domStorageEnabled={true} source={{ uri: `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0` }} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#2C2C2C', justifyContent: 'center' },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2C2C2C' },
  backButton: { position: 'absolute', left: 15, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 5 },
  backgroundImage: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 200 },
  infoContainer: { padding: 20, marginTop: -60 },
  title: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 15 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 20, gap: 8 },
  detailText: { color: '#a0a0a0', fontSize: 15 },
  ageRatingContainer: { marginRight: 8, height: 22, justifyContent: 'center' },
  ratingCard: { backgroundColor: '#333', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 10 },
  ratingValue: { color: '#FF8700', fontSize: 18, fontWeight: 'bold' },
  tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#3a3a3a' },
  tabText: { color: '#a0a0a0', fontSize: 16, fontWeight: '600', paddingVertical: 15 },
  activeTabText: { color: '#FFBB38' },
  contentSection: { padding: 20, minHeight: 250 },
  synopsis: { color: '#b0b0b0', fontSize: 16, lineHeight: 24 },
  providerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  providerLogo: { width: 60, height: 60, borderRadius: 12 },
  crewSection: { marginBottom: 15 },
  crewName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  crewJob: { color: '#a0a0a0', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#3a3a3a', marginVertical: 25 },
  sectionHeader: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  playButton: { padding: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 50 },
  playIcon: {},
  modalContainer: { flex: 1, backgroundColor: 'black' },
  closeButton: { position: 'absolute', right: 15, zIndex: 1, padding: 10 },
  financialItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  financialTitle: { color: '#a0a0a0', fontSize: 16 },
  financialValue: { color: 'white', fontSize: 16, fontWeight: '600' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  actionButton: { alignItems: 'center', gap: 8 },
  actionText: { color: 'white', fontSize: 14 },
});

export default MovieDetailsScreen;