'use client';

import styled from 'styled-components';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { BlockType, Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const ComponentItem = styled(motion.div)<{ $isDragging: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  min-height: 70px;

  &:hover {
    border-color: #5a5a5a;
    background: #444444;
    transform: translateY(-2px);
  }

  &:active {
    cursor: grabbing;
  }
`;

const IconWrapper = styled.div`
  font-size: 20px;
  color: #cccccc;
  margin-bottom: 6px;
`;

const Label = styled.span`
  font-size: 11px;
  color: #cccccc;
  font-weight: 400;
  text-align: center;
  line-height: 1.2;
`;

interface ComponentItem {
  type: string | BlockType;
  label: string;
  icon: React.ReactNode;
}

interface ComponentGridProps {
  items: ComponentItem[];
}

export default function ComponentGrid({ items }: ComponentGridProps) {
  return (
    <GridContainer>
      {items.map((item) => (
        <DraggableComponentItem key={item.type} item={item} />
      ))}
    </GridContainer>
  );
}

function DraggableComponentItem({ item }: { item: ComponentItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `component-${item.type}`,
  });
  const getSections = useEditorStore((state) => state.getSections);
  const addComponentToSection = useEditorStore((state) => state.addComponentToSection);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);

  const getDefaultContent = (type: Block['type']): any => {
    switch (type) {
      case 'text':
        return 'Klik untuk mengedit teks';
      case 'image':
        return '/media/default/image-placeholder.svg';
      case 'video':
        return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      case 'map':
        return { lat: -6.2088, lng: 106.8456 };
      case 'countdown':
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'button':
        return 'Klik Disini';
      case 'shape':
        return 'rectangle';
      case 'spacer':
        return { height: 40 };
      case 'masonry':
        return [
          '/media/default/image-placeholder.svg',
          '/media/default/image-placeholder.svg',
          '/media/default/image-placeholder.svg',
        ];
      case 'gallery':
        return [
          '/media/default/image-placeholder.svg',
          '/media/default/image-placeholder.svg',
          '/media/default/image-placeholder.svg',
        ];
      case 'imageTransition':
        return {
          images: [
            '/media/default/image-placeholder.svg',
            '/media/default/image-placeholder.svg',
          ],
          interval: 3000,
        };
      case 'form':
        return {
          fields: [
            { type: 'text', label: 'Nama', placeholder: 'Masukkan nama' },
            { type: 'email', label: 'Email', placeholder: 'Masukkan email' },
          ],
        };
      case 'icon':
        return { name: 'FaHeart', size: 24, color: '#ff0000' };
      case 'bank':
        return {
          name: 'Bank BCA',
          account: '1234567890',
          holder: 'Nama Pemilik',
        };
      case 'gift':
        return {
          title: 'Kirim Hadiah',
          description: 'Kirim hadiah untuk pasangan',
          accounts: [],
        };
      default:
        return '';
    }
  };

  const getDefaultStyles = (type: Block['type']): any => {
    const baseStyles: any = {
      padding: '10px',
      margin: '10px 0',
    };

    switch (type) {
      case 'text':
        return {
          ...baseStyles,
          fontSize: '16px',
          color: '#000000',
          textAlign: 'left',
        };
      case 'image':
        return {
          ...baseStyles,
        };
      case 'button':
        return {
          ...baseStyles,
          backgroundColor: '#007bff',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center',
        };
      default:
        return baseStyles;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const sections = getSections();
    if (sections.length === 0) return;
    
    const firstSection = sections[0];
    const componentType = item.type as Block['type'];
    
    const newComponent: Block = {
      id: `${componentType}-${Date.now()}-${Math.random()}`,
      type: componentType,
      parentId: firstSection.id,
      children: [],
      content: getDefaultContent(componentType),
      styles: getDefaultStyles(componentType),
      position: componentType === 'image' ? { x: 20, y: 20 } : undefined,
      size: componentType === 'image' ? { width: 200, height: 200 } : undefined,
    };
    
    addComponentToSection(firstSection.id, newComponent);
    setSelectedId(newComponent.id);
  };

  return (
    <ComponentItem
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      $isDragging={isDragging}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ cursor: 'grab' }}
      data-component-item="true"
      onClick={handleClick}
    >
      <IconWrapper>{item.icon}</IconWrapper>
      <Label>{item.label}</Label>
    </ComponentItem>
  );
}

