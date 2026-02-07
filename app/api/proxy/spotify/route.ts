import { NextResponse } from 'next/server';

// Spotify uses Client Credentials flow for app-only access
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getSpotifyToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    console.log('🎧 Using cached Spotify token');
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log('🔑 Spotify Credentials Check:', {
    clientIdExists: !!clientId,
    clientIdLength: clientId?.length || 0,
    clientIdPreview: clientId ? `${clientId.substring(0, 8)}...` : 'MISSING',
    clientSecretExists: !!clientSecret,
    clientSecretLength: clientSecret?.length || 0
  });

  if (!clientId || !clientSecret) {
    console.error('❌ Spotify credentials not configured');
    throw new Error('Spotify credentials not configured');
  }

  // Get new token
  console.log('⏳ Requesting new Spotify token...');
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  console.log('📡 Spotify Token Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      errorJson = { raw: errorText };
    }
    
    console.error('❌ Spotify Token Error:', {
      status: response.status,
      body: errorJson
    });
    
    throw new Error(`Failed to get Spotify token: ${response.status} - ${JSON.stringify(errorJson)}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

  console.log('✅ Spotify token obtained, expires in:', data.expires_in, 'seconds');

  if (!accessToken) {
    throw new Error('No access token received from Spotify');
  }

  return accessToken;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  console.log('🎧 Spotify API Request:', {
    query,
    timestamp: new Date().toISOString()
  });
  
  if (!query) {
    console.error('❌ No query provided');
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }
  
  try {
    const token = await getSpotifyToken();
    
    console.log('⏳ Fetching from Spotify API...');
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );
    
    console.log('📡 Spotify Search Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { raw: errorText };
      }
      
      console.error('❌ Spotify Search Error:', {
        status: response.status,
        body: errorJson
      });
      
      throw new Error(`Spotify API returned ${response.status}: ${JSON.stringify(errorJson)}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Spotify Success:', {
      albumCount: data.albums?.items?.length || 0,
      totalResults: data.albums?.total || 0
    });
    
    if (data.albums?.items?.[0]) {
      console.log('🎵 First result sample:', {
        name: data.albums.items[0].name,
        artist: data.albums.items[0].artists[0]?.name,
        imageCount: data.albums.items[0].images?.length
      });
    }
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('❌ Spotify Proxy Exception:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.substring(0, 200) : undefined
    });
    
    return NextResponse.json({ 
      error: 'Spotify API failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
