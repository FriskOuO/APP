import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import QTEOverlay from './QTEOverlay';

const Screen = ({ context, currentState, handleQTEPress, BACKGROUND_SOURCES }) => {
  return (
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

      {currentState === 'qteSequence' && <QTEOverlay context={context} handleQTEPress={handleQTEPress} />}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default Screen;
