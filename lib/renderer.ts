// Core label rendering engine
// This implements the correct architecture: separate preview and export canvases

import {
  LabelData,
  TemplateFormat,
  RenderOptions,
  mmToPixels,
} from './types';

export class LabelRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private template: TemplateFormat;
  private dpi: number;
  private fontFamily: string;

  constructor(canvas: HTMLCanvasElement, dpi: number = 72) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    this.dpi = dpi;
    this.template = { widthMM: 37, heightMM: 53, bleedMM: 3, id: 'temp', name: 'Temp', displayName: 'TEMP', category: 'Temp', hasBanner: true };
    this.fontFamily = 'Montserrat';
  }

  public setupCanvas(template: TemplateFormat): void {
    const { widthMM, heightMM, bleedMM } = template;
    const totalWidthMM = widthMM + (bleedMM * 2);
    const totalHeightMM = heightMM + (bleedMM * 2);
    
    const canvasWidth = mmToPixels(totalWidthMM, this.dpi);
    const canvasHeight = mmToPixels(totalHeightMM, this.dpi);
    
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    
    // CRITICAL: Enable maximum quality rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Font rendering hints (non-standard but helps in some browsers)
    (this.ctx as any).textRendering = 'geometricPrecision';
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.template = template;
  }

  public async render(data: LabelData, options: RenderOptions & { labelTheme?: 'dark' | 'light'; artworkPosition?: { x: number; y: number; scale: number } }): Promise<void> {
    console.log('📝 LabelRenderer.render() called');
    console.log('📦 Data received:', data);
    console.log('🖼️ Artwork URL in data:', data.artworkUrl);
    console.log('⚙️ Options:', options);
    
    this.setupCanvas(options.template);
    
    // ENABLE FONT SMOOTHING for high-quality rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    this.fontFamily = options.fontFamily;
    console.log('🔤 Rendering with font:', options.fontFamily);
    
    const { widthMM, heightMM, bleedMM, hasBanner } = options.template;
    const labelTheme = options.labelTheme || 'dark';
    const artworkPosition = options.artworkPosition || { x: 0, y: 0, scale: 1 };
    const bleedPx = mmToPixels(bleedMM, this.dpi);
    const widthPx = mmToPixels(widthMM, this.dpi);
    const heightPx = mmToPixels(heightMM, this.dpi);
    
    // Background color based on theme
    if (labelTheme === 'light') {
      this.ctx.fillStyle = '#FFFFFF';
    } else {
      this.ctx.fillStyle = '#231F20';
    }
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // DISC SURFACE STICKER - Reference-accurate layout
    if (options.template.id === 'disc-surface') {
      console.log('🎯 Rendering DISC SURFACE layout (reference-accurate)');
      
      // EXACT measurements from reference overlay
      const totalWidthMM = widthMM; // 37mm
      const totalHeightMM = heightMM; // 47mm printable (53 - 6 bleed)
      const bannerHeightMM = 4; // Banner with ▲
      const artworkHeightMM = 37; // Fixed square artwork
      const textRegionHeightMM = 9; // TALLER text region (was 6mm)
      const bottomSafeMM = 3; // Green line is 3mm above trim
      
      const bannerHeightPx = mmToPixels(bannerHeightMM, this.dpi);
      const artworkHeightPx = mmToPixels(artworkHeightMM, this.dpi);
      const textRegionHeightPx = mmToPixels(textRegionHeightMM, this.dpi);
      const bottomSafePx = mmToPixels(bottomSafeMM, this.dpi);
      
      console.log(`📐 Layout: Banner ${bannerHeightMM}mm, Artwork ${artworkHeightMM}mm, Text ${textRegionHeightMM}mm, Safe ${bottomSafeMM}mm`);
      console.log(`📐 Total: ${bannerHeightMM + artworkHeightMM}mm artwork area, ${textRegionHeightMM}mm text extends toward trim`);
      
      // Positions from top of printable area
      const bannerY = bleedPx;
      const artworkY = bleedPx + bannerHeightPx;
      const textRegionY = bleedPx + bannerHeightPx + artworkHeightPx;
      const greenLineY = bleedPx + heightPx - bottomSafePx; // 3mm above trim
      const redCutLineY = bleedPx + heightPx;
      
      // VERIFY
      console.log(`📏 Banner: ${bannerY}px - ${artworkY}px`);
      console.log(`📏 Artwork: ${artworkY}px - ${textRegionY}px`);
      console.log(`📏 Text region: ${textRegionY}px - ${textRegionY + textRegionHeightPx}px`);
      console.log(`📏 GREEN safe line: ${greenLineY}px`);
      console.log(`📏 RED trim line: ${redCutLineY}px`);
      console.log(`📏 Safe zone margin: ${(redCutLineY - greenLineY).toFixed(1)}px = ${bottomSafeMM}mm`);
      
      // Draw banner
      if (hasBanner) {
        await this.drawBanner(bleedPx, bannerY, widthPx, bannerHeightPx, options.template.id);
      }
      
      // Draw artwork (37mm square)
      if (data.artworkUrl) {
        await this.drawArtwork(data.artworkUrl, bleedPx, artworkY, widthPx, artworkHeightPx, artworkPosition);
      } else {
        this.ctx.fillStyle = '#404040';
        this.ctx.fillRect(bleedPx, artworkY, widthPx, artworkHeightPx);
      }
      
      // Draw text region (white, 9mm tall, extends toward trim)
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(bleedPx, textRegionY, widthPx, textRegionHeightPx);
      
      // Draw text HIGH in the region (like banner alignment) to stay above green line
      this.drawTextRegionAligned(data, bleedPx, textRegionY, widthPx, textRegionHeightPx, this.fontFamily, options.fontStyle || { bold: false, italic: false, titleCase: false });
      
      // Draw green safe zone line (3mm above trim) - only when showSafeZone is enabled
      if (options.showSafeZone) {
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.moveTo(bleedPx, greenLineY);
        this.ctx.lineTo(bleedPx + widthPx, greenLineY);
        this.ctx.stroke();
        
        const textToGreen = greenLineY - textRegionY;
        console.log(`✅ GREEN LINE at ${greenLineY}px (${(textToGreen / mmToPixels(1, this.dpi)).toFixed(1)}mm into text region)`);
      }
      
    } else {
      // OTHER TEMPLATES - Original layout with separate text region
      const bannerHeightMM = hasBanner ? 4 : 0;
      const textRegionHeightMM = 6.5;
      const textBottomMarginMM = 1.0;
      const artworkHeightMM = heightMM - bannerHeightMM - textRegionHeightMM - textBottomMarginMM;
      
      const bannerHeightPx = mmToPixels(bannerHeightMM, this.dpi);
      const textRegionHeightPx = mmToPixels(textRegionHeightMM, this.dpi);
      const textBottomMarginPx = mmToPixels(textBottomMarginMM, this.dpi);
      const artworkHeightPx = mmToPixels(artworkHeightMM, this.dpi);
      
      if (hasBanner) {
        await this.drawBanner(bleedPx, bleedPx, widthPx, bannerHeightPx, options.template.id);
      }
      
      const artworkX = bleedPx;
      const artworkY = bleedPx + bannerHeightPx;
      const artworkWidth = widthPx;
      const artworkHeight = artworkHeightPx;
      
      if (data.artworkUrl) {
        await this.drawArtwork(data.artworkUrl, artworkX, artworkY, artworkWidth, artworkHeight, artworkPosition);
      } else {
        this.ctx.fillStyle = '#404040';
        this.ctx.fillRect(artworkX, artworkY, artworkWidth, artworkHeight);
      }
      
      const textRegionY = bleedPx + bannerHeightPx + artworkHeightPx + textBottomMarginPx;
      this.drawTextRegion(data, bleedPx, textRegionY, widthPx, textRegionHeightPx, labelTheme, this.fontFamily);
      
      if (options.showTrimLine) {
        const textRegionBottomY = textRegionY + textRegionHeightPx;
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(bleedPx, textRegionBottomY);
        this.ctx.lineTo(bleedPx + widthPx, textRegionBottomY);
        this.ctx.stroke();
      }
    }
    
    // Common rendering for all templates
    if (options.showTrimLine) {
      this.drawTrimLine(bleedPx, bleedPx, widthPx, heightPx);
    }
    
    // Safe zone line for non-disc-surface templates (if needed)
    if (options.showSafeZone && options.template.id !== 'disc-surface') {
      // Show safe zone for other templates as 3mm inset from trim
      const safeInset = mmToPixels(3, this.dpi);
      this.ctx.strokeStyle = '#00FF00';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.strokeRect(bleedPx + safeInset, bleedPx + safeInset, widthPx - (safeInset * 2), heightPx - (safeInset * 2));
      this.ctx.setLineDash([]);
    }
    
    if (options.showCropMarks) {
      this.drawCropMarks(bleedPx, bleedPx, widthPx, heightPx);
    }
    
    if (options.showCenterMarks) {
      this.drawCenterMarks(bleedPx, bleedPx, widthPx, heightPx);
    }
  }

  private enableFontSmoothing(): void {
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Additional smoothing hints (non-standard but helps in some browsers)
    if ('fontSmooth' in this.ctx) {
      (this.ctx as any).fontSmooth = 'always';
    }
    if ('textRendering' in this.ctx) {
      (this.ctx as any).textRendering = 'optimizeLegibility';
    }
  }

  private async drawBanner(x: number, y: number, width: number, height: number, templateId: string): Promise<void> {
    // WHITE banner background
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(x, y, width, height);
    
    // Enable font smoothing for quality text
    this.enableFontSmoothing();
    
    // Calculate font size
    let fontSize = Math.max(8, height * 0.6);
    const minFontSize = Math.max(8, mmToPixels(3, this.dpi) * 0.8);
    fontSize = Math.max(fontSize, minFontSize);
    
    // BLACK text and arrow
    this.ctx.fillStyle = '#000000';
    this.ctx.font = `bold ${fontSize}px "${this.fontFamily}", "Futura PT", "Century Gothic", "Arial", sans-serif`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    
    const padding = mmToPixels(2, this.dpi);
    const textY = y + height / 2;
    
    // Arrow direction based on template - UP for disc surface, LEFT for others
    const arrow = templateId === 'disc-surface' ? '▲' : '◄';
    const arrowMetrics = this.ctx.measureText(arrow);
    const arrowX = x + padding;
    
    this.ctx.fillText(arrow, arrowX, textY);
    
    // Text after arrow
    const textX = arrowX + arrowMetrics.width + padding;
    const maxTextWidth = width - textX - padding + x;
    
    let displayText = 'INSERT THIS END';
    let textMetrics = this.ctx.measureText(displayText);
    while (textMetrics.width > maxTextWidth && displayText.length > 0) {
      displayText = displayText.slice(0, -1);
      textMetrics = this.ctx.measureText(displayText);
    }
    
    this.ctx.fillText(displayText, textX, textY);
  }

  private async drawArtwork(
    imageUrl: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number,
    position: { x: number; y: number; scale: number } = { x: 0, y: 0, scale: 1 }
  ): Promise<void> {
    console.log('🖼️ drawArtwork called with URL:', imageUrl);
    console.log('📐 Draw region:', { x, y, width, height });
    console.log('🎯 Position:', position);
    
    if (!imageUrl) {
      console.log('⚠️ No artwork URL provided, drawing gray placeholder');
      this.ctx.fillStyle = '#404040';
      this.ctx.fillRect(x, y, width, height);
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        console.error('❌ Image load timeout after 10 seconds for:', imageUrl);
        this.ctx.fillStyle = '#404040';
        this.ctx.fillRect(x, y, width, height);
        resolve();
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        console.log('✅ Image loaded successfully');
        console.log('🖼️ Image dimensions:', img.width, 'x', img.height, 'pixels');
        console.log('🔍 Image size:', (img.width * img.height).toLocaleString(), 'total pixels');
        console.log('📐 Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        console.log('📏 Draw region:', width, 'x', height, 'pixels');
        
        // Verify if this is actually high-res
        const isHighRes = img.width >= 1500 || img.height >= 1500;
        console.log(isHighRes ? '✅ HIGH-RES IMAGE LOADED' : '⚠️ LOW-RES IMAGE');
        
        try {
          // Calculate aspect ratios
          const imgAspect = img.width / img.height;
          const areaAspect = width / height;
          
          let drawWidth: number;
          let drawHeight: number;
          
          // Scale factor (0.9 correction removed - now handled in default scale value)
          const scaleFactor = position.scale;
          
          // Apply scale to dimensions
          if (imgAspect > areaAspect) {
            // Image is wider - fit to height
            drawHeight = height * scaleFactor;
            drawWidth = drawHeight * imgAspect;
          } else {
            // Image is taller - fit to width
            drawWidth = width * scaleFactor;
            drawHeight = drawWidth / imgAspect;
          }
          
          // Calculate base position (centered)
          let drawX = x + (width - drawWidth) / 2;
          let drawY = y + (height - drawHeight) / 2;
          
          // Apply offset in mm (converted to pixels)
          // position.x and position.y are now in mm, with (0,0) = center
          const offsetXPx = mmToPixels(position.x, this.dpi);
          const offsetYPx = mmToPixels(position.y, this.dpi);
          
          drawX += offsetXPx;
          drawY += offsetYPx;
          
          console.log('📍 Drawing at:', { drawX, drawY, drawWidth, drawHeight });
          console.log('📏 Offset applied:', { offsetXMm: position.x, offsetYMm: position.y, offsetXPx, offsetYPx });
          
          // Clip to region boundary and draw
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.rect(x, y, width, height);
          this.ctx.clip();
          this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          this.ctx.restore();
          
          console.log('✅ Image drawn successfully');
          resolve();
          
        } catch (err) {
          console.error('❌ Error drawing image:', err);
          this.ctx.fillStyle = '#404040';
          this.ctx.fillRect(x, y, width, height);
          resolve();
        }
      };
      
      img.onerror = (err) => {
        clearTimeout(timeout);
        console.error('❌ Image load error:', err);
        console.error('❌ Failed URL:', imageUrl);
        this.ctx.fillStyle = '#404040';
        this.ctx.fillRect(x, y, width, height);
        resolve();
      };
      
      console.log('🔄 Starting image load from:', imageUrl);
      img.src = imageUrl;
    });
  }

  private drawTextRegionAligned(
    data: LabelData, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    fontFamily: string,
    fontStyle: { bold: boolean; italic: boolean; titleCase: boolean } = { bold: false, italic: false, titleCase: false }
  ): void {
    // Text positioned HIGH in region, aligned like banner (for disc-surface 9mm region)
    this.enableFontSmoothing();
    
    this.ctx.fillStyle = '#000000'; // Black text on white
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    const padding = mmToPixels(1.5, this.dpi);
    const textX = x + padding;
    const maxWidth = width - (padding * 2);
    
    // Font sizes - larger for 9mm region
    const titleSize = mmToPixels(2.8, this.dpi); // Large for title
    const subSize = mmToPixels(2.2, this.dpi); // Medium for artist
    const yearSize = mmToPixels(2.0, this.dpi); // Slightly smaller for year
    
    // Position text HIGH in region (like banner alignment)
    const topMargin = mmToPixels(1.0, this.dpi);
    const lineSpacing = mmToPixels(0.4, this.dpi); // TIGHTER spacing
    
    const line1Y = y + topMargin;
    const line2Y = line1Y + titleSize + lineSpacing;
    const line3Y = line2Y + subSize + lineSpacing;
    
    // Helper to apply text transformation
    const formatText = (text: string): string => {
      if (fontStyle.titleCase) {
        // Title Case: First letter of each word capitalized
        return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
      }
      return text.toUpperCase(); // Default all caps
    };
    
    // Helper to build font string
    const buildFontString = (size: number, isTitleBold: boolean = false): string => {
      const weight = (isTitleBold || fontStyle.bold) ? 'bold' : 'normal';
      const style = fontStyle.italic ? 'italic' : 'normal';
      return `${style} ${weight} ${size}px "${fontFamily}", "Futura PT", "Century Gothic", "Arial", sans-serif`;
    };
    
    const truncateText = (text: string, fontSize: number, fontStr: string): string => {
      this.ctx.font = fontStr;
      let metrics = this.ctx.measureText(text);
      if (metrics.width <= maxWidth) return text;
      let truncated = text;
      while (metrics.width > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
        metrics = this.ctx.measureText(truncated + '...');
      }
      return truncated + '...';
    };
    
    // Verify text stays in safe zone (first ~6mm of 9mm region)
    const textBottom = line3Y + yearSize;
    const safeTop = y;
    const safeHeight = mmToPixels(6, this.dpi); // Safe zone is first 6mm
    const safeBottom = safeTop + safeHeight;
    
    if (textBottom > safeBottom) {
      console.warn(`⚠️ Text extends ${((textBottom - safeBottom) / mmToPixels(1, this.dpi)).toFixed(1)}mm beyond 6mm safe zone`);
    } else {
      console.log(`✅ Text fits in safe zone: ${((safeBottom - textBottom) / mmToPixels(1, this.dpi)).toFixed(1)}mm margin`);
    }
    
    // TITLE - Bold by default unless titleCase is on
    const titleFont = buildFontString(titleSize, !fontStyle.titleCase);
    this.ctx.font = titleFont;
    this.ctx.fillText(truncateText(formatText(data.title), titleSize, titleFont), textX, line1Y);
    
    // ARTIST
    const artistFont = buildFontString(subSize);
    this.ctx.font = artistFont;
    this.ctx.fillText(truncateText(formatText(data.artist), subSize, artistFont), textX, line2Y);
    
    // YEAR
    const yearFont = buildFontString(yearSize);
    this.ctx.font = yearFont;
    this.ctx.fillText(truncateText(data.year, yearSize, yearFont), textX, line3Y);
  }

  private drawTextRegionCompact(data: LabelData, x: number, y: number, width: number, height: number, labelTheme: 'dark' | 'light', fontFamily: string): void {
    // Compact text layout for disc-surface 6mm region
    // Background
    if (labelTheme === 'light') {
      this.ctx.fillStyle = '#FFFFFF';
    } else {
      this.ctx.fillStyle = '#231F20';
    }
    this.ctx.fillRect(x, y, width, height);
    
    // Enable font smoothing
    this.enableFontSmoothing();
    
    const textColor = labelTheme === 'light' ? '#000000' : '#FFFFFF';
    this.ctx.fillStyle = textColor;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    // Minimal padding
    const padding = mmToPixels(0.5, this.dpi);
    const textX = x + padding;
    const maxWidth = width - (padding * 2);
    
    // Compact fonts for 6mm region
    const titleFontSize = Math.max(8, mmToPixels(2.0, this.dpi)); // 2.0mm title
    const subFontSize = Math.max(7, mmToPixels(1.6, this.dpi)); // 1.6mm subs
    
    const truncateText = (text: string, fontSize: number, maxW: number): string => {
      this.ctx.font = `${fontSize}px "${fontFamily}", "Futura PT", "Century Gothic", "Arial", sans-serif`;
      let metrics = this.ctx.measureText(text);
      if (metrics.width <= maxW) return text;
      let truncated = text;
      while (metrics.width > maxW && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
        metrics = this.ctx.measureText(truncated + '...');
      }
      return truncated + '...';
    };
    
    // Tight spacing for compact layout
    const titleLeading = titleFontSize * 1.1;
    const subLeading = subFontSize * 1.1;
    
    // Start near top of region
    const startY = y + padding;
    
    const line1Y = startY;
    const line2Y = line1Y + titleLeading;
    const line3Y = line2Y + subLeading;
    
    // Verify fit
    const actualBottom = line3Y + subFontSize;
    const allowedBottom = y + height;
    
    if (actualBottom > allowedBottom) {
      console.error(`❌ TEXT OVERFLOW in 6mm region: Bottom ${actualBottom.toFixed(1)}px exceeds ${allowedBottom.toFixed(1)}px by ${(actualBottom - allowedBottom).toFixed(1)}px`);
    } else {
      console.log(`✅ TEXT FITS in 6mm region: ${(allowedBottom - actualBottom).toFixed(1)}px margin remaining`);
    }
    
    // TITLE - BOLD
    this.ctx.font = `bold ${titleFontSize}px "${fontFamily}", "Futura PT", "Century Gothic", "Arial", sans-serif`;
    this.ctx.fillText(truncateText(data.title.toUpperCase(), titleFontSize, maxWidth), textX, line1Y);
    
    // ARTIST - NORMAL
    this.ctx.font = `${subFontSize}px "${fontFamily}", "Futura PT", "Century Gothic", "Arial", sans-serif`;
    this.ctx.fillText(truncateText(data.artist.toUpperCase(), subFontSize, maxWidth), textX, line2Y);
    
    // YEAR - NORMAL
    this.ctx.font = `${subFontSize}px "${fontFamily}", "Futura PT", "Century Gothic", "Arial", sans-serif`;
    this.ctx.fillText(truncateText(data.year, subFontSize, maxWidth), textX, line3Y);
  }

  private drawTextRegion(data: LabelData, x: number, y: number, width: number, height: number, labelTheme: 'dark' | 'light', fontFamily: string): void {
    // Background
    if (labelTheme === 'light') {
      this.ctx.fillStyle = '#FFFFFF';
    } else {
      this.ctx.fillStyle = '#231F20';
    }
    this.ctx.fillRect(x, y, width, height);
    
    // Enable font smoothing for quality text
    this.enableFontSmoothing();
    
    const textColor = labelTheme === 'light' ? '#000000' : '#FFFFFF';
    this.ctx.fillStyle = textColor;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    // GENEROUS padding for reference-style layout
    const padding = mmToPixels(1.5, this.dpi); // Increased for better margins
    const textX = x + padding;
    const maxWidth = width - (padding * 2);
    
    // LARGER fonts to match reference image (6.5mm region)
    const titleFontSize = Math.max(10, mmToPixels(2.5, this.dpi)); // LARGER - was 1.8mm
    const subFontSize = Math.max(8, titleFontSize * 0.75); // 75% of title
    const yearFontSize = Math.max(8, titleFontSize * 0.75);
    
    const truncateText = (text: string, fontSize: number, maxW: number): string => {
      this.ctx.font = `${fontSize}px "${fontFamily}", "Futura PT", "Century Gothic", "Arial", sans-serif`;
      let metrics = this.ctx.measureText(text);
      if (metrics.width <= maxW) return text;
      let truncated = text;
      while (metrics.width > maxW && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
        metrics = this.ctx.measureText(truncated + '...');
      }
      return truncated + '...';
    };
    
    // Much more generous spacing to match reference
    const titleLeading = titleFontSize * 1.3; // More space
    const subLeading = subFontSize * 1.2;
    
    // Start with reasonable top margin
    const startY = y + mmToPixels(0.5, this.dpi); // Better top margin
    
    const line1Y = startY;
    const line2Y = startY + titleLeading;
    const line3Y = line2Y + subLeading;
    
    // Calculate actual bottom position
    const actualBottom = line3Y + subFontSize;
    const allowedBottom = y + height;
    
    if (actualBottom > allowedBottom) {
      console.error(`❌ TEXT OVERFLOW: Actual bottom ${actualBottom}px exceeds allowed ${allowedBottom}px by ${(actualBottom - allowedBottom).toFixed(1)}px`);
    } else {
      console.log(`✅ TEXT FITS: ${(allowedBottom - actualBottom).toFixed(1)}px margin remaining`);
    }
    
    // TITLE - BOLD
    this.ctx.font = `bold ${titleFontSize}px "${fontFamily}", "Futura PT", "Century Gothic", "Arial", sans-serif`;
    this.ctx.fillText(truncateText(data.title.toUpperCase(), titleFontSize, maxWidth), textX, line1Y);
    
    // ARTIST - NORMAL
    this.ctx.font = `${subFontSize}px "${fontFamily}", "Futura PT", "Century Gothic", "Arial", sans-serif`;
    this.ctx.fillText(truncateText(data.artist.toUpperCase(), subFontSize, maxWidth), textX, line2Y);
    
    // YEAR - NORMAL
    this.ctx.font = `${yearFontSize}px "${fontFamily}", "Futura PT", "Century Gothic", "Arial", sans-serif`;
    this.ctx.fillText(truncateText(data.year, yearFontSize, maxWidth), textX, line3Y);
  }

  private drawTrimLine(x: number, y: number, width: number, height: number): void {
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.setLineDash([]);
  }

  private drawBleedBoundary(x: number, y: number, width: number, height: number): void {
    this.ctx.strokeStyle = '#00FF00';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([3, 3]);
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setLineDash([]);
  }

  private drawCropMarks(x: number, y: number, width: number, height: number): void {
    const markLength = mmToPixels(5, this.dpi); // Make longer - 5mm
    const markOffset = mmToPixels(2, this.dpi); // More offset from trim - 2mm
    
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = Math.max(2, this.dpi / 150); // Scale with DPI
    this.ctx.setLineDash([]);
    
    // Top-left corner
    this.ctx.beginPath();
    // Horizontal mark to the LEFT
    this.ctx.moveTo(x - markOffset - markLength, y);
    this.ctx.lineTo(x - markOffset, y);
    // Vertical mark ABOVE
    this.ctx.moveTo(x, y - markOffset - markLength);
    this.ctx.lineTo(x, y - markOffset);
    this.ctx.stroke();
    
    // Top-right corner
    this.ctx.beginPath();
    // Horizontal mark to the RIGHT
    this.ctx.moveTo(x + width + markOffset, y);
    this.ctx.lineTo(x + width + markOffset + markLength, y);
    // Vertical mark ABOVE
    this.ctx.moveTo(x + width, y - markOffset - markLength);
    this.ctx.lineTo(x + width, y - markOffset);
    this.ctx.stroke();
    
    // Bottom-left corner
    this.ctx.beginPath();
    // Horizontal mark to the LEFT
    this.ctx.moveTo(x - markOffset - markLength, y + height);
    this.ctx.lineTo(x - markOffset, y + height);
    // Vertical mark BELOW
    this.ctx.moveTo(x, y + height + markOffset);
    this.ctx.lineTo(x, y + height + markOffset + markLength);
    this.ctx.stroke();
    
    // Bottom-right corner
    this.ctx.beginPath();
    // Horizontal mark to the RIGHT
    this.ctx.moveTo(x + width + markOffset, y + height);
    this.ctx.lineTo(x + width + markOffset + markLength, y + height);
    // Vertical mark BELOW
    this.ctx.moveTo(x + width, y + height + markOffset);
    this.ctx.lineTo(x + width, y + height + markOffset + markLength);
    this.ctx.stroke();
  }

  private drawCenterMarks(x: number, y: number, width: number, height: number): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const markLength = mmToPixels(5, this.dpi); // Make longer - 5mm
    
    this.ctx.strokeStyle = '#FF0000'; // Use red so it's visible
    this.ctx.lineWidth = Math.max(2, this.dpi / 150); // Scale with DPI
    this.ctx.setLineDash([]);
    
    // Horizontal crosshair
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - markLength, centerY);
    this.ctx.lineTo(centerX + markLength, centerY);
    this.ctx.stroke();
    
    // Vertical crosshair
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - markLength);
    this.ctx.lineTo(centerX, centerY + markLength);
    this.ctx.stroke();
  }

  public exportPNG(): string {
    return this.canvas.toDataURL('image/png');
  }
}

export function createExportCanvas(dpi: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.style.display = 'none';
  return canvas;
}
