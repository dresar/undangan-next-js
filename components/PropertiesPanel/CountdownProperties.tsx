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

interface CountdownPropertiesProps {
  block: Block;
}

export default function CountdownProperties({ block }: CountdownPropertiesProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const targetDate = block.content
    ? new Date(block.content).toISOString().slice(0, 16)
    : '';

  return (
    <PropertyGroup>
      <PropertyLabel>Target Date & Time</PropertyLabel>
      <PropertyInput
        type="datetime-local"
        value={targetDate}
        onChange={(e) =>
          updateBlock(block.id, { content: new Date(e.target.value).toISOString() })
        }
      />
    </PropertyGroup>
  );
}

