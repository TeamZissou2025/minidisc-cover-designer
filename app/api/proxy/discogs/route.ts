import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  // ========== LOGGING: Request Info ==========
  console.log('🔍 Discogs API Request:', {
    query,
    timestamp: new Date().toISOString()
  });
  
  if (!query) {
    console.error('❌ No query provided');
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }
  
  // ========== LOGGING: Environment Variables ==========
  const DISCOGS_KEY = process.env.NEXT_PUBLIC_DISCOGS_KEY;
  const DISCOGS_SECRET = process.env.DISCOGS_SECRET;
  
  console.log('🔑 Discogs Credentials Check:', {
    keyExists: !!DISCOGS_KEY,
    keyLength: DISCOGS_KEY?.length || 0,
    keyPreview: DISCOGS_KEY ? `${DISCOGS_KEY.substring(0, 8)}...` : 'MISSING',
    secretExists: !!DISCOGS_SECRET,
    secretLength: DISCOGS_SECRET?.length || 0
  });
  
  if (!DISCOGS_KEY) {
    console.error('❌ NEXT_PUBLIC_DISCOGS_KEY not configured');
    return NextResponse.json({ error: 'Discogs API not configured' }, { status: 500 });
  }
  
  // ========== BUILD URL ==========
  // Discogs API: Use key & secret in URL params (NOT in Authorization header)
  const discogsUrl = new URL('https://api.discogs.com/database/search');
  discogsUrl.searchParams.set('q', query);
  discogsUrl.searchParams.set('type', 'release');
  discogsUrl.searchParams.set('key', DISCOGS_KEY);
  if (DISCOGS_SECRET) {
    discogsUrl.searchParams.set('secret', DISCOGS_SECRET);
  }
  
  console.log('📡 Discogs URL:', {
    endpoint: 'https://api.discogs.com/database/search',
    params: {
      q: query,
      type: 'release',
      key: `${DISCOGS_KEY.substring(0, 8)}...`,
      secret: DISCOGS_SECRET ? '[REDACTED]' : 'not_provided'
    }
  });
  
  try {
    console.log('⏳ Fetching from Discogs...');
    
    const response = await fetch(discogsUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MiniDiscCoverDesigner/0.3.7e +https://minidisc.squirclelabs.uk',
      },
    });
    
    // ========== LOGGING: Response Status ==========
    console.log('📡 Discogs Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: {
        'content-type': response.headers.get('content-type'),
        'x-discogs-ratelimit': response.headers.get('x-discogs-ratelimit'),
        'x-discogs-ratelimit-remaining': response.headers.get('x-discogs-ratelimit-remaining')
      }
    });
    
    if (!response.ok) {
      // Get error body
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { raw: errorText };
      }
      
      console.error('❌ Discogs API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorJson
      });
      
      return NextResponse.json({ 
        error: `Discogs API error: ${response.status}`,
        details: errorJson,
        message: response.statusText
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // ========== LOGGING: Success ==========
    console.log('✅ Discogs Success:', {
      resultsCount: data.results?.length || 0,
      pagination: data.pagination
    });
    
    if (data.results && data.results.length > 0) {
      console.log('📀 First result sample:', {
        title: data.results[0].title,
        year: data.results[0].year,
        hasCoverImage: !!data.results[0].cover_image
      });
    }
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('❌ Discogs Proxy Exception:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      error: 'Discogs API request failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
