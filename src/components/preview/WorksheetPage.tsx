/**
 * WorksheetPage Component
 * 
 * Renders a single worksheet page as SVG.
 * All coordinates use mm units in the viewBox for physical accuracy.
 * This same SVG structure is used for both preview AND PDF rendering.
 */

import React, { useState, useEffect } from 'react';
import type { PageLayout, WorksheetConfig, LayoutResult } from '../../types';
import { generateGridSVG, generatePinyinBoxSVG, type GridSVGOptions } from '../../engines/grid-engine';
import { isChinesePunctuation } from '../../engines/layout-engine';
import { FILL_STYLES, getPageTitle } from '../../types';
import { loadStrokeData, getCachedStrokeData, generateStrokeStepSVG, generateFullCharSVG, type StrokeCharData } from '../../engines/stroke-engine';

interface WorksheetPageProps {
  page: PageLayout;
  config: WorksheetConfig;
  layout: LayoutResult;
  pageIndex: number;
  className?: string;
}

const WorksheetPage: React.FC<WorksheetPageProps> = React.memo(({
  page,
  config,
  layout,
  className,
}) => {
  const { paperWidth, paperHeight, gridSizeMm } = layout;
  const { margins } = config;
  const [strokeDataMap, setStrokeDataMap] = useState<Record<string, StrokeCharData>>({});

  useEffect(() => {
    const charsToLoad = new Set<string>();
    page.rows.forEach(row => {
      row.cells.forEach(cell => {
        if (cell.character) {
          charsToLoad.add(cell.character);
        }
      });
    });

    charsToLoad.forEach(char => {
      if (!strokeDataMap[char]) {
        loadStrokeData(char).then(data => {
          if (data) {
            setStrokeDataMap(prev => ({ ...prev, [char]: data }));
          }
        });
      }
    });
  }, [page]);

  const gridOptions: GridSVGOptions = {
    size: gridSizeMm,
    lineColor: config.gridLineColor,
    lineWidth: config.gridLineWidth,
    guideLineDash: true,
  };

  // Font size relative to grid (for Ô Hồi Trung Cung, scale 0.78 for large clear character)
  const isHuiGrid = config.gridType === 'hui';
  const isLineGrid = config.gridType === 'line';
  const isSquareGrid = config.gridType === 'square';
  const isVerticalBoxGrid =
    config.gridType === 'verticalSquare' ||
    config.gridType === 'verticalTian' ||
    config.gridType === 'verticalMi' ||
    config.gridType === 'verticalHui' ||
    config.gridType === 'verticalOHoi';
  const isVerticalSquare = isVerticalBoxGrid;
  const isVerticalLine = config.gridType === 'verticalLine';
  const showPinyin = config.showPinyin;
  // Tian, Mi, Hui, oHoi grids with Pinyin have an integrated 4-line Pinyin Header Box on top of each cell (Image 2)
  const isBoxWithPinyinHeader = ['tian', 'mi', 'hui', 'oHoi'].includes(config.gridType) && showPinyin;
  // Whether to hide trace/ghost characters (only show pinyin, empty cells)
  const hideTrace = showPinyin && config.showTrace === false;

  // In line mode, gridSizeMm = usableWidth (very large); use rowHeightMm for font size instead
  // pinyinRowH = top 0.5 portion of row when pinyin is on
  // baseLineH = the hanzi portion height (= lineRowHeight config value)
  const pinyinRowH = layout.pinyinRowHeight; // 0 when pinyin off, 0.5*lineRowHeight when on
  const baseLineH = layout.rowHeightMm - pinyinRowH; // = lineRowHeight config value in both cases
  const charSizeRef = isLineGrid ? baseLineH : gridSizeMm;
  const charFontSize = isHuiGrid
    ? charSizeRef * 0.78 * config.fontSize
    : charSizeRef * 0.84 * config.fontSize;
  const pinyinFontSize = isLineGrid
    ? pinyinRowH * 0.55   // scale freely with lineRowHeight
    : isSquareGrid
      ? Math.max(3.0, gridSizeMm * 0.22)
      : gridSizeMm * 0.18;
  // Pinyin line spacing adjustment (mm offset per character slot in line mode)
  const pinyinLineSpacing = config.pinyinLineSpacing ?? 0;

  // For line mode: line spans full usable width, positioned at the bottom of the row height
  const lineGridOptions: GridSVGOptions = {
    size: layout.rowHeightMm,          // row height → line draws at y=rowHeightMm
    lineColor: config.gridLineColor,
    lineWidth: config.gridLineWidth,
    guideLineDash: false,
    lineSpanWidth: layout.usableWidth, // line spans full page width
  };

  // Get fill style info
  const getFillStyleDash = (style: string) => {
    const info = FILL_STYLES.find(s => s.style === style);
    return info?.strokeDash;
  };

  const shouldDisplayCellPinyin = (cell: any): boolean => {
    if (!cell.pinyin || !showPinyin) return false;
    // Handwriting practice modes on box grids: trace cells do not show pinyin (only sample shows pinyin)
    if (cell.type === 'trace' && ['single', 'stroke', 'basicStroke', 'radical'].includes(config.practiceMode) && !isLineGrid) {
      return false;
    }
    return true;
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${paperWidth} ${paperHeight}`}
      className={`worksheet-page ${className || ''}`}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
      }}
      data-page-width={paperWidth}
      data-page-height={paperHeight}
    >
      {/* Paper background */}
      <rect x="0" y="0" width={paperWidth} height={paperHeight} fill="white" />

      {/* Clip path to prevent characters from overflowing past paper margins */}
      <defs>
        <clipPath id={`content-clip-${page.pageIndex}`}>
          <rect
            x={-1}
            y={-1}
            width={layout.usableWidth + 2}
            height={layout.usableHeight + 2}
          />
        </clipPath>
      </defs>

      {/* Header */}
      {config.showHeader && page.headerHeight > 0 && (() => {
        const pageTitle = getPageTitle(config, page.pageIndex);
        const titleFontSize = config.headerFontSize ?? 4.5;
        const titleColor = config.headerFontColor || '#1e293b';
        const titleFontFamily = config.headerFontFamily || "var(--font-sans), sans-serif";
        const titleFontWeight = config.headerFontBold !== false ? 700 : 400;
        const titleFontStyle = config.headerFontItalic ? 'italic' : 'normal';
        const titleUnderline = !!config.headerFontUnderline;

        const titleY = Math.max(4.5, Math.min(7.5, 6 - (titleFontSize - 4.5) * 0.15));

        return (
          <g transform={`translate(${margins.left}, ${margins.top})`}>
            {/* Title (hidden if empty) */}
            {pageTitle ? (
              <text
                x={layout.usableWidth / 2}
                y={titleY}
                textAnchor="middle"
                fontFamily={titleFontFamily}
                fontSize={titleFontSize}
                fontWeight={titleFontWeight}
                fontStyle={titleFontStyle}
                textDecoration={titleUnderline ? 'underline' : 'none'}
                fill={titleColor}
              >
                {pageTitle}
              </text>
            ) : null}

          {/* Name / Class / Date fields */}
          <g transform={`translate(0, 12)`}>
            {config.headerShowName && (
              <g>
                <text x={0} y={0} fontFamily="var(--font-sans), sans-serif" fontSize={3} fill="#475569">
                  Tên:
                </text>
                <line x1={8} y1={0.5} x2={50} y2={0.5} stroke="#cbd5e1" strokeWidth={0.2} />
              </g>
            )}
            {config.headerShowClass && (
              <g>
                <text x={55} y={0} fontFamily="var(--font-sans), sans-serif" fontSize={3} fill="#475569">
                  Lớp:
                </text>
                <line x1={63} y1={0.5} x2={90} y2={0.5} stroke="#cbd5e1" strokeWidth={0.2} />
              </g>
            )}
            {config.headerShowDate && (
              <g>
                <text x={95} y={0} fontFamily="var(--font-sans), sans-serif" fontSize={3} fill="#475569">
                  Ngày:
                </text>
                <line x1={105} y1={0.5} x2={layout.usableWidth} y2={0.5} stroke="#cbd5e1" strokeWidth={0.2} />
              </g>
            )}
          </g>
        </g>
        );
      })()}

      {/* Grid + Characters */}
      <g transform={`translate(${margins.left}, ${margins.top})`} clipPath={`url(#content-clip-${page.pageIndex})`}>
        {/* Vertical ruled lines mode: outer border + vertical divider lines */}
        {isVerticalLine && (() => {
          const colWidth = config.verticalColWidth ?? 16;
          const cols = layout.columns;
          const gridW = cols * colWidth;
          const startX = (layout.usableWidth - gridW) / 2;
          const startY = page.headerHeight;
          const availableH = layout.usableHeight - page.headerHeight;
          const charStep = colWidth * 1.12;
          const charsPerCol = Math.max(1, Math.floor(availableH / charStep));
          const gridH = charsPerCol * charStep;
          const topY = startY + (availableH - gridH) / 2;

          return (
            <g>
              {/* Outer border bounding the vertical ruled area (classic Chinese manuscript style) */}
              <rect
                x={startX}
                y={topY}
                width={gridW}
                height={gridH}
                fill="none"
                stroke={config.gridLineColor}
                strokeWidth={config.gridLineWidth * 1.3}
              />
              {/* Vertical divider lines between columns */}
              {Array.from({ length: cols - 1 }).map((_, i) => {
                const vx = startX + (i + 1) * colWidth;
                return (
                  <line
                    key={i}
                    x1={vx}
                    y1={topY}
                    x2={vx}
                    y2={topY + gridH}
                    stroke={config.gridLineColor}
                    strokeWidth={config.gridLineWidth}
                  />
                );
              })}
            </g>
          );
        })()}

        {page.rows.map((row, rowIdx) => (
          <g key={rowIdx}>
            {/* 214 Radical / Character Structure Block Header */}
            {row.isRadicalBlock && config.practiceMode === 'radical' && (
              <g>
                {/* Line 1: radical detail note — e.g. "人 /rén/ : bộ Nhân. biến thể (亻), nghĩa: người" */}
                {row.radicalDetail && (
                  <text
                    x={0}
                    y={row.y - 5.5}
                    fontFamily="var(--font-sans), sans-serif"
                    fontSize={3.0}
                    fill="#1e293b"
                    fontWeight={700}
                  >
                    {row.radicalDetail}
                  </text>
                )}

                {/* Stroke count — top-right corner of the block */}
                <text
                  x={layout.usableWidth}
                  y={row.y - 5.5}
                  textAnchor="end"
                  fontFamily="var(--font-sans), sans-serif"
                  fontSize={2.8}
                  fill="#64748b"
                  fontWeight={600}
                >
                  {row.strokeCount ?? '?'}画
                </text>
              </g>
            )}

            {/* Pinyin rendering for non-header grids (line and square) */}
            {showPinyin && !row.isRadicalBlock && !isBoxWithPinyinHeader && !isVerticalSquare && !isVerticalLine && (() => {
              if (isLineGrid) {
                // Line mode: Pinyin occupies the TOP pinyinRowH of the row
                // Characters are written in the BOTTOM portion (below pinyin zone)
                const hasPinyin = row.cells.some(c => !!c.pinyin);
                if (!hasPinyin) return null;
                const charW = row.lineCharWidth ?? 13.5;
                // Pinyin centered vertically inside the pinyin zone (top pinyinRowH mm of row)
                const py = row.y + pinyinRowH * 0.65 + (config.pinyinDistance ?? 0);
                return (
                  <text
                    x={0}
                    y={py}
                    fontFamily="var(--font-sans), sans-serif"
                    fontSize={pinyinFontSize}
                    fill="#1e293b"
                    fontWeight={500}
                  >
                    {row.cells.map((cell, cellIdx) => {
                      const stepW = row.lineCharStep ?? (row.lineCharWidth ?? 13.5);
                      return (
                        <tspan
                          key={cellIdx}
                          x={cell.x + stepW / 2}
                          textAnchor="middle"
                        >
                          {shouldDisplayCellPinyin(cell) ? (cell.pinyin || '') : ''}
                        </tspan>
                      );
                    })}
                  </text>
                );
              }
              // Square grid mode: Pinyin floating outside above the square box
              const hasPinyin = row.pinyin || row.cells.some(c => !!c.pinyin);
              if (!hasPinyin) return null;
              // Place pinyin in the top pinyinRowHeight zone above the grid cell row
              const pinyinY = row.y + layout.pinyinRowHeight * 0.72 + (config.pinyinDistance ?? 0);
              return (
                <text
                  x={0}
                  y={pinyinY}
                  fontFamily="var(--font-sans), sans-serif"
                  fontSize={pinyinFontSize}
                  fill={config.fontColor || '#1e293b'}
                  fontWeight={500}
                >
                  {row.cells.map((cell, cellIdx) => (
                    <tspan
                      key={cellIdx}
                      x={cell.x + gridSizeMm / 2}
                      textAnchor="middle"
                    >
                      {shouldDisplayCellPinyin(cell) ? (cell.pinyin || '') : ''}
                    </tspan>
                  ))}
                </text>
              );
            })()}

            {/* Horizontal Ruled Line for line grid mode at bottom of row */}
            {isLineGrid && (
              <line
                x1={0}
                y1={row.y + row.rowHeight}
                x2={layout.usableWidth}
                y2={row.y + row.rowHeight}
                stroke={config.gridLineColor}
                strokeWidth={config.gridLineWidth}
              />
            )}

            {/* Grid cells */}
            {row.cells.map((cell, cellIdx) => {
              const charStroke = cell.character ? (strokeDataMap[cell.character] || getCachedStrokeData(cell.character)) : null;

              return (
              <g key={cellIdx}>
                {/* 1. Integrated 4-line Pinyin Header Box for Tian, Mi, Hui (Image 2) */}
                {isBoxWithPinyinHeader && (
                  <g transform={`translate(${cell.x}, ${row.y})`}>
                    <g dangerouslySetInnerHTML={{
                      __html: generatePinyinBoxSVG({
                        width: gridSizeMm,
                        height: layout.pinyinRowHeight,
                        lineColor: config.gridLineColor,
                        lineWidth: config.gridLineWidth,
                      })
                    }} />
                    {shouldDisplayCellPinyin(cell) && (
                      <text
                        x={gridSizeMm / 2}
                        y={layout.pinyinRowHeight * (2 / 3) + 0.1}
                        textAnchor="middle"
                        fontFamily="var(--font-sans), sans-serif"
                        fontSize={layout.pinyinRowHeight * 0.44}
                        fill={config.fontColor || '#1e293b'}
                        fontWeight={600}
                      >
                        {cell.pinyin}
                      </text>
                    )}
                  </g>
                )}

                {/* 2. Main Character Cell */}
                <g transform={`translate(${cell.x}, ${cell.y})`}>
                  {/* Normal grid types & verticalSquare draw cell borders here */}
                  {!isLineGrid && !isVerticalLine && (
                    <g dangerouslySetInnerHTML={{ __html: generateGridSVG(config.gridType, gridOptions) }} />
                  )}

                  {/* Character & Punctuation rendering */}
                  {isVerticalLine ? (
                    /* Vertical ruled line mode: characters flow top-to-bottom within each column */
                    cell.character && cell.opacity > 0 ? (() => {
                      const colW = row.colWidth ?? (config.verticalColWidth ?? 16);
                      const charH = colW * 1.12;
                      const renderCharSize = colW * 0.85 * config.fontSize;
                      const traceColor = cell.type === 'trace' ? '#64748b' : (config.fontColor || '#1e293b');
                      const isPunct = isChinesePunctuation(cell.character);

                      if (charStroke) {
                        const xOffset = Math.max(0, (colW - renderCharSize) / 2);
                        const yOffset = Math.max(0, (charH - renderCharSize) / 2);
                        return (
                          <g
                            transform={`translate(${xOffset}, ${yOffset})`}
                            dangerouslySetInnerHTML={{
                              __html: generateFullCharSVG(
                                charStroke.strokes,
                                renderCharSize,
                                {
                                  color: traceColor,
                                  opacity: cell.opacity,
                                  fitInnerBox: false,
                                  fillStyle: cell.fillStyle,
                                  strokeDash: getFillStyleDash(cell.fillStyle),
                                }
                              )
                            }}
                          />
                        );
                      }
                      // For punctuation in vertical mode: center horizontally in the column!
                      // Corner punctuation glyphs in Chinese fonts are drawn in the bottom-left of the em-square (offset by -0.25*fontSize).
                      // Shifting +0.25*fontSize aligns their visual center with the column center colW/2!
                      const isCornerPunct = cell.character === '，' || cell.character === '。' || cell.character === '、' || cell.character === '：' || cell.character === '；';
                      const punctX = (colW / 2) + (isCornerPunct ? renderCharSize * 0.25 : 0);
                      const punctY = (charH / 2) + (isCornerPunct ? -renderCharSize * 0.20 : 0);

                      return (
                        <text
                          x={punctX}
                          y={punctY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontFamily={config.fontFamily || "'LXGW WenKai', 'KaiTi', '楷体', serif"}
                          fontSize={renderCharSize * 0.9}
                          fontWeight={config.fontWeight}
                          fill={traceColor}
                          opacity={cell.opacity}
                        >
                          {cell.character}
                        </text>
                      );
                    })() : null
                  ) : isLineGrid ? (
                    /* Line mode: vector strokes for Hanzi, CSS text for punctuation and non-stroke characters */
                    /* Characters start BELOW the pinyin zone: offset by pinyinRowH */
                    cell.character && cell.opacity > 0 ? (() => {
                      const charW = row.lineCharWidth ?? 12.5;
                      const stepW = row.lineCharStep ?? charW;
                      // Normalize font scale so default 0.85 = 1.0 (large, filling ~88% of line height)
                      const fontScale = (config.fontSize ?? 0.85) / 0.85;
                      const renderCharSize = baseLineH * 0.88 * Math.min(fontScale, 1.15);
                      const traceColor = cell.type === 'trace' ? '#64748b' : (config.fontColor || '#1e293b');
                      const traceOpacity = cell.opacity;
                      const isPunct = isChinesePunctuation(cell.character);

                      // If showTrace is false (hideTrace) and it's not punctuation, hide trace characters on line mode
                      if (hideTrace && !isPunct && cell.type === 'trace') {
                        return null;
                      }

                      // If user chose a custom calligraphy font (Hành Thư, Hành Khải, Viết Tay, etc.), render using CSS font
                      const isDefaultKaiTi = !config.fontFamily || 
                        config.fontFamily.includes('STKaiti') || 
                        config.fontFamily === "'LXGW WenKai', 'KaiTi', '楷体', 'STKaiti', serif";

                      if (charStroke && isDefaultKaiTi) {
                        const xOffset = Math.max(0, (stepW - renderCharSize) / 2);
                        // Bottom of character rests right above the ruled line (at baseLineH)
                        const yOffset = Math.max(0, baseLineH - renderCharSize - 0.6);
                        return (
                          <g
                            transform={`translate(${xOffset}, ${yOffset})`}
                            dangerouslySetInnerHTML={{
                              __html: generateFullCharSVG(
                                charStroke.strokes,
                                renderCharSize,
                                {
                                  color: traceColor,
                                  opacity: traceOpacity,
                                  fitInnerBox: false,
                                  fillStyle: cell.fillStyle,
                                  strokeDash: getFillStyleDash(cell.fillStyle),
                                }
                              )
                            }}
                          />
                        );
                      }
                      // Render with CSS font for custom fonts, Chinese punctuation, or fallback
                      // Baseline positioned so bottom of characters sits directly on the ruled line (at baseLineH)
                      const textY = baseLineH - 1.6;
                      return (
                        <text
                          x={stepW * 0.5}
                          y={textY}
                          textAnchor="middle"
                          fontFamily={config.fontFamily || "'LXGW WenKai', 'KaiTi', '楷体', serif"}
                          fontSize={renderCharSize * 0.95}
                          fontWeight={config.fontWeight}
                          fill={cell.type === 'trace' ? '#64748b' : (config.fontColor || '#1e293b')}
                          opacity={cell.opacity}
                        >
                          {cell.character}
                        </text>
                      );
                    })()
                    : null
                  ) : cell.type === 'strokeStep' && cell.character && charStroke ? (
                    <g
                      dangerouslySetInnerHTML={{
                        __html: generateStrokeStepSVG(
                          charStroke.strokes,
                          cell.strokeStepIndex ?? 0,
                          gridSizeMm,
                          {
                            strokeColor: '#64748b',
                            opacity: cell.opacity,
                            fitInnerBox: isHuiGrid,
                            fillStyle: cell.fillStyle,
                            strokeDash: getFillStyleDash(cell.fillStyle),
                          }
                        ),
                      }}
                    />
                  ) : cell.character && charStroke && cell.opacity > 0 && (!config.fontFamily || config.fontFamily.includes('STKaiti') || config.fontFamily === "'LXGW WenKai', 'KaiTi', '楷体', 'STKaiti', serif") ? (
                    <g
                      dangerouslySetInnerHTML={{
                        __html: generateFullCharSVG(
                          charStroke.strokes,
                          gridSizeMm,
                          {
                            color: cell.type === 'trace' ? '#64748b' : (config.fontColor || '#1e293b'),
                            opacity: cell.opacity,
                            fitInnerBox: isHuiGrid,
                            fillStyle: cell.fillStyle,
                            strokeDash: getFillStyleDash(cell.fillStyle),
                          }
                        ),
                      }}
                    />
                  ) : cell.character && cell.opacity > 0 ? (() => {
                    const isCornerPunct = cell.character === '，' || cell.character === '。' || cell.character === '、' || cell.character === '：' || cell.character === '；';
                    const punctShiftX = (isVerticalSquare && isCornerPunct) ? (charFontSize * 0.25) : 0;
                    const punctShiftY = (isVerticalSquare && isCornerPunct) ? (-charFontSize * 0.20) : 0;
                    return (
                    <text
                      x={gridSizeMm / 2 + punctShiftX}
                      y={gridSizeMm / 2 - gridSizeMm * 0.02 + punctShiftY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily={config.fontFamily || "'LXGW WenKai', 'KaiTi', '楷体', serif"}
                      fontSize={charFontSize}
                      fontWeight={config.fontWeight}
                      fill={cell.type === 'trace' ? '#64748b' : config.fontColor}
                      opacity={cell.opacity}
                      style={
                        getFillStyleDash(cell.fillStyle)
                          ? {
                              stroke: cell.type === 'trace' ? '#64748b' : config.fontColor,
                              strokeWidth: gridSizeMm * 0.005,
                              strokeDasharray: getFillStyleDash(cell.fillStyle),
                              fill: 'none',
                              opacity: cell.opacity,
                            }
                          : undefined
                      }
                    >
                      {cell.character}
                    </text>
                    );
                  })() : null}
                </g>
              </g>
              );
            })}
          </g>
        ))}
      </g>

      {/* Page number (small, bottom right) */}
      <text
        x={paperWidth - margins.right}
        y={paperHeight - margins.bottom / 2}
        textAnchor="end"
        fontFamily="var(--font-sans), sans-serif"
        fontSize={2.5}
        fill="#94a3b8"
      >
        {page.pageIndex + 1}
      </text>
    </svg>
  );
});

WorksheetPage.displayName = 'WorksheetPage';

export default WorksheetPage;
