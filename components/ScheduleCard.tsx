import React, { useState } from 'react';
import { TeacherChip } from './TeacherChip';

interface ScheduleCardProps {
  day: string;
  block: string;
  year: string;
  cls: string;
  assignedTeachers: string[];
  teacherLocations: { [teacherName: string]: string };
  onDropTeacher: (teacherName: string) => void;
  onRemoveTeacher: (teacherName: string) => void;
  onDropLocation: (teacherName: string, location: string) => void;
  getConflict: (teacherName: string) => { hasConflict: boolean; classCode?: string };
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  block,
  cls,
  assignedTeachers,
  teacherLocations,
  onDropTeacher,
  onRemoveTeacher,
  onDropLocation,
  getConflict
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Only highlight if dragging a teacher
    if (e.dataTransfer.types.includes('teacher')) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const teacherName = e.dataTransfer.getData('teacher');
    if (teacherName) {
      onDropTeacher(teacherName);
    }
  };

  // Handle dropping a location onto a specific teacher
  const handleTeacherDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('location')) {
        e.preventDefault();
        e.stopPropagation();
    }
  };

  const handleLocationDrop = (e: React.DragEvent, teacherName: string) => {
    const location = e.dataTransfer.getData('location');
    if (location) {
        e.preventDefault();
        e.stopPropagation();
        onDropLocation(teacherName, location);
    }
  };

  const isDT = block === 'DT';

  return (
    <div className="flex flex-col bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="bg-slate-50 border-b border-sky-600/30 px-4 py-3">
        <h3 className="text-sm font-semibold text-sky-800 flex justify-between items-center">
          <span>{cls}</span>
          <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
            {block} {isDT ? '(40m)' : '(80m)'}
          </span>
        </h3>
      </div>

      <div 
        className={`
          flex-1 min-h-[140px] p-3 flex flex-col gap-2 transition-colors
          ${isDragOver ? 'bg-sky-50 border-sky-400' : 'bg-gray-50/50'}
          ${assignedTeachers.length === 0 ? 'justify-center items-center' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {assignedTeachers.length === 0 && (
          <div className="text-gray-300 text-sm font-medium pointer-events-none select-none">
            Drop teacher here
          </div>
        )}

        {assignedTeachers.map((teacher) => {
          const conflict = getConflict(teacher);
          return (
            <div 
                key={teacher} 
                onDragOver={handleTeacherDragOver} 
                onDrop={(e) => handleLocationDrop(e, teacher)}
            >
                <TeacherChip 
                  name={teacher} 
                  onRemove={() => onRemoveTeacher(teacher)}
                  hasConflict={conflict.hasConflict}
                  conflictClass={conflict.classCode}
                  location={teacherLocations[teacher]}
                />
            </div>
          );
        })}
      </div>
    </div>
  );
};
