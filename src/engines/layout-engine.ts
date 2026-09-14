/**
 * Layout Engine
 * 
 * Calculates the physical layout of a worksheet:
 * - How many columns/rows fit on a page
 * - Where each character cell is positioned (in mm)
 * - Automatic pagination
 * - Header/pinyin row height accounting
 */

import { pinyin } from 'pinyin-pro';
import type {
  WorksheetConfig,
  LayoutResult,
  PageLayout,
  CharacterRow,
  CellData,
  FillStyle,
  Margins,
  PaperSize,
  PracticeMode,
} from '../types';
import { FILL_STYLES } from '../types';

import { getStrokeCount } from './stroke-engine';
import { getBasicStroke, ALL_NQEZ_STROKES_TOKENS } from '../data/basic-strokes';
import { getCharacterRadical, getCharacterStructure, getRadicalFullDetail, getRadicalVariant, getRadicalStrokeCountStatic } from '../data/cjk-radicals';

const HEADER_HEIGHT_MM = 18; // Fixed header area height
const PINYIN_ROW_HEIGHT_MM = 3.5; // Compact height above row for pinyin
const ROW_GAP_MM = 0; // Gap between rows (grid cells are flush)

// ============================================================
// Core Layout Calculation
// ============================================================

/**
 * Get effective paper dimensions after applying orientation
 */
function getEffectivePaperDimensions(
  paper: PaperSize,
  orientation: 'portrait' | 'landscape'
): { width: number; height: number } {
  if (orientation === 'landscape') {
    return { width: paper.height, height: paper.width };
  }
  return { width: paper.width, height: paper.height };
}

/**
 * Calculate the usable area after margins
 */
function getUsableArea(
  paperWidth: number,
  paperHeight: number,
  margins: Margins
): { width: number; height: number } {
  return {
    width: paperWidth - margins.left - margins.right,
    height: paperHeight - margins.top - margins.bottom,
  };
}

/**
 * Extract unique characters from input string (ignoring whitespace/punctuation)
 */
function extractCharacters(input: string, practiceMode?: string): string[] {
  if (!input) return [];

  // Match parenthesized stroke tokens like (短横), (长横) OR CJK characters
  const nqezRegex = /\([\u4e00-\u9fff]+\)|（[\u4e00-\u9fff]+）|[\u4e00-\u9fff\u3400-\u4dbf\u31c0-\u31ef\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\u{2ceb0}-\u{2ebef}\u{30000}-\u{3134f}]/gu;
  const nqezMatches = input.match(nqezRegex);
  if (nqezMatches && nqezMatches.length > 0) {
    return nqezMatches;
  }

  if (practiceMode === 'basicStroke') {
    const tokens = input.trim().split(/[\s,]+/).filter(Boolean);
    if (tokens.length > 0) return tokens;
  }

  return input.trim().split(/[\s,]+/).filter(Boolean);
}

const HALFWIDTH_TO_FULLWIDTH_MAP: Record<string, string> = {
  ',': '，',
  '.': '。',
  '!': '！',
  '?': '？',
  ':': '：',
  ';': '；',
  '(': '（',
  ')': '）',
  '[': '【',
  ']': '】',
  '<': '《',
  '>': '》',
};

export const CHINESE_PUNCTUATION = new Set([
  '，', '。', '！', '？', '、', '：', '；',
  '“', '”', '‘', '’', '《', '》', '〈', '〉',
  '（', '）', '【', '】', '〔', '〕',
  '…', '—', '～',
]);

export const CANNOT_START_LINE = new Set([
  '，', '。', '！', '？', '、', '：', '；',
  '”', '’', '）', '》', '】', '〕', '〉',
  '…', '—', '～',
]);

export const CANNOT_END_LINE = new Set([
  '“', '‘', '（', '《', '【', '〔', '〈',
]);

export function isChinesePunctuation(char: string): boolean {
  return CHINESE_PUNCTUATION.has(char);
}

/**
 * Extract tokens for flow/paragraph/sentence mode, preserving Chinese punctuation
 * and normalizing half-width punctuation marks.
 */
export function extractParagraphTokens(text: string): string[] {
  // Normalize multiple dots to Chinese ellipsis
  let s = text.replace(/\.{3,}/g, '……');

  // Normalize quotes and half-width punctuation
  let inDoubleQuote = false;
  let inSingleQuote = false;
  let normalized = '';
  for (const ch of s) {
    if (ch === '"') {
      normalized += inDoubleQuote ? '”' : '“';
      inDoubleQuote = !inDoubleQuote;
    } else if (ch === '\'') {
      normalized += inSingleQuote ? '’' : '‘';
      inSingleQuote = !inSingleQuote;
    } else if (HALFWIDTH_TO_FULLWIDTH_MAP[ch]) {
      normalized += HALFWIDTH_TO_FULLWIDTH_MAP[ch];
    } else {
      normalized += ch;
    }
  }

  const tokens: string[] = [];
  const charArray = Array.from(normalized);
  for (let i = 0; i < charArray.length; i++) {
    const ch = charArray[i];
    if (ch === '\r') continue;

    // Check if CJK character
    const isCJK = /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\u{2ceb0}-\u{2ebef}\u{30000}-\u{3134f}]/u.test(ch);
    const isPunct = CHINESE_PUNCTUATION.has(ch);
    const isAlphanumeric = /[0-9a-zA-Z０-９]/.test(ch);

    if (isCJK || isPunct || isAlphanumeric) {
      tokens.push(ch);
    } else if (ch === ' ') {
      // Keep space only if previous character is not punctuation and not already a space
      const prev = tokens[tokens.length - 1];
      if (prev && !isChinesePunctuation(prev) && prev !== ' ') {
        tokens.push(' ');
      }
    }
  }

  return tokens;
}

/**
 * Get pinyin for a character or basic stroke
 */
function getPinyin(char: string, withTone: boolean): string {
  if (isChinesePunctuation(char)) return '';
  const basicStroke = getBasicStroke(char);
  if (basicStroke) {
    return basicStroke.pinyin;
  }
  try {
    const result = pinyin(char, {
      toneType: withTone ? 'symbol' : 'none',
      type: 'array',
    });
    return result[0] || '';
  } catch {
    return '';
  }
}

/**
 * Get opacity for a fill style
 */
function getOpacityForStyle(style: FillStyle, configOpacity: number): number {
  if (style === 'empty') return 0;
  if (style === 'solid') return 1.0;
  return Math.max(0, Math.min(1.0, configOpacity ?? 0.35));
}

/**
 * Compute vertical layout for vertical ruled lines (竖线格) and vertical square grids (竖排方格).
 * Writing rule: Top to bottom within each column, columns advance left to right (从上到下，从左到右).
 */
