import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, Zap } from "lucide-react";
import MathRenderer from "@/components/MathRenderer";
import NewTextbookReadButton from "@/components/NewTextbookReadButton";
import { mathJaxManager } from "@/hooks/useMathJaxInitializer";

interface Skill {
  id: number;
  title: string;
}

interface Article {
  id: number;
  article_text: string;
  image_recommendations?: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  img6?: string;
  img7?: string;
}

interface NewTextbookArticleProps {
  skill: Skill | null;
  article: Article | null;
  loading: boolean;
  isRead: boolean;
  onMarkAsRead: (skillId: number) => void;
}

const NewTextbookArticle = ({ 
  skill, 
  article, 
  loading, 
  isRead, 
  onMarkAsRead 
}: NewTextbookArticleProps) => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleGoToExercise = () => {
    if (skill) {
      navigate(`/mcq-practice?skill=${skill.id}`);
    }
  };

  // Render MathJax when article content changes
  useEffect(() => {
    if (contentRef.current && article?.article_text) {
      mathJaxManager.renderMath(contentRef.current);
    }
  }, [article]);

  const getImageUrls = (article: Article) => {
    const images: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const imgKey = `img${i}` as keyof Article;
      const imgUrl = article[imgKey];
      if (imgUrl && typeof imgUrl === 'string') {
        images.push(imgUrl);
      }
    }
    return images;
  };

  if (!skill) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Добро пожаловать в новый учебник!
            </h2>
            <p className="text-gray-600 max-w-md">
              Выберите навык из левого меню, чтобы начать изучение материала. 
              Каждая тема содержит теорию, примеры и интерактивные элементы.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!article) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Материал в разработке
            </h2>
            <p className="text-gray-600 max-w-md">
              Статья для навыка "{skill.title}" еще не готова. 
              Попробуйте выбрать другой навык из программы курса.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const images = getImageUrls(article);

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{skill.title}</h1>
              <div className="flex items-center gap-2">
                <span className="text-blue-100 text-sm">Навык #{skill.id}</span>
                {isRead && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Прочитано
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-sm text-blue-100">Интерактивное обучение</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="p-8">
          <div 
            ref={contentRef}
            className="textbook-preview prose max-w-none"
            dangerouslySetInnerHTML={{ __html: article.article_text }}
          />

          {/* Images Gallery */}
          {images.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Дополнительные материалы
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={imageUrl}
                      alt={`Материал ${index + 1} для ${skill.title}`}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleGoToExercise}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Перейти к упражнениям!
            </Button>

            <NewTextbookReadButton
              skillId={skill.id}
              isRead={isRead}
              onMarkAsRead={onMarkAsRead}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewTextbookArticle;