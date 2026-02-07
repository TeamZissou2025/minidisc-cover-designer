import { NextResponse } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  // Clean up old entries every hour
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return true;
  }
  
  if (limit.count >= 5) {
    return false; // Rate limited
  }
  
  limit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Get IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    console.log('📥 Feedback request from:', ip);
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      console.warn('⚠️ Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Too many requests. Please try again in an hour.' },
        { status: 429 }
      );
    }
    
    // Parse and validate body
    const body = await request.json();
    const { type, message, email, version, userAgent } = body;
    
    // Validate type
    if (!type || !['feature', 'bug', 'other'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      );
    }
    
    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message too short (minimum 10 characters)' },
        { status: 400 }
      );
    }
    
    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message too long (maximum 5000 characters)' },
        { status: 400 }
      );
    }
    
    // Validate email if provided
    if (email && typeof email === 'string' && email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      if (email.length > 200) {
        return NextResponse.json(
          { error: 'Email too long' },
          { status: 400 }
        );
      }
    }
    
    // Get webhook URL from environment variable
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('❌ Discord webhook URL not configured');
      return NextResponse.json(
        { error: 'Feedback system not configured' },
        { status: 500 }
      );
    }
    
    // Sanitize message (remove potential Discord mentions/exploits)
    const sanitizedMessage = message
      .replace(/@(everyone|here)/gi, '@\u200b$1') // Zero-width space to prevent mentions
      .substring(0, 2000); // Discord embed description limit
    
    // Sanitize email
    const sanitizedEmail = email ? String(email).substring(0, 200) : '';
    
    // Sanitize other fields
    const sanitizedVersion = version ? String(version).substring(0, 20) : 'Unknown';
    const sanitizedUserAgent = userAgent ? String(userAgent).substring(0, 100) : 'Unknown';
    
    // Determine embed color based on feedback type
    const colors = {
      feature: 0x0099ff, // Blue
      bug: 0xff0000,     // Red
      other: 0x9b59b6    // Purple
    };
    
    const color = colors[type as keyof typeof colors] || colors.other;
    
    // Emoji for each type
    const emoji = {
      feature: '💡',
      bug: '🐛',
      other: '💬'
    };
    
    // Create Discord embed
    const embed = {
      title: `${emoji[type as keyof typeof emoji]} ${type === 'feature' ? 'Feature Request' : type === 'bug' ? 'Bug Report' : 'General Feedback'}`,
      description: sanitizedMessage,
      color: color,
      fields: [
        {
          name: '📧 Contact Email',
          value: sanitizedEmail || '_Not provided_',
          inline: true
        },
        {
          name: '🏷️ Type',
          value: type.charAt(0).toUpperCase() + type.slice(1),
          inline: true
        },
        {
          name: '📦 Version',
          value: sanitizedVersion,
          inline: true
        },
        {
          name: '🌐 Browser',
          value: sanitizedUserAgent,
          inline: false
        },
        {
          name: '🔒 IP',
          value: ip.substring(0, 50),
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'MiniDisc Cover Designer Feedback'
      }
    };
    
    // Send to Discord with timeout
    console.log('📤 Sending feedback to Discord...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'Feedback Bot',
          embeds: [embed]
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (!discordResponse.ok) {
        const errorText = await discordResponse.text();
        console.error('❌ Discord API error:', discordResponse.status, errorText);
        return NextResponse.json(
          { error: 'Failed to send feedback to Discord' },
          { status: 500 }
        );
      }
      
      console.log('✅ Feedback sent to Discord successfully from IP:', ip);
      return NextResponse.json({ success: true });
      
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        console.error('❌ Discord request timeout');
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }
      throw error;
    }
    
  } catch (error: any) {
    console.error('❌ Feedback submission error:', error.message);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
