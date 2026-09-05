'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';
import ImageBlock from '../Blocks/ImageBlock';
import ImageToolbar from './ImageToolbar';
import ContextMenu from '../ContextMenu';
import { AnimatePresence } from 'framer-motion';

interface ImageWrapperProps {
  block: Block;
}

export default function ImageWrapper({ block }: ImageWrapperProps) {
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const [isPreview, setIsPreview] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPreview(window.location.pathname.includes('/undangan/'));
    }
  }, []);

  const isSelected = !isPreview && selectedId === block.id;

  const defaultPosition = block.position || { x: 0, y: 0 };
  const defaultSize = block.size || { width: 200, height: 200 };

  const getNumericSize = () => {
    let width: number;
    let height: number;

    if (typeof defaultSize.width === 'number') {
      width = defaultSize.width;
    } else if (typeof defaultSize.width === 'string') {
      if (defaultSize.width === 'auto') {
        width = 200;
      } else if (defaultSize.width.includes('%')) {
        const percent = parseFloat(defaultSize.width);
        width = (percent / 100) * 375;
      } else {
        width = parseFloat(defaultSize.width.replace('px', '')) || 200;
      }
    } else {
      width = 200;
    }

    if (typeof defaultSize.height === 'number') {
      height = defaultSize.height;
    } else if (typeof defaultSize.height === 'string') {
      if (defaultSize.height === 'auto') {
        height = 200;
      } else if (defaultSize.height.includes('%')) {
        const percent = parseFloat(defaultSize.height);
        height = (percent / 100) * 375;
      } else {
        height = parseFloat(defaultSize.height.replace('px', '')) || 200;
      }
    } else {
      height = 200;
    }

    return { width, height };
  };

  const size = getNumericSize();
  const x = typeof defaultPosition.x === 'number' ? defaultPosition.x : parseFloat(String(defaultPosition.x)) || 0;
  const y = typeof defaultPosition.y === 'number' ? defaultPosition.y : parseFloat(String(defaultPosition.y)) || 0;

  const handleDragStop = (e: any, d: any) => {
    updateBlock(block.id, {
      position: { x: d.x, y: d.y },
    });
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    updateBlock(block.id, {
      size: {
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      },
      position: { x: position.x, y: position.y },
    });
  };

  const getBounds = () => {
    if (typeof window === 'undefined') return window;
    
    const editorArea = document.querySelector('[data-editor-area]');
    if (editorArea) {
      return editorArea as HTMLElement;
    }
    
    return window;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  if (isPreview) {
    const wrapperStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      zIndex: 5,
    };

    return (
      <div style={wrapperStyle}>
        <ImageBlock block={block} />
      </div>
    );
  }

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isSelected && <ImageToolbar blockId={block.id} />}
      <Rnd
        key={`rnd-${block.id}-${isSelected}`}
        size={{ width: size.width, height: size.height }}
        position={{ x, y }}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        minWidth={50}
        minHeight={50}
        maxWidth={2000}
        maxHeight={2000}
        bounds={getBounds()}
        style={{
          zIndex: isSelected ? 10 : 5,
          border: isSelected ? '2px solid #2196F3' : 'none',
          borderRadius: '4px',
          boxSizing: 'border-box',
          padding: isSelected ? '4px' : '0',
          margin: 0,
          overflow: 'hidden',
        }}
        resizeHandleStyles={isSelected ? {
          right: { right: '-8px', width: '10px', height: '10px', background: '#2196F3', border: '2px solid #fff', borderRadius: '50%', cursor: 'ew-resize' },
          bottom: { bottom: '-8px', width: '10px', height: '10px', background: '#2196F3', border: '2px solid #fff', borderRadius: '50%', cursor: 'ns-resize' },
          bottomRight: { right: '-8px', bottom: '-8px', width: '12px', height: '12px', background: '#2196F3', border: '2px solid #fff', borderRadius: '50%', cursor: 'nwse-resize' },
          top: { top: '-8px', width: '10px', height: '10px', background: '#2196F3', border: '2px solid #fff', borderRadius: '50%', cursor: 'ns-resize' },
          left: { left: '-8px', width: '10px', height: '10px', background: '#2196F3', border: '2px solid #fff', borderRadius: '50%', cursor: 'ew-resize' },
          topLeft: { left: '-8px', top: '-8px', width: '12px', height: '12px', background: '#2196F3', border: '2px solid #fff', borderRadius: '50%', cursor: 'nwse-resize' },
          topRight: { right: '-8px', top: '-8px', width: '12px', height: '12px', background: '#2196F3', border: '2px solid #fff', borderRadius: '50%', cursor: 'nesw-resize' },
          bottomLeft: { left: '-8px', bottom: '-8px', width: '12px', height: '12px', background: '#2196F3', border: '2px solid #fff', borderRadius: '50%', cursor: 'nesw-resize' },
        } : {}}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(block.id);
        }}
        onContextMenu={handleContextMenu}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative', padding: 0, margin: 0, overflow: 'hidden' }}>
          <ImageBlock block={block} />
        </div>
      </Rnd>
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
    </div>
  );
}

