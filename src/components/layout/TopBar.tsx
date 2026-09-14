/**
 * TopBar Component
 * 
 * Application header with title, hamburger menu, quick document controls, and action buttons.
 * Houses essential switches and selectors on a single horizontal row alongside Print and PDF export.
 */

import React, { useCallback } from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import { useResponsive } from '../../hooks/useResponsive';
import { PAPER_SIZES, FONT_OPTIONS } from '../../types';

interface TopBarProps {
  onExportPdf: () => void;
  onPrint: () => void;
  onOpenTemplates: () => void;
}

const topbarSelectStyle: React.CSSProperties = {
  height: '30px',
  padding: '0 6px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: 'var(--color-bg-elevated)',
  color: 'var(--color-text)',
  cursor: 'pointer',
  outline: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
};

interface TopBarToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  disabled?: boolean;
  activeColor?: string;
}

const TopBarToggle: React.FC<TopBarToggleProps> = ({
  label,
  checked,
  onChange,
  title,
  disabled = false,
  activeColor = 'var(--color-primary)',
}) => {
  return (
    <label
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        userSelect: 'none',
        flexShrink: 0,
        padding: '2px 4px',
        borderRadius: 'var(--radius-sm)',
        transition: 'background-color var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span
        style={{
          fontSize: '12px',
          fontWeight: checked ? 600 : 500,
          color: checked ? activeColor : 'var(--color-text)',
          whiteSpace: 'nowrap',
          transition: 'color var(--transition-fast)',
        }}
      >
        {label}
      </span>
      <div
        style={{
          position: 'relative',
          width: '32px',
          height: '18px',
          borderRadius: '9999px',
          backgroundColor: checked ? activeColor : '#cbd5e1',
          transition: 'background-color 0.15s ease',
          flexShrink: 0,
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
          aria-label={label}
        />
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '16px' : '2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: 'white',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transition: 'left 0.15s ease',
          }}
        />
      </div>
    </label>
  );
};

