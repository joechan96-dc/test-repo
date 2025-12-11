

import { YearGroup } from './types';

export const BLOCKS = ['Block 1', 'Block 2', 'Block 3', 'Block 4', 'DT'];

export const DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];

// --- LOCATION CONFIGURATION ---

// 1. Shared Spaces (Available to ALL Year Groups)
// This list includes Large Venues + Classrooms NOT assigned to specific years below
export const SHARED_LOCATIONS = [
    // Sport
    'Primary Sports Hall', 
    '2nd Floor Gym', 
    'Lower Ground Floor Court',
    'Foreshore Small', 
    'Foreshore Large',
    
    // Arts & Performance
    'Theatre', 
    'Dance Studio LF2',
    
    // Learning Commons
    'Library', 
    
    // Unassigned Classrooms (Open Booking)
    '2C2', '2C3', '2C4', // 2nd Floor leftovers
    '3A3', '3A4', '3F1', // 3rd Floor leftovers
];

// 2. Year Group Specific Classrooms
// These rooms appear in a dedicated list when the specific Year Group is selected
export const YEAR_SPECIFIC_LOCATIONS: Record<string, string[]> = {
    'Year 7': ['3C3', '3C4', '5B1', '5E1'],
    
    'Year 8': ['3B3', '3C2', '3D1', '4C1'],
    
    'Year 9 (Bonding)': ['3A1', '3A2', '3B1', '3B2'], // Amazing Race Group
    
    'Year 10 (Order in Chaos)': [
        '5E2',      // VA+MA
        'LE1/LD1',  // MU+MA (Combined)
        'LF1',      // TH+MA
        '5D2',      // TH+MA
        '3F2'       // MS+MA
    ],
    
    'Year 11': [
        '4B2', // CLL+INS
        '4C1', // PH3B+3C
        '2B3'  // PH4B+5A
    ]
};

// Combine for validation logic
export const LOCATIONS = Array.from(new Set([
    ...SHARED_LOCATIONS,
    ...Object.values(YEAR_SPECIFIC_LOCATIONS).flat()
]));

