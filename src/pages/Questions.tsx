import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Play, Database, Activity, Hash } from "lucide-react";
import Header from "@/components/Header";

const Questions = () => {
  const questionTypes = [
    {
      title: "База ФИПИ",
      description: "Практика с вопросами из официальной базы ФИПИ",
      icon: Database,
      link: "/fipi-bank",
      color: "bg-red-50 hover:bg-red-100 border-red-200"
    },
    {
      title: "По теме",
      description: "Практика по конкретным темам и экзаменам",
      icon: ClipboardList,
      link: "/new-practice",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
    },
    {
      title: "Поток",
      description: "Непрерывная практика смешанных вопросов",
      icon: Play,
      link: "/practice-now",
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      title: "База",
      description: "Вопросы из базы данных",
      icon: Database,
      link: "/practice",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
    },
    {
      title: "По номеру вопроса",
      description: "Практика всех вопросов выбранного номера (1-25)",
      icon: Hash,
      link: "/practice-by-number",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
    },
    {
      title: "Диагностика",
      description: "Диагностический тест для определения уровня",
      icon: Activity,
      link: "/diagnostic",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Вопросы</h1>
            <p className="text-lg text-gray-600">Выберите тип практики для изучения математики</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questionTypes.map((type) => (
              <Link key={type.title} to={type.link}>
                <Card className={`h-full transition-all duration-200 ${type.color} hover:shadow-lg hover:scale-105`}>
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <type.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {type.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600">{type.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questions;