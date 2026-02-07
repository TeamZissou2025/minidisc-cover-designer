import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  
  if (!imageUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }
  
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'MiniDiscCoverDesigner/1.0 +https://minidisc.squirclelabs.uk'
      }
    });
    
    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }
    
    const imageBuffer = await response.arrayBuffer();
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
