/**
 * Stroke Engine
 * 
 * Manages stroke order breakdown data and SVG rendering for Hanzi stroke practice.
 * Integrates with hanzi-writer data to produce step-by-step stroke decompositions
 * with red highlighted active strokes (matching NQEZ style).
 */

import HanziWriter from 'hanzi-writer';
import type { FillStyle } from '../types';

export interface StrokeCharData {
  character: string;
  strokes: string[]; // SVG path d attributes
  medians?: number[][][];
}

import { getBasicStroke } from '../data/basic-strokes';

// In-memory cache for character stroke data
const charDataCache: Record<string, StrokeCharData> = {};

/**
 * Synchronously get cached stroke data if loaded or if it is a basic stroke.
 */
export function getCachedStrokeData(char: string): StrokeCharData | null {
  if (charDataCache[char]) return charDataCache[char];
  const basic = getBasicStroke(char);
  if (basic && basic.stroke) {
    const strokeData: StrokeCharData = {
      character: char,
      strokes: [basic.stroke],
      medians: [],
    };
    charDataCache[char] = strokeData;
    return strokeData;
  }
  return null;
}

/**
 * Get stroke count for a character (from cache or default).
 */
export function getStrokeCount(char: string): number {
  if (charDataCache[char]) {
    return charDataCache[char].strokes.length;
  }
  return 10; // Default estimate until loaded
}

/**
 * Load stroke data for a Chinese character using hanzi-writer.
 */
/**
 * Load stroke data for a Chinese character or basic stroke.
 */
export async function loadStrokeData(char: string): Promise<StrokeCharData | null> {
  if (!char) return null;

  // 1. Check if char matches a known NQEZ basic stroke
  const basicStroke = getBasicStroke(char);
  if (basicStroke && basicStroke.stroke) {
    const strokeData: StrokeCharData = {
      character: char,
      strokes: [basicStroke.stroke],
      medians: [],
    };
    charDataCache[char] = strokeData;
    return strokeData;
  }

  if (charDataCache[char]) {
    return charDataCache[char];
  }

  // Filter out non-CJK string tokens
  if (!/[\u4e00-\u9fff\u3400-\u4dbf\u31c0-\u31ef\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}]/u.test(char)) {
    return null;
  }

  try {
    const data = await HanziWriter.loadCharacterData(char);
    if (data && data.strokes) {
      const strokeData: StrokeCharData = {
        character: char,
        strokes: data.strokes,
        medians: data.medians,
      };
      charDataCache[char] = strokeData;
      return strokeData;
    }
  } catch (err) {
    console.warn(`Could not load stroke data for ${char}:`, err);
  }

  return null;
}

/**
 * Preload stroke data for a list of characters in parallel.
 * Returns true if any new character data was loaded into cache.
 */
export async function preloadStrokeDataForChars(chars: string[]): Promise<boolean> {
  const uniqueChars = Array.from(new Set(chars)).filter(Boolean);

  let loadedAny = false;
  const promises = uniqueChars.map(async (char) => {
    if (!charDataCache[char]) {
      const data = await loadStrokeData(char);
      if (data) loadedAny = true;
    }
  });

  await Promise.all(promises);
  return loadedAny;
}

/**
 * Generate SVG path markup for a stroke order step.
 * 
 * @param strokes Array of SVG path d strings for all strokes in order
 * @param stepIndex The current stroke step index (0-based: 0 means 1st stroke, 1 means up to 2nd stroke, etc.)
 * @param options Styling options (gridSize, activeColor, inactiveColor, etc.)
 */
