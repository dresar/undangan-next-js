'use client';

import styled from 'styled-components';
import { useEditorStore } from '@/store/useEditorStore';
import { Block } from '@/types/block';
import { motion, AnimatePresence } from 'framer-motion';
import TextProperties from './TextProperties';
import ImageProperties from './ImageProperties';
import VideoProperties from './VideoProperties';
import MapProperties from './MapProperties';
import CountdownProperties from './CountdownProperties';
import ButtonProperties from './ButtonProperties';
import ShapeProperties from './ShapeProperties';
import SpacerProperties from './SpacerProperties';

const PanelContainer = styled(motion.div)`
  width: 320px;
  background: #ffffff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const PanelHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f8f8;
`;

const PanelTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
`;

const PanelSubtitle = styled.p`
  font-size: 12px;
  color: #666666;
  margin: 4px 0 0 0;
`;

const PanelContent = styled.div`
  flex: 1;
  padding: 20px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999999;
  text-align: center;
  padding: 40px;
`;

const renderProperties = (block: Block) => {
  switch (block.type) {
    case 'text':
      return <TextProperties block={block} />;
    case 'image':
      return <ImageProperties block={block} />;
    case 'video':
      return <VideoProperties block={block} />;
    case 'map':
      return <MapProperties block={block} />;
    case 'countdown':
      return <CountdownProperties block={block} />;
    case 'button':
      return <ButtonProperties block={block} />;
    case 'shape':
      return <ShapeProperties block={block} />;
    case 'spacer':
      return <SpacerProperties block={block} />;
    default:
      return <div>Tidak ada properti yang tersedia</div>;
  }
};

export default function PropertiesPanel() {
  const selectedId = useEditorStore((state) => state.selectedId);
  const blocks = useEditorStore((state) => state.blocks);

  const selectedBlock = blocks.find((b) => b.id === selectedId);

  return (
    <AnimatePresence>
      {selectedBlock ? (
        <PanelContainer
          key={selectedBlock.id}
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <PanelHeader>
            <PanelTitle>Properti</PanelTitle>
            <PanelSubtitle>
              Blok {selectedBlock.type.charAt(0).toUpperCase() +
                selectedBlock.type.slice(1)}
            </PanelSubtitle>
          </PanelHeader>
          <PanelContent>{renderProperties(selectedBlock)}</PanelContent>
        </PanelContainer>
      ) : (
        <PanelContainer
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
        >
          <EmptyState>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>
              Tidak ada elemen yang dipilih
            </p>
            <p style={{ fontSize: '14px' }}>
              Klik pada elemen untuk mengedit propertinya
            </p>
          </EmptyState>
        </PanelContainer>
      )}
    </AnimatePresence>
  );
}

