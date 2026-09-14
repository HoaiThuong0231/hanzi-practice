/**
 * 214 Chinese Radicals Data & Character Meta Lookup
 * 
 * Provides radical info, stroke counts, pinyin, and structural breakdown
 * for Chinese characters and the 214 Kangxi radicals.
 */

export interface RadicalInfo {
  number: number;
  radical: string;
  pinyin: string;
  strokes: number;
  meaning: string;
  examples: string[];
}

export const RADICALS_214: RadicalInfo[] = [
  { number: 1, radical: '一', pinyin: 'yī', strokes: 1, meaning: 'Nhất (một)', examples: ['七', '三', '上'] },
  { number: 2, radical: '丨', pinyin: 'gǔn', strokes: 1, meaning: 'Cổn (nét sổ)', examples: ['中', '丰', '串'] },
  { number: 3, radical: '丶', pinyin: 'zhǔ', strokes: 1, meaning: 'Chủ (chấm)', examples: ['丸', '丹', '主'] },
  { number: 4, radical: '丿', pinyin: 'piě', strokes: 1, meaning: 'Phiệt (nét phẩy)', examples: ['乂', '乃', '久'] },
  { number: 5, radical: '乙', pinyin: 'yǐ', strokes: 1, meaning: 'Ất (thứ 2)', examples: ['九', '乞', '也'] },
  { number: 6, radical: '亅', pinyin: 'jué', strokes: 1, meaning: 'Quyết (nét móc)', examples: ['了', '予', '争'] },
  { number: 7, radical: '二', pinyin: 'èr', strokes: 2, meaning: 'Nhị (hai)', examples: ['于', '云', '五'] },
  { number: 8, radical: '亠', pinyin: 'tóu', strokes: 2, meaning: 'Đầu (mái che)', examples: ['亡', '交', '京'] },
  { number: 9, radical: '人', pinyin: 'rén', strokes: 2, meaning: 'Nhân (người)', examples: ['今', '介', '仕'] },
  { number: 10, radical: '儿', pinyin: 'ér', strokes: 2, meaning: 'Nhi (trẻ con)', examples: ['允', '元', '兄'] },
  { number: 11, radical: '入', pinyin: 'rù', strokes: 2, meaning: 'Nhập (vào)', examples: ['全', '两'] },
  { number: 12, radical: '八', pinyin: 'bā', strokes: 2, meaning: 'Bát (tám)', examples: ['公', '六', '共'] },
  { number: 13, radical: '冂', pinyin: 'jiǒng', strokes: 2, meaning: 'Quynh (biên giới)', examples: ['册', '再', '同'] },
  { number: 14, radical: '冖', pinyin: 'mì', strokes: 2, meaning: 'Mịch (trùm đậy)', examples: ['冗', '写', '军'] },
  { number: 15, radical: '冫', pinyin: 'bīng', strokes: 2, meaning: 'Băng (nước đá)', examples: ['冬', '冰', '冷'] },
  { number: 16, radical: '几', pinyin: 'jī', strokes: 2, meaning: 'Kỷ (ghế, bàn)', examples: ['凡', '凤', '凯'] },
  { number: 17, radical: '凵', pinyin: 'kǎn', strokes: 2, meaning: 'Khảm (há miệng)', examples: ['凶', '出', '函'] },
  { number: 18, radical: '刀', pinyin: 'dāo', strokes: 2, meaning: 'Đao (dao)', examples: ['切', '刑', '划'] },
  { number: 19, radical: '力', pinyin: 'lì', strokes: 2, meaning: 'Lực (sức mạnh)', examples: ['劝', '办', '功'] },
  { number: 20, radical: '勹', pinyin: 'bāo', strokes: 2, meaning: 'Bao (bọc)', examples: ['勺', '勾', '包'] },
  { number: 21, radical: '匕', pinyin: 'bǐ', strokes: 2, meaning: 'Chỉ (thìa, muỗng)', examples: ['北', '旨'] },
  { number: 22, radical: '匚', pinyin: 'fāng', strokes: 2, meaning: 'Phương (tủ đựng)', examples: ['匠', '匡', '匪'] },
  { number: 23, radical: '匸', pinyin: 'xì', strokes: 2, meaning: 'Hệ (che đậy)', examples: ['匹', '医'] },
  { number: 24, radical: '十', pinyin: 'shí', strokes: 2, meaning: 'Thập (mười)', examples: ['千', '升', '午'] },
  { number: 25, radical: '卜', pinyin: 'bǔ', strokes: 2, meaning: 'Bói (bói toán)', examples: ['占', '卡', '卧'] },
  { number: 26, radical: '卩', pinyin: 'jié', strokes: 2, meaning: 'Tiết (thẻ tre)', examples: ['卫', '印', '危'] },
  { number: 27, radical: '厂', pinyin: 'chǎng', strokes: 2, meaning: 'Xưởng (sườn núi)', examples: ['历', '压', '原'] },
  { number: 28, radical: '厶', pinyin: 'sī', strokes: 2, meaning: 'Tư (riêng tư)', examples: ['县', '参'] },
  { number: 29, radical: '又', pinyin: 'yòu', strokes: 2, meaning: 'Hựu (lại, lại nữa)', examples: ['叉', '反', '双'] },
  { number: 30, radical: '口', pinyin: 'kǒu', strokes: 3, meaning: 'Khẩu (miệng)', examples: ['古', '叫', '可'] },
  { number: 31, radical: '囗', pinyin: 'wéi', strokes: 3, meaning: 'Vi (vây quanh)', examples: ['四', '回', '因'] },
  { number: 32, radical: '土', pinyin: 'tǔ', strokes: 3, meaning: 'Thổ (đất)', examples: ['圣', '地', '场'] },
  { number: 33, radical: '士', pinyin: 'shì', strokes: 3, meaning: 'Sĩ (quan lại)', examples: ['壬', '壮', '声'] },
  { number: 34, radical: '夂', pinyin: 'zhǐ', strokes: 3, meaning: 'Trĩ (đi chậm)', examples: ['处', '备'] },
  { number: 35, radical: '夕', pinyin: 'xī', strokes: 3, meaning: 'Tịch (chín chiều)', examples: ['外', '多', '夜'] },
  { number: 36, radical: '大', pinyin: 'dà', strokes: 3, meaning: 'Đại (lớn)', examples: ['太', '夫', '央'] },
  { number: 37, radical: '女', pinyin: 'nǚ', strokes: 3, meaning: 'Nữ (con gái)', examples: ['奶', '如', '妇'] },
  { number: 38, radical: '子', pinyin: 'zǐ', strokes: 3, meaning: 'Tử (con)', examples: ['孔', '字', '存'] },
  { number: 39, radical: '宀', pinyin: 'mián', strokes: 3, meaning: 'Miên (mái nhà)', examples: ['宁', '宅', '宇'] },
  { number: 40, radical: '寸', pinyin: 'cùn', strokes: 3, meaning: 'Thốn (tấc)', examples: ['对', '寻', '导'] },
  { number: 41, radical: '小', pinyin: 'xiǎo', strokes: 3, meaning: 'Tiểu (nhỏ)', examples: ['少', '尔', '尖'] },
  { number: 42, radical: '尢', pinyin: 'wāng', strokes: 3, meaning: 'Uông (tàn tật)', examples: ['尤', '就'] },
  { number: 43, radical: '尸', pinyin: 'shī', strokes: 3, meaning: 'Thi (thây ma)', examples: ['尺', '尼', '尾'] },
  { number: 44, radical: '屮', pinyin: 'chè', strokes: 3, meaning: 'Triệt (mầm cây)', examples: ['屯'] },
  { number: 45, radical: '山', pinyin: 'shān', strokes: 3, meaning: 'Sơn (núi)', examples: ['岁', '岛', '岗'] },
  { number: 46, radical: '巛', pinyin: 'chuān', strokes: 3, meaning: 'Xuyên (sông)', examples: ['川', '州', '巡'] },
  { number: 47, radical: '工', pinyin: 'gōng', strokes: 3, meaning: 'Công (thợ)', examples: ['左', '巧', '巨'] },
  { number: 48, radical: '己', pinyin: 'jǐ', strokes: 3, meaning: 'Kỷ (bản thân)', examples: ['已', '巴', '巷'] },
  { number: 49, radical: '巾', pinyin: 'jīn', strokes: 3, meaning: 'Cân (khăn)', examples: ['币', '市', '布'] },
  { number: 50, radical: '干', pinyin: 'gān', strokes: 3, meaning: 'Can (lá chắn)', examples: ['平', '年', '并'] },
  { number: 51, radical: '幺', pinyin: 'yāo', strokes: 3, meaning: 'Yêu (nhỏ nhặt)', examples: ['幻', '幼'] },
  { number: 52, radical: '广', pinyin: 'guǎng', strokes: 3, meaning: 'Quảng (mái nhà)', examples: ['庄', '床', '序'] },
  { number: 53, radical: '廴', pinyin: 'yǐn', strokes: 3, meaning: 'Dẫn (đi xa)', examples: ['延', '建'] },
  { number: 55, radical: '廾', pinyin: 'gǒng', strokes: 3, meaning: 'Củng (chắp tay)', examples: ['弄', '弃', '弊'] },
  { number: 56, radical: '弋', pinyin: 'yì', strokes: 3, meaning: 'Dặc (bắn tên)', examples: ['式', '弑'] },
  { number: 56, radical: '弓', pinyin: 'gōng', strokes: 3, meaning: 'Cung (cây cung)', examples: ['引', '张', '弯'] },
  { number: 57, radical: '彐', pinyin: 'jì', strokes: 3, meaning: 'Ký (đầu heo)', examples: ['归', '当', '录'] },
  { number: 58, radical: '彡', pinyin: 'shān', strokes: 3, meaning: 'Sâm (lông dài)', examples: ['形', '彦', '彩'] },
  { number: 59, radical: '彳', pinyin: 'chì', strokes: 3, meaning: 'Xích (bước chân trái)', examples: ['役', '往', '征'] },
  { number: 85, radical: '水', pinyin: 'shuǐ', strokes: 4, meaning: 'Thủy (nước)', examples: ['氵', '求', '江', '河'] },
  { number: 86, radical: '火', pinyin: 'huǒ', strokes: 4, meaning: 'Hỏa (lửa)', examples: ['灬', '灯', '灰', '烧'] },
  { number: 140, radical: '艹', pinyin: 'cǎo', strokes: 3, meaning: 'Thảo (cỏ)', examples: ['花', '草', '茶'] },
  { number: 149, radical: '讠', pinyin: 'yán', strokes: 2, meaning: 'Ngôn (lời nói)', examples: ['诗', '话', '语', '读'] },
  { number: 120, radical: '纟', pinyin: 'sī', strokes: 3, meaning: 'Mịch (tơ lụa)', examples: ['红', '级', '绿', '繁'] },
];

