'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FormTextarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

interface FormBlockProps {
  block: Block;
}

export default function FormBlock({ block }: FormBlockProps) {
  const content = typeof block.content === 'object' && block.content !== null
    ? block.content
    : { fields: [] };
  
  const fields = Array.isArray(content.fields) ? content.fields : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <FormContainer style={block.styles} onSubmit={handleSubmit}>
      {fields.map((field: any, index: number) => (
        <FormField key={index}>
          {field.label && <FormLabel>{field.label}</FormLabel>}
          {field.type === 'textarea' ? (
            <FormTextarea
              placeholder={field.placeholder || ''}
              required={field.required}
            />
          ) : (
            <FormInput
              type={field.type || 'text'}
              placeholder={field.placeholder || ''}
              required={field.required}
            />
          )}
        </FormField>
      ))}
      {fields.length > 0 && (
        <SubmitButton type="submit">Kirim</SubmitButton>
      )}
      {fields.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          Tambahkan field untuk form
        </div>
      )}
    </FormContainer>
  );
}

