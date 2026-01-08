import { StyleSheet } from 'react-native';

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
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.75)',
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
});

export default styles;
