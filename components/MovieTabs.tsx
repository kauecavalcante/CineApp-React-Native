import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

type MovieTabsProps = {
  tabs: string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
};

export function MovieTabs({ tabs, activeTab, onTabPress }: MovieTabsProps) {
  return (
    
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => (
        <TouchableOpacity key={tab} onPress={() => onTabPress(tab)} style={styles.tab}>
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
          {activeTab === tab && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20, 
    marginTop: 15,
    marginBottom: 25,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 10,
    marginRight: 25, 
  },
  tabText: {
    color: '#a0a0a0',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFBB38',
    fontWeight: 'bold',
  },
  activeIndicator: {
    height: 3,
    width: '60%',
    backgroundColor: '#FFBB38',
    marginTop: 5,
    borderRadius: 2,
  },
});