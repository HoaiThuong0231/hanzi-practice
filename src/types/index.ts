// ============================================================
// Paper Sizes (mm)
// ============================================================
export interface PaperSize {
  name: string;
  label: string; // Vietnamese label
  width: number; // mm
  height: number; // mm
}

export const PAPER_SIZES: PaperSize[] = [
  { name: 'A3', label: 'A3', width: 297, height: 420 },
  { name: 'A4', label: 'A4', width: 210, height: 297 },
  { name: 'A5', label: 'A5', width: 148, height: 210 },
  { name: 'B5', label: 'B5', width: 176, height: 250 },
  { name: 'Letter', label: 'Letter', width: 216, height: 279 },
  { name: 'Legal', label: 'Legal', width: 216, height: 356 },
  { name: '16K', label: '16K', width: 195, height: 270 },
];

// ============================================================
// Grid Types
// ============================================================
export type GridType =
  | 'tian'
  | 'mi'
  | 'hui'
  | 'oHoi'
  | 'square'
  | 'line'
  | 'verticalLine'
  | 'verticalTian'
  | 'verticalMi'
  | 'verticalHui'
  | 'verticalOHoi'
  | 'verticalSquare';

export interface GridTypeInfo {
  type: GridType;
  name: string; // Vietnamese name
  chineseName: string; // Chinese name for display
  description: string;
}

export const GRID_TYPES: GridTypeInfo[] = [
  { type: 'tian', name: 'Ô điền', chineseName: '', description: 'Ô vuông chia 4 phần bằng đường ngang dọc' },
  { type: 'mi', name: 'Ô mễ', chineseName: '', description: 'Ô vuông chia 8 phần với đường chéo' },
  { type: 'hui', name: 'Ô hồi cung', chineseName: '', description: 'Ô vuông có ô trung cung ở giữa' },
  { type: 'oHoi', name: 'Ô hồi', chineseName: '', description: 'Ô vuông có ô nhỏ ở giữa và dấu thập ngang dọc' },
  { type: 'square', name: 'Ô vuông', chineseName: '', description: 'Ô vuông đơn giản' },
  { type: 'line', name: 'Kẻ ngang', chineseName: '', description: 'Đường kẻ ngang thích hợp luyện viết câu và đoạn văn' },
  { type: 'verticalLine', name: 'Kẻ dọc', chineseName: '', description: 'Giấy kẻ hàng dọc theo phương thẳng đứng' },
  { type: 'verticalTian', name: 'Ô điền dọc', chineseName: '', description: 'Ô điền theo phương thẳng đứng từ trên xuống dưới' },
  { type: 'verticalMi', name: 'Ô mễ dọc', chineseName: '', description: 'Ô mễ theo phương thẳng đứng từ trên xuống dưới' },
  { type: 'verticalHui', name: 'Ô hồi cung dọc', chineseName: '', description: 'Ô hồi cung theo phương thẳng đứng từ trên xuống dưới' },
  { type: 'verticalOHoi', name: 'Ô hồi dọc', chineseName: '', description: 'Ô hồi theo phương thẳng đứng từ trên xuống dưới' },
  { type: 'verticalSquare', name: 'Ô vuông dọc', chineseName: '', description: 'Ô vuông theo phương thẳng đứng từ trên xuống dưới' },
];

export const GRID_COLOR_OPTIONS = [
  { value: '#16a34a', label: 'Xanh lá' },
  { value: '#1e293b', label: 'Đen' },
  { value: '#dc2626', label: 'Đỏ' },
  { value: '#7c3aed', label: 'Tím' },
  { value: '#2563eb', label: 'Xanh dương' },
  { value: '#ea580c', label: 'Cam' },
  { value: '#d97706', label: 'Vàng' },
  { value: '#64748b', label: 'Xám' },
];

export const GRID_LINE_WIDTH_OPTIONS = [
  { value: 0.10, label: 'Siêu mảnh (0.10mm)' },
  { value: 0.18, label: 'Mảnh (0.18mm)' },
  { value: 0.25, label: 'Chuẩn (0.25mm)' },
  { value: 0.35, label: 'Đậm (0.35mm)' },
];

