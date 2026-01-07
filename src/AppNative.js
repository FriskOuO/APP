import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, StatusBar, Dimensions, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useMachine } from '@xstate/react';
import { visualNovelMachine } from './visualNovelMachine';

import CyberpunkDashboard from './components/CyberpunkDashboardNative';

const BACKGROUND_SOURCES = {
  'parking-lot': require('../assets/parking_lot.png'),
  'teach': require('../assets/teach.png'),
  'car-interior': require('../assets/car.png'),
  'blue-screen': require('../assets/bsod.png'),
  'oiia-cat': require('../assets/oiia_cat.png'),
  'protagonist': require('../assets/protagonist.png'),
  'moving-car': require('../assets/moving_car.png')
};

// --- Loading Component ---
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

const VirtualMobile = ({ notification, parkedHours }) => (
  notification ? (
    <View style={styles.mobileContainer}>
      <Text style={styles.mobileText}>{notification.title}</Text>
      <Text style={styles.mobileText}>{notification.message}</Text>
    </View>
  ) : null
);

// --- Helper Functions ---

const getSpeakerColor = (speaker) => {
  if (speaker.includes('系統')) return '#4ade80'; // green-400
  if (speaker.includes('車載智能')) return '#22d3ee'; // cyan-400
  if (speaker.includes('主角')) return '#facc15'; // yellow-400
  if (speaker.includes('神秘人') || speaker.includes('未知聲音')) return '#c084fc'; // purple-400
  if (speaker.includes('動作') || speaker.includes('聲音') || speaker.includes('音樂')) return '#9ca3af'; // gray-400
  return '#e5e7eb'; // gray-200
};

const parseTextToSegments = (fullText) => {
  const segments = [];
  const lines = fullText.split('\n');
  
  lines.forEach((line, i) => {
    const match = line.match(/^(\[[^\]]+\]):\s*(.*)/);
    if (match) {
      const speaker = match[1];
      const content = match[2];
      segments.push({ 
        text: `${speaker}: `, 
        color: getSpeakerColor(speaker),
        newLine: false 
      });
      segments.push({ 
        text: content, 
        color: '#e5e7eb', 
        newLine: true 
      });
    } else {
      segments.push({ 
        text: line, 
        color: '#e5e7eb', 
        newLine: true 
      });
    }
  });
  return segments;
};

// --- Typewriter Component ---

