'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Block } from '@/types/block';
import ImageGalleryModal from '../../Modal/ImageGalleryModal';
import { PropertySection, PropertyLabel, PropertyInput, PropertySelect, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';

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
    content: '📦';
    font-size: 18px;
  }
`;

interface ContainerPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
}

export const ContainerProperties: React.FC<ContainerPropertiesProps> = ({
  block,
  updateStyle,
}) => {
  const containerStyles = (block.styles as any)?.containerStyles || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backgroundImage = containerStyles.backgroundImage || '';

  const extractNumber = (value: any, defaultValue: number = 0): number => {
    if (!value) return defaultValue;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseInt(value.replace(/px|%|em|rem/g, '').trim());
      return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
  };

  const paddingValue = extractNumber(containerStyles.padding, 0);
  const borderRadiusValue = extractNumber(containerStyles.borderRadius, 0);
  const maxWidthValue = extractNumber(containerStyles.maxWidth, 1400);
  const minHeightValue = extractNumber(containerStyles.minHeight, 0);

  const updateContainerStyle = (key: string, value: any) => {
    const currentStyles = block.styles || {};
    const currentContainerStyles = (currentStyles as any).containerStyles || {};
    updateStyle('containerStyles', {
      ...currentContainerStyles,
      [key]: value,
    });
  };

  const handleImageSelect = (url: string) => {
    updateContainerStyle('backgroundImage', url);
    setIsModalOpen(false);
  };

  const handleRemoveImage = () => {
    updateContainerStyle('backgroundImage', '');
  };

  return (
    <>
      <Title>Pengaturan Container</Title>

      <PropertySection>
        <PropertyLabel>Max Width</PropertyLabel>
        <PropertySelect
          value={(() => {
            const maxWidth = containerStyles.maxWidth;
            if (!maxWidth) return 'full';
            if (typeof maxWidth === 'string') {
              if (maxWidth === '100%') return 'full';
              if (maxWidth.includes('px')) {
                const px = parseInt(maxWidth);
                if (px === 1200) return '1200px';
                if (px === 1400) return '1400px';
                if (px === 1600) return '1600px';
                return 'custom';
              }
            }
            if (typeof maxWidth === 'number') {
              if (maxWidth === 1200) return '1200px';
              if (maxWidth === 1400) return '1400px';
              if (maxWidth === 1600) return '1600px';
              return 'custom';
            }
            return 'full';
          })()}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'full') {
              updateContainerStyle('maxWidth', '100%');
            } else if (value === '1200px') {
              updateContainerStyle('maxWidth', '1200px');
            } else if (value === '1400px') {
              updateContainerStyle('maxWidth', '1400px');
            } else if (value === '1600px') {
              updateContainerStyle('maxWidth', '1600px');
            } else {
              updateContainerStyle('maxWidth', '1400px');
            }
          }}
        >
          <option value="full">Full Lebar (Kanan Kiri)</option>
          <option value="1200px">1200px</option>
          <option value="1400px">1400px</option>
          <option value="1600px">1600px</option>
        </PropertySelect>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Lebar maksimum container
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Min Height</PropertyLabel>
        <NumberInput
          type="number"
          value={minHeightValue}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            updateContainerStyle('minHeight', `${Math.max(0, Math.min(5000, val))}px`);
          }}
          min={0}
          max={5000}
          step={10}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Tinggi minimum container (0px - 5000px). 0 = auto, gunakan tombol ↑↓ untuk menyesuaikan.
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Padding</PropertyLabel>
        <NumberInput
          type="number"
          value={paddingValue}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            updateContainerStyle('padding', `${Math.max(0, Math.min(200, val))}px`);
          }}
          min={0}
          max={200}
          step={5}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Jarak dalam container (0px - 200px). Gunakan tombol ↑↓ untuk menyesuaikan.
        </PropertyNote>
      </PropertySection>

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
            onChange={(e) => updateContainerStyle('backgroundImage', e.target.value)}
            placeholder="URL gambar atau klik Pilih"
            style={{ flex: 1 }}
          />
          <Button onClick={() => setIsModalOpen(true)}>
            📁 Pilih
          </Button>
        </InputGroup>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Gambar latar belakang untuk container
        </PropertyNote>
      </PropertySection>

      {backgroundImage && (
        <>
          <PropertySection>
            <PropertyLabel>Background Size</PropertyLabel>
            <PropertySelect
              value={containerStyles.backgroundSize || 'cover'}
              onChange={(e) => updateContainerStyle('backgroundSize', e.target.value)}
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
              <option value="100% 100%">Stretch</option>
            </PropertySelect>
          </PropertySection>

          <PropertySection>
            <PropertyLabel>Background Position</PropertyLabel>
            <PropertySelect
              value={containerStyles.backgroundPosition || 'center'}
              onChange={(e) => updateContainerStyle('backgroundPosition', e.target.value)}
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top left">Top Left</option>
              <option value="top right">Top Right</option>
              <option value="bottom left">Bottom Left</option>
              <option value="bottom right">Bottom Right</option>
            </PropertySelect>
          </PropertySection>

          <PropertySection>
            <PropertyLabel>Background Repeat</PropertyLabel>
            <PropertySelect
              value={containerStyles.backgroundRepeat || 'no-repeat'}
              onChange={(e) => updateContainerStyle('backgroundRepeat', e.target.value)}
            >
              <option value="no-repeat">No Repeat</option>
              <option value="repeat">Repeat</option>
              <option value="repeat-x">Repeat X</option>
              <option value="repeat-y">Repeat Y</option>
            </PropertySelect>
          </PropertySection>
        </>
      )}

      <PropertySection>
        <PropertyLabel>Background Color</PropertyLabel>
        <ColorInput
          type="color"
          value={containerStyles.backgroundColor || '#ffffff'}
          onChange={(e) => updateContainerStyle('backgroundColor', e.target.value)}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Warna latar belakang container
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Border Radius</PropertyLabel>
        <NumberInput
          type="number"
          value={borderRadiusValue}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            updateContainerStyle('borderRadius', `${Math.max(0, Math.min(100, val))}px`);
          }}
          min={0}
          max={100}
          step={1}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Sudut melengkung container (0px - 100px). Gunakan tombol ↑↓ untuk menyesuaikan.
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <Slider
          label="Opacity"
          value={Math.round((parseFloat(containerStyles.opacity as string) * 100) || 100)}
          onChange={(v) => updateContainerStyle('opacity', v / 100)}
          min={0}
          max={100}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Opacity: {Math.round((parseFloat(containerStyles.opacity as string) * 100) || 100)}%
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