/**
 * All 214 Kangxi Radicals (Simplified/Traditional Standard List)
 */
export const ALL_214_RADICALS: string[] = [
  '一', '丨', '丶', '丿', '乙', '亅', '二', '亠', '人', '儿', '入', '八', '冂', '冖', '冫', '几',
  '凵', '刀', '力', '勹', '匕', '匚', '匸', '十', '卜', '卩', '厂', '厶', '又', '口', '囗', '土',
  '士', '夂', '夊', '夕', '大', '女', '子', '宀', '寸', '小', '尢', '尸', '屮', '山', '巛', '工',
  '己', '巾', '干', '幺', '广', '廴', '廾', '弋', '弓', '彐', '彡', '彳', '心', '戈', '戶', '手',
  '支', '攴', '文', '斗', '斤', '方', '无', '日', '曰', '月', '木', '欠', '止', '歹', '殳', '毋',
  '比', '毛', '氏', '气', '水', '火', '爪', '父', '爻', '爿', '片', '牙', '牛', '犬', '玄', '玉',
  '瓜', '瓦', '甘', '生', '用', '田', '疋', '疒', '癶', '白', '皮', '皿', '目', '矛', '矢', '石',
  '示', '禸', '禾', '穴', '立', '竹', '米', '糸', '缶', '网', '羊', '羽', '老', '而', '耒', '耳',
  '聿', '肉', '臣', '自', '至', '臼', '舌', '舛', '舟', '艮', '色', '艸', '虍', '虫', '血', '行',
  '衣', '襾', '見', '角', '言', '谷', '豆', '豕', '豸', '貝', '赤', '走', '足', '身', '車', '辛',
  '辰', '辵', '邑', '酉', '釆', '里', '金', '長', '門', '阜', '隶', '隹', '雨', '靑', '非', '面',
  '革', '韋', '韭', '音', '頁', '風', '飛', '食', '首', '香', '馬', '骨', '高', '髟', '鬥', '鬯',
  '鬲', '鬼', '魚', '鳥', '鹵', '鹿', '麥', '麻', '黃', '黍', '黑', '黹', '黽', '鼎', '鼓', '鼠',
  '鼻', '齊', '齒', '龍', '龜', '龠'
];

