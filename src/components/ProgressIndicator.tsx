import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  type: 'exercise' | 'test' | 'exam';
  status: string;
  solved?: number;
  total?: number;
  index?: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  type,
  status,
  solved = 0,
  total = 4,
  index = 0
}) => {
  const getSquareColor = (status: string) => {
    switch (status) {
      case 'attempted':
        return 'bg-yellow-400 border-yellow-500'; // Попытался - orange/yellow
      case 'familiar':
        return 'bg-orange-400 border-orange-500'; // Знаком - orange
      case 'proficient':
        return 'bg-purple-400 border-purple-500'; // Владею - purple
      case 'mastered':
        return 'bg-purple-600 border-purple-700'; // Освоено - crown purple
      default:
        return 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'; // Not started
    }
  };

  const getLightningColor = (status: string) => {
    return status === 'completed' 
      ? 'text-blue-500 bg-blue-100 dark:bg-blue-900' 
      : 'text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500';
  };

  const getStarColor = (status: string) => {
    return status === 'completed' 
      ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900' 
      : 'text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500';
  };

  if (type === 'exercise') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
        className={cn(
          'w-8 h-8 rounded border-2 transition-all duration-300',
          getSquareColor(status)
        )}
        title={`${solved}/${total} - ${status}`}
      />
    );
  }

  if (type === 'test') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
          getLightningColor(status)
        )}
        title={`Test: ${solved}/${total}`}
      >
        <Zap className="w-4 h-4" />
      </motion.div>
    );
  }

  if (type === 'exam') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
          getStarColor(status)
        )}
        title={`Exam: ${solved}/${total}`}
      >
        <Star className="w-4 h-4" />
      </motion.div>
    );
  }

  return null;
};