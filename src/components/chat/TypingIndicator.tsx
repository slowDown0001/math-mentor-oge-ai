
const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-white/80 shadow-sm border border-gray-200/50 p-3 rounded-lg rounded-tl-none max-w-[80%]">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-primary/70 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary/70 animate-pulse delay-100"></div>
          <div className="w-2 h-2 rounded-full bg-primary/70 animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
