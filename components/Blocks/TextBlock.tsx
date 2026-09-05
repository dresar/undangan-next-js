'use client';

import styled from 'styled-components';
import ContentEditable from 'react-contenteditable';
import { Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';
import { useCallback, useRef, useEffect } from 'react';
import { applyImageAnimation, AnimationConfig } from '@/lib/imageAnimations';

const TextContainer = styled.div`
  width: 100%;
  min-height: 40px;
  word-wrap: break-word;
  outline: none;
  background: transparent;
`;

interface TextBlockProps {
  block: Block;
}

export default function TextBlock({ block }: TextBlockProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const contentRef = useRef<string>(block.content || '');
  const textRef = useRef<HTMLDivElement>(null);

  const isEditing = selectedId === block.id;

  // Sync content ref with block content
  useEffect(() => {
    contentRef.current = block.content || '';
  }, [block.content]);

  // Apply animations
  useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    
    const animation = block.animation;
    
    const checkGSAP = () => {
      if (!window.gsap) {
        setTimeout(checkGSAP, 100);
        return;
      }
      
      if (element && window.gsap) {
        window.gsap.killTweensOf(element);
        window.gsap.set(element, { clearProps: 'x,y,rotation,scale,opacity,rotationX,rotationY' });
      }
      
      if (!animation || animation.type === 'none') {
        return;
      }
      
      const animationConfig: AnimationConfig = {
        type: animation.type as any || 'none',
        mode: (animation.mode as any) || 'entrance',
        duration: animation.duration ? animation.duration / 1000 : 2,
        delay: animation.delay ? animation.delay / 1000 : 0,
        ease: animation.easing || 'power1.inOut',
      };
      
      applyImageAnimation(element, animationConfig);
    };
    
    checkGSAP();
    
    return () => {
      if (element && window.gsap) {
        window.gsap.killTweensOf(element);
        window.gsap.set(element, { clearProps: 'x,y,rotation,scale,opacity,rotationX,rotationY' });
      }
    };
  }, [block.animation]);

  const handleChange = useCallback((e: any) => {
    const newContent = e.target.value;
    contentRef.current = newContent;
    updateBlock(block.id, {
      content: newContent,
    });
  }, [block.id, updateBlock]);

  const handleBlur = useCallback(() => {
    // Ensure content is saved on blur
    if (contentRef.current !== block.content) {
      updateBlock(block.id, {
        content: contentRef.current,
      });
    }
  }, [block.id, block.content, updateBlock]);

  const styles = block.styles as any;
  
  const containerStyle: React.CSSProperties = {
    ...block.styles,
  };
  
  if (styles.borderColor) {
    containerStyle.borderColor = styles.borderColor;
  }
  
  if (styles.borderStyle) {
    containerStyle.borderStyle = styles.borderStyle;
  }
  
  if (styles.backgroundGradient && styles.backgroundGradient !== '') {
    containerStyle.background = styles.backgroundGradient;
  } else if (styles.backgroundColor) {
    containerStyle.backgroundColor = styles.backgroundColor;
  } else {
    containerStyle.backgroundColor = 'transparent';
  }
  
  if (styles.fontWeight) {
    containerStyle.fontWeight = styles.fontWeight;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(block.id);
  };

  useEffect(() => {
    if (isEditing && textRef.current) {
      const editable = textRef.current.querySelector('[contenteditable]') as HTMLElement;
      if (editable) {
        setTimeout(() => {
          editable.focus();
          const range = document.createRange();
          const sel = window.getSelection();
          if (editable.firstChild) {
            range.selectNodeContents(editable);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }, 50);
      }
    }
  }, [isEditing]);

  return (
    <TextContainer 
      ref={textRef} 
      style={containerStyle}
      onClick={handleClick}
    >
      <ContentEditable
        html={contentRef.current}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={!isEditing}
        tagName="div"
        style={{
          outline: 'none',
          cursor: isEditing ? 'text' : 'pointer',
          width: '100%',
          minHeight: '40px',
          userSelect: isEditing ? 'text' : 'none',
          padding: '8px',
          border: isEditing ? '1px dashed #2196F3' : '1px dashed transparent',
          borderRadius: '4px',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(block.id);
        }}
      />
    </TextContainer>
  );
}

