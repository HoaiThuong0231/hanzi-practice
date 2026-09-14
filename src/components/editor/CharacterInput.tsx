/**
 * CharacterInput Component
 * 
 * Large textarea for entering Chinese characters, words, sentences, or paragraphs.
 * Optimized for both physical keyboard and virtual keyboard (tablet).
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import { ALL_214_RADICALS } from '../../data/cjk-radicals';
import PageHeaderSettings from './PageHeaderSettings';

const CharacterInput: React.FC = () => {
  const { config, setCharacters, updateConfig } = useWorksheetStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isAutoPresetActive = config.practiceMode === 'radical' || config.practiceMode === 'basicStroke';
  const autoPresetLabel = config.practiceMode === 'radical' ? '214 Bộ thủ' : 'Các nét cơ bản';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = config.characters;
    }
  }, [config.characters]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Debounce layout recalculation
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCharacters(value);
    }, 150);
    // Immediately update the textarea value (optimistic)
    if (textareaRef.current) {
      textareaRef.current.value = value;
    }
  }, [setCharacters]);

  // Count CJK characters
  const cjkCount = (config.characters.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
    }}>
      <label
        htmlFor="char-input"
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--color-text)',
        }}
      >
        Nhập chữ / từ / câu
      </label>

      {isAutoPresetActive && (
        <div style={{
          padding: 'var(--space-2) var(--space-3)',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          color: '#1e40af',
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          <span>Đang ở chế độ <b>{autoPresetLabel}</b>. Bạn có thể để trống hoặc tự gõ nét/chữ theo ý muốn.</span>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {config.practiceMode === 'radical' && (
              <button
                type="button"
                id="btn-load-214-radicals"
                onClick={() => {
                  updateConfig({
                    practiceMode: 'radical',
                    characters: ALL_214_RADICALS.join(' '),
                    headerTitle: 'BẢNG 214 BỘ THỦ TIẾNG TRUNG',
                  });
                }}
                style={{
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Nạp 214 bộ thủ
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                updateConfig({
                  practiceMode: 'single',
                  characters: '你好 学习 练习',
                  headerTitle: 'PHIẾU LUYỆN VIẾT CHỮ HÁN',
                });
              }}
              style={{
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 700,
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Về chữ mẫu
            </button>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        id="char-input"
        defaultValue={config.characters}
        onChange={handleChange}
        placeholder="Nhập chữ Hán, bộ thủ hoặc nét tại đây, ví dụ: 你好&#10;学习中文&#10;春天来了，万物复苏。"
        rows={6}
        style={{
          width: '100%',
          padding: 'var(--space-3)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontFamily: "var(--font-hanzi)",
          fontSize: 'var(--text-xl)',
          lineHeight: 1.8,
          resize: 'vertical',
          minHeight: '120px',
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
          backgroundColor: 'var(--color-bg-elevated)',
          color: 'var(--color-text)',
          cursor: 'text',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-primary)';
          e.target.style.boxShadow = '0 0 0 3px var(--color-primary-light)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border)';
          e.target.style.boxShadow = 'none';
        }}
        aria-label="Nhập nội dung tiếng Trung"
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
      }}>
        <span>Hỗ trợ nhiều dòng, từ, câu, đoạn văn</span>
        <span style={{ fontWeight: 600, color: cjkCount > 0 ? 'var(--color-primary)' : '#dc2626' }}>
          {cjkCount} chữ Hán
        </span>
      </div>

      {config.characters.trim().length > 0 && cjkCount === 0 && !isAutoPresetActive && (
        <div style={{
          padding: '10px 12px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-md)',
          color: '#92400e',
          fontSize: 'var(--text-xs)',
          lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span>💡</span>
            <span>Chưa nhận diện được chữ Hán!</span>
          </div>
          <div>
            Bạn đang gõ chữ cái Latinh / Pinyin. Hệ thống cần <b>chữ Hán (ví dụ: 你好, 学习, 练习)</b> để vẽ nét chữ và <b>tự động hiển thị Pinyin chuẩn</b> trên đầu mỗi ô. Hãy chuyển bàn phím sang bộ gõ tiếng Trung (như Microsoft Pinyin) để gõ ra chữ Hán, hoặc bấm nút dưới:
          </div>
          <button
            type="button"
            onClick={() => {
              setCharacters('你好 学习 练习');
              if (textareaRef.current) textareaRef.current.value = '你好 学习 练习';
            }}
            style={{
              marginTop: '8px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: '#d97706',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>👉 Thử ngay chữ mẫu:</span>
            <span>你好 学习 练习</span>
          </button>
        </div>
      )}

      {/* Cụm Tiêu Đề Trang ngay sau ô nhập chữ Hán */}
      <PageHeaderSettings />
    </div>
  );
};

export default CharacterInput;
