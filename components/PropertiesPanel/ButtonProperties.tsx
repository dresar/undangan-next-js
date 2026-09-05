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

const ColorInput = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
`;

interface ButtonPropertiesProps {
  block: Block;
}

export default function ButtonProperties({ block }: ButtonPropertiesProps) {
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
        <PropertyLabel>Button Text</PropertyLabel>
        <PropertyInput
          type="text"
          value={block.content || ''}
          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
        />
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
        <PropertyLabel>Text Color</PropertyLabel>
        <ColorInput
          type="color"
          value={block.styles.color || '#ffffff'}
          onChange={(e) => updateStyle('color', e.target.value)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Border Radius</PropertyLabel>
        <PropertyInput
          type="text"
          value={block.styles.borderRadius || '8px'}
          onChange={(e) => updateStyle('borderRadius', e.target.value)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Padding</PropertyLabel>
        <PropertyInput
          type="text"
          value={block.styles.padding || '12px 24px'}
          onChange={(e) => updateStyle('padding', e.target.value)}
        />
      </PropertyGroup>
    </>
  );
}

