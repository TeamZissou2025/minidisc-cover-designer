import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }
  
  const API_KEY = '6d43fd481fed3e5946df5b87c6d2aa89';
  
  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=20`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MiniDiscCoverDesigner/1.0',
        },
      }
    );
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Last.fm proxy error:', error);
    return NextResponse.json({ error: 'Last.fm API failed' }, { status: 500 });
  }
}
