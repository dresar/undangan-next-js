'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { 
  FaTextHeight, 
  FaImage, 
  FaVideo, 
  FaMapMarkerAlt, 
  FaClock, 
  FaMousePointer, 
  FaSquare, 
  FaMinus,
  FaTh,
  FaPalette,
  FaMusic,
  FaUpload,
  FaPuzzlePiece,
  FaCog,
  FaExclamationCircle,
  FaGift,
  FaUniversity,
  FaImages,
  FaBars,
  FaChevronLeft,
  FaFont,
  FaAlignLeft,
  FaBook,
  FaCode
} from 'react-icons/fa';
import { BlockType } from '@/types/block';
import ComponentGrid from './ComponentGrid';
import PropertyPanel from '../PropertyPanel';
import UploadMenu from './UploadMenu';
import MusicSettings from './MusicSettings';
import MediaLibrary from './MediaLibrary';
import ProjectSettings from './ProjectSettings';
import TutorialJSON from './TutorialJSON';
import PluginMenu from './PluginMenu';
import { useEditorStore } from '@/store/useEditorStore';
import { motion } from 'framer-motion';

const SidebarContainer = styled.div<{ $collapsed?: boolean }>`
  width: ${(props) => (props.$collapsed ? '60px' : '380px')};
  background: #2a2a2a;
  display: flex;
  height: 100%;
  position: relative;
  transition: width 0.3s ease;
`;

const CollapseButton = styled.button`
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #000000;
  border: none;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: #333333;
    transform: translateY(-50%) scale(1.1);
  }
`;

const CategoryMenu = styled.div`
  width: 60px;
  background: #1f1f1f;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
`;

const CategoryItem = styled.button<{ $active: boolean }>`
  width: 44px;
  height: 44px;
  border: none;
  background: ${(props) => (props.$active ? '#3a3a3a' : 'transparent')};
  border-radius: 8px;
  color: ${(props) => (props.$active ? '#ffffff' : '#999999')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;
    color: #ffffff;
  }
`;

