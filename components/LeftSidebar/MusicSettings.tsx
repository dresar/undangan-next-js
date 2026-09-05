'use client';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { FaMusic, FaPlay, FaPause, FaVolumeUp, FaUpload, FaCheck, FaImage, FaTrash } from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';
import MediaLibrary from './MediaLibrary';

const MusicSection = styled.div`
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
  margin-bottom: 12px;

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
  margin-bottom: 12px;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const UploadButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 2px dashed #4a4a4a;
  border-radius: 8px;
  background: #3a3a3a;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s;
  margin-bottom: 12px;
  font-size: 13px;

  &:hover {
    border-color: #ff6b35;
    background: #4a4a4a;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const PreviewSection = styled.div`
  padding: 16px;
  background: #1f1f1f;
  border-radius: 8px;
  margin-top: 16px;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  margin-top: 12px;
`;

const ControlButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #ff6b35;
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  margin-right: 8px;
  transition: all 0.2s;

  &:hover {
    background: #ff8c5a;
  }
`;

const PropertyNote = styled.div`
  font-size: 10px;
  color: #999999;
  margin-top: 4px;
  line-height: 1.4;
  font-style: italic;
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: #ff6b35;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 16px;
  font-size: 13px;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: #ff8c5a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  padding: 12px;
  background: #28a745;
  color: #ffffff;
  border-radius: 6px;
  font-size: 12px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: #dc3545;
  color: #ffffff;
  border-radius: 6px;
  font-size: 12px;
  margin-top: 12px;
`;

export default function MusicSettings() {
  const projectId = useEditorStore((state) => state.projectId);
  const musicUrl = useEditorStore((state) => state.musicUrl);
  const setMusicUrl = useEditorStore((state) => state.setMusicUrl);
  const saveToDatabase = useEditorStore((state) => state.saveToDatabase);
  
  const [localMusicUrl, setLocalMusicUrl] = useState(musicUrl);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalMusicUrl(musicUrl);
  }, [musicUrl]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadedFileName(file.name);
    const reader = new FileReader();
    const url = await new Promise<string>((resolve) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    setUploadedFile(url);
    setLocalMusicUrl(url);
    setSuccess(null);
    setError(null);
  };

  const handleSaveToProject = async () => {
    if (!localMusicUrl && !uploadedFile) {
      setError('Pilih atau upload musik terlebih dahulu');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let finalMusicUrl = localMusicUrl || uploadedFile || '';
      
      // Jika file diupload, simpan ke server dulu
      if (uploadedFile && !localMusicUrl.startsWith('http') && !localMusicUrl.startsWith('/')) {
        const filename = uploadedFileName || `audio_${Date.now()}.mp3`;
        
        const response = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: projectId || null,
            filename: filename,
            url: uploadedFile,
            mimeType: 'audio/mpeg',
            fileType: 'audio',
          }),
        });

        if (response.ok) {
          const savedFile = await response.json();
          finalMusicUrl = savedFile.url || uploadedFile;
          // Trigger refresh media library
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('filesUpdated'));
          }
        }
      }

      // Simpan ke project
      setMusicUrl(finalMusicUrl);
      await saveToDatabase();
      
      setSuccess('Musik berhasil disimpan ke project!');
      setUploadedFile(null);
      setUploadedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan musik');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectFromMediaLibrary = (url: string) => {
    setLocalMusicUrl(url);
    setUploadedFile(null);
    setUploadedFileName('');
    setShowMediaLibrary(false);
    setSuccess(null);
    setError(null);
  };

  const handleRemoveMusic = () => {
    setLocalMusicUrl('');
    setUploadedFile(null);
    setUploadedFileName('');
    setMusicUrl('');
    saveToDatabase();
    setSuccess(null);
    setError(null);
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div>
      <MusicSection>
        <SectionTitle>
          <FaMusic /> Pengaturan Musik
        </SectionTitle>

        <PropertyLabel>URL Musik</PropertyLabel>
        <PropertyInput
          type="text"
          placeholder="Masukkan URL musik dari internet"
          value={localMusicUrl}
          onChange={(e) => {
            setLocalMusicUrl(e.target.value);
            setUploadedFile(null);
            setUploadedFileName('');
            setSuccess(null);
            setError(null);
          }}
        />
        <PropertyNote>URL file audio dari internet (MP3, WAV, OGG). Kosongkan jika ingin upload file.</PropertyNote>

        <div style={{ margin: '16px 0', textAlign: 'center', color: '#999', fontSize: '12px' }}>
          ATAU
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <UploadButton 
            onClick={() => fileInputRef.current?.click()}
            style={{ flex: 1 }}
          >
            <FaUpload />
            <span>Unggah File</span>
          </UploadButton>
          <UploadButton 
            onClick={() => setShowMediaLibrary(!showMediaLibrary)}
            style={{ flex: 1 }}
          >
            <FaImage />
            <span>{showMediaLibrary ? 'Tutup' : 'Pilih dari Media'}</span>
          </UploadButton>
        </div>
        <FileInput
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <PropertyNote>Unggah file musik dari komputer atau pilih dari media library</PropertyNote>

        {showMediaLibrary && (
          <div style={{ marginTop: '16px', maxHeight: '300px', overflowY: 'auto' }}>
            <MediaLibrary 
              fileType="audio" 
              onSelect={handleSelectFromMediaLibrary}
              showUploadButton={false}
            />
          </div>
        )}

        {(localMusicUrl || uploadedFile) && (
          <PreviewSection>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#ffffff' }}>
                Preview Musik
              </div>
              <button
                onClick={handleRemoveMusic}
                style={{
                  padding: '4px 8px',
                  background: '#dc3545',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <FaTrash /> Hapus
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <ControlButton onClick={handlePlay}>
                <FaPlay /> Putar
              </ControlButton>
              <ControlButton onClick={handlePause}>
                <FaPause /> Jeda
              </ControlButton>
            </div>
            <AudioPlayer
              ref={audioRef}
              src={localMusicUrl || uploadedFile || undefined}
              controls
            />
            {uploadedFileName && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
                File: {uploadedFileName}
              </div>
            )}
          </PreviewSection>
        )}

        <SaveButton
          onClick={handleSaveToProject}
          disabled={(!localMusicUrl && !uploadedFile) || saving}
        >
          {saving ? (
            <>Menyimpan...</>
          ) : (
            <>
              <FaCheck /> Simpan ke Project
            </>
          )}
        </SaveButton>

        {success && (
          <SuccessMessage>
            <FaCheck /> {success}
          </SuccessMessage>
        )}

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}
      </MusicSection>
    </div>
  );
}

