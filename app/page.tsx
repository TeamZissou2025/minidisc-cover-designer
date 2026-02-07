'use client'

import { useState, useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import { LabelRenderer, createExportCanvas } from '@/lib/renderer'
import type { LabelData, RenderOptions, TemplateFormat } from '@/lib/types'
import { DPI } from '@/lib/types'
import { TEMPLATES, DEFAULT_TEMPLATE, TEMPLATE_CATEGORIES } from '@/lib/constants'
import { 
  Search, 
  Download, 
  Image as ImageIcon, 
  Type, 
  Layout, 
  Settings,
  ZoomIn,
  ZoomOut,
  X,
  ChevronDown,
  Upload,
  Eye,
  Music,
  Palette,
  Zap,
  Plus,
  Sun,
  Move,
  Edit,
  Check
} from 'lucide-react'

// Curated geometric/grotesque fonts for label design
const FONT_OPTIONS = [
  { name: 'Space Grotesk', description: 'Geometric, quirky' },
  { name: 'DM Sans', description: 'Clean, geometric' },
  { name: 'Manrope', description: 'Modern geometric' },
  { name: 'Outfit', description: 'Round geometric' },
  { name: 'Syne', description: 'Sharp geometric' },
  { name: 'Archivo', description: 'Grotesque, industrial' },
  { name: 'Red Hat Display', description: 'Geometric, bold' },
  { name: 'Chivo', description: 'Condensed grotesque' },
  { name: 'Jost', description: 'Futura-inspired' },
  { name: 'Lexend', description: 'Readable geometric' },
  { name: 'Plus Jakarta Sans', description: 'Soft geometric' },
]

const FONT_VARIANTS: Record<string, string> = {
  'Space Grotesk': 'wght@400;700',
  'DM Sans': 'wght@400;700',
  'Manrope': 'wght@400;700',
  'Outfit': 'wght@400;700',
  'Syne': 'wght@400;700',
  'Archivo': 'wght@400;700',
  'Red Hat Display': 'wght@400;700',
  'Chivo': 'wght@400;700',
  'Jost': 'wght@400;700',
  'Lexend': 'wght@400;700',
  'Plus Jakarta Sans': 'wght@400;700',
}

// Fuzzy Search Utilities - Built-in implementation (no dependencies)
const compareTwoStrings = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1.0
  if (s1.length < 2 || s2.length < 2) return 0.0
  
  // Simple bigram comparison
  const pairs1 = new Set<string>()
  const pairs2 = new Set<string>()
  
  for (let i = 0; i < s1.length - 1; i++) {
    pairs1.add(s1.substring(i, i + 2))
  }
  
  for (let i = 0; i < s2.length - 1; i++) {
    pairs2.add(s2.substring(i, i + 2))
  }
  
  const intersection = new Set([...pairs1].filter(x => pairs2.has(x)))
  return (2.0 * intersection.size) / (pairs1.size + pairs2.size)
}

const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1.0
  
  return compareTwoStrings(s1, s2)
}

const artistMatches = (searchArtist: string, resultArtist: string): boolean => {
  const similarity = calculateSimilarity(searchArtist, resultArtist)
  
  if (similarity >= 0.6) return true
  
  const s1 = searchArtist.toLowerCase().trim()
  const s2 = resultArtist.toLowerCase().trim()
  
  if (s1.includes(s2) || s2.includes(s1)) return true
  
  const s1NoThe = s1.replace(/^the\s+/, '')
  const s2NoThe = s2.replace(/^the\s+/, '')
  
  if (s1NoThe === s2NoThe) return true
  
  return false
}

const albumMatches = (searchAlbum: string, resultAlbum: string): boolean => {
  const similarity = calculateSimilarity(searchAlbum, resultAlbum)
  
  if (similarity >= 0.65) return true
  
  const s1 = searchAlbum.toLowerCase().trim()
  const s2 = resultAlbum.toLowerCase().trim()
  
  if (s1.includes(s2) || s2.includes(s1)) return true
  
  return false
}

// Search result type with multi-source support and fuzzy matching
interface SearchResult {
  id: string;
  title: string;
  artist: string;
  year: string;
  type: string;
  thumbnailUrl: string | null;
  artworkUrl: string | null;
  source: 'spotify' | 'lastfm' | 'deezer' | 'itunes' | 'discogs';
  relevanceScore?: number;
}

const calculateRelevanceScore = (
  result: SearchResult,
  searchArtist: string,
  searchAlbum: string
): number => {
  const artistSimilarity = calculateSimilarity(searchArtist, result.artist)
  const albumSimilarity = calculateSimilarity(searchAlbum, result.title)
  
  let score = (albumSimilarity * 0.6) + (artistSimilarity * 0.4)
  
  if (result.title.toLowerCase() === searchAlbum.toLowerCase()) {
    score += 0.3
  }
  
  if (result.artworkUrl) {
    score += 0.05
  }
  
  return Math.min(score, 1.0)
}

