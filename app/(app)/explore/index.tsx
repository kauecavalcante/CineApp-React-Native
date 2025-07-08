import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenreCard } from '@/components/GenreCard';
import { Link } from 'expo-router';


import AcaoIcon from '@/assets/images/genres/acao.svg';
import AnimacaoIcon from '@/assets/images/genres/animacao.svg';
import AventuraIcon from '@/assets/images/genres/aventura.svg';
import ComediaIcon from '@/assets/images/genres/comedia.svg';
import DocumentarioIcon from '@/assets/images/genres/documentario.svg';
import DramaIcon from '@/assets/images/genres/drama.svg';
import FamiliaIcon from '@/assets/images/genres/familia.svg';
import FiccaoIcon from '@/assets/images/genres/ficcao.svg';
import RomanceIcon from '@/assets/images/genres/romance.svg';
import TerrorIcon from '@/assets/images/genres/terror.svg';

const genres = [
  { id: 28, name: 'Ação', ImageComponent: AcaoIcon },
  { id: 16, name: 'Animação', ImageComponent: AnimacaoIcon },
  { id: 12, name: 'Aventura', ImageComponent: AventuraIcon },
  { id: 35, name: 'Comédia', ImageComponent: ComediaIcon },
  { id: 99, name: 'Documentário', ImageComponent: DocumentarioIcon },
  { id: 18, name: 'Drama', ImageComponent: DramaIcon },
  { id: 10751, name: 'Família', ImageComponent: FamiliaIcon },
  { id: 878, name: 'Ficção Científica', ImageComponent: FiccaoIcon },
  { id: 10749, name: 'Romance', ImageComponent: RomanceIcon },
  { id: 27, name: 'Terror', ImageComponent: TerrorIcon },
];

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#453a29', '#2C2C2C']}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={{
              pathname: "/explore/genre/[id]",
              params: { id: genre.id, name: genre.name }
            }}
            asChild 
          >
            <GenreCard
              genreName={genre.name}
              ImageComponent={genre.ImageComponent}
              onPress={() => {}} 
            />
          </Link>
        ))}
      </ScrollView>
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