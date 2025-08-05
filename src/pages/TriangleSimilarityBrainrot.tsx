import { useState, useRef } from "react";
import { Play, Pause, ArrowLeft, Zap, Video, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const TriangleSimilarityBrainrot = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLIFrameElement>(null);

  const videoId = "k5GYxe68Aks";
  const videoUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&autoplay=1`;

  const handleGoToExercise = () => {
    navigate('/mcq-practice?skill=121');
  };

  const handleGoToMainVideo = () => {
    navigate('/triangle-similarity-video');
  };

  const handleGoToArticle = () => {
    navigate('/triangle-similarity');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Brainrot Edition 🧠⚡
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Признаки подобия треугольников в TikTok формате
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium">
                #TriangleSimilarity
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                #Math
              </span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
                #ОГЭ2025
              </span>
            </div>
          </div>

          {/* Video Section - Vertical for TikTok style */}
          <div className="mb-8 flex justify-center">
            <Card className="overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm border-0 max-w-md">
              <CardContent className="p-0">
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '9/16', height: '600px' }}>
                  <iframe
                    ref={videoRef}
                    src={videoUrl}
                    title="Признаки подобия треугольников - Brainrot Edition"
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
            {/* Main Video */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 hover:border-blue-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit mb-3 group-hover:bg-blue-200 transition-colors">
                  <Video className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">Полное видео</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-blue-600 mb-4 text-sm">
                  Подробное объяснение с примерами
                </p>
                <Button 
                  onClick={handleGoToMainVideo}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                >
                  Основное видео 📹
                </Button>
              </CardContent>
            </Card>

            {/* Article */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-blue-50 border-green-200 hover:border-green-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-green-100 rounded-full w-fit mb-3 group-hover:bg-green-200 transition-colors">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Теория</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-green-600 mb-4 text-sm">
                  Подробная статья с формулами
                </p>
                <Button 
                  onClick={handleGoToArticle}
                  variant="outline"
                  className="w-full border-green-300 text-green-600 hover:bg-green-50"
                >
                  Читать статью 📖
                </Button>
              </CardContent>
            </Card>

            {/* Practice */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:border-orange-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-orange-100 rounded-full w-fit mb-3 group-hover:bg-orange-200 transition-colors">
                  <Play className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-orange-800">Практика</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-orange-600 mb-4 text-sm">
                  Решай задачи прямо сейчас!
                </p>
                <Button 
                  onClick={handleGoToExercise}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                >
                  Перейти к упражнениям! 🚀
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Fun Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-white/80 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-pink-500">⚡</div>
              <div className="text-sm text-gray-600">Быстро</div>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-500">🧠</div>
              <div className="text-sm text-gray-600">Понятно</div>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-indigo-500">📱</div>
              <div className="text-sm text-gray-600">Мобильно</div>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-500">🔥</div>
              <div className="text-sm text-gray-600">Топ</div>
            </div>
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

export default TriangleSimilarityBrainrot;