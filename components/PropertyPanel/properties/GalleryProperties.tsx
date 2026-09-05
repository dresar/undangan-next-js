'use client';

import React, { useState } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertyNote } from '../shared/styled';
import ImageGalleryModal from '../../Modal/ImageGalleryModal';

interface GalleryPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const GalleryProperties: React.FC<GalleryPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const images = Array.isArray(block.content) ? block.content : [];

  const handleAddImage = (url: string) => {
    updateContent([...images, url]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_: any, i: number) => i !== index);
    updateContent(newImages);
  };

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Gambar Gallery</PropertyLabel>
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
                alt={`Gallery ${index + 1}`}
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
              <div style={{ flex: 1, fontSize: '11px', color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {img}
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
          Tambahkan gambar untuk gallery. Gallery akan menampilkan gambar dalam grid 3 kolom.
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

