import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DetailedStatistics = () => {
  const [skillData, setSkillData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchSkillData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('student_skills')
          .select('*')
          .eq('uid', user.id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setSkillData(data);
        }
      } catch (err) {
        console.error('Error fetching skill data:', err);
        setError('Ошибка загрузки данных о навыках');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillData();
  }, [user]);

  // Generate array of all 181 skills
  const skills = Array.from({ length: 181 }, (_, i) => {
    const skillNum = i + 1;
    const skillKey = `skill_${skillNum}`;
    const skillValue = skillData[skillKey] || 0;
    
    return {
      id: skillNum,
      name: `Навык ${skillNum}`,
      progress: skillValue
    };
  });

  // Filter skills based on search term
  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.id.toString().includes(searchTerm)
  );

  // Calculate statistics
  const totalSkills = skills.length;
  const completedSkills = skills.filter(skill => skill.progress >= 80).length;
  const averageProgress = Math.round(skills.reduce((sum, skill) => sum + skill.progress, 0) / totalSkills);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Ошибка загрузки статистики</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/statistics" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад к статистике
              </Link>
            </Button>
            
            <h1 className="text-3xl font-bold mb-2">Детальная статистика</h1>
            <p className="text-muted-foreground">Прогресс по всем 181 навыкам</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {completedSkills}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Освоенные навыки (≥80%)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {averageProgress}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Средний прогресс
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {totalSkills}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Всего навыков
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Table */}
          <Card>
            <CardHeader>
              <CardTitle>Список всех навыков</CardTitle>
              <CardDescription>
                Детальный просмотр прогресса по каждому навыку
              </CardDescription>
              
              {/* Search */}
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск навыков..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Загрузка данных...</div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">№</TableHead>
                        <TableHead>Название навыка</TableHead>
                        <TableHead className="w-[150px]">Прогресс</TableHead>
                        <TableHead className="w-[100px] text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSkills.map((skill) => (
                        <TableRow key={skill.id}>
                          <TableCell className="font-medium">
                            {skill.id}
                          </TableCell>
                          <TableCell>
                            {skill.name}
                          </TableCell>
                          <TableCell>
                            <Progress value={skill.progress} className="h-2" />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {skill.progress}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredSkills.length === 0 && searchTerm && (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">
                        Навыки не найдены по запросу "{searchTerm}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DetailedStatistics;