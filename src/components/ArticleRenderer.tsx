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
                
                className="mx-auto rounded-lg shadow-sm"
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
