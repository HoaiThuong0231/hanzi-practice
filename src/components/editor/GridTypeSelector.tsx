/**
 * GridTypeSelector Component
 * 
 * Visual card selector for the 5 grid types.
 * Each card shows an SVG thumbnail + label.
 * Touch-friendly with minimum 80×80px cards.
 *
 * When a "flow" practice mode is active (paragraph / sentence / vocabulary…),
 * only the "Kẻ ngang" (line) grid is available — other options are disabled.
 */

import React from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import { GRID_TYPES, GRID_COLOR_OPTIONS, GRID_LINE_WIDTH_OPTIONS, type GridType } from '../../types';
import { generateGridThumbnail } from '../../engines/grid-engine';

const GridTypeSelector: React.FC = () => {
  const {
    config,
    setGridType,
    setGridLineColor,
    setGridLineWidth,
    setColumnsPerRow,
    setVerticalRowsPerCol,
    setVerticalColWidth,
    setRowGapMm,
    setColumnGapMm,
    layout,
  } = useWorksheetStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <label style={{
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: 'var(--color-text)',
      }}>
        Kiểu ô luyện viết
      </label>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--space-3)',
      }}>
        {GRID_TYPES.map((grid) => {
          const isSelected = config.gridType === grid.type;
          const thumbnail = generateGridThumbnail(grid.type, 48);

          return (
            <button
              key={grid.type}
              onClick={() => setGridType(grid.type as GridType)}
              disabled={false}
              aria-label={`${grid.name} ${grid.chineseName}`}
              aria-pressed={isSelected}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3)',
                border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isSelected
                  ? 'var(--color-primary-light)'
                  : 'var(--color-bg-elevated)',
                cursor: 'pointer',
                opacity: 1,
                transition: 'all var(--transition-fast)',
                minHeight: '80px',
                minWidth: '80px',
                outline: 'none',
                boxShadow: isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : 'var(--shadow-sm)',
                pointerEvents: 'auto',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: thumbnail }}
                style={{ lineHeight: 0 }}
              />
              <div style={{
                fontSize: 'var(--text-xs)',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                textAlign: 'center',
                lineHeight: 1.3,
              }}>
                <div>{grid.name}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Màu hoạ tiết & Độ dày nét hoạ tiết ô kẻ */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        marginTop: 'var(--space-1)',
        backgroundColor: 'var(--color-bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Màu hoạ tiết */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            Màu hoạ tiết:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                backgroundColor: config.gridLineColor,
                border: '1.5px solid var(--color-border)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                flexShrink: 0,
              }}
            />
            <select
              value={config.gridLineColor}
              onChange={(e) => setGridLineColor(e.target.value)}
              style={{
                height: '32px',
                padding: '0 8px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '140px',
                flex: 1,
              }}
              aria-label="Chọn màu hoạ tiết kẻ ô"
            >
              {GRID_COLOR_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Độ dày nét hoạ tiết */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            Độ dày nét:
          </label>
          <select
            value={config.gridLineWidth}
            onChange={(e) => setGridLineWidth(parseFloat(e.target.value))}
            style={{
              height: '32px',
              padding: '0 8px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '140px',
              flex: 1,
            }}
            aria-label="Chọn độ dày nét hoạ tiết ô kẻ"
          >
            {GRID_LINE_WIDTH_OPTIONS.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Căn chỉnh số ô trên 1 cột cho các loại Ô dọc */}
      {(['verticalSquare', 'verticalTian', 'verticalMi', 'verticalHui', 'verticalOHoi'].includes(config.gridType)) && (() => {
        const currentRows = config.verticalRowsPerCol ?? 12;
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                Số ô trên 1 cột
              </label>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>
                {currentRows} ô / cột
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <button
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-elevated)',
                    fontSize: '18px',
                    fontWeight: 600,
                    cursor: currentRows <= 6 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text)',
                  }}
                  onClick={() => setVerticalRowsPerCol(Math.max(6, currentRows - 1))}
                  disabled={currentRows <= 6}
                >
                  −
                </button>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-text)',
                }}>
                  {currentRows} ô
                </div>
                <button
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-elevated)',
                    fontSize: '18px',
                    fontWeight: 600,
                    cursor: currentRows >= 25 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text)',
                  }}
                  onClick={() => setVerticalRowsPerCol(Math.min(25, currentRows + 1))}
                  disabled={currentRows >= 25}
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
                onChange={(e) => setVerticalRowsPerCol(parseInt(e.target.value))}
                style={{ width: '100%', height: '6px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                {[8, 10, 12, 14, 16, 18].map((n) => {
                  const isCurrent = currentRows === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setVerticalRowsPerCol(n)}
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
                    >
                      {n} ô
                    </button>
                  );
                })}
              </div>

              {/* Căn chỉnh khoảng cách cột (Giãn cột) */}
              {(() => {
                const currentColGap = config.columnGapMm ?? 3.0;
                return (
                  <div style={{
                    marginTop: 'var(--space-2)',
                    paddingTop: 'var(--space-2)',
                    borderTop: '1px dashed var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                        Giãn cột
                      </label>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {currentColGap} mm
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <button
                        style={{
                          width: '36px',
                          height: '36px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-elevated)',
                          fontSize: '18px',
                          fontWeight: 600,
                          cursor: currentColGap <= 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text)',
                        }}
                        onClick={() => setColumnGapMm(Math.max(0, Math.round((currentColGap - 0.5) * 10) / 10))}
                        disabled={currentColGap <= 0}
                      >
                        −
                      </button>
                      <div style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '8px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-elevated)',
                        color: 'var(--color-text)',
                      }}>
                        {currentColGap === 0 ? '0 mm' : `${currentColGap} mm`}
                      </div>
                      <button
                        style={{
                          width: '36px',
                          height: '36px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-elevated)',
                          fontSize: '18px',
                          fontWeight: 600,
                          cursor: currentColGap >= 15 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text)',
                        }}
                        onClick={() => setColumnGapMm(Math.min(15, Math.round((currentColGap + 0.5) * 10) / 10))}
                        disabled={currentColGap >= 15}
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
                            onClick={() => setColumnGapMm(g)}
                            style={{
                              padding: '4px 2px',
                              fontSize: '11px',
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
                Ô tự động dàn theo chiều dọc và chia đều {layout.columns} cột sang ngang. Viết từ trên xuống dưới, từ trái qua phải.
              </div>
            </div>
          </div>
        );
      })()}

      {/* Căn chỉnh độ rộng cột cho Kẻ dọc */}
      {config.gridType === 'verticalLine' && (() => {
        const currentWidth = config.verticalColWidth ?? 16;
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                Độ rộng cột
              </label>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>
                {currentWidth} mm
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <button
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-elevated)',
                    fontSize: '18px',
                    fontWeight: 600,
                    cursor: currentWidth <= 8 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text)',
                  }}
                  onClick={() => setVerticalColWidth(Math.max(8, currentWidth - 1))}
                  disabled={currentWidth <= 8}
                >
                  −
                </button>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-text)',
                }}>
                  {currentWidth} mm
                </div>
                <button
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-elevated)',
                    fontSize: '18px',
                    fontWeight: 600,
                    cursor: currentWidth >= 35 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text)',
                  }}
                  onClick={() => setVerticalColWidth(Math.min(35, currentWidth + 1))}
                  disabled={currentWidth >= 35}
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
                onChange={(e) => setVerticalColWidth(parseInt(e.target.value))}
                style={{ width: '100%', height: '6px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                {[12, 14, 16, 18, 20, 24].map((w) => {
                  const isCurrent = currentWidth === w;
                  return (
                    <button
                      key={w}
                      onClick={() => setVerticalColWidth(w)}
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

      {/* Căn chỉnh số ô trên 1 hàng (Chỉ cho ô vuông, ô điền, ô mễ, ô hồi cung, ô hồi) */}
      {(() => {
        const isBoxGrid = ['square', 'tian', 'mi', 'hui', 'oHoi'].includes(config.gridType);
        if (!isBoxGrid) return null;
        const currentCols = config.columnsPerRow ?? ((config.gridType === 'hui' || config.gridType === 'oHoi') ? 11 : config.gridType === 'square' ? 14 : 12);

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                Số ô trên 1 hàng
              </label>
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}>
                {currentCols} ô / hàng
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <button
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-elevated)',
                    fontSize: '18px',
                    fontWeight: 600,
                    cursor: currentCols <= 4 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text)',
                  }}
                  onClick={() => setColumnsPerRow(Math.max(4, currentCols - 1))}
                  disabled={currentCols <= 4}
                >
                  −
                </button>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-text)',
                }}>
                  {currentCols} ô
                </div>
                <button
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-elevated)',
                    fontSize: '18px',
                    fontWeight: 600,
                    cursor: currentCols >= 20 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text)',
                  }}
                  onClick={() => setColumnsPerRow(Math.min(20, currentCols + 1))}
                  disabled={currentCols >= 20}
                >
                  +
                </button>
              </div>

              <input
                type="range"
                min={4}
                max={18}
                step={1}
                value={currentCols}
                onChange={(e) => setColumnsPerRow(parseInt(e.target.value))}
                style={{ width: '100%', height: '6px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {[5, 6, 7, 8, 10, 12, 14].map((n) => {
                  const isCurrent = currentCols === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setColumnsPerRow(n)}
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
                    >
                      {n} ô
                    </button>
                  );
                })}
              </div>

              {/* Giãn dòng */}
              {(() => {
                const currentRowGap = config.rowGapMm ?? 2.5;
                return (
                  <div style={{
                    marginTop: 'var(--space-2)',
                    paddingTop: 'var(--space-2)',
                    borderTop: '1px dashed var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                        Giãn dòng
                      </label>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {currentRowGap} mm
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <button
                        style={{
                          width: '36px',
                          height: '36px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-elevated)',
                          fontSize: '18px',
                          fontWeight: 600,
                          cursor: currentRowGap <= 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text)',
                        }}
                        onClick={() => setRowGapMm(Math.max(0, Math.round((currentRowGap - 0.5) * 10) / 10))}
                        disabled={currentRowGap <= 0}
                      >
                        −
                      </button>
                      <div style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '8px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-elevated)',
                        color: 'var(--color-text)',
                      }}>
                        {currentRowGap === 0 ? '0 mm' : `${currentRowGap} mm`}
                      </div>
                      <button
                        style={{
                          width: '36px',
                          height: '36px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-elevated)',
                          fontSize: '18px',
                          fontWeight: 600,
                          cursor: currentRowGap >= 15 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text)',
                        }}
                        onClick={() => setRowGapMm(Math.min(15, Math.round((currentRowGap + 0.5) * 10) / 10))}
                        disabled={currentRowGap >= 15}
                      >
                        +
                      </button>
                    </div>


                  </div>
                );
              })()}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default GridTypeSelector;
