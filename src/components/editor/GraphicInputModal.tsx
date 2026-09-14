/**
 * GraphicInputModal Component
 * 
 * Recreates the exact NQEZ "点击图片输入" modal from Image 1 & 2:
 * 1. 笔画 (All 69 basic & combined strokes with authentic KaiTi SVG calligraphy)
 * 2. 控笔 (50 Pen control patterns / Luyện lực tay from NQEZ kbxl.txt)
 * 3. 偏旁 (Chinese Radicals from NQEZ ppbs.txt)
 */

import React, { useState, useMemo } from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import {
  BASIC_STROKES_LIST,
  ALL_NQEZ_STROKES_TOKENS,
  type BasicStroke
} from '../../data/basic-strokes';

interface GraphicInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 2. NQEZ Pen Control Exercises (控笔 / Luyện lực tay from kbxl.txt)
export const NQEZ_PEN_CONTROL = [
  { name: '直线横', symbol: '—', label: 'Ngang thẳng', desc: 'Luyện nét ngang chuẩn' },
  { name: '横线重至轻', symbol: '━', label: 'Ngang đậm sang nhạt', desc: 'Lực bút từ mạnh đến nhẹ' },
  { name: '横线轻至重', symbol: '─', label: 'Ngang nhạt sang đậm', desc: 'Lực bút từ nhẹ đến mạnh' },
  { name: '顿笔横', symbol: '一', label: 'Ngang nhấn bút', desc: 'Nhấn đầu và đuôi nét' },
  { name: '直线竖', symbol: '|', label: 'Sổ thẳng', desc: 'Luyện nét sổ đứng' },
  { name: '竖线轻至重', symbol: '│', label: 'Sổ nhạt sang đậm', desc: 'Tăng dần lực nhấn' },
  { name: '竖线重至轻', symbol: '┃', label: 'Sổ đậm sang nhạt', desc: 'Giảm dần lực nhấn' },
  { name: '顿笔竖', symbol: '丨', label: 'Sổ nhấn bút', desc: 'Khởi bút và thu bút' },
  { name: '直角线', symbol: '⌐', label: 'Góc vuông phải', desc: 'Luyện gập vuông' },
  { name: '直角线反', symbol: '¬', label: 'Góc vuông trái', desc: 'Luyện gập ngược' },
  { name: '竖提竖提线', symbol: '⎿', label: 'Sổ hất liên hoàn', desc: 'Lực hất cổ tay' },
  { name: '横撇横撇线', symbol: '㇇', label: 'Ngang phẩy liên tiếp', desc: 'Chuyển hướng bút' },
  { name: '间隔线竖', symbol: '|||', label: 'Dọc song song', desc: 'Kiểm soát khoảng cách đều' },
  { name: '间隔线横', symbol: '≡', label: 'Ngang song song', desc: 'Kiểm soát độ cao đều' },
  { name: '网格线', symbol: '▦', label: 'Lưới caro vuông', desc: 'Kiểm soát phương ngang dọc' },
  { name: '网格线斜', symbol: '▨', label: 'Lưới caro chéo', desc: 'Lực chéo hai chiều' },
  { name: '螺旋线由外向内', symbol: '🌀', label: 'Xoắn ốc vào trong', desc: 'Xoay tròn thu hẹp' },
  { name: '螺旋线由内向外', symbol: '🍥', label: 'Xoắn ốc ra ngoài', desc: 'Xoay tròn mở rộng' },
  { name: '波浪线', symbol: '〰️', label: 'Sóng lượn ngang', desc: 'Lượn sóng mềm mại' },
  { name: '波浪线竖', symbol: '∿', label: 'Sóng lượn đứng', desc: 'Uốn lượn cổ tay' },
  { name: '旋转直线由外向内', symbol: '回', label: 'Vuông xoắn vào trong', desc: 'Gấp góc 90 độ' },
  { name: '旋转直线由内向外', symbol: '口', label: 'Vuông xoắn ra ngoài', desc: 'Mở rộng khung' },
  { name: '斜线右', symbol: '///', label: 'Chéo xiên phải', desc: 'Luyện nét phẩy' },
  { name: '斜线左', symbol: '\\\\\\', label: 'Chéo xiên trái', desc: 'Luyện nét mác' },
  { name: '弹簧线', symbol: '➿', label: 'Lò xo ziczac', desc: 'Liên hoàn vòng cung' },
  { name: '弹簧线竖', symbol: '⚡', label: 'Lò xo đứng', desc: 'Gấp khúc nhanh' },
  { name: '尖波浪线', symbol: '⋀⋁', label: 'Răng cưa nhọn', desc: 'Đổi hướng nhọn' },
  { name: '半圆弧线', symbol: '◠◡', label: 'Cung tròn bán nguyệt', desc: 'Luyện cong tròn' },
  { name: '爱心', symbol: '♡', label: 'Hình trái tim', desc: 'Phối hợp cung tròn & nhọn' },
  { name: '五角星', symbol: '☆', label: 'Hình ngôi sao', desc: 'Độ chính xác 5 cánh' },
  { name: '圆形', symbol: '◯', label: 'Vòng tròn khép kín', desc: 'Lực tròn đều tay' },
  { name: '太阳图', symbol: '☼', label: 'Mặt trời tỏa tia', desc: 'Tia phóng đồng tâm' },
  { name: '控笔撇', symbol: '丿', label: 'Lực phẩy vuốt', desc: 'Phẩy thanh thoát' },
  { name: '控笔捺', symbol: '㇏', label: 'Lực mác đè', desc: 'Mác nhấn chắc chắn' },
];

