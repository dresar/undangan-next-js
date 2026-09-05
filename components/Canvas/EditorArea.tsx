'use client';

import styled from 'styled-components';
import { useEditorStore } from '@/store/useEditorStore';
import SectionBlock from '../Sections/SectionBlock';
import React, { useEffect } from 'react';

const DeviceWrapper = styled.div<{ $deviceView: string }>`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;
  overflow-x: auto;
  overflow-y: auto;
`;

const SectionsContainer = styled.div<{ $deviceView: string }>`
  width: 100%;
  max-width: ${props => {
    if (props.$deviceView === 'mobile') return '375px';
    if (props.$deviceView === 'tablet') return '768px';
    if (props.$deviceView === 'desktop') return '1400px';
    return '375px';
  }};
  margin: 0 auto;
  display: block;
  background-color: #ffffff;
  min-height: 100vh;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  transition: max-width 0.3s ease;
  position: relative;
  overflow: clip;
  overflow-clip-margin: 50px;
`;

const AddSectionButton = styled.button<{ $deviceView: string }>`
  width: calc(100% - 40px);
  max-width: ${props => {
    if (props.$deviceView === 'mobile') return '335px';
    if (props.$deviceView === 'tablet') return '728px';
    if (props.$deviceView === 'desktop') return '1360px';
    return '335px';
  }};
  padding: 16px 24px;
  margin: 20px auto;
  background: #ff6b35;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #ff5722;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }
`;

export default function EditorArea() {
  const getSections = useEditorStore((state) => state.getSections);
  const addSection = useEditorStore((state) => state.addSection);
  const loadFromLocalStorage = useEditorStore((state) => state.loadFromLocalStorage);
  const deviceView = useEditorStore((state) => state.deviceView);
  const blocks = useEditorStore((state) => state.blocks);
  const sectionOrder = useEditorStore((state) => state.sectionOrder);
  const sections = getSections();
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    const loadData = () => {
      const loaded = loadFromLocalStorage();
      setIsLoaded(true);
      
      if (!loaded) {
        setTimeout(() => {
          const currentSections = getSections();
          if (currentSections.length === 0) {
            addSection();
          }
        }, 100);
      } else {
        setTimeout(() => {
          const currentSections = getSections();
          if (currentSections.length === 0 && blocks.length > 0) {
            const allSections = blocks.filter(b => b.type === 'section' && b.parentId === null);
            if (allSections.length > 0) {
              const newOrder = allSections.map(s => s.id);
              useEditorStore.setState({ sectionOrder: newOrder });
            }
          }
        }, 200);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded && blocks.length > 0) {
      const currentSections = getSections();
      if (currentSections.length === 0) {
        const allSections = blocks.filter(b => b.type === 'section' && b.parentId === null);
        if (allSections.length > 0) {
          const newOrder = allSections.map(s => s.id);
          useEditorStore.setState({ sectionOrder: newOrder });
        } else if (blocks.length === 0) {
          addSection();
        }
      }
    }
  }, [isLoaded, blocks.length, sectionOrder.length, getSections, addSection]);

  const handleAddSection = () => {
    addSection();
  };

  return (
    <DeviceWrapper $deviceView={deviceView} data-editor-area="true">
      <SectionsContainer $deviceView={deviceView} key={deviceView}>
        {sections.map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}
        <AddSectionButton $deviceView={deviceView} onClick={handleAddSection}>
          <span>+</span>
          Tambah Section
        </AddSectionButton>
      </SectionsContainer>
    </DeviceWrapper>
  );
}
