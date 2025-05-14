
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        Настройки профиля
      </h2>
      
      <div className="space-y-2">
        <p className="text-gray-600">Функции настройки профиля будут доступны в ближайшем обновлении.</p>
      </div>
      
      <Button variant="outline" className="w-full text-gray-700">
        Изменить пароль
      </Button>
      
      <Button variant="outline" className="w-full text-gray-700">
        Настройки уведомлений
      </Button>
      
      <Button variant="destructive" className="w-full mt-8">
        Выйти из аккаунта
      </Button>
    </div>
  );
};