// 3. NQEZ Radicals List (偏旁 from ppbs.txt)
export const NQEZ_RADICALS = [
  '两点水', '三点水', '工字旁', '提土旁', '王字旁', '斜玉旁', '立字旁', '言字旁', '提手旁', '子字旁',
  '女字旁', '单人旁', '双人旁', '竖心旁', '左耳旁', '木字旁', '禾字旁', '示字旁', '衣字旁', '又字旁',
  '火字旁', '口字旁', '日字旁', '目字旁', '月字旁', '山字旁', '反犬旁', '牛字旁', '车字旁', '绞丝旁',
  '足字旁', '食字旁', '金字旁', '马字旁', '巾字旁', '米字旁', '虫字旁', '贝字旁', '方字旁', '石字旁',
  '立刀旁', '反文旁', '欠字旁', '单耳旁', '右耳旁', '寸字旁', '页字旁', '鸟字旁', '戈字旁', '宝盖头',
  '草字头', '竹字头', '人字头', '大字头', '穴宝盖', '雨字头', '老字头', '学字头', '爪字头', '四点底',
  '心字底', '走之底', '建字底', '门字框', '同字框', '国字框', '病字头', '虎字头', '走字旁', '羊字头'
];

// Map common radical name to character symbol
export const RADICAL_CHAR_MAP: Record<string, string> = {
  '两点水': '冫', '三点水': '氵', '工字旁': '工', '提土旁': '土', '王字旁': '王',
  '斜玉旁': '王', '立字旁': '立', '言字旁': '讠', '提手旁': '扌', '子字旁': '子',
  '女字旁': '女', '单人旁': '亻', '双人旁': '彳', '竖心旁': '忄', '左耳旁': '阝',
  '木字旁': '木', '禾字旁': '禾', '示字旁': '礻', '衣字旁': '衤', '又字旁': '又',
  '火字旁': '火', '口字旁': '口', '日字旁': '日', '目字旁': '目', '月字旁': '月',
  '山字旁': '山', '反犬旁': '犭', '牛字旁': '牜', '车字旁': '车', '绞丝旁': '纟',
  '足字旁': '𧾷', '食字旁': '饣', '金字旁': '钅', '马字旁': '马', '巾字旁': '巾',
  '米字旁': '米', '虫字旁': '虫', '贝字旁': '贝', '方字旁': '方', '石字旁': '石',
  '立刀旁': '刂', '反文旁': '攵', '欠字旁': '欠', '单耳旁': '卩', '右耳旁': '阝',
  '寸字旁': '寸', '页字旁': '页', '鸟字旁': '鸟', '戈字旁': '戈', '宝盖头': '宀',
  '草字头': '艹', '竹字头': '⺮', '人字头': '人', '大字头': '大', '穴宝盖': '穴',
  '雨字头': '雨', '老字头': '耂', '学字头': '⺍', '爪字头': '爫', '四点底': '灬',
  '心字底': '心', '走之底': '辶', '建字底': '廴', '门字框': '门', '同字框': '冂',
  '国字框': '囗', '病字头': '疒', '虎字头': '虍', '走字旁': '走', '羊字头': '⺷'
};

