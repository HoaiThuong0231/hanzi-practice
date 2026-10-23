/**
 * PreviewArea Component
 *
 * Central preview showing worksheet pages.
 * Supports: zoom in/out, fit page, pinch-to-zoom, pan/drag, page navigation.
 * Responsive: automatically fits page on mobile screens.
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import { useResponsive } from '../../hooks/useResponsive';
import WorksheetPage from './WorksheetPage';
import styles from './PreviewArea.module.css';

const PreviewArea: React.FC = () => {
  const { config, layout, currentPage, zoomLevel, setCurrentPage, setZoomLevel } =
    useWorksheetStore();
  const { isMobile } = useResponsive();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState<number>(1);
  const initialFitDone = useRef(false);

  const totalPages = layout.pages.length;
  const currentPageData = layout.pages[currentPage];

  // Calculate dynamic fit zoom level
  const calculateFitZoom = useCallback(() => {
    if (!scrollRef.current) return 1.0;
    const containerW = scrollRef.current.clientWidth;
    if (containerW <= 0) return 1.0;
    // Padding: 20px on mobile, 48px on desktop
    const padding = containerW < 600 ? 20 : 48;
    const availableW = containerW - padding;
    const targetZoom = availableW / 600;
    return Math.max(0.25, Math.min(2.0, Math.round(targetZoom * 100) / 100));
  }, []);

  // Zoom handlers
  const zoomIn = useCallback(() => {
    setZoomLevel(Math.min(3.0, Math.round((zoomLevel + 0.15) * 100) / 100));
  }, [zoomLevel, setZoomLevel]);

  const zoomOut = useCallback(() => {
    setZoomLevel(Math.max(0.25, Math.round((zoomLevel - 0.15) * 100) / 100));
  }, [zoomLevel, setZoomLevel]);

  const fitPage = useCallback(() => {
    const fit = calculateFitZoom();
    setZoomLevel(fit);
  }, [calculateFitZoom, setZoomLevel]);

  // Auto-fit on mobile initial load
  useEffect(() => {
    if (isMobile && !initialFitDone.current && scrollRef.current) {
      initialFitDone.current = true;
      const fit = calculateFitZoom();
      if (fit < 1.0) {
        setZoomLevel(fit);
      }
    }
  }, [isMobile, calculateFitZoom, setZoomLevel]);

  // Mouse wheel zoom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(Math.max(0.25, Math.min(3.0, Math.round((zoomLevel + delta) * 100) / 100)));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [zoomLevel, setZoomLevel]);

  // Pinch-to-zoom (touch)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setInitialDistance(Math.hypot(dx, dy));
      setInitialZoom(zoomLevel);
    }
  }, [zoomLevel]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      const scale = currentDistance / initialDistance;
      const newZoom = Math.max(0.25, Math.min(3.0, Math.round(initialZoom * scale * 100) / 100));
      setZoomLevel(newZoom);
    }
  }, [initialDistance, initialZoom, setZoomLevel]);

  const handleTouchEnd = useCallback(() => {
    setInitialDistance(null);
  }, []);

  // Page navigation
  const goToPrev = useCallback(() => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  }, [currentPage, setCurrentPage]);

  const goToNext = useCallback(() => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  }, [currentPage, totalPages, setCurrentPage]);

  // Calculate page display dimensions based on zoom
  const aspectRatio = layout.paperWidth / layout.paperHeight;
  const maxWidth = 600 * zoomLevel; // base preview width
  const displayWidth = maxWidth;
  const displayHeight = displayWidth / aspectRatio;

  return (
    <div className={styles.previewContainer}>
      <div
        ref={scrollRef}
        className={styles.previewScrollArea}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {totalPages === 0 || !currentPageData ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyText}>Nhập chữ để bắt đầu</div>
            <div className={styles.emptyHint}>
              Bấm nút &ldquo;Nhập chữ&rdquo; ở dưới để gõ hoặc dán nội dung chữ Hán
            </div>
          </div>
        ) : (
          /* Show current page */
          <div
            className={styles.pageWrapper}
            style={{
              width: displayWidth,
              height: displayHeight,
            }}
          >
            <WorksheetPage
              page={currentPageData}
              config={config}
              layout={layout}
              pageIndex={currentPage}
            />
          </div>
        )}
      </div>

      {/* Floating Zoom Controls */}
      <div className={styles.zoomControls}>
        <button
          className={styles.zoomBtn}
          onClick={zoomIn}
          aria-label="Phóng to"
          title="Phóng to"
        >
          +
        </button>
        <div className={styles.zoomLevel}>
          {Math.round(zoomLevel * 100)}%
        </div>
        <button
          className={styles.zoomBtn}
          onClick={zoomOut}
          aria-label="Thu nhỏ"
          title="Thu nhỏ"
        >
          −
        </button>
        <button
          className={styles.zoomBtnFit}
          onClick={fitPage}
          aria-label="Vừa màn hình"
          title="Vừa màn hình"
        >
          Fit
        </button>
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className={styles.pageNav}>
          <button
            className={styles.pageNavBtn}
            onClick={goToPrev}
            disabled={currentPage === 0}
            aria-label="Trang trước"
          >
            ‹
          </button>
          <span className={styles.pageInfo}>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            className={styles.pageNavBtn}
            onClick={goToNext}
            disabled={currentPage >= totalPages - 1}
            aria-label="Trang sau"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default PreviewArea;
