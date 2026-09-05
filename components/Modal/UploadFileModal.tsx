'use client';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaUpload, FaVideo, FaImage } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
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

const ModalContent = styled(motion.div)`
  background: #2a2a2a;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
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
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
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

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  background: #2a2a2a;
`;

const UploadArea = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed ${(props) => (props.$isDragging ? '#ff6b35' : '#4a4a4a')};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background: ${(props) => (props.$isDragging ? '#3a3a3a' : '#1f1f1f')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #ff6b35;
    background: #3a3a3a;
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: #ff6b35;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
`;

const UploadText = styled.div`
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 8px;
`;

const UploadHint = styled.div`
  color: #999;
  font-size: 13px;
`;

const FileInput = styled.input`
  display: none;
`;

const ImagePreviewContainer = styled.div`
  margin-top: 20px;
  position: relative;
`;


const VideoPreview = styled.video`
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  background: #1a1a1a;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 20px;
`;

const PreviewItem = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #4a4a4a;
  cursor: pointer;
  transition: all 0.2s;
  background: #1a1a1a;

  &:hover {
    border-color: #ff6b35;
    transform: scale(1.05);
  }

  img, video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #4a4a4a;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.$primary
      ? `
    background: #ff6b35;
    color: #ffffff;
    &:hover {
      background: #ff8c5a;
    }
    &:disabled {
      background: #4a4a4a;
      cursor: not-allowed;
      opacity: 0.5;
    }
  `
      : `
    background: #3a3a3a;
    color: #ffffff;
    &:hover {
      background: #4a4a4a;
    }
  `}
`;

const LoadingText = styled.div`
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
`;

interface ImageFile {
  file: File;
  preview: string;
  type: 'image';
}

interface VideoFile {
  file: File;
  preview: string;
  type: 'video';
}

type FileItem = ImageFile | VideoFile;

interface Folder {
  id: string;
  name: string;
  description?: string;
  project_id?: string;
}

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: Array<{ file: File; url: string; fileType: string; folderId?: string | null }>) => void;
}


export default function UploadFileModal({
  isOpen,
  onClose,
  onUpload,
}: UploadFileModalProps) {
  const projectId = useEditorStore((state) => state.projectId);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen, projectId]);

  const loadFolders = async () => {
    try {
      const url = projectId ? `/api/folders?projectId=${projectId}` : '/api/folders';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFolders(data || []);
        // Auto-select "asset" folder if exists
        const assetFolder = data.find((f: Folder) => f.name === 'asset' && !f.project_id);
        if (assetFolder) {
          setSelectedFolderId(assetFolder.id);
        }
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };


  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);
    const newFiles: FileItem[] = [];

    for (const file of fileArray) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newFiles.push({
          file,
          preview,
          type: 'image',
        });
      } else if (file.type.startsWith('video/')) {
        // For video, create preview URL and also read as data URL
        const preview = URL.createObjectURL(file);
        newFiles.push({
          file,
          preview,
          type: 'video',
        });
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      const updated = prev.filter((_, i) => i !== index);
      return updated;
    });
  };

  const compressImage = async (file: File): Promise<string> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp' as const,
      };

      const compressedFile = await imageCompression(file, options);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error('Compression error:', error);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpload = async () => {
    setIsProcessing(true);
    const processedFiles: Array<{ file: File; url: string; fileType: string; folderId?: string | null }> = [];

    for (const fileItem of files) {
      if (fileItem.type === 'image') {
        // Compress image to WebP
        const finalUrl = await compressImage(fileItem.file);
        processedFiles.push({
          file: fileItem.file,
          url: finalUrl,
          fileType: 'image',
          folderId: selectedFolderId,
        });
      } else if (fileItem.type === 'video') {
        // For video, read as data URL (no compression)
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileItem.file);
        });
        processedFiles.push({
          file: fileItem.file,
          url: dataUrl,
          fileType: 'video',
          folderId: selectedFolderId,
        });
      }
    }

    onUpload(processedFiles);
    handleClose();
  };

  const handleClose = () => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setIsDragging(false);
    setIsProcessing(false);
    onClose();
  };

  const imageFiles = files.filter((f) => f.type === 'image');
  const videoFiles = files.filter((f) => f.type === 'video');

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>Unggah File</ModalTitle>
              <CloseButton onClick={handleClose}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#ffffff', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                  Folder (Organisasi):
                </label>
                <select
                  value={selectedFolderId || ''}
                  onChange={(e) => setSelectedFolderId(e.target.value || null)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#3a3a3a',
                    border: '1px solid #4a4a4a',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '13px',
                  }}
                >
                  <option value="">Tanpa Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      📁 {folder.name}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                  digunakan saat upload gambar baru.
                </div>
              </div>
              <UploadArea
                $isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon>
                  <FaUpload />
                </UploadIcon>
                <UploadText>Klik atau seret & lepas file di sini</UploadText>
                <UploadHint>
                  Format: JPG, PNG, GIF, WebP, SVG, MP4, WebM, MOV
                </UploadHint>
              </UploadArea>

              <FileInput
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              {/* Image Previews */}
              {imageFiles.length > 0 && (
                <ImagePreviewContainer>
                  {imageFiles.map((fileItem, index) => {
                    const actualIndex = files.findIndex((f) => f === fileItem);

                    return (
                      <div key={actualIndex} style={{ marginBottom: '20px' }}>
                        <img
                          src={fileItem.preview}
                          alt="Preview"
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            background: '#1a1a1a',
                            display: 'block',
                          }}
                        />
                      </div>
                    );
                  })}
                </ImagePreviewContainer>
              )}

              {/* Video Previews */}
              {videoFiles.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  {videoFiles.map((fileItem, index) => {
                    const actualIndex = files.findIndex((f) => f === fileItem);
                    return (
                      <div key={actualIndex} style={{ marginBottom: '20px' }}>
                        <VideoPreview src={fileItem.preview} controls />
                        <div style={{ color: '#999', fontSize: '11px', marginTop: '8px' }}>
                          {fileItem.file.name} • {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* File Grid */}
              {files.length > 0 && (
                <PreviewGrid>
                  {files.map((fileItem, index) => (
                    <PreviewItem key={index}>
                      {fileItem.type === 'image' ? (
                        <img
                          src={fileItem.preview}
                          alt="Preview"
                        />
                      ) : (
                        <video src={fileItem.preview} />
                      )}
                      <RemoveButton onClick={() => removeFile(index)}>
                        <FaTimes />
                      </RemoveButton>
                    </PreviewItem>
                  ))}
                </PreviewGrid>
              )}

              {isProcessing && <LoadingText>Memproses file...</LoadingText>}

              <ActionButtons>
                <Button onClick={handleClose}>Batal</Button>
                <Button
                  $primary
                  onClick={handleUpload}
                  disabled={files.length === 0 || isProcessing}
                >
                  {isProcessing ? 'Memproses...' : `Simpan (${files.length})`}
                </Button>
              </ActionButtons>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}

