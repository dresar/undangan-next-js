declare global {
  interface Window {
    gsap: any;
  }
}

export type AnimationType = 
  | 'none'
  | 'float'
  | 'sway'
  | 'treeSway'
  | 'pulse'
  | 'bounce'
  | 'shake'
  | 'swing'
  | 'wave'
  | 'glow'
  | 'rotate'
  | 'zoom'
  | 'drift'
  | 'wobble'
  | 'tremble'
  | 'sparkle'
  | 'breath'
  | 'rock'
  | 'twist'
  | 'elastic'
  | 'rubber'
  | 'fadeIn'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideInUp'
  | 'slideInDown'
  | 'zoomIn'
  | 'zoomOut'
  | 'flipIn'
  | 'rotateIn'
  | 'bounceIn'
  | 'elasticIn'
  | 'backIn'
  | 'flipInX'
  | 'flipInY'
  | 'slideInDiagonal'
  | 'scaleIn';

export type AnimationMode = 'entrance' | 'continuous';

export interface AnimationConfig {
  type: AnimationType;
  mode: AnimationMode;
  duration?: number;
  delay?: number;
  repeat?: number;
  ease?: string;
}

export function applyImageAnimation(
  element: HTMLElement | null,
  config: AnimationConfig,
  preserveTransform?: string
): () => void {
  if (!element || !window.gsap || config.type === 'none') {
    if (element && window.gsap) {
      const currentTransform = element.style.transform || '';
      const hasTransform = currentTransform && currentTransform !== 'none' && currentTransform.includes('rotate');
      
      if (!hasTransform) {
        window.gsap.set(element, { clearProps: 'x,y,rotation,scale,opacity' });
      } else {
        window.gsap.set(element, { clearProps: 'x,y,scale,opacity' });
      }
    }
    return () => {};
  }

  const gsap = window.gsap;
  const duration = config.duration || 2;
  const delay = config.delay || 0;
  const ease = config.ease || 'power1.inOut';

  let timeline: any = null;
  
  const elementTransform = (element as HTMLElement).style.transform || '';
  const transformToUse = preserveTransform || elementTransform;
  const currentRotationMatch = transformToUse.match(/rotate\(([^)]+)\)/);
  const currentRotation = currentRotationMatch ? parseFloat(currentRotationMatch[1].replace('deg', '')) : 0;
  const hasRotation = currentRotation !== 0 && !isNaN(currentRotation);
  
  const extractScaleX = (transform: string): number => {
    if (!transform || transform === 'none') return 1;
    const match = transform.match(/scaleX\(([^)]+)\)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      return isNaN(parsed) ? 1 : parsed;
    }
    return 1;
  };
  
  const extractScaleY = (transform: string): number => {
    if (!transform || transform === 'none') return 1;
    const match = transform.match(/scaleY\(([^)]+)\)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      return isNaN(parsed) ? 1 : parsed;
    }
    return 1;
  };
  
  const currentScaleX = extractScaleX(transformToUse);
  const currentScaleY = extractScaleY(transformToUse);

  if (config.mode === 'entrance') {
    switch (config.type) {
      case 'fadeIn':
        timeline = gsap.fromTo(element, 
          { opacity: 0 },
          { opacity: 1, duration, delay, ease }
        );
        break;
      case 'slideInLeft':
        timeline = gsap.fromTo(element,
          { x: -100, opacity: 0 },
          { x: 0, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'x' });
          }}
        );
        break;
      case 'slideInRight':
        timeline = gsap.fromTo(element,
          { x: 100, opacity: 0 },
          { x: 0, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'x' });
          }}
        );
        break;
      case 'slideInUp':
        timeline = gsap.fromTo(element,
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'y' });
          }}
        );
        break;
      case 'slideInDown':
        timeline = gsap.fromTo(element,
          { y: -100, opacity: 0 },
          { y: 0, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'y' });
          }}
        );
        break;
      case 'zoomIn':
        timeline = gsap.fromTo(element,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'scale' });
          }}
        );
        break;
      case 'zoomOut':
        timeline = gsap.fromTo(element,
          { scale: 2, opacity: 0 },
          { scale: 1, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'scale' });
          }}
        );
        break;
      case 'flipIn':
        timeline = gsap.fromTo(element,
          { rotationY: -90, opacity: 0 },
          { rotationY: 0, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'rotationY' });
          }}
        );
        break;
      case 'rotateIn':
        const rotateInBaseRotation = hasRotation ? currentRotation : 0;
        timeline = gsap.fromTo(element,
          { rotation: rotateInBaseRotation - 180, opacity: 0 },
          { rotation: rotateInBaseRotation, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'rotation' });
          }}
        );
        break;
      case 'bounceIn':
        timeline = gsap.fromTo(element,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration, delay, ease: 'bounce.out' }
        );
        break;
      case 'elasticIn':
        timeline = gsap.fromTo(element,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration, delay, ease: 'elastic.out(1, 0.3)' }
        );
        break;
      case 'backIn':
        timeline = gsap.fromTo(element,
          { scale: 0.8, x: -50, opacity: 0 },
          { scale: 1, x: 0, opacity: 1, duration, delay, ease: 'back.out(1.7)', onComplete: () => {
            gsap.set(element, { clearProps: 'x,scale' });
          }}
        );
        break;
      case 'flipInX':
        timeline = gsap.fromTo(element,
          { rotationX: 90, opacity: 0 },
          { rotationX: 0, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'rotationX' });
          }}
        );
        break;
      case 'flipInY':
        timeline = gsap.fromTo(element,
          { rotationY: 90, opacity: 0 },
          { rotationY: 0, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'rotationY' });
          }}
        );
        break;
      case 'slideInDiagonal':
        timeline = gsap.fromTo(element,
          { x: -100, y: -100, opacity: 0 },
          { x: 0, y: 0, opacity: 1, duration, delay, ease, onComplete: () => {
            gsap.set(element, { clearProps: 'x,y' });
          }}
        );
        break;
      case 'scaleIn':
        timeline = gsap.fromTo(element,
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration, delay, ease: 'back.out(1.7)', onComplete: () => {
            gsap.set(element, { clearProps: 'scale' });
          }}
        );
        break;
      default:
        return () => {};
    }
  } else {
    switch (config.type) {
      case 'float':
        gsap.set(element, { y: 0 });
        timeline = gsap.to(element, {
          y: -20,
          duration,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'sway':
        const swayBaseRotation = hasRotation ? currentRotation : 0;
        timeline = gsap.to(element, {
          rotation: swayBaseRotation + 5,
          duration,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay,
          transformOrigin: 'center bottom',
          onUpdate: () => {
            if (hasRotation || currentScaleX !== 1 || currentScaleY !== 1) {
              const currentGSAPRotation = gsap.getProperty(element, 'rotation') || 0;
              const parts: string[] = [`rotate(${currentGSAPRotation}deg)`];
              if (currentScaleX !== 1) parts.push(`scaleX(${currentScaleX})`);
              if (currentScaleY !== 1) parts.push(`scaleY(${currentScaleY})`);
              (element as HTMLElement).style.transform = parts.join(' ');
            }
          }
        });
        break;
      case 'pulse':
        gsap.set(element, { scale: 1 });
        timeline = gsap.to(element, {
          scale: 1.1,
          duration,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'bounce':
        gsap.set(element, { y: 0 });
        timeline = gsap.to(element, {
          y: -30,
          duration: duration * 0.5,
          ease: 'power2.out',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'shake':
        gsap.set(element, { x: 0 });
        timeline = gsap.to(element, {
          x: 10,
          duration: 0.1,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'swing':
        timeline = gsap.to(element, {
          rotation: 15,
          duration,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay,
          transformOrigin: 'top center'
        });
        break;
      case 'wave':
        gsap.set(element, { y: 0, rotation: 0 });
        timeline = gsap.to(element, {
          rotation: 8,
          y: -15,
          duration: duration * 0.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'glow':
        timeline = gsap.to(element, {
          opacity: 0.7,
          filter: 'brightness(1.2)',
          duration,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'rotate':
        timeline = gsap.to(element, {
          rotation: 360,
          duration: duration * 2,
          ease: 'none',
          repeat: -1,
          delay
        });
        break;
      case 'zoom':
        gsap.set(element, { scale: 1 });
        timeline = gsap.to(element, {
          scale: 1.15,
          duration,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'treeSway':
        timeline = gsap.to(element, {
          rotation: 8,
          duration: duration * 1.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay,
          transformOrigin: 'center bottom'
        });
        break;
      case 'drift':
        gsap.set(element, { x: 0, y: 0 });
        timeline = gsap.to(element, {
          x: 30,
          y: -20,
          duration: duration * 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'wobble':
        gsap.set(element, { x: 0, rotation: 0 });
        timeline = gsap.to(element, {
          rotation: 3,
          x: 5,
          duration: 0.15,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'tremble':
        gsap.set(element, { x: 0, y: 0 });
        timeline = gsap.to(element, {
          x: 3,
          y: 3,
          duration: 0.08,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'sparkle':
        timeline = gsap.to(element, {
          opacity: 0.6,
          filter: 'brightness(1.5) drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))',
          duration: 0.5,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'breath':
        gsap.set(element, { scale: 1 });
        timeline = gsap.to(element, {
          scale: 1.05,
          duration: duration * 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'rock':
        timeline = gsap.to(element, {
          rotation: 10,
          duration: duration * 0.8,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay,
          transformOrigin: 'center bottom'
        });
        break;
      case 'twist':
        gsap.set(element, { rotation: 0, scaleX: 1, scaleY: 1 });
        timeline = gsap.to(element, {
          rotation: 15,
          scaleX: 1.1,
          duration: duration * 0.9,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'elastic':
        gsap.set(element, { scale: 1 });
        timeline = gsap.to(element, {
          scale: 1.2,
          duration: duration * 0.6,
          ease: 'elastic.out(1, 0.3)',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      case 'rubber':
        gsap.set(element, { scaleX: 1, scaleY: 1 });
        timeline = gsap.to(element, {
          scaleX: 1.15,
          scaleY: 0.9,
          duration: duration * 0.7,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay
        });
        break;
      default:
        return () => {};
    }
  }

  return () => {
    if (timeline) {
      timeline.kill();
    }
    if (element && window.gsap) {
      const finalTransform = (element as HTMLElement).style.transform || '';
      const finalHasRotation = finalTransform && finalTransform !== 'none' && finalTransform.includes('rotate');
      
      if (config.mode === 'entrance') {
        if (!finalHasRotation) {
          window.gsap.set(element, { clearProps: 'x,y,rotation,scale,opacity,rotationX,rotationY' });
        } else {
          window.gsap.set(element, { clearProps: 'x,y,scale,opacity,rotationX,rotationY' });
        }
      } else {
        const propsToClear: string[] = [];
        switch (config.type) {
          case 'float':
          case 'bounce':
          case 'drift':
          case 'tremble':
            propsToClear.push('y');
            if (config.type === 'drift' || config.type === 'tremble') propsToClear.push('x');
            break;
          case 'shake':
          case 'wobble':
            propsToClear.push('x');
            if (config.type === 'wobble') propsToClear.push('rotation');
            break;
          case 'sway':
          case 'treeSway':
          case 'swing':
          case 'wave':
            propsToClear.push('y');
            if (!finalHasRotation) {
              propsToClear.push('rotation');
            }
            break;
          case 'rotate':
          case 'rock':
            if (!finalHasRotation) {
              propsToClear.push('rotation');
            }
            break;
          case 'twist':
            propsToClear.push('rotation', 'scaleX', 'scaleY');
            break;
          case 'pulse':
          case 'zoom':
          case 'breath':
          case 'elastic':
            propsToClear.push('scale');
            break;
          case 'rubber':
            propsToClear.push('scaleX', 'scaleY');
            break;
        }
        if (propsToClear.length > 0) {
          window.gsap.set(element, { clearProps: propsToClear.join(',') });
        }
      }
    }
  };
}

export const ANIMATION_PRESETS: Array<{ value: AnimationType; label: string; category: 'entrance' | 'continuous' }> = [
  { value: 'none', label: 'Tidak Ada', category: 'entrance' },
  { value: 'fadeIn', label: 'Fade In', category: 'entrance' },
  { value: 'slideInLeft', label: 'Slide Kiri', category: 'entrance' },
  { value: 'slideInRight', label: 'Slide Kanan', category: 'entrance' },
  { value: 'slideInUp', label: 'Slide Atas', category: 'entrance' },
  { value: 'slideInDown', label: 'Slide Bawah', category: 'entrance' },
  { value: 'slideInDiagonal', label: 'Slide Diagonal', category: 'entrance' },
  { value: 'zoomIn', label: 'Zoom Masuk', category: 'entrance' },
  { value: 'zoomOut', label: 'Zoom Keluar', category: 'entrance' },
  { value: 'scaleIn', label: 'Scale Masuk', category: 'entrance' },
  { value: 'flipIn', label: 'Flip Masuk', category: 'entrance' },
  { value: 'flipInX', label: 'Flip X', category: 'entrance' },
  { value: 'flipInY', label: 'Flip Y', category: 'entrance' },
  { value: 'rotateIn', label: 'Rotasi Masuk', category: 'entrance' },
  { value: 'bounceIn', label: 'Bounce Masuk', category: 'entrance' },
  { value: 'elasticIn', label: 'Elastic Masuk', category: 'entrance' },
  { value: 'backIn', label: 'Back Masuk', category: 'entrance' },
  { value: 'float', label: 'Mengambang', category: 'continuous' },
  { value: 'sway', label: 'Bergoyang', category: 'continuous' },
  { value: 'treeSway', label: 'Pohon Bergoyang', category: 'continuous' },
  { value: 'pulse', label: 'Berdenyut', category: 'continuous' },
  { value: 'bounce', label: 'Melompat', category: 'continuous' },
  { value: 'shake', label: 'Goyang', category: 'continuous' },
  { value: 'swing', label: 'Ayunan', category: 'continuous' },
  { value: 'wave', label: 'Gelombang', category: 'continuous' },
  { value: 'glow', label: 'Bercahaya', category: 'continuous' },
  { value: 'rotate', label: 'Berputar', category: 'continuous' },
  { value: 'zoom', label: 'Zoom In/Out', category: 'continuous' },
  { value: 'drift', label: 'Hanyut', category: 'continuous' },
  { value: 'wobble', label: 'Goyang Kecil', category: 'continuous' },
  { value: 'tremble', label: 'Gemetar', category: 'continuous' },
  { value: 'sparkle', label: 'Berkilau', category: 'continuous' },
  { value: 'breath', label: 'Bernapas', category: 'continuous' },
  { value: 'rock', label: 'Bergoyang Kuat', category: 'continuous' },
  { value: 'twist', label: 'Memutar', category: 'continuous' },
  { value: 'elastic', label: 'Elastis', category: 'continuous' },
  { value: 'rubber', label: 'Karet', category: 'continuous' },
];

