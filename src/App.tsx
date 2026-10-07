/**
 * Main App Component
 * 
 * Root component that wires together:
 * - AppShell (responsive layout)
 * - PDF export
 * - Print
 * - Keyboard shortcuts
 */

import React, { useCallback, useRef, useState } from 'react';
import AppShell from './components/layout/AppShell';
import { useWorksheetStore } from './store/worksheet-store';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { exportPdf, printWorksheet } from './engines/pdf-renderer';

const App: React.FC = () => {
  const { config, layout, undo, redo, setBottomSheetOpen, setActiveBottomTab, setSidebarOpen } =
    useWorksheetStore();
  const [exporting, setExporting] = useState(false);
  const isExportingRef = useRef(false);

  // PDF Export (1-click direct download with concurrency protection)
  const handleExportPdf = useCallback(async () => {
    if (isExportingRef.current || exporting) return;
    isExportingRef.current = true;
    setExporting(true);
    try {
      await exportPdf(config, layout);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('PDF export error:', err);
        alert('Lỗi khi xuất PDF. Vui lòng thử lại.');
      }
    } finally {
      isExportingRef.current = false;
      setExporting(false);
    }
  }, [config, layout, exporting]);

  // Print
  const handlePrint = useCallback(() => {
    printWorksheet();
  }, []);

  // Save (placeholder for now)
  const handleSave = useCallback(() => {
    // Config is auto-saved via Zustand persist
    // Show brief confirmation
    const toast = document.createElement('div');
    toast.textContent = 'Đã lưu';
    toast.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: #10b981; color: white; padding: 8px 20px; border-radius: 8px;
      font-size: 14px; font-weight: 600; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: fadeInUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 1500);
  }, []);

  // Escape handler
  const handleEscape = useCallback(() => {
    setBottomSheetOpen(false);
    setActiveBottomTab(null);
    setSidebarOpen(false);
  }, [setBottomSheetOpen, setActiveBottomTab, setSidebarOpen]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: handleSave,
    onUndo: undo,
    onRedo: redo,
    onPrint: handlePrint,
    onExportPdf: handleExportPdf,
    onEscape: handleEscape,
  });

  return (
    <>
      <AppShell onExportPdf={handleExportPdf} onPrint={handlePrint} exporting={exporting} />

      {/* Export loading overlay */}
      {exporting && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: 'white',
            padding: '28px 44px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              border: '3.5px solid #e2e8f0',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
            }} />
            <div style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#0f172a',
            }}>
              Đang xuất file PDF...
            </div>
          </div>
        </div>
      )}

      {/* Global animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default App;
