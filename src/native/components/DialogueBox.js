import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import TypewriterText from './TypewriterText';

const DialogueBox = ({ context, setTypingComplete, forceShowFull, currentState, choices, setDrivingDistance, send }) => {
  return (
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
            disabled={!setTypingComplete && currentState !== 'engineStall'}
          >
            <Text style={styles.choiceText}>{choice.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dialogueBox: {
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 2,
    borderColor: '#f0f',
    padding: 10,
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
});

export default DialogueBox;
