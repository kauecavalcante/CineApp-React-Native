import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Alert, TextInput, TouchableOpacity, Text, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { session, isPremium } = useAuth(); 
  const router = useRouter(); 
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

 
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setEmail(session.user.email || '');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      setEmail(session.user.email || '');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name`)
        .eq('id', session.user.id)
        .single();
        
      if (error && status !== 406) {
        throw error;
      }

      if (data?.full_name) {
        setFullName(data.full_name);
      } else if (session.user.user_metadata?.full_name) {
        setFullName(session.user.user_metadata.full_name);
      }
    } catch (error) {
      if (error instanceof Error) {
        
        console.log(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session, getProfile]);

  async function updateProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const profileUpdates = {
        id: session?.user.id,
        full_name: fullName,
        updated_at: new Date(),
      };
      const { error: profileError } = await supabase.from('profiles').upsert(profileUpdates);
      if (profileError) throw profileError;

      const trimmedEmail = email.trim();
      if (trimmedEmail !== session.user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: trimmedEmail });
        if (authError) throw authError;
        Alert.alert('Sucesso!', 'Seu perfil foi atualizado. Verifique seu e-mail para confirmar a alteração.');
      } else {
        Alert.alert('Sucesso!', 'Seu perfil foi atualizado.');
      }

    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro ao atualizar", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#FFBB38" style={styles.loading} />;
  }

  return (
   
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedText type="title" style={styles.title}>Configurações</ThemedText>
      
     
      <TouchableOpacity 
        style={styles.premiumButton} 
        onPress={() => router.push('/(app)/premium')}
      >
        <Feather name="star" size={24} color="#FFBB38" />
        <View style={styles.premiumTextContainer}>
          <Text style={styles.premiumText}>
            {isPremium ? 'Você é Premium!' : 'Torne-se Premium'}
          </Text>
          <Text style={styles.premiumSubText}>
            {isPremium ? 'Obrigado pelo seu apoio' : 'Remova anúncios e mais'}
          </Text>
        </View>
        <Feather name="chevron-right" size={24} color="#555" />
      </TouchableOpacity>

    
      <View style={styles.form}>
        <ThemedText style={styles.label}>Nome Completo</ThemedText>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setFullName(text)}
          value={fullName}
          placeholder="Seu nome completo"
          placeholderTextColor="#888"
        />
        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(text) => setEmail(text)}
          placeholder="seu@email.com"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      
      <TouchableOpacity style={styles.button} onPress={updateProfile} disabled={loading}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#453a29' 
  },
  contentContainer: {
    padding: 24,
  },
  loading: { 
    flex: 1, 
    backgroundColor: '#2C2C2C', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    color: '#fff', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
    padding: 15,
    borderRadius: 10,
    marginBottom: 32, 
  },
  premiumTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  premiumSubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  form: { 
    marginBottom: 24 
  },
  label: { 
    color: '#a0a0a0', 
    fontSize: 16, 
    marginBottom: 8 
  },
  input: { 
    backgroundColor: '#2C2C2C', 
    color: '#fff', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 8, 
    fontSize: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#5a4d3a' 
  },
  button: { 
    backgroundColor: '#FFBB38', 
    padding: 16, 
    borderRadius: 30, 
    alignItems: 'center', 
    marginBottom: 16 
  },
  signOutButton: { 
    backgroundColor: '#a0a0a0' 
  },
  buttonText: { 
    color: '#2C2C2C', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});