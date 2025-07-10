import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/AuthProvider';

export default function PremiumScreen() {
  const router = useRouter();
  const { setPremiumStatus } = useAuth();

  const handleSubscription = () => {
    setPremiumStatus(true);
    router.back();
  };

  return (
   
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: 'CineApp Premium', 
        headerTransparent: true,
        headerTintColor: 'white'
      }} />
      <LinearGradient
        colors={['#453a29', '#1a1a1a']}
        style={StyleSheet.absoluteFill}
      />
      
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Feather name="star" size={60} color="#FFBB38" />
          <Text style={styles.heroTitle}>Desbloqueie a Experiência Completa</Text>
          <Text style={styles.heroSubtitle}>
            Apoie o nosso trabalho e desfrute de funcionalidades exclusivas.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <FeatureItem
            icon="zap-off"
            title="Navegação Sem Anúncios"
            description="Desfrute de uma experiência limpa e imersiva, sem interrupções."
          />
          <FeatureItem
            icon="message-circle"
            title="Cine IA Ilimitado"
            description="Converse com a nossa IA sem o limite diário de 100 mensagens."
          />
          <FeatureItem
            icon="heart"
            title="Apoie o Desenvolvimento"
            description="A sua assinatura ajuda-nos a manter e a criar novas funcionalidades incríveis."
          />
        </View>
      </ScrollView>

     
      <View style={styles.footer}>
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscription}>
          <Text style={styles.subscribeButtonText}>Assinar por R$ 5,99/mês</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          A assinatura será renovada automaticamente. Cancele a qualquer momento.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, title, description }: { icon: any; title: string; description: string }) => (
  <View style={styles.featureItem}>
    <Feather name={icon} size={28} color="#FFBB38" />
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
   
    paddingBottom: 20, 
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
   
    paddingTop: Platform.OS === 'ios' ? 120 : 80,
    paddingBottom: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
    marginTop: 10,
  },
  featuresSection: {
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  featureTextContainer: {
    marginLeft: 20,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  featureDescription: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 4,
  },
  footer: {
   
    padding: 20,
    paddingTop: 10, 
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#282828',
  },
  subscribeButton: {
    backgroundColor: '#FFBB38',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 15,
  },
});