// ============================================================
// Fill Styles
// ============================================================
export type FillStyle = 'solid' | 'standard' | 'light' | 'veryLight' | 'dashed' | 'dotted' | 'empty';

export interface FillStyleInfo {
  style: FillStyle;
  name: string; // Vietnamese
  opacity: number;
  strokeDash?: string;
}

export const FILL_STYLES: FillStyleInfo[] = [
  { style: 'solid', name: 'Mẫu đậm', opacity: 1.0 },
  { style: 'standard', name: 'Mẫu tiêu chuẩn', opacity: 0.6 },
  { style: 'light', name: 'Tô nhạt', opacity: 0.3 },
  { style: 'veryLight', name: 'Tô rất nhạt', opacity: 0.15 },
  { style: 'dashed', name: 'Nét đứt', opacity: 0.4, strokeDash: '3,2' },
  { style: 'dotted', name: 'Nét chấm', opacity: 0.4, strokeDash: '1,2' },
  { style: 'empty', name: 'Ô trống', opacity: 0 },
];

// ============================================================
// Practice Modes
// ============================================================
export type PracticeMode = 'single' | 'vocabulary' | 'sentence' | 'paragraph' | 'pinyin' | 'pinyinMeaning' | 'stroke' | 'basicStroke' | 'radical' | 'pinyinDictation';

export interface PracticeModeInfo {
  mode: PracticeMode;
  name: string;
  description: string;
}

export const PRACTICE_MODES: PracticeModeInfo[] = [
  { mode: 'single', name: 'Luyện một chữ', description: 'Luyện viết từng chữ riêng lẻ' },
  { mode: 'pinyinDictation', name: 'Nhìn Pinyin viết chữ Hán', description: 'Chỉ hiện Pinyin, chữ mờ ẩn/hiện, căn chỉnh khoảng cách từ' },
  { mode: 'vocabulary', name: 'Luyện từ vựng', description: 'Luyện viết theo từ/cụm từ' },
  { mode: 'sentence', name: 'Luyện câu', description: 'Luyện viết theo câu' },
  { mode: 'paragraph', name: 'Luyện đoạn văn', description: 'Luyện viết đoạn văn dài' },
  { mode: 'pinyin', name: 'Chữ + Pinyin', description: 'Hiển thị Pinyin phía trên chữ' },
  { mode: 'pinyinMeaning', name: 'Chữ + Pinyin + Nghĩa', description: 'Hiển thị Pinyin và nghĩa' },
  { mode: 'stroke', name: 'Luyện thứ tự nét', description: 'Hiển thị thứ tự nét viết' },
  { mode: 'basicStroke', name: 'Luyện nét cơ bản', description: 'Luyện các nét cơ bản (1 nét/dòng + tự do)' },
  { mode: 'radical', name: '214 Bộ Thủ & Chi Tiết Chữ Hán', description: 'Chữ + Bộ thủ + Cấu trúc + Thứ tự nét (chuẩn mẫu)' },
];

// ============================================================
// Grid Size Presets (mm)
// ============================================================
export const GRID_SIZE_PRESETS = [15, 20, 25, 30, 35, 40, 50] as const;

// ============================================================
// Margins
// ============================================================
export interface Margins {
  top: number; // mm
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_MARGINS: Margins = {
  top: 15,
  right: 15,
  bottom: 15,
  left: 15,
};

// ============================================================
// Worksheet Configuration
// ============================================================
export interface WorksheetConfig {
  // Content
  characters: string;
  blankPaper: boolean; // Option to print blank paper only without characters
  practiceMode: PracticeMode;

