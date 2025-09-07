import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ArticleRenderer from "@/components/ArticleRenderer";
import { useKaTeXInitializer } from "@/hooks/useMathJaxInitializer";
import "@/styles/style_for_textbook.css";

// A minimal Article shape for the renderer
type ArticleShape = {
  skill: number;
  art: string;
  [key: string]: any;
};

const BookTest: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>("");
  const [renderText, setRenderText] = useState<string>("");
  const [article, setArticle] = useState<ArticleShape>({ skill: 0, art: "" });
  
  // Initialize KaTeX for math rendering
  const isKaTeXReady = useKaTeXInitializer();

  // Basic SEO setup without extra deps
  useEffect(() => {
    const title = "Book Test – Preview Textbook Articles";
    document.title = title;

    const descContent =
      "Book Test page to preview textbook articles with math and images before publishing.";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", descContent);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);
  }, []);

  const handleRender = useCallback(() => {
    const input = rawInput.trim();

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(input);
      if (parsed && typeof parsed === "object") {
        const text = (parsed.art ?? parsed.text ?? "").toString();
        // Keep any provided imgX fields and others
        const nextArticle: ArticleShape = {
          skill: typeof parsed.skill === "number" ? parsed.skill : 0,
          art: text,
          ...parsed,
        };
        setArticle(nextArticle);
        setRenderText(text);
        return;
      }
    } catch (e) {
      // Not JSON – fall back to raw text mode
    }

    // Raw text mode
    setArticle({ skill: 0, art: input });
    setRenderText(input);
  }, [rawInput]);

  const examplePlaceholder = useMemo(
    () =>
      `Paste either raw article text or JSON with fields like:\n\n` +
      `{\n  "skill": 12,\n  "art": "Вступление к теме... <img1> ... !!квадратный корень!!",\n  "img1": "/path/to/image1.png"\n}`,
    []
  );

  return (
    <main className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Book Test: Preview Textbook Articles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Render pasted content exactly like in the textbook, with math and images.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {/* Left: Input */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Input</CardTitle>
            <Button onClick={handleRender}>RENDER</Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={examplePlaceholder}
              className="min-h-[360px]"
            />
          </CardContent>
        </Card>

        {/* Right: Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[420px] pr-4">
              {renderText ? (
                <div className="textbook-preview">
                  <ArticleRenderer text={renderText} article={article} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Paste your article on the left and click RENDER.
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default BookTest;

