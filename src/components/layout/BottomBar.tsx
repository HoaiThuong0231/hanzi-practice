/**
 * BottomBar Component (Tablet only)
 * 
 * Fixed tab bar at the bottom of the screen.
 * Each tab opens a BottomSheet with relevant settings.
 * Touch targets ≥ 44×44px.
 */

import React from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import { BOTTOM_SHEET_TABS, type BottomSheetTab } from '../../types';

const BottomBar: React.FC = () => {
  const { activeBottomTab, setActiveBottomTab } = useWorksheetStore();

  const handleTabClick = (tabId: BottomSheetTab) => {
    if (activeBottomTab === tabId) {
      setActiveBottomTab(null); // Toggle off
    } else {
      setActiveBottomTab(tabId);
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
        height: 'var(--bottombar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'var(--color-bg-elevated)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 'var(--z-sticky)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Thanh điều khiển"
    >
      {BOTTOM_SHEET_TABS.map((tab) => {
        const isActive = activeBottomTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            aria-label={tab.label}
            aria-pressed={isActive}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              height: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              transition: 'color var(--transition-fast)',
              padding: 'var(--space-1)',
              minWidth: 'var(--touch-min)',
              minHeight: 'var(--touch-min)',
              position: 'relative',
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '25%',
                right: '25%',
                height: '3px',
                backgroundColor: 'var(--color-primary)',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <span style={{
              fontSize: '0.8rem',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.01em',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomBar;
