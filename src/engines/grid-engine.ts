/**
 * Grid Engine
 * 
 * Generates SVG elements for each grid type.
 * All coordinates are in mm — the SVG viewBox uses mm units.
 * This ensures 1:1 correspondence between preview and PDF.
 */

import type { GridType } from '../types';

export interface GridSVGOptions {
  size: number;              // grid cell size in mm (height for line type)
  lineColor: string;         // e.g., '#4CAF50'
  lineWidth: number;         // stroke width in mm
  guideLineDash: boolean;    // whether guide lines are dashed
  lineSpanWidth?: number;    // for 'line' type: horizontal span of the ruled line (defaults to size)
}

/**
 * Generate SVG elements for a single grid cell.
 * Returns an SVG string fragment (not a full <svg>).
 * The fragment assumes it's placed within a <g> with appropriate transform.
 */
export function generateGridSVG(
  type: GridType,
  options: GridSVGOptions
): string {
  const { size, lineColor, lineWidth } = options;
  const half = size / 2;
  const dashArray = options.guideLineDash ? `${size / 22},${size / 20}` : 'none';
  const guideColor = adjustAlpha(lineColor, 0.35);
  const innerLineWidth = Math.max(0.08, lineWidth * 0.65);

  let svg = '';

  // Outer border (drawn unless type is 'line' or 'verticalLine')
  if (type !== 'line' && type !== 'verticalLine') {
    svg += `<rect x="0" y="0" width="${size}" height="${size}" fill="none" stroke="${lineColor}" stroke-width="${lineWidth}" />`;
  }

  switch (type) {
    case 'tian':
    case 'verticalTian': {
      // 田字格: vertical center + horizontal center (dashed guide lines)
      svg += `<line x1="${half}" y1="0" x2="${half}" y2="${size}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      svg += `<line x1="0" y1="${half}" x2="${size}" y2="${half}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      break;
    }

    case 'mi':
    case 'verticalMi': {
      // 米字格: vertical + horizontal + 2 diagonals (all dashed guide lines)
      svg += `<line x1="${half}" y1="0" x2="${half}" y2="${size}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      svg += `<line x1="0" y1="${half}" x2="${size}" y2="${half}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      svg += `<line x1="0" y1="0" x2="${size}" y2="${size}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      svg += `<line x1="${size}" y1="0" x2="0" y2="${size}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      break;
    }

    case 'hui':
    case 'verticalHui': {
      // 回宫格: Inner square (50% size, 25% inset) + center crosshair + diagonal lines
      const inset = size * 0.25;
      const innerSize = size * 0.5;
      svg += `<rect x="${inset}" y="${inset}" width="${innerSize}" height="${innerSize}" fill="none" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      svg += `<line x1="${half}" y1="0" x2="${half}" y2="${size}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      svg += `<line x1="0" y1="${half}" x2="${size}" y2="${half}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      svg += `<line x1="0" y1="0" x2="${size}" y2="${size}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      svg += `<line x1="${size}" y1="0" x2="0" y2="${size}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      break;
    }

    case 'oHoi':
    case 'verticalOHoi': {
      // Ô Hồi / Ô hồi dọc: Inner square (50% size, 25% inset) + center vertical & horizontal lines — NO diagonal lines
      const inset = size * 0.25;
      const innerSize = size * 0.5;
      svg += `<rect x="${inset}" y="${inset}" width="${innerSize}" height="${innerSize}" fill="none" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      svg += `<line x1="${half}" y1="0" x2="${half}" y2="${size}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      svg += `<line x1="0" y1="${half}" x2="${size}" y2="${half}" stroke="${guideColor}" stroke-width="${innerLineWidth}" stroke-dasharray="${dashArray}" />`;
      break;
    }

    case 'square':
    case 'verticalSquare': {
      // Plain square: outer border only
      break;
    }

    case 'line': {
      // Horizontal ruled notebook line
      const spanW = options.lineSpanWidth ?? size;
      svg += `<line x1="0" y1="${size}" x2="${spanW}" y2="${size}" stroke="${lineColor}" stroke-width="${lineWidth}" />`;
      break;
    }

    case 'verticalLine': {
      // Vertical ruled line
      svg += `<line x1="${size}" y1="0" x2="${size}" y2="${size}" stroke="${lineColor}" stroke-width="${lineWidth}" />`;
      break;
    }
  }

  return svg;
}

/**
 * Generate a small thumbnail SVG for grid type selector.
 * Returns a complete <svg> string.
 */
export function generateGridThumbnail(
  type: GridType,
  size: number = 60
): string {
  if (type === 'oHoi') {
    const strokeWidth = size / 30;
    const half = size / 2;
    const inset = size * 0.25;
    const innerSize = size * 0.5;
    const dash = `${size / 15},${size / 15}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect x="1" y="1" width="${size - 2}" height="${size - 2}" fill="none" stroke="#4CAF50" stroke-width="${strokeWidth}" />
      <rect x="${inset}" y="${inset}" width="${innerSize}" height="${innerSize}" fill="none" stroke="rgba(76,175,80,0.6)" stroke-width="${strokeWidth * 0.7}" stroke-dasharray="${dash}" />
      <line x1="${half}" y1="1" x2="${half}" y2="${size - 1}" stroke="rgba(76,175,80,0.6)" stroke-width="${strokeWidth * 0.7}" stroke-dasharray="${dash}" />
      <line x1="1" y1="${half}" x2="${size - 1}" y2="${half}" stroke="rgba(76,175,80,0.6)" stroke-width="${strokeWidth * 0.7}" stroke-dasharray="${dash}" />
    </svg>`;
  }

  if (type === 'line') {
    const strokeWidth = size / 30;
    let linesSvg = '';
    const spacing = size / 4;
    for (let i = 1; i <= 3; i++) {
      linesSvg += `<line x1="0" y1="${i * spacing}" x2="${size}" y2="${i * spacing}" stroke="#4CAF50" stroke-width="${strokeWidth}" />`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${linesSvg}</svg>`;
  }

  if (type === 'verticalLine') {
    const strokeWidth = size / 30;
    let linesSvg = `<rect x="0" y="0" width="${size}" height="${size}" fill="none" stroke="#4CAF50" stroke-width="${strokeWidth}" />`;
    const spacing = size / 4;
    for (let i = 1; i <= 3; i++) {
      linesSvg += `<line x1="${i * spacing}" y1="0" x2="${i * spacing}" y2="${size}" stroke="#4CAF50" stroke-width="${strokeWidth * 0.8}" />`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${linesSvg}</svg>`;
  }

  const isVertGrid = type === 'verticalTian' || type === 'verticalMi' || type === 'verticalHui' || type === 'verticalSquare' || type === 'verticalOHoi';
  if (isVertGrid) {
    const baseType: GridType = type === 'verticalTian' ? 'tian' : type === 'verticalMi' ? 'mi' : type === 'verticalHui' ? 'hui' : type === 'verticalOHoi' ? 'oHoi' : 'square';
    const cellH = size / 2;
    const opt: GridSVGOptions = {
      size: cellH,
      lineColor: '#4CAF50',
      lineWidth: cellH / 25,
      guideLineDash: true,
    };
    const xOffset = (size - cellH) / 2;
    const cell1 = generateGridSVG(baseType, opt);
    const cell2 = generateGridSVG(baseType, opt);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <g transform="translate(${xOffset}, 0)">${cell1}</g>
      <g transform="translate(${xOffset}, ${cellH})">${cell2}</g>
    </svg>`;
  }

  const options: GridSVGOptions = {
    size,
    lineColor: '#4CAF50',
    lineWidth: size / 30,
    guideLineDash: true,
  };

  const inner = generateGridSVG(type, options);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${inner}</svg>`;
}

/**
 * Adjust alpha/opacity of a hex color
 */
function adjustAlpha(hexColor: string, alpha: number): string {
  // Convert hex to rgba
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Generate a complete row of grid cells as SVG fragment.
 * Each cell is at position (col * gridSize, 0) within the fragment.
 */
export function generateGridRow(
  type: GridType,
  columns: number,
  options: GridSVGOptions
): string {
  let svg = '';
  for (let col = 0; col < columns; col++) {
    const x = col * options.size;
    svg += `<g transform="translate(${x}, 0)">`;
    svg += generateGridSVG(type, options);
    svg += '</g>';
  }
  return svg;
}

export interface PinyinBoxOptions {
  width: number;        // width in mm (gridSizeMm)
  height: number;       // height in mm
  lineColor: string;    // border stroke color
  lineWidth: number;    // stroke width in mm
}

/**
 * Generate 4-line Pinyin Header Box (四线格) attached directly above Tian / Mi / Hui cell.
 * Features:
 * - Outer rectangle (top, bottom, left, right)
 * - 2 dashed guidelines at 1/3 and 2/3 height dividing into 3 zones
 */
export function generatePinyinBoxSVG(options: PinyinBoxOptions): string {
  const { width, height, lineColor, lineWidth } = options;

  return `<rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${lineColor}" stroke-width="${lineWidth}" />`;
}

