import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';

const VirtualMobile = ({ notification, parkedHours }) => {
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (notification) {
      setCurrentNotification(notification);
      setVisible(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000); // 5 seconds duration
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!visible || !currentNotification) return null;

  return (
    <View style={styles.mobileContainer}>
      <Text style={styles.mobileTitle}>{currentNotification.title}</Text>
      <Text style={styles.mobileText}>{currentNotification.body || currentNotification.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mobileContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 12,
    width: 250,
    boxShadow: '0 2px 3.84px rgba(0, 0, 0, 0.25)',
    elevation: 5,
    zIndex: 200, // Ensure it's on top
    borderLeftWidth: 5,
    borderLeftColor: '#22d3ee'
  },
  mobileTitle: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4
  },
  mobileText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20
  },
});

export default VirtualMobile;
