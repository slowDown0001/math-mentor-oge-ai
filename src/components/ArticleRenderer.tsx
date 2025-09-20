import React from 'react';
import MathRenderer from './MathRenderer';
import '../styles/style_for_textbook.css';

interface Article {
  skill: number;
  art: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  img6?: string;
  img7?: string;
  img8?: string;
  img9?: string;
  img10?: string;
  img11?: string;
  img12?: string;
  img13?: string;
  img14?: string;
  img15?: string;
  img16?: string;
  img17?: string;
  img18?: string;
  img19?: string;
  img20?: string;
  [key: string]: any; // For future imgX columns
}

interface ArticleRendererProps {
  text: string;
  article: Article;
}

const ArticleRenderer: React.FC<ArticleRendererProps> = ({ text, article }) => {
  // Handle HTML content with proper CSS classes and math rendering
  const renderHtmlWithImages = (content: string) => {
    // First, replace <imgX> tags with actual images
    let processedContent = content;
    
    // Replace image tags
    processedContent = processedContent.replace(/<img(\d+)>/g, (match, imgNumber) => {
      const imgKey = `img${imgNumber}`;
      const imgUrl = article[imgKey];
      
      if (imgUrl) {
        return `<div class="my-6"><img src="${imgUrl}" alt="Иллюстрация ${imgNumber}" class="mx-auto rounded-lg shadow-sm" /></div>`;
      }
      return '';
    });
    
    // Convert !!text!! to clickable links
    processedContent = processedContent.replace(/!!(.*?)!!/g, '<a href="#" style="color: #10b981; text-decoration: underline;" onclick="event.preventDefault(); window.open(\'https://www.google.com/search?q=\' + encodeURIComponent(\'$1\'), \'_blank\');">$1</a>');
    
    return (
      <div className="textbook-preview">
        <MathRenderer text={processedContent} compiler="mathjax" />
      </div>
    );
  };

  return renderHtmlWithImages(text);
};

export default ArticleRenderer;
