import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Users, MessageCircle } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  experience: number;
  specialization: string[];
  location: string;
  hourlyRate: number;
  studentsCount: number;
  description: string;
  availability: string;
}

const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "Анна Петрова",
    avatar: "/placeholder.svg",
    rating: 4.9,
    experience: 8,
    specialization: ["ОГЭ", "ЕГЭ", "Алгебра", "Геометрия"],
    location: "Москва",
    hourlyRate: 1500,
    studentsCount: 142,
    description: "Опытный преподаватель математики с большим опытом подготовки к экзаменам. Индивидуальный подход к каждому ученику.",
    availability: "Пн-Пт 14:00-20:00"
  },
  {
    id: "2",
    name: "Дмитрий Иванов",
    avatar: "/placeholder.svg",
    rating: 4.8,
    experience: 12,
    specialization: ["ЕГЭ", "Высшая математика", "Физика"],
    location: "Санкт-Петербург",
    hourlyRate: 2000,
    studentsCount: 89,
    description: "Кандидат физико-математических наук. Специализируюсь на подготовке к ЕГЭ по математике профильного уровня.",
    availability: "Вт-Сб 16:00-22:00"
  },
  {
    id: "3",
    name: "Елена Смирнова",
    avatar: "/placeholder.svg",
    rating: 4.7,
    experience: 6,
    specialization: ["ОГЭ", "Алгебра", "Геометрия"],
    location: "Екатеринбург",
    hourlyRate: 1200,
    studentsCount: 76,
    description: "Молодой и энергичный преподаватель. Использую современные методики обучения и интерактивные материалы.",
    availability: "Пн-Чт 15:00-19:00"
  }
];

export const TeacherTab = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  const handleSelectTeacher = (teacherId: string) => {
    setSelectedTeacher(teacherId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Выбор преподавателя</h2>
        <p className="text-gray-600">Найдите идеального преподавателя для индивидуальных занятий</p>
      </div>

      <div className="grid gap-6">
        {mockTeachers.map((teacher) => (
          <Card 
            key={teacher.id}
            className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
              selectedTeacher === teacher.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelectTeacher(teacher.id)}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={teacher.avatar} alt={teacher.name} />
                  <AvatarFallback>{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{teacher.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{teacher.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{teacher.experience} лет опыта</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{teacher.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{teacher.studentsCount} учеников</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {teacher.specialization.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-700 mb-4">{teacher.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Доступность:</div>
                  <div className="text-sm font-medium">{teacher.availability}</div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="text-2xl font-bold text-primary">{teacher.hourlyRate} ₽</div>
                  <div className="text-sm text-gray-600">за час</div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button 
                  className="flex-1"
                  variant={selectedTeacher === teacher.id ? "default" : "outline"}
                >
                  {selectedTeacher === teacher.id ? "Выбран" : "Выбрать"}
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedTeacher && (
        <Card className="bg-gradient-to-r from-primary/10 to-purple-100 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Преподаватель выбран!</h3>
              <p className="text-gray-600 mb-4">
                Вы можете связаться с преподавателем для согласования расписания занятий
              </p>
              <Button className="w-full sm:w-auto">
                Связаться с преподавателем
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};