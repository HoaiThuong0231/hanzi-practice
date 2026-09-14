/**
 * Worksheet Store (Zustand)
 * 
 * Central state management for the entire application.
 * Handles worksheet configuration, computed layout, UI state, and undo/redo.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorksheetConfig,
  LayoutResult,
  GridType,
  FillStyle,
  PracticeMode,
  PaperSize,
  Margins,
  BottomSheetTab,
  HeaderTitleMode,
} from '../types';
import { DEFAULT_CONFIG, PAPER_SIZES } from '../types';
import { computeLayout } from '../engines/layout-engine';

// ============================================================
// Store Interface
// ============================================================

interface WorksheetState {
  // Worksheet configuration
  config: WorksheetConfig;

  // Computed layout (derived from config)
  layout: LayoutResult;

  // UI state
  currentPage: number;
  zoomLevel: number;
  sidebarOpen: boolean;
  activeBottomTab: BottomSheetTab | null;
  bottomSheetOpen: boolean;

  // Undo/Redo
  history: WorksheetConfig[];
  historyIndex: number;

  // Actions — Config
  setCharacters: (chars: string) => void;
  setBlankPaper: (blank: boolean) => void;
  setGridType: (type: GridType) => void;
  setGridSize: (sizeMm: number) => void;
  setGridLineColor: (color: string) => void;
  setGridLineWidth: (width: number) => void;
  setGridLineDash: (dash: boolean) => void;
  setPaperSize: (size: PaperSize) => void;
  setOrientation: (orientation: 'portrait' | 'landscape') => void;
  setMargins: (margins: Margins) => void;
  setFontSize: (size: number) => void;
  setFontOpacity: (opacity: number) => void;
  setFontWeight: (weight: number) => void;
  setFontColor: (color: string) => void;
  setFontFamily: (fontFamily: string) => void;
  setFillStyle: (style: FillStyle) => void;
  setSampleCount: (count: number) => void;
  setTraceCount: (count: number) => void;
  setShowTrace: (show: boolean) => void;
  setEmptyCount: (count: number) => void;
  setEmptyRows: (rows: number) => void;
  setShowPinyin: (show: boolean) => void;
  setPinyinStyle: (style: 'above' | 'inline') => void;
  setPinyinWithTone: (withTone: boolean) => void;
  setShowHeader: (show: boolean) => void;
  setHeaderTitle: (title: string) => void;
  setHeaderTitleMode: (mode: HeaderTitleMode) => void;
  setHeaderShowName: (show: boolean) => void;
  setHeaderShowClass: (show: boolean) => void;
  setHeaderShowDate: (show: boolean) => void;
  setHeaderFontFamily: (font: string) => void;
  setHeaderFontSize: (size: number) => void;
  setHeaderFontColor: (color: string) => void;
  setHeaderFontBold: (bold: boolean) => void;
  setHeaderFontItalic: (italic: boolean) => void;
  setHeaderFontUnderline: (underline: boolean) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  setColumnsPerRow: (cols: number) => void;
  setFillRemainingPage: (fill: boolean) => void;
  setFillRowWithTrace: (fill: boolean) => void;
  setExtraEmptyRows: (rows: number) => void;
  setLineRowHeight: (height: number) => void;
  setPinyinShowTraceHint: (show: boolean) => void;
  setPinyinWordGap: (gap: number) => void;
  setPinyinDistance: (dist: number) => void;
  setPinyinLineSpacing: (spacing: number) => void;
  setVerticalRowsPerCol: (rows: number) => void;
  setVerticalColWidth: (width: number) => void;
  setRowGapMm: (gap: number) => void;
  setColumnGapMm: (gap: number) => void;

  // Actions — UI
  setCurrentPage: (page: number) => void;
  setZoomLevel: (zoom: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveBottomTab: (tab: BottomSheetTab | null) => void;
  setBottomSheetOpen: (open: boolean) => void;

  // Actions — History
  undo: () => void;
  redo: () => void;

  // Bulk update
  updateConfig: (partial: Partial<WorksheetConfig>) => void;
  resetConfig: () => void;
}

import { preloadStrokeDataForChars } from '../engines/stroke-engine';
import { ALL_NQEZ_STROKES_TOKENS, getBasicStroke } from '../data/basic-strokes';
import { ALL_214_RADICALS } from '../data/cjk-radicals';

// ============================================================
// Helper: Update config and recompute layout
// ============================================================

function updateConfigAndLayout(
  state: WorksheetState,
  configUpdate: Partial<WorksheetConfig>,
  pushHistory: boolean = true,
  setFn?: (fn: (s: WorksheetState) => Partial<WorksheetState>) => void
): Partial<WorksheetState> {
  const newConfig = { ...state.config, ...configUpdate };

  // Vertical writing modes do NOT allow Pinyin
  const isAnyVertical =
    newConfig.gridType === 'verticalLine' ||
    newConfig.gridType === 'verticalSquare' ||
    newConfig.gridType === 'verticalTian' ||
    newConfig.gridType === 'verticalMi' ||
    newConfig.gridType === 'verticalHui' ||
    newConfig.gridType === 'verticalOHoi';
  if (isAnyVertical) {
    newConfig.showPinyin = false;
  }

  // Title mapping for each practice mode
  const MODE_TITLES: Record<string, string> = {
    paragraph: 'LUYỆN VIẾT ĐOẠN VĂN TIẾNG TRUNG',
    sentence: 'LUYỆN VIẾT CÂU TIẾNG TRUNG',
    vocabulary: 'LUYỆN TỪ VỰNG TIẾNG TRUNG',
    single: 'PHIẾU LUYỆN VIẾT CHỮ HÁN',
    stroke: 'LUYỆN THỨ TỰ NÉT CHỮ HÁN',
    basicStroke: 'BẢNG CÁC NÉT CƠ BẢN TIẾNG TRUNG',
    radical: 'BẢNG 214 BỘ THỦ TIẾNG TRUNG',
    pinyin: 'LUYỆN VIẾT KÈM PINYIN',
    pinyinMeaning: 'LUYỆN VIẾT PINYIN & Ý NGHĨA',
    pinyinDictation: 'NHÌN PINYIN VIẾT CHỮ HÁN',
  };

  // If user changed practiceMode and didn't explicitly override headerTitle, set appropriate title
  if (configUpdate.practiceMode && !configUpdate.headerTitle) {
    newConfig.headerTitle = MODE_TITLES[configUpdate.practiceMode] || newConfig.headerTitle;
  }

  // If leaving vertical grid, clear any lingering vertical column title
  if (!isAnyVertical && newConfig.headerTitle === 'LUYỆN VIẾT THEO CỘT DỌC') {
    newConfig.headerTitle = MODE_TITLES[newConfig.practiceMode] || 'PHIẾU LUYỆN VIẾT CHỮ HÁN';
  }

  // When switching to basicStroke mode, if characters don't contain basic strokes, auto-populate with ALL_NQEZ_STROKES_TOKENS
  if (configUpdate.practiceMode === 'basicStroke') {
    const hasBasicTokens = newConfig.characters && newConfig.characters.split(/\s+/).some(c => !!getBasicStroke(c));
    if (!hasBasicTokens) {
      newConfig.characters = ALL_NQEZ_STROKES_TOKENS;
    }
  }

  // When switching to radical mode, if characters don't contain radicals, populate with ALL_214_RADICALS
  if (configUpdate.practiceMode === 'radical') {
    const hasRadicals = newConfig.characters && newConfig.characters.split(/\s+/).some(c => ALL_214_RADICALS.includes(c));
    if (!hasRadicals) {
      newConfig.characters = ALL_214_RADICALS.join(' ');
    }
  }

  // Stroke/radical/basicStroke work with square, tian, mi, hui box grids (NOT vertical or line)
  // If switching to an incompatible grid, reset practiceMode to 'single'
  const isStrokeIncompatibleGrid = isAnyVertical || newConfig.gridType === 'line';
  const isStrokeMode = newConfig.practiceMode === 'stroke' || newConfig.practiceMode === 'radical' || newConfig.practiceMode === 'basicStroke';
  if (isStrokeIncompatibleGrid && isStrokeMode) {
    newConfig.practiceMode = 'single';
    if (!configUpdate.headerTitle) {
      newConfig.headerTitle = MODE_TITLES['single'];
    }
  }


  const newLayout = computeLayout(newConfig);

  // Preload stroke data asynchronously for stroke/radical/basicStroke modes, then re-compute layout
  if ((newConfig.practiceMode === 'stroke' || newConfig.practiceMode === 'radical' || newConfig.practiceMode === 'basicStroke') && newConfig.characters && setFn) {
    const chars = Array.from(new Set(newConfig.characters.trim().split(/\s+/)));
    preloadStrokeDataForChars(chars).then(() => {
      setFn((s) => ({
        layout: computeLayout(s.config),
      }));
    });
  }

  // Clamp current page
  const maxPage = Math.max(0, newLayout.pages.length - 1);
  const currentPage = Math.min(state.currentPage, maxPage);

  // Push to history (for undo)
  let history = state.history;
  let historyIndex = state.historyIndex;

  if (pushHistory) {
    // Trim future history
    history = [...state.history.slice(0, state.historyIndex + 1), state.config];
    historyIndex = history.length;

    // Limit history size
    if (history.length > 50) {
      history = history.slice(history.length - 50);
      historyIndex = history.length;
    }
  }

  return {
    config: newConfig,
    layout: newLayout,
    currentPage,
    history,
    historyIndex,
  };
}

// ============================================================
// Store Creation
// ============================================================

const initialLayout = computeLayout(DEFAULT_CONFIG);

export const useWorksheetStore = create<WorksheetState>()(
  persist(
    (set, get) => ({
      // Initial state
      config: { ...DEFAULT_CONFIG },
      layout: initialLayout,
      currentPage: 0,
      zoomLevel: 1.0,
      sidebarOpen: true,
      activeBottomTab: null,
      bottomSheetOpen: false,
      history: [],
      historyIndex: 0,

      // Config setters (each recomputes layout)
      setCharacters: (chars) => set((s) => updateConfigAndLayout(s, { characters: chars }, true, set)),
      setGridType: (type) => set((s) => {
        const update: Partial<WorksheetConfig> = { gridType: type };
        if (type === 'oHoi') {
          update.columnsPerRow = 11;
          update.rowGapMm = 0;
        } else if (type === 'verticalOHoi') {
          update.verticalRowsPerCol = 14;
          update.verticalColWidth = 16;
          update.columnGapMm = 0;
          update.showPinyin = false;
        }
        return updateConfigAndLayout(s, update);
      }),
      setBlankPaper: (blank) => set((s) => updateConfigAndLayout(s, { blankPaper: blank })),
      setGridSize: (sizeMm) => set((s) => updateConfigAndLayout(s, { gridSizeMm: Math.max(10, Math.min(80, sizeMm)) })),
      setGridLineColor: (color) => set((s) => updateConfigAndLayout(s, { gridLineColor: color })),
      setGridLineWidth: (width) => set((s) => updateConfigAndLayout(s, { gridLineWidth: width })),
      setGridLineDash: (dash) => set((s) => updateConfigAndLayout(s, { gridLineDash: dash })),
      setPaperSize: (size) => set((s) => updateConfigAndLayout(s, { paperSize: size })),
      setOrientation: (orientation) => set((s) => updateConfigAndLayout(s, { orientation })),
      setMargins: (margins) => set((s) => updateConfigAndLayout(s, { margins })),
      setFontSize: (size) => set((s) => updateConfigAndLayout(s, { fontSize: Math.max(0.3, Math.min(1.0, size)) })),
      setFontOpacity: (opacity) => set((s) => updateConfigAndLayout(s, { fontOpacity: Math.max(0, Math.min(1, opacity)) })),
      setFontWeight: (weight) => set((s) => updateConfigAndLayout(s, { fontWeight: weight })),
      setFontColor: (color) => set((s) => updateConfigAndLayout(s, { fontColor: color })),
      setFontFamily: (fontFamily) => set((s) => updateConfigAndLayout(s, { fontFamily })),
      setFillStyle: (style) => set((s) => updateConfigAndLayout(s, { fillStyle: style })),
      setSampleCount: (count) => set((s) => updateConfigAndLayout(s, { sampleCount: Math.max(0, Math.min(20, count)) })),
      setTraceCount: (count) => set((s) => updateConfigAndLayout(s, { traceCount: Math.max(0, Math.min(50, count)) })),
      setShowTrace: (show) => set((s) => updateConfigAndLayout(s, { showTrace: show })),
      setEmptyCount: (count) => set((s) => updateConfigAndLayout(s, { emptyCount: Math.max(0, Math.min(50, count)) })),
      setEmptyRows: (rows) => set((s) => updateConfigAndLayout(s, { emptyRows: Math.max(0, Math.min(10, rows)) })),
      setShowPinyin: (show) => set((s) => {
        const isAnyVert =
          s.config.gridType === 'verticalLine' ||
          s.config.gridType === 'verticalSquare' ||
          s.config.gridType === 'verticalTian' ||
          s.config.gridType === 'verticalMi' ||
          s.config.gridType === 'verticalHui' ||
          s.config.gridType === 'verticalOHoi';
        return updateConfigAndLayout(s, { showPinyin: isAnyVert ? false : show }, true, set);
      }),
      setPinyinStyle: (style) => set((s) => updateConfigAndLayout(s, { pinyinStyle: style })),
      setPinyinWithTone: (withTone) => set((s) => updateConfigAndLayout(s, { pinyinWithTone: withTone })),
      setShowHeader: (show) => set((s) => updateConfigAndLayout(s, { showHeader: show })),
      setHeaderTitle: (title) => set((s) => updateConfigAndLayout(s, { headerTitle: title })),
      setHeaderTitleMode: (mode) => set((s) => updateConfigAndLayout(s, { headerTitleMode: mode })),
      setHeaderShowName: (show) => set((s) => updateConfigAndLayout(s, { headerShowName: show })),
      setHeaderShowClass: (show) => set((s) => updateConfigAndLayout(s, { headerShowClass: show })),
      setHeaderShowDate: (show) => set((s) => updateConfigAndLayout(s, { headerShowDate: show })),
      setHeaderFontFamily: (font) => set((s) => updateConfigAndLayout(s, { headerFontFamily: font })),
      setHeaderFontSize: (size) => set((s) => updateConfigAndLayout(s, { headerFontSize: size })),
      setHeaderFontColor: (color) => set((s) => updateConfigAndLayout(s, { headerFontColor: color })),
      setHeaderFontBold: (bold) => set((s) => updateConfigAndLayout(s, { headerFontBold: bold })),
      setHeaderFontItalic: (italic) => set((s) => updateConfigAndLayout(s, { headerFontItalic: italic })),
      setHeaderFontUnderline: (underline) => set((s) => updateConfigAndLayout(s, { headerFontUnderline: underline })),
      setPracticeMode: (mode) => set((s) => updateConfigAndLayout(s, { practiceMode: mode }, true, set)),
      setColumnsPerRow: (cols) => set((s) => updateConfigAndLayout(s, { columnsPerRow: Math.max(4, Math.min(20, cols)) })),
      setFillRemainingPage: (fill) => set((s) => updateConfigAndLayout(s, { fillRemainingPage: fill })),
      setFillRowWithTrace: (fill) => set((s) => updateConfigAndLayout(s, { fillRowWithTrace: fill })),
      setExtraEmptyRows: (rows) => set((s) => updateConfigAndLayout(s, { extraEmptyRows: Math.max(0, Math.min(30, rows)) })),
      setLineRowHeight: (height) => set((s) => updateConfigAndLayout(s, { lineRowHeight: Math.max(8, Math.min(30, height)) })),
      setPinyinShowTraceHint: (show) => set((s) => updateConfigAndLayout(s, { pinyinShowTraceHint: show })),
      setPinyinWordGap: (gap) => set((s) => updateConfigAndLayout(s, { pinyinWordGap: Math.max(0, Math.min(5, gap)) })),
      setPinyinDistance: (dist) => set((s) => updateConfigAndLayout(s, { pinyinDistance: dist })),
      setPinyinLineSpacing: (spacing) => set((s) => updateConfigAndLayout(s, { pinyinLineSpacing: Math.max(-5, Math.min(10, spacing)) })),
      setVerticalRowsPerCol: (rows) => set((s) => updateConfigAndLayout(s, { verticalRowsPerCol: Math.max(6, Math.min(25, rows)) })),
      setVerticalColWidth: (width) => set((s) => updateConfigAndLayout(s, { verticalColWidth: Math.max(8, Math.min(35, width)) })),
      setRowGapMm: (gap) => set((s) => updateConfigAndLayout(s, { rowGapMm: Math.max(0, Math.min(15, gap)) })),
      setColumnGapMm: (gap) => set((s) => updateConfigAndLayout(s, { columnGapMm: Math.max(0, Math.min(15, gap)) })),

      // UI setters
      setCurrentPage: (page) => set({ currentPage: page }),
      setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.25, Math.min(3.0, zoom)) }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveBottomTab: (tab) => set({
        activeBottomTab: tab,
        bottomSheetOpen: tab !== null,
      }),
      setBottomSheetOpen: (open) => set((s) => ({
        bottomSheetOpen: open,
        activeBottomTab: open ? s.activeBottomTab : null,
      })),

      // Undo/Redo
      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const prevConfig = state.history[state.historyIndex - 1];
          const newLayout = computeLayout(prevConfig);
          set({
            config: prevConfig,
            layout: newLayout,
            historyIndex: state.historyIndex - 1,
            currentPage: Math.min(state.currentPage, Math.max(0, newLayout.pages.length - 1)),
          });
        }
      },
      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length) {
          const nextConfig = state.history[state.historyIndex];
          // We need to look at index, the "current" is the one after historyIndex
          if (state.historyIndex < state.history.length - 1) {
            const nextCfg = state.history[state.historyIndex + 1];
            const newLayout = computeLayout(nextCfg);
            set({
              config: nextCfg,
              layout: newLayout,
              historyIndex: state.historyIndex + 1,
              currentPage: Math.min(state.currentPage, Math.max(0, newLayout.pages.length - 1)),
            });
          }
        }
      },

      // Bulk update
      updateConfig: (partial) => set((s) => updateConfigAndLayout(s, partial)),
      resetConfig: () => set((s) => updateConfigAndLayout(s, { ...DEFAULT_CONFIG })),
    }),
    {
      name: 'hanzi-worksheet-store',
      partialize: (state) => ({
        config: state.config,
        zoomLevel: state.zoomLevel,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.config) {
          let updated = false;
          if (state.config.headerTitle === 'LUYỆN VIẾT TIẾNG TRUNG') {
            state.config.headerTitle = 'HANZI PRACTICE';
            updated = true;
          }
          if (state.config.gridLineWidth === 0.35 || !state.config.gridLineWidth) {
            state.config.gridLineWidth = 0.18;
            updated = true;
          }
          if (updated) {
            state.layout = computeLayout(state.config);
          }
        }
      },
    }
  )
);
