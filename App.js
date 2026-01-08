import React from 'react';
import { Platform } from 'react-native';

// 根據平台載入不同的 App
const AppComponent = Platform.OS === 'web' 
  ? require('./src/web/App').default 
  : require('./src/native/AppNative').default;

console.log('🌍 [Root App.js] Platform detected:', Platform.OS);

export default function App() {
  return <AppComponent />;
}