import { BASIC_STROKES_LIST } from './basic-strokes';

/**
 * Standard 28 Basic Chinese Stroke Characters (matching reference chart)
 */
export const ALL_BASIC_STROKES: string[] = BASIC_STROKES_LIST.map(s => s.id);

/**
 * Common Structure Names in Chinese & Vietnamese
 */
export const STRUCTURE_NAMES: Record<string, { zh: string; vi: string }> = {
  leftRight: { zh: '左右结构', vi: 'Trái - Phải' },
  topBottom: { zh: '上下结构', vi: 'Trên - Dưới' },
  single: { zh: '独体字', vi: 'Chữ đơn' },
  halfEnclosed: { zh: '半包围结构', vi: 'Nửa bao vây' },
  fullEnclosed: { zh: '全包围结构', vi: 'Bao vây toàn bộ' },
  topMiddleBottom: { zh: '上中下结构', vi: 'Trên - Giữa - Dưới' },
  leftMiddleRight: { zh: '左中右结构', vi: 'Trái - Giữa - Phải' },
};

/**
 * Get radical for a character (or estimate based on component)
 */
export function getCharacterRadical(char: string): string {
  // Known character radical mappings
  const radicalMap: Record<string, string> = {
    '诗': '讠',
    '童': '立',
    '趁': '走',
    '碧': '石',
    '妆': '丬',
    '绿': '纟',
    '繁': '纟',
    '永': '水',
    '汉': '氵',
    '字': '宀',
    '写': '冖',
    '练': '纟',
    '笔': '竹',
    '顺': '页',
    '楷': '木',
    '帖': '巾',
    '习': '乙',
    '你': '亻',
    '好': '女',
    '谢': '讠',
    '学': '子',
    '生': '生',
    '国': '囗',
    '老': '老',
    '师': '巾',
  };

  if (radicalMap[char]) return radicalMap[char];

  // Search in 214 radicals
  for (const r of RADICALS_214) {
    if (r.examples.includes(char) || char === r.radical) {
      return r.radical;
    }
  }

  return char[0] || '一';
}

