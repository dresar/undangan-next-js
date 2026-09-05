'use client';

import React, { useEffect, useRef } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertySelect, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';
import { ANIMATION_PRESETS, AnimationType, AnimationMode } from '@/lib/imageAnimations';

interface AnimasiTabProps {
  block: Block;
  updateAnimation: (updates: Partial<Block['animation']>) => void;
}

const AnimationPreview: React.FC<{ 
  animationType: AnimationType; 
  animationMode: AnimationMode;
  duration: number;
  delay: number;
}> = ({ animationType, animationMode, duration, delay }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!previewRef.current || !window.gsap || animationType === 'none') {
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
      return;
    }
    
    if (animationRef.current) {
      animationRef.current.kill();
    }
    
    const gsap = window.gsap;
    const dur = duration / 1000;
    const del = delay / 1000;

    let timeline: any = null;
    
    if (animationMode === 'entrance') {
      switch (animationType) {
        case 'fadeIn':
          timeline = gsap.fromTo(previewRef.current, { opacity: 0 }, { opacity: 1, duration: dur, delay: del });
          break;
        case 'slideInLeft':
          timeline = gsap.fromTo(previewRef.current, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: dur, delay: del });
          break;
        case 'slideInRight':
          timeline = gsap.fromTo(previewRef.current, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: dur, delay: del });
          break;
        case 'slideInUp':
          timeline = gsap.fromTo(previewRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: dur, delay: del });
          break;
        case 'slideInDown':
          timeline = gsap.fromTo(previewRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: dur, delay: del });
          break;
        case 'zoomIn':
          timeline = gsap.fromTo(previewRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: dur, delay: del });
          break;
        case 'zoomOut':
          timeline = gsap.fromTo(previewRef.current, { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: dur, delay: del });
          break;
        case 'flipIn':
          timeline = gsap.fromTo(previewRef.current, { rotationY: -90, opacity: 0 }, { rotationY: 0, opacity: 1, duration: dur, delay: del });
          break;
        case 'rotateIn':
          timeline = gsap.fromTo(previewRef.current, { rotation: -180, opacity: 0 }, { rotation: 0, opacity: 1, duration: dur, delay: del });
          break;
        case 'bounceIn':
          timeline = gsap.fromTo(previewRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: dur, delay: del, ease: 'bounce.out' });
          break;
        case 'elasticIn':
          timeline = gsap.fromTo(previewRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: dur, delay: del, ease: 'elastic.out(1, 0.3)' });
          break;
        case 'backIn':
          timeline = gsap.fromTo(previewRef.current, { scale: 0.8, x: -30, opacity: 0 }, { scale: 1, x: 0, opacity: 1, duration: dur, delay: del, ease: 'back.out(1.7)' });
          break;
        case 'flipInX':
          timeline = gsap.fromTo(previewRef.current, { rotationX: 90, opacity: 0 }, { rotationX: 0, opacity: 1, duration: dur, delay: del });
          break;
        case 'flipInY':
          timeline = gsap.fromTo(previewRef.current, { rotationY: 90, opacity: 0 }, { rotationY: 0, opacity: 1, duration: dur, delay: del });
          break;
        case 'slideInDiagonal':
          timeline = gsap.fromTo(previewRef.current, { x: -40, y: -40, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: dur, delay: del });
          break;
        case 'scaleIn':
          timeline = gsap.fromTo(previewRef.current, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: dur, delay: del, ease: 'back.out(1.7)' });
          break;
        default:
          break;
      }
    } else {
      switch (animationType) {
        case 'float':
          timeline = gsap.to(previewRef.current, { y: -15, duration: dur, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'sway':
          timeline = gsap.to(previewRef.current, { rotation: 5, duration: dur, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del, transformOrigin: 'center bottom' });
          break;
        case 'pulse':
          timeline = gsap.to(previewRef.current, { scale: 1.1, duration: dur, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'bounce':
          timeline = gsap.to(previewRef.current, { y: -20, duration: dur * 0.5, ease: 'power2.out', yoyo: true, repeat: -1, delay: del });
          break;
        case 'shake':
          timeline = gsap.to(previewRef.current, { x: 8, duration: 0.1, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'swing':
          timeline = gsap.to(previewRef.current, { rotation: 12, duration: dur, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del, transformOrigin: 'top center' });
          break;
        case 'wave':
          timeline = gsap.to(previewRef.current, { rotation: 6, y: -10, duration: dur * 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'glow':
          timeline = gsap.to(previewRef.current, { opacity: 0.7, filter: 'brightness(1.2)', duration: dur, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'rotate':
          timeline = gsap.to(previewRef.current, { rotation: 360, duration: dur * 2, ease: 'none', repeat: -1, delay: del });
          break;
        case 'zoom':
          timeline = gsap.to(previewRef.current, { scale: 1.1, duration: dur, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'treeSway':
          timeline = gsap.to(previewRef.current, { rotation: 6, duration: dur * 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: del, transformOrigin: 'center bottom' });
          break;
        case 'drift':
          timeline = gsap.to(previewRef.current, { x: 20, y: -15, duration: dur * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'wobble':
          timeline = gsap.to(previewRef.current, { rotation: 2, x: 3, duration: 0.15, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'tremble':
          timeline = gsap.to(previewRef.current, { x: 2, y: 2, duration: 0.08, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'sparkle':
          timeline = gsap.to(previewRef.current, { opacity: 0.6, filter: 'brightness(1.5)', duration: 0.5, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'breath':
          timeline = gsap.to(previewRef.current, { scale: 1.05, duration: dur * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'rock':
          timeline = gsap.to(previewRef.current, { rotation: 8, duration: dur * 0.8, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del, transformOrigin: 'center bottom' });
          break;
        case 'twist':
          timeline = gsap.to(previewRef.current, { rotation: 10, scaleX: 1.1, duration: dur * 0.9, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        case 'elastic':
          timeline = gsap.to(previewRef.current, { scale: 1.15, duration: dur * 0.6, ease: 'elastic.out(1, 0.3)', yoyo: true, repeat: -1, delay: del });
          break;
        case 'rubber':
          timeline = gsap.to(previewRef.current, { scaleX: 1.1, scaleY: 0.9, duration: dur * 0.7, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: del });
          break;
        default:
          break;
      }
    }
    
    animationRef.current = timeline;

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
      if (previewRef.current && window.gsap) {
        window.gsap.killTweensOf(previewRef.current);
      }
    };
  }, [animationType, animationMode, duration, delay]);

  if (animationType === 'none') {
    return (
      <div
        style={{
          width: '100%',
          height: '100px',
          background: '#3a3a3a',
          border: '2px dashed #4a4a4a',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '12px',
        }}
      >
        Tidak ada animasi
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100px',
        background: '#1f1f1f',
        border: '2px solid #4a4a4a',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        ref={previewRef}
        style={{
          width: '70px',
          height: '70px',
          background: 'linear-gradient(135deg, #ff6b35 0%, #764ba2 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '32px',
          fontWeight: 'bold',
          boxShadow: '0 4px 16px rgba(255, 107, 53, 0.4)',
        }}
      >
        A
      </div>
    </div>
  );
};

export const AnimasiTab: React.FC<AnimasiTabProps> = ({
  block,
  updateAnimation,
}) => {
  const animationType = (block.animation?.type as AnimationType) || 'none';
  const animationMode = (block.animation?.mode as AnimationMode) || 'entrance';
  const duration = block.animation?.duration || 2000;
  const delay = block.animation?.delay || 0;
  const easing = block.animation?.easing || 'power1.inOut';

  const entranceAnimations = ANIMATION_PRESETS.filter(p => p.category === 'entrance');
  const continuousAnimations = ANIMATION_PRESETS.filter(p => p.category === 'continuous');

  return (
    <>
      <PropertySection>
        <PropertyLabel>Mode Animasi</PropertyLabel>
        <PropertySelect
          value={animationMode}
          onChange={(e) => {
            const newMode = e.target.value as AnimationMode;
            const defaultType = newMode === 'entrance' ? 'fadeIn' : 'float';
            updateAnimation({
              mode: newMode,
              type: animationType === 'none' ? defaultType : animationType,
            });
          }}
        >
          <option value="entrance">Animasi Masuk (Sekali)</option>
          <option value="continuous">Animasi Tetap (Terus Menerus)</option>
        </PropertySelect>
        <PropertyNote>
          Animasi Masuk hanya sekali saat halaman dimuat. Animasi Tetap berulang terus menerus.
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Tipe Animasi</PropertyLabel>
        <PropertySelect
          value={animationType}
          onChange={(e) => {
            updateAnimation({ type: e.target.value as AnimationType });
          }}
        >
          <option value="none">Tidak Ada Animasi</option>
          {animationMode === 'entrance' ? (
            entranceAnimations.filter(p => p.value !== 'none').map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))
          ) : (
            continuousAnimations.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))
          )}
        </PropertySelect>
      </PropertySection>

      <PropertySection>
        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
          <PropertyLabel style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
            Preview Animasi:
          </PropertyLabel>
          <AnimationPreview 
            animationType={animationType} 
            animationMode={animationMode}
            duration={duration}
            delay={delay}
          />
        </div>
      </PropertySection>

      <PropertySection>
        <Slider
          label={`Durasi: ${(duration / 1000).toFixed(1)}s`}
          value={duration / 100}
          onChange={(v) => updateAnimation({ duration: v * 100 })}
          min={100}
          max={10000}
        />
        <PropertyNote>
          Durasi animasi dalam detik. Untuk animasi tetap, durasi lebih pendek = lebih cepat.
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <Slider
          label={`Delay: ${(delay / 1000).toFixed(1)}s`}
          value={delay / 100}
          onChange={(v) => updateAnimation({ delay: v * 100 })}
          min={0}
          max={5000}
        />
        <PropertyNote>
          Waktu tunggu sebelum animasi dimulai.
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Easing</PropertyLabel>
        <PropertySelect
          value={easing}
          onChange={(e) => updateAnimation({ easing: e.target.value })}
        >
          <option value="power1.inOut">Power 1 InOut</option>
          <option value="power2.inOut">Power 2 InOut</option>
          <option value="power3.inOut">Power 3 InOut</option>
          <option value="sine.inOut">Sine InOut</option>
          <option value="expo.inOut">Expo InOut</option>
          <option value="back.inOut">Back InOut</option>
          <option value="elastic.inOut">Elastic InOut</option>
          <option value="bounce.inOut">Bounce InOut</option>
        </PropertySelect>
        <PropertyNote>
          Fungsi easing mengontrol kecepatan animasi. Power 1 = halus, Power 3 = lebih dramatis.
        </PropertyNote>
      </PropertySection>
    </>
  );
};
