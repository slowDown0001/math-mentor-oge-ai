
import { useState } from "react";
import { Upload, Send, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ChatMessages from "@/components/chat/ChatMessages";
import { type Message } from "@/contexts/ChatContext";

const Scanner = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setUploadedImage(imageUrl);
          
          // Add system message about uploaded image
          const imageMessage: Message = {
            id: Date.now(),
            text: "Изображение загружено! Теперь вы можете задать вопросы об этом изображении.",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, imageMessage]);
        };
        reader.readAsDataURL(file);
        
        toast({
          title: "Изображение загружено",
          description: "Теперь вы можете задать вопросы об изображении",
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, загрузите файл изображения",
          variant: "destructive",
        });
      }
    }
  };

  const handleSendMessage = async () => {
    if (userInput.trim() === "" || isProcessing) return;
    
    if (!uploadedImage) {
      toast({
        title: "Загрузите изображение",
        description: "Сначала загрузите изображение для анализа",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: userInput,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: `Я проанализировал ваше изображение и отвечу на ваш вопрос: "${userInput}". К сожалению, функция анализа изображений пока находится в разработке. Скоро здесь будет полноценный ИИ-анализ изображений!`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-6 h-6" />
                  Сканер изображений
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Загрузите изображение и задайте вопросы о его содержимом
                </p>
                
                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Нажмите для загрузки изображения
                    </p>
                    <p className="text-sm text-gray-500">
                      Поддерживаются форматы: JPG, PNG, GIF
                    </p>
                  </label>
                </div>

                {/* Uploaded Image Preview */}
                {uploadedImage && (
                  <div className="mb-4">
                    <img
                      src={uploadedImage}
                      alt="Загруженное изображение"
                      className="max-w-full h-auto max-h-64 mx-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card>
              <CardHeader>
                <CardTitle>Чат с ИИ</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto">
                  <ChatMessages messages={messages} isTyping={isProcessing} />
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Задайте вопрос об изображении..."
                      className="flex-1"
                      disabled={isProcessing || !uploadedImage}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!userInput.trim() || isProcessing || !uploadedImage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