const TypewriterText = ({ text, context, onComplete, forceShowFull, isDrivingActive, onUpdate }) => {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [processedText, setProcessedText] = useState('');
  
  // 1. Variable Replacement
  useEffect(() => {
    if (!text) return;
    const replaced = text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const value = context[variableName.trim()];
      return value !== undefined ? value : match;
    });
    
    if (replaced !== processedText) {
      setProcessedText(replaced);
      setGlobalIndex(0);
    }
  }, [text, context, processedText]);

  // 2. Parse Segments
  const segments = useMemo(() => parseTextToSegments(processedText), [processedText]);
  const totalChars = segments.reduce((acc, seg) => acc + seg.text.length, 0);

  // 3. Timer Logic
  useEffect(() => {
    if (!processedText) return;

    if (forceShowFull || isDrivingActive) {
      setGlobalIndex(totalChars);
      if (onComplete) onComplete();
      if (onUpdate) onUpdate();
      return;
    }

    if (globalIndex < totalChars) {
      const timeout = setTimeout(() => {
        setGlobalIndex(prev => prev + 1);
        if (onUpdate) onUpdate();
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      if (onComplete) onComplete();
    }
  }, [globalIndex, totalChars, processedText, forceShowFull, isDrivingActive, onComplete, onUpdate]);

  // 5. Render
  let charCounter = 0;
  return (
    <ScrollView style={styles.typewriterContainer}>
      <View style={styles.textContainer}>
        {segments.map((seg, i) => {
          const start = charCounter;
          const end = charCounter + seg.text.length;
          charCounter += seg.text.length;

          if (globalIndex < start) return null;

          const visibleText = globalIndex >= end 
            ? seg.text 
            : seg.text.slice(0, globalIndex - start);

          return (
            <Text key={i} style={{ color: seg.color, fontSize: 16, fontFamily: 'monospace' }}>
              {visibleText}
              {seg.newLine ? '\n' : ''}
            </Text>
          );
        })}
        {globalIndex < totalChars && <Text style={styles.cursor}>_</Text>}
      </View>
    </ScrollView>
  );
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
        <View style={styles.screen}>
           {/* Background Image */}
           <View style={styles.backgroundPlaceholder}>
              {(() => {
                const backgroundSource = BACKGROUND_SOURCES[context.backgroundImage];

                if (backgroundSource) {
                  return (
                    <Image
                      key={context.backgroundImage}
                      source={backgroundSource}
                      style={styles.backgroundImage}
                      resizeMode={context.backgroundImage === 'blue-screen' ? 'stretch' : 'cover'}
                    />
                  );
                }

                return (
                  <>
                    <Text style={styles.sceneIcon}>
                      {context.backgroundImage === 'gate' && '[GATE]'}
                      {context.backgroundImage === 'static-noise' && '[NOISE]'}
                      {context.backgroundImage === 'oiia-cat' && '[CAT]'}
                      {context.backgroundImage === 'blue-screen' && '[BSOD]'}
                    </Text>
                    <Text style={styles.sceneName}>{context.backgroundImage}</Text>
                  </>
                );
              })()}
           </View>

           {/* Character Sprite - Hidden */}
           {/* <View style={styles.characterPlaceholder}>
              <Text style={styles.charEmoji}>
                {context.characterImage === 'narrator' && '🎭'}
                {context.characterImage === 'driver' && '🚗'}
                {context.characterImage === 'system' && '🤖'}
              </Text>
           </View> */}

           {/* QTE Overlay */}
           {currentState === 'qteSequence' && (
             <View style={styles.qteOverlay}>
               <Text style={styles.qteTitle}>QTE CHALLENGE</Text>
               <View style={styles.qteSequence}>
                 {context.qteSequence.map((key, idx) => (
                   <Text key={idx} style={[
                     styles.qteArrow,
                     idx < context.qteProgress ? styles.qteArrowDone : 
                     idx === context.qteProgress ? styles.qteArrowActive : null
                   ]}>
                     {key === 'ArrowUp' ? '↑' : key === 'ArrowDown' ? '↓' : key === 'ArrowLeft' ? '←' : '→'}
                   </Text>
                 ))}
               </View>
               <View style={styles.qteControls}>
                  <TouchableOpacity style={styles.qteBtn} onPress={() => handleQTEPress('ArrowUp')}><Text style={styles.qteBtnText}>↑</Text></TouchableOpacity>
                  <View style={styles.qteRow}>
                    <TouchableOpacity style={styles.qteBtn} onPress={() => handleQTEPress('ArrowLeft')}><Text style={styles.qteBtnText}>←</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.qteBtn} onPress={() => handleQTEPress('ArrowDown')}><Text style={styles.qteBtnText}>↓</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.qteBtn} onPress={() => handleQTEPress('ArrowRight')}><Text style={styles.qteBtnText}>→</Text></TouchableOpacity>
                  </View>
               </View>
             </View>
           )}
        </View>

        {/* Dialogue Box */}
        <View style={styles.dialogueBox}>
          <TypewriterText 
            text={context.currentText} 
            context={context}
            onComplete={() => setTypingComplete(true)}
            forceShowFull={forceShowFull}
            isDrivingActive={currentState === 'driving'}
          />
          
          {/* Choices */}
          <View style={styles.choicesContainer}>
            {choices.map((choice, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.choiceBtn}
                onPress={() => {
                  if (choice.action === 'RESTART') {
                    setDrivingDistance(500);
                    setTypingComplete(false);
                    send({ type: 'RESTART' });
                  } else {
                    send({ type: choice.action });
                  }
                }}
                disabled={!typingComplete && currentState !== 'engineStall'}
              >
                <Text style={styles.choiceText}>{choice.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Dashboard (Simplified) */}
      <CyberpunkDashboard currentState={currentState} distance={drivingDistance} logs={context.logs} />
      
      {/* Virtual Mobile */}
      <VirtualMobile notification={context.notification} parkedHours={context.parkedHours} />

      {/* Payment Input Overlay */}
      {currentState === 'paymentInput' && (
        <View style={styles.emailContainer}>
          <Text style={styles.emailLabel}>📧 輸入您的電子信箱以接收帳單</Text>
          <TextInput
            style={styles.emailInput}
            placeholder="請輸入 Email..."
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity 
            style={[styles.submitBtn, { opacity: email ? 1 : 0.5 }]} 
            disabled={!email}
            onPress={() => send({ type: 'SUBMIT_EMAIL', email })}
          >
            <Text style={styles.submitText}>確認傳送</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => send({ type: 'BACK' })}
          >
            <Text style={styles.cancelText}>返回</Text>
          </TouchableOpacity>
        </View>
      )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default App; // Fix export declaration

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  gameArea: {
    flex: 2,
    padding: 10,
  },
  screen: {
    flex: 1,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#0ff',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundPlaceholder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  sceneIcon: {
    fontSize: 80,
    marginBottom: 10,
    opacity: 0.6,
  },
  sceneName: {
    color: '#888',
    fontSize: 16,
    opacity: 0.7,
    fontWeight: 'bold',
  },
  bgText: { color: '#555', fontSize: 20 },
  characterPlaceholder: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  charEmoji: { 
    fontSize: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  charText: { color: '#fff' },
  dialogueBox: {
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 2,
    borderColor: '#f0f',
    padding: 10,
  },
  typewriterContainer: {
    flex: 1,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cursor: {
    color: '#0f0',
    fontSize: 16,
  },
  choicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  choiceBtn: {
    backgroundColor: '#06b6d4',
    padding: 10,
    borderRadius: 5,
    margin: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  choiceText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#001',
    borderTopWidth: 2,
    borderTopColor: '#0f0',
    padding: 10,
  },
  dashboardText: {
    color: '#0f0',
    fontFamily: 'monospace',
  },
  emailContainer: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0ff',
    alignItems: 'center',
    zIndex: 100,
  },
  emailLabel: {
    color: '#0ff',
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  emailInput: {
    backgroundColor: '#222',
    color: '#fff',
    width: '100%',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#555',
    marginBottom: 20,
    fontSize: 16,
  },
  cancelBtn: {
    padding: 10,
    marginTop: 10,
  },
  cancelText: {
    color: '#888',
    textDecorationLine: 'underline',
  },
  submitBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mobileContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: 200,
  },
  mobileText: {
    color: '#000',
  },
  qteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  qteTitle: {
    color: '#f00',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qteSequence: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  qteArrow: {
    fontSize: 40,
    color: '#555',
    marginHorizontal: 10,
  },
  qteArrowActive: {
    color: '#ff0',
    transform: [{ scale: 1.2 }],
  },
  qteArrowDone: {
    color: '#0f0',
  },
  qteControls: {
    alignItems: 'center',
  },
  qteRow: {
    flexDirection: 'row',
  },
  qteBtn: {
    width: 60,
    height: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#fff',
  },
  qteBtnText: {
    color: '#fff',
    fontSize: 24,
  },
});
