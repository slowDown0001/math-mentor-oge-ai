
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BookOpen, Video } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

// Define topics and chapters
const mathTopics = [
  {
    id: "algebra",
    title: "Алгебра",
    chapters: [
      { id: "1.1", title: "Арифметика и свойства чисел", videoId: "dGyQ9sgZmxk" },
      { id: "1.2", title: "Выражения и преобразования", videoId: "m3qgoftljsI" },
      { id: "1.3", title: "Уравнения и неравенства", videoId: "wYM5Fk9zvtE" },
      { id: "1.4", title: "Функции и графики", videoId: "ID8li13rH0I" },
      { id: "1.5", title: "Текстовые задачи", videoId: "GBgH7bKdkbc" },
      { id: "1.6", title: "Последовательности и прогрессии", videoId: "eKuTXAGJLKQ" },
      { id: "1.7", title: "Элементы статистики и вероятности", videoId: "7sKzL2Ij7zo" }
    ]
  },
  {
    id: "arithmetic",
    title: "Арифметика",
    chapters: [
      { id: "2.1", title: "Числа и вычисления", videoId: "JfwBXJVkNXw" },
      { id: "2.2", title: "Дроби и проценты", videoId: "m3qgoftljsI" },
      { id: "2.3", title: "Пропорции и отношения", videoId: "wYM5Fk9zvtE" },
      { id: "2.4", title: "Рациональные числа", videoId: "ID8li13rH0I" },
      { id: "2.5", title: "Степени и корни", videoId: "GBgH7bKdkbc" }
    ]
  },
  {
    id: "geometry",
    title: "Геометрия",
    chapters: [
      { id: "3.1", title: "Планиметрия", videoId: "eKuTXAGJLKQ" },
      { id: "3.2", title: "Треугольники и их свойства", videoId: "dGyQ9sgZmxk" },
      { id: "3.3", title: "Четырехугольники", videoId: "7sKzL2Ij7zo" },
      { id: "3.4", title: "Окружности и круги", videoId: "JfwBXJVkNXw" },
      { id: "3.5", title: "Площади фигур", videoId: "m3qgoftljsI" },
      { id: "3.6", title: "Подобие треугольников", videoId: "wYM5Fk9zvtE" },
      { id: "3.7", title: "Векторы", videoId: "ID8li13rH0I" }
    ]
  },
  {
    id: "practical",
    title: "Практическая математика",
    chapters: [
      { id: "4.1", title: "Реальная математика", videoId: "GBgH7bKdkbc" },
      { id: "4.2", title: "Практические задачи", videoId: "eKuTXAGJLKQ" },
      { id: "4.3", title: "Задачи на движение", videoId: "dGyQ9sgZmxk" },
      { id: "4.4", title: "Задачи на работу", videoId: "7sKzL2Ij7zo" },
      { id: "4.5", title: "Экономические задачи", videoId: "JfwBXJVkNXw" }
    ]
  }
];

// Video content with real YouTube videos
const getVideoContent = (id: string, title: string, videoId: string) => {
  return (
    <div className="mt-2 space-y-3">
      <h4 className="text-lg font-medium text-gray-900">{title}</h4>
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe 
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="text-sm text-gray-600">
        <p>Продолжительность: 12-15 минут</p>
        <p>Уровень: ОГЭ</p>
      </div>
    </div>
  );
};

// Mock textbook content
const getTextbookContent = (id: string, title: string) => {
  return (
    <div className="mt-2">
      <h4 className="text-lg font-medium text-gray-900">{title}</h4>
      <p className="text-gray-600 mt-2">
        Этот раздел содержит подробные материалы по теме "{title}". 
        Вы найдете теоретические объяснения, примеры задач и решения.
      </p>
      <div className="mt-3">
        <Button className="bg-primary hover:bg-primary/90">
          Открыть учебник
        </Button>
      </div>
    </div>
  );
};

const Resources = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <div className="bg-gradient-to-b from-primary/10 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 font-heading">Ресурсы для подготовки к ОГЭ</h1>
            <p className="text-gray-700 max-w-3xl mb-8">
              На этой странице вы найдете все необходимые материалы для подготовки к ОГЭ по математике. 
              Используйте учебные материалы и видеоуроки для изучения различных тем.
            </p>
            
            <Tabs defaultValue="textbook" className="w-full">
              <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
                <TabsTrigger value="textbook" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Электронный учебник
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-2">
                  <Video className="w-4 h-4" /> Видеоуроки
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="textbook" className="border rounded-lg p-6 bg-white shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Электронный учебник</h2>
                <p className="text-gray-700 mb-6">
                  Наш электронный учебник предоставляет полное теоретическое объяснение всех тем, 
                  включенных в программу ОГЭ по математике, с примерами и практическими заданиями.
                </p>
                
                <div className="space-y-6">
                  {mathTopics.map((topic) => (
                    <Accordion type="single" collapsible key={topic.id}>
                      <AccordionItem value={topic.id} className="border-b border-gray-200">
                        <AccordionTrigger className="text-lg font-medium hover:text-primary py-4">
                          {topic.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-4 space-y-4">
                            {topic.chapters.map((chapter) => (
                              <Accordion type="single" collapsible key={chapter.id}>
                                <AccordionItem value={chapter.id} className="border-b border-gray-100">
                                  <AccordionTrigger className="text-base hover:text-primary">
                                    {chapter.id}. {chapter.title}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    {getTextbookContent(chapter.id, chapter.title)}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="videos" className="border rounded-lg p-6 bg-white shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Видеоуроки</h2>
                <p className="text-gray-700 mb-6">
                  Наши видеоуроки представляют собой наглядные объяснения ключевых концепций, 
                  которые помогут вам лучше понять материал и подготовиться к экзамену.
                </p>
                
                <div className="space-y-6">
                  {mathTopics.map((topic) => (
                    <Accordion type="single" collapsible key={topic.id}>
                      <AccordionItem value={topic.id} className="border-b border-gray-200">
                        <AccordionTrigger className="text-lg font-medium hover:text-primary py-4">
                          {topic.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-4 space-y-4">
                            {topic.chapters.map((chapter) => (
                              <Accordion type="single" collapsible key={chapter.id}>
                                <AccordionItem value={chapter.id} className="border-b border-gray-100">
                                  <AccordionTrigger className="text-base hover:text-primary">
                                    {chapter.id}. {chapter.title}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    {getVideoContent(chapter.id, chapter.title, chapter.videoId)}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
