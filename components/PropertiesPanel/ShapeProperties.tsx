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

const SelectInput = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ColorInput = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
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

interface ShapePropertiesProps {
  block: Block;
}

export default function ShapeProperties({ block }: ShapePropertiesProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const updateStyle = (key: string, value: any) => {
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        [key]: value,
      },
    });
  };

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Shape Type</PropertyLabel>
        <SelectInput
          value={block.content || 'rectangle'}
          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
        >
          <option value="rectangle">Rectangle</option>
          <option value="rounded">Rounded Rectangle</option>
          <option value="circle">Circle</option>
        </SelectInput>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Background Color</PropertyLabel>
        <ColorInput
          type="color"
          value={block.styles.backgroundColor || '#007bff'}
          onChange={(e) => updateStyle('backgroundColor', e.target.value)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Width</PropertyLabel>
        <PropertyInput
          type="text"
          value={block.styles.width || '100px'}
          onChange={(e) => updateStyle('width', e.target.value)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Height</PropertyLabel>
        <PropertyInput
          type="text"
          value={block.styles.height || '100px'}
          onChange={(e) => updateStyle('height', e.target.value)}
        />
      </PropertyGroup>
    </>
  );
}

