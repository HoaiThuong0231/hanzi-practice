/**
 * AppShell Component
 * 
 * The main responsive layout container.
 * Adapts between 3-column (desktop), 2-column (laptop), and 1-column (tablet) layouts.
 * Manages sidebar visibility, bottom bar, and bottom sheet.
 */

import React, { useState } from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import { useResponsive } from '../../hooks/useResponsive';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import BottomSheet from './BottomSheet';
import CharacterInput from '../editor/CharacterInput';
import GridTypeSelector from '../editor/GridTypeSelector';
import QuickSettings from '../editor/QuickSettings';
import { TemplateGalleryModal } from '../editor/TemplateGalleryModal';
import PreviewArea from '../preview/PreviewArea';
import styles from './AppShell.module.css';

interface AppShellProps {
  onExportPdf: () => void;
  onPrint: () => void;
}

const AppShell: React.FC<AppShellProps> = ({ onExportPdf, onPrint }) => {
  const { sidebarOpen, setSidebarOpen } = useWorksheetStore();
  const { isDesktop, isLaptop, isTablet, isMobile } = useResponsive();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const isCompact = isTablet || isMobile;
  const showThreeColumns = isDesktop && sidebarOpen;
  const showSidebar = !isCompact;

  // Close sidebar overlay on tablet
  const handleOverlayClick = () => {
    if (isCompact) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={styles.appShell}>
      {/* Top Bar */}
      <TopBar
        onExportPdf={onExportPdf}
        onPrint={onPrint}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Sidebar Overlay (tablet) */}
        {isCompact && (
          <div
            className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.sidebarOverlayVisible : ''}`}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`${styles.sidebar} ${
            isCompact
              ? sidebarOpen
                ? styles.sidebarVisible
                : ''
              : sidebarOpen
                ? ''
                : styles.sidebarCollapsed
          }`}
          aria-label="Cài đặt phiếu luyện viết"
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            width: isLaptop ? '260px' : '280px',
            minWidth: isLaptop ? '260px' : '280px',
          }}>
            {/* Section: Content Input */}
            <section>
              <CharacterInput />
            </section>

            {/* Section: Grid Type */}
            <section>
              <GridTypeSelector />
            </section>

            {/* Section: Quick Settings (on laptop, includes all settings) */}
            {(isLaptop || isDesktop || isCompact) && (
              <section>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Cài đặt nhanh
                </h3>
                <QuickSettings onOpenTemplates={() => setIsTemplateModalOpen(true)} />
              </section>
            )}
          </div>
        </aside>

        {/* Center: Preview */}
        <main className={styles.previewColumn}>
          <PreviewArea />
        </main>

        {/* Right Settings Panel (Desktop 3-column only) */}
        {showThreeColumns && (
          <aside className={styles.settingsPanel} aria-label="Cài đặt chi tiết">
            <h3 style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Cài đặt chi tiết
            </h3>
            <QuickSettings onOpenTemplates={() => setIsTemplateModalOpen(true)} />
          </aside>
        )}
      </div>

      {/* Bottom Bar (Tablet/Mobile only) */}
      {isCompact && <BottomBar />}

      {/* Bottom Sheet (Tablet/Mobile only) */}
      {isCompact && <BottomSheet />}

      {/* Template & Font Gallery Modal */}
      <TemplateGalleryModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  );
};

export default AppShell;
