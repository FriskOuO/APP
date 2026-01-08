import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ActivityIndicator } from 'react-native';

const LoadingScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={[styles.loadingContainer, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color="#22d3ee" />
      <Text style={[styles.loadingText, { marginTop: 20, fontSize: 18, color: '#22d3ee' }]}>
        🎮 載入中...
      </Text>
      <Text style={[styles.loadingHint, { marginTop: 10, fontSize: 14, color: '#64748b' }]}>
        初始化遊戲系統
      </Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#22d3ee',
  },
  loadingHint: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
});

export default LoadingScreen;