  // Grid
  gridType: GridType;
  gridSizeMm: number;
  gridLineColor: string;
  gridLineWidth: number;
  gridLineDash: boolean;
  columnsPerRow?: number; // Custom number of cells per row (4-20) for square, tian, mi, hui
  fillRemainingPage?: boolean; // When content does not fill the page, fill the rest with empty grid cells or leave blank paper
  fillRowWithTrace?: boolean; // Tự động điền chữ mẫu tô vào các ô còn trống để kín 1 hàng
  extraEmptyRows?: number; // Số hàng trống thêm vào khi không chọn điền kín ô (ví dụ cuối đoạn văn)
  lineRowHeight?: number; // Row height in mm for line grid mode (controls char size + line spacing, 8-30mm)
  verticalRowsPerCol?: number; // Number of cells per column (6-25) for verticalSquare mode
  verticalColWidth?: number; // Column width in mm (8-35mm) for verticalLine mode
  rowGapMm?: number; // Gap between horizontal rows in mm (Giãn hàng: 0-15mm)
  columnGapMm?: number; // Gap between vertical columns in mm (Giãn cột: 0-15mm)
  classicBorder?: boolean; // Khung viền hoa văn cổ điển

  // Paper
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  margins: Margins;

  // Font / Character styling
  fontSize: number; // relative to grid (0.5 - 1.0)
  fontOpacity: number; // 0 - 1
  fontWeight: number; // 100-900
  fontColor: string;
  fontFamily: string; // CSS font family or font option ID
  fillStyle: FillStyle;

  sampleCount: number; // solid reference chars
  traceCount: number; // light/trace chars
  showTrace?: boolean; // Switch to show or hide trace/ghost characters (Hiện chữ tô)
  emptyCount: number; // empty cells (legacy)
  emptyRows?: number; // number of full empty rows per character (Thêm hàng)

  // Pinyin
  showPinyin: boolean;
  pinyinStyle: 'above' | 'inline';
  pinyinWithTone: boolean;
  pinyinShowTraceHint?: boolean; // In pinyinDictation mode: show faint trace character (true) or empty cell (false)
  pinyinWordGap?: number; // In pinyinDictation mode: number of empty cells between words (0-5)
  pinyinDistance?: number; // In pinyinDictation / pinyin mode: vertical distance/offset of pinyin above grid in mm
  pinyinLineSpacing?: number; // Horizontal spacing adjustment between pinyin syllables in line mode (-5 to +10, mm offset)

