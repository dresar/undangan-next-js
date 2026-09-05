'use client';

import styled from 'styled-components';
import { FaTrash, FaCopy, FaEdit } from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';
import { motion } from 'framer-motion';

const ToolbarContainer = styled(motion.div)`
  position: absolute;
  bottom: -40px;
  right: 0;
  display: flex;
  gap: 2px;
  background: #dc2626;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 0 0 4px 4px;
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

interface ImageToolbarProps {
  blockId: string;
}

export default function ImageToolbar({ blockId }: ImageToolbarProps) {
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  const duplicateBlock = useEditorStore((state) => state.duplicateBlock);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(blockId);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateBlock(blockId);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(blockId);
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
      <ToolbarButton onClick={handleDuplicate} title="Duplikat">
        <FaCopy />
      </ToolbarButton>
      <ToolbarButton onClick={handleDelete} title="Hapus">
        <FaTrash />
      </ToolbarButton>
    </ToolbarContainer>
  );
}

