import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function AdBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>[ Anúncio de Teste ]</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#282828',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  text: {
    color: '#aaa',
    fontSize: 16,
  },
});