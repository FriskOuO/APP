import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, StatusBar, Dimensions, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useMachine } from '@xstate/react';
import { visualNovelMachine } from './visualNovelMachine';

import CyberpunkDashboard from './components/CyberpunkDashboardNative';
import LoadingScreen from './components/LoadingScreen';
import VirtualMobile from './components/VirtualMobile';
import TypewriterText from './components/TypewriterText';
import QTEOverlay from './components/QTEOverlay';
import PaymentInput from './components/PaymentInput';
import Screen from './components/Screen';
import DialogueBox from './components/DialogueBox';
import styles from './AppStyles';

const BACKGROUND_SOURCES = {
  'parking-lot': require('../../assets/parking_lot.png'),
  'teach': require('../../assets/teach.png'),
  'car-interior': require('../../assets/car.png'),
  'blue-screen': require('../../assets/bsod.png'),
  'oiia-cat': require('../../assets/oiia-cat.gif'),
  'protagonist': require('../../assets/protagonist.png'),
  'moving-car': require('../../assets/moving_car.png'),
  'street-cat': require('../../assets/oiia_cat.png'),
  'spaghetti': require('../../assets/spaghetti.png'),
  'spaghetti-eaten': require('../../assets/spaghetti_eaten.png'),
  'spaghetti-dance': require('../../assets/spaghetti.png'),
  'hand-touching': require('../../assets/hand_touching.png'),
  'mysterious-man': require('../../assets/mysterious.png'),
  'static-noise': require('../../assets/parking_lot.png'),
  'railing-closed': require('../../assets/railing.png'),
  'railing-opening': require('../../assets/railing_opening.png')
};







const App = () => {
  const [state, send] = useMachine(visualNovelMachine);
  const [typingComplete, setTypingComplete] = useState(false);
  const [drivingDistance, setDrivingDistance] = useState(500);
  const [prevText, setPrevText] = useState('');
  const [forceShowFull, setForceShowFull] = useState(false);
  const [email, setEmail] = useState(''); // Email State

  const currentState = state.value;
  const context = state.context;

  // 處理加載狀態
  if (!state || !context || !currentState) {
    return <LoadingScreen />;
  }

  // IMMEDIATE STATE RESET PATTERN
  if (context.currentText !== prevText) {
    setPrevText(context.currentText);
    setForceShowFull(false);
    setTypingComplete(false);
  }

  // Sync manual driving distance to machine context
  useEffect(() => {
    if (currentState === 'driving') {
      send({ type: 'UPDATE_DISTANCE', distance: drivingDistance });
    }
  }, [drivingDistance, currentState, send]);

  // Reset driving distance when entering driving state
  useEffect(() => {
    if (currentState === 'driving') {
      setDrivingDistance(prev => {
        if (prev > 0 && prev < 500) return prev;
        return 500;
      });
    }
  }, [currentState]);

  // Auto-trigger gate when distance reaches 0
  useEffect(() => {
    if (currentState === 'driving' && drivingDistance <= 0) {
      const timer = setTimeout(() => {
        send({ type: 'DISTANCE_REACHED' });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentState, drivingDistance, send]);

  // Auto-check QTE completion
  useEffect(() => {
    if (currentState === 'qteSequence' && 
        context.qteProgress >= context.qteSequence.length &&
        context.qteSequence.length > 0) {
      send({ type: 'QTE_SUCCESS' });
    }
  }, [currentState, context.qteProgress, context.qteSequence.length, send]);

  // Play OIIA sound effect when entering endingBlackHole state
  useEffect(() => {
    if (currentState === 'endingBlackHole') {
      // Note: React Native doesn't have built-in audio support
      // You'll need to install expo-av or react-native-sound
      // For now, this is a placeholder
      console.log('Playing OIIA sound for 7 seconds');
      
      const timer = setTimeout(() => {
        console.log('Sound finished');
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [currentState]);

  const handleQTEPress = (key) => {
    if (currentState === 'qteSequence') {
      send({ type: 'KEY_PRESS', key });
    }
  };

  const getChoices = () => {
    switch (currentState) {
      case 'start': return [{ label: '強行進入(物理)', action: 'NEXT' }];
      case 'inCar': 
        const inCarChoices = [{ label: '啟動引擎', action: 'NEXT' }];
        if (context.gameCleared) {
            inCarChoices.push({ label: '🤖 自動駕駛 (VIP)', action: 'AUTO_PILOT' });
        }
        inCarChoices.push({ label: '原地發呆', action: 'DO_NOTHING' });
        return inCarChoices;
      case 'qteSequence': return []; // Handled by buttons
      case 'engineStall': return [{ label: '再試一次', action: 'RETRY' }];
      case 'driving': return []; 
      case 'atGate': return []; 
      case 'gateOpening': return []; 
      
      case 'parked': return [
        { label: '🐱 查看貓咪', action: 'GO_CAT' },
        { label: '🍝 查看義大利麵', action: 'GO_SPAGHETTI' },
        { label: '🧱 走向邊界', action: 'GO_EXIT' }
      ];

      case 'interactCat': 
        const catChoices = [{ label: '✋ 摸摸貓咪', action: 'TOUCH_CAT' }];
        if (context.hasSpaghetti) {
            catChoices.push({ label: '🍝 餵食義大利麵', action: 'FEED_CAT' });
        }
        catChoices.push({ label: '🔙 回到停車場', action: 'BACK' });
        return catChoices;

      case 'interactSpaghetti':
        const spagChoices = [];
        if (!context.hasSpaghetti) {
            spagChoices.push({ label: '🍴 吃掉它', action: 'EAT_SPAGHETTI' });
            spagChoices.push({ label: '🎒 拿起義大利麵', action: 'PICK_UP' });
        }
        spagChoices.push({ label: '🔙 回到停車場', action: 'BACK' });
        return spagChoices;

      case 'interactExit': return [
        { label: '💥 撞擊牆壁', action: 'HIT_WALL' },
        { label: '🔙 回到停車場', action: 'BACK' }
      ];

      case 'endingBlackHole':
      case 'endingCatChaos':
      case 'endingSpaghettiDance':
      case 'endingAdmin':
        return [{ label: '前往繳費', action: 'NEXT' }];

      case 'endingBSOD':
      case 'finished':
        return [{ label: '再來一把', action: 'RESTART' }];
        
      case 'paymentNarrative': return [{ label: '前往繳費', action: 'PROCEED_TO_PAY' }]; // Simplified
      case 'paymentInput': return []; 

      default: return [];
    }
  };

  const choices = getChoices();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
      
      {/* Main Game Area */}
<View style={styles.gameArea}>
        <Screen context={context} currentState={currentState} handleQTEPress={handleQTEPress} BACKGROUND_SOURCES={BACKGROUND_SOURCES} />
        <DialogueBox context={context} setTypingComplete={setTypingComplete} forceShowFull={forceShowFull} currentState={currentState} choices={choices} setDrivingDistance={setDrivingDistance} send={send} />
      </View>

      {/* Dashboard (Simplified) */}
      <CyberpunkDashboard currentState={currentState} distance={drivingDistance} logs={context.logs} />
      
      {/* Virtual Mobile */}
      <VirtualMobile notification={context.notification} parkedHours={context.parkedHours} />

      {currentState === 'paymentInput' && <PaymentInput email={email} setEmail={setEmail} send={send} />}
      

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default App; // Fix export declaration


