'use client';

import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaImage, 
  FaTrash, 
  FaLock, 
  FaUnlock, 
  FaEdit,
  FaArrowUp,
  FaArrowDown,
  FaLayerGroup,
  FaRedo,
  FaUndo,
  FaSync,
  FaChevronRight,
  FaCopy
} from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Block } from '@/types/block';

const ContextMenuContainer = styled(motion.div)`
  position: fixed;
  background: #2a2a2a;
  border: 1px solid #4a4a4a;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 4px;
  z-index: 10000;
  min-width: 200px;
  overflow: visible;
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  transition: all 0.2s;
  border-radius: 4px;

  &:hover {
    background: #3a3a3a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 14px;
    color: #cccccc;
  }
`;

const Separator = styled.div`
  height: 1px;
  background: #4a4a4a;
  margin: 4px 0;
`;

const SubMenuContainer = styled(motion.div)<{ $position: 'left' | 'right' }>`
  position: absolute;
  ${(props) => (props.$position === 'right' ? 'left: 100%;' : 'right: 100%;')}
  top: 0;
  margin-left: ${(props) => (props.$position === 'right' ? '4px' : '0')};
  margin-right: ${(props) => (props.$position === 'left' ? '4px' : '0')};
  background: #2a2a2a;
  border: 1px solid #4a4a4a;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 4px;
  min-width: 200px;
  z-index: 10001;
`;

const MenuItemWithSubmenu = styled(MenuItem)`
  position: relative;
  justify-content: space-between;
  
  svg:last-child {
    margin-left: auto;
    font-size: 10px;
  }
`;

interface ContextMenuProps {
  x: number;
  y: number;
  block: Block;
  onClose: () => void;
}

