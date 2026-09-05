'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaQrcode, FaPlus, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';
import QRCode from 'qrcode.react';

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
  min-height: 80px;
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
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const GuestList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const GuestCard = styled.div`
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  position: relative;
`;

const GuestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const GuestName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2a2a2a;
  margin: 0;
`;

const GuestActions = styled.div`
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

const GuestInfo = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => 
    props.$status === 'confirmed' ? '#d4edda' :
    props.$status === 'declined' ? '#f8d7da' :
    '#fff3cd'
  };
  color: ${props => 
    props.$status === 'confirmed' ? '#155724' :
    props.$status === 'declined' ? '#721c24' :
    '#856404'
  };
`;

const QRCodeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-top: 24px;
`;

const QRCodeContainer = styled.div`
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

interface Guest {
  id: string;
  project_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
  qr_code: string;
  notes: string | null;
}

export default function DaftarUndanganPage() {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const projectIdFromUrl = searchParams?.get('project_id') || '';
  const slugFromUrl = searchParams?.get('slug') || '';
  const projectIdFromStore = useEditorStore((state) => state.projectId);
  const projectUrl = useEditorStore((state) => state.projectUrl);
  const projectSlugFromStore = useEditorStore((state) => state.projectSlug);
  const projectId = projectIdFromUrl || projectIdFromStore;
  const currentSlug = slugFromUrl || projectSlugFromStore;
  
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  useEffect(() => {
    if (projectId) {
      loadGuests();
    }
  }, [projectId]);

  const loadGuests = async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/plugins/guests?project_id=${projectId}`);
      const data = await response.json();
      setGuests(data);
    } catch (error) {
      console.error('Error loading guests:', error);
    }
  };

  const handleSaveGuest = async () => {
    if (!formData.name || !projectId) {
      alert('Harap isi nama tamu');
      return;
    }

    try {
      const url = '/api/plugins/guests';
      const method = editingGuest ? 'PUT' : 'POST';
      const body = editingGuest
        ? { id: editingGuest.id, ...formData, status: editingGuest.status }
        : { project_id: projectId, ...formData };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingGuest(null);
        setFormData({ name: '', phone: '', email: '', notes: '' });
        loadGuests();
      }
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('Gagal menyimpan tamu');
    }
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      phone: guest.phone || '',
      email: guest.email || '',
      notes: guest.notes || '',
    });
    setShowModal(true);
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tamu ini?')) return;

    try {
      const response = await fetch(`/api/plugins/guests?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadGuests();
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Gagal menghapus tamu');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const guest = guests.find(g => g.id === id);
      if (!guest) return;

      const response = await fetch('/api/plugins/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...guest, status }),
      });

      if (response.ok) {
        loadGuests();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const invitationUrl = projectSlug 
    ? `${window.location.origin}/undangan/${projectSlug}`
    : projectUrl || window.location.origin;

  return (
    <Container>
      <Header>
        <BackButton onClick={() => router.back()}>
          <FaArrowLeft /> Kembali
        </BackButton>
        <Title>Daftar Undangan</Title>
      </Header>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#2a2a2a', margin: 0 }}>
            Daftar Tamu
          </h2>
          <Button onClick={() => {
            setEditingGuest(null);
            setFormData({ name: '', phone: '', email: '', notes: '' });
            setShowModal(true);
          }}>
            <FaPlus /> Tambah Tamu
          </Button>
        </div>

        <GuestList>
          {guests.map((guest) => (
            <GuestCard key={guest.id}>
              <GuestHeader>
                <GuestName>{guest.name}</GuestName>
                <GuestActions>
                  <IconButton onClick={() => setSelectedGuest(guest)} title="Lihat QR Code">
                    <FaQrcode />
                  </IconButton>
                  <IconButton onClick={() => handleEditGuest(guest)} title="Edit">
                    <FaEdit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteGuest(guest.id)} title="Hapus">
                    <FaTrash />
                  </IconButton>
                </GuestActions>
              </GuestHeader>
              <GuestInfo>
                {guest.phone && <div>📞 {guest.phone}</div>}
                {guest.email && <div>✉️ {guest.email}</div>}
                <div style={{ marginTop: '8px' }}>
                  Status: <StatusBadge $status={guest.status}>
                    {guest.status === 'confirmed' ? 'Dikonfirmasi' :
                     guest.status === 'declined' ? 'Ditolak' : 'Pending'}
                  </StatusBadge>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <Button 
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    onClick={() => handleUpdateStatus(guest.id, 'confirmed')}
                  >
                    Konfirmasi
                  </Button>
                  <Button 
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    onClick={() => handleUpdateStatus(guest.id, 'declined')}
                  >
                    Tolak
                  </Button>
                </div>
              </GuestInfo>
            </GuestCard>
          ))}
        </GuestList>

        {guests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Belum ada tamu yang ditambahkan
          </div>
        )}
      </Card>

      <Card>
        <QRCodeSection>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#2a2a2a', margin: 0 }}>
            QR Code untuk Tamu
          </h2>
          <QRCodeContainer>
            <QRCode value={invitationUrl} size={200} />
          </QRCodeContainer>
          <p style={{ fontSize: '14px', color: '#666', margin: 0, textAlign: 'center' }}>
            Scan QR code ini untuk mengakses undangan
          </p>
          <Button onClick={() => window.open(invitationUrl, '_blank')}>
            <FaExternalLinkAlt /> Buka Undangan
          </Button>
        </QRCodeSection>
      </Card>

      <Modal $show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editingGuest ? 'Edit Tamu' : 'Tambah Tamu'}</ModalTitle>
            <CloseButton onClick={() => {
              setShowModal(false);
              setEditingGuest(null);
              setFormData({ name: '', phone: '', email: '', notes: '' });
            }}>×</CloseButton>
          </ModalHeader>

          <FormGroup>
            <Label>Nama Tamu *</Label>
            <Input
              type="text"
              placeholder="Nama tamu"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Nomor Telepon</Label>
            <Input
              type="tel"
              placeholder="Nomor telepon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Catatan</Label>
            <Textarea
              placeholder="Catatan tambahan"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </FormGroup>

          <ButtonGroup>
            <Button $primary onClick={handleSaveGuest}>
              Simpan
            </Button>
            <Button onClick={() => {
              setShowModal(false);
              setEditingGuest(null);
              setFormData({ name: '', phone: '', email: '', notes: '' });
            }}>
              Batal
            </Button>
          </ButtonGroup>
        </ModalContent>
      </Modal>

      <Modal $show={selectedGuest !== null}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>QR Code - {selectedGuest?.name}</ModalTitle>
            <CloseButton onClick={() => setSelectedGuest(null)}>×</CloseButton>
          </ModalHeader>
          {selectedGuest && (
            <QRCodeSection>
              <QRCodeContainer>
                <QRCode value={`${invitationUrl}?guest=${selectedGuest.qr_code}`} size={250} />
              </QRCodeContainer>
              <p style={{ fontSize: '14px', color: '#666', margin: 0, textAlign: 'center' }}>
                QR Code khusus untuk {selectedGuest.name}
              </p>
            </QRCodeSection>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
}

