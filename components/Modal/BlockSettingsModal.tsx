'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEdit, FaLock, FaUnlock, FaTrash } from 'react-icons/fa';
import PropertyPanel from '../LeftSidebar/PropertyPanel';
import { Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10000;
  pointer-events: auto;
`;

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #2a2a2a;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  background: #1f1f1f;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #3a3a3a;
  }
`;

const FloatingToolbar = styled(motion.div)`
  position: absolute;
  top: -45px;
  right: 0;
  display: flex;
  gap: 2px;
  background: #ff4444;
  border: none;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1001;
`;

const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;

interface BlockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: Block | null;
}

export default function BlockSettingsModal({ isOpen, onClose, block }: BlockSettingsModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const blocks = useEditorStore((state) => state.blocks);
  const currentBlock = blocks.find((b) => b.id === block?.id);
  const isLocked = currentBlock?.locked || false;

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      // Reset position saat modal dibuka - posisi di tengah kanan layar
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      setPosition({ 
        x: windowWidth - 420, 
        y: Math.max(50, (windowHeight - 600) / 2) 
      });
    }
  }, [isOpen]);

  const handleDelete = () => {
    if (block) {
      deleteBlock(block.id);
      onClose();
    }
  };

  const handleToggleLock = () => {
    if (block) {
      toggleLock(block.id);
    }
  };

  if (!isOpen || !block) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Rnd
            size={size}
            position={position}
            onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) => {
              setSize({
                width: ref.offsetWidth,
                height: ref.offsetHeight,
              });
              setPosition(position);
            }}
            minWidth={350}
            minHeight={400}
            maxWidth={window.innerWidth - 100}
            maxHeight={window.innerHeight - 100}
            bounds="window"
            style={{
              zIndex: 10001,
              position: 'fixed',
            }}
            dragHandleClassName="modal-header"
          >
            <ModalContainer>
              <ModalHeader className="modal-header">
                <ModalTitle>
                  Pengaturan {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                </ModalTitle>
                <HeaderActions>
                  <ActionButton onClick={handleToggleLock} title={isLocked ? "Buka Kunci" : "Kunci"}>
                    {isLocked ? <FaLock /> : <FaUnlock />}
                  </ActionButton>
                  <ActionButton onClick={handleDelete} title="Hapus">
                    <FaTrash />
                  </ActionButton>
                  <ActionButton onClick={onClose} title="Tutup">
                    <FaTimes />
                  </ActionButton>
                </HeaderActions>
              </ModalHeader>
              <ModalContent>
                <PropertyPanel block={block} />
              </ModalContent>
              <FloatingToolbar
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ToolbarButton onClick={handleToggleLock} title={isLocked ? "Buka Kunci" : "Kunci"}>
                  {isLocked ? <FaLock /> : <FaUnlock />}
                </ToolbarButton>
                <ToolbarButton onClick={handleDelete} title="Hapus">
                  <FaTrash />
                </ToolbarButton>
              </FloatingToolbar>
            </ModalContainer>
          </Rnd>
        </>
      )}
    </AnimatePresence>
  );
}

