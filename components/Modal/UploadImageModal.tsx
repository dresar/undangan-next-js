'use client';

import styled from 'styled-components';
import { useState, useRef, useCallback } from 'react';
import { FaTimes, FaUpload, FaCrop, FaCheck, FaUndo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';

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
  background: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
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
  transition: all 0.2s;

  &:hover {
    background: #e0e0e0;
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const UploadArea = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed ${(props) => (props.$isDragging ? '#007bff' : '#d0d0d0')};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background: ${(props) => (props.$isDragging ? '#f0f7ff' : '#fafafa')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #007bff;
    background: #f0f7ff;
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: #007bff;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
`;

const UploadText = styled.p`
  font-size: 16px;
  color: #666;
  margin: 8px 0;
`;

const UploadHint = styled.p`
  font-size: 12px;
  color: #999;
  margin: 4px 0;
`;

const FileInput = styled.input`
  display: none;
`;

const CropContainer = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CropArea = styled.div`
  position: relative;
  max-width: 100%;
  display: flex;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  overflow: hidden;

  .react-crop-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
`;

const CropControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const CropButton = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  ${(props) =>
    props.$primary
      ? `
    background: #007bff;
    color: #ffffff;
    &:hover {
      background: #0056b3;
    }
  `
      : `
    background: #f0f0f0;
    color: #333;
    &:hover {
      background: #e0e0e0;
    }
  `}
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
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #007bff;
    transform: scale(1.05);
  }

  img {
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
  background: rgba(255, 0, 0, 0.8);
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
    background: rgba(255, 0, 0, 1);
    transform: scale(1.1);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
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
    background: #007bff;
    color: #ffffff;
    &:hover {
      background: #0056b3;
    }
  `
      : `
    background: #f0f0f0;
    color: #333;
    &:hover {
      background: #e0e0e0;
    }
  `}
`;

const LoadingText = styled.div`
  text-align: center;
  color: #666;
  padding: 20px;
  font-size: 14px;
`;

interface ImageFile {
  file: File;
  preview: string;
  crop?: Crop;
  completedCrop?: PixelCrop;
  croppedImageUrl?: string;
}

interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (urls: string[]) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function UploadImageModal({
  isOpen,
  onClose,
  onUpload,
}: UploadImageModalProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (currentCropIndex === null || !imgRef.current || !e.currentTarget) return;
    
    const imgElement = e.currentTarget;
    if (!imgElement.naturalWidth || !imgElement.naturalHeight) return;
    
    // Hanya buat crop jika belum ada crop sebelumnya
    setImages((prev) => {
      const updated = [...prev];
      if (updated[currentCropIndex] && !updated[currentCropIndex].crop) {
        const { naturalWidth, naturalHeight, width, height } = imgElement;
        // Buat crop area yang lebih besar dan bisa di-geser (80% dari gambar)
        const cropWidth = Math.min(width * 0.8, naturalWidth);
        const cropHeight = Math.min(height * 0.8, naturalHeight);
        const cropX = (width - cropWidth) / 2;
        const cropY = (height - cropHeight) / 2;
        
        const crop: Crop = {
          unit: 'px',
          x: cropX,
          y: cropY,
          width: cropWidth,
          height: cropHeight,
        };
        
        updated[currentCropIndex] = { ...updated[currentCropIndex], crop };
      }
      return updated;
    });
  }, [currentCropIndex]);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).filter((file) =>
      file.type.startsWith('image/')
    );

    const newImages: ImageFile[] = [];

    for (const file of newFiles) {
      const reader = new FileReader();
      const preview = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push({ file, preview });
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (currentCropIndex === index) {
        setCurrentCropIndex(null);
      } else if (currentCropIndex !== null && currentCropIndex > index) {
        setCurrentCropIndex(currentCropIndex - 1);
      }
      return updated;
    });
  };

  const startCrop = (index: number) => {
    setCurrentCropIndex(index);
    // Reset crop untuk gambar ini
    setImages((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], crop: undefined };
      }
      return updated;
    });
  };

  const cancelCrop = () => {
    setCurrentCropIndex(null);
  };

  const completeCrop = (index: number, crop: PixelCrop) => {
    if (!imgRef.current || !canvasRef.current || !crop.width || !crop.height) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Pastikan crop tidak melebihi dimensi gambar
    const cropX = Math.max(0, Math.min(crop.x, image.naturalWidth - crop.width));
    const cropY = Math.max(0, Math.min(crop.y, image.naturalHeight - crop.height));
    const cropWidth = Math.min(crop.width, image.naturalWidth - cropX);
    const cropHeight = Math.min(crop.height, image.naturalHeight - cropY);

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas untuk kualitas lebih baik
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const croppedFile = new File([blob], `cropped-${Date.now()}.webp`, { type: 'image/webp' });
      const croppedImageUrl = URL.createObjectURL(blob);

      setImages((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          completedCrop: crop,
          croppedImageUrl,
          file: croppedFile,
        };
        return updated;
      });

      setCurrentCropIndex(null);
    }, 'image/webp', 0.9);
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
    const processedUrls: string[] = [];

    for (const image of images) {
      if (image.croppedImageUrl) {
        // Use cropped image
        processedUrls.push(image.croppedImageUrl);
      } else {
        // Compress original image
        const compressed = await compressImage(image.file);
        processedUrls.push(compressed);
      }
    }

    onUpload(processedUrls);
    handleClose();
  };

  const handleClose = () => {
    images.forEach((img) => {
      if (img.croppedImageUrl) {
        URL.revokeObjectURL(img.croppedImageUrl);
      }
    });
    setImages([]);
    setCurrentCropIndex(null);
    setIsDragging(false);
    setIsProcessing(false);
    onClose();
  };

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
              <ModalTitle>Unggah Gambar</ModalTitle>
              <CloseButton onClick={handleClose}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              {images.length === 0 ? (
                <UploadArea
                  $isDragging={isDragging}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon>
                    <FaUpload />
                  </UploadIcon>
                  <UploadText>Klik atau seret & lepas gambar di sini</UploadText>
                  <UploadHint>Format: JPG, PNG, GIF (Maks 10MB)</UploadHint>
                  <FileInput
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </UploadArea>
              ) : (
                <>
                  {isProcessing ? (
                    <LoadingText>Memproses gambar... (Kompresi ke WebP)</LoadingText>
                  ) : (
                    <>
                      {images.map((image, index) => (
                        <CropContainer key={index}>
                          {currentCropIndex === index ? (
                            <>
                              <CropArea>
                                <ReactCrop
                                  crop={image.crop}
                                  onChange={(c) => {
                                    if (c) {
                                      setImages((prev) => {
                                        const updated = [...prev];
                                        updated[index] = { ...updated[index], crop: c };
                                        return updated;
                                      });
                                    }
                                  }}
                                  aspect={undefined}
                                  minWidth={50}
                                  minHeight={50}
                                  locked={false}
                                  className="react-crop-container"
                                >
                                  <img
                                    ref={imgRef}
                                    src={image.preview}
                                    alt={`Preview ${index + 1}`}
                                    style={{ 
                                      maxWidth: '100%', 
                                      maxHeight: '500px',
                                      display: 'block',
                                      userSelect: 'none'
                                    }}
                                    onLoad={onImageLoad}
                                  />
                                </ReactCrop>
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                              </CropArea>
                              <CropControls>
                                <CropButton
                                  onClick={() => {
                                    if (imgRef.current && image.crop) {
                                      const img = imgRef.current;
                                      const scaleX = img.naturalWidth / img.width;
                                      const scaleY = img.naturalHeight / img.height;
                                      
                                      // Konversi crop dari pixel display ke pixel natural
                                      let pixelCrop: PixelCrop;
                                      
                                      if (image.crop.unit === '%') {
                                        // Jika crop dalam persen, konversi ke pixel
                                        pixelCrop = {
                                          x: (image.crop.x / 100) * img.naturalWidth,
                                          y: (image.crop.y / 100) * img.naturalHeight,
                                          width: (image.crop.width / 100) * img.naturalWidth,
                                          height: (image.crop.height / 100) * img.naturalHeight,
                                          unit: 'px',
                                        };
                                      } else {
                                        // Jika sudah dalam pixel, scale ke natural size
                                        pixelCrop = {
                                          x: image.crop.x * scaleX,
                                          y: image.crop.y * scaleY,
                                          width: image.crop.width * scaleX,
                                          height: image.crop.height * scaleY,
                                          unit: 'px',
                                        };
                                      }
                                      
                                      completeCrop(index, pixelCrop);
                                    }
                                  }}
                                  $primary
                                  disabled={!image.crop}
                                >
                                  <FaCheck /> Terapkan Crop
                                </CropButton>
                                <CropButton onClick={cancelCrop}>
                                  <FaUndo /> Batal
                                </CropButton>
                              </CropControls>
                            </>
                          ) : (
                            <>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <img
                                  src={image.croppedImageUrl || image.preview}
                                  alt={`Preview ${index + 1}`}
                                  style={{
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                    borderRadius: '8px',
                                    objectFit: 'contain',
                                    border: '2px solid #e0e0e0',
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ marginBottom: '8px' }}>
                                    <strong>Gambar {index + 1}</strong>
                                    {image.croppedImageUrl && (
                                      <span style={{ color: '#28a745', marginLeft: '8px', fontSize: '12px' }}>
                                        ✓ Sudah di-crop
                                      </span>
                                    )}
                                  </div>
                                  <CropControls>
                                    <CropButton onClick={() => startCrop(index)}>
                                      <FaCrop /> Crop Gambar
                                    </CropButton>
                                    <CropButton
                                      onClick={() => removeFile(index)}
                                      style={{ background: '#dc3545', color: '#fff' }}
                                    >
                                      <FaTimes /> Hapus
                                    </CropButton>
                                  </CropControls>
                                </div>
                              </div>
                            </>
                          )}
                        </CropContainer>
                      ))}
                      <ActionButtons>
                        <Button onClick={handleClose}>Batal</Button>
                        <Button $primary onClick={handleUpload} disabled={isProcessing}>
                          Unggah ({images.length}) - Kompresi ke WebP
                        </Button>
                      </ActionButtons>
                    </>
                  )}
                </>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}
