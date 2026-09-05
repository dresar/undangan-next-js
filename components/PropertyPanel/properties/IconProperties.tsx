'use client';

import React, { useMemo, useCallback } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertySelect, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';

interface IconPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const IconProperties: React.FC<IconPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const content = useMemo(() => {
    return typeof block.content === 'object' && block.content !== null
      ? block.content
      : { name: 'FaHeart', size: 24, color: '#ff0000' };
  }, [block.content]);

  const handleContentUpdate = useCallback((key: string, value: any) => {
    const currentContent = typeof block.content === 'object' && block.content !== null
      ? block.content
      : { name: 'FaHeart', size: 24, color: '#ff0000' };
    
    updateContent({
      ...currentContent,
      [key]: value,
    });
  }, [block.content, updateContent]);

  // Daftar icon populer dari react-icons/fa
  const iconOptions = [
    { value: 'FaHeart', label: 'Heart (Hati)' },
    { value: 'FaStar', label: 'Star (Bintang)' },
    { value: 'FaMusic', label: 'Music (Musik)' },
    { value: 'FaHome', label: 'Home (Rumah)' },
    { value: 'FaUser', label: 'User (Pengguna)' },
    { value: 'FaEnvelope', label: 'Envelope (Surat)' },
    { value: 'FaPhone', label: 'Phone (Telepon)' },
    { value: 'FaMapMarkerAlt', label: 'Map Marker (Lokasi)' },
    { value: 'FaCalendar', label: 'Calendar (Kalender)' },
    { value: 'FaClock', label: 'Clock (Jam)' },
    { value: 'FaGift', label: 'Gift (Hadiah)' },
    { value: 'FaCamera', label: 'Camera (Kamera)' },
    { value: 'FaVideo', label: 'Video' },
    { value: 'FaImage', label: 'Image (Gambar)' },
    { value: 'FaThumbsUp', label: 'Thumbs Up (Jempol)' },
    { value: 'FaComment', label: 'Comment (Komentar)' },
    { value: 'FaShare', label: 'Share (Bagikan)' },
    { value: 'FaSearch', label: 'Search (Cari)' },
    { value: 'FaBell', label: 'Bell (Notifikasi)' },
    { value: 'FaCog', label: 'Cog (Pengaturan)' },
  ];

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Icon Name</PropertyLabel>
        <PropertySelect
          value={content.name || 'FaHeart'}
          onChange={(e) => handleContentUpdate('name', e.target.value)}
        >
          {iconOptions.map((icon) => (
            <option key={icon.value} value={icon.value}>
              {icon.label}
            </option>
          ))}
        </PropertySelect>
        <PropertyNote>
          Pilih icon dari react-icons/fa. Pastikan icon name dimulai dengan "Fa"
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <Slider
          label="Icon Size"
          value={content.size || 24}
          onChange={(v) => handleContentUpdate('size', v)}
          min={12}
          max={100}
        />
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Icon Color</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: content.color || '#ff0000',
              border: '2px solid #4a4a4a',
            }}
          />
          <button
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = content.color || '#ff0000';
              colorInput.onchange = (e: any) => handleContentUpdate('color', e.target.value);
              colorInput.click();
            }}
            style={{
              padding: '8px 16px',
              background: '#ff6b35',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ✏️ Ubah Warna
          </button>
        </div>
      </PropertySection>
    </>
  );
};

