import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import LoginSvg from '@/assets/images/pipoca.svg';
import SignupSvg from '@/assets/images/pipoca1.svg';
import { SvgProps } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type AuthErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [errors, setErrors] = useState<AuthErrors>({});
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const validate = () => {
    const newErrors: AuthErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      newErrors.email = 'Por favor, insira um e-mail válido.';
    }

    if (mode === 'signup') {
      if (!name) {
        newErrors.name = 'O nome é obrigatório.';
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
      if (password.length < 6) {
        newErrors.password = 'A senha deve ter no mínimo 6 caracteres.';
      } else if (!passwordRegex.test(password)) {
        newErrors.password = 'A senha precisa de maiúscula, número e caractere especial.';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleAuth() {
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrors({ general: 'E-mail ou senha inválidos.' });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setErrors({ general: error.message });
      }
    }
    setLoading(false);
  }

  const AuthIllustration = ({ ...props }: SvgProps) => {
    return mode === 'login'
      ? <LoginSvg {...props} />
      : <SignupSvg {...props} />;
  }

  const getInputStyle = (fieldName: keyof AuthErrors) => [
    styles.input,
    errors[fieldName] ? styles.inputError : null,
    activeInput === fieldName ? styles.inputActive : null,
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#453a29', '#2C2C2C']}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <AuthIllustration width={'100%'} height={220} preserveAspectRatio="xMidYMid meet" />
          <Text style={styles.title}>{mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}</Text>
          <Text style={styles.subtitle}>Acesse para continuar sua jornada cinematográfica.</Text>
        </View>

        <View style={styles.form}>
          {mode === 'signup' && (
            <View>
              <TextInput
                style={getInputStyle('name')}
                placeholder="Seu Nome"
                placeholderTextColor="#a0a0a0"
                value={name}
                onChangeText={(text) => {setName(text); if (errors.name) validate();}}
                onFocus={() => setActiveInput('name')}
                onBlur={() => setActiveInput(null)}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
          )}

          <View>
            <TextInput
              style={getInputStyle('email')}
              placeholder="Email"
              placeholderTextColor="#a0a0a0"
              value={email}
              onChangeText={(text) => {setEmail(text); if (errors.email) validate();}}
              onFocus={() => setActiveInput('email')}
              onBlur={() => setActiveInput(null)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View>
            <View style={[...getInputStyle('password'), styles.passwordContainer]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Senha"
                placeholderTextColor="#a0a0a0"
                value={password}
                onChangeText={(text) => {setPassword(text); if (errors.password) validate();}}
                onFocus={() => setActiveInput('password')}
                onBlur={() => setActiveInput(null)}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={22} color="#a0a0a0" />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>
          
          {mode === 'signup' && (
            <View>
               <View style={[...getInputStyle('confirmPassword'), styles.passwordContainer]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirmar Senha"
                  placeholderTextColor="#a0a0a0"
                  value={confirmPassword}
                  onChangeText={(text) => {setConfirmPassword(text); if (errors.confirmPassword) validate();}}
                  onFocus={() => setActiveInput('confirmPassword')}
                  onBlur={() => setActiveInput(null)}
                  secureTextEntry={!isConfirmPasswordVisible}
                />
                <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                  <Feather name={isConfirmPasswordVisible ? "eye-off" : "eye"} size={22} color="#a0a0a0" />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>
          )}

          {errors.general && <Text style={[styles.errorText, { textAlign: 'center', fontSize: 14, marginBottom: 15 }]}>{errors.general}</Text>}
        
          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>{mode === 'login' ? 'Entrar' : 'Cadastrar'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleButton} onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); }}>
            <Text style={styles.toggleText}>
              {mode === 'login' ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
              <Text style={{fontWeight: 'bold'}}>{mode === 'login' ? 'Cadastre-se' : 'Entre'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 25 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 8,
    textAlign: 'center',
  },
  form: { paddingHorizontal: 25 },
  input: {
    height: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: 'white',
  },
  inputError: { borderColor: '#ff4d4d' },
  inputActive: { borderColor: '#FFBB38', borderWidth: 1.5 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
    paddingLeft: 0, 
    paddingVertical: 0,
    height: 55, 
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 15,
  },
  errorText: {
    color: '#ff4d4d',
    marginBottom: 10,
    marginTop: -10, 
    paddingLeft: 5,
    fontSize: 12,
  },
  button: {
    backgroundColor: '#FFBB38',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    height: 55,
    justifyContent: 'center',
  },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  toggleButton: { marginTop: 25, alignItems: 'center' },
  toggleText: { color: '#a0a0a0', fontSize: 16, fontWeight: '500' },
});