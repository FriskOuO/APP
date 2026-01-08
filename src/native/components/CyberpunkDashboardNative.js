import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const CyberpunkDashboardNative = ({ currentState, distance, logs = [] }) => {
  const scrollViewRef = useRef();

  // Auto-scroll logs
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [logs]);

  // State display mapping
  const stateLabels = {
    'start': '🌐 系統載入',
    'intro1': '序章：加班',
    'intro2': '序章：傳送',
    'intro3': '序章：異世界',
    'introStory1': '序章：載入中 (1/3)',
    'introStory2': '序章：載入中 (2/3)',
    'introStory3': '序章：載入中 (3/3)',
    'inCar': '車內待命',
    'qteSequence': 'QTE挑戰中',
    'engineStall': '引擎熄火',
    'driving': '駕駛中',
    'atGate': '閘門前',
    'gateOpening': '閘門開啟',
    'parked': '已停車',
    'interactCat': '🐱 遭遇迷因貓',
    'interactSpaghetti': '🍝 義大利麵',
    'interactExit': '🧱 地圖邊界',
    'endingBlackHole': '🌌 結局：黑洞',
    'endingCatChaos': '😵 結局：混亂',
    'endingSpaghettiDance': '💃 結局：熱舞',
    'endingAdmin': '👮 結局：封鎖',
    'endingBSOD': '💀 結局：當機',
    'paymentNarrative': '繳費說明',
    'paymentInput': '📧 輸入信箱',
    'sendingEmail': '📨 發送中',
    'finished': '🎉 遊戲結束',
    'inputEmail': '輸入信箱',
    'ntpPing': 'NTP 連接中',
    'ntpSync': 'NTP 同步中',
    'paymentInfo': '待繳費',
    'paymentSuccess': '繳費完成'
  };

  const distancePercent = Math.min((distance / 500) * 100, 100);

  const getWarningStatus = (dist, state) => {
    if (state === 'parked') {
      return { level: 'completed', color: '#05d9e8', label: '🎉 已停車' };
    }
    if (state === 'start') {
      return { level: 'loading', color: '#05d9e8', label: '🌐 系統載入中' };
    }
    if (state === 'inCar' || state === 'qteSequence' || state === 'engineStall') {
      return { level: 'ready', color: '#00ff88', label: '🚗 車輛待命' };
    }
    if (state === 'interactCat' || state === 'interactSpaghetti' || state === 'interactExit') {
      return { level: 'interact', color: '#00ff88', label: '🎮 互動中' };
    }
    if (state === 'endingBlackHole' || state === 'endingCatChaos' || 
        state === 'endingSpaghettiDance' || state === 'endingAdmin' || state === 'endingBSOD') {
      return { level: 'ending', color: '#ff2a6d', label: '🌀 異常事件' };
    }
    if (state === 'paymentNarrative' || state === 'paymentInput' || state === 'sendingEmail' ||
        state === 'ntpPing' || state === 'ntpSync' || state === 'finished' ||
        state === 'paymentInfo' || state === 'inputEmail' || state === 'paymentSuccess') {
      return { level: 'system', color: '#05d9e8', label: state === 'finished' ? '🎮 遊戲結束' : '💳 系統處理中' };
    }
    
    if (dist <= 50) {
      return { level: 'danger', color: '#ff0000', label: '⚠️ 危險' };
    } else if (dist <= 150) {
      return { level: 'warning', color: '#ff8800', label: '⚡ 注意' };
    } else if (dist <= 300) {
      return { level: 'caution', color: '#ffff00', label: '👀 小心' };
    } else {
      return { level: 'safe', color: '#00ff00', label: '✅ 安全' };
    }
  };

  const warningStatus = getWarningStatus(distance, currentState);

  return (
    <View style={styles.dashboardPanel}>
      <View style={styles.dashboardHeader}>
        <Text style={styles.headerText}>// 系統監控面板 // 版本 v2.0.45</Text>
      </View>
      
      <View style={styles.dashboardContent}>
        {/* System Status */}
        <View style={styles.statusModule}>
          <Text style={styles.moduleLabel}>系統狀態</Text>
          <Text style={[styles.moduleValue, { color: warningStatus.color }]}>
            {currentState === 'parked' || currentState === 'start' || 
             currentState === 'inCar' || currentState === 'qteSequence' || currentState === 'engineStall'
              ? stateLabels[currentState] || currentState
              : (currentState === 'interactCat' || currentState === 'interactSpaghetti' || 
                 currentState === 'interactExit' || currentState.startsWith('ending') ||
                 currentState === 'paymentNarrative' || currentState === 'paymentInput' || 
                 currentState === 'sendingEmail' || currentState === 'finished' ||
                 currentState === 'ntpPing' || currentState === 'ntpSync' || 
                 currentState === 'paymentInfo' || currentState === 'inputEmail' || 
                 currentState === 'paymentSuccess')
              ? stateLabels[currentState] || warningStatus.label
              : warningStatus.label}
          </Text>
        </View>

        {/* Sensor Data */}
        <View style={[styles.statusModule, { borderColor: warningStatus.color }]}>
          <Text style={styles.moduleLabel}>距離感測模組</Text>
          <View style={styles.distanceRow}>
            <Text style={[styles.distanceValue, { color: warningStatus.color }]}>
              {distance} 公分
            </Text>
            <Text style={{ color: warningStatus.color, fontSize: 12 }}>
              {currentState === 'parked' ? '已停' : warningStatus.label}
            </Text>
          </View>
          <View style={styles.healthBarContainer}>
            <View 
              style={[
                styles.healthBarFill, 
                { 
                  width: `${distancePercent}%`,
                  backgroundColor: warningStatus.color
                }
              ]} 
            />
          </View>
        </View>

        {/* Logs Console */}
        <ScrollView 
          style={styles.logsConsole} 
          ref={scrollViewRef}
          nestedScrollEnabled={true}
        >
          {logs.slice().reverse().map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <Text style={styles.logTimestamp}>
                [{new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}]
              </Text>
              <Text style={styles.logText}>
                {log.text}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardPanel: {
    flex: 1,
    backgroundColor: '#000',
    borderTopWidth: 2,
    borderTopColor: '#0ff',
    padding: 10,
  },
  dashboardHeader: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
  },
  headerText: {
    color: '#555',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  dashboardContent: {
    flex: 1,
  },
  statusModule: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  moduleLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  moduleValue: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  distanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  healthBarContainer: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
  },
  logsConsole: {
    flex: 1,
    backgroundColor: '#111',
    padding: 5,
    borderRadius: 5,
    maxHeight: 150,
  },
  logEntry: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  logTimestamp: {
    color: '#666',
    fontSize: 10,
    marginRight: 5,
    fontFamily: 'monospace',
  },
  logText: {
    color: '#0f0',
    fontSize: 10,
    fontFamily: 'monospace',
    flex: 1,
  },
});

export default CyberpunkDashboardNative;
