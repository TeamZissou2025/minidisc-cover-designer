import { NextResponse } from 'next/server';

export async function GET() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  return NextResponse.json({
    configured: !!webhookUrl,
    webhookExists: !!webhookUrl,
    webhookLength: webhookUrl ? webhookUrl.length : 0,
    webhookPrefix: webhookUrl ? webhookUrl.substring(0, 40) + '...' : 'NOT_SET',
    allEnvVars: Object.keys(process.env).filter(key => key.includes('DISCORD'))
  });
}