  // Header
  showHeader: boolean;
  headerTitle: string;
  headerTitleMode?: HeaderTitleMode; // 'repeat' (trùng lặp) | 'empty' (bỏ trống trang sau) | 'custom' (ngăn cách bởi dấu ;)
  headerShowName: boolean;
  headerShowClass: boolean;
  headerShowDate: boolean;
  headerFontFamily?: string;
  headerFontSize?: number; // mm (default 4.5)
  headerFontColor?: string; // hex color (default '#1e293b')
  headerFontBold?: boolean; // default true
  headerFontItalic?: boolean; // default false
  headerFontUnderline?: boolean; // default false
}

export type HeaderTitleMode = 'repeat' | 'empty' | 'custom';

/**
 * Helper to compute page title based on multi-page mode:
 * - 'repeat': duplicate title across all pages (or repeat last title in semicolon list)
 * - 'empty': show title on page 1 only, subsequent pages leave header title blank
 * - 'custom': semicolon-delimited list (e.g. "Tiêu đề 1; Tiêu đề 2; Tiêu đề 3")
 */
export function getPageTitle(config: WorksheetConfig, pageIndex: number): string {
  if (!config.showHeader) return '';
  const raw = (config.headerTitle || '').trim();
  if (!raw) return '';

  const titles = raw.split(';').map(t => t.trim());
  const mode = config.headerTitleMode || (titles.length > 1 ? 'custom' : 'repeat');

  if (mode === 'empty') {
    // Chỉ trang đầu tiên có tiêu đề, các trang sau bỏ trống
    return pageIndex === 0 ? (titles[0] || '') : '';
  }

  if (mode === 'repeat') {
    // Trùng lặp các trang sau
    if (titles.length === 1) return titles[0];
    return titles[pageIndex] ?? titles[titles.length - 1] ?? titles[0] ?? '';
  }

  // mode === 'custom': theo danh sách dấu ;
  return titles[pageIndex] ?? '';
}

// ============================================================
// Font Options
// ============================================================
export interface FontOption {
  id: string;
  name: string; // Vietnamese description
  chineseName: string;
  fontFamily: string;
  category: 'kaiti' | 'calligraphy' | 'cursive' | 'songti';
  previewText?: string;
  badge?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'kaiti',
    name: 'Khải Thể Tiêu Chuẩn',
    chineseName: '楷体',
    fontFamily: "'LXGW WenKai', 'KaiTi', '楷体', 'STKaiti', serif",
    category: 'kaiti',
    badge: 'Tiêu chuẩn',
  },
  {
    id: 'lxgw-wenkai',
    name: 'Hành Khải Bút Cứng',
    chineseName: '文楷',
    fontFamily: "'LXGW WenKai', cursive",
    category: 'cursive',
    badge: 'Hành Khải',
  },
  {
    id: 'xingkai-mashan',
    name: 'Hành Khải Thư Pháp',
    chineseName: '行楷',
    fontFamily: "'Ma Shan Zheng', cursive",
    category: 'cursive',
    badge: 'Hành Khải',
  },
  {
    id: 'xingshu-zhimang',
    name: 'Hành Thư Thảo Tự Nhiên',
    chineseName: '行书',
    fontFamily: "'Zhi Mang Xing', cursive",
    category: 'calligraphy',
    badge: 'Hành Thư',
  },
  {
    id: 'liujian',
    name: 'Thảo Thư Bút Lông',
    chineseName: '毛草',
    fontFamily: "'Liu Jian Mao Cao', cursive",
    category: 'calligraphy',
    badge: 'Thảo Thư',
  },
  {
    id: 'handwriting-xiaowei',
    name: 'Viết Tay Thanh Nhã',
    chineseName: '小薇',
    fontFamily: "'ZCOOL XiaoWei', cursive",
    category: 'cursive',
    badge: 'Viết Tay',
  },
  {
    id: 'handwriting-huangyou',
    name: 'Bút Cứng Mềm Mại',
    chineseName: '黄油',
    fontFamily: "'ZCOOL QingKe HuangYou', cursive",
    category: 'cursive',
    badge: 'Viết Tay',
  },
  {
    id: 'longcang',
    name: 'Long Thảo Nghệ Thuật',
    chineseName: '龙藏',
    fontFamily: "'Long Cang', cursive",
    category: 'calligraphy',
    badge: 'Nghệ Thuật',
  },
  {
    id: 'songti',
    name: 'Tống Thể Trang Nhã',
    chineseName: '宋体',
    fontFamily: "'Noto Serif SC', serif",
    category: 'songti',
    badge: 'Tống Thể',
  },
];


// ============================================================
// Preset Worksheet Templates (Mẫu Giấy Có Sẵn)
// ============================================================
export interface WorksheetTemplate {
  id: string;
  name: string; // Vietnamese name
  chineseName: string;
  category: string;
  description: string;
  badge?: string;
  config: Partial<WorksheetConfig>;
}