export function generateStrokeStepSVG(
  strokes: string[],
  stepIndex: number,
  size: number,
  options: {
    activeColor?: string;
    completedColor?: string;
    strokeColor?: string;
    opacity?: number;
    showOutline?: boolean;
    outlineColor?: string;
    fitInnerBox?: boolean;
    fillStyle?: FillStyle;
    strokeDash?: string;
  } = {}
): string {
  const defaultColor = options.strokeColor || '#94a3b8';  // light gray for completed strokes
  const activeColor = options.activeColor || '#64748b';   // medium gray for active stroke (no red)
  const completedColor = options.completedColor || defaultColor;
  const outlineColor = options.outlineColor || '#e2e8f0';
  const opacity = options.opacity ?? 0.35;

  let svg = '';

  // Fit scale: if fitInnerBox (for Ô Hồi Trung Cung), scale down to ~0.44 so it fits inside inner square
  const scaleFactor = options.fitInnerBox ? 0.78 : 0.84;
  const renderSize = size * scaleFactor;
  const offset = (size - renderSize) / 2;
  const scale = renderSize / 1024;
  const translateY = offset + renderSize * 0.87;
  const transform = `transform="matrix(${scale}, 0, 0, ${-scale}, ${offset}, ${translateY})"`;

  svg += `<g ${transform}>`;

  // Draw full outline background if requested
  if (options.showOutline) {
    for (let i = 0; i < strokes.length; i++) {
      svg += `<path d="${strokes[i]}" fill="${outlineColor}" opacity="0.3" />`;
    }
  }

  const isDashed = options.fillStyle === 'dashed' || (options.strokeDash && options.strokeDash !== 'none' && options.fillStyle !== 'dotted');
  const isDotted = options.fillStyle === 'dotted';
  const dash = options.strokeDash && options.strokeDash !== 'none' ? options.strokeDash : '30,22';

  // Draw all strokes up to stepIndex with trace opacity and style
  const maxIdx = Math.min(stepIndex, strokes.length - 1);
  for (let i = 0; i <= maxIdx; i++) {
    const color = i === stepIndex ? activeColor : completedColor;
    const strokeOpacity = i === stepIndex ? Math.min(1.0, opacity * 1.8) : opacity;
    if (isDashed) {
      svg += `<path d="${strokes[i]}" fill="${color}" fill-opacity="${opacity * 0.12}" stroke="${color}" stroke-width="18" stroke-dasharray="${dash}" stroke-linecap="round" stroke-linejoin="round" opacity="${strokeOpacity}" />`;
    } else if (isDotted) {
      svg += `<path d="${strokes[i]}" fill="${color}" fill-opacity="${opacity * 0.12}" stroke="${color}" stroke-width="18" stroke-dasharray="10,20" stroke-linecap="round" stroke-linejoin="round" opacity="${strokeOpacity}" />`;
    } else {
      svg += `<path d="${strokes[i]}" fill="${color}" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="${strokeOpacity}" />`;
    }
  }

  svg += `</g>`;
  return svg;
}

/**
 * Generate SVG path markup for a full character using vector strokes (authentic soft KaiTi calligraphy).
 */
export function generateFullCharSVG(
  strokes: string[],
  size: number,
  options: {
    color?: string;
    opacity?: number;
    fitInnerBox?: boolean;
    fillStyle?: FillStyle;
    strokeDash?: string;
  } = {}
): string {
  const color = options.color || '#1e293b';
  const opacity = options.opacity ?? 1.0;

  const scaleFactor = options.fitInnerBox ? 0.78 : 0.84;
  const renderSize = size * scaleFactor;
  const offset = (size - renderSize) / 2;
  const scale = renderSize / 1024;
  const translateY = offset + renderSize * 0.87;
  const transform = `transform="matrix(${scale}, 0, 0, ${-scale}, ${offset}, ${translateY})"`;

  let svg = `<g ${transform}>`;

  if (options.fillStyle === 'dashed' || (options.strokeDash && options.strokeDash !== 'none' && options.fillStyle !== 'dotted')) {
    const dash = options.strokeDash && options.strokeDash !== 'none' ? options.strokeDash : '30,22';
    for (let i = 0; i < strokes.length; i++) {
      // Faint interior wash + clear dashed contour
      svg += `<path d="${strokes[i]}" fill="${color}" fill-opacity="${opacity * 0.12}" stroke="${color}" stroke-width="18" stroke-dasharray="${dash}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" />`;
    }
  } else if (options.fillStyle === 'dotted') {
    for (let i = 0; i < strokes.length; i++) {
      // Faint interior wash + clear dotted contour
      svg += `<path d="${strokes[i]}" fill="${color}" fill-opacity="${opacity * 0.12}" stroke="${color}" stroke-width="18" stroke-dasharray="10,20" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" />`;
    }
  } else {
    for (let i = 0; i < strokes.length; i++) {
      svg += `<path d="${strokes[i]}" fill="${color}" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" />`;
    }
  }
  svg += `</g>`;

  return svg;
}
