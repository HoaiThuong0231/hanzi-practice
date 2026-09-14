/**
 * QuickSettings Component
 * 
 * Compact settings panel that shows the most commonly used options.
 * Always visible (sidebar on desktop, bottom sheet content on tablet).
 */

import React from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import { ALL_214_RADICALS, ALL_BASIC_STROKES } from '../../data/cjk-radicals';
import {
  FILL_STYLES,
  type FillStyle,
} from '../../types';


interface QuickSettingsProps {
  onOpenTemplates?: () => void;
}

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  color: 'var(--color-text)',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-2) var(--space-3)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  backgroundColor: 'var(--color-bg-elevated)',
  color: 'var(--color-text)',
  cursor: 'pointer',
  minHeight: 'var(--touch-min)',
  outline: 'none',
  appearance: 'auto',
};

const stepperContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
};

const stepperBtnStyle: React.CSSProperties = {
  width: 'var(--touch-min)',
  height: 'var(--touch-min)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--color-bg-elevated)',
  fontSize: 'var(--text-lg)',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all var(--transition-fast)',
  color: 'var(--color-text)',
  flexShrink: 0,
};

const stepperValueStyle: React.CSSProperties = {
  flex: 1,
  textAlign: 'center',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: 'var(--color-text)',
  padding: 'var(--space-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--color-bg-elevated)',
  minHeight: 'var(--touch-min)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
  padding: 'var(--space-2) 0',
};

