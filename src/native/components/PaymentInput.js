import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

const PaymentInput = ({ email, setEmail, send }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});

export default PaymentInput;
