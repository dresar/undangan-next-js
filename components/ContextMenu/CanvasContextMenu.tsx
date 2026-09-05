'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaImage, 
  FaPalette,
  FaTrash,
  FaUndo,
  FaRedo,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaUpload,
  FaPlus,
  FaColumns
} from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';
import { useState, useRef } from 'react';

const useEditorStoreGetState = useEditorStore.getState;

const ContextMenuContainer = styled(motion.div)`
  position: fixed;
  background: #2a2a2a;
  border: 1px solid #4a4a4a;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 4px;
  z-index: 10000;
  min-width: 220px;
  overflow: hidden;
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  transition: all 0.2s;
  border-radius: 4px;

  &:hover {
    background: #3a3a3a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 14px;
    color: #cccccc;
  }
`;

const Separator = styled.div`
  height: 1px;
  background: #4a4a4a;
  margin: 4px 0;
`;

const FileInput = styled.input`
  display: none;
`;

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export default function CanvasContextMenu({ x, y, onClose }: CanvasContextMenuProps) {
  const setBackgroundImage = useEditorStore((state) => state.setBackgroundImage);
  const canvasBackground = useEditorStore((state) => state.canvasBackground);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const saveToDatabase = useEditorStore((state) => state.saveToDatabase);
  const blocks = useEditorStore((state) => state.blocks);
  const history = useEditorStore((state) => state.history);
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const handleChangeBackground = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang didukung');
      return;
    }

    setUploading(true);
    try {
      // Convert file to data URL first
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        
        // Save to database as file
        try {
          const projectId = useEditorStoreGetState().projectId;
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 9);
          const filename = `background_${timestamp}_${random}.webp`;

          const response = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: projectId || null,
              filename: filename,
              url: dataUrl,
              mimeType: 'image/webp',
              size: null,
              fileType: 'image',
            }),
          });

          if (response.ok) {
            const savedFile = await response.json();
            console.log('Background image saved:', savedFile.url);
            // Use the saved file URL instead of data URL
            setBackgroundImage(savedFile.url);
            // Force save project to database
            setTimeout(() => {
              saveToDatabase().catch((error) => {
                console.error('Error saving after background upload:', error);
              });
            }, 500);
          } else {
            // Fallback to data URL if save fails
            console.warn('Failed to save background image, using data URL');
            setBackgroundImage(dataUrl);
            setTimeout(() => {
              saveToDatabase().catch((error) => {
                console.error('Error saving after background upload:', error);
              });
            }, 500);
          }
        } catch (error) {
          console.error('Error saving background image:', error);
          // Fallback to data URL
          setBackgroundImage(dataUrl);
          setTimeout(() => {
            saveToDatabase().catch((err) => {
              console.error('Error saving after background upload:', err);
            });
          }, 500);
        }
        
        setUploading(false);
        onClose();
      };
      reader.onerror = () => {
        alert('Gagal membaca file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading background:', error);
      alert('Gagal mengunggah gambar');
      setUploading(false);
    }
  };

  const handleRemoveBackground = () => {
    setBackgroundImage('');
    onClose();
  };

  const handleUndo = () => {
    undo();
    onClose();
  };

  const handleRedo = () => {
    redo();
    onClose();
  };

  const handleSave = async () => {
    try {
      await saveToDatabase();
      alert('Proyek berhasil disimpan!');
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Gagal menyimpan proyek');
    }
  };

  const handleClearCanvas = () => {
    blocks.forEach((block) => {
      deleteBlock(block.id);
    });
    onClose();
  };

  const handleTambahKonten = () => {
    // User akan menggunakan tombol di bawah canvas untuk menambah konten
    onClose();
  };

  return (
    <>
      <ContextMenuContainer
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleTambahKonten}>
          <FaPlus />
          Tambah Konten
        </MenuItem>

        <Separator />

        <MenuItem onClick={handleChangeBackground}>
          <FaImage />
          {canvasBackground ? 'Ubah Gambar Utama' : 'Tetapkan Gambar Utama'}
        </MenuItem>
        
        {canvasBackground && (
          <MenuItem onClick={handleRemoveBackground}>
            <FaTrash />
            Hapus Gambar Utama
          </MenuItem>
        )}

        <Separator />

        <MenuItem onClick={handleUndo} disabled={!canUndo}>
          <FaUndo />
          Undo
        </MenuItem>

        <MenuItem onClick={handleRedo} disabled={!canRedo}>
          <FaRedo />
          Redo
        </MenuItem>

        <Separator />

        <MenuItem onClick={handleSave}>
          <FaSave />
          Simpan Proyek
        </MenuItem>

        <Separator />

        <MenuItem onClick={handleClearCanvas} style={{ color: '#ff6b6b' }}>
          <FaTrash />
          Hapus Semua Komponen
        </MenuItem>
      </ContextMenuContainer>
      
      <FileInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
      />
    </>
  );
}

