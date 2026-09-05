'use client';

import styled from 'styled-components';
import { useEffect, useRef } from 'react';
import { Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';

const ButtonElement = styled.button`
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
  padding: 12px 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface ButtonBlockProps {
  block: Block;
}

export default function ButtonBlock({ block }: ButtonBlockProps) {
  const selectedId = useEditorStore((state) => state.selectedId);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isEditing = selectedId === block.id;
  const styles = block.styles as any;

  // Auto-resize button based on content and auto-fit font size
  useEffect(() => {
    if (buttonRef.current && block.size) {
      const button = buttonRef.current;
      const containerWidth = typeof block.size.width === 'number' 
        ? block.size.width 
        : (typeof block.size.width === 'string' && block.size.width.includes('px')
          ? parseInt(block.size.width) 
          : button.offsetWidth);
      
      const containerHeight = typeof block.size.height === 'number'
        ? block.size.height
        : (typeof block.size.height === 'string' && block.size.height.includes('px')
          ? parseInt(block.size.height)
          : button.offsetHeight);

      // Calculate optimal font size based on container size and content
      const text = typeof block.content === 'string' ? block.content : 'Button';
      const textLength = text.length;
      
      // Base font size calculation
      const baseFontSize = parseInt((styles.fontSize as string)?.replace('px', '') || '16') || 16;
      
      // Adjust font size based on container width (max 80% of width for text)
      const maxTextWidth = containerWidth * 0.8;
      const estimatedCharWidth = baseFontSize * 0.6; // Approximate character width
      const estimatedTextWidth = textLength * estimatedCharWidth;
      
      let adjustedFontSize = baseFontSize;
      if (estimatedTextWidth > maxTextWidth && maxTextWidth > 0) {
        adjustedFontSize = Math.max(10, (maxTextWidth / textLength / 0.6));
      }
      
      // Also consider height (max 70% of height for font)
      const maxFontHeight = containerHeight * 0.7;
      if (adjustedFontSize > maxFontHeight) {
        adjustedFontSize = Math.max(10, maxFontHeight);
      }

      // Apply adjusted font size
      if (button.style.fontSize !== `${adjustedFontSize}px`) {
        button.style.fontSize = `${adjustedFontSize}px`;
      }
    }
  }, [block.size, block.content, styles.fontSize]);

  // Auto-resize button container based on content when content changes
  useEffect(() => {
    if (buttonRef.current) {
      const button = buttonRef.current;
      const text = typeof block.content === 'string' ? block.content : 'Button';
      const fontSize = parseInt((styles.fontSize as string)?.replace('px', '') || '16') || 16;
      
      // Use a temporary span to measure actual text width
      const measureSpan = document.createElement('span');
      measureSpan.style.position = 'absolute';
      measureSpan.style.visibility = 'hidden';
      measureSpan.style.whiteSpace = 'nowrap';
      measureSpan.style.fontSize = `${fontSize}px`;
      measureSpan.style.fontFamily = styles.fontFamily || 'Roboto, sans-serif';
      measureSpan.style.fontWeight = styles.fontWeight || 'normal';
      measureSpan.textContent = text;
      document.body.appendChild(measureSpan);
      
      const textWidth = measureSpan.offsetWidth;
      const textHeight = measureSpan.offsetHeight;
      
      document.body.removeChild(measureSpan);
      
      // Only auto-resize if size is not manually set or if content changed significantly
      if (!block.size || (block.size.width === 200 && block.size.height === 50)) {
        const newWidth = Math.max(100, textWidth + 48); // padding
        const newHeight = Math.max(40, Math.max(textHeight, fontSize) + 24); // padding
        
        updateBlock(block.id, {
          size: {
            width: newWidth,
            height: newHeight,
          },
        });
      }
    }
  }, [block.content, styles.fontSize, styles.fontFamily, styles.fontWeight, block.id, updateBlock]);

  // Build style object
  const buttonStyle: React.CSSProperties = {
    ...block.styles,
    textAlign: 'center', // Always center
  };

  // Apply background gradient if exists
  if (styles.backgroundGradient) {
    buttonStyle.background = styles.backgroundGradient;
    if (buttonStyle.backgroundColor) {
      delete buttonStyle.backgroundColor;
    }
  }

  // Ensure default styles
  if (!buttonStyle.backgroundColor && !styles.backgroundGradient) {
    buttonStyle.backgroundColor = '#007bff';
  }
  if (!buttonStyle.color) {
    buttonStyle.color = '#ffffff';
  }
  if (!buttonStyle.borderRadius) {
    buttonStyle.borderRadius = '8px';
  }

  return (
    <ButtonElement
      ref={buttonRef}
      style={buttonStyle}
      disabled={isEditing}
    >
      {typeof block.content === 'string' ? block.content : 'Button'}
    </ButtonElement>
  );
}
