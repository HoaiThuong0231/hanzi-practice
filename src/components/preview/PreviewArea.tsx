/**
 * PreviewArea Component
 *
 * Central preview showing worksheet pages.
 * Supports: zoom in/out, fit page, pinch-to-zoom, pan/drag, page navigation.
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useWorksheetStore } from '../../store/worksheet-store';
import WorksheetPage from './WorksheetPage';
import styles from './PreviewArea.module.css';

const PreviewArea: React.FC = () => {
  const { config, layout, currentPage, zoomLevel, setCurrentPage, setZoomLevel } =
    useWorksheetStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState<number>(1);

  const totalPages = layout.pages.length;
  const currentPageData = layout.pages[currentPage];

  // Zoom handlers
  const zoomIn = useCallback(() => {
    setZoomLevel(Math.min(3.0, zoomLevel + 0.25));
  }, [zoomLevel, setZoomLevel]);

  const zoomOut = useCallback(() => {
    setZoomLevel(Math.max(0.25, zoomLevel - 0.25));
  }, [zoomLevel, setZoomLevel]);

  const fitPage = useCallback(() => {
    setZoomLevel(1.0);
  }, [setZoomLevel]);

  // Mouse wheel zoom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(Math.max(0.25, Math.min(3.0, zoomLevel + delta)));
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
      const newZoom = Math.max(0.25, Math.min(3.0, initialZoom * scale));
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
              Nhập các chữ Hán vào ô nội dung bên trái, sau đó chọn kiểu ô và xuất PDF
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

      {/* Zoom Controls */}
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
          className={styles.zoomBtn}
          onClick={fitPage}
          aria-label="Vừa trang"
          title="Vừa trang"
          style={{ fontSize: 'var(--text-xs)' }}
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
            Trang {currentPage + 1} / {totalPages}
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
