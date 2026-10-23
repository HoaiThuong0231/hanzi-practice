/**
 * AppShell Component
 * 
 * The main responsive layout container.
 * - Desktop/Laptop: 2-column layout (sidebar + preview), max-width constrained
 * - Tablet: Full-width preview with slide-out drawer sidebar + bottom bar/sheet
 * - Mobile: Ultra-minimalist! Full-screen preview + clean bottom navigation & sheet
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
  exporting?: boolean;
}

const AppShell: React.FC<AppShellProps> = ({ onExportPdf, onPrint, exporting }) => {
  const { sidebarOpen, setSidebarOpen } = useWorksheetStore();
  const { isDesktop, isLaptop, isTablet, isMobile } = useResponsive();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const isCompact = isTablet || isMobile;

  // Close sidebar overlay on tablet
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.appShell}>
      {/* Top Bar */}
      <TopBar
        onExportPdf={onExportPdf}
        onPrint={onPrint}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        exporting={exporting}
      />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Sidebar Overlay (Tablet only) */}
        {isTablet && (
          <div
            className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.sidebarOverlayVisible : ''}`}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar — rendered on Desktop, Laptop, and Tablet drawer (NOT on Mobile) */}
        {!isMobile && (
          <aside
            className={`${styles.sidebar} ${
              isTablet
                ? sidebarOpen
                  ? styles.sidebarVisible
                  : ''
                : sidebarOpen
                  ? ''
                  : styles.sidebarCollapsed
            }`}
            aria-label="Cài đặt phiếu luyện viết"
          >
            <div className={styles.sidebarInner}>
              {/* Section: Content Input */}
              <section>
                <CharacterInput />
              </section>

              {/* Section: Grid Type */}
              <section>
                <GridTypeSelector />
              </section>

              {/* Section: Quick Settings */}
              <section>
                <h3 className={styles.sectionTitle}>
                  Cài đặt
                </h3>
                <QuickSettings onOpenTemplates={() => setIsTemplateModalOpen(true)} />
              </section>
            </div>
          </aside>
        )}

        {/* Center: Preview (Full width on mobile) */}
        <main className={styles.previewColumn}>
          <PreviewArea />
        </main>
      </div>

      {/* Bottom Bar (Tablet/Mobile only) */}
      {isCompact && <BottomBar />}

      {/* Bottom Sheet (Tablet/Mobile only) */}
      {isCompact && (
        <BottomSheet onOpenTemplates={() => setIsTemplateModalOpen(true)} />
      )}

      {/* Template & Font Gallery Modal */}
      <TemplateGalleryModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  );
};

export default AppShell;
