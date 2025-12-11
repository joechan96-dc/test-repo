import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface TeacherChipProps {
  name: string;
  onRemove?: () => void;
  hasConflict?: boolean;
  conflictClass?: string;
  location?: string; // Assigned location
}

export const TeacherChip: React.FC<TeacherChipProps> = ({ 
  name, 
  onRemove, 
  hasConflict, 
  conflictClass,
  location
}) => {
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('teacher', name);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      draggable 
      onDragStart={handleDragStart}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium shadow-sm cursor-grab active:cursor-grabbing transition-all
        ${hasConflict 
          ? 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100' 
          : 'bg-red-100 border-red-200 text-gray-800 hover:bg-red-200 hover:border-red-300'
        }
      `}
      title={hasConflict ? `Conflict: Teaches ${conflictClass}` : undefined}
    >
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1">
          <span>{name}</span>
          {hasConflict && (
            <AlertTriangle size={14} className="text-red-600 animate-pulse" />
          )}
        </div>
        {/* Location Tag */}
        {location && (
            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded mt-0.5 self-start">
                📍 {location}
            </span>
        )}
      </div>

      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-auto p-0.5 rounded-full hover:bg-red-200/50 text-red-600/70 hover:text-red-800 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