const ContentArea = styled.div<{ $collapsed?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  transition: opacity 0.2s;
  pointer-events: ${(props) => (props.$collapsed ? 'none' : 'auto')};
`;

const PropertyTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #3a3a3a;
  background: #1f1f1f;
`;

const PropertyTab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: ${(props) => (props.active ? '#ff6b35' : 'transparent')};
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  transition: all 0.2s;
  border-bottom: 2px solid ${(props) => (props.active ? '#ff6b35' : 'transparent')};

  &:hover {
    background: ${(props) => (props.active ? '#ff6b35' : '#3a3a3a')};
  }
`;

const PropertyContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #2a2a2a;
`;

const PropertySection = styled.div`
  margin-bottom: 20px;
`;

const PropertyLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
`;

const PropertyInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  font-size: 12px;
  background: #3a3a3a;
  color: #ffffff;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  &::placeholder {
    color: #999999;
  }
`;

const PropertySelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  font-size: 12px;
  background: #3a3a3a;
  color: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const AnimasiSection = styled.div`
  padding: 12px;
  background: #1f1f1f;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const AnimasiLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
`;

const TabContent = styled(motion.div)`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
`;

const Separator = styled.div`
  width: 1px;
  background: #3a3a3a;
  margin: 8px 0;
`;

type TabType = 'components' | 'theme' | 'music' | 'upload' | 'images' | 'videos' | 'audios' | 'plugin' | 'settings' | 'tutorial';

const COMPONENT_ITEMS: Array<{ type: BlockType | string; label: string; icon: React.ReactNode }> = [
  { type: 'text', label: 'Teks', icon: <FaFont /> },
  { type: 'image', label: 'Gambar', icon: <FaImage /> },
  { type: 'masonry', label: 'Masonry', icon: <FaImages /> },
  { type: 'gallery', label: 'Gallery', icon: <FaImages /> },
  { type: 'imageTransition', label: 'Image Transition', icon: <FaImage /> },
  { type: 'video', label: 'Video', icon: <FaVideo /> },
  { type: 'button', label: 'Tombol', icon: <FaMousePointer /> },
  { type: 'form', label: 'Form', icon: <FaTextHeight /> },
  { type: 'countdown', label: 'Hitung Mundur', icon: <FaClock /> },
  { type: 'icon', label: 'Ikon', icon: <FaExclamationCircle /> },
  { type: 'spacer', label: 'Jarak', icon: <FaMinus /> },
  { type: 'map', label: 'Peta', icon: <FaMapMarkerAlt /> },
  { type: 'bank', label: 'Bank', icon: <FaUniversity /> },
  { type: 'gift', label: 'Kado', icon: <FaGift /> },
  { type: 'shape', label: 'Shape', icon: <FaSquare /> },
];

const CATEGORIES = [
  { id: 'components' as TabType, label: 'Komponen', icon: <FaTh /> },
  { id: 'theme' as TabType, label: 'Tema', icon: <FaPalette /> },
  { id: 'music' as TabType, label: 'Musik', icon: <FaMusic /> },
  { id: 'upload' as TabType, label: 'Upload', icon: <FaUpload /> },
  { id: 'images' as TabType, label: 'Gambar', icon: <FaImage /> },
  { id: 'videos' as TabType, label: 'Video', icon: <FaVideo /> },
  { id: 'audios' as TabType, label: 'Audio', icon: <FaMusic /> },
  { id: 'plugin' as TabType, label: 'Plugin', icon: <FaPuzzlePiece /> },
  { id: 'settings' as TabType, label: 'Pengaturan', icon: <FaCog /> },
  { id: 'tutorial' as TabType, label: 'Tutorial JSON', icon: <FaBook /> },
];

interface LeftSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function LeftSidebar({ collapsed = false, onToggleCollapse }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('components');
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const blocks = useEditorStore((state) => state.blocks);
  const selectedBlock = blocks.find((b) => b.id === selectedId);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'components':
        // Jika ada block yang dipilih, tampilkan PropertyPanel
        if (selectedBlock) {
          return <PropertyPanel block={selectedBlock} />;
        }
        // Jika tidak ada yang dipilih, tampilkan ComponentGrid
        return <ComponentGrid items={COMPONENT_ITEMS} />;
      case 'theme':
        return (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            Pengaturan Tema
            <br />
            <small>Segera Hadir</small>
          </div>
        );
      case 'music':
        return <MusicSettings />;
      case 'upload':
        return (
          <UploadMenu onUploadComplete={() => {
            // Refresh file library setelah upload
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('filesUpdated'));
            }
          }} />
        );
      case 'images':
        return <MediaLibrary fileType="image" />;
      case 'videos':
        return <MediaLibrary fileType="video" />;
      case 'audios':
        return <MediaLibrary fileType="audio" />;
      case 'plugin':
        return <PluginMenu />;
      case 'settings':
        return <ProjectSettings />;
      case 'tutorial':
        return <TutorialJSON />;
      default:
        return null;
    }
  };

  return (
    <SidebarContainer $collapsed={collapsed}>
      <CategoryMenu>
        {CATEGORIES.map((category, index) => (
          <div key={category.id}>
            <CategoryItem
              $active={activeTab === category.id}
              onClick={() => {
                setActiveTab(category.id);
                // Jika klik menu komponen, deselect komponen yang sedang dipilih
                if (category.id === 'components') {
                  setSelectedId(null);
                }
              }}
              title={category.label}
            >
              {category.icon}
            </CategoryItem>
            {index < CATEGORIES.length - 1 && <Separator />}
          </div>
        ))}
      </CategoryMenu>
      <ContentArea $collapsed={collapsed}>
        <TabContent
          key={selectedBlock ? `property-${selectedBlock.id}` : activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </TabContent>
      </ContentArea>
      {onToggleCollapse && (
        <CollapseButton onClick={onToggleCollapse} title={collapsed ? 'Buka' : 'Tutup'}>
          <FaChevronLeft style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
        </CollapseButton>
      )}
    </SidebarContainer>
  );
}