const QuickSettings: React.FC<QuickSettingsProps> = ({ onOpenTemplates }) => {
  const store = useWorksheetStore();
  const { config } = store;


  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      padding: 'var(--space-2) 0',
    }}>
      {/* Practice Mode Selector - Visual Button Grid */}
      {(() => {
        const isVerticalMode = config.gridType === 'verticalLine' || config.gridType === 'verticalSquare' ||
          config.gridType === 'verticalTian' || config.gridType === 'verticalMi' || config.gridType === 'verticalHui' || config.gridType === 'verticalOHoi';
        const isLineMode = config.gridType === 'line';
        // Stroke modes work with square/tian/mi/hui/oHoi (NOT vertical, NOT line)
        const isStrokeCompatible = ['square', 'tian', 'mi', 'hui', 'oHoi'].includes(config.gridType);

        const modes: Array<{
          mode: string;
          name: string;
          desc: string;
          disabled?: boolean;
          disabledReason?: string;
          color: string;
          bg: string;
          border: string;
        }> = [
          {
            mode: 'single',
            name: 'Một chữ',
            desc: 'Luyện từng chữ',
            color: '#0f172a',
            bg: '#f8fafc',
            border: '#cbd5e1',
          },
          {
            mode: 'vocabulary',
            name: 'Từ vựng',
            desc: 'Luyện từng từ',
            color: '#0f172a',
            bg: '#f8fafc',
            border: '#cbd5e1',
          },
          {
            mode: 'sentence',
            name: 'Luyện câu',
            desc: 'Câu hoàn chỉnh',
            color: '#0f172a',
            bg: '#f8fafc',
            border: '#cbd5e1',
          },
          {
            mode: 'paragraph',
            name: 'Đoạn văn',
            desc: 'Văn bản dài',
            color: '#0f172a',
            bg: '#f8fafc',
            border: '#cbd5e1',
          },

          {
            mode: 'pinyinDictation',
            name: 'Nhìn Pinyin',
            desc: 'Viết từ Pinyin',
            color: '#0f172a',
            bg: '#f8fafc',
            border: '#cbd5e1',
            disabled: isVerticalMode || isLineMode,
            disabledReason: 'Chỉ dùng cho ô điền/mễ/hồi/vuông',
          },
          {
            mode: 'stroke',
            name: 'Thứ tự nét',
            desc: 'Từng bước nét',
            color: '#0f172a',
            bg: '#f8fafc',
            border: '#cbd5e1',
            disabled: !isStrokeCompatible,
            disabledReason: 'Chỉ dùng cho ô vuông, ô điền, ô mễ, ô hồi cung',
          },
          {
            mode: 'basicStroke',
            name: 'Nét cơ bản',
            desc: '42 nét chuẩn',
            color: '#0f172a',
            bg: '#f8fafc',
            border: '#cbd5e1',
            disabled: !isStrokeCompatible,
            disabledReason: 'Chỉ dùng cho ô vuông, ô điền, ô mễ, ô hồi cung',
          },
          {
            mode: 'radical',
            name: '214 Bộ Thủ',
            desc: 'Chi tiết bộ thủ',
            color: '#0f172a',
            bg: '#f8fafc',
            border: '#cbd5e1',
            disabled: !isStrokeCompatible,
            disabledReason: 'Chỉ dùng cho ô vuông, ô điền, ô mễ, ô hồi cung',
          },
        ];

        return (
          <div style={sectionStyle}>
            <label style={labelStyle}>Chế độ luyện tập</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px',
            }}>
              {modes.map((m) => {
                const isActive = config.practiceMode === m.mode;
                const isDisabled = !!m.disabled && !isActive;

                // Color scheme per active mode
                let activeColor = '#2563eb';
                let activeBg = '#eff6ff';
                let activeBorder = '#2563eb';
                if (m.mode === 'stroke' || m.mode === 'basicStroke') { activeColor = '#334155'; activeBg = '#f1f5f9'; activeBorder = '#64748b'; }
                if (m.mode === 'radical') { activeColor = '#1e40af'; activeBg = '#dbeafe'; activeBorder = '#3b82f6'; }
                if (m.mode === 'pinyinDictation') { activeColor = '#4338ca'; activeBg = '#eef2ff'; activeBorder = '#6366f1'; }
                if (m.mode === 'paragraph') { activeColor = '#047857'; activeBg = '#ecfdf5'; activeBorder = '#10b981'; }
                if (m.mode === 'pinyin' || m.mode === 'pinyinMeaning') { activeColor = '#7c3aed'; activeBg = '#f5f3ff'; activeBorder = '#8b5cf6'; }

                return (
                  <button
                    key={m.mode}
                    id={`btn-mode-${m.mode}`}
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      if (isActive) {
                        store.setPracticeMode('single');
                      } else {
                        if (m.mode === 'radical') {
                          const hasRadicals = config.characters && config.characters.split(/\s+/).some(c => ALL_214_RADICALS.includes(c));
                          store.updateConfig({
                            practiceMode: 'radical',
                            characters: hasRadicals ? config.characters : ALL_214_RADICALS.join(' '),
                            headerTitle: 'BẢNG 214 BỘ THỦ TIẾNG TRUNG',
                          });
                          return;
                        }
                        store.setPracticeMode(m.mode as any);
                      }
                    }}
                    title={isDisabled ? m.disabledReason : m.desc}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px',
                      padding: '8px 4px',
                      border: `1.5px solid ${isActive ? activeBorder : isDisabled ? '#e2e8f0' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      backgroundColor: isActive ? activeBg : isDisabled ? '#f8fafc' : '#ffffff',
                      color: isActive ? activeColor : isDisabled ? '#94a3b8' : '#475569',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.45 : 1,
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                      boxShadow: isActive ? `0 0 0 1px ${activeBorder}22, 0 2px 6px ${activeBorder}22` : 'none',
                      minHeight: '44px',
                    }}
                  >
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: isActive ? 700 : 600,
                      lineHeight: 1.2,
                      color: isActive ? activeColor : isDisabled ? '#94a3b8' : '#374151',
                    }}>{m.name}</span>
                    <span style={{
                      fontSize: '9.5px',
                      color: isActive ? activeColor + 'bb' : isDisabled ? '#b0bec5' : '#64748b',
                      lineHeight: 1.2,
                    }}>{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}




      {/* Columns Per Row Customizer (Căn chỉnh số ô trên 1 hàng) */}
      {(() => {
        const isBoxGrid = ['square', 'tian', 'mi', 'hui', 'oHoi'].includes(config.gridType);
        if (!isBoxGrid) return null;
        const currentCols = config.columnsPerRow ?? ((config.gridType === 'hui' || config.gridType === 'oHoi') ? 11 : config.gridType === 'square' ? 14 : 12);

        return (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>
                Số ô trên 1 hàng
              </label>
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: !isBoxGrid ? 'var(--color-text-muted)' : 'var(--color-primary)',
              }}>
                {isBoxGrid ? `${currentCols} ô / hàng` : '—'}
              </span>
            </div>

            <div style={{
              opacity: !isBoxGrid ? 0.38 : 1,
              filter: !isBoxGrid ? 'grayscale(1)' : 'none',
              pointerEvents: !isBoxGrid ? 'none' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}>
              {/* Stepper + Slider */}
              <div style={stepperContainerStyle}>
                <button
                  style={stepperBtnStyle}
                  onClick={() => store.setColumnsPerRow(Math.max(4, currentCols - 1))}
                  disabled={!isBoxGrid || currentCols <= 4}
                  aria-label="Giảm số ô trên 1 hàng"
                >
                  −
                </button>
                <div style={stepperValueStyle}>
                  {currentCols} ô
                </div>
                <button
                  style={stepperBtnStyle}
                  onClick={() => store.setColumnsPerRow(Math.min(20, currentCols + 1))}
                  disabled={!isBoxGrid || currentCols >= 20}
                  aria-label="Tăng số ô trên 1 hàng"
                >
                  +
                </button>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={4}
                max={18}
                step={1}
                value={currentCols}
                onChange={(e) => store.setColumnsPerRow(parseInt(e.target.value))}
                disabled={!isBoxGrid}
                style={{
                  width: '100%',
                  height: '6px',
                  cursor: !isBoxGrid ? 'not-allowed' : 'pointer',
                  accentColor: 'var(--color-primary)',
                }}
                aria-label="Thanh kéo số ô trên 1 hàng"
              />

              {/* Quick Preset Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {[5, 6, 7, 8, 10, 12, 14].map((n) => {
                  const isCurrent = currentCols === n && isBoxGrid;
                  return (
                    <button
                      key={n}
                      onClick={() => store.setColumnsPerRow(n)}
                      disabled={!isBoxGrid}
                      style={{
                        padding: '4px 2px',
                        fontSize: '11px',
                        fontWeight: isCurrent ? 700 : 500,
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${isCurrent ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        backgroundColor: isCurrent ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                        color: isCurrent ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                        cursor: !isBoxGrid ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                      }}
                      title={`Đặt ${n} ô trên 1 hàng`}
                    >
                      {n} ô
                    </button>
                  );
                })}
              </div>

              {/* Giãn hàng (Khoảng cách giữa các hàng) */}
              <div style={{
                marginTop: 'var(--space-2)',
                paddingTop: 'var(--space-2)',
                borderTop: '1px dashed var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                    Giãn dòng
                  </label>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {config.rowGapMm ?? 2.5} mm
                  </span>
                </div>

                <div style={stepperContainerStyle}>
                  <button
                    style={{ ...stepperBtnStyle, height: '32px', minHeight: '32px' }}
                    onClick={() => store.setRowGapMm(Math.max(0, Math.round(((config.rowGapMm ?? 2.5) - 0.5) * 10) / 10))}
                    disabled={(config.rowGapMm ?? 2.5) <= 0}
                    aria-label="Giảm khoảng cách dòng"
                  >
                    −
                  </button>
                  <div style={{ ...stepperValueStyle, minHeight: '32px', fontSize: '12px' }}>
                    {(config.rowGapMm ?? 2.5) === 0 ? '0 mm' : `${config.rowGapMm ?? 2.5} mm`}
                  </div>
                  <button
                    style={{ ...stepperBtnStyle, height: '32px', minHeight: '32px' }}
                    onClick={() => store.setRowGapMm(Math.min(15, Math.round(((config.rowGapMm ?? 2.5) + 0.5) * 10) / 10))}
                    disabled={(config.rowGapMm ?? 2.5) >= 15}
                    aria-label="Tăng khoảng cách dòng"
                  >
                    +
                  </button>
                </div>


              </div>
            </div>
          </div>
        );
      })()}

      {/* Line Grid: Kích thước chữ & khoảng cách hàng */}
      {config.gridType === 'line' && (() => {
        const currentH = config.lineRowHeight ?? 13;
        return (
          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: '#fafafa',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>
                Kích thước chữ & khoảng cách hàng
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                Chiều cao mỗi hàng
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>
                {currentH} mm
              </span>
            </div>

            {/* Stepper */}
            <div style={stepperContainerStyle}>
              <button
                style={stepperBtnStyle}
                onClick={() => store.setLineRowHeight(Math.max(8, currentH - 1))}
                disabled={currentH <= 8}
                aria-label="Giảm kích thước chữ"
              >
                −
              </button>
              <div style={stepperValueStyle}>
                {currentH} mm
              </div>
              <button
                style={stepperBtnStyle}
                onClick={() => store.setLineRowHeight(Math.min(30, currentH + 1))}
                disabled={currentH >= 30}
                aria-label="Tăng kích thước chữ"
              >
                +
              </button>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={8}
              max={30}
              step={0.5}
              value={currentH}
              onChange={(e) => store.setLineRowHeight(parseFloat(e.target.value))}
              style={{ width: '100%', height: '6px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
              aria-label="Chiều cao hàng kẻ ngang"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
              <span>Nhỏ 8mm</span>
              <span>Vừa 13mm</span>
              <span>Lớn 30mm</span>
            </div>

            {/* Quick presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
              {[8, 10, 13, 18, 24].map((h) => {
                const isCurrent = Math.round(currentH) === h;
                return (
                  <button
                    key={h}
                    onClick={() => store.setLineRowHeight(h)}
                    style={{
                      padding: '4px 2px',
                      fontSize: '11px',
                      fontWeight: isCurrent ? 700 : 500,
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${isCurrent ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: isCurrent ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                      color: isCurrent ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                    title={`${h}mm / hàng`}
                  >
                    {h}mm
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Tăng → chữ to + dòng rộng. Giảm → chữ nhỏ + dòng hẹp.
              {config.showPinyin && ' Pinyin tự co giãn theo.'}
            </div>
          </div>
        );
      })()}

      {/* Vertical Box Grids: Số ô trên 1 cột (Chiều dọc) */}
      {['verticalSquare', 'verticalTian', 'verticalMi', 'verticalHui', 'verticalOHoi'].includes(config.gridType) && (() => {
        const currentRows = config.verticalRowsPerCol ?? 12;
        return (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>
                Số ô trên 1 cột
              </label>
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}>
                {currentRows} ô / cột
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={stepperContainerStyle}>
                <button
                  style={stepperBtnStyle}
                  onClick={() => store.setVerticalRowsPerCol(Math.max(6, currentRows - 1))}
                  disabled={currentRows <= 6}
                  aria-label="Giảm số ô trên 1 cột"
                >
                  −
                </button>
                <div style={stepperValueStyle}>
                  {currentRows} ô / cột
                </div>
                <button
                  style={stepperBtnStyle}
                  onClick={() => store.setVerticalRowsPerCol(Math.min(25, currentRows + 1))}
                  disabled={currentRows >= 25}
                  aria-label="Tăng số ô trên 1 cột"
                >
                  +
                </button>
              </div>

              <input
                type="range"
                min={6}
                max={22}
                step={1}
                value={currentRows}
                onChange={(e) => store.setVerticalRowsPerCol(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  cursor: 'pointer',
                  accentColor: 'var(--color-primary)',
                }}
                aria-label="Thanh kéo số ô trên 1 cột"
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                {[8, 10, 12, 14, 16, 18].map((n) => {
                  const isCurrent = currentRows === n;
                  return (
                    <button
                      key={n}
                      onClick={() => store.setVerticalRowsPerCol(n)}
                      style={{
                        padding: '4px 2px',
                        fontSize: '11px',
                        fontWeight: isCurrent ? 700 : 500,
                        border: `1px solid ${isCurrent ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isCurrent ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                        color: isCurrent ? 'white' : 'var(--color-text)',
                        cursor: 'pointer',
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              {/* Giãn cột (Khoảng cách giữa các cột dọc) */}
              {(() => {
                const currentColGap = config.columnGapMm ?? 3.0;
                return (
                  <div style={{
                    marginTop: 'var(--space-2)',
                    paddingTop: 'var(--space-2)',
                    borderTop: '1px dashed var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                        Giãn cột
                      </label>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {currentColGap} mm
                      </span>
                    </div>

                    <div style={stepperContainerStyle}>
                      <button
                        style={{ ...stepperBtnStyle, height: '32px', minHeight: '32px' }}
                        onClick={() => store.setColumnGapMm(Math.max(0, Math.round((currentColGap - 0.5) * 10) / 10))}
                        disabled={currentColGap <= 0}
                        aria-label="Giảm khoảng cách cột"
                      >
                        −
                      </button>
                      <div style={{ ...stepperValueStyle, minHeight: '32px', fontSize: '12px' }}>
                        {currentColGap === 0 ? '0 mm' : `${currentColGap} mm`}
                      </div>
                      <button
                        style={{ ...stepperBtnStyle, height: '32px', minHeight: '32px' }}
                        onClick={() => store.setColumnGapMm(Math.min(15, Math.round((currentColGap + 0.5) * 10) / 10))}
                        disabled={currentColGap >= 15}
                        aria-label="Tăng khoảng cách cột"
                      >
                        +
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                      {[0, 1.5, 3.0, 4.5, 6, 8].map((g) => {
                        const isCur = currentColGap === g;
                        return (
                          <button
                            key={g}
                            onClick={() => store.setColumnGapMm(g)}
                            style={{
                              padding: '3px 1px',
                              fontSize: '10px',
                              fontWeight: isCur ? 700 : 500,
                              borderRadius: 'var(--radius-sm)',
                              border: `1px solid ${isCur ? 'var(--color-primary)' : 'var(--color-border)'}`,
                              backgroundColor: isCur ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                              color: isCur ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                              cursor: 'pointer',
                              textAlign: 'center',
                            }}
                          >
                            {g === 0 ? '0mm' : `${g}mm`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Ô tự động dàn theo chiều dọc và chia đều {store.layout.columns} cột sang ngang. Viết từ trên xuống dưới, từ trái qua phải.
              </div>
            </div>
          </div>
        );
      })()}

      {/* Vertical Line Grid: Độ rộng cột & cỡ chữ (Kẻ dọc) */}
      {config.gridType === 'verticalLine' && (() => {
        const currentWidth = config.verticalColWidth ?? 16;
        return (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>
                Độ rộng cột
              </label>
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}>
                {currentWidth} mm
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={stepperContainerStyle}>
                <button
                  style={stepperBtnStyle}
                  onClick={() => store.setVerticalColWidth(Math.max(8, currentWidth - 1))}
                  disabled={currentWidth <= 8}
                  aria-label="Giảm độ rộng cột kẻ dọc"
                >
                  −
                </button>
                <div style={stepperValueStyle}>
                  {currentWidth} mm
                </div>
                <button
                  style={stepperBtnStyle}
                  onClick={() => store.setVerticalColWidth(Math.min(35, currentWidth + 1))}
                  disabled={currentWidth >= 35}
                  aria-label="Tăng độ rộng cột kẻ dọc"
                >
                  +
                </button>
              </div>

              <input
                type="range"
                min={10}
                max={30}
                step={1}
                value={currentWidth}
                onChange={(e) => store.setVerticalColWidth(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  cursor: 'pointer',
                  accentColor: 'var(--color-primary)',
                }}
                aria-label="Thanh kéo độ rộng cột kẻ dọc"
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                {[12, 14, 16, 18, 20, 24].map((w) => {
                  const isCurrent = currentWidth === w;
                  return (
                    <button
                      key={w}
                      onClick={() => store.setVerticalColWidth(w)}
                      style={{
                        padding: '4px 2px',
                        fontSize: '11px',
                        fontWeight: isCurrent ? 700 : 500,
                        border: `1px solid ${isCurrent ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isCurrent ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                        color: isCurrent ? 'white' : 'var(--color-text)',
                        cursor: 'pointer',
                      }}
                    >
                      {w}mm
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Chữ Hán và các đường kẻ dọc tự động co giãn theo kích thước bạn chọn. Viết từ trên xuống dưới, từ trái qua phải.
              </div>
            </div>
          </div>
        );
      })()}



      {/* Fill Style */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Kiểu tô chữ</label>
        <select
          value={config.fillStyle}
          onChange={(e) => {
            const newStyle = e.target.value as FillStyle;
            const styleInfo = FILL_STYLES.find((s) => s.style === newStyle);
            store.updateConfig({
              fillStyle: newStyle,
              fontOpacity: styleInfo ? styleInfo.opacity : config.fontOpacity,
            });
          }}
          style={selectStyle}
          aria-label="Chọn kiểu tô"
        >
          {FILL_STYLES.map((f) => (
            <option key={f.style} value={f.style}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font Opacity Slider directly under Fill Style */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={labelStyle}>Độ mờ chữ tô</label>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary)' }}>
            {Math.round(config.fontOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={100}
          step={1}
          value={Math.round(config.fontOpacity * 100)}
          onChange={(e) => store.setFontOpacity(parseInt(e.target.value) / 100)}
          style={{
            width: '100%',
            height: '6px',
            cursor: 'pointer',
            accentColor: 'var(--color-primary)',
          }}
          aria-label="Điều chỉnh độ mờ chữ tô"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
          <span>Nhạt 5%</span>
          <span>Tiêu chuẩn 40%</span>
          <span>Đậm 100%</span>
        </div>
      </div>

      {/* Character Counts */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Số ô</label>

        {/* Sample count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', minWidth: '60px' }}>
            Mẫu:
          </span>
          <div style={{ ...stepperContainerStyle, flex: 1 }}>
            <button style={stepperBtnStyle} onClick={() => store.setSampleCount(config.sampleCount - 1)}>−</button>
            <div style={stepperValueStyle}>{config.sampleCount}</div>
            <button style={stepperBtnStyle} onClick={() => store.setSampleCount(config.sampleCount + 1)}>+</button>
          </div>
        </div>

        {/* Trace count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', minWidth: '60px' }}>
            Tô:
          </span>
          <div style={{ ...stepperContainerStyle, flex: 1 }}>
            <button style={stepperBtnStyle} onClick={() => store.setTraceCount(config.traceCount - 1)}>−</button>
            <div style={stepperValueStyle}>{config.traceCount}</div>
            <button style={stepperBtnStyle} onClick={() => store.setTraceCount(config.traceCount + 1)}>+</button>
          </div>
        </div>

        {/* Empty row count ("Thêm hàng") */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', minWidth: '75px' }}>
            Thêm hàng:
          </span>
          <div style={{ ...stepperContainerStyle, flex: 1 }}>
            <button
              style={stepperBtnStyle}
              onClick={() => {
                const newRows = Math.max(0, (config.emptyRows ?? 1) - 1);
                store.updateConfig({ emptyRows: newRows, emptyCount: newRows * 12 });
              }}
              aria-label="Giảm số hàng trống"
            >
              −
            </button>
            <div style={stepperValueStyle}>{config.emptyRows ?? 1} hàng</div>
            <button
              style={stepperBtnStyle}
              onClick={() => {
                const newRows = Math.min(10, (config.emptyRows ?? 1) + 1);
                store.updateConfig({ emptyRows: newRows, emptyCount: newRows * 12 });
              }}
              aria-label="Tăng số hàng trống"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Tùy chọn Điền mẫu tô kín 1 hàng & Điền kín ô hết trang */}
      <div style={sectionStyle}>
        <div style={toggleRowStyle}>
          <div>
            <div style={labelStyle}>Điền mẫu tô kín 1 hàng</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {config.fillRowWithTrace
                ? 'Đang BẬT: Tự động điền chữ tô mờ vào các ô còn lại để kín hàng'
                : 'Đang TẮT: Các ô còn lại trên hàng để trống'}
            </div>
          </div>
          <label style={{ position: 'relative', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={!!config.fillRowWithTrace}
              onChange={(e) => store.setFillRowWithTrace(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              aria-label="Điền mẫu tô kín 1 hàng"
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--radius-full)',
              backgroundColor: config.fillRowWithTrace ? 'var(--color-primary)' : 'var(--color-border)',
              transition: 'background-color var(--transition-fast)',
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-sm)',
                position: 'absolute',
                top: '3px',
                left: config.fillRowWithTrace ? '25px' : '3px',
                transition: 'left var(--transition-fast)',
              }} />
            </div>
          </label>
        </div>

        <div style={toggleRowStyle}>
          <div>
            <div style={labelStyle}>Điền kín ô hết trang</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {config.fillRemainingPage !== false
                ? 'Đang BẬT: Tự động lấp đầy các ô trống cho đến hết trang'
                : 'Đang TẮT: Chỉ hiện nội dung bài viết và số hàng trống tùy chọn'}
            </div>
          </div>
          <label style={{ position: 'relative', width: '48px', height: '26px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.fillRemainingPage !== false}
              onChange={(e) => store.setFillRemainingPage(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              aria-label="Điền kín ô hết trang"
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--radius-full)',
              backgroundColor: config.fillRemainingPage !== false ? 'var(--color-primary)' : 'var(--color-border)',
              transition: 'background-color var(--transition-fast)',
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-sm)',
                position: 'absolute',
                top: '3px',
                left: config.fillRemainingPage !== false ? '25px' : '3px',
                transition: 'left var(--transition-fast)',
              }} />
            </div>
          </label>
        </div>

        {/* Khi tắt Điền kín ô: Thêm hàng trống vào cuối đoạn văn / bài viết */}
        {config.fillRemainingPage === false && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-2)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px dashed var(--color-border)',
          }}>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                Thêm hàng trống:
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Thêm vào cuối đoạn văn / bài viết
              </div>
            </div>
            <div style={{ ...stepperContainerStyle, width: '130px' }}>
              <button
                style={stepperBtnStyle}
                onClick={() => store.setExtraEmptyRows(Math.max(0, (config.extraEmptyRows ?? 2) - 1))}
                disabled={(config.extraEmptyRows ?? 2) <= 0}
                aria-label="Giảm hàng trống"
              >
                −
              </button>
              <div style={stepperValueStyle}>
                {config.extraEmptyRows ?? 2} hàng
              </div>
              <button
                style={stepperBtnStyle}
                onClick={() => store.setExtraEmptyRows(Math.min(25, (config.extraEmptyRows ?? 2) + 1))}
                disabled={(config.extraEmptyRows ?? 2) >= 25}
                aria-label="Tăng hàng trống"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Pinyin Dictation Specific Controls */}
      {config.practiceMode === 'pinyinDictation' && (
        <div style={{
          padding: 'var(--space-3)',
          backgroundColor: '#f5f3ff',
          border: '1.5px solid #a78bfa',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#5b21b6' }}>
              Tùy chỉnh: Nhìn Pinyin viết chữ
            </span>
          </div>

          {/* Toggle: Hiện chữ mờ gợi ý */}
          <div style={toggleRowStyle}>
            <div>
              <div style={{ ...labelStyle, color: '#4c1d95' }}>Chữ mờ tập tô</div>
              <div style={{ fontSize: '11px', color: '#6d28d9' }}>
                {config.pinyinShowTraceHint ? 'Đang BẬT: Hiện chữ mờ để tô' : 'Đang TẮT: Chỉ hiện Pinyin, ô trống để nhớ viết'}
              </div>
            </div>
            <label style={{ position: 'relative', width: '48px', height: '26px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!config.pinyinShowTraceHint}
                onChange={(e) => store.setPinyinShowTraceHint(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                aria-label="Hiện chữ mờ gợi ý"
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'var(--radius-full)',
                backgroundColor: config.pinyinShowTraceHint ? '#7c3aed' : 'var(--color-border)',
                transition: 'background-color var(--transition-fast)',
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'absolute',
                  top: '3px',
                  left: config.pinyinShowTraceHint ? '25px' : '3px',
                  transition: 'left var(--transition-fast)',
                }} />
              </div>
            </label>
          </div>

          {/* Stepper: Khoảng cách giữa các từ Pinyin */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ ...labelStyle, color: '#4c1d95' }}>Khoảng cách giữa các từ</label>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#6d28d9' }}>
                {config.pinyinWordGap ?? 1} ô cách
              </span>
            </div>
            <div style={stepperContainerStyle}>
              <button
                style={{ ...stepperBtnStyle, borderColor: '#c4b5fd' }}
                onClick={() => store.setPinyinWordGap(Math.max(0, (config.pinyinWordGap ?? 1) - 1))}
                disabled={(config.pinyinWordGap ?? 1) <= 0}
                aria-label="Giảm khoảng cách từ"
              >
                −
              </button>
              <div style={{ ...stepperValueStyle, borderColor: '#c4b5fd', color: '#4c1d95' }}>
                {(config.pinyinWordGap ?? 1) === 0 ? 'Liền sát nhau' : `Cách ${config.pinyinWordGap ?? 1} ô trống`}
              </div>
              <button
                style={{ ...stepperBtnStyle, borderColor: '#c4b5fd' }}
                onClick={() => store.setPinyinWordGap(Math.min(5, (config.pinyinWordGap ?? 1) + 1))}
                disabled={(config.pinyinWordGap ?? 1) >= 5}
                aria-label="Tăng khoảng cách từ"
              >
                +
              </button>
            </div>
          </div>

          {/* Slider: Khoảng cách Pinyin tới ô */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ ...labelStyle, color: '#4c1d95' }}>Khoảng cách Pinyin tới ô</label>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#6d28d9' }}>
                {config.pinyinDistance ?? 0} mm
              </span>
            </div>
            <input
              type="range"
              min={-2}
              max={8}
              step={0.5}
              value={config.pinyinDistance ?? 0}
              onChange={(e) => store.setPinyinDistance(parseFloat(e.target.value))}
              style={{ width: '100%', height: '6px', cursor: 'pointer', accentColor: '#7c3aed' }}
              aria-label="Khoảng cách Pinyin tới ô"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8b5cf6' }}>
              <span>Sát ô -2mm</span>
              <span>Chuẩn 0mm</span>
              <span>Xa +8mm</span>
            </div>
          </div>
        </div>
      )}


      {/* Pinyin Extended Controls — chỉ hiện khi showPinyin = true và không phải kiểu viết dọc */}
      {config.showPinyin && !['verticalLine', 'verticalSquare', 'verticalTian', 'verticalMi', 'verticalHui', 'verticalOHoi'].includes(config.gridType) && (
        <div style={{
          padding: 'var(--space-3)',
          backgroundColor: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#166534' }}>
              Tùy chỉnh Pinyin
            </span>
          </div>

          {/* Toggle: Hiện chữ tô (showTrace) */}
          <div style={toggleRowStyle}>
            <div>
              <div style={{ ...labelStyle, color: '#14532d' }}>
                {config.showTrace !== false ? 'Hiện chữ tô' : 'Chỉ Pinyin'}
              </div>
              <div style={{ fontSize: '11px', color: '#16a34a' }}>
                {config.showTrace !== false
                  ? 'BẬT: Hiện chữ mờ + Pinyin để tập tô'
                  : 'TẮT: Chỉ hiện Pinyin, ô/dòng trống tự viết'}
              </div>
            </div>
            <label style={{ position: 'relative', width: '48px', height: '26px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.showTrace !== false}
                onChange={(e) => store.setShowTrace(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                aria-label="Hiện chữ tô khi có Pinyin"
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'var(--radius-full)',
                backgroundColor: config.showTrace !== false ? '#16a34a' : 'var(--color-border)',
                transition: 'background-color var(--transition-fast)',
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'absolute',
                  top: '3px',
                  left: config.showTrace !== false ? '25px' : '3px',
                  transition: 'left var(--transition-fast)',
                }} />
              </div>
            </label>
          </div>

          {/* Slider khoảng cách ngang Pinyin — chỉ cho kẻ ngang */}
          {config.gridType === 'line' && (
            <div style={sectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ ...labelStyle, color: '#14532d' }}>Khoảng cách chữ Pinyin</label>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#16a34a' }}>
                  {(config.pinyinLineSpacing ?? 0) > 0 ? '+' : ''}{config.pinyinLineSpacing ?? 0} mm
                </span>
              </div>
              <input
                type="range"
                min={-3}
                max={8}
                step={0.5}
                value={config.pinyinLineSpacing ?? 0}
                onChange={(e) => store.setPinyinLineSpacing(parseFloat(e.target.value))}
                style={{ width: '100%', height: '6px', cursor: 'pointer', accentColor: '#16a34a' }}
                aria-label="Khoảng cách ngang giữa các chữ Pinyin"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#4ade80' }}>
                <span>Co lại -3mm</span>
                <span>Chuẩn 0mm</span>
                <span>Dãn ra +8mm</span>
              </div>
            </div>
          )}

          {/* Slider khoảng cách dọc Pinyin */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ ...labelStyle, color: '#14532d' }}>Vị trí Pinyin</label>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#16a34a' }}>
                {config.pinyinDistance ?? 0} mm
              </span>
            </div>
            <input
              type="range"
              min={-2}
              max={6}
              step={0.5}
              value={config.pinyinDistance ?? 0}
              onChange={(e) => store.setPinyinDistance(parseFloat(e.target.value))}
              style={{ width: '100%', height: '6px', cursor: 'pointer', accentColor: '#16a34a' }}
              aria-label="Vị trí dọc của Pinyin"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#4ade80' }}>
              <span>Lên trên -2mm</span>
              <span>Chuẩn 0mm</span>
              <span>Xuống +6mm</span>
            </div>
          </div>

          {/* Tone marks toggle */}
          <div style={toggleRowStyle}>
            <div style={{ ...labelStyle, color: '#14532d' }}>Thanh điệu</div>
            <label style={{ position: 'relative', width: '48px', height: '26px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.pinyinWithTone}
                onChange={(e) => store.setPinyinWithTone(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                aria-label="Hiện thanh điệu Pinyin"
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'var(--radius-full)',
                backgroundColor: config.pinyinWithTone ? '#16a34a' : 'var(--color-border)',
                transition: 'background-color var(--transition-fast)',
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'absolute',
                  top: '3px',
                  left: config.pinyinWithTone ? '25px' : '3px',
                  transition: 'left var(--transition-fast)',
                }} />
              </div>
            </label>
          </div>
        </div>
      )}


      {/* Orientation */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Hướng giấy</label>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {(['portrait', 'landscape'] as const).map((orient) => (
            <button
              key={orient}
              onClick={() => store.setOrientation(orient)}
              style={{
                flex: 1,
                padding: 'var(--space-2) var(--space-3)',
                border: `1.5px solid ${config.orientation === orient ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                backgroundColor: config.orientation === orient ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                color: config.orientation === orient ? 'var(--color-primary-dark)' : 'var(--color-text)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: config.orientation === orient ? 600 : 400,
                minHeight: 'var(--touch-min)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {orient === 'portrait' ? 'Dọc' : 'Ngang'}
            </button>
          ))}
        </div>
      </div>


    </div>
  );
};

export default QuickSettings;
