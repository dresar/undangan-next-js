'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { FaUpload, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';
import UploadFileModal from '../Modal/UploadFileModal';

const UploadSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
`;

const UploadButton = styled.button`
  width: 100%;
  padding: 16px;
  border: 2px dashed #4a4a4a;
  border-radius: 8px;
  background: #3a3a3a;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  margin-bottom: 12px;
  font-size: 13px;

  &:hover {
    border-color: #ff6b35;
    background: #4a4a4a;
  }

  svg {
    font-size: 24px;
  }
`;

const FormatInfo = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 8px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  padding: 8px 12px;
  background: #dc3545;
  color: #ffffff;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SuccessMessage = styled.div`
  padding: 8px 12px;
  background: #28a745;
  color: #ffffff;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface UploadMenuProps {
  onUploadComplete?: () => void;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  project_id?: string;
}

export default function UploadMenu({ onUploadComplete }: UploadMenuProps) {
  const projectId = useEditorStore((state) => state.projectId);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  useEffect(() => {
    loadFolders();
  }, [projectId]);

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

  const handleUpload = async (processedFiles: Array<{ file: File; url: string; fileType: string; folderId?: string | null }>) => {
    if (processedFiles.length === 0) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const savedFiles: string[] = [];
      const failedFiles: string[] = [];

      for (const processedFile of processedFiles) {
        try {
          const response = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: projectId || null,
              folderId: processedFile.folderId || selectedFolderId || null,
              filename: processedFile.file.name,
              url: processedFile.url,
              mimeType: processedFile.file.type,
              size: processedFile.file.size,
              fileType: processedFile.fileType,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            savedFiles.push(processedFile.file.name);
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `Failed to save ${processedFile.file.name}`);
          }
        } catch (error: any) {
          console.error('Error saving file:', error);
          failedFiles.push(processedFile.file.name);
          const errorMessage = error.message || `Gagal menyimpan: ${processedFile.file.name}`;
          setError(errorMessage);
        }
      }

      if (savedFiles.length > 0) {
        const successMessage = failedFiles.length > 0
          ? `${savedFiles.length} file berhasil disimpan, ${failedFiles.length} file gagal`
          : `${savedFiles.length} file berhasil disimpan ke media library`;
        setSuccess(successMessage);
        
        if (onUploadComplete && savedFiles.length > 0) {
          onUploadComplete();
        }
      } else if (failedFiles.length > 0) {
        setError(`Semua file gagal disimpan. Pastikan server berjalan.`);
      }
    } catch (error: any) {
      console.error('Error saving files:', error);
      setError(error.message || 'Gagal menyimpan file ke database. Pastikan server berjalan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <UploadSection>
        <SectionTitle>Unggah File</SectionTitle>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', color: '#ffffff', fontSize: '11px', marginBottom: '6px' }}>
            Folder (Organisasi):
          </label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <select
              value={selectedFolderId || ''}
              onChange={(e) => setSelectedFolderId(e.target.value || null)}
              style={{
                flex: 1,
                padding: '8px 12px',
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
                  📁 {folder.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
            digunakan saat upload gambar baru.
          </div>
        </div>
        <UploadButton onClick={() => setModalOpen(true)}>
          <FaUpload />
          <span>Klik untuk memilih file</span>
        </UploadButton>
        <FormatInfo>
          Format yang didukung: JPG, PNG, GIF, WebP, SVG, MP4, WebM, MOV
        </FormatInfo>

        {error && (
          <ErrorMessage>
            <FaTimesCircle /> {error}
          </ErrorMessage>
        )}

        {success && (
          <SuccessMessage>
            <FaCheckCircle /> {success}
          </SuccessMessage>
        )}
      </UploadSection>

      <UploadFileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
