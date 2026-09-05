'use client';

import React, { useState } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertySelect, PropertyNote } from '../shared/styled';

interface FormPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const FormProperties: React.FC<FormPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const content = typeof block.content === 'object' && block.content !== null
    ? block.content
    : { fields: [] };
  
  const fields = Array.isArray(content.fields) ? content.fields : [];

  const handleAddField = () => {
    const newField = {
      type: 'text',
      label: 'Field Baru',
      placeholder: '',
      required: false,
    };
    updateContent({
      ...content,
      fields: [...fields, newField],
    });
  };

  const handleUpdateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = {
      ...newFields[index],
      [key]: value,
    };
    updateContent({
      ...content,
      fields: newFields,
    });
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_: any, i: number) => i !== index);
    updateContent({
      ...content,
      fields: newFields,
    });
  };

  return (
    <>
      <PropertySection>
        <PropertyLabel>Form Fields</PropertyLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fields.map((field: any, index: number) => (
            <div
              key={index}
              style={{
                padding: '12px',
                border: '1px solid #4a4a4a',
                borderRadius: '4px',
                background: '#2a2a2a',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#ff6b35' }}>
                  Field {index + 1}
                </span>
                <button
                  onClick={() => handleRemoveField(index)}
                  style={{
                    padding: '4px 8px',
                    background: '#ff4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Hapus
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <PropertySelect
                  value={field.type || 'text'}
                  onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
                  style={{ fontSize: '12px' }}
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Telepon</option>
                  <option value="textarea">Textarea</option>
                </PropertySelect>
                
                <PropertyInput
                  type="text"
                  value={field.label || ''}
                  onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
                  placeholder="Label Field"
                  style={{ fontSize: '12px' }}
                />
                
                <PropertyInput
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => handleUpdateField(index, 'placeholder', e.target.value)}
                  placeholder="Placeholder"
                  style={{ fontSize: '12px' }}
                />
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={field.required || false}
                    onChange={(e) => handleUpdateField(index, 'required', e.target.checked)}
                  />
                  Required
                </label>
              </div>
            </div>
          ))}
          
          <button
            onClick={handleAddField}
            style={{
              padding: '10px',
              background: '#ff6b35',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            + Tambah Field
          </button>
        </div>
        <PropertyNote>
          Tambahkan field untuk form. Field akan ditampilkan secara vertikal.
        </PropertyNote>
      </PropertySection>
    </>
  );
};

