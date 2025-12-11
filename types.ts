export interface Teacher {
  name: string;
  isDP: boolean;
}

export interface YearGroup {
  name: string;
  classes: string[];
  teachers: string[];
  classTeacherMapping?: Record<string, string[]>;
}

export interface AssignmentMap {
  [key: string]: string[]; // key: "Day-Block-Year-Class", value: [TeacherNames]
}

export interface TeacherLocationMap {
  [key: string]: { [teacherName: string]: string }; // key: "Day-Block-Year-Class", value: { TeacherName: Location }
}

export interface SheetData {
  assignments: AssignmentMap;
  locations: TeacherLocationMap;
}

export type ViewMode = 'byClass' | 'byBlock';

export interface DPConflict {
  hasConflict: boolean;
  classCode?: string;
}