// Class names MUST match the content of Column B in your Google Sheet exactly
export const YEAR_GROUPS: Record<string, YearGroup> = {
    'Year 7': {
        name: 'Game for a Better Future',
        classes: ['7.1', '7.2', '7.3', '7.4'],
        teachers: ['Tod Baker', 'Jemma Millar', 'Barry Wilkinson', 'Claire Neale', 'Myra Pyne', 'Jonathan Simpson', 'Kellie Berry', 'Mark Jobling', 'Sarah Jolly', 'Alastair Mack']
    },
    'Year 8': {
        name: 'Healthy Habits for a Happy Life',
        classes: ['8.1', '8.2', '8.3', '8.4'],
        teachers: ['Steve Bolton', 'Alan Kirk', 'Gwylim Richards', 'Tuomas Virret', 'Aj Lim', 'Natalie Fong', 'Rachel Yu', 'Beverley O\'Gorman', 'Mark Mackenzie', 'Akina Lam']
    },
    'Year 9 (Bonding)': {
        name: 'Bonding Community in the Amazing Race',
        classes: ['9.1', '9.2', '9.3', '9.4'],
        teachers: ['Annette Garnett', 'Amy Prosser', 'Peter de Wet', 'Dai Pugh', 'Nigel Philip', 'Paul McGoey', 'Martina O\'Connor', 'Fiona Tate', 'Christopher Ryan']
    },
    'Year 10 (Order in Chaos)': {
        name: 'Order in Chaos',
        classes: ['VA+MA', 'MU+MA', 'TH + MA', 'MS + MA'],
        teachers: [
            'Ethan Lester', 'Jane Mitchell', 'Kevin Rydeard', 'Shija Godfrey',
            'Megan Gibson', 'Matt Davis', 'Rosie Horogoda',
            'Sarah Sweetman', 'Line Turagaiviu', 'Nicola Grant', 'Penny Joshi',
            'Danielle Veilleux', 'Vanessa Viirret', 'Meena Venkatasubramanian', 'Jasmine Peralta'
        ],
        classTeacherMapping: {
            'VA+MA': ['Ethan Lester', 'Jane Mitchell', 'Kevin Rydeard', 'Shija Godfrey'],
            'MU+MA': ['Megan Gibson', 'Matt Davis', 'Rosie Horogoda'],
            'TH + MA': ['Sarah Sweetman', 'Line Turagaiviu', 'Nicola Grant', 'Penny Joshi'],
            'MS + MA': ['Danielle Veilleux', 'Vanessa Viirret', 'Meena Venkatasubramanian', 'Jasmine Peralta']
        }
    },
    'Year 11': {
        name: 'Hong Kong Explore',
        classes: [
            'DES+INS (PH2C+SXPH3A)', 
            'CLL+INS', 
            'PH3B&3C+INS', 
            'PH4B&5A+INS'
        ],
        teachers: [
            'Maggie Lee', 'Patgee Szeto', 'Simon Man', 'Danny Shih Kwun Shun', 'Candice Chen', 
            'Valerie Mao', 'Elaine Leung', 'Daniel Hansson', 'Andrew Clendinning', 'Michael Glavanis', 
            'Raina Zhaparova', 'Holy Yoong', 'Chantelle De Wet', 'Laura Motta', 'Tom Lee', 
            'Eugene Tasker', 'Tania Tasker', 'Kelly Chak-Mark', 'Jessie Cheng'
        ],
        classTeacherMapping: {
            'DES+INS (PH2C+SXPH3A)': ['Eugene Tasker', 'Tom Lee', 'Tania Tasker', 'Chantelle De Wet'],
            'CLL+INS': ['Simon Man', 'Danny Shih Kwun Shun', 'Daniel Hansson', 'Maggie Lee'],
            'PH3B&3C+INS': ['Valerie Mao', 'Elaine Leung', 'Andrew Clendinning', 'Patgee Szeto', 'Kelly Chak-Mark'],
            'PH4B&5A+INS': ['Raina Zhaparova', 'Michael Glavanis', 'Candice Chen', 'Holy Yoong', 'Laura Motta', 'Jessie Cheng']
        }
    }
};

export const TEACHER_NAME_MAP: Record<string, string> = {
    'Aj Lim': 'AL',
    'Akina Lam': 'CAL',
    'Alan Kirk': 'AKK',
    'Alastair Mack': 'AMK',
    'Andrew Clendinning': 'ABC',
    'Barry Wilkinson': 'BWN',
    'Danielle Veilleux': 'DVX',
    'Nigel Philip': 'NPP',
    'Obdulio Fonseca': 'OAC',
    'Paul McGoey': 'PMY',
    'Patgee Szeto': 'PSO',
    'Tod Baker': 'TB',
    'Aj': 'Aj Lim',
    'CAL': 'Akina Lam',
    'AKK': 'Alan Kirk',
    'AMK': 'Alastair Mack',
    'ABC': 'Andrew Clendinning',
    'BWN': 'Barry Wilkinson',
    'DVX': 'Danielle Veilleux',
    'NPP': 'Nigel Philip',
    'OAC': 'Obdulio Fonseca',
    'PMY': 'Paul McGoey',
    'PSO': 'Patgee Szeto',
    'CD': 'Charles',
    'RH': 'Rosie',
    'BH': 'Bella',
    'CG': 'Craig',
    'AT': 'Adam',
};

