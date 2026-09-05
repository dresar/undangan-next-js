'use client';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { 
  FaCog, 
  FaLink, 
  FaCopy, 
  FaCheck, 
  FaImage, 
  FaUpload,
  FaTrash,
  FaEdit,
  FaSave
} from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';
import MediaLibrary from './MediaLibrary';

const SettingsContainer = styled.div`
  padding: 20px;
  color: #ffffff;
  height: 100%;
  overflow-y: auto;
`;

const Section = styled.div`
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

const SectionDescription = styled.p`
  font-size: 12px;
  color: #999999;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
`;

const Required = styled.span`
  color: #ff4444;
  margin-left: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  font-size: 13px;
  background: #3a3a3a;
  color: #ffffff;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  &::placeholder {
    color: #666666;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  font-size: 13px;
  background: #3a3a3a;
  color: #ffffff;
  transition: border-color 0.2s;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  &::placeholder {
    color: #666666;
  }
`;

const UrlGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const UrlInput = styled(Input)`
  flex: 1;
`;

const Button = styled.button<{ $primary?: boolean; $small?: boolean }>`
  padding: ${(props) => (props.$small ? '8px 12px' : '10px 16px')};
  border: 1px solid ${(props) => (props.$primary ? 'transparent' : '#4a4a4a')};
  background: ${(props) => (props.$primary ? '#ff6b35' : '#3a3a3a')};
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: ${(props) => (props.$small ? '12px' : '13px')};
  font-weight: ${(props) => (props.$primary ? '600' : '400')};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  &:hover {
    background: ${(props) => (props.$primary ? '#ff5722' : '#4a4a4a')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ThumbnailPreview = styled.div<{ $url?: string }>`
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: ${(props) => 
    props.$url 
      ? `url(${props.$url}) center/cover` 
      : '#3a3a3a'};
  border-radius: 8px;
  border: 2px dashed ${(props) => (props.$url ? 'transparent' : '#4a4a4a')};
  position: relative;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 14px;
  overflow: hidden;
`;

const ThumbnailPlaceholder = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666666;
  font-size: 12px;
`;

const ThumbnailActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const MediaLibraryContainer = styled.div`
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  padding: 12px;
  background: #1f1f1f;
`;

const SuccessMessage = styled.div`
  padding: 8px 12px;
  background: #4caf50;
  color: #ffffff;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoText = styled.div`
  font-size: 11px;
  color: #999999;
  margin-top: 4px;
  font-style: italic;
`;

export default function ProjectSettings() {
  const projectTitle = useEditorStore((state) => state.projectTitle);
  const projectDescription = useEditorStore((state) => state.projectDescription);
  const projectUrl = useEditorStore((state) => state.projectUrl);
  const projectThumbnail = useEditorStore((state) => state.projectThumbnail);
  const coverImage = useEditorStore((state) => state.coverImage);
  const coverButtonText = useEditorStore((state) => state.coverButtonText);
  const coverEnabled = useEditorStore((state) => state.coverEnabled);
  const setProjectTitle = useEditorStore((state) => state.setProjectTitle);
  const setProjectDescription = useEditorStore((state) => state.setProjectDescription);
  const setProjectUrl = useEditorStore((state) => state.setProjectUrl);
  const setProjectThumbnail = useEditorStore((state) => state.setProjectThumbnail);
  const setCoverImage = useEditorStore((state) => state.setCoverImage);
  const setCoverButtonText = useEditorStore((state) => state.setCoverButtonText);
  const setCoverEnabled = useEditorStore((state) => state.setCoverEnabled);
  const generateInvitationUrl = useEditorStore((state) => state.generateInvitationUrl);
  const projectId = useEditorStore((state) => state.projectId);

  const [localTitle, setLocalTitle] = useState(projectTitle);
  const [localDescription, setLocalDescription] = useState(projectDescription);
  const [localUrl, setLocalUrl] = useState(projectUrl);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showCoverMediaLibrary, setShowCoverMediaLibrary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalTitle(projectTitle);
    setLocalDescription(projectDescription);
    setLocalUrl(projectUrl);
  }, [projectTitle, projectDescription, projectUrl]);

  const handleSave = () => {
    setProjectTitle(localTitle);
    setProjectDescription(localDescription);
    if (localUrl) {
      setProjectUrl(localUrl);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGenerateUrl = () => {
    const url = generateInvitationUrl();
    setLocalUrl(url);
    setProjectUrl(url);
  };

  const handleCopyUrl = async () => {
    const fullUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}${localUrl || projectUrl}` 
      : localUrl || projectUrl;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Gagal menyalin URL');
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang didukung');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setProjectThumbnail(url);
      };
      reader.onerror = () => {
        alert('Gagal membaca file');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Gagal mengunggah thumbnail');
    }
  };

  const handleSelectFromMediaLibrary = (url: string) => {
    setProjectThumbnail(url);
    setShowMediaLibrary(false);
  };

  const handleRemoveThumbnail = () => {
    setProjectThumbnail('');
  };

  return (
    <SettingsContainer>
      <Section>
        <SectionTitle>
          <FaCog />
          Pengaturan Proyek
        </SectionTitle>
        <SectionDescription>
          Kelola pengaturan dasar untuk undangan Anda, termasuk judul, deskripsi, URL, dan thumbnail.
        </SectionDescription>
      </Section>

      <Section>
        <InputGroup>
          <Label>
            Judul Undangan<Required>*</Required>
          </Label>
          <Input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Masukkan judul undangan"
          />
          <InfoText>Judul akan ditampilkan di halaman undangan</InfoText>
        </InputGroup>

        <InputGroup>
          <Label>
            Deskripsi
          </Label>
          <Textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            placeholder="Masukkan deskripsi undangan (opsional)"
          />
          <InfoText>Deskripsi default: "Undangan digital yang dibuat dengan Idinvitebook"</InfoText>
        </InputGroup>

        <Button $primary onClick={handleSave} style={{ width: '100%', marginTop: '8px' }}>
          <FaSave />
          Simpan Perubahan
        </Button>
        {saved && (
          <SuccessMessage>
            <FaCheck />
            Perubahan berhasil disimpan!
          </SuccessMessage>
        )}
      </Section>

      <Section>
        <SectionTitle>
          <FaLink />
          URL Undangan
        </SectionTitle>
        <SectionDescription>
          Buat atau salin URL untuk membagikan undangan Anda.
        </SectionDescription>

        <InputGroup>
          <Label>URL Undangan</Label>
          <UrlGroup>
            <UrlInput
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="/invitation/..."
              readOnly
            />
            <Button $small onClick={handleGenerateUrl}>
              <FaLink />
              Buat URL
            </Button>
            <Button 
              $small 
              onClick={handleCopyUrl}
              disabled={!localUrl && !projectUrl}
            >
              {copied ? <FaCheck /> : <FaCopy />}
              {copied ? 'Tersalin' : 'Salin'}
            </Button>
          </UrlGroup>
          <InfoText>
            {localUrl || projectUrl 
              ? `URL lengkap: ${typeof window !== 'undefined' ? window.location.origin : ''}${localUrl || projectUrl}`
              : 'Klik "Buat URL" untuk menghasilkan URL undangan'}
          </InfoText>
        </InputGroup>
      </Section>

      <Section>
        <SectionTitle>
          <FaImage />
          Thumbnail
        </SectionTitle>
        <SectionDescription>
          Unggah thumbnail untuk undangan Anda atau pilih dari media library.
        </SectionDescription>

        <ThumbnailPreview $url={projectThumbnail}>
          {!projectThumbnail && (
            <ThumbnailPlaceholder>
              <FaImage size={32} />
              <div style={{ marginTop: '8px' }}>Belum ada thumbnail</div>
            </ThumbnailPlaceholder>
          )}
        </ThumbnailPreview>

        <ThumbnailActions>
          <Button $small onClick={() => fileInputRef.current?.click()}>
            <FaUpload />
            Unggah Gambar
          </Button>
          <Button $small onClick={() => setShowMediaLibrary(!showMediaLibrary)}>
            <FaImage />
            {showMediaLibrary ? 'Tutup Media Library' : 'Pilih dari Media'}
          </Button>
          {projectThumbnail && (
            <Button $small onClick={handleRemoveThumbnail}>
              <FaTrash />
              Hapus
            </Button>
          )}
        </ThumbnailActions>

        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleThumbnailUpload}
        />

        {showMediaLibrary && (
          <MediaLibraryContainer>
            <MediaLibrary 
              fileType="image" 
              onSelect={handleSelectFromMediaLibrary}
              showUploadButton={false}
            />
          </MediaLibraryContainer>
        )}
      </Section>

      <Section>
        <SectionTitle>
          <FaImage />
          Cover Undangan
        </SectionTitle>
        <SectionDescription>
          Atur cover yang akan ditampilkan sebelum undangan dibuka. Tamu harus klik tombol "Buka Undangan" untuk melihat konten.
        </SectionDescription>

        <InputGroup>
          <Label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={coverEnabled}
              onChange={(e) => setCoverEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Aktifkan Cover
          </Label>
          <InfoText>Centang untuk mengaktifkan cover undangan</InfoText>
        </InputGroup>

        {coverEnabled && (
          <>
            <ThumbnailPreview $url={coverImage}>
              {!coverImage && (
                <ThumbnailPlaceholder>
                  <FaImage size={32} />
                  <div style={{ marginTop: '8px' }}>Belum ada cover image</div>
                </ThumbnailPlaceholder>
              )}
            </ThumbnailPreview>

            <ThumbnailActions>
              <Button $small onClick={() => coverFileInputRef.current?.click()}>
                <FaUpload />
                Unggah Gambar
              </Button>
              <Button $small onClick={() => setShowCoverMediaLibrary(!showCoverMediaLibrary)}>
                <FaImage />
                {showCoverMediaLibrary ? 'Tutup Media Library' : 'Pilih dari Media'}
              </Button>
              {coverImage && (
                <Button $small onClick={() => setCoverImage('')}>
                  <FaTrash />
                  Hapus
                </Button>
              )}
            </ThumbnailActions>

            <HiddenFileInput
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                if (!file.type.startsWith('image/')) {
                  alert('Hanya file gambar yang didukung');
                  return;
                }

                try {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const url = event.target?.result as string;
                    setCoverImage(url);
                  };
                  reader.onerror = () => {
                    alert('Gagal membaca file');
                  };
                  reader.readAsDataURL(file);
                } catch (error) {
                  console.error('Error uploading cover:', error);
                  alert('Gagal mengunggah cover');
                }
              }}
            />

            {showCoverMediaLibrary && (
              <MediaLibraryContainer>
                <MediaLibrary 
                  fileType="image" 
                  onSelect={(url) => {
                    setCoverImage(url);
                    setShowCoverMediaLibrary(false);
                  }}
                  showUploadButton={false}
                />
              </MediaLibraryContainer>
            )}

            <InputGroup style={{ marginTop: '16px' }}>
              <Label>
                Text Tombol Buka Undangan
              </Label>
              <Input
                type="text"
                value={coverButtonText}
                onChange={(e) => setCoverButtonText(e.target.value)}
                placeholder="Buka Undangan"
              />
              <InfoText>Text yang ditampilkan di tombol cover</InfoText>
            </InputGroup>
          </>
        )}
      </Section>
    </SettingsContainer>
  );
}

