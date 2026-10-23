/**
 * BottomBar Component (Mobile & Tablet)
 * 
 * Clean, modern bottom navigation bar.
 * Tabs:
 * 1. Xem trước (Preview) — active by default, closes sheet to view full worksheet
 * 2. Nhập chữ (Content) — opens CharacterInput sheet
 * 3. Kiểu ô (Grid) — opens GridTypeSelector sheet
 * 4. Cài đặt (Settings) — opens QuickSettings sheet
 */

import React from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import { BOTTOM_SHEET_TABS, type BottomSheetTab } from '../../types';

function renderTabIcon(tabId: BottomSheetTab, active: boolean) {
  const strokeColor = active ? 'var(--color-primary)' : 'currentColor';
  const size = 20;

  switch (tabId) {
    case 'preview':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'content':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      );
    case 'grid':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
      );
    case 'settings':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      );
  }
}

const BottomBar: React.FC = () => {
  const { activeBottomTab, setActiveBottomTab, bottomSheetOpen } = useWorksheetStore();

  const handleTabClick = (tabId: BottomSheetTab) => {
    if (tabId === 'preview') {
      setActiveBottomTab(null);
    } else {
      if (activeBottomTab === tabId && bottomSheetOpen) {
        setActiveBottomTab(null);
      } else {
        setActiveBottomTab(tabId);
      }
    }
  };

  return (
    <nav
      className="bottom-bar no-print"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(var(--bottombar-height) + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 'var(--z-sticky)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Thanh điều hướng"
    >
      {BOTTOM_SHEET_TABS.map((tab) => {
        const isPreviewTab = tab.id === 'preview';
        const isActive = isPreviewTab
          ? !bottomSheetOpen || activeBottomTab === null
          : bottomSheetOpen && activeBottomTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            aria-label={tab.label}
            aria-pressed={isActive}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: isActive ? 'var(--color-primary)' : '#64748b',
              transition: 'all 0.18s ease',
              padding: '2px 0',
              minWidth: '44px',
              position: 'relative',
              outline: 'none',
            }}
          >
            {/* Top Indicator bar */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '28%',
                  right: '28%',
                  height: '2.5px',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '0 0 3px 3px',
                }}
              />
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isActive ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.18s ease',
            }}>
              {renderTabIcon(tab.id, isActive)}
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomBar;