const TopBar: React.FC<TopBarProps> = ({ onExportPdf, onPrint }) => {
  const store = useWorksheetStore();
  const { config, toggleSidebar, sidebarOpen } = store;
  const { isTablet, isMobile } = useResponsive();
  const isCompact = isTablet || isMobile;

  const isVertical = [
    'verticalLine',
    'verticalSquare',
    'verticalTian',
    'verticalMi',
    'verticalHui',
    'verticalOHoi',
  ].includes(config.gridType);

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  return (
    <header
      className="topbar no-print"
      style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        backgroundColor: 'var(--color-bg-elevated)',
        borderBottom: '1px solid var(--color-border)',
        zIndex: 'var(--z-sticky)',
        flexShrink: 0,
        gap: 'var(--space-3)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left: Hamburger + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
        <button
          onClick={handleToggleSidebar}
          aria-label={sidebarOpen ? 'Ẩn thanh bên' : 'Hiện thanh bên'}
          aria-expanded={sidebarOpen}
          style={{
            width: '36px',
            height: '36px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text)',
            transition: 'background-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        <h1
          style={{
            fontSize: isCompact ? 'var(--text-sm)' : 'var(--text-base)',
            fontWeight: 700,
            color: 'var(--color-text)',
            whiteSpace: 'nowrap',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Hanzi Practice
        </h1>
      </div>

      {/* Center & Right: Controls Toolbar + Print/PDF on the same horizontal row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flex: 1,
          justifyContent: 'flex-end',
          minWidth: 0,
          padding: '2px 0',
        }}
      >
        {/* Khổ giấy dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} title="Khổ giấy in">
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            Khổ:
          </span>
          <select
            value={config.paperSize.name}
            onChange={(e) => {
              const paper = PAPER_SIZES.find((p) => p.name === e.target.value);
              if (paper) store.setPaperSize(paper);
            }}
            style={topbarSelectStyle}
            aria-label="Chọn khổ giấy"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.name} value={p.name}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Phông chữ Tiếng Trung dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} title="Phông chữ Tiếng Trung">
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            Font:
          </span>
          <select
            value={config.fontFamily}
            onChange={(e) => store.setFontFamily(e.target.value)}
            style={{ ...topbarSelectStyle, maxWidth: '165px' }}
            aria-label="Chọn phông chữ Tiếng Trung"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.fontFamily}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '20px',
            backgroundColor: 'var(--color-border)',
            flexShrink: 0,
            margin: '0 2px',
          }}
        />

        {/* Toggle 1: Hiện Pinyin */}
        <TopBarToggle
          label="Hiện Pinyin"
          checked={!isVertical && config.showPinyin}
          disabled={isVertical}
          title={isVertical ? 'Viết dọc không hỗ trợ Pinyin' : 'Hiện Pinyin phía trên ô/dòng chữ'}
          onChange={(val) => {
            if (!isVertical) store.setShowPinyin(val);
          }}
        />

        {/* Toggle 2: Hiện chữ tô */}
        <TopBarToggle
          label="Hiện chữ tô"
          checked={config.showTrace !== false}
          title="Hiện chữ tô mờ"
          onChange={(val) => store.setShowTrace(val)}
        />

        {/* Toggle 2.5: Tô kín hàng */}
        <TopBarToggle
          label="Tô kín hàng"
          checked={!!config.fillRowWithTrace}
          title="Tự động điền mẫu chữ tô vào các ô còn lại để kín 1 hàng"
          onChange={(val) => store.setFillRowWithTrace(val)}
        />

        {/* Toggle 3: Điền kín ô */}
        <TopBarToggle
          label="Điền kín ô"
          checked={config.fillRemainingPage !== false}
          title="Điền kín ô hết trang"
          onChange={(val) => store.setFillRemainingPage(val)}
        />

        {/* Khi tắt Điền kín ô: Thêm hàng trống */}
        {config.fillRemainingPage === false && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--color-text)',
            }}
            title="Thêm số hàng ô trống vào cuối bài viết"
          >
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>+ Hàng:</span>
            <button
              onClick={() => store.setExtraEmptyRows(Math.max(0, (config.extraEmptyRows ?? 2) - 1))}
              disabled={(config.extraEmptyRows ?? 2) <= 0}
              style={{
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-border)',
                borderRadius: '3px',
                background: 'var(--color-bg)',
                cursor: (config.extraEmptyRows ?? 2) <= 0 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-text)',
              }}
            >
              −
            </button>
            <span style={{ minWidth: '14px', textAlign: 'center', fontWeight: 700, color: 'var(--color-primary)' }}>
              {config.extraEmptyRows ?? 2}
            </span>
            <button
              onClick={() => store.setExtraEmptyRows(Math.min(20, (config.extraEmptyRows ?? 2) + 1))}
              disabled={(config.extraEmptyRows ?? 2) >= 20}
              style={{
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-border)',
                borderRadius: '3px',
                background: 'var(--color-bg)',
                cursor: (config.extraEmptyRows ?? 2) >= 20 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-text)',
              }}
            >
              +
            </button>
          </div>
        )}

        {/* Toggle 4: Chỉ in giấy trống (Giấy trống) */}
        <TopBarToggle
          label="Giấy trống"
          checked={config.blankPaper}
          title="Chỉ in giấy ô trống"
          activeColor="#8b5cf6"
          onChange={(val) => store.setBlankPaper(val)}
        />

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '20px',
            backgroundColor: 'var(--color-border)',
            flexShrink: 0,
            margin: '0 2px',
          }}
        />

        {/* Action button: In trang */}
        <button
          onClick={onPrint}
          aria-label="In"
          title="In (Ctrl+P)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '32px',
            padding: '0 12px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text)',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            transition: 'all var(--transition-fast)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
          }}
        >
          {isCompact ? 'In' : 'In trang'}
        </button>

        {/* Action button: Xuất PDF */}
        <button
          onClick={onExportPdf}
          aria-label="Xuất PDF"
          title="Xuất PDF (Ctrl+E)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '32px',
            padding: '0 14px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          {isCompact ? 'PDF' : 'Xuất PDF'}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
