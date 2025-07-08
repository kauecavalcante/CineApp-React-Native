import React, { useState, useRef } from 'react';
import {
  View,
  Text, 
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router'
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { SvgProps } from 'react-native-svg';
import InicialSvg from '@/assets/images/Inicial.svg';
import CineiaSvg from '@/assets/images/cineia.svg';
import BackstageSvg from '@/assets/images/backstage.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const onboardingSteps = [
  {
    icon: (props: SvgProps) => <InicialSvg {...props} />,
    title: [
      { text: 'Encontre os ' },
      { text: 'melhores filmes', highlight: true },
      { text: ' aqui' },
    ],
    description: "Descubra os melhores filmes para assistir, os filmes mais populares do dia, mais avaliados e muito mais.",
  },
  {
    icon: (props: SvgProps) => <CineiaSvg {...props} />,
    title: [
      { text: 'Converse com o' },
      { text: ' Cine IA', highlight: true },
    ],
    description: 'Converse com o Cine IA para receber recomendações personalizadas de filmes a partir da sua vibe no momento.',
  },
  {
    icon: (props: SvgProps) => <BackstageSvg {...props} />,
    title: [
      { text: 'Backstage', highlight: true },
      { text: ' dos filmes' },
    ],
    description: 'Conheça os bastidores dos filmes, com informações sobre o elenco, produção e muito mais.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const handleContinue = async () => {
    if (activeIndex < onboardingSteps.length - 1) {
      scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH * (activeIndex + 1), animated: true });
    } else {
      try {
        await supabase.auth.updateUser({
          data: { has_seen_onboarding: true }
        });
      } catch (e) {
        console.error("Ocorreu um erro inesperado:", e);
      }
      router.replace('/(auth)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {onboardingSteps.map((step, index) => (
          <View key={index} style={styles.page}>
            <View style={styles.textContainer}>
             
              <View style={styles.titleContainer}>
                {step.title.map((part, i) => (
                  <Text 
                    key={i}
                    style={[
                      styles.titleText,
                      part.highlight ? styles.highlightText : styles.normalTitleText,
                    ]}
                  >
                    {part.text}
                  </Text>
                ))}
              </View>
              <ThemedText style={styles.description}>{step.description}</ThemedText>
            </View>
            
            <View style={styles.imageContainer}>
              {step.icon({ width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet' })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeIndex === index ? styles.dotActive : {}]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Feather name="arrow-right" size={24} color="#453a29" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#453a29',
  },
  page: {
    width: SCREEN_WIDTH,
    height: '100%',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  textContainer: {
    flex: 0.3,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  normalTitleText: {
    color: '#fff',
  },
  highlightText: {
    color: '#FFBB38',
  },
  description: {
    color: '#a0a0a0',
    textAlign: 'left',
    fontSize: 18,
  },
  imageContainer: {
    flex: 0.7,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FFBB38',
    width: 24,
  },
  button: {
    backgroundColor: '#FFBB38',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});