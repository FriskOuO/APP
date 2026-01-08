import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

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

const styles = StyleSheet.create({
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
});

export default TypewriterText;