function computeVerticalLayout(
  config: WorksheetConfig,
  usableWidth: number,
  usableHeight: number,
  paperWidth: number,
  paperHeight: number,
  headerHeight: number,
  showPinyin: boolean
): LayoutResult {
  const isVerticalBoxGrid =
    config.gridType === 'verticalSquare' ||
    config.gridType === 'verticalTian' ||
    config.gridType === 'verticalMi' ||
    config.gridType === 'verticalHui' ||
    config.gridType === 'verticalOHoi';
  const availableH = usableHeight - headerHeight;

  // 1. Grid geometry & spacing
  let cellSize: number;
  let colWidth: number;
  let colsPerPage: number;
  let charsPerCol: number;
  let charStep: number;
  let startX: number;
  let startY: number;

  if (isVerticalBoxGrid) {
    // Vertical square/tian/mi/hui grid: user chooses rows per column (default 12) + column gap (default 3mm)
    const colGap = Math.max(0, config.columnGapMm ?? 3.0);
    charsPerCol = Math.max(6, Math.min(25, config.verticalRowsPerCol ?? 12));
    cellSize = availableH / charsPerCol;
    // Calculate how many columns fit with colGap between each column
    colsPerPage = Math.max(1, Math.floor((usableWidth + colGap) / (cellSize + colGap)));
    const gridW = colsPerPage * cellSize + (colsPerPage - 1) * colGap;
    startX = (usableWidth - gridW) / 2;
    startY = headerHeight;
    colWidth = cellSize;
    charStep = cellSize;
  } else {
    // Vertical ruled lines: user adjusts column width / character size (default 16mm)
    colWidth = Math.max(8, Math.min(35, config.verticalColWidth ?? 16));
    colsPerPage = Math.max(1, Math.floor(usableWidth / colWidth));
    const gridW = colsPerPage * colWidth;
    startX = (usableWidth - gridW) / 2;
    charStep = colWidth * 1.12;
    charsPerCol = Math.max(1, Math.floor(availableH / charStep));
    const totalColH = charsPerCol * charStep;
    startY = headerHeight + (availableH - totalColH) / 2;
    cellSize = colWidth;
  }

  const colGap = isVerticalBoxGrid ? Math.max(0, config.columnGapMm ?? 3.0) : 0;
  const colStep = colWidth + colGap;

  // 2. Parse text lines & tokens
  const rawParagraphs = config.characters.split(/\r?\n/);
  const isBlank = config.blankPaper || config.characters.trim().length === 0;

  const pages: PageLayout[] = [];
  let currentPageCols: CharacterRow[] = [];
  let currentColCells: CellData[] = [];
  let colIdxOnPage = 0;

  function finalizeColumn() {
    // Fill remainder of this column with empty cells
    while (currentColCells.length < charsPerCol) {
      const rowIdx = currentColCells.length;
      currentColCells.push({
        character: '',
        type: 'empty',
        x: startX + colIdxOnPage * colStep,
        y: startY + rowIdx * charStep,
        opacity: 0,
        fillStyle: 'empty',
      });
    }
    currentPageCols.push({
      character: currentColCells.find(c => c.character)?.character || '',
      cells: currentColCells,
      y: startY,
      rowHeight: isVerticalBoxGrid ? availableH : (charsPerCol * charStep),
      isVerticalCol: true,
      colWidth,
    });
    currentColCells = [];
    colIdxOnPage++;

    if (colIdxOnPage >= colsPerPage) {
      pages.push({
        pageIndex: pages.length,
        rows: currentPageCols,
        headerHeight,
      });
      currentPageCols = [];
      colIdxOnPage = 0;
    }
  }

  if (isBlank) {
    for (let c = 0; c < colsPerPage; c++) {
      finalizeColumn();
    }
  } else {
    for (const para of rawParagraphs) {
      const tokens = extractParagraphTokens(para);
      if (tokens.length === 0) {
        // Empty paragraph line: start new column
        if (currentPageCols.length > 0 || currentColCells.length > 0) {
          finalizeColumn();
        }
        continue;
      }

      for (const tok of tokens) {
        const isPunct = isChinesePunctuation(tok);
        const isSpace = tok === ' ';
        const tokPinyin = (!isPunct && !isSpace && showPinyin) ? getPinyin(tok, config.pinyinWithTone) : undefined;

        // Trace option: showTrace can be true (faint trace for handwriting practice) or false (sample / blank)
        const isTrace = config.showTrace !== false;
        const isSolid = config.fillStyle === 'solid';
        const cellType = isSpace ? 'empty' : (isTrace && !isSolid ? 'trace' : 'sample');
        const opacity = isSpace ? 0 : (isTrace && !isSolid ? getOpacityForStyle(config.fillStyle, config.fontOpacity) : 1.0);

        const rowIdx = currentColCells.length;
        currentColCells.push({
          character: isSpace ? '' : tok,
          type: cellType,
          x: startX + colIdxOnPage * colStep,
          y: startY + rowIdx * charStep,
          pinyin: tokPinyin,
          opacity,
          fillStyle: isTrace ? config.fillStyle : 'solid',
        });

        if (currentColCells.length >= charsPerCol) {
          finalizeColumn();
        }
      }

      // Newline advances to next column
      if (currentColCells.length > 0) {
        finalizeColumn();
      }
    }

    // Fill remaining page or extra columns if requested
    if (config.fillRemainingPage !== false) {
      while (colIdxOnPage > 0 && colIdxOnPage < colsPerPage) {
        finalizeColumn();
      }
    } else {
      if (currentColCells.length > 0) {
        finalizeColumn();
      }
      const extraEmptyCols = config.extraEmptyRows ?? 0;
      for (let ec = 0; ec < extraEmptyCols && colIdxOnPage < colsPerPage; ec++) {
        finalizeColumn();
      }
    }
  }

  if (currentPageCols.length > 0) {
    pages.push({
      pageIndex: pages.length,
      rows: currentPageCols,
      headerHeight,
    });
  }

  if (pages.length === 0) {
    pages.push({
      pageIndex: 0,
      rows: [],
      headerHeight,
    });
  }

  const characters = extractCharacters(config.characters, config.practiceMode);

  return {
    columns: colsPerPage,
    rowsPerPage: charsPerCol,
    pages,
    usableWidth,
    usableHeight,
    paperWidth,
    paperHeight,
    gridSizeMm: cellSize,
    rowHeightMm: availableH,
    pinyinRowHeight: 0,
    headerHeight,
    totalCharacters: characters.length,
  };
}

/**
 * Main layout computation function.
 * Pure function — no side effects.
 */
