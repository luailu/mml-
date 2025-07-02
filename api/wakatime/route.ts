import { NextResponse } from 'next/server';

export const revalidate = 3600; // 每小时重新验证一次 (3600秒)

export async function GET() {
  const apiKey = process.env.WAKATIME_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'WakaTime API key is not configured.' },
      { status: 500 }
    );
  }

  try {
    // 注意：WakaTime 的 API key 需要以 Base64 编码
    const authHeader = `Basic ${Buffer.from(apiKey).toString('base64')}`;
    
    const response = await fetch('https://wakatime.com/api/v1/users/current/all_time_since_today', {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WakaTime API Error:', errorText);
      return NextResponse.json(
        { error: `Failed to fetch from WakaTime API: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 我们只返回前端需要的数据，例如总编码时间的文本表示
    return NextResponse.json({ total_time_text: data.data.text });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
} 