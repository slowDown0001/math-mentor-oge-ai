import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft, Video, Brain, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const TriangleSimilarityVideo = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);

  const videoId = "BN1gSuqmi3k";
  const videoUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&autoplay=1`;

  const handleGoToExercise = () => {
    navigate('/mcq-practice?skill=121');
  };

  const handleGoToBrainrot = () => {
    navigate('/triangle-similarity-brainrot');
  };

  const handleGoToArticle = () => {
    navigate('/triangle-similarity');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Video className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Признаки подобия треугольников
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Подробное видео-объяснение с примерами и разборами задач
            </p>
          </div>

          {/* Video Section */}
          <div className="mb-8">
            <Card className="overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm border-0">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    ref={videoRef}
                    src={videoUrl}
                    title="Признаки подобия треугольников"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Brainrot Version */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 hover:border-pink-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-pink-100 rounded-full w-fit mb-3 group-hover:bg-pink-200 transition-colors">
                  <Brain className="w-8 h-8 text-pink-600" />
                </div>
                <CardTitle className="text-pink-800">TikTok версия</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-pink-600 mb-4 text-sm">
                  Короткая и динамичная версия с мемами
                </p>
                <Button 
                  onClick={handleGoToBrainrot}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
                >
                  Brainrot версия 🧠
                </Button>
              </CardContent>
            </Card>

            {/* Article */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit mb-3 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">Теория</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-blue-600 mb-4 text-sm">
                  Подробная статья с формулами и примерами
                </p>
                <Button 
                  onClick={handleGoToArticle}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Читать статью 📖
                </Button>
              </CardContent>
            </Card>

            {/* Practice */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-green-100 rounded-full w-fit mb-3 group-hover:bg-green-200 transition-colors">
                  <Play className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Практика</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-green-600 mb-4 text-sm">
                  Решай задачи и закрепляй знания
                </p>
                <Button 
                  onClick={handleGoToExercise}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                >
                  Перейти к упражнениям! 🚀
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriangleSimilarityVideo;