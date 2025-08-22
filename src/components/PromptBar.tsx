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
      const { data, error } = await supabase.functions.invoke('process-user-query', {
        body: { userQuery }
      });

      if (error) {
        throw error;
      }

      // Handle streaming response - Supabase returns Response object, not ReadableStream directly
      const response = data as Response;
      if (response && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            console.log('Received chunk:', chunk); // Debug log
            
            // Add small delay to make streaming visible
            await new Promise(resolve => setTimeout(resolve, 30));
            
            setResponse(prev => {
              const newResponse = prev + chunk;
              console.log('Updated response length:', newResponse.length); // Debug log
              return newResponse;
            });
          }
        } finally {
          reader.releaseLock();
        }
      } else if (typeof data === 'string') {
        console.log('Received non-stream data:', data); // Debug log
        setResponse(data);
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