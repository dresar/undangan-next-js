'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUpload, FaLink, FaImage } from 'react-icons/fa';
import MediaLibrary from '../LeftSidebar/MediaLibrary';
import UploadImageModal from './UploadImageModal';
import { useEditorStore } from '@/store/useEditorStore';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContainer = styled(motion.div)`
  background: #2a2a2a;
  border-radius: 8px;
  width: 85%;
  max-width: 600px;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #4a4a4a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1f1f1f;
`;

const ModalTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;
    color: #ffffff;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #4a4a4a;
  background: #1f1f1f;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: ${(props) => (props.$active ? '#2a2a2a' : 'transparent')};
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-weight: ${(props) => (props.$active ? '600' : '400')};
  transition: all 0.2s;
  border-bottom: 2px solid ${(props) => (props.$active ? '#ff6b35' : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${(props) => (props.$active ? '#2a2a2a' : '#3a3a3a')};
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #2a2a2a;
`;

const CDNInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CDNInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  font-size: 12px;
  background: #3a3a3a;
  color: #ffffff;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  &::placeholder {
    color: #999;
  }
`;

const CDNButton = styled.button`
  padding: 10px 16px;
  background: #ff6b35;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: #ff8c5a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LibraryContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  project_id?: string;
}

export default function ImageGalleryModal({ isOpen, onClose, onSelect }: ImageGalleryModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'cdn'>('library');
  const [cdnUrl, setCdnUrl] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [libraryKey, setLibraryKey] = useState(0);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const projectId = useEditorStore((state) => state.projectId);

  const handleCDNSubmit = async () => {
    if (!cdnUrl.trim()) return;

    const url = cdnUrl.trim();
    
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1] || `cdn-image-${Date.now()}.jpg`;
      
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId || null,
          folderId: selectedFolderId || null,
          filename: filename,
          url: url,
          mimeType: 'image/jpeg',
          size: null,
          fileType: 'image',
        }),
      });

      if (response.ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('filesUpdated'));
        }
        setLibraryKey(prev => prev + 1);
        onSelect(url);
        setCdnUrl('');
        onClose();
      } else {
        onSelect(url);
        setCdnUrl('');
        onClose();
      }
    } catch (error) {
      console.error('Error saving CDN URL to library:', error);
      onSelect(url);
      setCdnUrl('');
      onClose();
    }
  };

  const handleLibrarySelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen, projectId]);

  const loadFolders = async () => {
    try {
      // Load folder global (tanpa projectId) DAN folder project-specific
      // API akan return semua folder: global + project-specific
      const url = projectId ? `/api/folders?projectId=${projectId}` : '/api/folders';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded folders in modal:', data);
        setFolders(data || []);
      } else {
        console.error('Failed to load folders:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          projectId: projectId || null,
        }),
      });

      if (response.ok) {
        const newFolder = await response.json();
        console.log('Folder created successfully in modal:', newFolder);
        // Reload folders setelah create
        await loadFolders();
        setNewFolderName('');
        setShowNewFolderInput(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to create folder:', errorData);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleUploadComplete = async (urls: string[]) => {
    if (urls.length === 0) return;

    try {
      for (const dataUrl of urls) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const filename = `upload_${timestamp}_${random}.webp`;

        // Get folder name for physical folder structure
        let folderName = null;
        if (selectedFolderId) {
          const folder = folders.find(f => f.id === selectedFolderId);
          if (folder) {
            folderName = folder.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          }
        }

        const response = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: projectId || null,
            folderId: selectedFolderId || null,
            folderName: folderName, // For physical folder structure
            filename: filename,
            url: dataUrl,
            mimeType: 'image/webp',
            size: null,
            fileType: 'image',
          }),
        });

        if (response.ok) {
          const savedFile = await response.json();
          console.log('File saved to database:', savedFile);
          if (!savedFile.url) {
            console.error('Saved file has no URL!', savedFile);
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('filesUpdated'));
          }
          setLibraryKey(prev => prev + 1);
          console.log('Calling onSelect with URL:', savedFile.url);
          onSelect(savedFile.url);
          setIsUploadModalOpen(false);
          onClose();
          return;
        } else {
          const errorText = await response.text();
          console.error('Failed to save file:', errorText);
        }
      }
    } catch (error) {
      console.error('Error saving uploaded images to library:', error);
      if (urls.length > 0) {
        onSelect(urls[0]);
        setIsUploadModalOpen(false);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <ModalContainer
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>Pilih Gambar</ModalTitle>
                <CloseButton onClick={onClose}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>

              <TabContainer>
                <Tab $active={activeTab === 'library'} onClick={() => setActiveTab('library')}>
                  <FaImage />
                  Library
                </Tab>
                <Tab $active={activeTab === 'upload'} onClick={() => setActiveTab('upload')}>
                  <FaUpload />
                  Upload
                </Tab>
                <Tab $active={activeTab === 'cdn'} onClick={() => setActiveTab('cdn')}>
                  <FaLink />
                  URL
                </Tab>
              </TabContainer>

              <TabContent>
              {activeTab === 'library' && (
                <LibraryContainer key={libraryKey}>
                  <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSelectedFolderId(null)}
                        style={{
                          padding: '6px 12px',
                          background: selectedFolderId === null ? '#ff6b35' : '#3a3a3a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Semua
                      </button>
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => setSelectedFolderId(folder.id)}
                          style={{
                            padding: '6px 12px',
                            background: selectedFolderId === folder.id ? '#ff6b35' : '#3a3a3a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          📁 {folder.name}
                        </button>
                      ))}
                      {showNewFolderInput ? (
                        <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: '200px' }}>
                          <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Nama folder..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateFolder();
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              background: '#3a3a3a',
                              border: '1px solid #4a4a4a',
                              borderRadius: '4px',
                              color: '#ffffff',
                              fontSize: '11px',
                            }}
                            autoFocus
                          />
                          <button
                            onClick={handleCreateFolder}
                            style={{
                              padding: '6px 12px',
                              background: '#ff6b35',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setShowNewFolderInput(false);
                              setNewFolderName('');
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#4a4a4a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowNewFolderInput(true)}
                          style={{
                            padding: '6px 12px',
                            background: '#4a4a4a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                          title="Buat folder baru"
                        >
                          + Folder
                        </button>
                      )}
                    </div>
                  </div>
                  <MediaLibrary 
                    fileType="image" 
                    onSelect={handleLibrarySelect}
                    showUploadButton={false}
                    folderId={selectedFolderId || undefined}
                  />
                </LibraryContainer>
              )}

              {activeTab === 'upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', color: '#ffffff', fontSize: '11px', marginBottom: '6px' }}>
                      Pilih Folder (opsional):
                    </label>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <select
                        value={selectedFolderId || ''}
                        onChange={(e) => setSelectedFolderId(e.target.value || null)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#3a3a3a',
                          border: '1px solid #4a4a4a',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontSize: '12px',
                        }}
                      >
                        <option value="">Tanpa Folder</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                      {showNewFolderInput ? (
                        <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: '150px' }}>
                          <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Nama folder..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateFolder();
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              background: '#3a3a3a',
                              border: '1px solid #4a4a4a',
                              borderRadius: '4px',
                              color: '#ffffff',
                              fontSize: '11px',
                            }}
                            autoFocus
                          />
                          <button
                            onClick={handleCreateFolder}
                            style={{
                              padding: '6px 12px',
                              background: '#ff6b35',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setShowNewFolderInput(false);
                              setNewFolderName('');
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#4a4a4a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowNewFolderInput(true)}
                          style={{
                            padding: '8px 12px',
                            background: '#4a4a4a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          + Folder
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#ff6b35',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <FaUpload />
                    Upload Gambar
                  </button>
                  <div style={{ 
                    padding: '10px', 
                    background: '#3a3a3a', 
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#999',
                    textAlign: 'center'
                  }}>
                    Upload akan otomatis disimpan ke {selectedFolderId ? 'folder yang dipilih' : 'library'}
                  </div>
                </div>
              )}

                {activeTab === 'cdn' && (
                  <CDNInputContainer>
                    <CDNInput
                      type="text"
                      placeholder="Masukkan URL gambar..."
                      value={cdnUrl}
                      onChange={(e) => setCdnUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCDNSubmit();
                        }
                      }}
                    />
                    <CDNButton onClick={handleCDNSubmit} disabled={!cdnUrl.trim()}>
                      <FaLink />
                      Gunakan & Simpan
                    </CDNButton>
                    <div style={{ 
                      padding: '10px', 
                      background: '#3a3a3a', 
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#999',
                      textAlign: 'center'
                    }}>
                      URL akan disimpan ke library
                    </div>
                  </CDNInputContainer>
                )}
              </TabContent>
            </ModalContainer>
          </ModalOverlay>
        )}
      </AnimatePresence>
      
      <UploadImageModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadComplete}
      />
    </>
  );
}
