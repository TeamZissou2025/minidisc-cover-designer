import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }
  
  const DISCOGS_KEY = process.env.NEXT_PUBLIC_DISCOGS_KEY;
  
  if (!DISCOGS_KEY) {
    console.error('NEXT_PUBLIC_DISCOGS_KEY not configured');
    return NextResponse.json({ error: 'Discogs API not configured' }, { status: 500 });
  }
  
  try {
    const response = await fetch(
      `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&format=album&key=${DISCOGS_KEY}&secret=${process.env.DISCOGS_SECRET || ''}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MiniDiscCoverDesigner/0.3.7f +https://minidisc.squirclelabs.uk',
        },
      }
    );
    
    if (!response.ok) {
      console.error(`Discogs API error: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: 'Discogs API failed' }, { status: response.status });
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Discogs proxy error:', error);
    return NextResponse.json({ error: 'Discogs API request failed' }, { status: 500 });
  }
}
