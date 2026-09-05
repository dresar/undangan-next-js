'use client';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaDownload, FaTrash, FaPlus, FaFolder } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/useEditorStore';
import { Block } from '@/types/block';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContent = styled(motion.div)`
  background: #2a2a2a;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #4a4a4a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1f1f1f;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 8px;
  width: 36px;
  height: 36px;
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

const ActionButton = styled.button`
  background: #3a3a3a;
  border: none;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #4a4a4a;
  }

  &.primary {
    background: #ff6b35;
    &:hover {
      background: #ff8c5a;
    }
  }

  &.danger {
    background: #dc3545;
    &:hover {
      background: #c82333;
    }
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const MediaPreview = styled.div<{ $type: string }>`
  width: 100%;
  max-width: 600px;
  position: relative;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  cursor: ${(props) => (props.$type === 'image' ? 'grab' : 'default')};

  &:active {
    cursor: ${(props) => (props.$type === 'image' ? 'grabbing' : 'default')};
  }

  img {
    width: 100%;
    height: auto;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
  }

  video {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const DraggableImage = styled.img<{ $isDragging: boolean }>`
  width: 100%;
  height: auto;
  display: block;
  user-select: none;
  cursor: ${(props) => (props.$isDragging ? 'grabbing' : 'grab')};
  opacity: ${(props) => (props.$isDragging ? 0.7 : 1)};
  transition: opacity 0.2s;
`;

const MediaInfo = styled.div`
  width: 100%;
  max-width: 600px;
  background: #1f1f1f;
  border-radius: 8px;
  padding: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #3a3a3a;
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #999;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #ffffff;
  text-align: right;
  word-break: break-all;
`;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

interface Folder {
  id: string;
  name: string;
  description?: string;
}

interface MediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    filename: string;
    url: string;
    folder_id?: string;
    mime_type?: string;
    mimeType?: string;
    file_type?: string;
    fileType?: string;
    size: number;
    created_at?: string;
    createdAt?: string;
  } | null;
  onDelete?: (fileId: string) => void;
}

export default function MediaDetailModal({
  isOpen,
  onClose,
  file,
  onDelete,
}: MediaDetailModalProps) {
  const addBlock = useEditorStore((state) => state.addBlock);
  const projectId = useEditorStore((state) => state.projectId);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragPreviewRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen && file) {
      loadFolders();
      setSelectedFolderId(file.folder_id || null);
    }
  }, [isOpen, file, projectId]);

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

  const handleMoveToFolder = async () => {
    if (!file || isMoving) return;

    setIsMoving(true);
    try {
      const response = await fetch(`/api/files/${file.id}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: selectedFolderId || null,
        }),
      });

      if (response.ok) {
        // Trigger refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('filesUpdated'));
        }
        alert('File berhasil dipindahkan ke folder!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Gagal memindahkan file: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error moving file:', error);
      alert('Gagal memindahkan file');
    } finally {
      setIsMoving(false);
    }
  };

  if (!file) return null;

  const fileType = file.file_type || file.fileType || 'file';
  const isImage = fileType === 'image';

  const handleDragStart = (e: React.DragEvent) => {
    if (!isImage || !imageRef.current) return;

    setIsDragging(true);
    
    // Create drag preview
    const dragImage = imageRef.current.cloneNode(true) as HTMLImageElement;
    dragImage.style.width = '200px';
    dragImage.style.height = 'auto';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setDragImage(dragImage, 100, 100);
    
    // Store image data
    e.dataTransfer.setData('text/plain', file.url);
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'image',
      url: file.url,
      filename: file.filename,
    }));

    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleAddToCanvas = () => {
    const newBlock: Block = {
      id: `${fileType}-${Date.now()}-${Math.random()}`,
      type: fileType as 'image' | 'video' | 'audio',
      parentId: null,
      children: [],
      content: file.url,
      styles: getDefaultStyles(fileType),
      animation: {
        type: 'none',
        duration: 1000,
        delay: 0,
        easing: 'easeInOut',
      },
    };

    addBlock(newBlock);
    onClose();
  };

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }
    onDelete(file.id);
    onClose();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <AnimatePresence>
      {isOpen && file && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>{file.filename}</ModalTitle>
              <HeaderActions>
                <ActionButton onClick={handleAddToCanvas} className="primary">
                  <FaPlus /> Tambah ke Canvas
                </ActionButton>
                <ActionButton onClick={handleDownload}>
                  <FaDownload /> Unduh
                </ActionButton>
                {onDelete && (
                  <ActionButton onClick={handleDelete} className="danger">
                    <FaTrash /> Hapus
                  </ActionButton>
                )}
                <CloseButton onClick={onClose}>
                  <FaTimes />
                </CloseButton>
              </HeaderActions>
            </ModalHeader>

            <ModalBody>
              <MediaPreview $type={fileType}>
                {isImage ? (
                  <DraggableImage
                    ref={imageRef}
                    src={file.url}
                    alt={file.filename}
                    draggable
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    $isDragging={isDragging}
                  />
                ) : fileType === 'video' ? (
                  <video src={file.url} controls style={{ width: '100%', height: 'auto' }} />
                ) : fileType === 'audio' ? (
                  <audio src={file.url} controls style={{ width: '100%' }} />
                ) : null}
              </MediaPreview>

              <MediaInfo>
                <InfoRow>
                  <InfoLabel>Nama File</InfoLabel>
                  <InfoValue>{file.filename}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Tipe</InfoLabel>
                  <InfoValue>{fileType.toUpperCase()}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Ukuran</InfoLabel>
                  <InfoValue>{formatFileSize(file.size)}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>MIME Type</InfoLabel>
                  <InfoValue>{file.mime_type || file.mimeType || '-'}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Tanggal Upload</InfoLabel>
                  <InfoValue>{formatDate(file.created_at || file.createdAt)}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Pindah ke Folder</InfoLabel>
                  <InfoValue style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <select
                      value={selectedFolderId || ''}
                      onChange={(e) => setSelectedFolderId(e.target.value || null)}
                      style={{
                        padding: '6px 10px',
                        background: '#3a3a3a',
                        border: '1px solid #4a4a4a',
                        borderRadius: '4px',
                        color: '#ffffff',
                        fontSize: '12px',
                        minWidth: '150px',
                      }}
                    >
                      <option value="">Tanpa Folder</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleMoveToFolder}
                      disabled={isMoving || (selectedFolderId === (file.folder_id || null))}
                      style={{
                        padding: '6px 12px',
                        background: isMoving || (selectedFolderId === (file.folder_id || null)) ? '#4a4a4a' : '#ff6b35',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: isMoving || (selectedFolderId === (file.folder_id || null)) ? 'not-allowed' : 'pointer',
                        opacity: isMoving || (selectedFolderId === (file.folder_id || null)) ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <FaFolder />
                      {isMoving ? 'Memindahkan...' : 'Pindahkan'}
                    </button>
                  </InfoValue>
                </InfoRow>
                {isImage && (
                  <InfoRow>
                    <InfoLabel>Petunjuk</InfoLabel>
                    <InfoValue style={{ fontSize: '11px', color: '#999' }}>
                      Seret gambar ke canvas untuk menambahkannya
                    </InfoValue>
                  </InfoRow>
                )}
              </MediaInfo>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}

