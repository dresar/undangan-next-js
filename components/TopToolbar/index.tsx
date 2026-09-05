'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { FaMobileAlt, FaTabletAlt, FaDesktop, FaUndo, FaRedo, FaSave, FaEye, FaHome } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { showNotification } from '@/components/Notification';
import { useEditorStore } from '@/store/useEditorStore';
import { generateSlug } from '@/lib/utils';

const ToolbarContainer = styled.div`
  height: 50px;
  background: #5dade2;
  border-bottom: 1px solid #3498db;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 18px;
  color: #ffffff;
  font-weight: 600;
`;

const CenterGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const DeviceToggleGroup = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px;
  border-radius: 6px;
`;

const DeviceButton = styled.button<{ $active: boolean }>`
  width: 32px;
  height: 32px;
  border: none;
  background: ${(props) => (props.$active ? '#ffffff' : 'transparent')};
  color: ${(props) => (props.$active ? '#5dade2' : '#ffffff')};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${(props) => (props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.2)')};
  }
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button<{ $disabled?: boolean; $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  background: ${(props) => (props.$primary ? '#ff6b35' : 'rgba(255, 255, 255, 0.2)')};
  color: #ffffff;
  border-radius: 4px;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: 13px;
  transition: all 0.2s;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background: ${(props) => (props.$primary ? '#ff5722' : 'rgba(255, 255, 255, 0.3)')};
  }
`;

export default function TopToolbar() {
  const router = useRouter();
  const deviceView = useEditorStore((state) => state.deviceView);
  const setDeviceView = useEditorStore((state) => state.setDeviceView);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const saveToDatabase = useEditorStore((state) => state.saveToDatabase);
  const publish = useEditorStore((state) => state.publish);
  const projectTitle = useEditorStore((state) => state.projectTitle);
  const projectSlug = useEditorStore((state) => state.projectSlug);
  const projectId = useEditorStore((state) => state.projectId);
  const history = useEditorStore((state) => state.history);
  const setProjectSlug = useEditorStore((state) => state.setProjectSlug);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await saveToDatabase();
      showNotification.success('Proyek berhasil disimpan!');
    } catch (error) {
      showNotification.error('Gagal menyimpan proyek');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      if (projectId) await saveToDatabase();
      let slug = projectSlug || (projectTitle ? generateSlug(projectTitle) : 'eka-indah');
      if (!projectSlug && projectTitle) {
        setProjectSlug(slug);
        if (projectId) await saveToDatabase();
      }
      window.open(`/undangan/${slug}`, '_blank');
    } catch (error) {
      alert('Gagal membuka preview');
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const url = await publish();
      if (url) {
        alert(`Proyek berhasil dipublikasikan! URL: ${url}`);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.origin + url);
        }
      }
    } catch (error) {
      alert('Gagal mempublikasikan proyek');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <ToolbarContainer>
      <Logo>Idinvitebook</Logo>
      <CenterGroup>
        <DeviceToggleGroup>
          <DeviceButton $active={deviceView === 'mobile'} onClick={() => setDeviceView('mobile')}>
            <FaMobileAlt />
          </DeviceButton>
          <DeviceButton $active={deviceView === 'tablet'} onClick={() => setDeviceView('tablet')}>
            <FaTabletAlt />
          </DeviceButton>
          <DeviceButton $active={deviceView === 'desktop'} onClick={() => setDeviceView('desktop')}>
            <FaDesktop />
          </DeviceButton>
        </DeviceToggleGroup>
      </CenterGroup>
      <ActionsGroup>
        <ActionButton onClick={() => router.push('/home')} title="Home">
          <FaHome />
        </ActionButton>
        <ActionButton $disabled={!canUndo} onClick={undo} title="Undo">
          <FaUndo />
        </ActionButton>
        <ActionButton $disabled={!canRedo} onClick={redo} title="Redo">
          <FaRedo />
        </ActionButton>
        <ActionButton onClick={handlePreview} title="Preview">
          <FaEye />
        </ActionButton>
        <ActionButton onClick={handlePublish} $disabled={isPublishing}>
          {isPublishing ? 'Publishing...' : 'Publish'}
        </ActionButton>
        <ActionButton $primary onClick={handleSave} $disabled={isSaving}>
          <FaSave />
          {isSaving ? 'Saving...' : 'Save'}
        </ActionButton>
      </ActionsGroup>
    </ToolbarContainer>
  );
}
