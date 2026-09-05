'use client';

import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
`;

const ModalContent = styled(motion.div)`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #666666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333333;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
`;

const Required = styled.span`
  color: #ff4444;
  margin-left: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

const PreviewArea = styled.div<{ $columns: number }>`
  margin-top: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 2px dashed #ff4444;
  min-height: 120px;
  display: grid;
  grid-template-columns: repeat(${(props) => props.$columns}, 1fr);
  gap: 8px;
  pointer-events: none;
`;

const ColumnPreview = styled.div`
  background: #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  text-align: center;
  color: #666666;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border: 1px solid ${(props) => (props.$primary ? 'transparent' : '#e0e0e0')};
  background: ${(props) => (props.$primary ? '#ff6b35' : '#ffffff')};
  color: ${(props) => (props.$primary ? '#ffffff' : '#333333')};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: ${(props) => (props.$primary ? '600' : '400')};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$primary ? '#ff5722' : '#f5f5f5')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ColumnLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (columns: number) => void;
}

export default function ColumnLayoutModal({
  isOpen,
  onClose,
  onConfirm,
}: ColumnLayoutModalProps) {
  const [columns, setColumns] = useState<number>(1);

  const handleConfirm = () => {
    if (columns >= 1 && columns <= 4) {
      onConfirm(columns);
      setColumns(1); // Reset
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= 4) {
      setColumns(value);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            // Hanya close jika klik langsung di overlay, bukan di content
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <ModalContent
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => {
              // Stop propagation untuk mencegah close saat klik di dalam modal
              e.stopPropagation();
            }}
          >
            <ModalHeader>
              <ModalTitle>Buat Layout Kolom</ModalTitle>
              <CloseButton onClick={onClose}>
                <FaTimes size={20} />
              </CloseButton>
            </ModalHeader>

            <InputGroup>
              <Label>
                Jumlah Kolom<Required>*</Required>
              </Label>
              <Input
                type="number"
                min="1"
                max="4"
                value={columns}
                onChange={handleChange}
                placeholder="Masukkan jumlah kolom (1-4)"
              />
            </InputGroup>

            <PreviewArea $columns={columns}>
              {Array.from({ length: columns }).map((_, index) => (
                <ColumnPreview key={index}>
                  Kolom {index + 1}
                </ColumnPreview>
              ))}
            </PreviewArea>

            <ButtonGroup>
              <Button onClick={onClose}>Batal</Button>
              <Button $primary onClick={handleConfirm}>
                Buat Layout
              </Button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}

