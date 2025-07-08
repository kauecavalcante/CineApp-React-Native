import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Alert, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { ThemedText } from '@/components/ThemedText';

export default function SettingsScreen() {
  const { session } = useAuth();
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
        Alert.alert(error.message);
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
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>Configurações</ThemedText>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#453a29' },
  loading: { flex: 1, backgroundColor: '#2C2C2C', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', marginBottom: 32, textAlign: 'center' },
  form: { marginBottom: 24 },
  label: { color: '#a0a0a0', fontSize: 16, marginBottom: 8 },
  input: { backgroundColor: '#2C2C2C', color: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#5a4d3a' },
  inputDisabled: { backgroundColor: '#3a3a3a', color: '#888' },
  button: { backgroundColor: '#FFBB38', padding: 16, borderRadius: 30, alignItems: 'center', marginBottom: 16 },
  signOutButton: { backgroundColor: '#a0a0a0' },
  buttonText: { color: '#2C2C2C', fontSize: 16, fontWeight: 'bold' },
});