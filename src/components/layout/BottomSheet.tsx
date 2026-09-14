/**
 * BottomSheet Component (Tablet only)
 * 
 * Slide-up panel for tablet settings.
 * Features:
 * - Tap outside to dismiss
 * - "Xong" (Done) button
 * - Smooth animation
 * - Backdrop overlay
 * - Max height 70vh
 * - Scrollable content
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import CharacterInput from '../editor/CharacterInput';
import GridTypeSelector from '../editor/GridTypeSelector';
import QuickSettings from '../editor/QuickSettings';

const BottomSheet: React.FC = () => {
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

  // Get tab title
  const getTitle = () => {
    switch (activeBottomTab) {
      case 'content': return 'Nội dung';
      case 'practice': return 'Kiểu luyện';
      case 'grid': return 'Kiểu ô';
      case 'font': return 'Chữ & Cài đặt';
      case 'page': return 'Trang';
      default: return '';
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeBottomTab) {
      case 'content':
        return <CharacterInput />;
      case 'grid':
        return <GridTypeSelector />;
      case 'practice':
      case 'font':
      case 'page':
        return <QuickSettings />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="bottom-sheet-overlay"
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--color-bg-overlay)',
          zIndex: 'var(--z-overlay)',
          opacity: bottomSheetOpen ? 1 : 0,
          pointerEvents: bottomSheetOpen ? 'auto' : 'none',
          transition: 'opacity var(--transition-base)',
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
          maxHeight: '70vh',
          backgroundColor: 'var(--color-bg-elevated)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 'var(--z-bottomsheet)',
          transform: bottomSheetOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform var(--transition-base)',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'calc(var(--bottombar-height) + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Drag handle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 'var(--space-3) 0 var(--space-1)',
        }}>
          <div style={{
            width: '36px',
            height: '4px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-border)',
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-5) var(--space-3)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: 0,
          }}>
            {getTitle()}
          </h2>
          <button
            onClick={handleClose}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '36px',
              transition: 'background-color var(--transition-fast)',
            }}
          >
            Xong
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: 'var(--space-4) var(--space-5)',
          overscrollBehavior: 'contain',
        }}>
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
