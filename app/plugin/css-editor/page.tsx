'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaCode, FaGlobe } from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';

const Container = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #2a2a2a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #2a2a2a;
  margin: 0;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #2a2a2a;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const CodeEditor = styled.textarea`
  width: 100%;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  min-height: 400px;
  resize: vertical;
  background: #1e1e1e;
  color: #d4d4d4;
  line-height: 1.6;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${props => props.$primary ? '#ff6b35' : '#2a2a2a'};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$primary ? '#e55a2b' : '#3a3a3a'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const InfoBox = styled.div`
  background: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #0066cc;
  margin: 0 0 8px 0;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #0066cc;
  margin: 4px 0;
  line-height: 1.6;
`;

const CodeExample = styled.pre`
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  margin: 8px 0;
`;

interface CSSData {
  id: string;
  project_id: string;
  block_id: string | null;
  css_code: string;
  is_global: number;
}

export default function CSSEditorPage() {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const projectIdFromUrl = searchParams?.get('project_id') || '';
  const slugFromUrl = searchParams?.get('slug') || '';
  const projectIdFromStore = useEditorStore((state) => state.projectId);
  const projectSlugFromStore = useEditorStore((state) => state.projectSlug);
  const projectId = projectIdFromUrl || projectIdFromStore;
  const currentSlug = slugFromUrl || projectSlugFromStore;
  const blocks = useEditorStore((state) => state.blocks);
  
  const [cssCode, setCssCode] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('global');
  const [isGlobal, setIsGlobal] = useState(true);
  const [savedCSS, setSavedCSS] = useState<CSSData[]>([]);

  useEffect(() => {
    if (projectId) {
      loadCSS();
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedBlock === 'global') {
      setIsGlobal(true);
      loadGlobalCSS();
    } else {
      setIsGlobal(false);
      loadBlockCSS(selectedBlock);
    }
  }, [selectedBlock]);

  const loadCSS = async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/plugins/css?project_id=${projectId}`);
      const data = await response.json();
      setSavedCSS(data);
    } catch (error) {
      console.error('Error loading CSS:', error);
    }
  };

  const loadGlobalCSS = async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/plugins/css?project_id=${projectId}`);
      const data = await response.json();
      const globalCSS = data.find((css: CSSData) => css.is_global === 1);
      if (globalCSS) {
        setCssCode(globalCSS.css_code || '');
      } else {
        setCssCode('');
      }
    } catch (error) {
      console.error('Error loading global CSS:', error);
    }
  };

  const loadBlockCSS = async (blockId: string) => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/plugins/css?project_id=${projectId}&block_id=${blockId}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setCssCode(data[0].css_code || '');
      } else {
        setCssCode('');
      }
    } catch (error) {
      console.error('Error loading block CSS:', error);
    }
  };

  const handleSave = async () => {
    if (!projectId) {
      alert('Tidak ada project yang dipilih');
      return;
    }

    try {
      const response = await fetch('/api/plugins/css', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          block_id: selectedBlock === 'global' ? null : selectedBlock,
          css_code: cssCode,
          is_global: selectedBlock === 'global' ? 1 : 0,
        }),
      });

      if (response.ok) {
        alert('CSS berhasil disimpan');
        loadCSS();
      } else {
        alert('Gagal menyimpan CSS');
      }
    } catch (error) {
      console.error('Error saving CSS:', error);
      alert('Gagal menyimpan CSS');
    }
  };

  const exampleCSS = `/* Contoh CSS Global */
.canvas-area {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Contoh CSS untuk Block Spesifik */
[data-block-id="block-123"] {
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`;

  return (
    <Container>
      <Header>
        <BackButton onClick={() => router.back()}>
          <FaArrowLeft /> Kembali
        </BackButton>
        <Title>CSS Editor</Title>
      </Header>

      <Card>
        <InfoBox>
          <InfoTitle>
            <FaCode /> Panduan CSS Editor
          </InfoTitle>
          <InfoText>
            • <strong>CSS Global:</strong> Akan diterapkan ke seluruh halaman undangan
          </InfoText>
          <InfoText>
            • <strong>CSS Block:</strong> Akan diterapkan hanya ke block yang dipilih
          </InfoText>
          <InfoText>
            • Gunakan selector seperti <code>.canvas-area</code> untuk styling global
          </InfoText>
          <InfoText>
            • Gunakan <code>[data-block-id="block-id"]</code> untuk styling block spesifik
          </InfoText>
        </InfoBox>

        <FormGroup>
          <Label>
            {isGlobal ? <><FaGlobe /> CSS Global</> : 'CSS untuk Block'}
          </Label>
          <Select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
          >
            <option value="global">CSS Global (Semua Block)</option>
            {blocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.type} - {block.id.substring(0, 20)}...
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Kode CSS</Label>
          <CodeEditor
            value={cssCode}
            onChange={(e) => setCssCode(e.target.value)}
            placeholder="Masukkan kode CSS di sini..."
            spellCheck={false}
          />
        </FormGroup>

        <ButtonGroup>
          <Button $primary onClick={handleSave} disabled={!projectId}>
            <FaSave /> Simpan CSS
          </Button>
          <Button onClick={() => setCssCode(exampleCSS)}>
            <FaCode /> Contoh CSS
          </Button>
        </ButtonGroup>
      </Card>

      <Card>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#2a2a2a', marginBottom: '16px' }}>
          CSS yang Tersimpan
        </h2>
        {savedCSS.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Belum ada CSS yang disimpan
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {savedCSS.map((css) => (
              <div
                key={css.id}
                style={{
                  background: '#f9f9f9',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: '#2a2a2a' }}>
                    {css.is_global ? 'CSS Global' : `Block: ${css.block_id?.substring(0, 20)}...`}
                  </strong>
                </div>
                <CodeExample>{css.css_code.substring(0, 200)}...</CodeExample>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Container>
  );
}

