import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, ArrowLeft } from "lucide-react";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Часто задаваемые вопросы</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <HelpCircle className="w-12 h-12 mx-auto text-blue-500 mb-4" />
            <CardTitle className="text-2xl">FAQ</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Раздел с часто задаваемыми вопросами находится в разработке. Скоро здесь появятся ответы на популярные вопросы.
            </p>
            <Button asChild className="w-full">
              <Link to="/">
                Вернуться на главную
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}