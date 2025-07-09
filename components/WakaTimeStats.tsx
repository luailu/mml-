'use client';

import { useState, useEffect } from 'react';

export default function WakaTimeStats() {
  const [totalTime, setTotalTime] = useState<string>("50.3小时");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 已移除原有API调用逻辑
    setIsLoading(false);
  }, []); // 空依赖数组确保该 effect 只在组件挂载时运行一次

  if (isLoading) {
    return <span>正在加载 WakaTime 数据...</span>;
  }

  if (error) {
    return <span className="text-red-500">错误: {error}</span>;
  }

  return <span>总编码时长: {totalTime || '暂无数据'}</span>;
}