export default function ContextMenu({ x, y, block, onClose }: ContextMenuProps) {
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  const duplicateBlock = useEditorStore((state) => state.duplicateBlock);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const setBackgroundImage = useEditorStore((state) => state.setBackgroundImage);
  const moveBlock = useEditorStore((state) => state.moveBlock);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const blocks = useEditorStore((state) => state.blocks);

  const [showRotateSubmenu, setShowRotateSubmenu] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState<'right' | 'left'>('right');
  const rotateSubmenuRef = useRef<HTMLDivElement>(null);
  const menuItemRef = useRef<HTMLButtonElement>(null);

  const isLocked = block.locked || false;
  const isImage = block.type === 'image';
  const blockIndex = blocks.findIndex((b) => b.id === block.id);
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < blocks.length - 1;

  useEffect(() => {
    if (showRotateSubmenu && menuItemRef.current) {
      const rect = menuItemRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const submenuWidth = 200;
      
      if (rect.right + submenuWidth > screenWidth) {
        setSubmenuPosition('left');
      } else {
        setSubmenuPosition('right');
      }
    }
  }, [showRotateSubmenu]);

  useEffect(() => {
    if (!showRotateSubmenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideSubmenu = rotateSubmenuRef.current?.contains(target);
      const isInsideMenuItem = menuItemRef.current?.contains(target);
      const menuContainer = document.querySelector('[data-context-menu]');
      const isInsideMenu = menuContainer?.contains(target);

      if (!isInsideSubmenu && !isInsideMenuItem && !isInsideMenu) {
        setShowRotateSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showRotateSubmenu]);

  const handleSetBackground = () => {
    if (isImage && block.content) {
      setBackgroundImage(block.content);
      onClose();
    }
  };

  const handleDelete = () => {
    deleteBlock(block.id);
    onClose();
  };

  const handleToggleLock = () => {
    toggleLock(block.id);
    onClose();
  };

  const handleEdit = () => {
    setSelectedId(block.id);
    onClose();
  };

  const handleDuplicate = () => {
    duplicateBlock(block.id);
    onClose();
  };

  const handleMoveUp = () => {
    moveBlock(block.id, 'up');
    onClose();
  };

  const handleMoveDown = () => {
    moveBlock(block.id, 'down');
    onClose();
  };

  const handleMoveToFront = () => {
    const state = useEditorStore.getState();
    const newBlocks = [...state.blocks];
    const index = newBlocks.findIndex((b) => b.id === block.id);
    if (index !== -1) {
      const [blockToMove] = newBlocks.splice(index, 1);
      newBlocks.push(blockToMove);
      useEditorStore.setState({ blocks: newBlocks });
      state.saveHistory();
    }
    onClose();
  };

  const handleMoveToBack = () => {
    const state = useEditorStore.getState();
    const newBlocks = [...state.blocks];
    const index = newBlocks.findIndex((b) => b.id === block.id);
    if (index !== -1) {
      const [blockToMove] = newBlocks.splice(index, 1);
      newBlocks.unshift(blockToMove);
      useEditorStore.setState({ blocks: newBlocks });
      state.saveHistory();
    }
    onClose();
  };

  const handleRotate = (degrees: number) => {
    if (!isImage) return;
    const currentTransform = block.styles?.transform || '';
    const currentRotation = extractRotation(currentTransform);
    const currentScaleX = extractScaleX(currentTransform);
    const currentScaleY = extractScaleY(currentTransform);
    const newRotation = (currentRotation + degrees) % 360;
    
    const parts: string[] = [`rotate(${newRotation}deg)`];
    if (currentScaleX !== 1) {
      parts.push(`scaleX(${currentScaleX})`);
    }
    if (currentScaleY !== 1) {
      parts.push(`scaleY(${currentScaleY})`);
    }
    
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        transform: parts.join(' '),
      },
    });
    onClose();
  };

  const handleFlipHorizontal = () => {
    if (!isImage) return;
    const currentScaleX = extractScaleX(block.styles.transform || '');
    const newScaleX = currentScaleX === -1 ? 1 : -1;
    const currentRotation = extractRotation(block.styles.transform || '');
    const currentScaleY = extractScaleY(block.styles.transform || '');
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        transform: `rotate(${currentRotation}deg) scaleX(${newScaleX}) scaleY(${currentScaleY})`,
      },
    });
    onClose();
  };

  const handleFlipVertical = () => {
    if (!isImage) return;
    const currentScaleY = extractScaleY(block.styles.transform || '');
    const newScaleY = currentScaleY === -1 ? 1 : -1;
    const currentRotation = extractRotation(block.styles.transform || '');
    const currentScaleX = extractScaleX(block.styles.transform || '');
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        transform: `rotate(${currentRotation}deg) scaleX(${currentScaleX}) scaleY(${newScaleY})`,
      },
    });
    onClose();
  };

  const handleResetTransform = () => {
    if (!isImage) return;
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        transform: 'rotate(0deg) scaleX(1) scaleY(1)',
      },
    });
    onClose();
  };

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

  return (
    <ContextMenuContainer
      data-context-menu
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {isImage && (
        <>
          <MenuItem onClick={handleSetBackground}>
            <FaImage />
            Tetapkan sebagai Gambar Utama
          </MenuItem>
          <Separator />
        </>
      )}
      
      <MenuItem onClick={handleEdit}>
        <FaEdit />
        Edit
      </MenuItem>
      
      <MenuItem onClick={handleDuplicate}>
        <FaCopy />
        Duplikat
      </MenuItem>
      
      {isImage && (
        <>
          <Separator />
          <div style={{ position: 'relative' }}>
            <MenuItemWithSubmenu
              ref={menuItemRef}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                setShowRotateSubmenu(!showRotateSubmenu);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaSync />
                Rotasi & Transform
              </div>
              <FaChevronRight style={{ 
                transform: submenuPosition === 'left' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s'
              }} />
            </MenuItemWithSubmenu>
            <AnimatePresence>
              {showRotateSubmenu && (
                <SubMenuContainer
                  ref={rotateSubmenuRef}
                  data-submenu
                  $position={submenuPosition}
                  initial={{ opacity: 0, x: submenuPosition === 'right' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: submenuPosition === 'right' ? -10 : 10 }}
                  transition={{ duration: 0.15 }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                >
                  <MenuItem 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      handleRotate(90); 
                    }}
                  >
                    <FaRedo />
                    Rotasi 90°
                  </MenuItem>
                  <MenuItem 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      handleRotate(180); 
                    }}
                  >
                    <FaSync />
                    Rotasi 180°
                  </MenuItem>
                  <Separator />
                  <MenuItem 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      handleFlipHorizontal(); 
                    }}
                  >
                    <FaUndo style={{ transform: 'scaleX(-1)' }} />
                    Balik Horizontal
                  </MenuItem>
                  <MenuItem 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      handleFlipVertical(); 
                    }}
                  >
                    <FaUndo style={{ transform: 'rotate(180deg) scaleX(-1)' }} />
                    Balik Vertikal
                  </MenuItem>
                  <Separator />
                  <MenuItem 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      handleResetTransform(); 
                    }}
                  >
                    <FaSync />
                    Reset Transform
                  </MenuItem>
                </SubMenuContainer>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
      
      <Separator />
      
      <MenuItem onClick={handleToggleLock}>
        {isLocked ? <FaUnlock /> : <FaLock />}
        {isLocked ? 'Buka Kunci' : 'Kunci'}
      </MenuItem>
      
      <Separator />
      
      <MenuItem onClick={handleMoveUp} disabled={!canMoveUp}>
        <FaArrowUp />
        Pindah ke Atas
      </MenuItem>
      
      <MenuItem onClick={handleMoveDown} disabled={!canMoveDown}>
        <FaArrowDown />
        Pindah ke Bawah
      </MenuItem>
      
      <MenuItem onClick={handleMoveToFront}>
        <FaLayerGroup />
        Ke Depan
      </MenuItem>
      
      <MenuItem onClick={handleMoveToBack}>
        <FaLayerGroup style={{ transform: 'rotate(180deg)' }} />
        Ke Belakang
      </MenuItem>
      
      <Separator />
      
      <MenuItem onClick={handleDelete} style={{ color: '#ff6b6b' }}>
        <FaTrash />
        Hapus
      </MenuItem>
    </ContextMenuContainer>
  );
}
