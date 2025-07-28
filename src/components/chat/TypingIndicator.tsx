
const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in mb-6">
      <div className="max-w-[80%] mr-12">
        <div className="flex space-x-1 text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-100"></div>
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