/**
 * Get structure name for a character
 */
export function getCharacterStructure(char: string): { zh: string; vi: string } {
  const structureMap: Record<string, { zh: string; vi: string }> = {
    '诗': STRUCTURE_NAMES.leftRight,
    '童': STRUCTURE_NAMES.topBottom,
    '趁': STRUCTURE_NAMES.halfEnclosed,
    '碧': STRUCTURE_NAMES.topBottom,
    '妆': STRUCTURE_NAMES.leftRight,
    '绿': STRUCTURE_NAMES.leftRight,
    '繁': STRUCTURE_NAMES.topBottom,
    '永': STRUCTURE_NAMES.single,
    '汉': STRUCTURE_NAMES.leftRight,
    '字': STRUCTURE_NAMES.topBottom,
    '写': STRUCTURE_NAMES.topBottom,
    '练': STRUCTURE_NAMES.leftRight,
    '笔': STRUCTURE_NAMES.topBottom,
    '你': STRUCTURE_NAMES.leftRight,
    '好': STRUCTURE_NAMES.leftRight,
    '国': STRUCTURE_NAMES.fullEnclosed,
  };

  return structureMap[char] || STRUCTURE_NAMES.leftRight;
}

/**
 * Get detailed radical header note string (matching user exact requested format)
 * Example: 人 /rén/ : bộ Nhân. biến thể (亻) , nghĩa: người
 */
