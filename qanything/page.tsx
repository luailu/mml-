'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';

// 定义消息源信息的接口
interface Source {
  fileId: string;
  fileName: string;
  content: string;
  score: string;
}

// 定义聊天消息的角色和内容
interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinkContent?: string; // 可选的思考过程内容
  sources?: Source[]; // 可选的消息源信息
}

/**
 * 处理API返回的消息内容，提取<response>标签中的内容
 */
function processApiResponse(text: string): string {
  // 如果包含<response>标签，则只显示<response>标签内的内容
  if (text.includes('<response>')) {
    const responseMatch = text.match(/<response>([\s\S]*?)<\/response>/);
    if (responseMatch && responseMatch[1]) {
      return responseMatch[1].trim();
    }
  }
  
  // 如果包含<think>标签但没有<response>标签，则过滤掉<think>标签内容
  if (text.includes('<think>')) {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  }
  
  // 如果没有任何标签，则返回原始文本
  return text;
}

/**
 * 加载动画组件
 */
function LoadingIndicator() {
  return (
    <div className="flex justify-center items-center py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}

/**
 * 消息源信息组件
 */
function SourceInfo({ sources }: { sources: Source[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!sources || sources.length === 0) return null;
  
  return (
    <div className="mt-2 text-xs">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="text-blue-600 hover:underline flex items-center"
      >
        <span>{isExpanded ? '隐藏来源' : '查看来源'}</span>
        <svg 
          className={`w-4 h-4 ml-1 transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {isExpanded && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md">
          {sources.map((source, index) => (
            <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
              <div className="font-semibold">文件: {source.fileName}</div>
              <div className="mt-1 text-gray-600 whitespace-pre-wrap">{source.content}</div>
              <div className="mt-1 text-gray-500">相关度: {parseFloat(source.score).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QAnythingPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: question };
    
    // 构建历史记录 (使用上一次的 messages 状态)
    const historyMessages = messages.reduce((acc: { question: string; response: string }[], msg, index) => {
      if (msg.role === 'user' && messages[index + 1]?.role === 'assistant') {
        acc.push({ question: msg.content, response: messages[index + 1].content });
      }
      return acc;
    }, []);

    // 添加用户消息和助手的空"占位"消息
    const assistantPlaceholder: Message = { role: 'assistant', content: '', thinkContent: '' };
    setMessages([...messages, userMessage, assistantPlaceholder]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/qanything', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          history: historyMessages.slice(-2),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('API request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith('data:')) {
            const jsonStr = line.substring(5).trim();
            if (jsonStr) {
              try {
                const parsed = JSON.parse(jsonStr);
                
                if (parsed.result?.response) {
                  fullResponseText += parsed.result.response;
                }
                
                const sources = parsed.result?.source;

                // --- 全新的、更健壮的解析逻辑 ---
                const thinkMatch = fullResponseText.match(/<think>([\s\S]*?)<\/think>/);
                const responseMatch = fullResponseText.match(/<response>([\s\S]*?)<\/response>/);

                const thinkContent = thinkMatch ? thinkMatch[1].trim() : '';
                let content = '';

                if (responseMatch) {
                  content = responseMatch[1].trim();
                } else {
                  content = fullResponseText.replace(/<think>[\s\S]*?<\/think>/, '').trim();
                }

                // --- 持续更新最后一条消息（占位符） ---
                setMessages(prevMessages => {
                  const newMessages = [...prevMessages];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = content;
                    lastMessage.thinkContent = thinkContent;
                    lastMessage.sources = sources;
                  }
                  return newMessages;
                });

              } catch (e) {
                console.error("无法解析收到的JSON:", jsonStr, e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = `抱歉，请求出错了：\n${error.message}`;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto px-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">芙莉莲问答</h1>
        <p className="text-slate-500">与葬送人芙莉莲聊天，探索她的世界与故事</p>
      </div>
      
      {/* 聊天消息区域 */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg shadow-inner">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-slate-500">
            <p>你好，我是芙莉莲。请问有什么我能帮助你的吗？</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg whitespace-pre-wrap shadow-sm ${
                    msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {/* 显示思考过程 */}
                  {msg.thinkContent && (
                    <div className="mb-2 p-2 bg-slate-200/50 text-slate-600 rounded-md text-sm">
                      <h4 className="font-semibold text-slate-700">思考过程...</h4>
                      <p>{msg.thinkContent}</p>
                    </div>
                  )}
                  
                  {/* 显示回答 */}
                  {msg.content}
                  
                  {/* 显示消息源信息 */}
                  {msg.role === 'assistant' && msg.sources && <SourceInfo sources={msg.sources} />}
                </div>
              </div>
            ))}
            {/* 加载动画现在只由 isLoading 控制，且当最后一条消息为空时显示 */}
            {isLoading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1].content && <LoadingIndicator />}
          </>
        )}
        {/* 空Div用于滚动定位 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="请输入你的问题..."
          disabled={isLoading}
          className="flex-1 p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? '思考中...' : '发送'}
        </button>
      </form>
    </div>
  );
} 