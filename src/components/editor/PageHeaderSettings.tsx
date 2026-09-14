/**
 * PageHeaderSettings Component
 * 
 * Configures worksheet header: title, font family, font size, font color,
 * bold/italic/underline, multi-page rules, and name/class/date fields.
 * Positioned directly after the Hanzi character input box.
 */

import React from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';

const HEADER_FONTS = [
  { id: 'be-vietnam-pro', name: 'Be Vietnam Pro', value: "'Be Vietnam Pro', sans-serif" },
  { id: 'inter', name: 'Inter', value: "'Inter', sans-serif" },
  { id: 'roboto', name: 'Roboto', value: "'Roboto', sans-serif" },
  { id: 'arial', name: 'Arial', value: 'Arial, sans-serif' },
  { id: 'times', name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { id: 'montserrat', name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { id: 'open-sans', name: 'Open Sans', value: "'Open Sans', sans-serif" },
  { id: 'playfair', name: 'Playfair Display', value: "'Playfair Display', serif" },
  { id: 'dancing', name: 'Dancing Script', value: "'Dancing Script', cursive" },
  { id: 'wenkai', name: 'LXGW WenKai', value: "'LXGW WenKai', serif" },
  { id: 'kaiti', name: 'KaiTi', value: "'KaiTi', '楷体', 'STKaiti', serif" },
  { id: 'mashanzheng', name: 'Ma Shan Zheng', value: "'Ma Shan Zheng', cursive" },
  { id: 'zhimangxing', name: 'Zhi Mang Xing', value: "'Zhi Mang Xing', cursive" },
];

const PRESET_COLORS = [
  { value: '#1e293b', label: 'Đen' },
  { value: '#dc2626', label: 'Đỏ' },
  { value: '#16a34a', label: 'Xanh lá' },
  { value: '#2563eb', label: 'Xanh dương' },
  { value: '#7c3aed', label: 'Tím' },
  { value: '#ea580c', label: 'Cam' },
  { value: '#64748b', label: 'Xám' },
  { value: '#78350f', label: 'Nâu' },
];

const PageHeaderSettings: React.FC = () => {
  const store = useWorksheetStore();
  const { config } = store;

  const isBold = config.headerFontBold !== false;
  const isItalic = !!config.headerFontItalic;
  const isUnderline = !!config.headerFontUnderline;
  const currentFontSize = config.headerFontSize ?? 4.5;
  const currentColor = config.headerFontColor || '#1e293b';
  const currentFontFamily = config.headerFontFamily || "'Be Vietnam Pro', sans-serif";

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        marginTop: 'var(--space-2)',
        padding: 'var(--space-3)',
        backgroundColor: '#f8fafc',
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Top Header Toggle Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>
            Tiêu đề trang
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Hiển thị tiêu đề và thông tin đầu trang
          </div>
        </div>

        {/* Toggle Switch */}
        <label
          style={{
            position: 'relative',
            width: '48px',
            height: '26px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <input
            type="checkbox"
            checked={config.showHeader}
            onChange={(e) => store.setShowHeader(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
            aria-label="Hiển thị tiêu đề trang"
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '9999px',
              backgroundColor: config.showHeader ? 'var(--color-primary)' : '#cbd5e1',
              transition: 'background-color var(--transition-fast)',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-sm)',
                position: 'absolute',
                top: '3px',
                left: config.showHeader ? '25px' : '3px',
                transition: 'left var(--transition-fast)',
              }}
            />
          </div>
        </label>
      </div>

      {/* Expanded Settings Content */}
      {config.showHeader && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            paddingTop: 'var(--space-3)',
            marginTop: 'var(--space-1)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {/* Input: Nội dung tiêu đề */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
              Nội dung tiêu đề
            </label>
            <input
              type="text"
              value={config.headerTitle}
              onChange={(e) => store.setHeaderTitle(e.target.value)}
              placeholder="VD: Tiêu đề 1; Tiêu đề 2; Tiêu đề 3;..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '7px 10px',
                fontSize: '13px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-text)',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', lineHeight: 1.35 }}>
              Ngăn cách tiêu đề các trang bằng dấu chấm phẩy <code>;</code> — Ví dụ: <em>tiêu đề 1; tiêu đề 2; tiêu đề 3;...</em>
            </div>
          </div>

          {/* Formatting Toolbar: Font, Size, Color, B/I/U */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '10px 12px',
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
              Định dạng chữ tiêu đề
            </div>

            {/* Row 1: Font Selector (Full Width, Clean Names) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Phông chữ
              </span>
              <select
                value={currentFontFamily}
                onChange={(e) => store.setHeaderFontFamily(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: '32px',
                  padding: '0 8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                aria-label="Chọn phông chữ tiêu đề"
              >
                {HEADER_FONTS.map((f) => (
                  <option key={f.id} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: Cỡ chữ (Stepper) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Cỡ chữ
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => store.setHeaderFontSize(Math.max(2.5, Math.round((currentFontSize - 0.5) * 10) / 10))}
                  style={{
                    width: '32px',
                    height: '28px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: 'var(--color-text)',
                  }}
                  title="Giảm cỡ chữ"
                >
                  −
                </button>
                <div
                  style={{
                    minWidth: '55px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                  }}
                >
                  {currentFontSize} mm
                </div>
                <button
                  onClick={() => store.setHeaderFontSize(Math.min(10.0, Math.round((currentFontSize + 0.5) * 10) / 10))}
                  style={{
                    width: '32px',
                    height: '28px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: 'var(--color-text)',
                  }}
                  title="Tăng cỡ chữ"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row 3: Kiểu chữ B, I, U (Xuống hàng riêng) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Kiểu chữ
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => store.setHeaderFontBold(!isBold)}
                  style={{
                    width: '36px',
                    height: '30px',
                    border: `1.5px solid ${isBold ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isBold ? 'var(--color-primary-light)' : 'var(--color-bg)',
                    color: isBold ? 'var(--color-primary-dark)' : 'var(--color-text)',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '13px',
                    transition: 'all 0.1s ease',
                  }}
                  title="In đậm"
                >
                  B
                </button>

                <button
                  onClick={() => store.setHeaderFontItalic(!isItalic)}
                  style={{
                    width: '36px',
                    height: '30px',
                    border: `1.5px solid ${isItalic ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isItalic ? 'var(--color-primary-light)' : 'var(--color-bg)',
                    color: isItalic ? 'var(--color-primary-dark)' : 'var(--color-text)',
                    cursor: 'pointer',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: '13px',
                    transition: 'all 0.1s ease',
                  }}
                  title="In nghiêng"
                >
                  I
                </button>

                <button
                  onClick={() => store.setHeaderFontUnderline(!isUnderline)}
                  style={{
                    width: '36px',
                    height: '30px',
                    border: `1.5px solid ${isUnderline ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isUnderline ? 'var(--color-primary-light)' : 'var(--color-bg)',
                    color: isUnderline ? 'var(--color-primary-dark)' : 'var(--color-text)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 700,
                    fontSize: '13px',
                    transition: 'all 0.1s ease',
                  }}
                  title="Gạch chân"
                >
                  U
                </button>
              </div>
            </div>

            {/* Row 4: Màu sắc (8 Preset Swatches + Color Picker) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Màu sắc
                </span>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <span style={{ fontSize: '10.5px' }}>Tùy chọn:</span>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => store.setHeaderFontColor(e.target.value)}
                    style={{
                      width: '20px',
                      height: '20px',
                      padding: 0,
                      border: '1px solid var(--color-border)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                    }}
                    title="Bảng màu tùy chọn"
                  />
                </label>
              </div>

              {/* 8 Preset Swatches */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                {PRESET_COLORS.map((c) => {
                  const isSelected = currentColor.toLowerCase() === c.value.toLowerCase();
                  return (
                    <div
                      key={c.value}
                      onClick={() => store.setHeaderFontColor(c.value)}
                      style={{
                        height: '22px',
                        borderRadius: '4px',
                        backgroundColor: c.value,
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.15)',
                        boxShadow: isSelected ? '0 0 0 1.5px var(--color-primary), 0 2px 4px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.1)' : 'none',
                        transition: 'all 0.12s ease',
                      }}
                      title={c.label}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quy tắc nhiều trang */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
              Quy tắc tiêu đề khi có nhiều trang
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                {
                  mode: 'repeat',
                  label: 'Trùng lặp các trang sau',
                  desc: 'Lặp lại tiêu đề trên mọi trang tiếp theo',
                },
                {
                  mode: 'empty',
                  label: 'Bỏ trống các trang sau',
                  desc: 'Chỉ hiện tiêu đề ở trang đầu tiên, các trang sau bỏ trống',
                },
                {
                  mode: 'custom',
                  label: 'Tiêu đề riêng từng trang',
                  desc: 'Trang 1, 2, 3... lấy theo từng tiêu đề cách nhau bởi dấu ;',
                },
              ].map((item) => {
                const currentMode = config.headerTitleMode || ((config.headerTitle || '').includes(';') ? 'custom' : 'repeat');
                const isSelected = currentMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    onClick={() => store.setHeaderTitleMode(item.mode as any)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '5px 8px',
                      border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                      color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span style={{ fontSize: '11.5px', fontWeight: isSelected ? 700 : 500 }}>
                      {isSelected ? '● ' : '○ '}{item.label}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Các trường thông tin người viết: Tên, Lớp, Ngày */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              paddingTop: '6px',
              borderTop: '1px dashed var(--color-border)',
            }}
          >
            {[
              { key: 'name', label: 'Tên', checked: config.headerShowName, setter: store.setHeaderShowName },
              { key: 'class', label: 'Lớp', checked: config.headerShowClass, setter: store.setHeaderShowClass },
              { key: 'date', label: 'Ngày', checked: config.headerShowDate, setter: store.setHeaderShowDate },
            ].map((field) => (
              <label
                key={field.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={field.checked}
                  onChange={(e) => field.setter(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                {field.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageHeaderSettings;
