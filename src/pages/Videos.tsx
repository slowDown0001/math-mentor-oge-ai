
import { useState } from "react";
import { Play, Clock, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

const Videos = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample video data - in a real app, this would come from YouTube API
  const videos = [
    {
      id: "1",
      title: "Основы алгебры - Линейные уравнения",
      description: "Изучаем решение линейных уравнений с одной переменной",
      duration: "12:34",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      category: "Алгебра",
      difficulty: "Базовый",
      videoId: "dQw4w9WgXcQ"
    },
    {
      id: "2",
      title: "Геометрия - Теорема Пифагора",
      description: "Понимание и применение теоремы Пифагора",
      duration: "15:22",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      category: "Геометрия",
      difficulty: "Средний",
      videoId: "dQw4w9WgXcQ"
    },
    {
      id: "3",
      title: "Функции - Квадратичные функции",
      description: "Изучаем свойства квадратичных функций и их графики",
      duration: "18:45",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      category: "Алгебра",
      difficulty: "Продвинутый",
      videoId: "dQw4w9WgXcQ"
    },
    {
      id: "4",
      title: "Вероятность - Основные понятия",
      description: "Введение в теорию вероятностей",
      duration: "10:15",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      category: "Статистика",
      difficulty: "Базовый",
      videoId: "dQw4w9WgXcQ"
    },
    {
      id: "5",
      title: "Математические концепции - Shorts",
      description: "Быстрое объяснение математических концепций",
      duration: "0:59",
      thumbnail: "https://img.youtube.com/vi/41jbWBks74A/maxresdefault.jpg",
      category: "Алгебра",
      difficulty: "Базовый",
      videoId: "41jbWBks74A",
      isShorts: true
    }
  ];

  const categories = ["Все", "Алгебра", "Геометрия", "Статистика"];
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Все" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Базовый": return "bg-green-100 text-green-800";
      case "Средний": return "bg-yellow-100 text-yellow-800";
      case "Продвинутый": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Видеоуроки по математике
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Изучайте математику с помощью наших видеоуроков от канала OnLock Learning. 
              Подготовка к ОГЭ стала проще и интереснее!
            </p>
          </div>

          {/* Video Player Section */}
          {selectedVideo && (
            <div className="mb-12">
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-6 h-6 text-red-600" />
                    {selectedVideo.title}
                  </CardTitle>
                  <CardDescription>
                    {selectedVideo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* YouTube Channel Embed */}
          <div className="mb-12">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-6 h-6 text-red-600" />
                  OnLock Learning - Официальный канал
                </CardTitle>
                <CardDescription>
                  Подписывайтесь на канал для получения новых видеоуроков
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/videoseries?list=UU8butISFwT-Wl7EV0hUK0BQ"
                    title="OnLock Learning Videos"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
                <div className="mt-4 text-center">
                  <Button asChild variant="outline">
                    <a 
                      href="https://www.youtube.com/@onlocklearning/videos" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Смотреть на YouTube
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Поиск видеоуроков..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card 
                key={video.id} 
                className="group hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleVideoClick(video)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-t-lg flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                    {video.isShorts && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        SHORTS
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
                        {video.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">{video.category}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {video.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Видео не найдены
              </h3>
              <p className="text-gray-600">
                Попробуйте изменить поисковый запрос или фильтры
              </p>
            </div>
          )}

          {/* Study Tips Section */}
          <div className="mt-16">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">💡 Советы по изучению</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
                  <div>
                    <strong>📝 Ведите конспекты:</strong> Записывайте ключевые моменты во время просмотра
                  </div>
                  <div>
                    <strong>⏸️ Делайте паузы:</strong> Останавливайте видео для обдумывания сложных моментов
                  </div>
                  <div>
                    <strong>🔄 Повторяйте:</strong> Просматривайте видео несколько раз для лучшего понимания
                  </div>
                  <div>
                    <strong>✏️ Решайте примеры:</strong> Практикуйте задачи параллельно с просмотром
                  </div>
                  <div>
                    <strong>❓ Задавайте вопросы:</strong> Используйте чат с Ёжиком для clarification
                  </div>
                  <div>
                    <strong>📅 Составьте план:</strong> Изучайте темы последовательно и систематично
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Videos;
