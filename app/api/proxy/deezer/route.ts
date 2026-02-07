import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(
      `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=20`,
      {
        headers: {
          'Accept': 'application/json',
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
    console.error('Deezer proxy error:', error);
    return NextResponse.json({ error: 'Deezer API failed' }, { status: 500 });
  }
}