export const WORKSHEET_TEMPLATES: WorksheetTemplate[] = [
  {
    id: 'a4-o-hoi',
    name: 'Ô Hồi A4',
    chineseName: 'A4经典回字格练字纸',
    category: 'Mẫu Giấy',
    description: 'Giấy A4 ô hồi chuẩn 11 cột × 14 hàng.',
    badge: 'Mới',
    config: {
      gridType: 'oHoi',
      columnsPerRow: 11,
      paperSize: PAPER_SIZES[1], // A4
      orientation: 'portrait',
      gridLineColor: '#64748b',
      blankPaper: true,
      showHeader: true,
      headerTitle: 'Tập Viết Chữ Hán',
      fillRemainingPage: true,
    },
  },
  {
    id: 'pen-control',
    name: 'Sách luyện tập thư pháp & kỹ năng kiểm soát bút',
    chineseName: '控笔线条与书法基本功',
    category: 'Thư pháp & Bút nét',
    description: 'Tập các nét cơ bản, nét thẳng, nét ngang, nét cong và đường xoắn ốc giúp làm chủ lực tay.',
    badge: 'Hot',
    config: {
      characters: '一丨丿捺乙亅乚乛𠃍𠄌',
      gridType: 'hui',
      gridSizeMm: 30,
      gridLineColor: '#4CAF50',
      fontFamily: "'Ma Shan Zheng', cursive",
      sampleCount: 1,
      traceCount: 3,
      emptyCount: 4,
      showHeader: true,
      headerTitle: 'KỸ NĂNG KIỂM SOÁT BÚT & BÚT NÉT',
    },
  },
  {
    id: 'stroke-order-book',
    name: 'Sách luyện viết thư pháp với thứ tự các nét',
    chineseName: '笔顺与笔画顺序字帖',
    category: 'Thứ tự nét',
    description: 'Hiển thị từng bước thứ tự nét viết từ dễ đến khó cho người mới bắt đầu.',
    badge: 'Mới',
    config: {
      characters: '永 汉 字 写 练 笔 顺 楷 帖 习',
      gridType: 'mi',
      gridSizeMm: 28,
      gridLineColor: '#00b894',
      practiceMode: 'stroke',
      fontFamily: "'LXGW WenKai', 'KaiTi', serif",
      showHeader: true,
      headerTitle: 'SÁCH LUYỆN THỨ TỰ NÉT CHỮ HÁN',
    },
  },
  {
    id: 'hard-pen-calligraphy',
    name: 'Sách luyện viết thư pháp bằng bút cứng',
    chineseName: '硬笔书法美文字帖',
    category: 'Bút cứng',
    description: 'Chữ Khải Thể thanh tú, luyện viết trích dẫn, thơ hay từ ngữ giàu ý nghĩa.',
    badge: 'Khuyên dùng',
    config: {
      characters: '静以修身 俭以养德 明志致远 宁静致远 尚德 敏学',
      gridType: 'hui',
      gridSizeMm: 30,
      gridLineColor: '#2980b9',
      fontFamily: "'LXGW WenKai', 'KaiTi', serif",
      sampleCount: 1,
      traceCount: 4,
      emptyCount: 5,
      showHeader: true,
      headerTitle: 'LUYỆN THƯ PHÁP BÚT CỨNG',
    },
  },
  {
    id: 'hsk-vocab-book',
    name: 'Sách học chữ Hán & Từ vựng HSK',
    chineseName: '汉语水平考试 (HSK) 核心生字本',
    category: 'Từ vựng',
    description: 'Tạo tập viết từ vựng HSK kèm Pinyin chuẩn, thích hợp luyện thi và giao tiếp.',
    config: {
      characters: '你好 谢谢 再见 中国 老师 学生 喜欢 学习 朋友 快乐',
      gridType: 'tian',
      gridSizeMm: 25,
      gridLineColor: '#16a085',
      showPinyin: true,
      practiceMode: 'vocabulary',
      fontFamily: "'LXGW WenKai', 'KaiTi', serif",
      sampleCount: 1,
      traceCount: 3,
      emptyCount: 4,
      showHeader: true,
      headerTitle: 'TỪ VỰNG TIẾNG TRUNG THÔNG DỤNG',
    },
  },
  {
    id: 'horizontal-sentence-book',
    name: 'Sách tập viết chữ theo dòng ngang',
    chineseName: '横排行文与短句练习',
    category: 'Đoạn văn',
    description: 'Tập viết câu dài và bài văn ngắn theo hàng ngang tự nhiên.',
    config: {
      characters: '学而时习之不亦说乎 有朋自远方来不亦乐乎 人不知而不愠不亦君子乎',
      gridType: 'square',
      gridSizeMm: 20,
      gridLineColor: '#7f8c8d',
      practiceMode: 'paragraph',
      fontFamily: "'ZCOOL XiaoWei', serif",
      sampleCount: 1,
      traceCount: 2,
      emptyCount: 2,
      showHeader: true,
      headerTitle: 'LUYỆN VIẾT CÂU & ĐOẠN VĂN',
    },
  },
  {
    id: 'huigongge-special',
    name: 'Mẫu Ô Hồi Cung (Giấy ô hồi căn chữ chuẩn)',
    chineseName: '回宫格结构定心练习',
    category: 'Ô đặc biệt',
    description: 'Sử dụng ô hồi khung vuông nhỏ ở trung tâm giúp định tâm chữ Hán chuẩn 100%.',
    badge: 'Mẫu Ô Hồi',
    config: {
      characters: '福 禄 寿 喜 德 智 勇 和 顺 康',
      gridType: 'hui',
      gridSizeMm: 32,
      gridLineColor: '#d35400',
      fontFamily: "'LXGW WenKai', 'KaiTi', serif",
      sampleCount: 1,
      traceCount: 4,
      emptyCount: 5,
      showHeader: true,
      headerTitle: 'LUYỆN CẤU TRÚC Ô HỒI CUNG',
    },
  },
  {
    id: 'basic-stroke-completion',
    name: 'Sách luyện viết 42 nét tiếng Trung chuẩn',
    chineseName: '42种基础与复合笔画专项字帖',
    category: 'Nét cơ bản',
    description: 'Bảng tổng hợp đầy đủ 42 nét cơ bản & nét phức tiếng Trung theo bảng chuẩn.',
    config: {
      characters: 'ngang_dai, ngang_ngan, so_gon, so_kim, phay_nam, phay_ngan, phay_dai, cham_ngan, cham_dai, cham_trai, hat, mac_1, mac_2, mac_nam, ngang_gap, ngang_gap_moc, ngang_phay, ngang_moc, ngang_gap_hat, ngang_gap_cong, ngang_gap_cong_moc, ngang_gap_cong_phay, so_moc, so_cong, so_hat, so_phay, so_cong_phay, so_gap, so_gap_gap_moc, so_cong_moc, ngang_phay_cong_moc, ngang_cong_moc, phay_hat, phay_cham, cong_moc, nghieng_moc, ngang_nghieng_moc, ngang_gap_gap_phay, ngang_gap_gap_gap_moc, so_gap_phay, ngang_gap_gap_gap, so_gap_gap',
      gridType: 'mi',
      gridSizeMm: 30,
      gridLineColor: '#4CAF50',
      practiceMode: 'basicStroke',
      fontFamily: "'LXGW WenKai', 'KaiTi', '楷体', serif",
      sampleCount: 1,
      traceCount: 3,
      emptyCount: 4,
      showHeader: true,
      headerTitle: 'BẢNG CÁC NÉT CƠ BẢN TIẾNG TRUNG (CHUẨN KHẢI THƯ)',
    },
  },
  {
    id: 'custom-name-label',
    name: 'Nhãn dán tên & Phông chữ tùy chỉnh',
    chineseName: '姓名与个性签名练习',
    category: 'Tên cá nhân',
    description: 'Mẫu chữ viết tên cá nhân đẹp như chữ ký nghệ thuật.',
    config: {
      characters: '李华 王强 张伟 陈静 刘洋',
      gridType: 'mi',
      gridSizeMm: 35,
      gridLineColor: '#c0392b',
      fontFamily: "'Long Cang', cursive",
      sampleCount: 1,
      traceCount: 5,
      emptyCount: 4,
      showHeader: true,
      headerTitle: 'LUYỆN VIẾT TÊN CÁ NHÂN',
    },
  },
];

