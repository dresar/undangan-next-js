'use client';

import React from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';

interface MapPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const MapProperties: React.FC<MapPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const coordinates = typeof block.content === 'object' && block.content !== null
    ? block.content
    : { lat: -6.2088, lng: 106.8456 };

  const handleCoordinateChange = (key: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateContent({
        ...coordinates,
        [key]: numValue,
      });
    }
  };

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Latitude</PropertyLabel>
        <PropertyInput
          type="number"
          step="0.000001"
          value={coordinates.lat || -6.2088}
          onChange={(e) => handleCoordinateChange('lat', e.target.value)}
          placeholder="-6.2088"
        />
        <PropertyNote>
          Koordinat latitude (garis lintang) lokasi
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Longitude</PropertyLabel>
        <PropertyInput
          type="number"
          step="0.000001"
          value={coordinates.lng || 106.8456}
          onChange={(e) => handleCoordinateChange('lng', e.target.value)}
          placeholder="106.8456"
        />
        <PropertyNote>
          Koordinat longitude (garis bujur) lokasi
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Height (Tinggi)</PropertyLabel>
        <PropertyInput
          type="text"
          value={(block.styles as any).height || '300px'}
          onChange={(e) => updateStyle('height', e.target.value)}
          placeholder="300px"
        />
        <PropertyNote>
          Tinggi peta dalam pixel
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyNote style={{ fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
          💡 Tips: Gunakan Google Maps untuk mendapatkan koordinat. Klik kanan pada lokasi → "What's here?" → salin koordinat
        </PropertyNote>
      </PropertySection>
    </>
  );
};

