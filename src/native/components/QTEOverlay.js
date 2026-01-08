import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const QTEOverlay = ({ context, handleQTEPress }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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

export default QTEOverlay;
