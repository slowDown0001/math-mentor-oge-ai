
import { Toggle } from "@/components/ui/toggle";
import { Database } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";

const DatabaseToggle = () => {
  const { isDatabaseMode, setIsDatabaseMode } = useChatContext();

  return (
    <div className="flex items-center gap-2">
      <Toggle
        pressed={isDatabaseMode}
        onPressedChange={setIsDatabaseMode}
        variant="outline"
        size="sm"
        className={`transition-colors ${
          isDatabaseMode 
            ? 'bg-primary text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground' 
            : 'hover:bg-muted'
        }`}
      >
        <Database className="h-4 w-4 mr-1" />
        База
      </Toggle>
      <span className="text-xs text-muted-foreground">
        {isDatabaseMode ? 'Только база данных' : 'ИИ помощник'}
      </span>
    </div>
  );
};

export default DatabaseToggle;
