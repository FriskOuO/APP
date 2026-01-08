import React, { useState, useEffect, useRef } from 'react';
import '../../native/components/VisualNovel.css';

/**
 * Web-specific SceneDisplay Component
 * Uses public/assets/ paths for images
 */
export const SceneDisplay = ({ background, character, gameState, onTutorialComplete, onVideoComplete, context }) => {
  console.log('🎬 [SceneDisplay] Component rendering with props:', {
    background,
    character,
    gameState,
    hasContext: !!context
  });
  
  const backgroundClass = `scene-display scene-${background}`;
  const spaghettiVideoRef = useRef(null);
  const [chaosElements, setChaosElements] = useState([]);

  // Generate Chaos Elements for Remix Ending
  useEffect(() => {
    if (gameState === 'endingCatChaos') {
      const elements = Array.from({ length: 50 }).map((_, i) => {
        const r = Math.random();
        let src = require('../../../assets/oiia-cat.gif');
        if (r > 0.66) src = require('../../../assets/spaghetti.png');
        else if (r > 0.33) src = require('../../../assets/protagonist.png');

        return {
          id: i,
          src: src,
          top: Math.random() * 100,
          left: Math.random() * 100,
          scale: 0.2 + Math.random() * 2.8,
          duration: 0.5 + Math.random() * 0.5,
          delay: Math.random() * 2,
          direction: Math.random() > 0.5 ? 'normal' : 'reverse',
          zIndex: Math.floor(Math.random() * 10)
        };
      });
      setChaosElements(elements);
    } else {
      setChaosElements([]);
    }
  }, [gameState]);

  // Video Volume Control
  useEffect(() => {
    if (gameState === 'endingSpaghettiDance' && spaghettiVideoRef.current) {
      spaghettiVideoRef.current.volume = 0.25;
      spaghettiVideoRef.current.play().catch(e => console.error("Video play failed", e));
    }
  }, [gameState]);

  // Audio Effect for Remix Ending
  useEffect(() => {
    if (gameState === 'endingCatChaos') {
      const audio = new Audio(require('../../../assets/SPAGETTI_OIIA.mp3'));
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Audio play failed", e));
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [gameState]);

  // Audio Effect for Black Hole Ending
  useEffect(() => {
    if (gameState === 'endingBlackHole') {
      const audio = new Audio(require('../../../assets/OIIAOIIA_CAT_SOUND.mp3'));
      audio.volume = 1.0;
      audio.currentTime = 0;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log('OIIA sound started playing'))
          .catch(e => console.error("Audio play failed", e));
      }

      const timer = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 7000);

      return () => {
        clearTimeout(timer);
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [gameState]);

  // Get scene image path from public/assets/
  const getSceneImage = () => {
    console.log('🖼️ [SceneDisplay] Getting image for:', {
      background,
      character,
      gameState,
      contextHasSpaghetti: context?.hasSpaghetti
    });

    // Background mapping
    if (background && background !== 'narrator') {
      const backgroundMap = {
        'parking-lot': require('../../../assets/parking_lot.png'),
        'teach': require('../../../assets/teach.png'),
        'car-interior': require('../../../assets/car.png'),
        'blue-screen': require('../../../assets/bsod.png'),
        'oiia-cat': require('../../../assets/oiia-cat.gif'),
        'protagonist': require('../../../assets/protagonist.png'),
        'moving-car': require('../../../assets/moving_car.png'),
        'street-cat': require('../../../assets/oiia_cat.png'),
        'spaghetti': require('../../../assets/spaghetti.png'),
        'spaghetti-eaten': require('../../../assets/spaghetti_eaten.png'),
        'spaghetti-dance': require('../../../assets/spaghetti.png'),
        'hand-touching': require('../../../assets/hand_touching.png'),
        'mysterious-man': require('../../../assets/mysterious.png'),
        'static-noise': require('../../../assets/parking_lot.png'),
        'railing-closed': require('../../../assets/railing.png'),
        'railing-opening': require('../../../assets/railing_opening.png')
      };
      
      if (backgroundMap[background]) {
        console.log('✅ [SceneDisplay] Using background:', background, '→', backgroundMap[background]);
        return backgroundMap[background];
      } else {
        console.warn('⚠️ [SceneDisplay] Background not found in map:', background);
      }
    }

    // Character mapping
    if (character && character !== 'narrator') {
      const characterMap = {
        'street-cat': require('../../../assets/oiia_cat.png'),
        'oiia-cat': require('../../../assets/oiia_cat.png'),
        'oiia-cat-gif': require('../../../assets/oiia-cat.gif'),
        'spaghetti': require('../../../assets/spaghetti.png'),
        'spaghetti-eaten': require('../../../assets/spaghetti_eaten.png'),
        'spaghetti_eaten': require('../../../assets/spaghetti_eaten.png'),
        'hand-touching': require('../../../assets/hand_touching.png'),
        'protagonist': require('../../../assets/protagonist.png'),
        'mysterious-man': require('../../../assets/mysterious.png'),
        'car': require('../../../assets/car.png'),
        'parking-lot': require('../../../assets/parking_lot.png'),
        'teach': require('../../../assets/teach.png')
      };
      
      if (characterMap[character]) {
        console.log('✅ [SceneDisplay] Using character:', character, '→', characterMap[character]);
        return characterMap[character];
      } else {
        console.warn('⚠️ [SceneDisplay] Character not found in map:', character);
      }
    }

    // Game state mapping
    console.log('🎯 [SceneDisplay] Using gameState fallback:', gameState);
    switch (gameState) {
      case 'DRIVING':
      case 'driving':
        return require('../../../assets/moving_car.png');
      case 'ATGATE':
      case 'atGate':
        return require('../../../assets/railing.png');
      case 'ATGATE_OPEN':
      case 'gateOpening':
        return require('../../../assets/railing_opening.png');
      case 'endingBlackHole':
        return require('../../../assets/oiia-cat.gif');
      case 'endingSpaghettiDance':
        return require('../../../assets/spaghetti.png');
      case 'endingAdmin':
        return require('../../../assets/mysterious.png');
      case 'endingCatChaos':
        return require('../../../assets/oiia-cat.gif');
      case 'endingBSOD':
        return require('../../../assets/bsod.png');
      case 'interactCat':
        return require('../../../assets/oiia_cat.png');
      case 'interactSpaghetti':
        return context && context.hasSpaghetti ? require('../../../assets/spaghetti_eaten.png') : require('../../../assets/spaghetti.png');
      case 'interactExit':
        return require('../../../assets/hand_touching.png');
      case 'inCar':
      case 'engineStall':
        return require('../../../assets/car.png');
      case 'qteSequence':
        return require('../../../assets/teach.png');
      default:
        console.log('📍 [SceneDisplay] Using default parking lot image');
        return require('../../../assets/parking_lot.png');
    }
  };

  const getAnimationClass = () => {
    if (gameState === 'endingCatChaos') return 'scale-pulse';
    if (gameState === 'endingBlackHole') return 'spin-slow';
    return '';
  };

  const imagePath = getSceneImage();
  console.log('🎨 [SceneDisplay] Final image path:', imagePath);
  console.log('🎬 [SceneDisplay] Animation class:', getAnimationClass());

  return (
    <div className={backgroundClass} style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
      {/* Chaos Background Layer */}
      {gameState === 'endingCatChaos' && chaosElements.map(el => (
        <img
          key={el.id}
          src={el.src}
          alt="chaos"
          className="super-chaos-spin"
          style={{
            position: 'absolute',
            top: `${el.top}%`,
            left: `${el.left}%`,
            width: `${100 * el.scale}px`,
            height: `${100 * el.scale}px`,
            objectFit: 'contain',
            animationDuration: `${el.duration}s`,
            animationDelay: `-${el.delay}s`,
            animationDirection: el.direction,
            opacity: 0.8,
            zIndex: el.zIndex
          }}
        />
      ))}

      <div className="character-sprite" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 20 }}>
        {gameState === 'endingSpaghettiDance' ? (
          <video 
            ref={spaghettiVideoRef}
            src={require('../../../assets/SPAGHETTI_DANCE.mp4')}
            autoPlay
            muted={false}
            playsInline
            onError={(e) => console.error('Video error:', e)}
            onLoadedData={() => console.log('Video loaded successfully')}
            onTimeUpdate={(e) => {
              if (e.target.currentTime >= 29) {
                e.target.pause();
                onVideoComplete && onVideoComplete();
              }
            }}
            className="w-full h-full object-cover"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              maxWidth: '800px'
            }}
          />
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src={imagePath}
              alt="Main Scene"
              className={getAnimationClass()}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: gameState === 'endingBSOD' ? 'fill' : 'contain',
                maxHeight: '100%',
                maxWidth: '100%'
              }}
              onLoad={() => console.log('✅ [SceneDisplay] Image loaded successfully:', imagePath)}
              onError={(e) => {
                console.error('❌ [SceneDisplay] Image failed to load:', imagePath);
                console.error('❌ [SceneDisplay] Error details:', e);
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
