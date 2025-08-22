import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const PromptBar = () => {
  const [userQuery, setUserQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isLoading) return;

    setIsLoading(true);
    setResponse("");

    try {
      console.log('🚀 Starting streaming request with:', userQuery);
      
      const response = await fetch('https://kbaazksvkvnafrwtmkcw.supabase.co/functions/v1/process-user-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYWF6a3N2a3ZuYWZyd3Rta2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NTg2NTAsImV4cCI6MjA2MjMzNDY1MH0.aSyfch6PX1fr9wyWSGpUPNzT6jjIdfu9eA3E3J4uqzs`,
        },
        body: JSON.stringify({ userQuery }),
      });

      console.log('📦 Proxy response:', { 
        status: response.status, 
        headers: Object.fromEntries(response.headers.entries()) 
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      if (response && response.body) {
        console.log('📺 Starting stream processing...');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let chunkCount = 0;

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('✅ Stream complete! Total chunks:', chunkCount);
              break;
            }

            chunkCount++;
            const chunk = decoder.decode(value, { stream: true });
            console.log(`📝 Chunk ${chunkCount}:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
            
            // Handle SSE format - extract data from lines starting with "data: "
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6); // Remove "data: " prefix
                if (data === '[DONE]') {
                  console.log('✅ Stream marked as done');
                  break;
                }
                if (data.trim()) {
                  setResponse(prev => prev + data);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        console.warn('⚠️ No response body available');
        setResponse('Получен пустой ответ от сервера');
      }
    } catch (error) {
      console.error('Error processing query:', error);
      setResponse('Произошла ошибка при обработке вашего запроса. Попробуйте позже.');
    } finally {
      setIsLoading(false);
      setUserQuery("");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4 border-2 border-primary rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500">
      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Задайте любой вопрос о платформе"
          className="flex-1 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={!userQuery.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Response box */}
      {(response || isLoading) && (
        <div className="rounded-xl border border-border bg-card p-4 min-h-[100px]">
          {isLoading && !response && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Обрабатываем ваш запрос...
            </div>
          )}
          {response && (
            <div className="text-card-foreground prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  )
                }}
              >
                {response}
              </ReactMarkdown>
              {isLoading && <span className="animate-pulse">|</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptBar;