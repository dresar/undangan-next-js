'use client';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Block } from '@/types/block';
import { FaLayerGroup, FaTimes, FaLock, FaLockOpen, FaEye, FaEyeSlash } from 'react-icons/fa';
import LayerContextMenu from './LayerContextMenu';

const FloatingButton = styled.button`
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ff6b35;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: all 0.3s;

  &:hover {
    background: #ff5722;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const PanelContainer = styled.div<{ $isOpen: boolean; $top: number }>`
  position: fixed;
  right: 20px;
  top: ${props => props.$top}px;
  width: 280px;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 16px;
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 18px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #e0e0e0;
    color: #333;
  }
`;

const LayerList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const LayerItem = styled.div<{ $isSelected: boolean; $isLocked: boolean; $isVisible: boolean; $isDragging?: boolean }>`
  padding: 10px 10px 10px 20px;
  margin-bottom: 4px;
  border-radius: 8px;
  background: ${props => props.$isSelected ? '#e3f2fd' : '#fafafa'};
  border: 1px solid ${props => props.$isSelected ? '#2196f3' : '#e0e0e0'};
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  opacity: ${props => props.$isVisible ? 1 : 0.5};
  position: relative;

  &:hover {
    background: ${props => props.$isSelected ? '#bbdefb' : '#f5f5f5'};
    border-color: ${props => props.$isSelected ? '#2196f3' : '#bdbdbd'};
  }

  &:active {
    cursor: grabbing;
  }
`;

const LayerIcon = styled.div<{ $hasImage?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: ${props => props.$hasImage ? 'transparent' : '#e0e0e0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LayerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LayerName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LayerType = styled.div`
  font-size: 11px;
  color: #999;
  text-transform: capitalize;
`;

const LayerActions = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  width: 28px;
  height: 28px;

  &:hover {
    background: #e0e0e0;
    color: #333;
  }
`;

const DragHandle = styled.div`
  position: absolute;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
  opacity: 0.3;
  transition: opacity 0.2s;
  padding: 2px 0;

  ${LayerItem}:hover & {
    opacity: 0.6;
  }

  &::before,
  &::after {
    content: '';
    width: 3px;
    height: 3px;
    background: #999;
    border-radius: 50%;
  }

  &::before {
    margin-bottom: 2px;
  }
`;

const getBlockIcon = (type: string) => {
  const icons: Record<string, string> = {
    section: '📄',
    container: '📦',
    text: 'T',
    image: '🖼',
    video: '▶',
    map: '📍',
    countdown: '⏱',
    button: '🔘',
    shape: '⬜',
    spacer: '▭',
    masonry: '▦',
    gallery: '🖼',
    imageTransition: '🔄',
    form: '📝',
    icon: '⭐',
    bank: '💰',
    gift: '🎁',
    audio: '🎵',
  };
  return icons[type] || '?';
};

const getBlockLabel = (block: Block) => {
  if (block.type === 'text') {
    const content = typeof block.content === 'string' ? block.content : '';
    const text = content.replace(/<[^>]*>/g, '').substring(0, 20);
    return text || 'Text';
  }
  if (block.type === 'image') {
    return 'Gambar';
  }
  if (block.type === 'section') {
    return 'Section';
  }
  if (block.type === 'container') {
    return 'Container';
  }
  return block.type.charAt(0).toUpperCase() + block.type.slice(1);
};

export default function LayerPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0, top: 0 });
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; block: Block } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const blocks = useEditorStore((state) => state.blocks);
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const moveBlockToPosition = useEditorStore((state) => state.moveBlockToPosition);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newTop = dragStart.top + (e.clientY - dragStart.y);
      const minTop = 20;
      const maxTop = window.innerHeight - 600;
      setPanelTop(Math.max(minTop, Math.min(maxTop, newTop)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current) {
      setIsDragging(true);
      setDragStart({
        y: e.clientY,
        top: panelTop,
      });
    }
  };

  const handleLayerClick = (blockId: string) => {
    setSelectedId(blockId);
  };

  const handleContextMenu = (e: React.MouseEvent, block: Block) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, block });
    setSelectedId(block.id);
  };

  const handleToggleLock = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    toggleLock(blockId);
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedBlockId(null);
    setDragOverIndex(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number, blockId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (draggedBlockId && blockId !== draggedBlockId) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetBlockId: string, targetReversedIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    
    if (!draggedBlockId || draggedBlockId === targetBlockId) {
      setDraggedBlockId(null);
      return;
    }

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlockId);
    if (draggedIndex === -1) {
      setDraggedBlockId(null);
      return;
    }

    const reversedBlocks = [...blocks].reverse();
    const actualTargetIndex = blocks.length - 1 - targetReversedIndex;
    
    if (draggedIndex !== actualTargetIndex) {
      moveBlockToPosition(draggedBlockId, actualTargetIndex);
    }
    
    setDraggedBlockId(null);
  };

  const getImagePreview = (block: Block): string | null => {
    if (block.type === 'image' && block.content) {
      return typeof block.content === 'string' ? block.content : null;
    }
    return null;
  };

  const reversedBlocks = [...blocks].reverse();

  return (
    <>
      <FloatingButton onClick={() => setIsOpen(!isOpen)}>
        <FaLayerGroup />
      </FloatingButton>

      <PanelContainer
        ref={panelRef}
        $isOpen={isOpen}
        $top={panelTop}
      >
        <PanelHeader
          ref={headerRef}
          onMouseDown={handleHeaderMouseDown}
        >
          <PanelTitle>
            <FaLayerGroup />
            Lapisan ({blocks.length})
          </PanelTitle>
          <CloseButton onClick={() => setIsOpen(false)}>
            <FaTimes />
          </CloseButton>
        </PanelHeader>

        <LayerList>
          {reversedBlocks.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
              Belum ada lapisan
            </div>
          ) : (
            reversedBlocks.map((block, index) => {
              const isSelected = selectedId === block.id;
              const isLocked = block.locked || false;
              const isVisible = true;
              const isDragging = draggedBlockId === block.id;
              const imagePreview = getImagePreview(block);

              return (
                <LayerItem
                  key={block.id}
                  $isSelected={isSelected}
                  $isLocked={isLocked}
                  $isVisible={isVisible}
                  $isDragging={isDragging}
                  onClick={() => handleLayerClick(block.id)}
                  onContextMenu={(e) => handleContextMenu(e, block)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, block.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index, block.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, block.id, index)}
                  style={{
                    borderTop: dragOverIndex === index && draggedBlockId !== block.id ? '2px solid #2196f3' : undefined,
                    marginTop: dragOverIndex === index && draggedBlockId !== block.id ? '8px' : undefined,
                  }}
                >
                  <DragHandle />
                  <LayerIcon $hasImage={!!imagePreview}>
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt={getBlockLabel(block)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.textContent = getBlockIcon(block.type);
                          }
                        }}
                      />
                    ) : (
                      getBlockIcon(block.type)
                    )}
                  </LayerIcon>
                  <LayerInfo>
                    <LayerName>{getBlockLabel(block)}</LayerName>
                    <LayerType>{block.type}</LayerType>
                  </LayerInfo>
                  <LayerActions>
                    <ActionButton
                      onClick={(e) => handleToggleLock(e, block.id)}
                      title={isLocked ? 'Buka Kunci' : 'Kunci'}
                    >
                      {isLocked ? <FaLock /> : <FaLockOpen />}
                    </ActionButton>
                  </LayerActions>
                </LayerItem>
              );
            })
          )}
        </LayerList>
      </PanelContainer>

      {contextMenu && (
        <LayerContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          block={contextMenu.block}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

