/**
 * Basic & Combined Chinese Strokes Data (Bảng Các Nét Tiếng Trung Chuẩn NQEZ)
 * Exactly matches NQEZ "带笔顺练字帖" -> "↑图形输入" 69 basic strokes.
 */

import nqezStrokesData from './nqez_stroke_vectors.json';

export interface BasicStroke {
  id: string;
  index: number;
  nameZh: string;       // e.g. "短横", "长横", "悬针竖", "垂露竖"...
  nameVi: string;       // Tên tiếng Việt: "ngang ngắn", "ngang dài", "sổ kim"...
  pinyin: string;       // Phiên âm Pinyin: "duǎn héng", "cháng héng"...
  exampleChar: string;  // Chữ Hán ví dụ chứa nét: "二", "一", "中", "十"...
  stroke: string;       // Authentic vector SVG path (1024x1024)
  rawStroke?: string;
  char?: string;
}

export const BASIC_STROKES_LIST: BasicStroke[] = nqezStrokesData as BasicStroke[];

// Fast lookup map by ID, Chinese name, Vietnamese name, or Parenthesized token (e.g. "(短横)")
const strokeMap: Record<string, BasicStroke> = {};

BASIC_STROKES_LIST.forEach((s) => {
  strokeMap[s.id] = s;
  strokeMap[s.nameZh] = s;
  strokeMap[`(${s.nameZh})`] = s;
  strokeMap[`（${s.nameZh}）`] = s;
  strokeMap[s.nameVi.toLowerCase()] = s;
  strokeMap[s.pinyin.toLowerCase()] = s;
  strokeMap[s.index.toString()] = s;
});

// Legacy ID aliases for backwards compatibility
const LEGACY_ID_MAP: Record<string, string> = {
  'ngang_dai': '长横',
  'ngang_ngan': '短横',
  'so_gon': '垂露竖',
  'so_kim': '悬针竖',
  'phay_nam': '平撇',
  'phay_ngan': '短撇',
  'phay_dai': '长撇',
  'cham_ngan': '右点',
  'cham_dai': '长点',
  'cham_trai': '左点',
  'hat': '笔画提',
  'mac_1': '斜捺',
  'mac_2': '斜捺',
  'mac_nam': '平捺',
  'ngang_gap': '横折',
  'ngang_gap_moc': '横折钩',
  'ngang_phay': '横撇',
  'ngang_moc': '横钩',
  'ngang_gap_hat': '横折提',
  'ngang_gap_cong': '横折弯',
  'ngang_gap_cong_moc': '横折弯钩',
  'ngang_gap_cong_phay': '横折折撇',
  'so_moc': '竖钩',
  'so_cong': '竖弯',
  'so_hat': '竖提',
  'so_phay': '竖撇',
  'so_cong_phay': '竖折撇',
  'so_gap': '竖折',
  'so_gap_gap_moc': '竖折折钩',
  'so_cong_moc': '竖弯钩',
  'ngang_phay_cong_moc': '横撇弯钩',
  'ngang_cong_moc': '横折弯钩',
  'phay_hat': '撇折',
  'phay_cham': '撇点',
  'cong_moc': '弯钩',
  'nghieng_moc': '戈钩',
  'ngang_nghieng_moc': '卧钩',
  'ngang_gap_gap_phay': '横折折折',
  'ngang_gap_gap_gap_moc': '横折折折钩',
  'so_gap_phay': '竖折撇',
  'ngang_gap_gap_gap': '横折折折',
  'so_gap_gap': '竖折折',
};

Object.entries(LEGACY_ID_MAP).forEach(([legacyId, zhName]) => {
  if (strokeMap[zhName]) {
    strokeMap[legacyId] = strokeMap[zhName];
  }
});

/**
 * Get basic stroke metadata by ID, character, index, or name
 */
export function getBasicStroke(key: string): BasicStroke | undefined {
  if (!key) return undefined;
  const k = key.trim();
  return strokeMap[k] || strokeMap[k.toLowerCase()];
}

/**
 * Check if a token is a basic stroke
 */
export function isBasicStrokeToken(token: string): boolean {
  return !!getBasicStroke(token);
}

/**
 * Default standard input string for all 69 basic strokes matching NQEZ
 */
export const ALL_NQEZ_STROKES_TOKENS = BASIC_STROKES_LIST.map(s => `(${s.nameZh})`).join('');

/**
 * All basic stroke identifiers for quick configuration
 */
export const ALL_42_BASIC_STROKE_TOKENS = ALL_NQEZ_STROKES_TOKENS;
export const ALL_BASIC_STROKE_IDS = BASIC_STROKES_LIST.map(s => s.id);
