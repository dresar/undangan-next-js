'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';
import * as FaIcons from 'react-icons/fa';

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 50px;
`;

interface IconBlockProps {
  block: Block;
}

export default function IconBlock({ block }: IconBlockProps) {
  const content = typeof block.content === 'object' && block.content !== null
    ? block.content
    : { name: 'FaHeart', size: 24, color: '#ff0000' };
  
  const iconName = content.name || 'FaHeart';
  const iconSize = content.size || 24;
  const iconColor = content.color || '#ff0000';

  // Get icon component from react-icons
  const IconComponent = (FaIcons as any)[iconName] || FaIcons.FaHeart;

  return (
    <IconContainer style={block.styles}>
      <IconComponent size={iconSize} color={iconColor} />
    </IconContainer>
  );
}

