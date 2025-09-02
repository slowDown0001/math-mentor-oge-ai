
const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse-wave-1"></div>
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse-wave-2"></div>
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse-wave-3"></div>
      </div>
      <span className="text-xs text-muted-foreground/70 ml-2">Печатает...</span>
    </div>
  );
};

export default TypingIndicator;
