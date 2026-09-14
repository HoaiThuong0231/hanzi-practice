/**
 * TemplateGalleryModal Component
 * 
 * Interactive gallery inspired by NQEZ.com template store.
 * Allows users to choose pre-made worksheet paper styles and fonts.
 */

import React, { useState } from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import { WORKSHEET_TEMPLATES, FONT_OPTIONS, type WorksheetTemplate } from '../../types';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Tất cả',
  'Thư pháp & Bút nét',
  'Ô đặc biệt',
  'Bút cứng',
  'Từ vựng',
  'Nét cơ bản',
  'Đoạn văn',
  'Thứ tự nét',
  'Tên cá nhân',
];

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({ isOpen, onClose }) => {
  const store = useWorksheetStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [activeTab, setActiveTab] = useState<'templates' | 'fonts'>('templates');

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'Tất cả'
    ? WORKSHEET_TEMPLATES
    : WORKSHEET_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleApplyTemplate = (template: WorksheetTemplate) => {
    store.updateConfig({ ...template.config });
    onClose();
  };

  const handleSelectFont = (fontFamily: string) => {
    store.setFontFamily(fontFamily);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)',
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Kho Mẫu Giấy & Phông Chữ
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem', margin: 0 }}>
              Chọn mẫu luyện tập thiết kế sẵn hoặc phông chữ thư pháp Hán tự đẹp chuẩn.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              transition: 'background-color 0.15s ease',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab switcher: Mẫu tập viết vs Phông chữ */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1.75rem',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'templates' ? '#2563eb' : 'transparent',
              color: activeTab === 'templates' ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease',
            }}
          >
            Mẫu Giấy & Bài Tập ({WORKSHEET_TEMPLATES.length})
          </button>
          <button
            onClick={() => setActiveTab('fonts')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'fonts' ? '#2563eb' : 'transparent',
              color: activeTab === 'fonts' ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease',
            }}
          >
            Font Chữ Tiếng Trung ({FONT_OPTIONS.length})
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
          {activeTab === 'templates' && (
            <>
              {/* Category Filter Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.825rem',
                      fontWeight: selectedCategory === cat ? 600 : 500,
                      border: `1px solid ${selectedCategory === cat ? '#2563eb' : '#cbd5e1'}`,
                      backgroundColor: selectedCategory === cat ? '#dbeafe' : '#ffffff',
                      color: selectedCategory === cat ? '#1d4ed8' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Template Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}>
                {filteredTemplates.map(tmpl => {
                  const isCurrent = store.config.headerTitle === tmpl.config.headerTitle && store.config.gridType === tmpl.config.gridType;
                  return (
                    <div
                      key={tmpl.id}
                      style={{
                        border: `2px solid ${isCurrent ? '#2563eb' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        padding: '1.25rem',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        boxShadow: isCurrent ? '0 4px 14px rgba(37, 99, 235, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {tmpl.badge && (
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          textTransform: 'uppercase',
                        }}>
                          {tmpl.badge}
                        </span>
                      )}

                      <div>
                        {/* Preview Graphic Box */}
                        <div style={{
                          height: '90px',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem',
                          padding: '0.5rem',
                          background: tmpl.id === 'pen-control'
                            ? 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)'
                            : tmpl.id === 'huigongge-special'
                            ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
                            : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                          }}>
                            {['永', '福', '德', '汉'].slice(0, 3).map((ch, i) => (
                              <div
                                key={i}
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  border: `1px solid ${tmpl.config.gridLineColor || '#4CAF50'}`,
                                  backgroundColor: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontFamily: tmpl.config.fontFamily || "'LXGW WenKai', serif",
                                  fontSize: '22px',
                                  color: '#1e293b',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                  position: 'relative',
                                }}
                              >
                                {ch}
                              </div>
                            ))}
                          </div>
                        </div>

                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {tmpl.category}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0', lineHeight: 1.3 }}>
                          {tmpl.name}
                        </h3>
                        <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                          {tmpl.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleApplyTemplate(tmpl)}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: isCurrent ? '#10b981' : '#2563eb',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {isCurrent ? 'Đang sử dụng' : 'Áp dụng mẫu này'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'fonts' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {FONT_OPTIONS.map(font => {
                const isSelected = store.config.fontFamily === font.fontFamily;
                return (
                  <div
                    key={font.id}
                    onClick={() => handleSelectFont(font.fontFamily)}
                    style={{
                      border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                      borderRadius: '12px',
                      padding: '1.25rem',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    {font.badge && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}>
                        {font.badge}
                      </span>
                    )}

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, paddingRight: font.badge ? '75px' : 0 }}>
                      {font.name}
                    </h4>

                    {/* Font Live Sample Preview Box */}
                    <div style={{
                      marginTop: '0.75rem',
                      height: '70px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem',
                      fontFamily: font.fontFamily,
                      fontSize: '32px',
                      color: '#1e293b',
                      letterSpacing: '0.1em',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                    }}>
                      永 汉 字 练
                    </div>

                    <div style={{
                      marginTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.825rem',
                      color: isSelected ? '#2563eb' : '#64748b',
                      fontWeight: 600,
                    }}>
                      <span>{isSelected ? 'Phông chữ đang chọn' : 'Bấm để chọn phông này'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
