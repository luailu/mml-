import { NextResponse } from 'next/server';

// 使用 Agent 问答接口，而不是知识库问答接口
const YOUDAO_AGENT_STREAM_API_URL = 'https://openapi.youdao.com/q_anything/api/bot/chat_stream';

export async function POST(req: Request) {
  // 使用 "问答密钥"，这个密钥只能用于 Agent 相关接口
  const apiKey = process.env.QANYTHING_API_KEY;
  // 这里我们需要的是 Agent UUID，而不是知识库 ID
  const agentUuid = process.env.QANYTHING_AGENT_UUID;

  if (!apiKey || !agentUuid) {
    return NextResponse.json(
      {
        error: '关键环境变量缺失',
        details: '服务器未能读取到 QANYTHING_API_KEY 或 QANYTHING_AGENT_UUID。请执行以下步骤：\n1. 确认项目根目录的 .env.local 文件中已正确填写这两个值。\n2. 按 Ctrl+C 停止当前服务。\n3. 重新运行 npm run dev 来启动服务。',
      },
      { status: 500 }
    );
  }

  try {
    const { question, history = [] } = await req.json();
    if (!question) {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }
    
    console.log('发送请求到有道 Agent API...');
    console.log('请求参数:', { question, history });
    console.log('使用的API KEY (部分隐藏):', `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
    console.log('使用的Agent UUID:', agentUuid);

    // 按照 Agent 问答接口的要求构建请求体
    const requestBody = {
      uuid: agentUuid,        // Agent UUID
      question: question,     // 提问内容
      sourceNeeded: true,     // 是否返回信息来源
      history: history.length > 0 ? history : [] // 对话历史
    };

    console.log('请求体:', JSON.stringify(requestBody));

    // 发送请求到 Agent 问答接口
    const apiResponse = await fetch(YOUDAO_AGENT_STREAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey  // 使用问答密钥
      },
      body: JSON.stringify(requestBody),
    });

    console.log('有道API响应状态码:', apiResponse.status);
    console.log('有道API响应头:', Object.fromEntries(apiResponse.headers.entries()));

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('QAnything Agent Stream API Error:', errorText);
      
      // 尝试解析错误信息
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(
          { 
            error: `有道API返回错误: ${errorJson.msg || '未知错误'}`, 
            details: `错误代码: ${errorJson.errorCode}, 请求ID: ${errorJson.requestId}`,
            raw: errorJson
          },
          { status: apiResponse.status }
        );
      } catch (e) {
        // 如果无法解析为JSON，则返回原始错误文本
        return NextResponse.json(
          { error: `Failed to fetch from QAnything Agent Stream API: ${apiResponse.statusText}`, details: errorText },
          { status: apiResponse.status }
        );
      }
    }

    console.log('有道API响应成功，状态码:', apiResponse.status);
    console.log('Content-Type:', apiResponse.headers.get('Content-Type'));

    // 获取来自有道API的可读流
    const stream = apiResponse.body;
    if (!stream) {
      console.error('有道API返回了空流');
      return NextResponse.json(
        { error: 'QAnything API returned an empty stream' },
        { status: 500 }
      );
    }

    // 直接将流返回给客户端，不做任何处理
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { 
        error: 'An internal server error occurred in the API route.', 
        details: error.message || String(error) 
      },
      { status: 500 }
    );
  }
} 