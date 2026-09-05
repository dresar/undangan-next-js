'use client';

import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrash, 
  FaArrowUp,
  FaArrowDown,
  FaCopy,
  FaLock,
  FaLockOpen,
  FaEdit,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';
import { Block } from '@/types/block';
import { useEffect, useRef } from 'react';

const ContextMenuContainer = styled(motion.div)`
  position: fixed;
  background: #2a2a2a;
  border: 1px solid #4a4a4a;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 4px;
  z-index: 10002;
  min-width: 180px;
  overflow: hidden;
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

interface LayerContextMenuProps {
  x: number;
  y: number;
  block: Block;
  onClose: () => void;
}

export default function LayerContextMenu({ x, y, block, onClose }: LayerContextMenuProps) {
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  const duplicateBlock = useEditorStore((state) => state.duplicateBlock);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const moveBlock = useEditorStore((state) => state.moveBlock);
  const blocks = useEditorStore((state) => state.blocks);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLocked = block.locked || false;
  const blockIndex = blocks.findIndex((b) => b.id === block.id);
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < blocks.length - 1;
  const isSection = block.type === 'section';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [onClose]);

  // Adjust position if menu goes off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      let adjustedX = x;
      let adjustedY = y;

      if (rect.right > screenWidth) {
        adjustedX = screenWidth - rect.width - 10;
      }
      if (rect.bottom > screenHeight) {
        adjustedY = screenHeight - rect.height - 10;
      }
      if (adjustedX < 10) adjustedX = 10;
      if (adjustedY < 10) adjustedY = 10;

      if (adjustedX !== x || adjustedY !== y) {
        menuRef.current.style.left = `${adjustedX}px`;
        menuRef.current.style.top = `${adjustedY}px`;
      }
    }
  }, [x, y]);

  const handleEdit = () => {
    setSelectedId(block.id);
    onClose();
  };

  const handleDelete = () => {
    deleteBlock(block.id);
    onClose();
  };

  const handleDuplicate = () => {
    duplicateBlock(block.id);
    onClose();
  };

  const handleToggleLock = () => {
    toggleLock(block.id);
    onClose();
  };

  const handleMoveUp = () => {
    if (canMoveUp) {
      moveBlock(block.id, 'up');
      onClose();
    }
  };

  const handleMoveDown = () => {
    if (canMoveDown) {
      moveBlock(block.id, 'down');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <ContextMenuContainer
        ref={menuRef}
        data-context-menu
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <FaEdit />
          Edit
        </MenuItem>

        <MenuItem onClick={handleDuplicate}>
          <FaCopy />
          Duplikat
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

        <Separator />

        <MenuItem onClick={handleToggleLock}>
          {isLocked ? (
            <>
              <FaLockOpen />
              Buka Kunci
            </>
          ) : (
            <>
              <FaLock />
              Kunci
            </>
          )}
        </MenuItem>

        <Separator />

        <MenuItem onClick={handleDelete} style={{ color: '#ff6b6b' }}>
          <FaTrash />
          Hapus
        </MenuItem>
      </ContextMenuContainer>
    </AnimatePresence>
  );
}

