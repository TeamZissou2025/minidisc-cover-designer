// Core type definitions for MD Label Maker

export interface LabelData {
  title: string;
  artist: string;
  year: string;
  artworkUrl: string | null;
}

export interface TemplateFormat {
  id: string;
  name: string;
  displayName: string;  // Full descriptive name for yellow bar
  category: string;
  widthMM: number;
  heightMM: number;
  bleedMM: number;
  hasBanner: boolean;
}

export interface RenderOptions {
  dpi: number;
  showTrimLine: boolean;
  showSafeZone: boolean;  // Changed from showBleed
  showCropMarks: boolean;
  showCenterMarks: boolean;
  template: TemplateFormat;
  fontFamily: string;
  fontStyle: { bold: boolean; italic: boolean; titleCase: boolean };
}

export const DPI = {
  SCREEN: 72,
  PRINT: 300,
} as const;

// Conversion utilities
export const MM_TO_INCH = 0.0393701;

export function mmToPixels(mm: number, dpi: number): number {
  return Math.round(mm * MM_TO_INCH * dpi);
}

export function pixelsToMM(pixels: number, dpi: number): number {
  return pixels / (MM_TO_INCH * dpi);
}