export const DEFAULT_CONFIG: WorksheetConfig = {
  characters: '',
  blankPaper: false,
  practiceMode: 'single',

  gridType: 'hui',
  gridSizeMm: 16.36,
  gridLineColor: '#2563eb',
  gridLineWidth: 0.18,
  gridLineDash: true,
  columnsPerRow: 11,
  fillRemainingPage: true,
  fillRowWithTrace: false,
  extraEmptyRows: 2,
  lineRowHeight: 13,
  verticalRowsPerCol: 12,
  verticalColWidth: 16,
  rowGapMm: 3.0,
  columnGapMm: 3.0,

  paperSize: PAPER_SIZES[1], // A4
  orientation: 'portrait',
  margins: { ...DEFAULT_MARGINS },

  fontSize: 0.85,
  fontOpacity: 0.35,
  fontWeight: 400,
  fontColor: '#1e293b',
  fontFamily: "'LXGW WenKai', 'KaiTi', '楷体', 'STKaiti', serif",
  fillStyle: 'standard',

  sampleCount: 1,
  traceCount: 5,
  showTrace: true,
  emptyCount: 0,
  emptyRows: 1,

  showPinyin: false,
  pinyinStyle: 'above',
  pinyinWithTone: true,
  pinyinShowTraceHint: false,
  pinyinWordGap: 1,
  pinyinDistance: 0,
  pinyinLineSpacing: 0,

  showHeader: true,
  headerTitle: 'HANZI PRACTICE',
  headerShowName: true,
  headerShowClass: true,
  headerShowDate: true,
  headerFontFamily: "var(--font-sans), sans-serif",
  headerFontSize: 4.5,
  headerFontColor: '#1e293b',
  headerFontBold: true,
  headerFontItalic: false,
  headerFontUnderline: false,
};

