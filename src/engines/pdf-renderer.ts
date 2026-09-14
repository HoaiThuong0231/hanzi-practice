/**
 * PDF Renderer Engine
 * 
 * Generates PDF from worksheet layout using jsPDF + svg2pdf.js.
 * Key requirement: PDF must use exact physical dimensions (mm).
 * Font is embedded in the PDF.
 */

import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import type { WorksheetConfig, LayoutResult } from '../types';
import { FILL_STYLES, getPageTitle } from '../types';
import { getCachedStrokeData, generateStrokeStepSVG, generateFullCharSVG } from './stroke-engine';
import { generatePinyinBoxSVG } from './grid-engine';

const getFillStyleDash = (style: string) => {
  const info = FILL_STYLES.find(s => s.style === style);
  return info?.strokeDash;
};

// Font loading state
let fontBase64Cache: string | null = null;

/**
 * Load the LXGW WenKai font binary as Base64 for PDF embedding.
 * Uses native FileReader.readAsDataURL for ultra-fast conversion (15ms vs 5s loop).
 */
async function loadFontBase64(): Promise<string> {
  if (fontBase64Cache) return fontBase64Cache;

  const response = await fetch('/fonts/LXGWWenKai-Regular.ttf');
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      fontBase64Cache = base64;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Create an SVG element for a single page (for svg2pdf rendering).
 * This creates a detached DOM element — never appended to the document.
 */
function createPageSVG(
  pageIndex: number,
  config: WorksheetConfig,
  layout: LayoutResult
): SVGSVGElement {
  const page = layout.pages[pageIndex];
  const { paperWidth, paperHeight, gridSizeMm } = layout;
  const { margins } = config;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('xmlns', ns);
  svg.setAttribute('viewBox', `0 0 ${paperWidth} ${paperHeight}`);
  svg.setAttribute('width', `${paperWidth}mm`);
  svg.setAttribute('height', `${paperHeight}mm`);

  // Paper background
  const bg = document.createElementNS(ns, 'rect');
  bg.setAttribute('x', '0');
  bg.setAttribute('y', '0');
  bg.setAttribute('width', String(paperWidth));
  bg.setAttribute('height', String(paperHeight));
  bg.setAttribute('fill', 'white');
  svg.appendChild(bg);

  // Header
  if (config.showHeader && page.headerHeight > 0) {
    const headerGroup = document.createElementNS(ns, 'g');
    headerGroup.setAttribute('transform', `translate(${margins.left}, ${margins.top})`);

    const pageTitle = getPageTitle(config, pageIndex);

    if (pageTitle) {
      const titleFontSize = config.headerFontSize ?? 4.5;
      const titleY = Math.max(4.5, Math.min(7.5, 6 - (titleFontSize - 4.5) * 0.15));
      const titleColor = config.headerFontColor || '#1e293b';
      const titleFontFamily = config.headerFontFamily || "'LXGW WenKai', sans-serif";
      const titleFontWeight = config.headerFontBold !== false ? '700' : '400';

      const title = document.createElementNS(ns, 'text');
      title.setAttribute('x', String(layout.usableWidth / 2));
      title.setAttribute('y', String(titleY));
      title.setAttribute('text-anchor', 'middle');
      title.setAttribute('font-family', titleFontFamily);
      title.setAttribute('font-size', String(titleFontSize));
      title.setAttribute('font-weight', titleFontWeight);
      if (config.headerFontItalic) {
        title.setAttribute('font-style', 'italic');
      }
      if (config.headerFontUnderline) {
        title.setAttribute('text-decoration', 'underline');
      }
      title.setAttribute('fill', titleColor);
      title.textContent = pageTitle;
      headerGroup.appendChild(title);
    }

      // Name/Class/Date fields
      const fieldsGroup = document.createElementNS(ns, 'g');
      fieldsGroup.setAttribute('transform', 'translate(0, 12)');

      if (config.headerShowName) {
        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', '0');
        label.setAttribute('y', '0');
        label.setAttribute('font-family', 'sans-serif');
        label.setAttribute('font-size', '3');
        label.setAttribute('fill', '#475569');
        label.textContent = 'Tên:';
        fieldsGroup.appendChild(label);

        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', '8');
        line.setAttribute('y1', '0.5');
        line.setAttribute('x2', '50');
        line.setAttribute('y2', '0.5');
        line.setAttribute('stroke', '#cbd5e1');
        line.setAttribute('stroke-width', '0.3');
        fieldsGroup.appendChild(line);
      }

      if (config.headerShowClass) {
        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', '55');
        label.setAttribute('y', '0');
        label.setAttribute('font-family', 'sans-serif');
        label.setAttribute('font-size', '3');
        label.setAttribute('fill', '#475569');
        label.textContent = 'Lớp:';
        fieldsGroup.appendChild(label);

        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', '63');
        line.setAttribute('y1', '0.5');
        line.setAttribute('x2', '90');
        line.setAttribute('y2', '0.5');
        line.setAttribute('stroke', '#cbd5e1');
        line.setAttribute('stroke-width', '0.3');
        fieldsGroup.appendChild(line);
      }

      if (config.headerShowDate) {
        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', '95');
        label.setAttribute('y', '0');
        label.setAttribute('font-family', 'sans-serif');
        label.setAttribute('font-size', '3');
        label.setAttribute('fill', '#475569');
        label.textContent = 'Ngày:';
        fieldsGroup.appendChild(label);

        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', '105');
        line.setAttribute('y1', '0.5');
        line.setAttribute('x2', String(layout.usableWidth));
        line.setAttribute('y2', '0.5');
        line.setAttribute('stroke', '#cbd5e1');
        line.setAttribute('stroke-width', '0.3');
        fieldsGroup.appendChild(line);
      }

      headerGroup.appendChild(fieldsGroup);
      svg.appendChild(headerGroup);
    }


  // Main content group
  const contentGroup = document.createElementNS(ns, 'g');
  contentGroup.setAttribute('transform', `translate(${margins.left}, ${margins.top})`);

  const isHuiGrid = config.gridType === 'hui' || config.gridType === 'oHoi';
  const charFontSize = isHuiGrid ? gridSizeMm * 0.78 * config.fontSize : gridSizeMm * 0.84 * config.fontSize;
  const pinyinFontSize = gridSizeMm * 0.18;

  // Grid line helpers
  const createGridCell = (type: string, size: number, lineColor: string, lineWidth: number) => {
    const g = document.createElementNS(ns, 'g');
    const dashArray = `${size / 15},${size / 15}`;
    const half = size / 2;

    // Outer rect (drawn unless type is 'line' or 'verticalLine')
    if (type !== 'line' && type !== 'verticalLine') {
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', '0');
      rect.setAttribute('y', '0');
      rect.setAttribute('width', String(size));
      rect.setAttribute('height', String(size));
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', lineColor);
      rect.setAttribute('stroke-width', String(lineWidth));
      g.appendChild(rect);
    }

    // Parse color for guides (lighter)
    const hex = lineColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const gv = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const guideColor = `rgba(${r},${gv},${b},0.5)`;
    const guideWidth = String(lineWidth * 0.7);

    const addLine = (x1: number, y1: number, x2: number, y2: number) => {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', String(x1));
      line.setAttribute('y1', String(y1));
      line.setAttribute('x2', String(x2));
      line.setAttribute('y2', String(y2));
      line.setAttribute('stroke', guideColor);
      line.setAttribute('stroke-width', guideWidth);
      line.setAttribute('stroke-dasharray', dashArray);
      g.appendChild(line);
    };

    switch (type) {
      case 'tian':
      case 'verticalTian':
        addLine(half, 0, half, size);
        addLine(0, half, size, half);
        break;
      case 'mi':
      case 'verticalMi':
        addLine(half, 0, half, size);
        addLine(0, half, size, half);
        addLine(0, 0, size, size);
        addLine(size, 0, 0, size);
        break;
      case 'hui':
      case 'verticalHui': {
        const inset = size * 0.25;
        const innerSize = size * 0.5;
        const innerRect = document.createElementNS(ns, 'rect');
        innerRect.setAttribute('x', String(inset));
        innerRect.setAttribute('y', String(inset));
        innerRect.setAttribute('width', String(innerSize));
        innerRect.setAttribute('height', String(innerSize));
        innerRect.setAttribute('fill', 'none');
        innerRect.setAttribute('stroke', guideColor);
        innerRect.setAttribute('stroke-width', guideWidth);
        innerRect.setAttribute('stroke-dasharray', dashArray);
        g.appendChild(innerRect);

        addLine(half, 0, half, size);
        addLine(0, half, size, half);
        addLine(0, 0, size, size);
        addLine(size, 0, 0, size);
        break;
      }
      case 'oHoi':
      case 'verticalOHoi': {
        const inset = size * 0.25;
        const innerSize = size * 0.5;
        const innerRect = document.createElementNS(ns, 'rect');
        innerRect.setAttribute('x', String(inset));
        innerRect.setAttribute('y', String(inset));
        innerRect.setAttribute('width', String(innerSize));
        innerRect.setAttribute('height', String(innerSize));
        innerRect.setAttribute('fill', 'none');
        innerRect.setAttribute('stroke', guideColor);
        innerRect.setAttribute('stroke-width', guideWidth);
        innerRect.setAttribute('stroke-dasharray', dashArray);
        g.appendChild(innerRect);

        addLine(half, 0, half, size);
        addLine(0, half, size, half);
        break;
      }
      case 'square':
      case 'verticalSquare':
        break;
      case 'line': {
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', String(size));
        line.setAttribute('x2', String(size));
        line.setAttribute('y2', String(size));
        line.setAttribute('stroke', lineColor);
        line.setAttribute('stroke-width', String(lineWidth));
        g.appendChild(line);
        break;
      }
      case 'verticalLine':
        break;
    }

    return g;
  };

  // Vertical ruled lines frame & dividers for PDF
  if (config.gridType === 'verticalLine') {
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

    const frame = document.createElementNS(ns, 'rect');
    frame.setAttribute('x', String(startX));
    frame.setAttribute('y', String(topY));
    frame.setAttribute('width', String(gridW));
    frame.setAttribute('height', String(gridH));
    frame.setAttribute('fill', 'none');
    frame.setAttribute('stroke', config.gridLineColor);
    frame.setAttribute('stroke-width', String(config.gridLineWidth * 1.6));
    contentGroup.appendChild(frame);

    for (let i = 0; i < cols - 1; i++) {
      const vx = startX + (i + 1) * colWidth;
      const vline = document.createElementNS(ns, 'line');
      vline.setAttribute('x1', String(vx));
      vline.setAttribute('y1', String(topY));
      vline.setAttribute('x2', String(vx));
      vline.setAttribute('y2', String(topY + gridH));
      vline.setAttribute('stroke', config.gridLineColor);
      vline.setAttribute('stroke-width', String(config.gridLineWidth));
      contentGroup.appendChild(vline);
    }
  }

  // Render rows
  for (const row of page.rows) {
    // 214 Radical / Character Structure Block Header & Metadata in PDF (chỉ khi chọn chế độ radical)
    if (row.isRadicalBlock && config.practiceMode === 'radical') {
      if (row.pinyin) {
        const txt = document.createElementNS(ns, 'text');
        txt.setAttribute('x', String(gridSizeMm / 2));
        txt.setAttribute('y', String(row.y - 1.5));
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('font-family', 'sans-serif');
        txt.setAttribute('font-size', '3.2');
        txt.setAttribute('fill', '#334155');
        txt.setAttribute('font-weight', '500');
        txt.textContent = row.pinyin;
        contentGroup.appendChild(txt);
      }

      // Stroke count header text
      const countTxt = document.createElementNS(ns, 'text');
      countTxt.setAttribute('x', String((layout.columns - 1) * gridSizeMm - 4));
      countTxt.setAttribute('y', String(row.y - 2));
      countTxt.setAttribute('text-anchor', 'end');
      countTxt.setAttribute('font-family', 'sans-serif');
      countTxt.setAttribute('font-size', '2.8');
      countTxt.setAttribute('fill', '#475569');
      countTxt.setAttribute('font-weight', '600');
      countTxt.textContent = `${row.strokeCount || 8}画 (${row.strokeCount || 8} nét)`;
      contentGroup.appendChild(countTxt);

      // Radical & Structure Meta below Last Row Col 0
      const rowCount = row.blockRowCount || 2;
      if (row.radical) {
        const radTxt = document.createElementNS(ns, 'text');
        radTxt.setAttribute('x', String(gridSizeMm / 2));
        radTxt.setAttribute('y', String(row.y + gridSizeMm * rowCount + 2.5));
        radTxt.setAttribute('text-anchor', 'middle');
        radTxt.setAttribute('font-family', 'sans-serif');
        radTxt.setAttribute('font-size', '2.5');
        radTxt.setAttribute('fill', '#475569');
        radTxt.textContent = `部首: ${row.radical}`;
        contentGroup.appendChild(radTxt);
      }
      if (row.structure) {
        const structTxt = document.createElementNS(ns, 'text');
        structTxt.setAttribute('x', String(gridSizeMm / 2));
        structTxt.setAttribute('y', String(row.y + gridSizeMm * rowCount + 5.5));
        structTxt.setAttribute('text-anchor', 'middle');
        structTxt.setAttribute('font-family', 'sans-serif');
        structTxt.setAttribute('font-size', '2.5');
        structTxt.setAttribute('fill', '#64748b');
        structTxt.textContent = `${row.structure.zh} (${row.structure.vi})`;
        contentGroup.appendChild(structTxt);
      }
    }

    const isLineGrid = config.gridType === 'line';
    const isBoxWithPinyinHeader = ['tian', 'mi', 'hui', 'oHoi'].includes(config.gridType) && config.showPinyin;

    const shouldDisplayPdfPinyin = (cell: any): boolean => {
      if (!cell.pinyin || !config.showPinyin) return false;
      if (cell.type === 'trace' && ['single', 'stroke', 'basicStroke', 'radical'].includes(config.practiceMode) && !isLineGrid) {
        return false;
      }
      return true;
    };

    // Pinyin for Line and Square grids (floating / top row)
    if (config.showPinyin && !row.isRadicalBlock && !isBoxWithPinyinHeader && config.gridType !== 'verticalLine' && config.gridType !== 'verticalSquare') {
      if (isLineGrid) {
        const hasPinyin = row.cells.some(c => !!c.pinyin);
        if (hasPinyin) {
          const stepW = row.lineCharStep ?? (row.lineCharWidth ?? 13.5);
          const pinyinRowH = layout.pinyinRowHeight;
          const py = row.y + pinyinRowH * 0.65 + (config.pinyinDistance ?? 0);
          for (const cell of row.cells) {
            if (shouldDisplayPdfPinyin(cell)) {
              const txt = document.createElementNS(ns, 'text');
              txt.setAttribute('x', String(cell.x + stepW / 2));
              txt.setAttribute('y', String(py));
              txt.setAttribute('text-anchor', 'middle');
              txt.setAttribute('font-family', 'sans-serif');
              txt.setAttribute('font-size', String(pinyinFontSize));
              txt.setAttribute('fill', config.fontColor || '#1e293b');
              txt.setAttribute('font-weight', '500');
              txt.textContent = cell.pinyin || '';
              contentGroup.appendChild(txt);
            }
          }
        }
      } else if (config.gridType === 'square') {
        const hasPinyin = row.pinyin || row.cells.some(c => !!c.pinyin);
        if (hasPinyin) {
          const py = row.y + layout.pinyinRowHeight * 0.72 + (config.pinyinDistance ?? 0);
          for (const cell of row.cells) {
            if (shouldDisplayPdfPinyin(cell)) {
              const txt = document.createElementNS(ns, 'text');
              txt.setAttribute('x', String(cell.x + gridSizeMm / 2));
              txt.setAttribute('y', String(py));
              txt.setAttribute('text-anchor', 'middle');
              txt.setAttribute('font-family', 'sans-serif');
              txt.setAttribute('font-size', String(pinyinFontSize));
              txt.setAttribute('fill', config.fontColor || '#1e293b');
              txt.setAttribute('font-weight', '500');
              txt.textContent = cell.pinyin || '';
              contentGroup.appendChild(txt);
            }
          }
        }
      }
    }

    // Horizontal Ruled line for line mode
    if (config.gridType === 'line') {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', String(row.y + row.rowHeight));
      line.setAttribute('x2', String(layout.usableWidth));
      line.setAttribute('y2', String(row.y + row.rowHeight));
      line.setAttribute('stroke', config.gridLineColor);
      line.setAttribute('stroke-width', String(config.gridLineWidth));
      contentGroup.appendChild(line);
    }

    // Grid cells + characters
    for (const cell of row.cells) {
      // 1. Integrated 4-line Pinyin Header Box for Tian, Mi, Hui, oHoi
      if (isBoxWithPinyinHeader) {
        const pinyinHeaderGroup = document.createElementNS(ns, 'g');
        pinyinHeaderGroup.setAttribute('transform', `translate(${cell.x}, ${row.y})`);
        const pinyinSvgMarkup = generatePinyinBoxSVG({
          width: gridSizeMm,
          height: layout.pinyinRowHeight,
          lineColor: config.gridLineColor,
          lineWidth: config.gridLineWidth,
        });
        const tempG = document.createElementNS(ns, 'g');
        tempG.innerHTML = pinyinSvgMarkup;
        while (tempG.firstChild) {
          pinyinHeaderGroup.appendChild(tempG.firstChild);
        }
        if (shouldDisplayPdfPinyin(cell)) {
          const pyTxt = document.createElementNS(ns, 'text');
          pyTxt.setAttribute('x', String(gridSizeMm / 2));
          pyTxt.setAttribute('y', String(layout.pinyinRowHeight * (2 / 3) + 0.1));
          pyTxt.setAttribute('text-anchor', 'middle');
          pyTxt.setAttribute('font-family', 'sans-serif');
          pyTxt.setAttribute('font-size', String(layout.pinyinRowHeight * 0.44));
          pyTxt.setAttribute('fill', config.fontColor || '#1e293b');
          pyTxt.setAttribute('font-weight', '600');
          pyTxt.textContent = cell.pinyin || '';
          pinyinHeaderGroup.appendChild(pyTxt);
        }
        contentGroup.appendChild(pinyinHeaderGroup);
      }

      const cellGroup = document.createElementNS(ns, 'g');
      cellGroup.setAttribute('transform', `translate(${cell.x}, ${cell.y})`);

      // Grid (for non-line types)
      if (config.gridType !== 'line' && config.gridType !== 'verticalLine') {
        const gridCell = createGridCell(
          config.gridType,
          gridSizeMm,
          config.gridLineColor,
          config.gridLineWidth
        );
        cellGroup.appendChild(gridCell);
      }

      // Character rendering
      const isLineGrid = config.gridType === 'line';
      const isVerticalLine = config.gridType === 'verticalLine';
      const colW = row.colWidth ?? (config.verticalColWidth ?? 16);
      const charW = row.lineCharWidth ?? 13.5;
      const stepW = row.lineCharStep ?? charW;
      const baseLineH = layout.rowHeightMm - layout.pinyinRowHeight;
      const fontScale = (config.fontSize ?? 0.85) / 0.85;
      const renderCharSize = isVerticalLine
        ? colW * 0.85 * config.fontSize
        : isLineGrid
          ? baseLineH * 0.88 * Math.min(fontScale, 1.15)
          : gridSizeMm;

      const strokeData = cell.character ? getCachedStrokeData(cell.character) : null;
      if (cell.type === 'strokeStep' && cell.character && strokeData) {
        const svgMarkup = generateStrokeStepSVG(
          strokeData.strokes,
          cell.strokeStepIndex ?? 0,
          gridSizeMm,
          {
            strokeColor: '#64748b',
            opacity: cell.opacity,
            fitInnerBox: isHuiGrid,
            fillStyle: cell.fillStyle,
            strokeDash: getFillStyleDash(cell.fillStyle),
          }
        );
        const tempG = document.createElementNS(ns, 'g');
        tempG.innerHTML = svgMarkup;
        while (tempG.firstChild) {
          cellGroup.appendChild(tempG.firstChild);
        }
      } else if (cell.character && strokeData && cell.opacity > 0 && (!config.fontFamily || config.fontFamily.includes('STKaiti') || config.fontFamily === "'LXGW WenKai', 'KaiTi', '楷体', 'STKaiti', serif")) {
        const xOffset = isVerticalLine
          ? Math.max(0, (colW - renderCharSize) / 2)
          : isLineGrid
            ? Math.max(0, (stepW - renderCharSize) / 2)
            : 0;
        const yOffset = isVerticalLine
          ? Math.max(0, (colW * 1.12 - renderCharSize) / 2)
          : isLineGrid
            ? Math.max(0, baseLineH - renderCharSize - 0.6)
            : 0;
        const charColor = cell.type === 'trace' ? '#64748b' : (config.fontColor || '#1e293b');
        const svgMarkup = generateFullCharSVG(
          strokeData.strokes,
          renderCharSize,
          {
            color: charColor,
            opacity: cell.opacity,
            fitInnerBox: isHuiGrid,
            fillStyle: cell.fillStyle,
            strokeDash: getFillStyleDash(cell.fillStyle),
          }
        );
        const tempG = document.createElementNS(ns, 'g');
        if (xOffset > 0 || yOffset > 0) {
          tempG.setAttribute('transform', `translate(${xOffset}, ${yOffset})`);
        }
        tempG.innerHTML = svgMarkup;
        while (tempG.firstChild) {
          cellGroup.appendChild(tempG.firstChild);
        }
      } else if (cell.character && cell.opacity > 0) {
        const txt = document.createElementNS(ns, 'text');
        if (isVerticalLine) {
          const isCornerPunct = cell.character === '，' || cell.character === '。' || cell.character === '、' || cell.character === '：' || cell.character === '；';
          const punctShiftX = isCornerPunct ? renderCharSize * 0.25 : 0;
          const punctShiftY = isCornerPunct ? -renderCharSize * 0.20 : 0;
          txt.setAttribute('x', String(colW / 2 + punctShiftX));
          txt.setAttribute('y', String(colW * 1.12 / 2 + punctShiftY));
          txt.setAttribute('text-anchor', 'middle');
          txt.setAttribute('dominant-baseline', 'central');
          txt.setAttribute('font-family', config.fontFamily || "'LXGW WenKai', 'KaiTi', serif");
          txt.setAttribute('font-size', String(renderCharSize * 0.9));
        } else if (isLineGrid) {
          txt.setAttribute('x', String(stepW * 0.5));
          txt.setAttribute('y', String(baseLineH - 1.6));
          txt.setAttribute('text-anchor', 'middle');
          txt.setAttribute('font-family', config.fontFamily || "'LXGW WenKai', 'KaiTi', serif");
          txt.setAttribute('font-size', String(renderCharSize * 0.95));
        } else {
          const isVerticalBox =
            config.gridType === 'verticalSquare' ||
            config.gridType === 'verticalTian' ||
            config.gridType === 'verticalMi' ||
            config.gridType === 'verticalHui' ||
            config.gridType === 'verticalOHoi';
          const isCornerPunct = cell.character === '，' || cell.character === '。' || cell.character === '、' || cell.character === '：' || cell.character === '；';
          const punctShiftX = (isVerticalBox && isCornerPunct) ? charFontSize * 0.25 : 0;
          const punctShiftY = (isVerticalBox && isCornerPunct) ? -charFontSize * 0.20 : 0;
          txt.setAttribute('x', String(gridSizeMm / 2 + punctShiftX));
          txt.setAttribute('y', String(gridSizeMm / 2 - gridSizeMm * 0.02 + punctShiftY));
          txt.setAttribute('text-anchor', 'middle');
          txt.setAttribute('dominant-baseline', 'central');
          txt.setAttribute('font-family', config.fontFamily || "'LXGW WenKai', 'KaiTi', serif");
          txt.setAttribute('font-size', String(charFontSize));
        }
        txt.setAttribute('font-weight', String(config.fontWeight));
        txt.setAttribute('fill', cell.type === 'trace' ? '#64748b' : config.fontColor);
        txt.setAttribute('opacity', String(cell.opacity));
        txt.textContent = cell.character;
        cellGroup.appendChild(txt);
      }

      contentGroup.appendChild(cellGroup);
    }
  }

  svg.appendChild(contentGroup);

  // Page number
  const pageNum = document.createElementNS(ns, 'text');
  pageNum.setAttribute('x', String(paperWidth - margins.right));
  pageNum.setAttribute('y', String(paperHeight - margins.bottom / 2));
  pageNum.setAttribute('text-anchor', 'end');
  pageNum.setAttribute('font-family', 'sans-serif');
  pageNum.setAttribute('font-size', '2.5');
  pageNum.setAttribute('fill', '#94a3b8');
  pageNum.textContent = String(pageIndex + 1);
  svg.appendChild(pageNum);

  return svg;
}

/**
 * Export the worksheet as PDF.
 * Returns a Blob of the PDF file.
 */
export async function exportPdf(
  config: WorksheetConfig,
  layout: LayoutResult
): Promise<void> {
  // Load font
  const fontBase64 = await loadFontBase64();

  const { paperWidth, paperHeight } = layout;
  const orientation = config.orientation === 'landscape' ? 'l' : 'p';

  // Create jsPDF document with exact mm dimensions
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [paperWidth, paperHeight],
    compress: true,
  });

  // Register font
  doc.addFileToVFS('LXGWWenKai-Regular.ttf', fontBase64);
  doc.addFont('LXGWWenKai-Regular.ttf', 'LXGW WenKai', 'normal');

  // Render each page
  for (let i = 0; i < layout.pages.length; i++) {
    if (i > 0) {
      doc.addPage([paperWidth, paperHeight], orientation);
    }

    // Create SVG for this page
    const svgElement = createPageSVG(i, config, layout);

    // Use svg2pdf.js to render SVG into the PDF page
    await doc.svg(svgElement, {
      x: 0,
      y: 0,
      width: paperWidth,
      height: paperHeight,
    });
  }

  // Generate filename
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `luyen-viet-${dateStr}.pdf`;

  // Download
  doc.save(fileName);
}

/**
 * Print the current worksheet.
 * Opens the browser print dialog.
 */
export function printWorksheet(): void {
  window.print();
}
