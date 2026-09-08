import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthStack from './AuthStack';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthStack />
    </GestureHandlerRootView>
  );
}