// ============================================================
// Layout Types (computed)
// ============================================================
export interface CellData {
  character: string;
  type: 'sample' | 'trace' | 'empty' | 'strokeStep';
  x: number; // mm from left edge of usable area
  y: number; // mm from top edge of usable area (within page)
  pinyin?: string;
  opacity: number;
  fillStyle: FillStyle;
  strokeStepIndex?: number; // 0-based index for stroke breakdown
}

export interface CharacterRow {
  character: string;
  pinyin?: string;
  radical?: string;
  structure?: { zh: string; vi: string };
  strokeCount?: number;
  isRadicalBlock?: boolean;
  blockRowCount?: number;
  radicalDetail?: string;
  variantChar?: string;   // biến thể form, e.g. '亻' for '人'
  isLineRow?: boolean;    // true when this row is part of line-grid rendering
  lineCharWidth?: number; // mm — width of each char slot in a line row
  lineCharStep?: number;  // mm — horizontal step between char slots (including spacing)
  isVerticalCol?: boolean; // true when this row represents a vertical column
  colWidth?: number;      // mm — column width for vertical grid mode
  cells: CellData[];
  y: number; // mm from top of usable area
  rowHeight: number; // mm (grid size + pinyin height if applicable)
}

export interface PageLayout {
  pageIndex: number;
  rows: CharacterRow[];
  headerHeight: number; // mm
}

export interface LayoutResult {
  columns: number;
  rowsPerPage: number;
  pages: PageLayout[];
  usableWidth: number; // mm
  usableHeight: number; // mm
  paperWidth: number; // mm (after orientation)
  paperHeight: number; // mm (after orientation)
  gridSizeMm: number;
  rowHeightMm: number; // mm — actual row height (= gridSizeMm except in line mode)
  pinyinRowHeight: number; // mm
  headerHeight: number; // mm
  totalCharacters: number;
}

// ============================================================
// Responsive Breakpoints
// ============================================================
export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  laptop: 1200,
  desktop: 1600,
} as const;

// ============================================================
// Bottom Sheet Tabs
// ============================================================
export type BottomSheetTab = 'content' | 'practice' | 'grid' | 'font' | 'page';

export interface BottomSheetTabInfo {
  id: BottomSheetTab;
  label: string;
  icon: string;
}

export const BOTTOM_SHEET_TABS: BottomSheetTabInfo[] = [
  { id: 'content', label: 'Nội dung', icon: '' },
  { id: 'practice', label: 'Kiểu luyện', icon: '' },
  { id: 'grid', label: 'Kiểu ô', icon: '' },
  { id: 'font', label: 'Phông chữ', icon: '' },
  { id: 'page', label: 'Trang giấy', icon: '' },
];
