'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Block } from '@/types/block';
import ImageGalleryModal from '../../Modal/ImageGalleryModal';
import { PropertySection, PropertyLabel, PropertyInput, PropertySelect, PropertyNote } from '../shared/styled';

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #4a4a4a;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '📄';
    font-size: 18px;
  }
`;

const ImagePreview = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 120px;
  border: 2px dashed #4a4a4a;
  border-radius: 4px;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : '#1a1a1a'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;

  ${props => !props.$imageUrl && `
    &::before {
      content: '📷';
      font-size: 32px;
      opacity: 0.3;
    }
  `}
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  z-index: 1;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const ColorInput = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  cursor: pointer;
  background: #3a3a3a;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #ff6b35;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;

  &:hover {
    background: #ff5722;
  }
`;

const NumberInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  font-size: 12px;
  background: #3a3a3a;
  color: #ffffff;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  &[type='number'] {
    -moz-appearance: textfield;
    
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: inner-spin-button;
      opacity: 1;
      cursor: pointer;
    }
  }
`;

interface SectionPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
}

export const SectionProperties: React.FC<SectionPropertiesProps> = ({
  block,
  updateStyle,
}) => {
  const styles = block.styles || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backgroundImage = styles.backgroundImage || '';

  const extractNumber = (value: any, defaultValue: number = 0): number => {
    if (!value) return defaultValue;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseInt(value.replace(/px|%|em|rem/g, '').trim());
      return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
  };

  const minHeightValue = extractNumber(styles.minHeight, 100);

  const handleImageSelect = (url: string) => {
    updateStyle('backgroundImage', url);
    setIsModalOpen(false);
    
    const img = new Image();
    img.onload = () => {
      const imageHeight = img.height;
      const calculatedHeight = Math.max(150, imageHeight + 40);
      updateStyle('minHeight', `${calculatedHeight}px`);
    };
    img.onerror = () => {
      updateStyle('minHeight', '300px');
    };
    img.src = url;
  };

  const handleRemoveImage = () => {
    updateStyle('backgroundImage', '');
    updateStyle('minHeight', '100px');
  };

  return (
    <>
      <Title>Pengaturan Section</Title>

      <PropertySection>
        <PropertyLabel>Background Image</PropertyLabel>
        <ImagePreview $imageUrl={backgroundImage}>
          {backgroundImage && (
            <RemoveButton onClick={handleRemoveImage}>
              ✕ Hapus
            </RemoveButton>
          )}
        </ImagePreview>
        <InputGroup>
          <PropertyInput
            type="url"
            value={backgroundImage}
            onChange={(e) => updateStyle('backgroundImage', e.target.value)}
            placeholder="URL gambar atau klik Pilih"
            style={{ flex: 1 }}
          />
          <Button onClick={() => setIsModalOpen(true)}>
            📁 Pilih
          </Button>
        </InputGroup>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Gambar latar belakang untuk section
        </PropertyNote>
      </PropertySection>

      {backgroundImage && (
        <PropertySection>
          <PropertyLabel>Background Size</PropertyLabel>
          <PropertySelect
            value={styles.backgroundSize || '100% 100%'}
            onChange={(e) => updateStyle('backgroundSize', e.target.value)}
          >
            <option value="100% 100%">Ukuran Asli (Full)</option>
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
          </PropertySelect>
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Ukuran latar belakang gambar
          </PropertyNote>
        </PropertySection>
      )}

      <PropertySection>
        <PropertyLabel>Background Color</PropertyLabel>
        <ColorInput
          type="color"
          value={styles.backgroundColor || '#ffffff'}
          onChange={(e) => updateStyle('backgroundColor', e.target.value)}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Warna latar belakang section
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Min Height</PropertyLabel>
        <NumberInput
          type="number"
          value={minHeightValue}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            updateStyle('minHeight', `${Math.max(50, Math.min(2000, val))}px`);
          }}
          min={50}
          max={2000}
          step={10}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Tinggi minimum section (50px - 2000px). Gambar akan mengikuti tinggi ini.
        </PropertyNote>
      </PropertySection>

      <ImageGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleImageSelect}
      />
    </>
  );
};

