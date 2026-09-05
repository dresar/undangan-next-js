'use client';

import React, { useState } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';
import ImageGalleryModal from '../../Modal/ImageGalleryModal';

interface ImageTransitionPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const ImageTransitionProperties: React.FC<ImageTransitionPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const content = typeof block.content === 'object' && block.content !== null
    ? block.content
    : { images: [], interval: 3000 };
  
  const images = Array.isArray(content.images) ? content.images : [];
  const interval = content.interval || 3000;

  const handleAddImage = (url: string) => {
    updateContent({
      ...content,
      images: [...images, url],
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_: any, i: number) => i !== index);
    updateContent({
      ...content,
      images: newImages,
    });
  };

  const handleIntervalChange = (value: number) => {
    updateContent({
      ...content,
      interval: value,
    });
  };

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Gambar Transition</PropertyLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
          {images.map((img: string, index: number) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                background: '#2a2a2a',
                borderRadius: '4px',
                border: '1px solid #4a4a4a',
              }}
            >
              <img
                src={img}
                alt={`Transition ${index + 1}`}
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
              <div style={{ flex: 1, fontSize: '11px', color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Gambar {index + 1}
              </div>
              <button
                onClick={() => handleRemoveImage(index)}
                style={{
                  padding: '4px 8px',
                  background: '#ff4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                Hapus
              </button>
            </div>
          ))}
          
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '10px',
              background: '#ff6b35',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            + Tambah Gambar
          </button>
        </div>
        <PropertyNote>
          Tambahkan beberapa gambar untuk transisi otomatis. Gambar akan berganti secara otomatis.
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <Slider
          label="Interval (ms)"
          value={interval}
          onChange={handleIntervalChange}
          min={1000}
          max={10000}
          step={500}
        />
        <PropertyNote>
          Waktu transisi antar gambar dalam milidetik (1000ms = 1 detik)
        </PropertyNote>
      </PropertySection>

      <ImageGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(url) => {
          handleAddImage(url);
          setIsModalOpen(false);
        }}
      />
    </>
  );
};

