'use client';

import styled from 'styled-components';
import React from 'react';
import { Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';
import SectionToolbar from './SectionToolbar';
import ComponentWrapper from './ComponentWrapper';
import ImageWrapper from './ImageWrapper';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';

const RowBlock = styled.div<{ $isSelected: boolean }>`
  width: 100%;
  position: relative;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  border: ${props => props.$isSelected ? '1px dashed #ff4444' : '1px solid transparent'};
  cursor: pointer;
  transition: border-color 0.2s;
  display: block;
  overflow: visible;
  z-index: 1;

  &:hover {
    border-color: ${props => props.$isSelected ? '#ff4444' : '#60a5fa'};
    border-style: ${props => props.$isSelected ? 'dashed' : 'solid'};
  }
`;

const ContainerBlockWrapper = styled.div<{ $isSelected: boolean; $deviceView: string }>`
  box-sizing: border-box;
  position: relative;
  overflow: visible;
  border: ${props => props.$isSelected ? '2px solid #2196F3' : 'none'};
  border-radius: 4px;
  width: 100%;
  
  &:hover {
    border: ${props => props.$isSelected ? '2px solid #2196F3' : '1px solid #60a5fa'};
  }
`;

const InnerContainer = styled.div`
  width: 100%;
  position: relative;
  border: none;
  border-radius: 4px;
  box-sizing: border-box;
  overflow: visible;
  background: transparent;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
`;

const ImageLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: visible;
  
  &[data-image-layer] {
    overflow: visible;
  }
`;

const ImageLayerContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: auto;
`;

const DropZone = styled.div<{ $isOver: boolean }>`
  min-height: 120px;
  padding: 30px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  transition: all 0.2s;
  pointer-events: auto;
  cursor: pointer;
  position: relative;
  
  &::before {
    content: '📦';
    font-size: 32px;
    opacity: 0.3;
    margin-bottom: 8px;
  }
  
  &:hover {
    color: #ff6b35;
  }
`;

interface SectionBlockProps {
  section: Block;
}

export default function SectionBlock({ section }: SectionBlockProps) {
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const getComponentsInSection = useEditorStore((state) => state.getComponentsInSection);
  const blocks = useEditorStore((state) => state.blocks);
  const deviceView = useEditorStore((state) => state.deviceView);
  const components = getComponentsInSection(section.id);
  const isSelected = selectedId === section.id;
  const containerStyles = (section.styles as any)?.containerStyles || {};

  const [isPreview, setIsPreview] = React.useState(false);
  const [isDraggingFromSidebar, setIsDraggingFromSidebar] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPreview(window.location.pathname.includes('/undangan/'));
    }
  }, []);

  useDndMonitor({
    onDragStart: (event) => {
      const activeId = event.active.id;
      if (typeof activeId === 'string' && activeId.startsWith('component-')) {
        setIsDraggingFromSidebar(true);
      }
    },
    onDragEnd: () => {
      setIsDraggingFromSidebar(false);
    },
  });

  const { setNodeRef, isOver } = useDroppable({
    id: `section-drop-${section.id}`,
  });

  const getStyleValue = (value: any, defaultVal?: any) => {
    if (!value && value !== 0) return defaultVal;
    if (typeof value === 'string') {
      if (value === '0' || value === '0px') return defaultVal;
      return value;
    }
    if (typeof value === 'number') {
      if (value === 0) return defaultVal;
      return `${value}px`;
    }
    return defaultVal;
  };

  const imageComponents = components.filter(c => c.type === 'image');
  const nonImageComponents = components.filter(c => c.type !== 'image');

  const rowStyle: React.CSSProperties = {
    width: '100%',
    minHeight: section.styles?.minHeight || '100px',
    backgroundColor: section.styles?.backgroundColor || '#ffffff',
    backgroundImage: section.styles?.backgroundImage ? `url(${section.styles.backgroundImage})` : undefined,
    backgroundSize: section.styles?.backgroundSize || '100% 100%',
    backgroundRepeat: section.styles?.backgroundRepeat || 'no-repeat',
    position: 'relative',
    overflow: isPreview ? 'hidden' : 'visible',
    display: 'block',
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: getStyleValue(containerStyles.maxWidth, '1400px'),
    margin: '0 auto',
    padding: getStyleValue(containerStyles.padding, deviceView === 'mobile' ? '16px' : '20px'),
    boxSizing: 'border-box',
    position: 'relative',
    overflow: isPreview ? 'hidden' : 'visible',
    backgroundColor: containerStyles.backgroundColor || 'transparent',
    backgroundImage: containerStyles.backgroundImage ? `url(${containerStyles.backgroundImage})` : undefined,
    backgroundSize: containerStyles.backgroundSize || 'cover',
    backgroundPosition: containerStyles.backgroundPosition || 'center',
    backgroundRepeat: containerStyles.backgroundRepeat || 'no-repeat',
    minHeight: getStyleValue(containerStyles.minHeight),
    borderRadius: getStyleValue(containerStyles.borderRadius),
    opacity: containerStyles.opacity !== undefined ? containerStyles.opacity : 1,
  };

  return (
    <RowBlock
      $isSelected={isSelected}
      data-section-id={section.id}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-toolbar]')) return;
        if ((e.target as HTMLElement).closest('[data-block-wrapper]')) return;
        if (section.locked) return;
        e.stopPropagation();
        setSelectedId(section.id);
      }}
      style={rowStyle}
      key={`section-${section.id}-${section.styles?.minHeight || 'default'}-${section.styles?.backgroundImage || 'default'}-${section.styles?.backgroundColor || 'default'}`}
    >
      <SectionToolbar sectionId={section.id} />
      <ContainerBlockWrapper
        $isSelected={isSelected}
        $deviceView={deviceView}
        style={containerStyle}
        key={`container-${section.id}-${containerStyles.maxWidth || 'default'}-${containerStyles.minHeight || 'default'}-${containerStyles.padding || 'default'}-${containerStyles.backgroundColor || 'default'}`}
      >
        <InnerContainer>
          <div 
            ref={setNodeRef} 
            data-droppable="true"
            style={{ 
              position: 'relative', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              pointerEvents: 'auto',
              zIndex: 1
            }}
          >
            {nonImageComponents.map((component) => (
              <div 
                key={component.id}
                style={{
                  pointerEvents: isDraggingFromSidebar && isOver ? 'none' : 'auto',
                  position: 'relative',
                  zIndex: isDraggingFromSidebar && isOver ? 0 : 1,
                }}
                data-block-wrapper="true"
              >
                <ComponentWrapper component={component} />
              </div>
            ))}
            {nonImageComponents.length === 0 && imageComponents.length === 0 && (
              <DropZone 
                $isOver={isOver} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  pointerEvents: 'auto',
                  zIndex: 2
                }}
              >
                <span style={{ marginTop: '8px' }}>Drop disini</span>
                <span style={{ fontSize: '11px', fontWeight: 'normal', marginTop: '4px', opacity: 0.7 }}>
                  Seret komponen dari sidebar ke sini
                </span>
              </DropZone>
            )}
            {nonImageComponents.length > 0 && (
              <div 
                data-drop-overlay="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: isOver ? 'auto' : 'none',
                  zIndex: isOver ? 50 : 0,
                  backgroundColor: isOver ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                  border: isOver ? '2px dashed #2196F3' : 'none',
                  borderRadius: '4px',
                  minHeight: '100px',
                }}
              />
            )}
          </div>
        </InnerContainer>
        {imageComponents.length > 0 && (
          <ImageLayer data-image-layer="true">
            <ImageLayerContent>
              {imageComponents.map((component) => (
                <ImageWrapper key={component.id} block={component} />
              ))}
            </ImageLayerContent>
          </ImageLayer>
        )}
      </ContainerBlockWrapper>
    </RowBlock>
  );
}
