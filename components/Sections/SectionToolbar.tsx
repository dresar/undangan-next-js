'use client';

import styled from 'styled-components';
import { FaTrash, FaCopy, FaEdit, FaLock, FaUnlock } from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';
import { motion } from 'framer-motion';

const ToolbarContainer = styled(motion.div)`
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translateY(100%);
  display: flex;
  gap: 2px;
  background: #dc2626;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface SectionToolbarProps {
  sectionId: string;
}

export default function SectionToolbar({ sectionId }: SectionToolbarProps) {
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  const duplicateBlock = useEditorStore((state) => state.duplicateBlock);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const blocks = useEditorStore((state) => state.blocks);
  const getSections = useEditorStore((state) => state.getSections);

  const section = blocks.find(b => b.id === sectionId);
  const isLocked = section?.locked || false;

  const sections = getSections();
  const sectionIndex = sections.findIndex(s => s.id === sectionId);
  const isFirstSection = sectionIndex === 0;
  const isLastSection = sectionIndex === sections.length - 1;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(sectionId);
    setSelectedId(null);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateBlock(sectionId);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(sectionId);
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLock(sectionId);
  };

  return (
    <ToolbarContainer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      onClick={(e) => e.stopPropagation()}
      data-toolbar="true"
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