export function computeLayout(config: WorksheetConfig): LayoutResult {
  const { width: paperWidth, height: paperHeight } = getEffectivePaperDimensions(
    config.paperSize,
    config.orientation
  );

  const { width: usableWidth, height: usableHeight } = getUsableArea(
    paperWidth,
    paperHeight,
    config.margins
  );

  const headerHeight = config.showHeader ? HEADER_HEIGHT_MM : 0;
  const showPinyin = config.showPinyin;
  const pinyinDistance = Math.max(0, config.pinyinDistance ?? 0);

  // Check for vertical writing modes: Kẻ dọc (verticalLine) & các loại ô dọc (verticalSquare, verticalTian, verticalMi, verticalHui)
  if (
    config.gridType === 'verticalLine' ||
    config.gridType === 'verticalSquare' ||
    config.gridType === 'verticalTian' ||
    config.gridType === 'verticalMi' ||
    config.gridType === 'verticalHui' ||
    config.gridType === 'verticalOHoi'
  ) {
    return computeVerticalLayout(
      config,
      usableWidth,
      usableHeight,
      paperWidth,
      paperHeight,
      headerHeight,
      showPinyin
    );
  }

  let pinyinRowHeight = showPinyin ? (PINYIN_ROW_HEIGHT_MM + pinyinDistance) : 0;

  // Grid dimensions per grid type
  let columns: number;
  let gridSize: number;
  let effectiveRowHeight: number;

  const isPinyinBoxGrid = ['tian', 'mi', 'hui', 'oHoi'].includes(config.gridType) && showPinyin;
  const isBoxGrid = ['square', 'tian', 'mi', 'hui', 'oHoi'].includes(config.gridType);

  if (isBoxGrid) {
    // Square / Tian / Mi / Hui / oHoi grids: customize columns per row (4 to 20), span 100% of usableWidth
    const defaultCols = (config.gridType === 'hui' || config.gridType === 'oHoi') ? 11 : (config.gridType === 'square' ? 14 : 12);
    columns = (config.columnsPerRow && config.columnsPerRow >= 4 && config.columnsPerRow <= 25)
      ? config.columnsPerRow
      : defaultCols;
    gridSize = usableWidth / columns;

    const userRowGap = config.gridType === 'oHoi'
      ? (config.rowGapMm !== undefined ? config.rowGapMm : 0)
      : Math.max(0, config.rowGapMm ?? 2.5);

    if (isPinyinBoxGrid) {
      // Integrated 4-line Pinyin Header Box attached above cell (Image 2)
      pinyinRowHeight = Math.max(5.5, gridSize * 0.38) + pinyinDistance;
      const rowGap = config.rowGapMm !== undefined ? config.rowGapMm : 3.0; // visible gap between card rows
      effectiveRowHeight = gridSize + pinyinRowHeight + rowGap;
    } else if (config.gridType === 'square' && showPinyin) {
      // Square with floating Pinyin outside above the box
      pinyinRowHeight = Math.max(4.0, gridSize * 0.28) + pinyinDistance;
      const rowGap = config.rowGapMm !== undefined ? config.rowGapMm : 4.0;
      effectiveRowHeight = gridSize + pinyinRowHeight + rowGap;
    } else {
      pinyinRowHeight = 0;
      effectiveRowHeight = gridSize + userRowGap;
    }
  } else if (config.gridType === 'line') {
    // Notebook horizontal ruled line mode: 1 wide column = full usable width
    // lineRowHeight (mm) controls both character size and line spacing.
    // When pinyin enabled: total row = lineRowHeight * 1.5 (top 0.5 for pinyin, bottom 1.0 for hanzi)
    // When pinyin off: row = lineRowHeight
    columns = 1;
    const baseH = Math.max(8, Math.min(30, config.lineRowHeight ?? 13));
    if (showPinyin) {
      pinyinRowHeight = baseH * 0.5;
      effectiveRowHeight = baseH + pinyinRowHeight; // = 1.5 * baseH
    } else {
      pinyinRowHeight = 0;
      effectiveRowHeight = baseH;
    }
    gridSize = usableWidth; // one full-width "cell" per row
  } else {
    const userRowGap = Math.max(0, config.rowGapMm ?? 2.5);
    gridSize = config.gridSizeMm;
    columns = Math.max(1, Math.floor(usableWidth / gridSize));
    effectiveRowHeight = gridSize + pinyinRowHeight + userRowGap;
  }

  const availableHeightForRows = usableHeight - headerHeight;
  const effectiveGap = config.rowGapMm ?? 2.5;
  const rowsPerPage = Math.max(1, Math.floor((availableHeightForRows + effectiveGap) / effectiveRowHeight));

  // Extract characters
  const characters = extractCharacters(config.characters, config.practiceMode);
  const totalCellsPerChar = config.sampleCount + config.traceCount + config.emptyCount;

  // Build character rows
  const allRows: CharacterRow[] = [];

  if (config.blankPaper || characters.length === 0) {
    // Blank Grid Paper Mode: fill the entire page with empty grid cells
    for (let r = 0; r < rowsPerPage; r++) {
      const emptyRow: CharacterRow = {
        character: '',
        cells: [],
        y: 0,
        rowHeight: effectiveRowHeight,
      };
      for (let col = 0; col < columns; col++) {
        emptyRow.cells.push({
          character: '',
          type: 'empty',
          x: col * gridSize,
          y: 0,
          opacity: 0,
          fillStyle: 'empty',
        });
      }
      allRows.push(emptyRow);
    }
  } else if (config.gridType === 'line') {
    // Horizontal ruled line mode — two sub-modes:
    // (A) Flow/sentence modes (vocabulary, sentence, paragraph, pinyin, pinyinMeaning):
    //     chars + punctuation are grouped into lines; 1 sample row + 1 trace row per line
    // (B) Practice modes (single, stroke, radical, basicStroke):
    //     1 char per line (as a sample mẫu), remaining space blank
    const flowModes: PracticeMode[] = ['vocabulary', 'sentence', 'paragraph', 'pinyin', 'pinyinMeaning', 'pinyinDictation'];
    // For line grid: if mode is in flowModes, or if input has multiple characters/spaces/newlines, format as continuous ruled lines (Image 1)
    const isFlowMode = flowModes.includes(config.practiceMode as PracticeMode) ||
      (config.gridType === 'line' && (characters.length > 1 || config.characters.includes(' ') || config.characters.includes('\n') || config.characters.length > 1));

    if (isFlowMode) {
      // Cell horizontal step = charW must match renderCharSize used in WorksheetPage
      // Must account for config.fontSize since larger fonts need more horizontal space
      const baseH = Math.max(8, Math.min(30, config.lineRowHeight ?? 13));
      // Normalize font scale so default 0.85 = 1.0 (large, filling ~88% of line height)
      const fontScale = (config.fontSize ?? 0.85) / 0.85;
      const charW = baseH * 0.88 * Math.min(fontScale, 1.15);
      // Extra horizontal spacing per character (from pinyinLineSpacing slider)
      const extraSpacing = config.pinyinLineSpacing ?? 0;
      const charStep = Math.max(charW * 0.7, charW + extraSpacing);

      // Usable width safety buffer: leave 4mm on the right margin for stroke flourishes and wide punctuation
      const maxAllowedWidth = Math.max(charW, usableWidth - 4);
      const charsPerLine = Math.max(1, Math.floor((maxAllowedWidth - charW) / charStep) + 1);

      // Split input by newlines to respect paragraph breaks
      const rawParagraphs = config.characters.split(/\r?\n/).filter(p => p.trim().length > 0);
      const paragraphs = rawParagraphs.length > 0 ? rawParagraphs : [config.characters];

      for (const paraText of paragraphs) {
        const tokens = extractParagraphTokens(paraText);
        if (tokens.length === 0) continue;

        // Group tokens into lines of charsPerLine with Kinsoku Shori (punctuation line-breaking) rules
        let i = 0;
        while (i < tokens.length) {
          let count = Math.min(charsPerLine, tokens.length - i);

          // If the next token cannot start a line (e.g. ，。！？), pull back 1 token
          if (i + count < tokens.length && CANNOT_START_LINE.has(tokens[i + count]) && count > 1) {
            count--;
          }
          // If the last token of this line cannot end a line (e.g. “（《), push it to next line
          if (count > 1 && CANNOT_END_LINE.has(tokens[i + count - 1])) {
            count--;
          }

          const lineTokens = tokens.slice(i, i + count);
          i += count;

          const isPinyinArticle = showPinyin || config.practiceMode === 'pinyinDictation';
          const shouldHideTrace = config.showTrace === false;

          const sampleRowsCount = Math.max(0, config.sampleCount ?? 1);
          const traceRowsCount = Math.max(0, config.traceCount ?? 1);
          const emptyRowsCount = Math.max(0, config.emptyRows ?? 0);

          if (isPinyinArticle) {
            // Pinyin article / dictation mode on ruled lines (Image 1):
            // 1) Sample rows (with Pinyin)
            for (let s = 0; s < sampleRowsCount; s++) {
              const lineCells: CellData[] = lineTokens.map((tok, idx) => {
                const isPunct = isChinesePunctuation(tok);
                const isSpace = tok === ' ';
                const tokPinyin = (!isPunct && !isSpace) ? getPinyin(tok, config.pinyinWithTone) : undefined;
                return {
                  character: isSpace ? '' : tok,
                  type: isSpace ? 'empty' : 'sample',
                  x: idx * charStep,
                  y: 0,
                  pinyin: tokPinyin,
                  opacity: isSpace ? 0 : 1.0,
                  fillStyle: 'solid',
                };
              });

              allRows.push({
                character: lineTokens[0] || '',
                cells: lineCells,
                y: 0,
                rowHeight: effectiveRowHeight,
                isLineRow: true,
                lineCharWidth: charW,
                lineCharStep: charStep,
              });
            }

            // 2) Trace rows (with Pinyin)
            for (let t = 0; t < traceRowsCount; t++) {
              const lineCells: CellData[] = lineTokens.map((tok, idx) => {
                const isPunct = isChinesePunctuation(tok);
                const isSpace = tok === ' ';
                const tokPinyin = (!isPunct && !isSpace) ? getPinyin(tok, config.pinyinWithTone) : undefined;
                const isEmpty = isSpace || shouldHideTrace;
                return {
                  character: isEmpty ? '' : tok,
                  type: isSpace ? 'empty' : (shouldHideTrace ? 'empty' : 'trace'),
                  x: idx * charStep,
                  y: 0,
                  pinyin: tokPinyin,
                  opacity: isEmpty ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
                  fillStyle: config.fillStyle,
                };
              });

              allRows.push({
                character: lineTokens[0] || '',
                cells: lineCells,
                y: 0,
                rowHeight: effectiveRowHeight,
                isLineRow: true,
                lineCharWidth: charW,
                lineCharStep: charStep,
              });
            }

            // 3) Empty practice rows ("Thêm hàng")
            for (let e = 0; e < emptyRowsCount; e++) {
              allRows.push({
                character: '',
                cells: [{
                  character: '',
                  type: 'empty',
                  x: 0,
                  y: 0,
                  opacity: 0,
                  fillStyle: 'empty',
                }],
                y: 0,
                rowHeight: effectiveRowHeight,
                isLineRow: true,
                lineCharWidth: charW,
                lineCharStep: charStep,
              });
            }
          } else {
            // Standard mode without Pinyin:
            // 1) Sample rows
            for (let s = 0; s < sampleRowsCount; s++) {
              const sampleCells: CellData[] = lineTokens.map((tok, idx) => {
                const isPunct = isChinesePunctuation(tok);
                const isSpace = tok === ' ';
                return {
                  character: isSpace ? '' : tok,
                  type: isSpace ? 'empty' : 'sample',
                  x: idx * charStep,
                  y: 0,
                  opacity: isSpace ? 0 : 1.0,
                  fillStyle: 'solid',
                };
              });
              allRows.push({
                character: lineTokens[0] || '',
                cells: sampleCells,
                y: 0,
                rowHeight: effectiveRowHeight,
                isLineRow: true,
                lineCharWidth: charW,
                lineCharStep: charStep,
              });
            }

            // 2) Trace rows
            for (let t = 0; t < traceRowsCount; t++) {
              const traceCells: CellData[] = lineTokens.map((tok, idx) => {
                const isSpace = tok === ' ';
                const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
                return {
                  character: isSpace || isEmptyStyle ? '' : tok,
                  type: isSpace || isEmptyStyle ? 'empty' : 'trace',
                  x: idx * charStep,
                  y: 0,
                  opacity: isSpace || isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
                  fillStyle: config.fillStyle,
                };
              });
              allRows.push({
                character: lineTokens[0] || '',
                cells: traceCells,
                y: 0,
                rowHeight: effectiveRowHeight,
                isLineRow: true,
                lineCharWidth: charW,
                lineCharStep: charStep,
              });
            }

            // 3) Empty practice rows ("Thêm hàng")
            for (let e = 0; e < emptyRowsCount; e++) {
              allRows.push({
                character: '',
                cells: [{
                  character: '',
                  type: 'empty',
                  x: 0,
                  y: 0,
                  opacity: 0,
                  fillStyle: 'empty',
                }],
                y: 0,
                rowHeight: effectiveRowHeight,
                isLineRow: true,
                lineCharWidth: charW,
                lineCharStep: charStep,
              });
            }
          }
        }
      }
    } else {
      // Practice mode: 1 char per line (char on left, rest blank for student to write)
      const sampleRowsCount = Math.max(0, config.sampleCount ?? 1);
      const traceRowsCount = Math.max(0, config.traceCount ?? 1);
      const emptyRowsCount = Math.max(0, config.emptyRows ?? 0);
      const shouldHideTrace = config.showTrace === false;

      for (const char of characters) {
        const charPinyin = showPinyin ? getPinyin(char, config.pinyinWithTone) : undefined;
        // Sample rows
        for (let s = 0; s < sampleRowsCount; s++) {
          allRows.push({
            character: char,
            pinyin: charPinyin,
            cells: [{
              character: char,
              type: 'sample',
              x: 0,
              y: 0,
              pinyin: charPinyin,
              opacity: 1.0,
              fillStyle: 'solid',
            }],
            y: 0,
            rowHeight: effectiveRowHeight,
            isLineRow: true,
          });
        }
        // Trace rows
        for (let t = 0; t < traceRowsCount; t++) {
          allRows.push({
            character: char,
            pinyin: charPinyin,
            cells: [{
              character: shouldHideTrace ? '' : char,
              type: shouldHideTrace ? 'empty' : 'trace',
              x: 0,
              y: 0,
              pinyin: charPinyin,
              opacity: shouldHideTrace ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
              fillStyle: config.fillStyle,
            }],
            y: 0,
            rowHeight: effectiveRowHeight,
            isLineRow: true,
          });
        }
        // Empty rows ("Thêm hàng")
        for (let e = 0; e < emptyRowsCount; e++) {
          allRows.push({
            character: '',
            cells: [{
              character: '',
              type: 'empty',
              x: 0,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            }],
            y: 0,
            rowHeight: effectiveRowHeight,
            isLineRow: true,
          });
        }
      }
    }

  } else if (config.practiceMode === 'basicStroke') {
    // Basic Strokes Mode (Luyện nét cơ bản): 1 line per stroke!
    const effectiveChars = (characters.length > 0 && characters.some(c => !!getBasicStroke(c)))
      ? characters
      : extractCharacters(ALL_NQEZ_STROKES_TOKENS, 'basicStroke');
    for (const rawChar of effectiveChars) {
      const basic = getBasicStroke(rawChar);
      const strokeChar: string = basic ? (basic.nameZh || rawChar) : rawChar;
      const charPinyin = basic
        ? (showPinyin ? `${basic.pinyin} (${basic.nameVi})` : undefined)
        : (showPinyin ? getPinyin(strokeChar, config.pinyinWithTone) : undefined);
      const charCells: CellData[] = [];

      const sampleCount = Math.max(0, config.sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        charCells.push({
          character: strokeChar,
          type: 'sample',
          x: 0,
          y: 0,
          pinyin: i === 0 ? charPinyin : undefined,
          opacity: 1.0,
          fillStyle: 'solid',
        });
      }

      for (let t = 0; t < config.traceCount; t++) {
        const isEmptyStyle = config.fillStyle === 'empty';
        charCells.push({
          character: isEmptyStyle ? '' : strokeChar,
          type: isEmptyStyle ? 'empty' : 'trace',
          x: 0,
          y: 0,
          pinyin: undefined,
          opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
          fillStyle: config.fillStyle,
        });
      }

      // Distribute into rows of `columns` cells
      for (let rStart = 0; rStart < charCells.length; rStart += columns) {
        const rowCells = charCells.slice(rStart, rStart + columns);
        while (rowCells.length < columns) {
          if (config.fillRowWithTrace) {
            const isEmptyStyle = config.fillStyle === 'empty';
            rowCells.push({
              character: isEmptyStyle ? '' : strokeChar,
              type: isEmptyStyle ? 'empty' : 'trace',
              x: 0,
              y: 0,
              pinyin: undefined,
              opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
              fillStyle: config.fillStyle,
            });
          } else {
            rowCells.push({
              character: '',
              type: 'empty',
              x: 0,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            });
          }
        }
        rowCells.forEach((cell, idx) => {
          cell.x = idx * gridSize;
        });
        allRows.push({
          character: strokeChar,
          pinyin: rStart === 0 ? charPinyin : undefined,
          cells: rowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }

      // Thêm hàng: Add dedicated full empty rows
      const emptyRowsCount = config.emptyRows ?? (config.emptyCount > 0 ? Math.max(1, Math.round(config.emptyCount / columns)) : 0);
      for (let er = 0; er < emptyRowsCount; er++) {
        const emptyRowCells: CellData[] = [];
        for (let col = 0; col < columns; col++) {
          emptyRowCells.push({
            character: '',
            type: 'empty',
            x: col * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          });
        }
        allRows.push({
          character: '',
          pinyin: undefined,
          cells: emptyRowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }
    }
  } else if (config.practiceMode === 'radical') {
    // 214 Radical Detail Mode (with stroke breakdown steps):
    // Breakdown rows dynamically adapt to column count, followed by trace rows & empty rows according to user settings
    for (const char of characters) {
      const charPinyin = showPinyin ? (getPinyin(char, config.pinyinWithTone) || '') : undefined;
      const radical = getCharacterRadical(char);
      const structure = getCharacterStructure(char);
      const strokeCount = Math.max(1, getRadicalStrokeCountStatic(char) ?? getStrokeCount(char));
      const variantChar = getRadicalVariant(char);
      const radicalDetail = getRadicalFullDetail(char);

      const charBlockRows: CharacterRow[] = [];
      const charCells: CellData[] = [];

      // 1) Sample cells: according to config.sampleCount (can be 0 or more)
      const sampleCount = Math.max(0, config.sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        charCells.push({
          character: char,
          type: 'sample',
          x: 0,
          y: 0,
          pinyin: i === 0 ? charPinyin : undefined,
          opacity: 1.0,
          fillStyle: 'solid',
        });
      }

      // 2) Stroke breakdown steps (step 0 to strokeCount - 1)
      const stepOpacity = getOpacityForStyle(config.fillStyle, config.fontOpacity);
      for (let s = 0; s < strokeCount; s++) {
        charCells.push({
          character: char,
          type: 'strokeStep',
          strokeStepIndex: s,
          x: 0,
          y: 0,
          pinyin: undefined,
          opacity: stepOpacity,
          fillStyle: config.fillStyle,
        });
      }

      // 3) Trace practice cells: according to config.traceCount
      const shouldHideTrace = config.showTrace === false;
      for (let t = 0; t < config.traceCount; t++) {
        const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
        charCells.push({
          character: isEmptyStyle ? '' : char,
          type: isEmptyStyle ? 'empty' : 'trace',
          x: 0,
          y: 0,
          pinyin: undefined,
          opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
          fillStyle: config.fillStyle,
        });
      }

      // Distribute charCells into rows of `columns` cells
      for (let rStart = 0; rStart < charCells.length; rStart += columns) {
        const rowCells = charCells.slice(rStart, rStart + columns);
        while (rowCells.length < columns) {
          if (config.fillRowWithTrace) {
            const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
            rowCells.push({
              character: isEmptyStyle ? '' : char,
              type: isEmptyStyle ? 'empty' : 'trace',
              x: 0,
              y: 0,
              pinyin: undefined,
              opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
              fillStyle: config.fillStyle,
            });
          } else {
            rowCells.push({
              character: '',
              type: 'empty',
              x: 0,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            });
          }
        }

        rowCells.forEach((c, idx) => {
          c.x = idx * gridSize;
        });

        charBlockRows.push({
          character: char,
          pinyin: rStart === 0 ? charPinyin : undefined,
          radical,
          structure,
          strokeCount,
          isRadicalBlock: rStart === 0,
          blockRowCount: 1,
          radicalDetail,
          variantChar,
          cells: rowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }

      // 4) Thêm hàng (emptyRows): Add full empty row(s) for handwriting practice
      const emptyRowsCount = config.emptyRows ?? 0;
      for (let er = 0; er < emptyRowsCount; er++) {
        const emptyRowCells: CellData[] = [];
        for (let col = 0; col < columns; col++) {
          emptyRowCells.push({
            character: '',
            type: 'empty',
            x: col * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          });
        }
        charBlockRows.push({
          character: '',
          pinyin: undefined,
          radical,
          structure,
          strokeCount,
          isRadicalBlock: false,
          blockRowCount: 1,
          radicalDetail,
          variantChar,
          cells: emptyRowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }

      // Ensure at least 1 row exists
      if (charBlockRows.length === 0) {
        const emptyRowCells: CellData[] = Array.from({ length: columns }, (_, col) => ({
          character: '',
          type: 'empty',
          x: col * gridSize,
          y: 0,
          opacity: 0,
          fillStyle: 'empty',
        }));
        charBlockRows.push({
          character: char,
          pinyin: charPinyin,
          radical,
          structure,
          strokeCount,
          isRadicalBlock: true,
          blockRowCount: 1,
          radicalDetail,
          variantChar,
          cells: emptyRowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }

      // Update blockRowCount for all rows in this character block to the exact row count
      const totalBlockRows = charBlockRows.length;
      charBlockRows.forEach((r, idx) => {
        r.blockRowCount = totalBlockRows;
        r.isRadicalBlock = (idx === 0);
      });
      allRows.push(...charBlockRows);

      // If the radical has a variant (biến thể), add a dedicated practice block for it
      if (variantChar) {
        const variantBlockRows: CharacterRow[] = [];
        const variantPinyin = showPinyin ? (getPinyin(variantChar, config.pinyinWithTone) || charPinyin) : undefined;
        const variantDetail = getRadicalFullDetail(variantChar);
        const variantStrokeCount = Math.max(1, getRadicalStrokeCountStatic(variantChar) ?? getStrokeCount(variantChar));

        const vCells: CellData[] = [];
        for (let i = 0; i < sampleCount; i++) {
          vCells.push({
            character: variantChar,
            type: 'sample',
            x: 0,
            y: 0,
            pinyin: i === 0 ? variantPinyin : undefined,
            opacity: 1.0,
            fillStyle: 'solid',
          });
        }

        for (let s = 0; s < variantStrokeCount; s++) {
          vCells.push({
            character: variantChar,
            type: 'strokeStep',
            strokeStepIndex: s,
            x: 0,
            y: 0,
            pinyin: undefined,
            opacity: stepOpacity,
            fillStyle: config.fillStyle,
          });
        }

        for (let t = 0; t < config.traceCount; t++) {
          const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
          vCells.push({
            character: isEmptyStyle ? '' : variantChar,
            type: isEmptyStyle ? 'empty' : 'trace',
            x: 0,
            y: 0,
            pinyin: undefined,
            opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
            fillStyle: config.fillStyle,
          });
        }

        for (let rStart = 0; rStart < vCells.length; rStart += columns) {
          const rowCells = vCells.slice(rStart, rStart + columns);
          while (rowCells.length < columns) {
            if (config.fillRowWithTrace) {
              const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
              rowCells.push({
                character: isEmptyStyle ? '' : variantChar,
                type: isEmptyStyle ? 'empty' : 'trace',
                x: 0,
                y: 0,
                pinyin: undefined,
                opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
                fillStyle: config.fillStyle,
              });
            } else {
              rowCells.push({
                character: '',
                type: 'empty',
                x: 0,
                y: 0,
                opacity: 0,
                fillStyle: 'empty',
              });
            }
          }

          rowCells.forEach((c, idx) => {
            c.x = idx * gridSize;
          });

          variantBlockRows.push({
            character: variantChar,
            pinyin: rStart === 0 ? variantPinyin : undefined,
            radical,
            structure,
            strokeCount: variantStrokeCount,
            isRadicalBlock: rStart === 0,
            blockRowCount: 1,
            radicalDetail: variantDetail,
            cells: rowCells,
            y: 0,
            rowHeight: effectiveRowHeight,
          });
        }

        for (let er = 0; er < emptyRowsCount; er++) {
          const emptyRowCells: CellData[] = [];
          for (let col = 0; col < columns; col++) {
            emptyRowCells.push({
              character: '',
              type: 'empty',
              x: col * gridSize,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            });
          }
          variantBlockRows.push({
            character: '',
            pinyin: undefined,
            radical,
            structure,
            strokeCount: variantStrokeCount,
            isRadicalBlock: false,
            blockRowCount: 1,
            radicalDetail: variantDetail,
            cells: emptyRowCells,
            y: 0,
            rowHeight: effectiveRowHeight,
          });
        }

        if (variantBlockRows.length === 0) {
          const emptyRowCells: CellData[] = Array.from({ length: columns }, (_, col) => ({
            character: '',
            type: 'empty',
            x: col * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          }));
          variantBlockRows.push({
            character: variantChar,
            pinyin: variantPinyin,
            radical,
            structure,
            strokeCount: variantStrokeCount,
            isRadicalBlock: true,
            blockRowCount: 1,
            radicalDetail: variantDetail,
            cells: emptyRowCells,
            y: 0,
            rowHeight: effectiveRowHeight,
          });
        }

        const totalVRows = variantBlockRows.length;
        variantBlockRows.forEach((r, idx) => {
          r.blockRowCount = totalVRows;
          r.isRadicalBlock = (idx === 0);
        });
        allRows.push(...variantBlockRows);
      }
    }
  } else if (config.practiceMode === 'stroke') {
    // Stroke order breakdown mode (Multi-line stroke breakdown algorithm):
    // For each character:
    //  - Col 0 is sample character (solid)
    //  - Cols 1 to columns - 1 are stroke breakdown steps (max 11 steps per row for 12 columns)
    //  - If character has <= 11 strokes:
    //      Row 1: Col 0 sample, Cols 1..N stroke steps, remaining cols filled with trace characters
    //      Row 2: Full row of trace characters for handwriting practice
    //      Total = 2 rows
    //  - If character has > 11 strokes:
    //      Row 1: Col 0 sample, Cols 1..11 stroke steps 1..11
    //      Row 2: Col 0 sample, Cols 1..(N-11) stroke steps 12..N, remaining cols filled with trace characters
    //      Row 3: Full row of trace characters for handwriting practice
    //      Total = 3 rows
    for (const char of characters) {
      const charPinyin = showPinyin ? getPinyin(char, config.pinyinWithTone) : undefined;
      const strokeCount = Math.max(1, getStrokeCount(char));
      const charCells: CellData[] = [];

      // 1) Sample cells: according to config.sampleCount (at least 1)
      const sampleCount = Math.max(1, config.sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        charCells.push({
          character: char,
          type: 'sample',
          x: 0,
          y: 0,
          pinyin: i === 0 ? charPinyin : undefined,
          opacity: 1.0,
          fillStyle: 'solid',
        });
      }

      // 2) Stroke breakdown steps (step 0 to strokeCount - 1) - rendered in trace/faint style
      const stepOpacity = getOpacityForStyle(config.fillStyle, config.fontOpacity);
      for (let s = 0; s < strokeCount; s++) {
        charCells.push({
          character: char,
          type: 'strokeStep',
          strokeStepIndex: s,
          x: 0,
          y: 0,
          pinyin: undefined,
          opacity: stepOpacity,
          fillStyle: config.fillStyle,
        });
      }

      // 3) Trace practice cells: according to config.traceCount (tính năng thêm ô tô)
      const shouldHideTrace = config.showTrace === false;
      for (let t = 0; t < config.traceCount; t++) {
        const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
        charCells.push({
          character: isEmptyStyle ? '' : char,
          type: isEmptyStyle ? 'empty' : 'trace',
          x: 0,
          y: 0,
          pinyin: undefined,
          opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
          fillStyle: config.fillStyle,
        });
      }

      // Distribute charCells into rows of `columns` cells each
      for (let rStart = 0; rStart < charCells.length; rStart += columns) {
        const rowCells = charCells.slice(rStart, rStart + columns);

        // Pad remaining cells on this row to fill the entire width (columns)
        while (rowCells.length < columns) {
          if (config.fillRowWithTrace) {
            const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
            rowCells.push({
              character: isEmptyStyle ? '' : char,
              type: isEmptyStyle ? 'empty' : 'trace',
              x: 0,
              y: 0,
              pinyin: undefined,
              opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
              fillStyle: config.fillStyle,
            });
          } else {
            rowCells.push({
              character: '',
              type: 'empty',
              x: 0,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            });
          }
        }

        // Assign x coordinates based on column index
        rowCells.forEach((c, idx) => {
          c.x = idx * gridSize;
        });

        allRows.push({
          character: char,
          pinyin: rStart === 0 ? charPinyin : undefined,
          cells: rowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }

      // 4) Thêm hàng (emptyRows): Add full empty row(s) for handwriting practice
      const emptyRowsCount = config.emptyRows ?? (config.emptyCount > 0 ? Math.max(1, Math.round(config.emptyCount / columns)) : 0);
      for (let er = 0; er < emptyRowsCount; er++) {
        const emptyRowCells: CellData[] = [];
        for (let col = 0; col < columns; col++) {
          emptyRowCells.push({
            character: '',
            type: 'empty',
            x: col * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          });
        }
        allRows.push({
          character: '',
          pinyin: undefined,
          cells: emptyRowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }
    }
  } else if (config.practiceMode === 'single') {
    // Single character mode: each character gets sample + trace cells, then dedicated empty rows (Thêm hàng)
    const emptyRowsCount = config.emptyRows !== undefined
      ? config.emptyRows
      : (config.emptyCount > 0 ? Math.max(1, Math.round(config.emptyCount / columns)) : 0);

    for (const char of characters) {
      const charPinyin = showPinyin ? getPinyin(char, config.pinyinWithTone) : undefined;
      const charCells: CellData[] = [];

      // Sample cells (can be 0 or more)
      const sampleCount = Math.max(0, config.sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        charCells.push({
          character: char,
          type: 'sample',
          x: 0,
          y: 0,
          pinyin: (showPinyin && i === 0) ? charPinyin : undefined,
          opacity: 1.0,
          fillStyle: 'solid',
        });
      }

      // Trace cells
      const shouldHideTrace = config.showTrace === false;
      for (let i = 0; i < config.traceCount; i++) {
        const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
        charCells.push({
          character: isEmptyStyle ? '' : char,
          type: isEmptyStyle ? 'empty' : 'trace',
          x: 0,
          y: 0,
          pinyin: undefined,
          opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
          fillStyle: config.fillStyle,
        });
      }

      // Distribute into rows of columns
      for (let rowStart = 0; rowStart < charCells.length; rowStart += columns) {
        const rowCells = charCells.slice(rowStart, rowStart + columns);
        while (rowCells.length < columns) {
          if (config.fillRowWithTrace) {
            const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
            rowCells.push({
              character: isEmptyStyle ? '' : char,
              type: isEmptyStyle ? 'empty' : 'trace',
              x: 0,
              y: 0,
              pinyin: undefined,
              opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
              fillStyle: config.fillStyle,
            });
          } else {
            rowCells.push({
              character: '',
              type: 'empty',
              x: 0,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            });
          }
        }
        rowCells.forEach((c, idx) => {
          c.x = idx * gridSize;
        });
        allRows.push({
          character: char,
          pinyin: rowStart === 0 ? charPinyin : undefined,
          cells: rowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }

      // Thêm hàng: Add dedicated full empty rows
      for (let er = 0; er < emptyRowsCount; er++) {
        const emptyRowCells: CellData[] = [];
        for (let col = 0; col < columns; col++) {
          emptyRowCells.push({
            character: '',
            type: 'empty',
            x: col * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          });
        }
        allRows.push({
          character: '',
          pinyin: undefined,
          cells: emptyRowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }
    }
  } else if (config.practiceMode === 'vocabulary') {
    // Mode: Luyện từ vựng (Vocabulary mode)
    // Từng từ vựng (2-4 chữ) được luyện viết theo cụm:
    // 1 cụm mẫu đậm (có Pinyin trên từng chữ của từ), tiếp theo là các cụm mờ tập tô (không cần Pinyin),
    // và các ô trống để tự viết lại từ đó.
    const rawWords = config.characters.split(/\s+/).map(w => w.trim()).filter(Boolean);
    const wordsToProcess = rawWords.length > 0 ? rawWords : ['你好', '学习', '练习', '朋友'];
    const emptyRowsCount = config.emptyRows ?? 0;

    for (const word of wordsToProcess) {
      const charsInWord = Array.from(word).filter(c => !isChinesePunctuation(c));
      if (charsInWord.length === 0) continue;

      const pinyinList = charsInWord.map(c => showPinyin ? getPinyin(c, config.pinyinWithTone) : undefined);
      const wordCells: CellData[] = [];

      // 1. Sample occurrence(s) of the word
      const sampleCount = Math.max(0, config.sampleCount);
      for (let s = 0; s < sampleCount; s++) {
        charsInWord.forEach((ch, idx) => {
          wordCells.push({
            character: ch,
            type: 'sample',
            x: 0,
            y: 0,
            pinyin: (showPinyin && s === 0) ? pinyinList[idx] : undefined,
            opacity: 1.0,
            fillStyle: 'solid',
          });
        });
      }

      // 2. Trace occurrence(s) of the word
      const shouldHideTrace = config.showTrace === false;
      for (let t = 0; t < config.traceCount; t++) {
        const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
        charsInWord.forEach((ch) => {
          wordCells.push({
            character: isEmptyStyle ? '' : ch,
            type: isEmptyStyle ? 'empty' : 'trace',
            x: 0,
            y: 0,
            pinyin: undefined,
            opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
            fillStyle: config.fillStyle,
          });
        });
      }

      // Distribute wordCells into rows of `columns`
      for (let rStart = 0; rStart < wordCells.length; rStart += columns) {
        const rowCells = wordCells.slice(rStart, rStart + columns);
        while (rowCells.length < columns) {
          if (config.fillRowWithTrace) {
            const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
            const charIdx = (rowCells.length - rStart) % charsInWord.length;
            const padChar = charsInWord[charIdx] || charsInWord[0] || '';
            rowCells.push({
              character: isEmptyStyle ? '' : padChar,
              type: isEmptyStyle ? 'empty' : 'trace',
              x: 0,
              y: 0,
              pinyin: undefined,
              opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
              fillStyle: config.fillStyle,
            });
          } else {
            rowCells.push({
              character: '',
              type: 'empty',
              x: 0,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            });
          }
        }

        rowCells.forEach((c, idx) => {
          c.x = idx * gridSize;
        });

        allRows.push({
          character: word,
          pinyin: rStart === 0 ? pinyinList.filter(Boolean).join(' ') : undefined,
          cells: rowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }

      // 3. Dedicated empty rows ("Thêm hàng")
      for (let er = 0; er < emptyRowsCount; er++) {
        const emptyRowCells: CellData[] = [];
        for (let col = 0; col < columns; col++) {
          emptyRowCells.push({
            character: '',
            type: 'empty',
            x: col * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          });
        }
        allRows.push({
          character: '',
          pinyin: undefined,
          cells: emptyRowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }
    }
  } else if (config.practiceMode === 'pinyinDictation') {
    // Mode: Nhìn Pinyin viết chữ Hán (看拼音写词语 / 看拼音写汉字)
    // Characters/words are shown with Pinyin only; cells can be empty or have trace hints.
    const rawLines = config.characters.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const linesToProcess = rawLines.length > 0 ? rawLines : ['你好 学习 练习 朋友 汉字'];
    const gapCount = Math.max(0, config.pinyinWordGap ?? 1);

    for (const line of linesToProcess) {
      const rawWords = line.split(/\s+/).filter(Boolean);
      let currentRowCells: CellData[] = [];

      for (const word of rawWords) {
        // Extract CJK characters or alphanumeric tokens
        const charsInWord = word.match(/[\u4e00-\u9fff\u3400-\u4dbf\u31c0-\u31ef\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\u{2ceb0}-\u{2ebef}\u{30000}-\u{3134f}]|[a-zA-Z0-9]/gu) || Array.from(word);
        if (charsInWord.length === 0) continue;

        const neededCells = (currentRowCells.length > 0 ? gapCount : 0) + charsInWord.length;

        // Wrap to next row if word cannot fit on current row
        if (currentRowCells.length > 0 && currentRowCells.length + neededCells > columns) {
          while (currentRowCells.length < columns) {
            currentRowCells.push({
              character: '',
              type: 'empty',
              x: currentRowCells.length * gridSize,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            });
          }
          allRows.push({
            character: currentRowCells.find(c => c.character)?.character || '',
            cells: currentRowCells,
            y: 0,
            rowHeight: effectiveRowHeight,
          });
          currentRowCells = [];
        }

        // Insert gap cells between words if current row has cells
        if (currentRowCells.length > 0 && gapCount > 0) {
          for (let g = 0; g < gapCount && currentRowCells.length < columns; g++) {
            currentRowCells.push({
              character: '',
              type: 'empty',
              x: currentRowCells.length * gridSize,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            });
          }
        }

        // Add character cells
        for (const ch of charsInWord) {
          if (currentRowCells.length >= columns) {
            allRows.push({
              character: currentRowCells.find(c => c.character)?.character || '',
              cells: currentRowCells,
              y: 0,
              rowHeight: effectiveRowHeight,
            });
            currentRowCells = [];
          }

          const chPinyin = showPinyin ? getPinyin(ch, config.pinyinWithTone) : undefined;
          const showHint = config.showTrace !== false;
          const isEmptyStyle = config.fillStyle === 'empty' || !showHint;

          currentRowCells.push({
            character: (showHint && !isEmptyStyle) ? ch : '',
            type: (showHint && !isEmptyStyle) ? 'trace' : 'empty',
            x: currentRowCells.length * gridSize,
            y: 0,
            pinyin: chPinyin,
            opacity: (showHint && !isEmptyStyle) ? getOpacityForStyle(config.fillStyle, config.fontOpacity) : 0,
            fillStyle: showHint ? config.fillStyle : 'empty',
          });
        }
      }

      // Finish current row
      if (currentRowCells.length > 0) {
        while (currentRowCells.length < columns) {
          currentRowCells.push({
            character: '',
            type: 'empty',
            x: currentRowCells.length * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          });
        }
        allRows.push({
          character: currentRowCells.find(c => c.character)?.character || '',
          cells: currentRowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }

      // Additional empty practice rows per content row ("Thêm hàng")
      const emptyRowsCount = config.emptyRows ?? 0;
      for (let er = 0; er < emptyRowsCount; er++) {
        allRows.push({
          character: '',
          cells: Array.from({ length: columns }, (_, col) => ({
            character: '',
            type: 'empty',
            x: col * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          })),
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }
    }
  } else if (config.practiceMode === 'paragraph') {
    // Mode: Luyện đoạn văn / bài thơ (Continuous paragraph / poetry writing mode)
    // Chữ Hán và dấu câu tiếng Trung đi liền kề nhau từng ô từ trái qua phải, từ trên xuống dưới.
    // Tôn trọng xuống dòng trong văn bản để chia hàng cho bài thơ hoặc đoạn văn.
    const rawParagraphs = config.characters.split(/\r?\n/).map(p => p.trim()).filter(p => p.length > 0);
    const paragraphs = rawParagraphs.length > 0 ? rawParagraphs : ['白日依山尽', '黄河入海流', '欲穷千里目', '更上一层楼'];

    for (const paraText of paragraphs) {
      const tokens = extractParagraphTokens(paraText);
      if (tokens.length === 0) continue;

      let currentRowCells: CellData[] = [];

      for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
        const tok = tokens[tIdx];
        const isPunct = isChinesePunctuation(tok);
        const isSpace = tok === ' ';

        // If line is full, push currentRowCells to allRows and start new row
        if (currentRowCells.length >= columns) {
          allRows.push({
            character: currentRowCells.find(c => c.character)?.character || '',
            pinyin: currentRowCells.find(c => c.pinyin)?.pinyin,
            cells: currentRowCells,
            y: 0,
            rowHeight: effectiveRowHeight,
          });
          currentRowCells = [];
        }

        const tokPinyin = (!isPunct && !isSpace && showPinyin) ? getPinyin(tok, config.pinyinWithTone) : undefined;
        const shouldHideTrace = config.showTrace === false;
        const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;

        let cellType: 'sample' | 'trace' | 'empty' = 'trace';
        let cellChar = tok;
        let cellOpacity = getOpacityForStyle(config.fillStyle, config.fontOpacity);
        let cellFillStyle = config.fillStyle;

        if (isSpace || isEmptyStyle) {
          cellType = 'empty';
          cellChar = '';
          cellOpacity = 0;
          cellFillStyle = 'empty';
        } else if (config.fillStyle === 'solid') {
          cellType = 'sample';
          cellChar = tok;
          cellOpacity = 1.0;
          cellFillStyle = 'solid';
        }

        currentRowCells.push({
          character: cellChar,
          type: cellType,
          x: currentRowCells.length * gridSize,
          y: 0,
          pinyin: tokPinyin,
          opacity: cellOpacity,
          fillStyle: cellFillStyle,
        });
      }

      // Finish this paragraph line: pad remainder of row with empty cells
      if (currentRowCells.length > 0) {
        while (currentRowCells.length < columns) {
          currentRowCells.push({
            character: '',
            type: 'empty',
            x: currentRowCells.length * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          });
        }
        allRows.push({
          character: currentRowCells.find(c => c.character)?.character || '',
          pinyin: currentRowCells.find(c => c.pinyin)?.pinyin,
          cells: currentRowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }

      // If user configured extra empty practice rows ("Thêm hàng")
      const emptyRowsCount = config.emptyRows ?? 0;
      for (let er = 0; er < emptyRowsCount; er++) {
        allRows.push({
          character: '',
          cells: Array.from({ length: columns }, (_, col) => ({
            character: '',
            type: 'empty',
            x: col * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          })),
          y: 0,
          rowHeight: effectiveRowHeight,
        });
      }
    }
  } else if (config.practiceMode === 'sentence') {
    // Mode: Luyện câu (Sentence mode)
    // Từng câu được viết liền kề chữ trên 1 hàng mẫu (hoặc quấn hàng nếu dài),
    // sau đó có hàng mờ tập tô và hàng trống để tự chép lại câu đó.
    const rawSentences = config.characters.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0);
    const sentences = rawSentences.length > 0 ? rawSentences : ['春天来了，万物复苏。', '千里之行，始于足下。'];

    for (const sentText of sentences) {
      const tokens = extractParagraphTokens(sentText);
      if (tokens.length === 0) continue;

      // Group tokens into rows of `columns`
      for (let sIdx = 0; sIdx < tokens.length; sIdx += columns) {
        const lineTokens = tokens.slice(sIdx, sIdx + columns);

        // 1. Sample row (chữ mẫu hoặc mờ tùy fillStyle)
        const rowCells: CellData[] = lineTokens.map((tok, idx) => {
          const isPunct = isChinesePunctuation(tok);
          const isSpace = tok === ' ';
          const tokPinyin = (!isPunct && !isSpace && showPinyin) ? getPinyin(tok, config.pinyinWithTone) : undefined;
          const shouldHideTrace = config.showTrace === false;

          return {
            character: isSpace || shouldHideTrace ? '' : tok,
            type: isSpace || shouldHideTrace ? 'empty' : 'sample',
            x: idx * gridSize,
            y: 0,
            pinyin: tokPinyin,
            opacity: isSpace || shouldHideTrace ? 0 : (config.fillStyle === 'solid' ? 1.0 : getOpacityForStyle(config.fillStyle, config.fontOpacity)),
            fillStyle: config.fillStyle,
          };
        });

        // Pad with empty cells
        while (rowCells.length < columns) {
          rowCells.push({
            character: '',
            type: 'empty',
            x: rowCells.length * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          });
        }

        allRows.push({
          character: rowCells.find(c => c.character)?.character || '',
          pinyin: rowCells.find(c => c.pinyin)?.pinyin,
          cells: rowCells,
          y: 0,
          rowHeight: effectiveRowHeight,
        });

        // 2. Trace / empty practice rows ("Thêm hàng")
        const emptyRowsCount = config.emptyRows ?? 1;
        for (let er = 0; er < emptyRowsCount; er++) {
          allRows.push({
            character: '',
            cells: Array.from({ length: columns }, (_, col) => ({
              character: '',
              type: 'empty',
              x: col * gridSize,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            })),
            y: 0,
            rowHeight: effectiveRowHeight,
          });
        }
      }
    }
  } else {
    // Vocabulary / single modes: characters flow left-to-right, top-to-bottom
    const allCells: CellData[] = [];

    for (const char of characters) {
      const charPinyin = showPinyin ? getPinyin(char, config.pinyinWithTone) : undefined;

      // Sample
      for (let i = 0; i < config.sampleCount; i++) {
        allCells.push({
          character: char,
          type: 'sample',
          x: 0, y: 0,
          pinyin: charPinyin,
          opacity: 1.0,
          fillStyle: 'solid',
        });
      }
      // Trace
      const shouldHideTrace = config.showTrace === false;
      for (let i = 0; i < config.traceCount; i++) {
        const isEmptyStyle = config.fillStyle === 'empty' || shouldHideTrace;
        allCells.push({
          character: isEmptyStyle ? '' : char,
          type: isEmptyStyle ? 'empty' : 'trace',
          x: 0, y: 0,
          pinyin: undefined,
          opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
          fillStyle: config.fillStyle,
        });
      }
      // Empty
      for (let i = 0; i < config.emptyCount; i++) {
        allCells.push({
          character: '',
          type: 'empty',
          x: 0, y: 0,
          opacity: 0,
          fillStyle: 'empty',
        });
      }
    }

    // Arrange into rows
    for (let i = 0; i < allCells.length; i += columns) {
      const rowCells = allCells.slice(i, i + columns);
      // Update x positions
      rowCells.forEach((cell, idx) => {
        cell.x = idx * gridSize;
      });
      // Pad
      while (rowCells.length < columns) {
        if (config.fillRowWithTrace) {
          const lastCharCell = [...rowCells].reverse().find(c => c.character);
          const lastChar = lastCharCell?.character || characters[characters.length - 1] || '';
          const lastPinyin = showPinyin && lastChar ? getPinyin(lastChar, config.pinyinWithTone) : undefined;
          const isEmptyStyle = config.fillStyle === 'empty' || (config.showTrace === false);
          rowCells.push({
            character: isEmptyStyle ? '' : lastChar,
            type: isEmptyStyle ? 'empty' : 'trace',
            x: rowCells.length * gridSize,
            y: 0,
            pinyin: undefined,
            opacity: isEmptyStyle ? 0 : getOpacityForStyle(config.fillStyle, config.fontOpacity),
            fillStyle: config.fillStyle,
          });
        } else {
          rowCells.push({
            character: '',
            type: 'empty',
            x: rowCells.length * gridSize,
            y: 0,
            opacity: 0,
            fillStyle: 'empty',
          });
        }
      }

      const firstCharCell = rowCells.find(c => c.character);
      allRows.push({
        character: firstCharCell?.character || '',
        pinyin: firstCharCell?.pinyin,
        cells: rowCells,
        y: 0,
        rowHeight: effectiveRowHeight,
      });
    }
  }

  // Fill remaining page logic (Điền kín ô hết trang vs Để giấy trắng trơn)
  const shouldFillPage = config.fillRemainingPage !== false;
  if (shouldFillPage && !config.blankPaper && config.practiceMode !== 'radical') {
    const neededPages = Math.max(1, Math.ceil(allRows.length / rowsPerPage));
    const targetTotalRows = neededPages * rowsPerPage;
    while (allRows.length < targetTotalRows) {
      allRows.push({
        character: '',
        cells: config.gridType === 'line'
          ? [{
              character: '',
              type: 'empty',
              x: 0,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            }]
          : Array.from({ length: columns }, (_, col) => ({
              character: '',
              type: 'empty',
              x: col * gridSize,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            })),
        y: 0,
        rowHeight: effectiveRowHeight,
        isLineRow: config.gridType === 'line',
      });
    }
  } else if (!shouldFillPage && !config.blankPaper && config.practiceMode !== 'radical') {
    // When NOT filling the whole page, append extra empty rows (Thêm hàng trống cuối đoạn văn/bài viết)
    const extraRows = config.extraEmptyRows ?? 0;
    for (let er = 0; er < extraRows; er++) {
      allRows.push({
        character: '',
        cells: config.gridType === 'line'
          ? [{
              character: '',
              type: 'empty',
              x: 0,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            }]
          : Array.from({ length: columns }, (_, col) => ({
              character: '',
              type: 'empty',
              x: col * gridSize,
              y: 0,
              opacity: 0,
              fillStyle: 'empty',
            })),
        y: 0,
        rowHeight: effectiveRowHeight,
        isLineRow: config.gridType === 'line',
      });
    }
  }

  // ============================================================
  // Pagination: distribute rows across pages
  // ============================================================
  const pages: PageLayout[] = [];
  let currentPageRows: CharacterRow[] = [];
  let currentY = headerHeight;

  if (config.practiceMode === 'radical') {
    // RADICAL_HEADER_SPACE: space above the grid rows for radical note + pinyin
    // RADICAL_FOOTER_SPACE: space below the grid rows for structure info
    const RADICAL_HEADER_SPACE = 10.0;
    const RADICAL_FOOTER_SPACE = 4.0;

    let i = 0;
    while (i < allRows.length) {
      const row1 = allRows[i];
      const blockRowsCount = row1.blockRowCount || 1;
      const rowEffectiveH = isPinyinBoxGrid ? (gridSize + pinyinRowHeight) : (config.gridType === 'square' && showPinyin ? gridSize + pinyinRowHeight : gridSize);
      const blockHeight = rowEffectiveH * blockRowsCount + RADICAL_HEADER_SPACE + RADICAL_FOOTER_SPACE;

      if (currentY + blockHeight > usableHeight && currentPageRows.length > 0) {
        pages.push({
          pageIndex: pages.length,
          rows: currentPageRows,
          headerHeight,
        });
        currentPageRows = [];
        currentY = headerHeight;
      }

      for (let r = 0; r < blockRowsCount; r++) {
        const row = allRows[i + r];
        if (row) {
          const rowY = currentY + RADICAL_HEADER_SPACE + r * rowEffectiveH;
          const cellY = rowY + (isPinyinBoxGrid || (config.gridType === 'square' && showPinyin) ? pinyinRowHeight : 0);
          row.y = rowY;
          row.cells.forEach(cell => {
            cell.y = cellY;
          });
          currentPageRows.push(row);
        }
      }

      currentY += blockHeight;
      i += blockRowsCount;
    }
  } else {
    for (const row of allRows) {
      if (currentPageRows.length >= rowsPerPage && currentPageRows.length > 0) {
        // Start new page
        pages.push({
          pageIndex: pages.length,
          rows: currentPageRows,
          headerHeight,
        });
        currentPageRows = [];
        currentY = headerHeight;
      }

      // Set y positions for cells in this row
      const isLine = config.gridType === 'line' || row.isLineRow;
      const cellY = isLine
        ? (currentY + (showPinyin ? pinyinRowHeight : 0))  // hanzi starts after pinyin zone (or at top when no pinyin)
        : (currentY + pinyinRowHeight);
      row.y = currentY;
      row.cells.forEach(cell => {
        cell.y = cellY;
      });

      currentPageRows.push(row);
      currentY += effectiveRowHeight;
    }
  }

  // Push last page
  if (currentPageRows.length > 0) {
    pages.push({
      pageIndex: pages.length,
      rows: currentPageRows,
      headerHeight,
    });
  }

  // Ensure at least one page
  if (pages.length === 0) {
    pages.push({
      pageIndex: 0,
      rows: [],
      headerHeight,
    });
  }

  return {
    columns,
    rowsPerPage,
    pages,
    usableWidth,
    usableHeight,
    paperWidth,
    paperHeight,
    gridSizeMm: gridSize,
    rowHeightMm: effectiveRowHeight,
    pinyinRowHeight,
    headerHeight,
    totalCharacters: characters.length,
  };
}