export const GraphicInputModal: React.FC<GraphicInputModalProps> = ({ isOpen, onClose }) => {
  const { config, setCharacters, updateConfig } = useWorksheetStore();
  const [activeTab, setActiveTab] = useState<'strokes' | 'control' | 'radicals'>('strokes');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter strokes by search query
  const filteredStrokes = useMemo(() => {
    if (!searchQuery.trim()) return BASIC_STROKES_LIST;
    const q = searchQuery.trim().toLowerCase();
    return BASIC_STROKES_LIST.filter(s =>
      s.nameZh.includes(q) ||
      s.nameVi.toLowerCase().includes(q) ||
      s.pinyin.toLowerCase().includes(q) ||
      s.exampleChar.includes(q)
    );
  }, [searchQuery]);

  const handleAddSingleStroke = (st: BasicStroke) => {
    const token = `(${st.nameZh})`;
    const nextVal = config.characters ? `${config.characters}${token}` : token;
    updateConfig({
      practiceMode: 'basicStroke',
      characters: nextVal,
      headerTitle: 'BẢNG CÁC NÉT CƠ BẢN TIẾNG TRUNG',
    });
  };

  const handleAddSinglePattern = (symbol: string) => {
    const nextVal = config.characters ? `${config.characters} ${symbol}` : symbol;
    setCharacters(nextVal);
  };

  const handleAddSingleRadical = (radName: string) => {
    const char = RADICAL_CHAR_MAP[radName] || radName;
    const nextVal = config.characters ? `${config.characters}${char}` : char;
    updateConfig({
      practiceMode: 'radical',
      characters: nextVal,
      headerTitle: 'BẢNG 214 BỘ THỦ TIẾNG TRUNG',
    });
  };

  const handleAddAllStrokes = () => {
    updateConfig({
      practiceMode: 'basicStroke',
      characters: ALL_NQEZ_STROKES_TOKENS,
      headerTitle: 'BẢNG CÁC NÉT CƠ BẢN TIẾNG TRUNG',
    });
    onClose();
  };

  const handleAddAllPenControl = () => {
    const patterns = NQEZ_PEN_CONTROL.map(p => p.symbol).join(' ');
    setCharacters(patterns);
    onClose();
  };

  const handleAddAllRadicals = () => {
    const radicals = NQEZ_RADICALS.map(r => RADICAL_CHAR_MAP[r] || r).join(' ');
    updateConfig({
      practiceMode: 'radical',
      characters: radicals,
      headerTitle: 'BẢNG 214 BỘ THỦ TIẾNG TRUNG',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '88vh',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching NQEZ */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Chọn hình nét để nhập vào ô
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Header & Search Bar matching NQEZ */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1.25rem',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('strokes')}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'strokes' ? '#2563eb' : 'transparent',
                color: activeTab === 'strokes' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              Các Nét Cơ Bản
            </button>
            <button
              onClick={() => setActiveTab('control')}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'control' ? '#2563eb' : 'transparent',
                color: activeTab === 'control' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              Luyện Lực Tay
            </button>
            <button
              onClick={() => setActiveTab('radicals')}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'radicals' ? '#2563eb' : 'transparent',
                color: activeTab === 'radicals' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              Bộ Thủ
            </button>
          </div>

          {/* Search box matching NQEZ '查找' */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '130px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />

            {/* 'Thêm tất cả' Button */}
            {activeTab === 'strokes' && (
              <button
                onClick={handleAddAllStrokes}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '4px',
                  border: '1px solid #ea580c',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                title="Thêm đầy đủ 69 nét cơ bản"
              >
                Thêm tất cả
              </button>
            )}
            {activeTab === 'control' && (
              <button
                onClick={handleAddAllPenControl}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '4px',
                  border: '1px solid #ea580c',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Thêm tất cả
              </button>
            )}
            {activeTab === 'radicals' && (
              <button
                onClick={handleAddAllRadicals}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '4px',
                  border: '1px solid #ea580c',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Thêm tất cả
              </button>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {/* TAB 1: BASIC STROKES (All 69 NQEZ Strokes with authentic Vector SVG Calligraphy) */}
          {activeTab === 'strokes' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
                gap: '6px',
              }}>
                {filteredStrokes.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleAddSingleStroke(st)}
                    style={{
                      height: '66px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                    title={`${st.nameZh} (${st.nameVi}) - VD trong chữ: ${st.exampleChar}`}
                  >
                    {/* Authentic Vector Calligraphy SVG Stroke */}
                    <svg viewBox="0 0 1024 1024" width="34" height="34" style={{ display: 'block' }}>
                      <path d={st.stroke} fill="#0f172a" />
                    </svg>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#334155', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '64px' }}>
                      {st.nameZh}
                    </span>
                    <span style={{ fontSize: '9px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '64px' }}>
                      {st.nameVi}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PEN CONTROL (50 NQEZ Exercises) */}
          {activeTab === 'control' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                gap: '8px',
              }}>
                {NQEZ_PEN_CONTROL.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddSinglePattern(item.symbol)}
                    style={{
                      height: '68px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      padding: '4px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.backgroundColor = '#f5f3ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                    title={`${item.name} (${item.desc})`}
                  >
                    <span style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>
                      {item.symbol}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RADICALS (NQEZ 偏旁) */}
          {activeTab === 'radicals' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(58px, 1fr))',
                gap: '6px',
              }}>
                {NQEZ_RADICALS.map((radName, idx) => {
                  const char = RADICAL_CHAR_MAP[radName] || radName;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAddSingleRadical(radName)}
                      style={{
                        height: '56px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        padding: '2px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.backgroundColor = '#ecfdf5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                      title={radName}
                    >
                      <span style={{ fontSize: '20px', fontFamily: "'LXGW WenKai', 'KaiTi', '楷体', serif", color: '#0f172a' }}>
                        {char}
                      </span>
                      <span style={{ fontSize: '9px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '52px' }}>
                        {radName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
