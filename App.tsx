import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Printer, 
  Settings, 
  Calendar, 
  Users, 
  LayoutGrid, 
  List,
  Lock
} from 'lucide-react';

import { YEAR_GROUPS, BLOCKS, LOCATIONS, TEACHER_NAME_MAP, MAZE_DATA, DAYS, MANUAL_DP_CONFLICTS } from './constants';
import { AssignmentMap, TeacherLocationMap, ViewMode } from './types';
import { ScheduleCard } from './components/ScheduleCard';
import { SettingsModal } from './components/SettingsModal';
import { fetchSheetData, saveAssignmentToSheet, getScriptUrl } from './services/sheetService';

// --- Maze Data Parsing Logic ---
const TEACHER_CODE_TO_FULL_NAME: Record<string, string> = {};
const DP_SCHEDULE: Record<string, Record<string, Record<string, string>>> = {}; // Teacher -> Day -> Block -> Class
const DP_TEACHERS = new Set<string>();

// Initialize Logic
const initDPData = () => {
    // Populate Code map from constants
    Object.values(YEAR_GROUPS).forEach(group => {
        group.teachers.forEach(fullName => {
            const code = Object.keys(TEACHER_NAME_MAP).find(key => key === fullName) || fullName.split(' ')[0];
            TEACHER_CODE_TO_FULL_NAME[code] = fullName;
        });
    });
    // Manually ensure overrides
    Object.entries(TEACHER_NAME_MAP).forEach(([key, val]) => {
        TEACHER_CODE_TO_FULL_NAME[key] = val;
        TEACHER_CODE_TO_FULL_NAME[val] = key; // Bi-directional-ish
    });

    const lines = MAZE_DATA.trim().split('\n');
    lines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(',');
        if (parts.length < 6) return;

        const classCode = parts[0].trim();
        const yearGroup = parts[1].trim();
        const teacherCode = parts[2].trim();
        const teacherNickname = parts[3].trim();
        const dayVal = parts[4].trim();
        const blockVal = parts[5].trim();

        // Resolve full name logic: Try Code Map, then Nickname Map, then Nickname
        // We need the Full Name that appears in the sidebar
        let teacherFullName = 
            Object.keys(TEACHER_NAME_MAP).find(k => TEACHER_NAME_MAP[k] === teacherCode) || // Find Full Name by Code
            Object.keys(TEACHER_NAME_MAP).find(k => TEACHER_NAME_MAP[k] === teacherNickname) || 
            teacherNickname;
            
        // Reverse lookup fallback
        if (!teacherFullName) teacherFullName = teacherNickname;

        // Determine DP Status
        if (yearGroup === 'Year 12' || yearGroup === 'Year 13' || classCode.startsWith('12') || classCode.startsWith('13')) {
            DP_TEACHERS.add(teacherFullName);
        }

        const dayKey = `Day ${dayVal}`;
        const blockKey = blockVal === 'DT' ? 'DT' : `Block ${blockVal}`;

        if (!DP_SCHEDULE[teacherFullName]) DP_SCHEDULE[teacherFullName] = {};
        if (!DP_SCHEDULE[teacherFullName][dayKey]) DP_SCHEDULE[teacherFullName][dayKey] = {};
        
        DP_SCHEDULE[teacherFullName][dayKey][blockKey] = classCode;
    });
};

initDPData();

// Helper to categorize locations by floor
const getLocationGroup = (loc: string) => {
  if (loc.startsWith('5')) return '5th Floor';
  if (loc.startsWith('4')) return '4th Floor';
  if (loc.startsWith('3')) return '3rd Floor';
  if (loc.startsWith('2')) return '2nd Floor';
  if (loc.startsWith('LF') || loc.includes('Lower Ground') || loc.includes('LE1')) return 'Lower Ground / 1st';
  return 'Other Locations';
};

