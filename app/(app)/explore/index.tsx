import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenreCard } from '@/components/GenreCard';
import { Link } from 'expo-router';


const genres = [
  { id: 28, name: 'Ação', imageSource: require('@/assets/images/genres/acao.png') },
  { id: 16, name: 'Animação', imageSource: require('@/assets/images/genres/animacao.png') },
  { id: 12, name: 'Aventura', imageSource: require('@/assets/images/genres/aventura.png') },
  { id: 35, name: 'Comédia', imageSource: require('@/assets/images/genres/comedia.png') },
  { id: 99, name: 'Documentário', imageSource: require('@/assets/images/genres/documentario.png') },
  { id: 18, name: 'Drama', imageSource: require('@/assets/images/genres/drama.png') },
  { id: 10751, name: 'Família', imageSource: require('@/assets/images/genres/familia.png') },
  { id: 878, name: 'Ficção Científica', imageSource: require('@/assets/images/genres/ficcao.png') },
  { id: 10749, name: 'Romance', imageSource: require('@/assets/images/genres/romance.png') },
  { id: 27, name: 'Terror', imageSource: require('@/assets/images/genres/terror.png') },
];

export default function ExploreScreen() {
  const renderGenre = ({ item }: { item: typeof genres[0] }) => (
    <Link
      href={{
        pathname: "/explore/genre/[id]",
        params: { id: item.id, name: item.name }
      }}
      asChild
    >
      <GenreCard
        genreName={item.name}
        imageSource={item.imageSource} 
        onPress={() => {}}
      />
    </Link>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#453a29', '#2C2C2C']}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <FlatList
        data={genres}
        renderItem={renderGenre}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scrollContainer}
        initialNumToRender={5} 
        maxToRenderPerBatch={5} 
        windowSize={11} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
});