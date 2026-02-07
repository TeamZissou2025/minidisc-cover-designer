/**
 * MiniDisc Cover Designer - Version Configuration
 * 
 * Single source of truth for version number and changelog.
 * Run `npm run version:update` after editing this file.
 */

module.exports = {
  version: '0.3.7g',
  
  // Current release info
  releaseDate: '2026-02-07',
  releaseName: '5 Artwork Sources',
  
  // Features for this version (shown in footer)
  features: '5 artwork sources active',
  
  // Changelog for this version
  changelog: [
    'Re-enabled Discogs API integration (600×600px)',
    'iTunes API integration (3000×3000px)',
    'Deezer API integration (1000×1000px)',
    'Spotify API integration (640×640px)',
    'Last.fm API integration (300×300px)',
    'Smart title auto-scaling for long titles',
    'PDF export with accurate physical dimensions',
    'Centralized version management system',
  ],
  
  // API sources status
  apis: {
    itunes: { active: true, resolution: '3000×3000', icon: '🎵' },
    deezer: { active: true, resolution: '1000×1000', icon: '🎶' },
    discogs: { active: true, resolution: '600×600', icon: '💿' },
    spotify: { active: true, resolution: '640×640', icon: '🎧' },
    lastfm: { active: true, resolution: '300×300', icon: '📻' },
  }
};