export const MANUAL_DP_CONFLICTS: Record<string, string[]> = {
    'Aj Lim': ['Day 1-Block 3', 'Day 1-DT', 'Day 1-Block 4', 'Day 2-Block 1', 'Day 5-Block 1'],
    'Andrew Clendinning': ['Day 2-Block 2', 'Day 4-Block 3'],
    'Alan Kirk': ['Day 2-Block 1', 'Day 2-Block 2', 'Day 4-Block 2', 'Day 4-Block 3', 'Day 5-DT'],
    'Alastair Mack': ['Day 2-Block 2', 'Day 2-Block 4', 'Day 4-Block 1', 'Day 4-Block 3'],
    'Beverley O\'Gorman': ['Day 1-Block 1', 'Day 3-Block 4', 'Day 5-Block 2'],
    'Barry Wilkinson': ['Day 1-Block 3', 'Day 3-Block 4', 'Day 5-Block 4', 'Day 5-DT'],
    'Chantelle De Wet': ['Day 2-Block 4', 'Day 4-Block 1'],
    'Akina Lam': ['Day 1-Block 2', 'Day 3-Block 3', 'Day 5-Block 3'],
    'Christopher Ryan': ['Day 1-Block 4', 'Day 1-DT', 'Day 3-Block 1', 'Day 5-Block 1'],
    'Dai Pugh': ['Day 1-Block 2', 'Day 2-Block 3', 'Day 3-Block 3', 'Day 4-Block 3', 'Day 4-DT', 'Day 5-Block 3'],
    'Daniel Hansson': ['Day 2-Block 1', 'Day 2-Block 2', 'Day 4-Block 2', 'Day 4-Block 3'],
    'Danny Shih Kwun Shun': ['Day 2-Block 3', 'Day 4-Block 3', 'Day 4-DT'],
    'Ethan Lester': ['Day 2-Block 4', 'Day 2-DT', 'Day 4-Block 1'],
    'Elaine Leung': ['Day 4-Block 1'],
    'Fiona Tate': ['Day 1-Block 3', 'Day 3-Block 4', 'Day 5-Block 4'],
    'Gillian Whittaker': ['Day 1-Block 1', 'Day 3-Block 3', 'Day 5-Block 2'],
    'Amy Yang': ['Day 1-Block 2', 'Day 3-Block 3', 'Day 5-Block 3'],
    'Amy Prosser': ['Day 1-Block 2', 'Day 3-Block 3', 'Day 5-Block 3'],
    'Jonathan Simpson': ['Day 1-Block 1', 'Day 3-Block 2', 'Day 5-Block 2'],
    'Kevin Rydeard': ['Day 2-Block 2', 'Day 4-Block 3'],
    'Line Turagaiviu': ['Day 2-Block 4', 'Day 2-DT', 'Day 4-Block 1'],
    'Laura Motta': ['Day 1-Block 2', 'Day 2-Block 3', 'Day 3-Block 3', 'Day 4-Block 4', 'Day 5-Block 3'],
    'Matt Davis': ['Day 2-Block 3', 'Day 4-Block 4', 'Day 4-DT'],
    'Maggie Lee': ['Day 1-Block 2', 'Day 3-Block 3', 'Day 5-Block 3'],
    'Mark Mackenzie': ['Day 1-Block 1', 'Day 3-Block 2', 'Day 5-Block 2'],
    'Meena Venkatasubramanian': ['Day 2-Block 2', 'Day 4-Block 3'],
    'Natalie Fong': ['Day 1-Block 1', 'Day 2-Block 2', 'Day 5-Block 2'],
    'Nicola Grant': ['Day 1-Block 4', 'Day 2-Block 1', 'Day 3-Block 1', 'Day 4-Block 2', 'Day 5-Block 1'],
    'Obdulio Fonseca': ['Day 1-Block 2', 'Day 3-Block 3', 'Day 5-Block 3'],
    'Peter de Wet': ['Day 1-Block 1', 'Day 1-Block 3', 'Day 3-Block 2', 'Day 3-Block 4', 'Day 5-Block 2', 'Day 5-Block 4', 'Day 5-DT'],
    'Paul McGoey': ['Day 2-Block 2', 'Day 4-Block 3'],
    'Rosie': ['Day 2-Block 4', 'Day 4-Block 1'],
    'Raina Zhaparova': ['Day 2-Block 1', 'Day 2-Block 4', 'Day 2-DT', 'Day 4-Block 1'],
    'Steve Bolton': ['Day 2-Block 3', 'Day 4-Block 3', 'Day 4-DT'],
    'Yu Shuizi Rachel': ['Day 1-Block 4', 'Day 1-DT', 'Day 3-Block 1', 'Day 5-Block 1'],
    'Sarah Jolly': ['Day 1-Block 4', 'Day 1-DT', 'Day 3-Block 1', 'Day 5-Block 1'],
    'Sarah Sweetman': ['Day 1-Block 4', 'Day 1-DT', 'Day 3-Block 1', 'Day 5-Block 1'],
    'Tania Tasker': ['Day 1-Block 4', 'Day 1-DT', 'Day 2-Block 1', 'Day 3-Block 1', 'Day 4-Block 2'],
    'Valerie Mao': ['Day 2-Block 3', 'Day 4-Block 4', 'Day 4-DT'],
    'Vanessa': ['Day 1-Block 3', 'Day 2-Block 3', 'Day 3-Block 4', 'Day 4-Block 4', 'Day 5-Block 4', 'Day 5-DT'],
    'Simon Man': ['Day 1-Block 4', 'Day 1-DT', 'Day 3-Block 1', 'Day 5-Block 1']
};