export default function Home() {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState<100 | 300>(300)
  const [previewZoom, setPreviewZoom] = useState(3.0) // 1.0 = 100%, 3.0 = 300%
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateFormat>(DEFAULT_TEMPLATE)
  const [selectedFont, setSelectedFont] = useState<string>('Space Grotesk')
  const [fontLoaded, setFontLoaded] = useState(false)
  const [fontStyle, setFontStyle] = useState({
    bold: false,
    italic: false,
    titleCase: false
  })
  const [labelData, setLabelData] = useState<LabelData>({
    title: '',
    artist: '',
    year: '',
    artworkUrl: null,
  })
  
  // Search state
  const [searchArtist, setSearchArtist] = useState('')
  const [searchAlbum, setSearchAlbum] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // Feedback state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'feature' | 'bug' | 'other'>('feature')
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
    dpi: DPI.SCREEN,
    showTrimLine: true,
    showSafeZone: true,  // Changed from showBleed
    showCropMarks: false,
    showCenterMarks: false,
    template: DEFAULT_TEMPLATE,
    fontFamily: 'Space Grotesk',
    fontStyle: { bold: false, italic: false, titleCase: false },
  })
  
  // Theme state
  const labelTheme = 'light'; // Always light - label theme removed
  const [uiTheme, setUiTheme] = useState<'dark' | 'light'>('dark')
  
  // Artwork positioning
  const [artworkPosition, setArtworkPosition] = useState({ x: 0, y: 0, scale: 1.12 }) // Default 1.12x scale

  // Load UI theme from localStorage
  useEffect(() => {
    const savedUiTheme = localStorage.getItem('uiTheme') as 'dark' | 'light'
    if (savedUiTheme) {
      setUiTheme(savedUiTheme)
    }
  }, [])

  // Save UI theme to localStorage and apply to document
  useEffect(() => {
    localStorage.setItem('uiTheme', uiTheme)
    document.documentElement.setAttribute('data-theme', uiTheme)
  }, [uiTheme])

  // Branding console log
  useEffect(() => {
    console.log('%c MiniDisc Cover Designer v0.3.7e ', 'background: #8b5cf6; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;')
    console.log('%c by Joltt ', 'color: #3b82f6; font-weight: bold;')
  }, [])

  // Load font from localStorage on mount
  useEffect(() => {
    const savedFont = localStorage.getItem('md-label-font')
    if (savedFont && FONT_OPTIONS.some(f => f.name === savedFont)) {
      setSelectedFont(savedFont)
    }
  }, [])

  // Load Google Font dynamically with proper state management
  useEffect(() => {
    console.log('Loading font:', selectedFont)
    
    // Clear any existing font link
    const existingLink = document.getElementById('google-font-link')
    if (existingLink) {
      existingLink.remove()
    }

    // Create new font link
    const fontName = selectedFont.replace(/\s+/g, '+')
    const variants = FONT_VARIANTS[selectedFont] || 'wght@400;700'
    const link = document.createElement('link')
    link.id = 'google-font-link'
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:${variants}&display=swap`
    
    // Set loading state before appending
    setFontLoaded(false)
    
    // Wait for link to load
    link.onload = () => {
      console.log('Font link loaded:', selectedFont)
      
      // Wait for font to actually be available
      document.fonts.load(`16px "${selectedFont}"`).then(() => {
        console.log('Font ready:', selectedFont)
        setFontLoaded(true)
        
        // Update render options with new font
        setRenderOptions(prev => ({ 
          ...prev, 
          fontFamily: selectedFont,
        }))
      }).catch(err => {
        console.error('Font load error:', err)
        setFontLoaded(true) // Set to true anyway to unblock rendering
      })
    }
    
    link.onerror = () => {
      console.error('Font link error:', selectedFont)
      setFontLoaded(true) // Set to true anyway to unblock rendering
    }
    
    document.head.appendChild(link)

    return () => {
      // Don't remove the link on cleanup to avoid flickering
    }
  }, [selectedFont])

  // Update font
  const handleFontChange = (newFont: string) => {
    setSelectedFont(newFont)
    localStorage.setItem('md-label-font', newFont)
  }

  // Safari performance warning
  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isSafari) {
      console.warn('⚠️ Safari detected. For best performance, use Chrome, Firefox, or Edge.')
      console.warn('Safari may experience progressive slowdown with multiple renders.')
    }
  }, [])

  useEffect(() => {
    setRenderOptions(prev => ({ ...prev, template: selectedTemplate }))
  }, [selectedTemplate])

  // Sync fontStyle with renderOptions
  useEffect(() => {
    setRenderOptions(prev => ({ ...prev, fontStyle }))
  }, [fontStyle])

  useEffect(() => {
    console.log('🎨 Render useEffect triggered')
    console.log('📊 Current labelData:', labelData)
    console.log('🖼️ Artwork URL:', labelData.artworkUrl)
    console.log('🖌️ Font loaded:', fontLoaded)
    console.log('📐 Canvas ref:', previewCanvasRef.current)
    
    if (!previewCanvasRef.current || !fontLoaded) {
      console.log('⏸️ Skipping render - canvas or font not ready')
      return
    }
    
    console.log('🚀 Starting render...')
    
    // Render at PRINT quality (300 DPI) for sharp preview
    const renderer = new LabelRenderer(previewCanvasRef.current, DPI.PRINT)
    
    const renderOpts = { ...renderOptions, dpi: DPI.PRINT, labelTheme, artworkPosition, fontStyle }
    console.log('⚙️ Render options:', renderOpts)
    
    renderer.render(labelData, renderOpts as any)
      .then(() => {
        console.log('✅ Render complete!')
      })
      .catch(err => {
        console.error('❌ Render failed:', err)
      })
  }, [labelData, renderOptions, fontLoaded, labelTheme, artworkPosition])

  // Handle Enter key in search inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchArtist.trim() && searchAlbum.trim() && !isSearching) {
      handleSearch()
    }
  }

  // Deezer API Search with Fuzzy Matching (via proxy to avoid CORS)
  const searchDeezer = async (artist: string, album: string): Promise<SearchResult[]> => {
    try {
      const query = `${artist} ${album}`
      const response = await fetch(
        `/api/proxy/deezer?q=${encodeURIComponent(query)}`
      )
      
      if (!response.ok) return []
      
      const data = await response.json()
      
      if (!data.data || data.data.length === 0) return []
      
      return data.data
        .filter((item: any) => 
          artistMatches(artist, item.artist.name) && albumMatches(album, item.title)
        )
        .map((item: any) => ({
          id: `deezer-${item.id}`,
          title: item.title,
          artist: item.artist.name,
          year: item.release_date ? item.release_date.substring(0, 4) : '',
          type: 'Album',
          thumbnailUrl: item.cover_medium || item.cover_small,
          artworkUrl: item.cover_xl || item.cover_big || item.cover_medium,
          source: 'deezer' as const
        }))
    } catch (error) {
      console.error('Deezer search failed:', error)
      return []
    }
  }

  // Spotify API Search with Fuzzy Matching (via proxy)
  const searchSpotify = async (artist: string, album: string): Promise<SearchResult[]> => {
    try {
      const query = `artist:${artist} album:${album}`
      const response = await fetch(
        `/api/proxy/spotify?q=${encodeURIComponent(query)}`
      )
      
      if (!response.ok) return []
      
      const data = await response.json()
      
      if (!data.albums?.items) return []
      
      return data.albums.items
        .filter((item: any) => {
          // Filter out singles, EPs, compilations
          if (item.album_type !== 'album') return false
          
          // FUZZY MATCHING
          const resultArtist = item.artists[0]?.name || ''
          const resultAlbum = item.name
          
          return artistMatches(artist, resultArtist) && albumMatches(album, resultAlbum)
        })
        .map((item: any) => {
          // Spotify images are sorted by size (largest first)
          const largestImage = item.images[0] // Usually 640×640
          
          return {
            id: `spotify-${item.id}`,
            title: item.name,
            artist: item.artists[0]?.name || artist,
            year: item.release_date ? item.release_date.substring(0, 4) : '',
            type: 'Album',
            thumbnailUrl: item.images[2]?.url || item.images[1]?.url || largestImage?.url, // 64×64 or smaller
            artworkUrl: largestImage?.url || null, // 640×640
            source: 'spotify' as const
          }
        })
    } catch (error) {
      console.error('Spotify search failed:', error)
      return []
    }
  }

  // Last.fm API Search with Fuzzy Matching (via proxy to avoid CORS/403)
  const searchLastFm = async (artist: string, album: string): Promise<SearchResult[]> => {
    try {
      const query = `${artist} ${album}`
      const response = await fetch(
        `/api/proxy/lastfm?q=${encodeURIComponent(query)}`
      )
      
      if (!response.ok) return []
      
      const data = await response.json()
      
      if (!data.results?.albummatches?.album) return []
      
      return data.results.albummatches.album
        .filter((item: any) => {
          // Filter out invalid results
          if (!item.name || !item.artist) return false
          
          // FUZZY MATCHING
          return artistMatches(artist, item.artist) && albumMatches(album, item.name)
        })
        .map((item: any) => {
          // Last.fm provides multiple sizes - get the largest
          const images = item.image || []
          const largestImage = images.find((img: any) => img.size === 'extralarge') || 
                              images.find((img: any) => img.size === 'large') ||
                              images.find((img: any) => img.size === 'medium') ||
                              images[images.length - 1]
          
          return {
            id: `lastfm-${item.mbid || item.name.replace(/\s+/g, '-')}`,
            title: item.name,
            artist: item.artist,
            year: '', // Last.fm search doesn't provide year
            type: 'Album',
            thumbnailUrl: largestImage?.['#text'] || null,
            artworkUrl: largestImage?.['#text'] || null, // Last.fm typically 300×300
            source: 'lastfm' as const
          }
        })
    } catch (error) {
      console.error('Last.fm search failed:', error)
      return []
    }
  }

  // Discogs API Search with Fuzzy Matching (via proxy)
  const searchDiscogs = async (artist: string, album: string): Promise<SearchResult[]> => {
    try {
      const query = `${artist} ${album}`
      const response = await fetch(
        `/api/proxy/discogs?q=${encodeURIComponent(query)}`
      )
      
      if (!response.ok) return []
      
      const data = await response.json()
      
      if (!data.results || data.results.length === 0) return []
      
      return data.results
        .filter((item: any) => {
          // Filter for albums only
          if (item.type !== 'release' && item.type !== 'master') return false
          
          // Filter out singles, EPs
          if (item.format && item.format.some((f: string) => 
            f.toLowerCase().includes('single') || f.toLowerCase().includes('ep')
          )) return false
          
          // FUZZY MATCHING
          const resultArtist = item.title.split(' - ')[0] || ''
          const resultAlbum = item.title.split(' - ')[1] || item.title
          
          return artistMatches(artist, resultArtist) && albumMatches(album, resultAlbum)
        })
        .map((item: any) => {
          // Extract artist and album from "Artist - Album" title format
          const titleParts = item.title.split(' - ')
          const itemArtist = titleParts[0] || artist
          const itemAlbum = titleParts[1] || item.title
          
          return {
            id: `discogs-${item.id}`,
            title: itemAlbum,
            artist: itemArtist,
            year: item.year ? item.year.toString() : '',
            type: item.type === 'master' ? 'Album' : 'Release',
            thumbnailUrl: item.thumb || item.cover_image || null,
            artworkUrl: item.cover_image || item.thumb || null, // Usually 600×600 or larger
            source: 'discogs' as const
          }
        })
    } catch (error) {
      console.error('Discogs search failed:', error)
      return []
    }
  }

  // iTunes Search API with Fuzzy Matching
  const searchiTunes = async (artist: string, album: string): Promise<SearchResult[]> => {
    try {
      const query = encodeURIComponent(`${artist} ${album}`)
      const response = await fetch(
        `https://itunes.apple.com/search?term=${query}&entity=album&limit=20&media=music`
      )
      
      if (!response.ok) return []
      
      const data = await response.json()
      
      if (!data.results || data.results.length === 0) return []
      
      return data.results
        .filter((item: any) => {
          if (item.collectionType !== 'Album') return false
          
          // FUZZY MATCHING
          return artistMatches(artist, item.artistName) && albumMatches(album, item.collectionName)
        })
        .map((item: any) => ({
          id: `itunes-${item.collectionId}`,
          title: item.collectionName,
          artist: item.artistName,
          year: item.releaseDate ? item.releaseDate.substring(0, 4) : '',
          type: item.collectionType || 'Album',
          thumbnailUrl: item.artworkUrl100?.replace('100x100bb', '600x600bb'),
          artworkUrl: item.artworkUrl100?.replace('100x100bb', '3000x3000bb'), // Max resolution
          source: 'itunes' as const
        }))
    } catch (error) {
      console.error('iTunes search failed:', error)
      return []
    }
  }

  const handleSearch = async () => {
    if (!searchArtist.trim() || !searchAlbum.trim()) {
      setSearchError('Please enter both artist and album name.')
      return
    }
    
    setIsSearching(true)
    setSearchError(null)
    setSearchResults([])
    
    console.log('🔍 Starting search:', { artist: searchArtist, album: searchAlbum })
    
    // Track search event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search_album', {
        event_category: 'engagement',
      });
    }
    
    // TIMEOUT WRAPPER - fail after 15 seconds total
    const searchWithTimeout = Promise.race([
      (async () => {
        try {
          console.log('⏱️ Starting API calls with 15s timeout...')
          console.log('🔍 Searching for:', { artist: searchArtist.trim(), album: searchAlbum.trim() })
          
          // Use Promise.allSettled to handle individual failures gracefully
          // PRIORITY ORDER: iTunes (3000×3000) → Deezer (1000×1000) → Spotify (640×640) → Last.fm (300×300)
          // NOTE: Discogs temporarily disabled due to API issues
          const results = await Promise.allSettled([
            searchiTunes(searchArtist.trim(), searchAlbum.trim()),
            searchDeezer(searchArtist.trim(), searchAlbum.trim()),
            // searchDiscogs(searchArtist.trim(), searchAlbum.trim()), // DISABLED - API errors
            searchSpotify(searchArtist.trim(), searchAlbum.trim()),
            searchLastFm(searchArtist.trim(), searchAlbum.trim())
          ])
          
          console.log('📊 API call results:', {
            itunes: results[0].status,
            deezer: results[1].status,
            // discogs: 'disabled',
            spotify: results[2].status,
            lastfm: results[3].status
          })
          
          // Extract successful results (iTunes first for highest quality)
          const itunesResults = results[0].status === 'fulfilled' ? results[0].value : []
          const deezerResults = results[1].status === 'fulfilled' ? results[1].value : []
          // const discogsResults = [] // DISABLED
          const spotifyResults = results[2].status === 'fulfilled' ? results[2].value : []
          const lastfmResults = results[3].status === 'fulfilled' ? results[3].value : []
          
          if (results[0].status === 'rejected') console.error('❌ iTunes failed:', results[0].reason)
          if (results[1].status === 'rejected') console.error('❌ Deezer failed:', results[1].reason)
          // Discogs disabled
          if (results[2].status === 'rejected') console.error('❌ Spotify failed:', results[2].reason)
          if (results[3].status === 'rejected') console.error('❌ Last.fm failed:', results[3].reason)
          
          console.log('📈 Result counts:', {
            itunes: itunesResults.length,
            deezer: deezerResults.length,
            // discogs: 0, // DISABLED
            spotify: spotifyResults.length,
            lastfm: lastfmResults.length
          })
          
          // Log sample URLs to verify resolution
          if (itunesResults[0]?.artworkUrl) {
            console.log('🎵 iTunes sample:', {
              title: itunesResults[0].title,
              url: itunesResults[0].artworkUrl,
              resolution: itunesResults[0].artworkUrl.includes('3000x3000') ? '✅ 3000×3000' : '⚠️ Lower res'
            })
          }
          if (spotifyResults[0]?.artworkUrl) {
            console.log('🎧 Spotify sample:', {
              title: spotifyResults[0].title,
              url: spotifyResults[0].artworkUrl,
              resolution: '640×640'
            })
          }
          if (deezerResults[0]?.artworkUrl) {
            console.log('🎶 Deezer sample:', {
              title: deezerResults[0].title,
              url: deezerResults[0].artworkUrl,
              resolution: deezerResults[0].artworkUrl.includes('1000x1000') ? '✅ 1000×1000' : '⚠️ Lower res'
            })
          }
          // Discogs disabled - no logging
          if (spotifyResults[0]?.artworkUrl) {
            console.log('🎧 Spotify sample:', {
              title: spotifyResults[0].title,
              url: spotifyResults[0].artworkUrl,
              resolution: '640×640'
            })
          }
          if (lastfmResults[0]?.artworkUrl) {
            console.log('📻 Last.fm sample:', {
              title: lastfmResults[0].title,
              url: lastfmResults[0].artworkUrl
            })
          }
          
          // Combine in priority order: iTunes → Deezer → Spotify → Last.fm (Discogs disabled)
          const combined = [...itunesResults, ...deezerResults, ...spotifyResults, ...lastfmResults]
          
          // Log final order
          console.log('📊 Final results order (first 5):')
          combined.slice(0, 5).forEach((result, i) => {
            console.log(`   ${i+1}. [${result.source}] ${result.artist} - ${result.title}`)
          })
          
          return combined
          
        } catch (error) {
          console.error('❌ Search error:', error)
          return []
        }
      })(),
      new Promise<never>((_, reject) => 
        setTimeout(() => {
          console.error('⏰ Search timeout after 15 seconds')
          reject(new Error('Search timeout after 15 seconds'))
        }, 15000)
      )
    ])
    
    try {
      const allResults = await searchWithTimeout
      
      console.log('✅ Search completed, total results:', allResults.length)
      
      if (allResults.length === 0) {
        console.error('❌ No results from any API')
        setSearchError(`No results found. This could mean:

• Network connection issue
• API services temporarily down  
• Try different search terms
• Or use Manual Entry instead`)
        setIsSearching(false)
        return
      }
      
      // Deduplicate
      const uniqueResults = allResults.filter((result, index, self) => {
        return index === self.findIndex(r => 
          calculateSimilarity(r.title, result.title) > 0.9 &&
          calculateSimilarity(r.artist, result.artist) > 0.9
        )
      })
      
      console.log('🔄 After deduplication:', uniqueResults.length)
      
      // Sort by relevance and prioritize results with artwork
      const sortedResults = uniqueResults
        .map(result => ({
          ...result,
          relevanceScore: calculateRelevanceScore(result, searchArtist.trim(), searchAlbum.trim())
        }))
        .sort((a, b) => {
          // Prioritize results with artwork
          if (a.artworkUrl && !b.artworkUrl) return -1
          if (!a.artworkUrl && b.artworkUrl) return 1
          // Then by relevance
          return (b.relevanceScore || 0) - (a.relevanceScore || 0)
        })
      
      console.log('🎯 Top 5 results:', sortedResults.slice(0, 5).map(r => ({
        title: r.title,
        artist: r.artist,
        source: r.source,
        hasArtwork: !!r.artworkUrl,
        score: r.relevanceScore?.toFixed(2)
      })))
      
      setSearchResults(sortedResults.slice(0, 5))
      
    } catch (error: any) {
      console.error('❌ Search failed:', error?.message || error)
      setSearchError(`Search timed out after 15 seconds.

Possible causes:
• Slow network connection
• API services not responding
• Firewall blocking requests

Please try again or use Manual Entry.`)
    } finally {
      setIsSearching(false)
    }
  }
  
  const handleSelectResult = async (result: SearchResult) => {
    console.log('🎯 handleSelectResult called with:', {
      title: result.title,
      artist: result.artist,
      source: result.source,
      artworkUrl: result.artworkUrl
    })
    
    console.log('🔍 URL Analysis:', {
      hasThumb: result.artworkUrl?.includes('/image/thumb/'),
      has3000x3000: result.artworkUrl?.includes('3000x3000'),
      fullURL: result.artworkUrl
    })
    
    // Clear search results immediately
    setSearchResults([])
    
    // SIMPLE APPROACH: Use the artwork URL directly from search result
    // No complex blob conversion or multiple fetches
    
    console.log('✅ Setting label data with artwork:', result.artworkUrl)
    
    setLabelData({
      title: result.title,
      artist: result.artist,
      year: result.year,
      artworkUrl: result.artworkUrl || null
    })
    
    console.log('✅ Label data updated')
  }
  
  const handleClearSearch = () => {
    setSearchArtist('')
    setSearchAlbum('')
    setSearchError(null)
    setSearchResults([])
    setLabelData({
      title: '',
      artist: '',
      year: '',
      artworkUrl: null,
    })
  }

  const handleArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('📁 File selected:', file)
    
    if (!file) {
      console.log('⚠️ No file selected')
      return
    }
    
    console.log('📏 File size:', file.size, 'bytes', '(' + (file.size / 1024 / 1024).toFixed(2) + ' MB)')
    
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ File too large:', file.size)
      alert('File size must be 5MB or less')
      return
    }
    
    console.log('🔄 Starting file read...')
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      console.log('✅ File loaded as data URL, length:', dataUrl?.length)
      console.log('🖼️ Data URL preview:', dataUrl?.substring(0, 100) + '...')
      
      setLabelData(prev => ({
        ...prev,
        artworkUrl: dataUrl
      }))
      
      console.log('✅ Label data updated with uploaded artwork')
    }
    
    reader.onerror = (error) => {
      console.error('❌ File read error:', error)
      alert('Failed to read file. Please try again.')
    }
    
    reader.readAsDataURL(file)
  }

  const handleExport = async () => {
    try {
      if (!previewCanvasRef.current) {
        alert('No preview available to export');
        return;
      }

      // Create export canvas at 300 DPI
      const exportCanvas = createExportCanvas(DPI.PRINT)
      const exportRenderer = new LabelRenderer(exportCanvas, DPI.PRINT)

      // Export options: NEVER show trim/safe zone, ALWAYS show crop marks
      const exportOptions: any = {
        ...renderOptions,
        dpi: DPI.PRINT,
        labelTheme,
        artworkPosition,
        fontStyle,
        showTrimLine: false,   // NEVER show red trim line in export
        showSafeZone: false,   // NEVER show green safe zone in export
        showCropMarks: true,   // ALWAYS show crop marks in export
      }
      
      await exportRenderer.render(labelData, exportOptions)
      
      console.log(`Export: ${selectedTemplate.name}`)
      console.log(`Export Canvas at 300 DPI: ${exportCanvas.width} × ${exportCanvas.height}px`)
      
      // Get template dimensions in mm (with bleed)
      const widthMM = selectedTemplate.widthMM + (selectedTemplate.bleedMM * 2);
      const heightMM = selectedTemplate.heightMM + (selectedTemplate.bleedMM * 2);
      
      // Create PDF with exact dimensions
      const orientation = heightMM > widthMM ? 'portrait' : 'landscape';
      
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: [widthMM, heightMM], // Exact size with bleed
        compress: true
      });
      
      // Get canvas as image data
      const imgData = exportCanvas.toDataURL('image/png', 1.0);
      
      // Add image to PDF at exact size (fills entire page)
      pdf.addImage(
        imgData,
        'PNG',
        0, // x position
        0, // y position
        widthMM, // width in mm
        heightMM, // height in mm
        undefined,
        'FAST' // compression
      );
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const title = labelData.title || 'label';
      const artist = labelData.artist || 'unknown';
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
      const sanitizedArtist = artist.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
      
      const filename = `${sanitizedArtist}-${sanitizedTitle}-${selectedTemplate.id}-${timestamp}.pdf`;
      
      // Download PDF
      pdf.save(filename);
      
      console.log('✅ PDF exported:', filename);
      console.log('📐 Dimensions:', widthMM, 'mm ×', heightMM, 'mm');
      
      // Track export event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'export_label', {
          event_category: 'engagement',
          event_label: selectedTemplate.name,
          format: 'pdf',
          has_artwork: !!labelData.artworkUrl,
        });
      }
      
    } catch (error: any) {
      console.error('❌ Export failed:', error);
      alert(`Failed to export PDF: ${error.message}. Please try again.`);
    }
  }

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      alert('Please enter your feedback message')
      return
    }
    
    const feedback = {
      type: feedbackType,
      message: feedbackText.trim(),
      email: feedbackEmail.trim(),
      version: '0.3.6',
      userAgent: navigator.userAgent
    }
    
    try {
      console.log('📤 Submitting feedback to Discord...', { type: feedbackType, length: feedbackText.length })
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback)
      })
      
      console.log('Response status:', response.status)
      
      const result = await response.json()
      console.log('Response data:', result)
      
      if (!response.ok) {
        console.error('❌ Submission failed:', result)
        alert(`Failed to submit feedback: ${result.error || 'Unknown error'}. Please try again.`)
        return
      }
      
      // Track feedback submission
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'submit_feedback', {
          event_category: 'engagement',
          event_label: feedbackType,
        });
      }
      
      // Success
      console.log('✅ Feedback sent to Discord successfully!')
      setFeedbackSubmitted(true)
      
    } catch (error: any) {
      console.error('❌ Network error:', error)
      alert(`Could not submit feedback: ${error.message}. Please try again later.`)
    }
  }

  const templatesByCategory = TEMPLATE_CATEGORIES.map(category => ({
    category,
    templates: Object.values(TEMPLATES).filter(t => t.category === category)
  }))

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${
      uiTheme === 'light' 
        ? 'bg-gray-100' // 15% gray background
        : 'bg-[#0a0a0a]'
    }`}>
      {/* Top Header */}
      <header className={`border-b px-6 py-4 transition-colors ${
        uiTheme === 'light'
          ? 'bg-white border-gray-200'
          : 'bg-[#1a1a1a] border-[#2a2a2a]'
      }`}>
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <h1 className={`font-bold text-lg tracking-wide ${uiTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              MINIDISC COVER DESIGNER
            </h1>
            <span className="text-yellow-500 text-sm font-mono">//</span>
            <span className={`text-sm font-mono ${uiTheme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
              v0.3.7e
            </span>
            
            {/* Feedback Button */}
            <button
              onClick={() => setShowFeedbackForm(true)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all border ${
                uiTheme === 'light'
                  ? 'bg-yellow-200 hover:bg-yellow-300 text-gray-800 border-yellow-300'
                  : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/30'
              }`}
            >
              💬 Give Feedback
            </button>
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            {/* Ko-fi Button - Red Heart */}
            <a
              href="https://ko-fi.com/S6S51TQPUR"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-[#72a4f2] hover:bg-[#5a8fd9] text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                {/* Coffee cup - White */}
                <path 
                  d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm6.173 3.989c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" 
                  fill="currentColor"
                />
                {/* Heart - Red */}
                <path 
                  d="M12.819 12.459c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311z" 
                  fill="#ff5e5b"
                />
              </svg>
              Support on Ko-fi
            </a>
            
            {/* Export Button */}
            <button 
              onClick={handleExport}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              EXPORT PDF
            </button>
          </div>
        </div>
      </header>

      {/* Tab System - Smaller, Dynamic Template Name */}
      <div className={`border-b transition-colors ${
        uiTheme === 'light'
          ? 'bg-gray-100 border-gray-200'
          : 'bg-[#0f0f0f] border-[#2a2a2a]'
      }`}>
        <div className="bg-yellow-400 text-black font-bold text-sm uppercase tracking-wide px-6 py-2.5 inline-block">
          {selectedTemplate.displayName}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row pb-[480px]">
        
        {/* Left Sidebar - Controls */}
        <div className={`w-full lg:w-80 border-r p-6 overflow-y-auto transition-colors ${
          uiTheme === 'light'
            ? 'bg-gray-50 border-gray-300 shadow-xl' // Keep at 5% for contrast
            : 'bg-[#0f0f0f] border-[#2a2a2a]'
        }`}>
          <div className="space-y-6">
            {/* Search Section - Stays at Top */}
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                uiTheme === 'light' ? 'text-gray-600' : 'text-gray-500'
              }`}>
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Search className="w-3 h-3 text-blue-400" />
                </div>
                ALBUM SEARCH
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={searchArtist}
                  onChange={(e) => setSearchArtist(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Radiohead"
                  disabled={isSearching}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-medium ${
                    uiTheme === 'light'
                      ? 'bg-gray-200 border-gray-400 text-gray-900 placeholder-gray-600 hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20' // 20% gray inputs
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-600 hover:border-[#3a3a3a] focus:border-blue-500'
                  }`}
                />
                <input
                  type="text"
                  value={searchAlbum}
                  onChange={(e) => setSearchAlbum(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., OK Computer"
                  disabled={isSearching}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-medium ${
                    uiTheme === 'light'
                      ? 'bg-gray-200 border-gray-400 text-gray-900 placeholder-gray-600 hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20' // 20% gray inputs
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-600 hover:border-[#3a3a3a] focus:border-blue-500'
                  }`}
                />
                <button
                  onClick={handleSearch}
                  disabled={!searchArtist.trim() || !searchAlbum.trim() || isSearching}
                  className={`w-full px-4 py-2.5 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed ${
                    uiTheme === 'light'
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 shadow-lg shadow-blue-500/30'
                      : 'bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  {isSearching ? 'SEARCHING...' : 'SEARCH'}
                </button>
                
                {/* DIAGNOSTIC: Test APIs - HIDDEN FOR PRODUCTION */}
                {false && <button
                  onClick={async () => {
                    console.log('🧪 ========================================')
                    console.log('🧪 TESTING ALL THREE APIs...')
                    console.log('🧪 ========================================\n')
                    
                    // Test MusicBrainz with direct fetch
                    console.log('1️⃣  Testing MusicBrainz...')
                    try {
                      const mbStart = Date.now()
                      const mbResponse = await fetch(
                        'https://musicbrainz.org/ws/2/release-group/?query=artist:"Radiohead"%20AND%20release:"The%20Bends"&fmt=json&limit=3',
                        {
                          headers: { 'User-Agent': 'MDLabelMaker/1.0 (minidisc.squirclelabs.uk)' },
                          signal: AbortSignal.timeout(5000)
                        }
                      )
                      const mbTime = Date.now() - mbStart
                      const mbData = await mbResponse.json()
                      const mbCount = mbData['release-groups']?.length || 0
                      console.log(`✅ MusicBrainz: ${mbTime}ms - ${mbCount} results`)
                      if (mbCount > 0) {
                        console.log('   Sample:', mbData['release-groups'][0].title)
                      }
                    } catch (error: any) {
                      console.error(`❌ MusicBrainz FAILED:`, error.message)
                    }
                    
                    // Test Deezer with direct fetch
                    console.log('\n2️⃣  Testing Deezer...')
                    try {
                      const deezerStart = Date.now()
                      const deezerResponse = await fetch(
                        'https://api.deezer.com/search/album?q=Radiohead%20The%20Bends&limit=3',
                        { signal: AbortSignal.timeout(5000) }
                      )
                      const deezerTime = Date.now() - deezerStart
                      const deezerData = await deezerResponse.json()
                      const deezerCount = deezerData.data?.length || 0
                      console.log(`✅ Deezer: ${deezerTime}ms - ${deezerCount} results`)
                      if (deezerCount > 0) {
                        console.log('   Sample:', deezerData.data[0].title)
                        console.log('   Artwork:', deezerData.data[0].cover_xl)
                      }
                    } catch (error: any) {
                      console.error(`❌ Deezer FAILED:`, error.message)
                    }
                    
                    // Test iTunes with direct fetch
                    console.log('\n3️⃣  Testing iTunes...')
                    try {
                      const itunesStart = Date.now()
                      const itunesResponse = await fetch(
                        'https://itunes.apple.com/search?term=Radiohead%20The%20Bends&entity=album&limit=3',
                        { signal: AbortSignal.timeout(5000) }
                      )
                      const itunesTime = Date.now() - itunesStart
                      const itunesData = await itunesResponse.json()
                      const itunesCount = itunesData.results?.length || 0
                      console.log(`✅ iTunes: ${itunesTime}ms - ${itunesCount} results`)
                      if (itunesCount > 0) {
                        console.log('   Sample:', itunesData.results[0].collectionName)
                        console.log('   Artwork:', itunesData.results[0].artworkUrl100?.replace('100x100bb', '3000x3000bb'))
                      }
                    } catch (error: any) {
                      console.error(`❌ iTunes FAILED:`, error.message)
                    }
                    
                    console.log('\n🏁 API Test Complete - Check results above')
                    console.log('🧪 ========================================\n')
                  }}
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    uiTheme === 'light'
                      ? 'bg-purple-100 hover:bg-purple-200 border-purple-400 text-purple-800'
                      : 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/50 text-purple-300'
                  }`}
                >
                  <span>🔧</span> Test APIs (Check Console)
                </button>}
              </div>
              {searchError && (
                <div className="mt-2 text-xs text-red-400 bg-red-900/20 border border-red-900/50 rounded p-2 whitespace-pre-line">
                  {searchError}
                </div>
              )}
            </div>
              
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className={`border rounded-lg p-3 transition-colors ${
                uiTheme === 'light'
                  ? 'bg-gray-100 border-gray-400'
                  : 'bg-[#1a1a1a] border-blue-500/30'
              }`}>
                <p className={`text-xs font-bold uppercase mb-2 ${
                  uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
                }`}>RESULTS ({searchResults.length})</p>
                <div className="space-y-1">
                  {searchResults.map(result => {
                    const isExactMatch = result.title.toLowerCase() === searchAlbum.trim().toLowerCase()
                    return (
                      <label 
                        key={result.id} 
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          uiTheme === 'light'
                            ? 'hover:bg-gray-200'
                            : 'hover:bg-[#2a2a2a]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="release-selection"
                          value={result.id}
                          onChange={() => handleSelectResult(result)}
                          className="accent-blue-500"
                        />
                        
                        {/* Artwork or placeholder */}
                        {result.thumbnailUrl ? (
                          <img 
                            src={result.thumbnailUrl} 
                            alt={result.title}
                            className="w-12 h-12 object-cover rounded shadow-md" 
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded flex items-center justify-center ${
                            uiTheme === 'light' ? 'bg-gray-300' : 'bg-[#2a2a2a]'
                          }`}>
                            <ImageIcon className={`w-5 h-5 ${
                              uiTheme === 'light' ? 'text-gray-500' : 'text-gray-600'
                            }`} />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold truncate ${
                              uiTheme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>{result.title}</span>
                            
                            {/* Source badge with quality indicator */}
                            {result.source === 'itunes' && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full whitespace-nowrap font-semibold">
                                🎵 3000×3000
                              </span>
                            )}
                            {result.source === 'spotify' && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full whitespace-nowrap font-semibold">
                                🎧 640×640
                              </span>
                            )}
                            {result.source === 'deezer' && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full whitespace-nowrap font-semibold">
                                🎶 1000×1000
                              </span>
                            )}
                            {result.source === 'discogs' && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-pink-500/20 text-pink-400 rounded-full whitespace-nowrap font-semibold">
                                💿 600×600
                              </span>
                            )}
                            {result.source === 'lastfm' && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded-full whitespace-nowrap font-semibold">
                                📻 300×300
                              </span>
                            )}
                            
                            {result.relevanceScore && result.relevanceScore < 0.9 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full whitespace-nowrap">
                                ~{Math.round(result.relevanceScore * 100)}%
                              </span>
                            )}
                          </div>
                          <div className={`text-xs truncate ${
                            uiTheme === 'light' ? 'text-gray-600' : 'text-gray-500'
                          }`}>{result.artist}</div>
                          
                          {/* DEBUG: Show artwork status */}
                          <div className="text-[10px] mt-1">
                            {result.artworkUrl ? (
                              <span className={uiTheme === 'light' ? 'text-green-600 font-semibold' : 'text-green-500 font-semibold'}>✓ Artwork Available</span>
                            ) : (
                              <span className={uiTheme === 'light' ? 'text-red-600 font-semibold' : 'text-red-500 font-semibold'}>✗ No Artwork URL</span>
                            )}
                          </div>
                          <div className={`text-[9px] truncate mt-0.5 ${
                            uiTheme === 'light' ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {result.artworkUrl ? `URL: ${result.artworkUrl.substring(0, 40)}...` : 'No URL'}
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {result.year && (
                              <>
                                <span className={`text-xs ${
                                  uiTheme === 'light' ? 'text-gray-600' : 'text-gray-600'
                                }`}>{result.year}</span>
                                <span className={uiTheme === 'light' ? 'text-gray-500' : 'text-gray-700'}>•</span>
                              </>
                            )}
                            <span className={`
                              px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                              ${uiTheme === 'light'
                                ? result.source === 'itunes'
                                  ? 'bg-gray-200 text-gray-700'
                                  : result.source === 'deezer'
                                  ? 'bg-pink-200 text-pink-700'
                                  : 'bg-blue-200 text-blue-700'
                                : result.source === 'itunes' 
                                  ? 'bg-gray-500/20 text-gray-300'
                                  : result.source === 'deezer' 
                                  ? 'bg-pink-500/20 text-pink-400' 
                                  : 'bg-blue-500/20 text-blue-400'
                              }
                            `}>
                              {result.source === 'itunes' ? 'iTunes' : result.source === 'deezer' ? 'Deezer' : 'MB'}
                            </span>
                            {isExactMatch && (
                              <>
                                <span className={uiTheme === 'light' ? 'text-gray-500' : 'text-gray-700'}>•</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  uiTheme === 'light'
                                    ? 'bg-green-200 text-green-700'
                                    : 'bg-green-500/20 text-green-400'
                                }`}>
                                  Match
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Label Format Section - Moved Up */}
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${
                uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
              }`}>
                <Layout className="w-4 h-4" />
                LABEL FORMAT
              </label>
              <div className="relative mb-2">
                <select
                  id="format"
                  value={selectedTemplate.id}
                  onChange={(e) => {
                    const template = Object.values(TEMPLATES).find(t => t.id === e.target.value)
                    if (template) {
                      setSelectedTemplate(template)
                      // Track template selection
                      if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'select_template', {
                          event_category: 'engagement',
                          event_label: template.id,
                        });
                      }
                    }
                  }}
                  className={`w-full border rounded-lg px-4 py-2.5 pr-10 text-sm font-medium appearance-none cursor-pointer transition-all outline-none ${
                    uiTheme === 'light'
                      ? 'bg-gray-200 border-gray-400 text-gray-900 hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20' // 20% gray selects
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-white hover:border-[#3a3a3a] focus:border-blue-500'
                  }`}
                >
                  {templatesByCategory.map(({ category, templates }) => (
                    <optgroup key={category} label={category}>
                      {templates.map(template => {
                        // Only Cassette Inserts and Album Inserts are coming soon
                        const isCassette = category === 'Cassette Inserts';
                        const isAlbum = category === 'Album Inserts';
                        const isComingSoon = isCassette || isAlbum;
                        return (
                          <option 
                            key={template.id} 
                            value={template.id}
                            disabled={isComingSoon}
                            style={isComingSoon ? { color: '#999' } : {}}
                          >
                            {template.name}{isComingSoon ? ' (Coming Soon)' : ''}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-mono">{selectedTemplate.widthMM}×{selectedTemplate.heightMM}MM</p>
            </div>

            {/* Manual Entry */}
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
              }`}>
                <Edit className="w-4 h-4" />
                MANUAL ENTRY
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${
                    uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
                  }`}>Album Title</label>
                  <input
                    type="text"
                    value={labelData.title}
                    onChange={(e) => setLabelData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Album Title"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-medium ${
                    uiTheme === 'light'
                      ? 'bg-gray-200 border-gray-400 text-gray-900 placeholder-gray-600 hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20' // 20% gray inputs
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-600 hover:border-[#3a3a3a] focus:border-blue-500'
                  }`}
                  />
                </div>
                
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${
                    uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
                  }`}>Artist</label>
                  <input
                    type="text"
                    value={labelData.artist}
                    onChange={(e) => setLabelData(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="Artist"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-medium ${
                    uiTheme === 'light'
                      ? 'bg-gray-200 border-gray-400 text-gray-900 placeholder-gray-600 hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20' // 20% gray inputs
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-600 hover:border-[#3a3a3a] focus:border-blue-500'
                  }`}
                  />
                </div>
                
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${
                    uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
                  }`}>Year</label>
                  <input
                    type="text"
                    value={labelData.year}
                    onChange={(e) => setLabelData(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="Year"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-medium ${
                    uiTheme === 'light'
                      ? 'bg-gray-200 border-gray-400 text-gray-900 placeholder-gray-600 hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20' // 20% gray inputs
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-600 hover:border-[#3a3a3a] focus:border-blue-500'
                  }`}
                  />
                </div>
                
                {/* Font Family - Mobile/Sidebar Only */}
                <div className="pt-2 lg:hidden">
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-2 ${
                    uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    <Type className="w-3 h-3" />
                    Font Family
                  </label>
                  <div className="relative">
                    <select
                      id="font"
                      value={selectedFont}
                      onChange={(e) => handleFontChange(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2.5 pr-10 text-sm font-medium appearance-none cursor-pointer transition-all outline-none ${
                    uiTheme === 'light'
                      ? 'bg-gray-200 border-gray-400 text-gray-900 hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20' // 20% gray selects
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-white hover:border-[#3a3a3a] focus:border-blue-500'
                  }`}
                      style={{ fontFamily: selectedFont }}
                    >
                      {FONT_OPTIONS.map(font => (
                        <option 
                          key={font.name} 
                          value={font.name}
                          style={{ fontFamily: font.name }}
                        >
                          {font.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Artwork Upload */}
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                uiTheme === 'light' ? 'text-gray-600' : 'text-gray-500'
              }`}>ARTWORK</h3>
              <label className={`block w-full border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer transition-all group ${
                uiTheme === 'light'
                  ? 'bg-gray-100 border-gray-400 hover:border-blue-500 hover:bg-blue-50'
                  : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-blue-500/50'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleArtworkUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    uiTheme === 'light'
                      ? 'bg-blue-100 group-hover:bg-blue-200'
                      : 'bg-blue-500/10 group-hover:bg-blue-500/20'
                  }`}>
                    <Upload className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className={`text-xs font-semibold ${
                    uiTheme === 'light' ? 'text-gray-900' : 'text-gray-400'
                  }`}>UPLOAD IMAGE</p>
                  <p className={`text-xs ${
                    uiTheme === 'light' ? 'text-gray-600' : 'text-gray-600'
                  }`}>Max 5MB</p>
                </div>
              </label>
            </div>

            {/* Artwork Position Controls - Mobile/Sidebar Only */}
            {labelData.artworkUrl && (
              <div className="lg:hidden">
                <label className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                  uiTheme === 'light' ? 'text-gray-600' : 'text-gray-500'
                }`}>
                  <Move className="w-3 h-3" />
                  ARTWORK POSITION
                </label>
                
                <div className={`space-y-3 rounded-lg p-4 ${
                  uiTheme === 'light' ? 'bg-white border border-gray-300' : 'bg-[#1a1a1a]'
                }`}>
                  {/* Scale Control */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${uiTheme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Scale</span>
                      <span className="text-xs text-blue-400 font-mono">{artworkPosition.scale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.01"
                      value={artworkPosition.scale}
                      onChange={(e) => setArtworkPosition(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                        uiTheme === 'light' ? 'bg-gray-300' : 'bg-[#2a2a2a]'
                      }`}
                    />
                  </div>
                  
                  {/* Horizontal Position - Now in mm */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${uiTheme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Horizontal</span>
                      <span className="text-xs text-blue-400 font-mono">{artworkPosition.x > 0 ? '+' : ''}{artworkPosition.x}mm</span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.5"
                      value={artworkPosition.x}
                      onChange={(e) => setArtworkPosition(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                        uiTheme === 'light' ? 'bg-gray-300' : 'bg-[#2a2a2a]'
                      }`}
                    />
                  </div>
                  
                  {/* Vertical Position - Now in mm */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${uiTheme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Vertical</span>
                      <span className="text-xs text-blue-400 font-mono">{artworkPosition.y > 0 ? '+' : ''}{artworkPosition.y}mm</span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.5"
                      value={artworkPosition.y}
                      onChange={(e) => setArtworkPosition(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                        uiTheme === 'light' ? 'bg-gray-300' : 'bg-[#2a2a2a]'
                      }`}
                    />
                  </div>
                  
                  {/* Reset Button */}
                  <button
                    onClick={() => setArtworkPosition({ x: 0, y: 0, scale: 1.12 })}
                    className={`w-full px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      uiTheme === 'light'
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-400'
                        : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] hover:text-white'
                    }`}
                  >
                    Reset Position
                  </button>
                </div>
              </div>
            )}

            {/* Display Options - Mobile/Sidebar Only */}
            <div className="lg:hidden">
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
              }`}>
                <Eye className="w-3 h-3" />
                DISPLAY OPTIONS
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={renderOptions.showTrimLine}
                    onChange={(e) => setRenderOptions(prev => ({ ...prev, showTrimLine: e.target.checked }))}
                    className={`w-4 h-4 rounded cursor-pointer appearance-none transition-all duration-200 ${
                      uiTheme === 'light'
                        ? 'border-2 border-gray-400 bg-gray-200 checked:bg-blue-600 checked:border-blue-600'
                        : 'border-2 border-white/20 bg-[#2d2d44] checked:bg-blue-500 checked:border-blue-500'
                    }`}
                  />
                  <span className={`text-sm ${uiTheme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>Trim line</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={renderOptions.showSafeZone}
                    onChange={(e) => setRenderOptions(prev => ({ ...prev, showSafeZone: e.target.checked }))}
                    className={`w-4 h-4 rounded cursor-pointer appearance-none transition-all duration-200 ${
                      uiTheme === 'light'
                        ? 'border-2 border-gray-400 bg-gray-200 checked:bg-blue-600 checked:border-blue-600'
                        : 'border-2 border-white/20 bg-[#2d2d44] checked:bg-blue-500 checked:border-blue-500'
                    }`}
                  />
                  <span className={`text-sm ${uiTheme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>Safe zone (green)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={renderOptions.showCropMarks}
                    onChange={(e) => setRenderOptions(prev => ({ ...prev, showCropMarks: e.target.checked }))}
                    className={`w-4 h-4 rounded cursor-pointer appearance-none transition-all duration-200 ${
                      uiTheme === 'light'
                        ? 'border-2 border-gray-400 bg-gray-200 checked:bg-blue-600 checked:border-blue-600'
                        : 'border-2 border-white/20 bg-[#2d2d44] checked:bg-blue-500 checked:border-blue-500'
                    }`}
                  />
                  <span className="text-sm text-gray-400">Crop marks</span>
                </label>
              </div>
            </div>

            {/* Interface Theme Options */}
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                uiTheme === 'light' ? 'text-gray-600' : 'text-gray-500'
              }`}>
                <Sun className="w-3 h-3" />
                INTERFACE THEME
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setUiTheme('dark')}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    uiTheme === 'dark'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg'
                      : uiTheme === 'light'
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-400'
                        : 'bg-[#2d2d44] text-gray-400 hover:text-white'
                  }`}
                >
                  DARK MODE
                </button>
                <button
                  onClick={() => setUiTheme('light')}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    uiTheme === 'light'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                      : 'bg-[#2d2d44] text-gray-400 hover:text-white'
                  }`}
                >
                  LIGHT MODE
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className={`relative rounded-lg p-4 overflow-hidden border transition-colors ${
              uiTheme === 'light'
                ? 'bg-blue-50 border-blue-300'
                : 'bg-[#1a1a1a] border-blue-500/20'
            }`}>
              <div className="relative">
                <div className={`font-bold text-sm ${uiTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  MiniDisc Cover Designer
                </div>
                <div className={`text-xs mt-1 ${uiTheme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                  by Joltt
                </div>
                <div className={`text-xs mt-2 ${uiTheme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
                  Version 0.3.7e • High-res images & zoom
                </div>
                
                {/* Ko-fi Button - Red Heart */}
                <div className={`mt-4 pt-4 border-t ${uiTheme === 'light' ? 'border-blue-200' : 'border-blue-500/20'}`}>
                  <a
                    href="https://ko-fi.com/S6S51TQPUR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2.5 bg-[#72a4f2] hover:bg-[#5a8fd9] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      {/* Coffee cup - White */}
                      <path 
                        d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm6.173 3.989c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" 
                        fill="currentColor"
                      />
                      {/* Heart - Red */}
                      <path 
                        d="M12.819 12.459c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311z" 
                        fill="#ff5e5b"
                      />
                    </svg>
                    Support on Ko-fi
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Preview Area */}
        <div className={`flex-1 flex flex-col items-center justify-start pt-8 pb-12 px-12 transition-colors ${
          uiTheme === 'light' ? 'bg-gray-100' : 'bg-[#0a0a0a]'
        }`}>
          
          {/* DESKTOP ONLY: Controls Panel Above Preview */}
          <div className="hidden lg:block w-full max-w-5xl mb-4">
            <div className={`rounded-2xl p-6 border transition-colors ${
              uiTheme === 'light' 
                ? 'bg-gray-50 border-gray-300' 
                : 'bg-[#1a1a1a] border-[#2a2a2a]'
            }`}>
              <div className="grid grid-cols-3 gap-8">
                
                {/* Column 1: Font Family */}
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-2 ${
                    uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    <Type className="w-4 h-4" />
                    Font Family
                  </label>
                  <div className="relative">
                    <select
                      value={selectedFont}
                      onChange={(e) => handleFontChange(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 pr-8 text-sm font-medium appearance-none cursor-pointer transition-all outline-none ${
                        uiTheme === 'light'
                          ? 'bg-gray-200 border-gray-400 text-gray-900 hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-[#1a1a1a] border-[#2a2a2a] text-white hover:border-[#3a3a3a] focus:border-blue-500'
                      }`}
                      style={{ fontFamily: selectedFont }}
                    >
                      {FONT_OPTIONS.map(font => (
                        <option 
                          key={font.name} 
                          value={font.name}
                          style={{ fontFamily: font.name }}
                        >
                          {font.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Font Style Options */}
                  <div className="mt-3">
                    <label className={`text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-2 ${
                      uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      <Palette className="w-4 h-4" />
                      Font Style
                    </label>
                    <div className="flex gap-1.5">
                      {/* Bold Toggle */}
                      <button
                        onClick={() => setFontStyle(prev => ({ ...prev, bold: !prev.bold }))}
                        className={`flex-1 px-3 py-2 rounded-lg font-bold text-base transition-all ${
                          fontStyle.bold
                            ? 'bg-blue-600 text-white shadow-md'
                            : uiTheme === 'light'
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
                        }`}
                        title="Bold"
                      >
                        B
                      </button>
                      
                      {/* Italic Toggle */}
                      <button
                        onClick={() => setFontStyle(prev => ({ ...prev, italic: !prev.italic }))}
                        className={`flex-1 px-3 py-2 rounded-lg italic text-base transition-all ${
                          fontStyle.italic
                            ? 'bg-blue-600 text-white shadow-md'
                            : uiTheme === 'light'
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
                        }`}
                        title="Italic"
                      >
                        I
                      </button>
                      
                      {/* Title Case Toggle */}
                      <button
                        onClick={() => setFontStyle(prev => ({ ...prev, titleCase: !prev.titleCase }))}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          fontStyle.titleCase
                            ? 'bg-blue-600 text-white shadow-md'
                            : uiTheme === 'light'
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
                        }`}
                        title="Title Case (First Letter Caps)"
                      >
                        Aa
                      </button>
                    </div>
                  </div>
                  
                  {/* Zoom Controls */}
                  <div className="mt-3">
                    <label className={`text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-2 ${
                      uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      <ZoomIn className="w-4 h-4" />
                      Preview Zoom
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewZoom(1.0)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          previewZoom === 1.0
                            ? uiTheme === 'light'
                              ? 'bg-gray-800 text-white'
                              : 'bg-gray-800 text-white'
                            : uiTheme === 'light'
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
                        }`}
                      >
                        100%
                      </button>
                      <button
                        onClick={() => setPreviewZoom(3.0)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          previewZoom === 3.0
                            ? 'bg-blue-600 text-white'
                            : uiTheme === 'light'
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
                        }`}
                      >
                        300%
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Column 2: Display Options */}
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-2 ${
                    uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    <Eye className="w-4 h-4" />
                    Display Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={renderOptions.showTrimLine}
                        onChange={(e) => setRenderOptions(prev => ({ ...prev, showTrimLine: e.target.checked }))}
                        className={`w-4 h-4 rounded cursor-pointer appearance-none transition-all duration-200 ${
                          uiTheme === 'light'
                            ? 'border-2 border-gray-400 bg-gray-200 checked:bg-blue-600 checked:border-blue-600'
                            : 'border-2 border-white/20 bg-[#2d2d44] checked:bg-blue-500 checked:border-blue-500'
                        }`}
                      />
                      <span className={uiTheme === 'light' ? 'text-gray-700' : 'text-gray-400'}>Trim line</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={renderOptions.showSafeZone}
                        onChange={(e) => setRenderOptions(prev => ({ ...prev, showSafeZone: e.target.checked }))}
                        className={`w-4 h-4 rounded cursor-pointer appearance-none transition-all duration-200 ${
                          uiTheme === 'light'
                            ? 'border-2 border-gray-400 bg-gray-200 checked:bg-blue-600 checked:border-blue-600'
                            : 'border-2 border-white/20 bg-[#2d2d44] checked:bg-blue-500 checked:border-blue-500'
                        }`}
                      />
                      <span className={uiTheme === 'light' ? 'text-gray-700' : 'text-gray-400'}>Safe zone (green)</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={renderOptions.showCropMarks}
                        onChange={(e) => setRenderOptions(prev => ({ ...prev, showCropMarks: e.target.checked }))}
                        className={`w-4 h-4 rounded cursor-pointer appearance-none transition-all duration-200 ${
                          uiTheme === 'light'
                            ? 'border-2 border-gray-400 bg-gray-200 checked:bg-blue-600 checked:border-blue-600'
                            : 'border-2 border-white/20 bg-[#2d2d44] checked:bg-blue-500 checked:border-blue-500'
                        }`}
                      />
                      <span className={uiTheme === 'light' ? 'text-gray-700' : 'text-gray-400'}>Crop marks</span>
                    </label>
                  </div>
                </div>
                
                {/* Column 3: Artwork Position */}
                {labelData.artworkUrl && (
                  <div>
                    <label className={`text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-2 ${
                      uiTheme === 'light' ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      <Move className="w-4 h-4" />
                      Artwork Position
                    </label>
                    <div className="space-y-3">
                      {/* Scale */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={uiTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Scale</span>
                          <span className={`font-mono ${uiTheme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                            {artworkPosition.scale.toFixed(2)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.01"
                          value={artworkPosition.scale}
                          onChange={(e) => setArtworkPosition(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                            uiTheme === 'light' ? 'bg-gray-300' : 'bg-[#2a2a2a]'
                          }`}
                        />
                      </div>
                      {/* Horizontal - Now in mm from center (0,0) */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={uiTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Horizontal</span>
                          <span className={`font-mono ${uiTheme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                            {artworkPosition.x > 0 ? '+' : ''}{artworkPosition.x}mm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-10"
                          max="10"
                          step="0.5"
                          value={artworkPosition.x}
                          onChange={(e) => setArtworkPosition(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                            uiTheme === 'light' ? 'bg-gray-300' : 'bg-[#2a2a2a]'
                          }`}
                        />
                      </div>
                      {/* Vertical - Now in mm from center (0,0) */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={uiTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Vertical</span>
                          <span className={`font-mono ${uiTheme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                            {artworkPosition.y > 0 ? '+' : ''}{artworkPosition.y}mm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-10"
                          max="10"
                          step="0.5"
                          value={artworkPosition.y}
                          onChange={(e) => setArtworkPosition(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                            uiTheme === 'light' ? 'bg-gray-300' : 'bg-[#2a2a2a]'
                          }`}
                        />
                      </div>
                      {/* Reset Button */}
                      <button
                        onClick={() => setArtworkPosition({ x: 0, y: 0, scale: 1.12 })}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          uiTheme === 'light'
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-400'
                            : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] hover:text-white'
                        }`}
                      >
                        Reset Position
                      </button>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
          
          {/* DEBUG STATUS PANEL - HIDDEN FOR PRODUCTION */}
          {false && <div className="mb-4 p-3 bg-black/50 border border-purple-500/30 rounded-lg text-xs font-mono">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold ${
                uiTheme === 'light' ? 'text-purple-600' : 'text-purple-400'
              }`}>DEBUG STATUS:</span>
              {labelData.artworkUrl ? (
                <span className={`font-bold ${
                  uiTheme === 'light' ? 'text-green-600' : 'text-green-400'
                }`}>✓ Artwork Loaded</span>
              ) : (
                <span className={`font-bold ${
                  uiTheme === 'light' ? 'text-red-600' : 'text-red-400'
                }`}>✗ No Artwork</span>
              )}
            </div>
            <div className={`text-[10px] ${
              uiTheme === 'light' ? 'text-gray-600' : 'text-gray-500'
            }`}>
              Title: {labelData.title || '(empty)'}
            </div>
            <div className={`text-[10px] ${
              uiTheme === 'light' ? 'text-gray-600' : 'text-gray-500'
            }`}>
              Artist: {labelData.artist || '(empty)'}
            </div>
            <div className={`text-[10px] break-all ${
              uiTheme === 'light' ? 'text-gray-600' : 'text-gray-500'
            }`}>
              Artwork URL: {labelData.artworkUrl ?? '(null)'}
            </div>
          </div>}
          
          {/* Canvas with dimension label and corner handles */}
          <div className="relative">
            <p className={`text-xs font-mono mb-4 text-center uppercase tracking-wider ${
              uiTheme === 'light' ? 'text-gray-700' : 'text-gray-600'
            }`}>
              {selectedTemplate.widthMM} × {selectedTemplate.heightMM} MM / 300DPI
            </p>
            
            <div className={`relative p-8 rounded-xl border transition-colors ${
              uiTheme === 'light'
                ? 'bg-white border-gray-300 shadow-inner'
                : 'bg-[#2a2a3a]/60 border-white/10'
            }`}>
              {/* Corner handles */}
              <div className={`absolute top-0 left-0 w-3 h-3 ${uiTheme === 'light' ? 'bg-blue-600' : 'bg-blue-500'}`} />
              <div className={`absolute top-0 right-0 w-3 h-3 ${uiTheme === 'light' ? 'bg-blue-600' : 'bg-blue-500'}`} />
              <div className={`absolute bottom-0 left-0 w-3 h-3 ${uiTheme === 'light' ? 'bg-blue-600' : 'bg-blue-500'}`} />
              <div className={`absolute bottom-0 right-0 w-3 h-3 ${uiTheme === 'light' ? 'bg-blue-600' : 'bg-blue-500'}`} />
              
              <canvas
                ref={previewCanvasRef}
                style={{
                  transform: `scale(${previewZoom * (DPI.SCREEN / DPI.PRINT)})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease',
                  // CRITICAL: Force crisp rendering (no blur on scale)
                  // @ts-ignore - Use crisp-edges for pixel-perfect scaling
                  imageRendering: 'crisp-edges',
                  // @ts-ignore - Webkit-specific high quality
                  WebkitImageRendering: 'crisp-edges',
                  // @ts-ignore - CSS property
                  WebkitFontSmoothing: 'antialiased',
                  // @ts-ignore - CSS property
                  MozOsxFontSmoothing: 'grayscale',
                  // @ts-ignore - CSS property
                  fontSmooth: 'always',
                } as React.CSSProperties}
                aria-label="Label preview canvas"
              />
            </div>
          </div>
          
        </div>
      </div>

      {/* Bottom Panel */}
      <div className={`fixed bottom-0 left-0 right-0 border-t z-50 transition-colors ${
        uiTheme === 'light'
          ? 'bg-white border-gray-200'
          : 'bg-[#0f0f0f] border-[#2a2a2a]'
      }`}>
        
        {/* Tab Icons */}
        <div className={`flex justify-center gap-12 py-4 border-b ${
          uiTheme === 'light' ? 'border-gray-200' : 'border-[#1a1a1a]'
        }`}>
          <button className="flex flex-col items-center gap-2 text-blue-500 relative">
            <Type className="w-6 h-6" />
            <span className="text-xs font-bold tracking-wider">TEXT</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-blue-500" />
          </button>
          <button 
            disabled
            className="relative group flex flex-col items-center gap-2 px-4 py-3 rounded-lg cursor-not-allowed opacity-50"
            title="Coming Soon"
          >
            <Music className="w-6 h-6 text-gray-500" />
            <span className="text-xs font-bold tracking-wider text-gray-500">TRACKS</span>
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap z-10">
              Feature Coming Soon
            </div>
          </button>
          <button 
            disabled
            className="relative group flex flex-col items-center gap-2 px-4 py-3 rounded-lg cursor-not-allowed opacity-50"
            title="Coming Soon"
          >
            <ImageIcon className="w-6 h-6 text-gray-500" />
            <span className="text-xs font-bold tracking-wider text-gray-500">ASSETS</span>
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap z-10">
              Feature Coming Soon
            </div>
          </button>
          <button 
            disabled
            className="relative group flex flex-col items-center gap-2 px-4 py-3 rounded-lg cursor-not-allowed opacity-50"
            title="Coming Soon"
          >
            <Palette className="w-6 h-6 text-gray-500" />
            <span className="text-xs font-bold tracking-wider text-gray-500">THEME</span>
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap z-10">
              Feature Coming Soon
            </div>
          </button>
        </div>
        
        {/* Content Panel */}
        <div className="p-6 max-h-[300px] overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Bottom panel content reserved for future features */}
          </div>
        </div>
        
      </div>
      
      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            uiTheme === 'light' ? 'bg-white' : 'bg-[#1a1a1a]'
          }`}>
            
            {/* Header */}
            <div className={`border-b px-6 py-4 flex items-center justify-between sticky top-0 ${
              uiTheme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-[#2a2a2a]'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${uiTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  Share Your Feedback
                </h2>
                <p className={`text-sm mt-1 ${uiTheme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Help improve MiniDisc Cover Designer
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFeedbackForm(false);
                  setFeedbackSubmitted(false);
                  setFeedbackText('');
                  setFeedbackEmail('');
                  setFeedbackType('feature');
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  uiTheme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-[#2a2a2a]'
                }`}
              >
                <X className={`w-5 h-5 ${uiTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
              </button>
            </div>
            
            {/* Content */}
            <div className="px-6 py-6">
              
              {feedbackSubmitted ? (
                // Success Message
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${uiTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    Thank You!
                  </h3>
                  <p className={`mb-2 ${uiTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    Your feedback has been received. It helps make this tool better for everyone.
                  </p>
                  <p className={`text-sm ${uiTheme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
                    I'll review it soon and may reach out if you provided an email.
                  </p>
                  <button
                    onClick={() => {
                      setShowFeedbackForm(false);
                      setFeedbackSubmitted(false);
                      setFeedbackText('');
                      setFeedbackEmail('');
                      setFeedbackType('feature');
                    }}
                    className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : (
                // Feedback Form
                <>
                  {/* Beta Notice */}
                  <div className={`border rounded-lg p-4 mb-6 ${
                    uiTheme === 'light' ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    <p className={`text-sm leading-relaxed mb-3 ${uiTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                      This yet-to-be named MiniDisc Cover Designer is in its Beta Release, and is in active development. Bugs should be expected and the site may run a little slow at times. Your feedback directly influences what gets fixed and what features get added.
                    </p>
                    <p className={`text-sm leading-relaxed ${uiTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                      Please keep your comments respectful and focused on constructive improvements. We value a positive and inclusive community where everyone feels welcome to contribute their ideas.
                    </p>
                  </div>
                  
                  {/* Feedback Type */}
                  <div className="mb-6">
                    <label className={`text-sm font-semibold mb-3 block ${
                      uiTheme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      What kind of feedback?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFeedbackType('feature')}
                        className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all border-2 ${
                          feedbackType === 'feature'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : uiTheme === 'light'
                              ? 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
                              : 'bg-[#2a2a2a] border-[#3a3a3a] text-gray-300 hover:border-[#4a4a4a]'
                        }`}
                      >
                        💡 Feature Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackType('bug')}
                        className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all border-2 ${
                          feedbackType === 'bug'
                            ? 'bg-red-50 border-red-500 text-red-700'
                            : uiTheme === 'light'
                              ? 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
                              : 'bg-[#2a2a2a] border-[#3a3a3a] text-gray-300 hover:border-[#4a4a4a]'
                        }`}
                      >
                        🐛 Bug Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackType('other')}
                        className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all border-2 ${
                          feedbackType === 'other'
                            ? 'bg-purple-50 border-purple-500 text-purple-700'
                            : uiTheme === 'light'
                              ? 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
                              : 'bg-[#2a2a2a] border-[#3a3a3a] text-gray-300 hover:border-[#4a4a4a]'
                        }`}
                      >
                        💬 Other
                      </button>
                    </div>
                  </div>
                  
                  {/* Feedback Text */}
                  <div className="mb-6">
                    <label className={`text-sm font-semibold mb-2 block ${
                      uiTheme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {feedbackType === 'feature' && 'What feature would you like to see?'}
                      {feedbackType === 'bug' && 'Describe the bug you encountered'}
                      {feedbackType === 'other' && 'Share your thoughts'}
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={
                        feedbackType === 'feature'
                          ? 'Example: I\'d love to be able to export multiple labels at once...'
                          : feedbackType === 'bug'
                          ? 'Example: When I click the export button with Safari, nothing happens...'
                          : 'Any suggestions, questions, or comments are welcome!'
                      }
                      rows={6}
                      className={`w-full border rounded-lg px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none ${
                        uiTheme === 'light'
                          ? 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                          : 'bg-[#2a2a2a] border-[#3a3a3a] text-white focus:border-blue-500'
                      }`}
                    />
                  </div>
                  
                  {/* Email (Optional) */}
                  <div className="mb-6">
                    <label className={`text-sm font-semibold mb-2 block ${
                      uiTheme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      Email (optional - for follow-up)
                    </label>
                    <input
                      type="email"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className={`w-full border rounded-lg px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 outline-none ${
                        uiTheme === 'light'
                          ? 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                          : 'bg-[#2a2a2a] border-[#3a3a3a] text-white focus:border-blue-500'
                      }`}
                    />
                    <p className={`text-xs mt-1.5 ${uiTheme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Only used if I need clarification or want to notify you when the feature is built
                    </p>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackText.trim()}
                    className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-md disabled:shadow-none"
                  >
                    Submit Feedback
                  </button>
                </>
              )}
              
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
