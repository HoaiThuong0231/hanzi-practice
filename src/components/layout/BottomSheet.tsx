/**
 * BottomSheet Component (Mobile & Tablet)
 * 
 * Sleek, native-feeling slide-up panel for editing and settings.
 * Features:
 * - Smooth CSS transitions
 * - Drag handle & header with title and close button
 * - Backdrop overlay dismiss
 * - Touch-friendly scrolling
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import CharacterInput from '../editor/CharacterInput';
import GridTypeSelector from '../editor/GridTypeSelector';
import QuickSettings from '../editor/QuickSettings';

interface BottomSheetProps {
  onOpenTemplates?: () => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ onOpenTemplates }) => {
  const { bottomSheetOpen, activeBottomTab, setBottomSheetOpen, setActiveBottomTab } =
    useWorksheetStore();
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setBottomSheetOpen(false);
    setActiveBottomTab(null);
  }, [setBottomSheetOpen, setActiveBottomTab]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && bottomSheetOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [bottomSheetOpen, handleClose]);

  // Tab titles
  const getTitle = () => {
    switch (activeBottomTab) {
      case 'content':
        return 'Nhập chữ & Nội dung';
      case 'grid':
        return 'Kiểu ô luyện viết';
      case 'settings':
      case 'practice':
      case 'font':
      case 'page':
        return 'Cài đặt phiếu viết';
      default:
        return 'Cài đặt';
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeBottomTab) {
      case 'content':
        return <CharacterInput />;
      case 'grid':
        return <GridTypeSelector />;
      case 'settings':
      case 'practice':
      case 'font':
      case 'page':
      default:
        return <QuickSettings onOpenTemplates={onOpenTemplates} />;
    }
  };

  if (!bottomSheetOpen && !activeBottomTab) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="bottom-sheet-overlay"
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 'var(--z-overlay)',
          opacity: bottomSheetOpen ? 1 : 0,
          pointerEvents: bottomSheetOpen ? 'auto' : 'none',
          transition: 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        aria-hidden={!bottomSheetOpen}
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={getTitle()}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '82vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.15)',
          zIndex: 'var(--z-bottomsheet)',
          transform: bottomSheetOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'calc(var(--bottombar-height) + env(safe-area-inset-bottom, 0px))',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle */}
        <div
          onClick={handleClose}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px 0 6px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '4.5px',
              borderRadius: '9999px',
              backgroundColor: '#cbd5e1',
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 18px 12px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {getTitle()}
          </h2>

          <button
            onClick={handleClose}
            aria-label="Đóng và xem kết quả"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              border: 'none',
              borderRadius: '20px',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '32px',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span>✓</span>
            <span>Xem kết quả</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            padding: '16px 18px 24px',
          }}
        >
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