export const MAZE_DATA = `06PE_3,Year 06,AT,Adam,1,3
06PE_3,Year 06,AT,Adam,1,4
06PE_3,Year 06,AT,Adam,1,DT
06PE_2,Year 06,AT,Adam,2,3
06PE_3,Year 06,AT,Adam,3,2
06PE_4,Year 06,AT,Adam,3,3
06PE_1,Year 06,AT,Adam,3,3
06PE_1,Year 06,AT,Adam,3,4
06PE_1,Year 06,AT,Adam,3,DT
06PE_1,Year 06,AT,Adam,5,2
06PE_1,Year 06,AT,Adam,5,3
06GN_3,Year 06,CG,Craig,1,1
06GN_3,Year 06,CG,Craig,1,1
06GN_3,Year 06,CG,Craig,1,2
06GN_3,Year 06,CG,Craig,1,3
06GN_3,Year 06,CG,Craig,2,1
06GN_3,Year 06,CG,Craig,2,1
06GN_3,Year 06,CG,Craig,2,2
06GN_3,Year 06,CG,Craig,2,3
06GN_3,Year 06,CG,Craig,3,1
06GN_3,Year 06,CG,Craig,3,1
06GN_3,Year 06,CG,Craig,3,2
06GN_3,Year 06,CG,Craig,3,3
06GN_3,Year 06,CG,Craig,4,1
06GN_3,Year 06,CG,Craig,4,1
06GN_3,Year 06,CG,Craig,4,2
06GN_3,Year 06,CG,Craig,4,3
06GN_3,Year 06,CG,Craig,5,1
06GN_3,Year 06,CG,Craig,5,1
06GN_3,Year 06,CG,Craig,5,2
06GN_3,Year 06,CG,Craig,5,3
12BI6_41,Year 12,AL,Aj Lim,1,4
12BI6_41,Year 12,AL,Aj Lim,1,DT
12BI6_41,Year 12,AL,Aj Lim,3,1
12BI6_41,Year 12,AL,Aj Lim,5,1
12BI5_41,Year 12,AL,Aj Lim,1,4
12BI5_41,Year 12,AL,Aj Lim,3,1
12BI5_41,Year 12,AL,Aj Lim,5,1
13BI5_42,Year 13,AL,Aj Lim,1,1
13BI5_42,Year 13,AL,Aj Lim,3,2
13BI5_42,Year 13,AL,Aj Lim,5,2
12LC5_21,Year 12,CAL,Akina Lam,1,2
12LC5_21,Year 12,CAL,Akina Lam,3,3
12LC5_21,Year 12,CAL,Akina Lam,5,3
12TK7_1,Year 12,AKK,Alan Kirk,2,1
12TK7_1,Year 12,AKK,Alan Kirk,4,2
12EU6_12,Year 12,AKK,Alan Kirk,2,2
12EU6_12,Year 12,AKK,Alan Kirk,4,3
13RU5_1,Year 13,AKK,Alan Kirk,5,DT
13AI6_51,Year 13,AMK,Alastair Mack,1,4
13AI6_51,Year 13,AMK,Alastair Mack,3,1
13AI6_51,Year 13,AMK,Alastair Mack,5,1
13AI6_51,Year 13,AMK,Alastair Mack,2,2
13AI6_51,Year 13,AMK,Alastair Mack,4,3
12AA5_51,Year 12,AMK,Alastair Mack,2,4
12AA5_51,Year 12,AMK,Alastair Mack,4,1
12EC5_31,Year 12,ABC,Andrew Clendinning,2,2
12EC5_31,Year 12,ABC,Andrew Clendinning,4,3
12EC6_31,Year 12,ABC,Andrew Clendinning,2,2
12EC6_31,Year 12,ABC,Andrew Clendinning,4,3
12EU6_13,Year 12,BWN,Barry Wilkinson,1,4
12EU6_13,Year 12,BWN,Barry Wilkinson,3,1
12EU6_13,Year 12,BWN,Barry Wilkinson,5,1
13CH6_41,Year 13,BH,Bella,1,1
13CH6_41,Year 13,BH,Bella,3,2
13CH6_41,Year 13,BH,Bella,5,2
13CH5_41,Year 13,BH,Bella,1,3
13CH5_41,Year 13,BH,Bella,3,4
13CH5_41,Year 13,BH,Bella,5,4
12EV6_31,Year 12,CD,Charles,1,3
12EV6_31,Year 12,CD,Charles,3,4
12EV6_31,Year 12,CD,Charles,5,4
13EV6_31,Year 13,CD,Charles,2,3
13EV6_31,Year 13,CD,Charles,4,4
13EV6_32,Year 13,DVX,Danielle Veilleux,2,1
13EV6_32,Year 13,DVX,Danielle Veilleux,4,2
13EU6_11,Year 13,DVX,Danielle Veilleux,2,4
13EU6_11,Year 13,DVX,Danielle Veilleux,4,1
12PH5_42,Year 12,PSO,Patgee Szeto,1,1
12PH5_42,Year 12,PSO,Patgee Szeto,3,2
12PH5_42,Year 12,PSO,Patgee Szeto,5,2
12PH5_41,Year 12,PSO,Patgee Szeto,1,3
12PH5_41,Year 12,PSO,Patgee Szeto,3,4
12PH5_41,Year 12,PSO,Patgee Szeto,5,4
13PPS_1,Year 13,RH,Rosie,1,2
13PPS_1,Year 13,RH,Rosie,3,3
13PPS_1,Year 13,RH,Rosie,5,3
13AA5_52,Year 13,RH,Rosie,1,4
13AA5_52,Year 13,RH,Rosie,3,1
13AA5_52,Year 13,RH,Rosie,5,1
12EV6_41,Year 12,NPP,Nigel Philip,1,1
12EV6_41,Year 12,NPP,Nigel Philip,3,3
12EV6_41,Year 12,NPP,Nigel Philip,5,3
13SS6_41,Year 13,NPP,Nigel Philip,2,4
13SS6_41,Year 13,NPP,Nigel Philip,4,DT
13SS5_41,Year 13,NPP,Nigel Philip,2,4
13SS5_41,Year 13,NPP,Nigel Philip,4,DT
13SA5_21,Year 13,OAC,Obdulio Fonseca,1,3
13SA5_22,Year 13,OAC,Obdulio Fonseca,2,3
13SA5_21,Year 13,OAC,Obdulio Fonseca,3,4
13SA5_22,Year 13,OAC,Obdulio Fonseca,4,4
13SA5_21,Year 13,OAC,Obdulio Fonseca,5,4
13TK7_2,Year 13,PMY,Paul McGoey,1,2
13EU6_12,Year 13,PMY,Paul McGoey,1,3
13TK7_2,Year 13,PMY,Paul McGoey,3,3
13EU6_12,Year 13,PMY,Paul McGoey,3,4
13TK7_2,Year 13,PMY,Paul McGoey,5,3
13EU6_12,Year 13,PMY,Paul McGoey,5,4
13EU6_12,Year 13,PMY,Paul McGoey,5,DT`;