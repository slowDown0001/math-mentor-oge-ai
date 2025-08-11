
import { Castle } from "lucide-react";

interface TopicProgress {
  topic: string;
  name: string;
  averageScore: number;
}

interface CastleVisualizationProps {
  topicProgress: TopicProgress[];
  isLoading: boolean;
}

const CastleVisualization = ({ topicProgress, isLoading }: CastleVisualizationProps) => {
  const getTowerColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Green - excellent
    if (score >= 60) return "#f59e0b"; // Yellow - good
    if (score >= 40) return "#f97316"; // Orange - needs work
    if (score >= 20) return "#ef4444"; // Red - poor
    return "#6b7280"; // Gray - not started
  };

  const getTowerHeight = (score: number) => {
    // Base height + proportional height based on score
    const baseHeight = 60;
    const maxAdditionalHeight = 40;
    return baseHeight + (score / 100) * maxAdditionalHeight;
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-blue-200 to-green-300 rounded-lg p-8 h-64 flex items-center justify-center">
        <div className="text-center">
          <Castle className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Строительство замка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-200 via-blue-100 to-green-300 rounded-lg p-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-400 rounded-b-lg"></div>
      <div className="absolute bottom-2 left-4 w-12 h-6 bg-green-500 rounded-full opacity-60"></div>
      <div className="absolute bottom-2 right-8 w-16 h-8 bg-green-500 rounded-full opacity-40"></div>
      
      {/* Castle base */}
      <div className="relative flex items-end justify-center h-48 space-x-1">
        {/* Central castle wall */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gray-600 rounded-t-lg shadow-lg z-10">
          {/* Castle gate */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gray-800 rounded-t-full"></div>
          {/* Flag */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-700"></div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 translate-x-1 w-6 h-4 bg-red-500 rounded-r-md"></div>
        </div>

        {/* Towers */}
        {topicProgress.map((topic, index) => {
          const towerHeight = getTowerHeight(topic.averageScore);
          const towerColor = getTowerColor(topic.averageScore);
          const isLeftSide = index < 4;
          const positionIndex = isLeftSide ? index : index - 4;
          const xOffset = isLeftSide 
            ? -120 + positionIndex * 25 
            : 40 + positionIndex * 25;

          return (
            <div
              key={topic.topic}
              className="absolute bottom-0 flex flex-col items-center group"
              style={{ 
                left: `calc(50% + ${xOffset}px)`,
                transform: 'translateX(-50%)'
              }}
            >
              {/* Tower */}
              <div
                className="w-8 rounded-t-lg shadow-lg relative transition-all duration-300 hover:scale-110"
                style={{ 
                  height: `${towerHeight}px`,
                  backgroundColor: towerColor
                }}
              >
                {/* Tower top decoration */}
                <div 
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full"
                  style={{ backgroundColor: towerColor }}
                ></div>
                <div 
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-400"
                ></div>
                
                {/* Tower windows */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-yellow-200 rounded-full opacity-80"></div>
                {towerHeight > 80 && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-yellow-200 rounded-full opacity-80"></div>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                <div className="font-semibold">{topic.name}</div>
                <div>{topic.averageScore}%</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
              </div>

              {/* Topic label */}
              <div className="mt-2 text-xs font-medium text-gray-700 text-center w-12">
                Тема {topic.topic}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#10b981" }}></div>
          <span>80%+ Отлично</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f59e0b" }}></div>
          <span>60-79% Хорошо</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f97316" }}></div>
          <span>40-59% Средне</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ef4444" }}></div>
          <span>20-39% Слабо</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#6b7280" }}></div>
          <span>0-19% Не изучено</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mt-4">
        <h3 className="text-lg font-semibold text-gray-800">Замок знаний</h3>
        <p className="text-sm text-gray-600">Каждая башня представляет вашу подготовку по теме</p>
      </div>
    </div>
  );
};

export default CastleVisualization;
