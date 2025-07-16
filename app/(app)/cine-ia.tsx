import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { WebView } from 'react-native-webview';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Message = {
  role: 'user' | 'assistant' | 'loading';
  content: string;
};

const MarkdownText = ({ content, style, onPlayTrailer }: { content: string, style: any, onPlayTrailer: (url: string) => void }) => {
  const lines = content.split('\n');

  const renderInlineFormatting = (line: string, lineIndex: number) => {
    const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
    const parts = line.split(regex);
    return (
      <Text key={lineIndex} style={style}>
        {parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <Text key={partIndex} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <Text key={partIndex} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</Text>;
          }
          const trailerMatch = part.match(/\[(.*?)\]\((.*?)\)/);
          if (trailerMatch) {
            const [, text, url] = trailerMatch;
            return (
              <TouchableOpacity key={partIndex} onPress={() => onPlayTrailer(url)}>
                <Text style={styles.trailerLink}>{text}</Text>
              </TouchableOpacity>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <View>
      {lines.map((line, lineIndex) => {
        if (line.trim().startsWith('###')) {
          return <Text key={lineIndex} style={styles.heading3}>{line.replace('###', '').trim()}</Text>;
        }
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <View key={lineIndex} style={styles.listItem}>
              <Text style={style}>• </Text>
              {renderInlineFormatting(line.substring(2), lineIndex)}
            </View>
          );
        }
        return renderInlineFormatting(line, lineIndex);
      })}
    </View>
  );
};

const MessageBubble = ({ message, onPlayTrailer }: { message: Message, onPlayTrailer: (url: string) => void }) => {
  const isUser = message.role === 'user';
  if (message.role === 'loading') {
    return <View style={[styles.bubble, styles.assistantBubble]}><ActivityIndicator color="#FFBB38" size="small" /></View>;
  }
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      <MarkdownText content={message.content} style={isUser ? styles.userMessageText : styles.assistantMessageText} onPlayTrailer={onPlayTrailer} />
    </View>
  );
};

export default function CineIAScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Eu sou o Cine, seu especialista em filmes. O que você gostaria de saber ou assistir hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [isTrailerVisible, setTrailerVisible] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  

  const keyboard = useAnimatedKeyboard();

  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -keyboard.height.value }],
    };
  });

  const handlePlayTrailer = (url: string) => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
      const videoId = match[1];
      setTrailerKey(videoId);
      setTrailerVisible(true);
    } else {
      Alert.alert("Link Inválido", "Não consegui abrir este link de trailer.");
    }
  };

  const handleSendMessage = async () => {
    const userMessage = input.trim();
    if (userMessage === '' || isLoading) return;

    const currentHistory = messages.map(({ role, content }) => ({ role, content }));

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
      { role: 'loading', content: '' },
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      await supabase.auth.refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");
      
      const token = session.access_token;
      
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: userMessage, history: currentHistory }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          const quotaExceededMessage = "Seu limite diário de mensagens acabou. 😢\n\nPara ter conversas ilimitadas, assine nosso plano premium!";
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = { role: 'assistant', content: quotaExceededMessage };
            return updatedMessages;
          });
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ocorreu um erro na API.');
      }

      const responseData = await response.json();
      
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = { role: 'assistant', content: responseData.reply };
        return updatedMessages;
      });

    } catch (error: any) {
      clearTimeout(timeoutId);
      let errorMessage = `Desculpe, erro: ${error.message}`;
      if (error.name === 'AbortError') {
        errorMessage = 'O Cine está pensando muito... Tente perguntar de novo!';
      }
      console.error("Erro ao enviar mensagem:", error.message);
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = { role: 'assistant', content: errorMessage };
        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current) flatListRef.current.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#453a29', '#2C2C2C']} style={StyleSheet.absoluteFill} />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} onPlayTrailer={handlePlayTrailer} />}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={[styles.chatContainer, { paddingBottom: insets.bottom + 80 }]}
      />
      
      <Animated.View style={animatedInputStyle}>
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 10 }]}>
          <TextInput 
            style={styles.input} 
            value={input} 
            onChangeText={setInput} 
            placeholder="Converse com o Cine..." 
            placeholderTextColor="#a0a0a0" 
            multiline 
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={isLoading}>
            <Feather name="send" size={24} color={isLoading ? '#555' : '#FFBB38'} />
          </TouchableOpacity>
        </View>
      </Animated.View>

     
      {isTrailerVisible && (
        <View style={styles.modalContainer}>
          <WebView
            style={{ flex: 1, backgroundColor: 'black' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            source={{ uri: `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0` }}
          />
          <TouchableOpacity style={[styles.closeButton, { top: insets.top || 20 }]} onPress={() => setTrailerVisible(false)}>
            <Feather name="x" size={30} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatContainer: { 
    paddingHorizontal: 10, 
    paddingTop: 20,
    flexGrow: 1,
  },
  bubble: { 
    maxWidth: '80%', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 10 
  },
  userBubble: { 
    backgroundColor: '#FFBB38', 
    alignSelf: 'flex-end', 
    borderBottomRightRadius: 5 
  },
  assistantBubble: { 
    backgroundColor: '#333', 
    alignSelf: 'flex-start', 
    borderBottomLeftRadius: 5 
  },
  userMessageText: { 
    fontSize: 16, 
    color: '#000', 
    lineHeight: 24 
  },
  assistantMessageText: { 
    fontSize: 16, 
    color: 'white', 
    lineHeight: 24 
  },
  trailerLink: { 
    color: '#FFBB38', 
    fontWeight: 'bold', 
    textDecorationLine: 'underline' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingTop: 10, 
    backgroundColor: '#2C2C2C', 
    borderTopWidth: 1, 
    borderTopColor: '#3a3a3a' 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#333', 
    borderRadius: 20, 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    fontSize: 16, 
    color: 'white', 
    marginRight: 10, 
    maxHeight: 120, 
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
  },
  sendButton: { 
    alignSelf: 'flex-end', 
    padding: 10, 
    marginBottom: 5 
  },
  modalContainer: { 
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 100, 
  },
  closeButton: { 
    position: 'absolute', 
    right: 15, 
    zIndex: 1, 
    padding: 10, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    borderRadius: 20 
  },
  heading3: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFBB38', 
    marginTop: 10, 
    marginBottom: 5 
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 10, 
  },
});
