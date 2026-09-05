'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { FaImage, FaVideo, FaMusic, FaTrash } from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';
import { Block } from '@/types/block';
import MediaDetailModal from '../Modal/MediaDetailModal';

const LibrarySection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const FileCard = styled.div`
  background: #3a3a3a;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: #4a4a4a;
    transform: translateY(-2px);
  }
`;

const FileThumbnail = styled.div<{ $url?: string; $type: string }>`
  width: 100%;
  padding-top: 75%;
  background: ${(props) => 
    props.$url && props.$type === 'image' 
      ? `url(${props.$url}) center/cover` 
      : props.$type === 'video' 
      ? '#1a1a1a' 
      : props.$type === 'audio'
      ? '#2a2a2a'
      : '#3a3a3a'};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24px;
`;

const FileInfo = styled.div`
  padding: 8px;
  font-size: 11px;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(220, 53, 69, 0.9);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(220, 53, 69, 1);
    transform: scale(1.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 13px;
`;

interface FileItem {
  id: string;
  filename: string;
  url: string;
  mime_type?: string;
  mimeType?: string;
  file_type?: string;
  fileType?: string;
  size: number;
  created_at?: string;
  createdAt?: string;
}

interface MediaLibraryProps {
  fileType?: 'image' | 'video' | 'audio';
  onSelect?: (url: string) => void;
  showUploadButton?: boolean;
  folderId?: string;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
}

export default function MediaLibrary({ fileType, onSelect, showUploadButton = true, folderId }: MediaLibraryProps) {
  const addBlock = useEditorStore((state) => state.addBlock);
  const projectId = useEditorStore((state) => state.projectId);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  useEffect(() => {
    loadFolders();
    loadFiles();
    
    const handleFilesUpdated = () => {
      loadFiles();
      loadFolders();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('filesUpdated', handleFilesUpdated);
      return () => {
        window.removeEventListener('filesUpdated', handleFilesUpdated);
      };
    }
  }, [projectId, fileType, selectedFolderId]);

  const loadFolders = async () => {
    try {
      const url = projectId ? `/api/folders?projectId=${projectId}` : '/api/folders';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFolders(data || []);
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
        await loadFolders();
        setNewFolderName('');
        setShowNewFolderInput(false);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/files';
      const params = new URLSearchParams();
      if (fileType) params.append('fileType', fileType);
      if (projectId) params.append('projectId', projectId);
      if (selectedFolderId) params.append('folderId', selectedFolderId);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter by file type if specified (backup filter in case API filter doesn't work)
        const filtered = fileType 
          ? data.filter((f: FileItem) => (f.file_type || f.fileType) === fileType)
          : data;
        setFiles(filtered || []);
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to load files:', response.status, response.statusText, errorData);
        setFiles([]);
        setError('Gagal memuat file. Pastikan server berjalan.');
      }
    } catch (error: any) {
      console.error('Error loading files:', error);
      setFiles([]);
      // Only show error if it's not a connection refused (server might not be running)
      if (error.message && !error.message.includes('Failed to fetch')) {
        setError('Gagal memuat file. Pastikan server berjalan.');
      } else {
        setError(null); // Don't show error for connection issues
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: FileItem, e: React.MouseEvent) => {
    // Jika klik pada delete button, jangan buka modal
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Jika ada onSelect callback, gunakan itu (untuk gallery modal)
    if (onSelect) {
      onSelect(file.url);
      return;
    }
    
    // Jika tidak, buka modal detail seperti biasa
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleDelete = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        if (selectedFile?.id === fileId) {
          setIsModalOpen(false);
          setSelectedFile(null);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleDeleteFromModal = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        setIsModalOpen(false);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const getDefaultStyles = (type: string): React.CSSProperties => {
    switch (type) {
      case 'image':
        return {
          width: '100%',
          maxWidth: '100%',
          padding: '10px',
          margin: '10px 0',
        };
      case 'video':
        return {
          width: '100%',
          padding: '10px',
          margin: '10px 0',
        };
      case 'audio':
        return {
          width: '100%',
          padding: '10px',
          margin: '10px 0',
        };
      default:
        return {
          padding: '10px',
          margin: '10px 0',
        };
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FaImage />;
      case 'video':
        return <FaVideo />;
      case 'audio':
        return <FaMusic />;
      default:
        return null;
    }
  };

  if (loading) {
    return <EmptyState>Memuat file...</EmptyState>;
  }

  if (error) {
    return (
      <EmptyState>
        <div style={{ color: '#ff6b6b', marginBottom: '8px' }}>{error}</div>
        <small style={{ fontSize: '11px', color: '#666' }}>
          Pastikan server Next.js berjalan
        </small>
      </EmptyState>
    );
  }

  if (files.length === 0) {
    return (
      <EmptyState>
        Belum ada file yang disimpan
        <br />
        <small style={{ fontSize: '11px', marginTop: '8px', display: 'block', color: '#666' }}>
          Unggah file di menu Upload
        </small>
      </EmptyState>
    );
  }

  return (
    <div>
      <LibrarySection>
        <SectionTitle>
          {fileType === 'image' && <><FaImage /> Gambar</>}
          {fileType === 'video' && <><FaVideo /> Video</>}
          {fileType === 'audio' && <><FaMusic /> Audio</>}
          {!fileType && 'Semua Media'}
          {' '}({files.length})
        </SectionTitle>
        
        {/* Folder Selector */}
        <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedFolderId(null)}
              style={{
                padding: '6px 10px',
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
                  padding: '6px 10px',
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
                    padding: '6px 10px',
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
                    padding: '6px 10px',
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
                  padding: '6px 10px',
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
        
        <FileGrid>
          {files.map((file) => (
            <FileCard key={file.id} onClick={(e) => handleFileClick(file, e)}>
              <DeleteButton onClick={(e) => handleDelete(file.id, e)}>
                <FaTrash />
              </DeleteButton>
              <FileThumbnail $url={file.url} $type={file.file_type || file.fileType || 'file'}>
                {(file.file_type || file.fileType) !== 'image' && getFileIcon(file.file_type || file.fileType || 'file')}
              </FileThumbnail>
              <FileInfo>{file.filename}</FileInfo>
            </FileCard>
          ))}
        </FileGrid>
      </LibrarySection>

      <MediaDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFile(null);
        }}
        file={selectedFile}
        onDelete={handleDeleteFromModal}
      />
    </div>
  );
}

