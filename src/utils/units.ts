// Unit conversion utilities
// PDF standard: 72 DPI (points per inch), 1 inch = 25.4 mm

const MM_PER_INCH = 25.4;
const PX_PER_INCH_SCREEN = 96; // CSS px

/**
 * Convert mm to CSS pixels (for screen display)
 * 1 inch = 96 CSS px = 25.4 mm
 */
export function mmToPx(mm: number): number {
  return (mm / MM_PER_INCH) * PX_PER_INCH_SCREEN;
}

/**
 * Convert CSS pixels to mm
 */
export function pxToMm(px: number): number {
  return (px / PX_PER_INCH_SCREEN) * MM_PER_INCH;
}

/**
 * Convert mm to PDF points (for jsPDF)
 * 1 inch = 72pt = 25.4 mm
 */
export function mmToPt(mm: number): number {
  return (mm / MM_PER_INCH) * 72;
}

/**
 * Convert pt to mm
 */
export function ptToMm(pt: number): number {
  return (pt / 72) * MM_PER_INCH;
}