export function getRadicalFullDetail(char: string): string {
  const detailMap: Record<string, { num: number; py: string; hv: string; var?: string; mean: string }> = {
    '一': { num: 1, py: 'yī', hv: 'Nhất', mean: 'một' },
    '丨': { num: 2, py: 'gǔn', hv: 'Cổn', mean: 'nét sổ' },
    '丶': { num: 3, py: 'zhǔ', hv: 'Chủ', mean: 'nét chấm' },
    '丿': { num: 4, py: 'piě', hv: 'Phiệt', mean: 'nét phẩy' },
    '乙': { num: 5, py: 'yǐ', hv: 'Ất', mean: 'vị trí thứ 2' },
    '亅': { num: 6, py: 'jué', hv: 'Quyết', mean: 'nét móc' },
    '二': { num: 7, py: 'èr', hv: 'Nhị', mean: 'số hai' },
    '亠': { num: 8, py: 'tóu', hv: 'Đầu', mean: 'mái che' },
    '人': { num: 9, py: 'rén', hv: 'Nhân', var: '亻', mean: 'người' },
    '儿': { num: 10, py: 'ér', hv: 'Nhi', mean: 'trẻ con' },
    '入': { num: 11, py: 'rù', hv: 'Nhập', mean: 'vào' },
    '八': { num: 12, py: 'bā', hv: 'Bát', mean: 'số tám' },
    '冂': { num: 13, py: 'jiǒng', hv: 'Quynh', mean: 'vùng biên giới' },
    '冖': { num: 14, py: 'mì', hv: 'Mịch', mean: 'trùm đậy' },
    '冫': { num: 15, py: 'bīng', hv: 'Băng', mean: 'nước đá' },
    '几': { num: 16, py: 'jī', hv: 'Kỷ', mean: 'cái bàn nhỏ' },
    '凵': { num: 17, py: 'kǎn', hv: 'Khảm', mean: 'há miệng' },
    '刀': { num: 18, py: 'dāo', hv: 'Đao', var: '刂', mean: 'dao, kiếm' },
    '力': { num: 19, py: 'lì', hv: 'Lực', mean: 'sức mạnh' },
    '勹': { num: 20, py: 'bāo', hv: 'Bao', mean: 'bọc gói' },
    '匕': { num: 21, py: 'bǐ', hv: 'Chỉ', mean: 'cái thìa' },
    '匚': { num: 22, py: 'fāng', hv: 'Phương', mean: 'tủ đựng' },
    '匸': { num: 23, py: 'xì', hv: 'Hệ', mean: 'che đậy' },
    '十': { num: 24, py: 'shí', hv: 'Thập', mean: 'số mười' },
    '卜': { num: 25, py: 'bǔ', hv: 'Bói', mean: 'bói toán' },
    '卩': { num: 26, py: 'jié', hv: 'Tiết', var: '⺉', mean: 'thẻ tre' },
    '厂': { num: 27, py: 'chǎng', hv: 'Xưởng', mean: 'sườn núi' },
    '厶': { num: 28, py: 'sī', hv: 'Tư', mean: 'riêng tư' },
    '又': { num: 29, py: 'yòu', hv: 'Hựu', mean: 'lại nữa' },
    '口': { num: 30, py: 'kǒu', hv: 'Khẩu', mean: 'cái miệng' },
    '囗': { num: 31, py: 'wéi', hv: 'Vi', mean: 'vây quanh' },
    '土': { num: 32, py: 'tǔ', hv: 'Thổ', mean: 'đất' },
    '士': { num: 33, py: 'shì', hv: 'Sĩ', mean: 'quan lại' },
    '夂': { num: 34, py: 'zhǐ', hv: 'Trĩ', mean: 'đi chậm' },
    '夕': { num: 35, py: 'xī', hv: 'Tịch', mean: 'đêm tối' },
    '大': { num: 36, py: 'dà', hv: 'Đại', mean: 'lớn' },
    '女': { num: 37, py: 'nǚ', hv: 'Nữ', mean: 'con gái' },
    '子': { num: 38, py: 'zǐ', hv: 'Tử', mean: 'con' },
    '宀': { num: 39, py: 'mián', hv: 'Miên', mean: 'mái nhà' },
    '寸': { num: 40, py: 'cùn', hv: 'Thốn', mean: 'tấc' },
    '小': { num: 41, py: 'xiǎo', hv: 'Tiểu', mean: 'nhỏ' },
    '尢': { num: 42, py: 'wāng', hv: 'Uông', mean: 'tàn tật' },
    '尸': { num: 43, py: 'shī', hv: 'Thi', mean: 'thây ma' },
    '屮': { num: 44, py: 'chè', hv: 'Triệt', mean: 'mầm cây' },
    '山': { num: 45, py: 'shān', hv: 'Sơn', mean: 'núi' },
    '巛': { num: 46, py: 'chuān', hv: 'Xuyên', mean: 'sông lớn' },
    '工': { num: 47, py: 'gōng', hv: 'Công', mean: 'người thợ' },
    '己': { num: 48, py: 'jǐ', hv: 'Kỷ', mean: 'bản thân' },
    '巾': { num: 49, py: 'jīn', hv: 'Cân', mean: 'khăn' },
    '干': { num: 50, py: 'gān', hv: 'Can', mean: 'lá chắn' },
    '幺': { num: 51, py: 'yāo', hv: 'Yêu', mean: 'nhỏ nhặt' },
    '广': { num: 52, py: 'guǎng', hv: 'Quảng', mean: 'mái nhà rộng' },
    '廴': { num: 53, py: 'yǐn', hv: 'Dẫn', mean: 'đi xa' },
    '廾': { num: 55, py: 'gǒng', hv: 'Củng', mean: 'hai tay chắp lại' },
    '弋': { num: 56, py: 'yì', hv: 'Dặc', mean: 'bắn tên' },
    '弓': { num: 56, py: 'gōng', hv: 'Cung', mean: 'cây cung' },
    '彐': { num: 57, py: 'jì', hv: 'Ký', mean: 'đầu heo' },
    '彡': { num: 58, py: 'shān', hv: 'Sâm', mean: 'lông dài' },
    '彳': { num: 59, py: 'chì', hv: 'Xích', mean: 'bước chân trái' },
    '心': { num: 60, py: 'xīn', hv: 'Tâm', var: '忄', mean: 'quả tim, lòng' },
    '戈': { num: 61, py: 'gē', hv: 'Qua', mean: 'cây giáo' },
    '戶': { num: 62, py: 'hù', hv: 'Hộ', mean: 'cửa một cánh' },
    '手': { num: 63, py: 'shǒu', hv: 'Thủ', var: '扌', mean: 'bàn tay' },
    '支': { num: 64, py: 'zhī', hv: 'Chi', mean: 'cành cây' },
    '攴': { num: 65, py: 'pū', hv: 'Phộc', var: '攵', mean: 'đánh nhẹ' },
    '文': { num: 66, py: 'wén', hv: 'Văn', mean: 'văn hóa, chữ' },
    '斗': { num: 67, py: 'dǒu', hv: 'Đẩu', mean: 'cái đẩu' },
    '斤': { num: 68, py: 'jīn', hv: 'Cân', mean: 'rìu, cân' },
    '方': { num: 69, py: 'fāng', hv: 'Phương', mean: 'vuông, hướng' },
    '无': { num: 70, py: 'wú', hv: 'Vô', mean: 'không' },
    '日': { num: 71, py: 'rì', hv: 'Nhật', mean: 'mặt trời, ngày' },
    '曰': { num: 72, py: 'yuē', hv: 'Viết', mean: 'nói rằng' },
    '月': { num: 73, py: 'yuè', hv: 'Nguyệt', mean: 'mặt trăng, tháng' },
    '木': { num: 74, py: 'mù', hv: 'Mộc', mean: 'cây, gỗ' },
    '欠': { num: 75, py: 'qiàn', hv: 'Khiếm', mean: 'ngáp, thiếu' },
    '止': { num: 76, py: 'zhǐ', hv: 'Chỉ', mean: 'dừng lại' },
    '歹': { num: 77, py: 'dǎi', hv: 'Đãi', mean: 'chết, xấu' },
    '殳': { num: 78, py: 'shū', hv: 'Thù', mean: 'binh khí' },
    '毋': { num: 79, py: 'wú', hv: 'Vô', mean: 'chớ, đừng' },
    '比': { num: 80, py: 'bǐ', hv: 'Tỷ', mean: 'so sánh' },
    '毛': { num: 81, py: 'máo', hv: 'Mao', mean: 'lông' },
    '氏': { num: 82, py: 'shì', hv: 'Thị', mean: 'họ hàng' },
    '气': { num: 83, py: 'qì', hv: 'Khí', mean: 'hơi nước, khí' },
    '水': { num: 84, py: 'shuǐ', hv: 'Thủy', var: '氵', mean: 'nước' },
    '火': { num: 85, py: 'huǒ', hv: 'Hỏa', var: '灬', mean: 'lửa' },
    '爪': { num: 86, py: 'zhuǎ', hv: 'Trảo', var: '爫', mean: 'móng nanh' },
    '父': { num: 87, py: 'fù', hv: 'Phụ', mean: 'cha' },
    '爻': { num: 88, py: 'yáo', hv: 'Hào', mean: 'quẻ hào' },
    '爿': { num: 89, py: 'pán', hv: 'Tường', mean: 'mảnh gỗ' },
    '片': { num: 90, py: 'piàn', hv: 'Phiến', mean: 'mảnh, lá' },
    '牙': { num: 91, py: 'yá', hv: 'Nha', mean: 'răng' },
    '牛': { num: 92, py: 'niú', hv: 'Ngưu', var: '牜', mean: 'trâu, bò' },
    '犬': { num: 93, py: 'quǎn', hv: 'Khuyển', var: '犭', mean: 'con chó' },
    '讠': { num: 149, py: 'yán', hv: 'Ngôn', mean: 'lời nói' },
    '纟': { num: 120, py: 'sī', hv: 'Mịch', mean: 'tơ lụa' },
    '艹': { num: 140, py: 'cǎo', hv: 'Thảo', mean: 'cỏ' },
    '夊': { num: 35, py: 'suī', hv: 'Tuy', mean: 'đi chậm rãi' },
    '癶': { num: 105, py: 'bō', hv: 'Bát', mean: 'chân giẫm đạp' },
    '釆': { num: 165, py: 'biàn', hv: 'Biện', mean: 'phân biệt' },
    '阜': { num: 170, py: 'fù', hv: 'Phụ', var: '阝', mean: 'gò đất, đồi' },
    '隶': { num: 171, py: 'lì', hv: 'Đãi', mean: 'theo kịp, nô lệ' },
    '韭': { num: 179, py: 'jiǔ', hv: 'Cửu', mean: 'rau hẹ' },
    '黹': { num: 204, py: 'zhǐ', hv: 'Chỉ', mean: 'thêu thùa' },
  };

  const info = detailMap[char];
  if (info) {
    const varStr = info.var ? `. biến thể (${info.var})` : '';
    return `${char} /${info.py}/ : bộ ${info.hv}${varStr}, nghĩa: ${info.mean}`;
  }

  // Search in RADICALS_214 array
  const found = RADICALS_214.find(r => r.radical === char);
  if (found) {
    const hvName = found.meaning.replace(/\s*\(.*\)/, '').replace(/\s*(.*?)(\s*\(.*)/, '$1').trim();
    return `${char} /${found.pinyin}/ : bộ ${hvName}, nghĩa: ${found.meaning}`;
  }

  return `${char} : bộ thủ Hán tự`;
}

/**
 * Get the variant form (biến thể) of a radical, if any.
 * Returns undefined if no variant exists.
 * Example: 人 → '亻', 刀 → '刂', 水 → '氵'
 */
export function getRadicalVariant(char: string): string | undefined {
  const variantMap: Record<string, string> = {
    '人': '亻', '刀': '刂', '水': '氵', '火': '灬', '心': '忄',
    '手': '扌', '攴': '攵', '爪': '爫', '牛': '牜', '犬': '犭',
    '卩': '⺉', '邑': '⻏', '阜': '⻖', '食': '饣', '金': '钅',
    '玉': '王', '示': '礻', '衣': '衤', '草': '艹', '糸': '纟',
    '言': '讠', '車': '车', '門': '门', '魚': '鱼', '鳥': '鸟',
  };
  return variantMap[char];
}

/**
 * Get stroke count from static radical data (does not depend on async cache).
 * Falls back to hanzi-writer cache if available.
 * Returns null if unknown.
 */
export function getRadicalStrokeCountStatic(char: string): number | null {
  // First check RADICALS_214 static data
  const found = RADICALS_214.find(r => r.radical === char);
  if (found) return found.strokes;

  // Known stroke counts for common radicals not in RADICALS_214 list
  const knownStrokes: Record<string, number> = {
    '心': 4, '戈': 4, '戶': 4, '手': 4, '支': 4, '攴': 4, '文': 4, '斗': 4,
    '斤': 4, '方': 4, '无': 4, '日': 4, '曰': 4, '月': 4, '木': 4, '欠': 4,
    '止': 4, '歹': 4, '殳': 4, '毋': 4, '比': 4, '毛': 4, '氏': 4, '气': 4,
    '爪': 4, '父': 4, '爻': 4, '爿': 4, '片': 4, '牙': 4, '牛': 4, '犬': 4,
    '玄': 5, '玉': 5, '瓜': 5, '瓦': 5, '甘': 5, '生': 5, '用': 5, '田': 5,
    '疋': 5, '疒': 5, '白': 5, '皮': 5, '皿': 5, '目': 5, '矛': 5, '矢': 5,
    '石': 5, '示': 5, '禸': 5, '禾': 5, '穴': 5, '立': 5,
    '竹': 6, '米': 6, '糸': 6, '缶': 6, '网': 6, '羊': 6, '羽': 6, '老': 6,
    '而': 6, '耒': 6, '耳': 6, '聿': 6, '肉': 6, '臣': 6, '自': 6, '至': 6,
    '臼': 6, '舌': 6, '舛': 6, '舟': 6, '艮': 6, '色': 6, '艸': 6, '虍': 6,
    '虫': 6, '血': 6, '行': 6, '衣': 6, '襾': 6,
    '見': 7, '角': 7, '言': 7, '谷': 7, '豆': 7, '豕': 7, '豸': 7, '貝': 7,
    '赤': 7, '走': 7, '足': 7, '身': 7, '車': 7, '辛': 7, '辰': 7, '辵': 7,
    '邑': 7, '酉': 7, '采': 7, '里': 7,
    '金': 8, '長': 8, '門': 8, '隷': 8, '隹': 8, '雨': 8, '靑': 8, '非': 8,
    '面': 9, '革': 9, '韋': 9, '音': 9, '頁': 9, '風': 9, '飛': 9, '食': 9,
    '首': 9, '香': 9,
    '馬': 10, '骨': 10, '高': 10, '髟': 10, '鬥': 10, '鬯': 10, '鬲': 10, '鬼': 10,
    '魚': 11, '鳥': 11, '鹵': 11, '鹿': 11, '麥': 11, '麻': 11,
    '黃': 12, '黍': 12, '黑': 12, '黽': 13, '鼎': 13, '鼓': 13, '鼠': 13,
    '鼻': 14, '齊': 14, '齒': 15, '龍': 16, '龜': 16, '龠': 17,
    '夊': 3, '廾': 3, '癶': 5, '釆': 7, '阜': 8, '隶': 8, '韭': 9, '黹': 12,
    // Simplified variants
    '讠': 2, '纟': 3, '艹': 3, '扌': 3, '忄': 3, '氵': 3, '刂': 2,
    '犭': 3, '饣': 3, '钅': 5, '礻': 4, '衤': 5,
  };
  return knownStrokes[char] ?? null;
}
