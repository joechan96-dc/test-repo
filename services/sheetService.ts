import { AssignmentMap, TeacherLocationMap } from '../types';

// The key for storing the user's GAS URL in localStorage
const STORAGE_KEY_URL = 'staffing_app_script_url';

// Your deployed Web App URL
const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwsSAMJGvSumvbngeXT7Qt7xyvHcCj10NAianXOu0ve5yaWlBUGMsRiLVQHozi1Eogq0w/exec';

export const getScriptUrl = () => localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SCRIPT_URL;
export const setScriptUrl = (url: string) => localStorage.setItem(STORAGE_KEY_URL, url);

export interface SyncResponse {
  success: boolean;
  assignments?: AssignmentMap;
  locations?: TeacherLocationMap;
  error?: string;
}

export const fetchSheetData = async (): Promise<SyncResponse> => {
  const url = getScriptUrl();
  if (!url) {
    return { success: false, error: 'No Script URL configured' };
  }

  try {
    const response = await fetch(`${url}?action=read`);
    const data = await response.json();
    
    if (data.success) {
      return { 
          success: true, 
          assignments: data.assignments || {},
          locations: data.locations || {} 
      };
    } else {
      throw new Error(data.error || 'Unknown error from sheet');
    }
  } catch (error: any) {
    console.error("Fetch failed:", error);
    return { success: false, error: error.message };
  }
};

export const saveAssignmentToSheet = async (
  key: string, 
  day: string, 
  block: string, 
  year: string, 
  cls: string, 
  teachers: string[],
  locationsJson: string = '{}'
): Promise<SyncResponse> => {
  const url = getScriptUrl();
  if (!url) return { success: false, error: 'No Script URL' };

  try {
    const params = new URLSearchParams({
      action: 'write',
      key: key,
      day: day,
      block: block,
      year: year,
      class: cls,
      teachers: teachers.join(','),
      locations: locationsJson
    });

    // Using GET to avoid CORS preflight complexity with GAS Web Apps in some browsers
    const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET', 
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Save failed:", error);
    return { success: false, error: error.message };
  }
};


/* 
================================================================================
GOOGLE APPS SCRIPT CODE v5 (Clean DB)
Copy and paste the below code into your Google Sheet's "Extensions > Apps Script" editor.
Deploy as "Web App" -> "Anyone" has access.
================================================================================

function doGet(e) {
  var result = { success: false, error: 'Unknown error' };

  if (!e || !e.parameter) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: 'No parameters found.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: 'Server busy.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var action = e.parameter.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // --- CONFIGURATION ---
    var DAY_TO_SHEET = {
      'Day 1': 'Monday',
      'Day 2': 'Tuesday',
      'Day 3': 'Wednesday',
      'Day 4': 'Thursday',
      'Day 5': 'Friday'
    };
    
    var BLOCK_COLS = {
      'Block 1': { t: 3, l: 4 },
      'Block 2': { t: 5, l: 6 },
      'Block 3': { t: 7, l: 8 },
      'Block 4': { t: 9, l: 10 },
      'DT':      { t: 11, l: 12 }
    };
    
    // Database Sheet for persistence (Backup)
    var dbSheet = ss.getSheetByName('StaffingDB');
    if (!dbSheet) {
      dbSheet = ss.insertSheet('StaffingDB');
      dbSheet.appendRow(['Key', 'Day', 'Block', 'Year', 'Class', 'Teachers', 'Locations']);
    }
    
    // AUTO-HIDE the DB sheet so it doesn't clutter the view
    try {
      dbSheet.hideSheet();
    } catch(e) {}

    if (action === 'read') {
      // Read from DB for App State
      var data = dbSheet.getDataRange().getValues();
      var assignments = {};
      var locations = {};
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var k = row[0];
        if (k) {
           assignments[k] = row[5] ? row[5].toString().split(',') : [];
           try { locations[k] = row[6] ? JSON.parse(row[6]) : {}; } catch (e) { locations[k] = {}; }
        }
      }
      result = { success: true, assignments: assignments, locations: locations };
      
    } else if (action === 'write') {
      var key = e.parameter.key;
      var day = e.parameter.day;
      var block = e.parameter.block;
      var clsName = e.parameter.class;
      var teachers = e.parameter.teachers || '';
      var locsJson = e.parameter.locations || '{}';
      var locsObj = {};
      try { locsObj = JSON.parse(locsJson); } catch(e) {}
      
      var hasData = (teachers && teachers.length > 0) || (Object.keys(locsObj).length > 0);
      
      // 1. Update Database (Backup)
      var data = dbSheet.getDataRange().getValues();
      var rowIndex = -1;
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === key) { rowIndex = i + 1; break; }
      }

      if (rowIndex === -1) {
        // If row doesn't exist, only create it if we actually have data
        if (hasData) {
           dbSheet.appendRow([key, day, block, e.parameter.year, clsName, teachers, locsJson]);
        }
      } else {
        // Row exists
        if (!hasData) {
           // If clearing data, delete the row to keep DB clean
           dbSheet.deleteRow(rowIndex);
        } else {
           // Otherwise update it
           dbSheet.getRange(rowIndex, 6).setValue(teachers);
           dbSheet.getRange(rowIndex, 7).setValue(locsJson);
        }
      }
      
      // 2. Update Visual Schedule (Monday, Tuesday...)
      var visualSheetName = DAY_TO_SHEET[day];
      var visualSheet = ss.getSheetByName(visualSheetName);
      
      if (visualSheet && BLOCK_COLS[block]) {
        // Find the Row by Class Name (Column B / Index 2)
        var visualData = visualSheet.getDataRange().getValues();
        var visualRowIndex = -1;
        
        // Fuzzy match class name
        var cleanCls = clsName.replace(/\s/g, '').toLowerCase();
        
        for (var r = 0; r < visualData.length; r++) {
           // Check Column B (Index 1)
           var cellVal = visualData[r][1]; 
           if (cellVal && cellVal.toString().replace(/\s/g, '').toLowerCase() === cleanCls) {
             visualRowIndex = r + 1;
             break;
           }
        }
        
        if (visualRowIndex > -1) {
          var cols = BLOCK_COLS[block];
          // Write Teachers
          var teacherText = teachers.replace(/,/g, '\n'); 
          visualSheet.getRange(visualRowIndex, cols.t).setValue(teacherText);
          
          // Write Locations
          var locList = [];
          var teacherList = teachers.split(',');
          for (var t = 0; t < teacherList.length; t++) {
            var tName = teacherList[t];
            if (locsObj[tName]) {
               locList.push(locsObj[tName]);
            }
          }
          visualSheet.getRange(visualRowIndex, cols.l).setValue(locList.join('\n'));
        }
      }

      result = { success: true };
    }
    
  } catch (error) {
    result = { success: false, error: error.toString() };
  } finally {
    lock.releaseLock();
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
*/