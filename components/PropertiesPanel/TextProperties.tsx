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

interface TextPropertiesProps {
  block: Block;
}

export default function TextProperties({ block }: TextPropertiesProps) {
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
        <PropertyLabel>Text Content</PropertyLabel>
        <PropertyInput
          type="text"
          value={block.content || ''}
          onChange={(e) =>
            updateBlock(block.id, { content: e.target.value })
          }
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Font Size</PropertyLabel>
        <PropertyInput
          type="number"
          value={parseInt(block.styles.fontSize as string) || 16}
          onChange={(e) => updateStyle('fontSize', `${e.target.value}px`)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Text Color</PropertyLabel>
        <ColorInput
          type="color"
          value={block.styles.color || '#000000'}
          onChange={(e) => updateStyle('color', e.target.value)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Text Align</PropertyLabel>
        <SelectInput
          value={block.styles.textAlign || 'left'}
          onChange={(e) => updateStyle('textAlign', e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </SelectInput>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Padding</PropertyLabel>
        <PropertyInput
          type="text"
          value={block.styles.padding || '10px'}
          onChange={(e) => updateStyle('padding', e.target.value)}
          placeholder="e.g., 10px or 10px 20px"
        />
      </PropertyGroup>
    </>
  );
}

