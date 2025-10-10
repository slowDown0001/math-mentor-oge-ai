import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = "Загрузка..." 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-in border border-border">
        <div className="text-center">
          {/* Spinner animation */}
          <div className="mx-auto w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mb-4" />
          
          <p className="text-foreground text-lg font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
