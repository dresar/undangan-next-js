'use client';

import styled from 'styled-components';
import { FaTrash, FaCopy, FaEdit, FaLock, FaUnlock } from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';
import { motion } from 'framer-motion';

const ToolbarContainer = styled(motion.div)`
  position: absolute;
  bottom: -40px;
  right: 0;
  display: flex;
  gap: 2px;
  background: #3b82f6;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  font-size: 12px;
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
  border-radius: 2px;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

interface ContainerToolbarProps {
  containerId: string;
}

export default function ContainerToolbar({ containerId }: ContainerToolbarProps) {
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  const duplicateBlock = useEditorStore((state) => state.duplicateBlock);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const blocks = useEditorStore((state) => state.blocks);

  const container = blocks.find(b => b.id === containerId);
  const isLocked = container?.locked || false;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(containerId);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateBlock(containerId);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(containerId);
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLock(containerId);
  };

  return (
    <ToolbarContainer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      data-toolbar="true"
      onClick={(e) => e.stopPropagation()}
    >
      <ToolbarButton onClick={handleEdit} title="Edit">
        <FaEdit />
      </ToolbarButton>
      <ToolbarButton onClick={handleToggleLock} title={isLocked ? "Unlock" : "Lock"}>
        {isLocked ? <FaLock /> : <FaUnlock />}
      </ToolbarButton>
      <ToolbarButton onClick={handleDuplicate} title="Duplikat">
        <FaCopy />
      </ToolbarButton>
      <ToolbarButton onClick={handleDelete} title="Hapus">
        <FaTrash />
      </ToolbarButton>
    </ToolbarContainer>
  );
}

