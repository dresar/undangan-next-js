'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';

const SpacerContainer = styled.div`
  width: 100%;
  background: repeating-linear-gradient(
    45deg,
    #f0f0f0,
    #f0f0f0 10px,
    #ffffff 10px,
    #ffffff 20px
  );
  border: 1px dashed #cccccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 12px;
`;

interface SpacerBlockProps {
  block: Block;
}

export default function SpacerBlock({ block }: SpacerBlockProps) {
  const height = block.content?.height || 40;

  return (
    <SpacerContainer
      style={{
        ...block.styles,
        height: `${height}px`,
        minHeight: `${height}px`,
      }}
    >
      Spacer ({height}px)
    </SpacerContainer>
  );
}

