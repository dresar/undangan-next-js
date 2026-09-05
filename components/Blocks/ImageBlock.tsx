'use client';

import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { Block } from '@/types/block';
import { applyImageAnimation, AnimationConfig } from '@/lib/imageAnimations';
import { useEditorStore } from '@/store/useEditorStore';

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  position: relative;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
`;

const ImageElement = styled.img<{ $objectFit?: string; $objectPosition?: string; $borderRadius?: string }>`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: ${(props) => props.$objectFit || 'cover'};
  object-position: ${(props) => props.$objectPosition || 'center'};
  border-radius: ${(props) => props.$borderRadius || '0px'};
  border: none;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 1;
  outline: none;
`;


interface ImageBlockProps {
  block: Block;
}

export default function ImageBlock({ block }: ImageBlockProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const selectedId = useEditorStore((state) => state.selectedId);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const styles = block.styles as any;
  const imageSrc = block.content || '/media/default/image-placeholder.svg';
  const altText = styles.alt || 'Invitation image';
  const [isPreview, setIsPreview] = useState(false);
  
  // Check if we're in preview mode (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPreview(window.location.pathname.includes('/undangan/'));
    }
  }, []);
  
  const isSelected = !isPreview && selectedId === block.id;
  
  const extractRotation = (transform: string): number => {
    if (!transform || transform === 'none') return 0;
    const match = transform.match(/rotate\(([^)]+)\)/);
    if (match) {
      const value = match[1].replace('deg', '').trim();
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

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
  
  useEffect(() => {
    if (!imageRef.current) return;
    
    const checkGSAP = () => {
      if (!window.gsap) {
        setTimeout(checkGSAP, 100);
        return;
      }
      
      if (imageRef.current && window.gsap) {
        window.gsap.killTweensOf(imageRef.current);
        
        const currentTransform = block.styles?.transform || '';
        const hasTransform = currentTransform && currentTransform !== 'none' && currentTransform.includes('rotate');
        
        if (!hasTransform) {
          window.gsap.set(imageRef.current, { clearProps: 'x,y,rotation,scale,opacity,rotationX,rotationY' });
        } else {
          window.gsap.set(imageRef.current, { clearProps: 'x,y,scale,opacity,rotationX,rotationY' });
          if (imageRef.current) {
            imageRef.current.style.transform = currentTransform;
          }
        }
      }
      
      if (!block.animation || block.animation.type === 'none') {
        if (imageRef.current && block.styles?.transform) {
          imageRef.current.style.transform = block.styles.transform;
        }
        return;
      }
      
      const animationConfig: AnimationConfig = {
        type: block.animation.type as any || 'none',
        mode: (block.animation.mode as any) || 'entrance',
        duration: block.animation.duration ? block.animation.duration / 1000 : 2,
        delay: block.animation.delay ? block.animation.delay / 1000 : 0,
        ease: block.animation.easing || 'power1.inOut',
      };
      
      applyImageAnimation(imageRef.current, animationConfig, block.styles?.transform);
    };
    
    checkGSAP();
    
    return () => {
      if (imageRef.current && window.gsap) {
        window.gsap.killTweensOf(imageRef.current);
        
        const currentTransform = block.styles?.transform || '';
        const hasTransform = currentTransform && currentTransform !== 'none' && currentTransform.includes('rotate');
        
        if (!hasTransform) {
          window.gsap.set(imageRef.current, { clearProps: 'x,y,rotation,scale,opacity,rotationX,rotationY' });
        } else {
          window.gsap.set(imageRef.current, { clearProps: 'x,y,scale,opacity,rotationX,rotationY' });
          if (imageRef.current) {
            imageRef.current.style.transform = currentTransform;
          }
        }
      }
    };
  }, [block.animation, imageSrc]);
  
  
  // Extract styles untuk container
  const containerStyles: any = {
    width: block.size?.width 
      ? (typeof block.size.width === 'number' ? `${block.size.width}px` : block.size.width)
      : (styles.position === 'absolute' ? (styles.width || 'auto') : '100%'),
    height: block.size?.height 
      ? (typeof block.size.height === 'number' ? `${block.size.height}px` : block.size.height)
      : (styles.position === 'absolute' ? (styles.height || 'auto') : '100%'),
  };
  
  // Copy semua styles kecuali yang sudah di-handle khusus
  Object.keys(styles).forEach((key) => {
    if (key !== 'alt' && key !== 'objectFit' && key !== 'objectPosition' && key !== 'borderRadius' && key !== 'transform') {
      containerStyles[key] = styles[key];
    }
  });
  
  // Apply background
  if (styles.backgroundGradient && styles.backgroundGradient !== '') {
    containerStyles.background = styles.backgroundGradient;
  } else if (styles.backgroundColor) {
    containerStyles.backgroundColor = styles.backgroundColor;
  } else {
    containerStyles.backgroundColor = 'transparent';
  }
  
  // Apply border
  if (styles.borderColor) {
    containerStyles.borderColor = styles.borderColor;
  }
  if (styles.borderStyle) {
    containerStyles.borderStyle = styles.borderStyle;
  }
  if (styles.borderWidth) {
    containerStyles.borderWidth = styles.borderWidth;
  }
  
  // Apply padding dan margin
  if (styles.padding) {
    containerStyles.padding = styles.padding;
  }
  if (styles.margin) {
    containerStyles.margin = styles.margin;
  }
  
  return (
    <ImageContainer 
      style={containerStyles}
    >
      <ImageWrapper>
        <ImageElement 
          ref={imageRef}
          src={imageSrc} 
          alt={altText}
          $objectFit={styles.objectFit || 'cover'}
          $objectPosition={styles.objectPosition || 'center'}
          $borderRadius={styles.borderRadius || '0px'}
          style={{
            width: block.size?.width 
              ? (typeof block.size.width === 'number' ? `${block.size.width}px` : block.size.width)
              : '200px',
            height: block.size?.height 
              ? (typeof block.size.height === 'number' ? `${block.size.height}px` : block.size.height)
              : '200px',
            minHeight: block.size?.height ? 'auto' : '200px',
            opacity: styles.opacity !== undefined ? styles.opacity : 1,
            transform: styles.transform || 'rotate(0deg)',
            transformOrigin: 'center center',
            objectFit: styles.objectFit || 'cover',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== '/media/default/image-placeholder.svg') {
              target.src = '/media/default/image-placeholder.svg';
            }
          }}
        />
      </ImageWrapper>
    </ImageContainer>
  );
}

