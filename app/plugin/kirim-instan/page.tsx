'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaWhatsapp, FaSave, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
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

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
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

const Button = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${props => props.$primary ? '#25D366' : '#2a2a2a'};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$primary ? '#20BA5A' : '#3a3a3a'};
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

const TemplateSection = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
`;

const TemplateList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const TemplateCard = styled.div`
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  position: relative;
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const TemplateName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2a2a2a;
  margin: 0;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #e0e0e0;
    color: #2a2a2a;
  }
`;

const TemplateContent = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  white-space: pre-wrap;
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #2a2a2a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background: #f0f0f0;
  }
`;

interface Template {
  id: string;
  name: string;
  template: string;
  is_default: number;
  project_id: string | null;
}

export default function KirimInstanPage() {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const projectIdFromUrl = searchParams?.get('project_id') || '';
  const slugFromUrl = searchParams?.get('slug') || '';
  const projectIdFromStore = useEditorStore((state) => state.projectId);
  const projectUrl = useEditorStore((state) => state.projectUrl);
  const projectSlugFromStore = useEditorStore((state) => state.projectSlug);
  const projectId = projectIdFromUrl || projectIdFromStore;
  const currentSlug = slugFromUrl || projectSlugFromStore;
  
  const [nama, setNama] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [projectId]);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/plugins/templates?project_id=${projectId || ''}`);
      const data = await response.json();
      setTemplates(data);
      
      // Pilih default template jika ada, atau template pertama
      if (data.length > 0 && !selectedTemplate) {
        const defaultTemplate = data.find((t: Template) => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate.id);
        } else {
          setSelectedTemplate(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSendWhatsApp = () => {
    if (!nama || !selectedTemplate) {
      alert('Harap isi nama dan pilih template');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Replace template variables
    let message = template.template;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const invitationLink = currentSlug ? `${baseUrl}/undangan/${currentSlug}` : (projectUrl || baseUrl);
    message = message.replace(/\{\{nama\}\}/g, nama);
    message = message.replace(/\{\{link\}\}/g, invitationLink);

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp Web/App without phone number (user will enter manually)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSaveTemplate = async () => {
    if (!templateName || !templateContent) {
      alert('Harap isi nama dan konten template');
      return;
    }

    try {
      const url = editingTemplate ? '/api/plugins/templates' : '/api/plugins/templates';
      const method = editingTemplate ? 'PUT' : 'POST';
      const body = editingTemplate
        ? { id: editingTemplate.id, name: templateName, template: templateContent, is_default: 0 }
        : { name: templateName, template: templateContent, is_default: 0, project_id: projectId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowTemplateModal(false);
        setEditingTemplate(null);
        setTemplateName('');
        setTemplateContent('');
        loadTemplates();
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Gagal menyimpan template');
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateContent(template.template);
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) return;

    try {
      const response = await fetch(`/api/plugins/templates?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Gagal menghapus template');
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const previewMessage = selectedTemplateData
    ? selectedTemplateData.template
        .replace(/\{\{nama\}\}/g, nama || '{{nama}}')
        .replace(/\{\{link\}\}/g, projectUrl || '{{link}}')
    : '';

  return (
    <Container>
      <Header>
        <BackButton onClick={() => router.back()}>
          <FaArrowLeft /> Kembali
        </BackButton>
        <Title>Kirim Instan ke WhatsApp</Title>
      </Header>

      <Card>
        <FormGroup>
          <Label>Nama Penerima</Label>
          <Input
            type="text"
            placeholder="Masukkan nama penerima"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Template Pesan</Label>
          <Select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">Pilih template...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        {selectedTemplateData && (
          <FormGroup>
            <Label>Preview Pesan</Label>
            <Textarea
              value={previewMessage}
              readOnly
              style={{ background: '#f9f9f9' }}
            />
          </FormGroup>
        )}

        <ButtonGroup>
          <Button $primary onClick={handleSendWhatsApp} disabled={!nama || !selectedTemplate}>
            <FaWhatsapp /> Kirim ke WhatsApp
          </Button>
        </ButtonGroup>
      </Card>

      <Card>
        <TemplateSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#2a2a2a', margin: 0 }}>
              Kelola Template
            </h2>
            <Button onClick={() => {
              setEditingTemplate(null);
              setTemplateName('');
              setTemplateContent('');
              setShowTemplateModal(true);
            }}>
              <FaPlus /> Tambah Template
            </Button>
          </div>

          <TemplateList>
            {templates.map((template) => (
              <TemplateCard key={template.id}>
                <TemplateHeader>
                  <TemplateName>{template.name}</TemplateName>
                  <TemplateActions>
                    {!template.is_default && (
                      <>
                        <IconButton onClick={() => handleEditTemplate(template)} title="Edit">
                          <FaEdit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteTemplate(template.id)} title="Hapus">
                          <FaTrash />
                        </IconButton>
                      </>
                    )}
                  </TemplateActions>
                </TemplateHeader>
                <TemplateContent>{template.template}</TemplateContent>
              </TemplateCard>
            ))}
          </TemplateList>
        </TemplateSection>
      </Card>

      <Modal $show={showTemplateModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editingTemplate ? 'Edit Template' : 'Tambah Template'}</ModalTitle>
            <CloseButton onClick={() => {
              setShowTemplateModal(false);
              setEditingTemplate(null);
              setTemplateName('');
              setTemplateContent('');
            }}>×</CloseButton>
          </ModalHeader>

          <FormGroup>
            <Label>Nama Template</Label>
            <Input
              type="text"
              placeholder="Nama template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Konten Template</Label>
            <Textarea
              placeholder="Gunakan {{nama}} untuk nama dan {{link}} untuk link undangan"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Variabel yang tersedia: {'{'}nama{'}'} dan {'{'}link{'}'}
            </small>
          </FormGroup>

          <ButtonGroup>
            <Button onClick={handleSaveTemplate}>
              <FaSave /> Simpan
            </Button>
            <Button onClick={() => {
              setShowTemplateModal(false);
              setEditingTemplate(null);
              setTemplateName('');
              setTemplateContent('');
            }}>
              Batal
            </Button>
          </ButtonGroup>
        </ModalContent>
      </Modal>
    </Container>
  );
}

