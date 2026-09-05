'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';

const PropertyGroup = styled.div`
  margin-bottom: 24px;
`;

const PropertyLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
`;

const PropertyInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

interface MapPropertiesProps {
  block: Block;
}

export default function MapProperties({ block }: MapPropertiesProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const coordinates = block.content || { lat: -6.2088, lng: 106.8456 };

  const updateLat = (value: string) => {
    updateBlock(block.id, {
      content: {
        ...coordinates,
        lat: parseFloat(value) || 0,
      },
    });
  };

  const updateLng = (value: string) => {
    updateBlock(block.id, {
      content: {
        ...coordinates,
        lng: parseFloat(value) || 0,
      },
    });
  };

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Latitude</PropertyLabel>
        <PropertyInput
          type="number"
          step="any"
          value={coordinates.lat}
          onChange={(e) => updateLat(e.target.value)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Longitude</PropertyLabel>
        <PropertyInput
          type="number"
          step="any"
          value={coordinates.lng}
          onChange={(e) => updateLng(e.target.value)}
        />
      </PropertyGroup>
    </>
  );
}

