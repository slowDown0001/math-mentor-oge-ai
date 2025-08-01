import React from 'react';
import MathRenderer from './MathRenderer';

interface Article {
  skill: number;
  art: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  [key: string]: any; // For future imgX columns
}

interface ArticleRendererProps {
  text: string;
  article: Article;
}

const ArticleRenderer: React.FC<ArticleRendererProps> = ({ text, article }) => {
  // Replace <imgX> tags with actual images
  const renderTextWithImages = (content: string) => {
    // Split content by <imgX> pattern
    const parts = content.split(/(<img\d+>)/g);
    
    return parts.map((part, index) => {
      // Check if this part is an image tag
      const imgMatch = part.match(/^<img(\d+)>$/);
      
      if (imgMatch) {
        const imgNumber = imgMatch[1];
        const imgKey = `img${imgNumber}`;
        const imgUrl = article[imgKey];
        
        if (imgUrl) {
          return (
            <div key={index} className="my-6">
              <img 
                src={imgUrl} 
                alt={`Иллюстрация ${imgNumber}`}
                className="w-full max-w-2xl mx-auto rounded-lg shadow-sm"
              />
            </div>
          );
        }
        // If no image URL found, don't render anything
        return null;
      }
      
      // Regular text content - render with MathRenderer
      if (part.trim()) {
        return (
          <div key={index}>
            <MathRenderer text={part} />
          </div>
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  return <div>{renderTextWithImages(text)}</div>;
};

export default ArticleRenderer;