'use client';

import styled from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Block } from '@/types/block';
import { motion, AnimatePresence } from 'framer-motion';
import TextBlock from '../Blocks/TextBlock';
import ImageBlock from '../Blocks/ImageBlock';
import VideoBlock from '../Blocks/VideoBlock';
import MapBlock from '../Blocks/MapBlock';
import CountdownBlock from '../Blocks/CountdownBlock';
import ButtonBlock from '../Blocks/ButtonBlock';
import ShapeBlock from '../Blocks/ShapeBlock';
import SpacerBlock from '../Blocks/SpacerBlock';
import MasonryBlock from '../Blocks/MasonryBlock';
import GalleryBlock from '../Blocks/GalleryBlock';
import ImageTransitionBlock from '../Blocks/ImageTransitionBlock';
import FormBlock from '../Blocks/FormBlock';
import IconBlock from '../Blocks/IconBlock';
import BankBlock from '../Blocks/BankBlock';
import GiftBlock from '../Blocks/GiftBlock';
import ContextMenu from '../ContextMenu';

const WrapperContainer = styled.div<{ $isSelected: boolean; $isImage: boolean }>`
  position: ${props => props.$isImage ? 'absolute' : 'relative'};
  margin: ${props => props.$isImage ? '0' : '0 0 8px 0'};
  cursor: pointer;
  min-height: 40px;
  border: ${props => props.$isSelected ? '2px solid #2196F3' : 'none'};
  border-radius: 4px;
  padding: ${props => props.$isSelected ? '4px' : '0'};
  transition: border-color 0.2s;
  z-index: ${props => props.$isSelected ? 10 : (props.$isImage ? 5 : 1)};
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
  pointer-events: auto;
`;

interface BlockWrapperProps {
  block: Block;
}

const renderBlock = (block: Block) => {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} />;
    case 'video':
      return <VideoBlock block={block} />;
    case 'map':
      return <MapBlock block={block} />;
    case 'countdown':
      return <CountdownBlock block={block} />;
    case 'button':
      return <ButtonBlock block={block} />;
    case 'shape':
      return <ShapeBlock block={block} />;
    case 'spacer':
      return <SpacerBlock block={block} />;
    case 'masonry':
      return <MasonryBlock block={block} />;
    case 'gallery':
      return <GalleryBlock block={block} />;
    case 'imageTransition':
      return <ImageTransitionBlock block={block} />;
    case 'form':
      return <FormBlock block={block} />;
    case 'icon':
      return <IconBlock block={block} />;
    case 'bank':
      return <BankBlock block={block} />;
    case 'gift':
      return <GiftBlock block={block} />;
    default:
      return <div>Tipe komponen tidak dikenal</div>;
  }
};

export default function BlockWrapper({ block }: BlockWrapperProps) {
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const isSelected = selectedId === block.id;
  const isInSection = block.parentId !== null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const menuContainer = document.querySelector('[data-context-menu]');
      const submenu = document.querySelector('[data-submenu]');
      
      if (contextMenu && menuContainer) {
        const isInsideMenu = menuContainer.contains(target);
        const isInsideSubmenu = submenu?.contains(target);
        
        if (!isInsideMenu && !isInsideSubmenu) {
          setContextMenu(null);
        }
      }
    };

    if (contextMenu) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
    setSelectedId(block.id);
  };

  const animation = block.animation || { type: 'none', duration: 1000, delay: 0 };
  const customCSS = block.customCSS || '';

  const getAnimationVariants = () => {
    const duration = (animation.duration || 1000) / 1000;
    const delay = (animation.delay || 0) / 1000;

    switch (animation.type) {
      case 'fadeIn':
        return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration, delay } };
      case 'slideIn':
        return { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, transition: { duration, delay } };
      case 'zoomIn':
        return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration, delay } };
      default:
        return { initial: { opacity: 1 }, animate: { opacity: 1 } };
    }
  };

  const animationProps = getAnimationVariants();
  const blockClass = `block-${block.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const isImage = block.type === 'image';
  
  const blockStyle: React.CSSProperties = {
    ...block.styles,
    width: isImage ? (block.styles?.width || 'auto') : '100%',
    position: isImage ? (block.styles?.position || 'absolute') : 'relative',
    top: isImage ? (block.styles?.top || 'auto') : undefined,
    left: isImage ? (block.styles?.left || 'auto') : undefined,
    right: isImage ? (block.styles?.right || 'auto') : undefined,
    bottom: isImage ? (block.styles?.bottom || 'auto') : undefined,
    zIndex: isSelected ? (block.styles?.zIndex as number || 10) : (isImage ? 5 : (block.styles?.zIndex as number || 'auto')),
  };

  return (
    <>
      {customCSS && (
        <style dangerouslySetInnerHTML={{ 
          __html: customCSS.includes('{') || customCSS.includes('}') 
            ? customCSS 
            : `.${blockClass} { ${customCSS} }` 
        }} />
      )}
      <WrapperContainer
        $isSelected={isSelected}
        $isImage={isImage}
        onContextMenu={handleContextMenu}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(block.id);
        }}
        className={blockClass}
        data-block-wrapper="true"
        style={blockStyle}
      >
        <motion.div {...animationProps}>
          {renderBlock(block)}
        </motion.div>
      </WrapperContainer>
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            block={block}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
