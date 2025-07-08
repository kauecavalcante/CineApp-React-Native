import React, { useState, useRef } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, Animated, Dimensions, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export function AnimatedSearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const toggleSearch = () => {
    const toValue = isExpanded ? 0 : 1;
    
    if (toValue === 1) {
      inputRef.current?.focus();
    } else {
      Keyboard.dismiss();
    }

    Animated.timing(animation, {
      toValue,
      duration: 350,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const handleSearch = () => {
    if (query.trim() === '') {
      return;
    }
    
    router.push({
      pathname: '/search',
      params: { query }
    });
    
    setQuery('');
    toggleSearch();
  };

  const widthInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [45, width - 85], 
  });

  const animatedStyle = {
    width: widthInterpolation,
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity onPress={toggleSearch}>
        <Feather name="search" size={24} color="white" />
      </TouchableOpacity>
      {isExpanded && (
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Buscar filmes..."
          placeholderTextColor="#a0a0a0"
          autoFocus={true}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    height: 45,
    borderRadius: 22.5,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
  },
});