function App() {
  // --- State ---
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedYear, setSelectedYear] = useState(Object.keys(YEAR_GROUPS)[0]);
  const [selectedClass, setSelectedClass] = useState(YEAR_GROUPS[Object.keys(YEAR_GROUPS)[0]].classes[0]);
  const [selectedBlock, setSelectedBlock] = useState(BLOCKS[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('byClass');
  
  const [assignments, setAssignments] = useState<AssignmentMap>({});
  const [teacherLocations, setTeacherLocations] = useState<TeacherLocationMap>({});
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Sync Handlers ---
  const handleRefresh = async () => {
    setIsSyncing(true);
    const result = await fetchSheetData();
    if (result.success && result.assignments) {
      setAssignments(result.assignments);
      if (result.locations) setTeacherLocations(result.locations);
      setLastSyncTime(new Date());
    } else {
      if (result.error === 'No Script URL configured') {
          setIsSettingsOpen(true);
      } else {
          console.error("Sync error:", result.error);
      }
    }
    setIsSyncing(false);
  };

  // Initial Load
  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- UI Helpers ---
  const updateYear = (year: string) => {
    setSelectedYear(year);
    const firstClass = YEAR_GROUPS[year].classes[0];
    if (firstClass) setSelectedClass(firstClass);
  };

  const getAssignmentKey = (day: string, block: string, year: string, cls: string) => {
    return `${day}-${block}-${year}-${cls}`;
  };

  const getAssignmentsForSlot = (day: string, block: string, year: string, cls: string) => {
    const key = getAssignmentKey(day, block, year, cls);
    return assignments[key] || [];
  };

  // --- Availability Checkers ---
  
  /**
   * Checks if a teacher is already assigned to ANY class in the given day/block.
   * Returns true if busy.
   */
  const isTeacherBusy = (teacherName: string, day: string, block: string): boolean => {
    // Iterate through all assignments
    for (const key in assignments) {
      // key format: Day 1-Block 1-Year 7-7.1
      const [kDay, kBlock] = key.split('-');
      
      if (kDay === day && kBlock === block) {
        const teachersInSlot = assignments[key];
        if (teachersInSlot && teachersInSlot.includes(teacherName)) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Checks if a location is already used by ANY teacher in the given day/block.
   * Returns true if busy.
   */
  const isLocationBusy = (locationName: string, day: string, block: string): boolean => {
    for (const key in teacherLocations) {
      // key format: Day 1-Block 1-Year 7-7.1
      const [kDay, kBlock] = key.split('-');
      
      if (kDay === day && kBlock === block) {
        const locsInSlot = teacherLocations[key]; // { 'TeacherName': 'Location' }
        if (locsInSlot) {
           const usedLocs = Object.values(locsInSlot);
           if (usedLocs.includes(locationName)) {
             return true;
           }
        }
      }
    }
    return false;
  };


  // --- Drag & Drop Handlers ---
  const handleDropTeacher = async (teacherName: string, day: string, block: string, year: string, cls: string) => {
    // 1. Check Double Booking
    if (isTeacherBusy(teacherName, day, block)) {
      alert(`${teacherName} is already scheduled in ${block} on ${day}! Cannot double book.`);
      return;
    }

    const key = getAssignmentKey(day, block, year, cls);
    const current = assignments[key] || [];
    
    if (!current.includes(teacherName)) {
      const newAssignments = [...current, teacherName];
      setAssignments(prev => ({ ...prev, [key]: newAssignments }));
      
      const currentLocs = teacherLocations[key] || {};
      await saveAssignmentToSheet(key, day, block, year, cls, newAssignments, JSON.stringify(currentLocs));
    }
  };

  const handleRemoveTeacher = async (teacherName: string, day: string, block: string, year: string, cls: string) => {
    const key = getAssignmentKey(day, block, year, cls);
    const current = assignments[key] || [];
    const newAssignments = current.filter(t => t !== teacherName);
    
    setAssignments(prev => ({ ...prev, [key]: newAssignments }));
    
    const currentLocs = true || {};
    if (currentLocs[teacherName]) {
        delete currentLocs[teacherName];
    }
    setTeacherLocations(prev => ({ ...prev, [key]: currentLocs }));

    await saveAssignmentToSheet(key, day, block, year, cls, newAssignments, JSON.stringify(currentLocs));
  };

  const handleDropLocation = async (teacherName: string, location: string, day: string, block: string, year: string, cls: string) => {
      // 1. Check Location Availability
      if (isLocationBusy(location, day, block)) {
        alert(`${location} is already booked in ${block} on ${day}!`);
        return;
      }

      const key = getAssignmentKey(day, block, year, cls);
      const currentSlotLocs = teacherLocations[key] || {};
      const newSlotLocs = { ...currentSlotLocs, [teacherName]: location };
      
      setTeacherLocations(prev => ({ ...prev, [key]: newSlotLocs }));

      const currentTeachers = assignments[key] || [];
      await saveAssignmentToSheet(key, day, block, year, cls, currentTeachers, JSON.stringify(newSlotLocs)); 
  };

  // --- Conflict Logic (DP) ---
  const getTeacherConflict = (teacherName: string, day: string, block: string) => {
      // 1. Check Manual Overrides first
      if (MANUAL_DP_CONFLICTS[teacherName]) {
          const conflictKey = `${day}-${block}`; // e.g. Day 1-Block 4
          if (MANUAL_DP_CONFLICTS[teacherName].includes(conflictKey)) {
              return { hasConflict: true, classCode: 'DP Class / Busy' };
          }
      }

      if (!DP_SCHEDULE[teacherName]) return { hasConflict: false };
      const daySched = DP_SCHEDULE[teacherName][day];
      if (!daySched) return { hasConflict: false };
      
      const classCode = daySched[block];
      // Check for both Year 12 (starts with 12) AND Year 13 (starts with 13) classes
      if (classCode && (classCode.startsWith('12') || classCode.startsWith('13'))) {
          return { hasConflict: true, classCode };
      }
      return { hasConflict: false };
  };

  // --- Render Helpers ---
  const groupedLocations = LOCATIONS.reduce((acc, loc) => {
      const group = getLocationGroup(loc);
      if (!acc[group]) acc[group] = [];
      acc[group].push(loc);
      return acc;
  }, {} as Record<string, string[]>);

  // Fixed order for groups
  const groupOrder = ['5th Floor', '4th Floor', '3rd Floor', '2nd Floor', 'Lower Ground / 1st', 'Other Locations'];


  // --- Filtered Teachers (Sidebar) ---
  const yearData = YEAR_GROUPS[selectedYear];
  const allTeachers = yearData.teachers;
  const classMapping = yearData.classTeacherMapping;

  // Determine displayed teachers
  // If in 'byClass' mode and a specific mapping exists for the selected class, use it.
  // Otherwise show all teachers for the Year Group.
  const displayedTeachers = (viewMode === 'byClass' && classMapping && classMapping[selectedClass]) 
      ? classMapping[selectedClass] 
      : allTeachers;


  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-100 text-slate-900 font-sans">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleRefresh}
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              📋 IDU Staffing Manager
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Live Sync</span>
            </h1>
            <p className="text-indigo-100 text-sm mt-1 opacity-90">January 19-23, 2026</p>
          </div>

          <div className="flex items-center gap-3">
            {lastSyncTime && (
                <span className="text-xs text-indigo-200 hidden md:inline-block">
                    Last synced: {lastSyncTime.toLocaleTimeString()}
                </span>
            )}
            <button 
              onClick={handleRefresh}
              disabled={isSyncing}
              className={`
                flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all
                ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
              Refresh
            </button>
            
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-gray-50 shadow-sm transition-all"
            >
              <Printer size={18} />
              Print
            </button>

            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="Configure Google Sheet Connection"
            >
                <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} /> Day
              </label>
              <select 
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-32 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Users size={12} /> Year Group and Units
              </label>
              <select 
                value={selectedYear}
                onChange={(e) => updateYear(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {Object.entries(YEAR_GROUPS).map(([key, val]) => (
                  <option key={key} value={key}>{key} - {val.name}</option>
                ))}
              </select>
            </div>

            {/* Context Sensitive Select */}
            {viewMode === 'byClass' ? (
               <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Class / Section</label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-40 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                >
                  {yearData.classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Block Time</label>
                <select 
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="w-40 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                >
                  {BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-1 ml-auto">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">View Mode</label>
               <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                 <button 
                    onClick={() => setViewMode('byClass')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'byClass' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   <LayoutGrid size={16} /> By Class
                 </button>
                 <button 
                    onClick={() => setViewMode('byBlock')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'byBlock' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   <List size={16} /> By Block
                 </button>
               </div>
            </div>

          </div>

          {/* Scheduling Grid */}
          <div 
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
          >
            {viewMode === 'byClass' ? (
              // By Class View: Show ALL BLOCKS for ONE CLASS
              BLOCKS.map(block => {
                 const key = getAssignmentKey(selectedDay, block, selectedYear, selectedClass);
                 return (
                    <ScheduleCard
                        key={key}
                        day={selectedDay}
                        block={block}
                        year={selectedYear}
                        cls={selectedClass}
                        assignedTeachers={getAssignmentsForSlot(selectedDay, block, selectedYear, selectedClass)}
                        teacherLocations={teacherLocations[key] || {}}
                        onDropTeacher={(teacher) => handleDropTeacher(teacher, selectedDay, block, selectedYear, selectedClass)}
                        onRemoveTeacher={(teacher) => handleRemoveTeacher(teacher, selectedDay, block, selectedYear, selectedClass)}
                        onDropLocation={(teacher, loc) => handleDropLocation(teacher, loc, selectedDay, block, selectedYear, selectedClass)}
                        getConflict={(teacher) => getTeacherConflict(teacher, selectedDay, block)}
                    />
                 );
              })
            ) : (
              // By Block View: Show ALL CLASSES for ONE BLOCK
              yearData.classes.map(cls => {
                  const key = getAssignmentKey(selectedDay, selectedBlock, selectedYear, cls);
                  return (
                    <ScheduleCard
                        key={key}
                        day={selectedDay}
                        block={selectedBlock}
                        year={selectedYear}
                        cls={cls}
                        assignedTeachers={getAssignmentsForSlot(selectedDay, selectedBlock, selectedYear, cls)}
                        teacherLocations={teacherLocations[key] || {}}
                        onDropTeacher={(teacher) => handleDropTeacher(teacher, selectedDay, selectedBlock, selectedYear, cls)}
                        onRemoveTeacher={(teacher) => handleRemoveTeacher(teacher, selectedDay, selectedBlock, selectedYear, cls)}
                        onDropLocation={(teacher, loc) => handleDropLocation(teacher, loc, selectedDay, selectedBlock, selectedYear, cls)}
                        getConflict={(teacher) => getTeacherConflict(teacher, selectedDay, selectedBlock)}
                    />
                  );
              })
            )}
          </div>

        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 print:hidden h-screen lg:sticky lg:top-24">
          
          {/* Teachers Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[40%] min-h-[300px]">
             <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center">
                <span>👥 Teachers ({selectedYear})</span>
             </div>
             <div className="p-3 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-2">
                    {displayedTeachers.map(teacher => {
                        // const isDP = DP_TEACHERS.has(teacher);
                        
                        // Check if teacher is busy in the currently viewed block
                        // Only relevant in "By Block" view, or we default to false in class view (as class view shows multiple blocks)
                        const isBusy = viewMode === 'byBlock' ? isTeacherBusy(teacher, selectedDay, selectedBlock) : false;

                        return (
                            <div 
                                key={teacher}
                                draggable={!isBusy}
                                onDragStart={(e) => {
                                    if(isBusy) return;
                                    e.dataTransfer.setData('teacher', teacher);
                                    e.dataTransfer.effectAllowed = 'copy';
                                }}
                                className={`
                                    flex items-center justify-between px-3 py-2 border rounded-lg transition-colors
                                    ${isBusy 
                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                                        : 'bg-red-50 hover:bg-red-100 border-red-200 cursor-grab active:cursor-grabbing'
                                    }
                                `}
                            >
                                <span className={`text-sm font-medium ${isBusy ? 'text-gray-400' : 'text-red-900'}`}>
                                    {teacher}
                                </span>
                                <div className="flex gap-1">
                                    {isBusy && <Lock size={14} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
             </div>
          </div>

          {/* Locations Panel (Grouped) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1 max-h-[50%]">
             <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                📍 Locations
             </div>
             <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                {groupOrder.map(groupName => {
                    const locs = groupedLocations[groupName];
                    if (!locs || locs.length === 0) return null;

                    return (
                        <div key={groupName}>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{groupName}</h4>
                            <div className="flex flex-wrap gap-2">
                                {locs.map(loc => {
                                    // Check if location busy in current block view
                                    const isBusy = viewMode === 'byBlock' ? isLocationBusy(loc, selectedDay, selectedBlock) : false;
                                    
                                    return (
                                        <div
                                            key={loc}
                                            draggable={!isBusy}
                                            onDragStart={(e) => {
                                                if(isBusy) return;
                                                e.dataTransfer.setData('location', loc);
                                                e.dataTransfer.effectAllowed = 'copy';
                                            }}
                                            className={`
                                                px-3 py-1.5 border rounded-md text-xs font-semibold transition-colors
                                                ${isBusy
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200 cursor-grab active:cursor-grabbing'
                                                }
                                            `}
                                            title={isBusy ? "Already booked in this block" : ""}
                                        >
                                            {loc} {isBusy && '🔒'}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
             </div>
          </div>
          
          {/* Sync Status Info */}
          <div className={`rounded-lg p-4 border flex items-center gap-3 ${getScriptUrl() ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
             <div className={`w-2.5 h-2.5 rounded-full ${getScriptUrl() ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
             <div className="flex flex-col">
                <span className="text-sm font-bold">{getScriptUrl() ? 'Ready to Sync' : 'Setup Required'}</span>
                <span className="text-xs opacity-80">{getScriptUrl() ? 'Connected to Staffing Sheet' : 'Connect to Google Sheet in Settings'}</span>
             </div>
          </div>

        </aside>
      </main>
    </div>
  );
}

export default App;