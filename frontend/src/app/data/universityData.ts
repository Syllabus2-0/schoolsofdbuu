export type UserRole = 'SuperAdmin' | 'Dean' | 'HOD' | 'Faculty';
export type ProgramLevel = 'UG' | 'PG' | 'Ph.D';
export type SyllabusStatus = 'Draft' | 'Pending HOD Review' | 'Pending Dean Approval' | 'Published';

export interface IntakeStats {
  year: number;
  count: number;
}

export interface Subject {
  id: string;
  name: string;
  programId: string;
  yearLabel: string;   // "Year 1", "Year 2", "Coursework", "Research Area"
  yearOrder: number;   // for sorting (1, 2, 3, 4, 5, 6)
  departmentId: string;
}

export interface FacultyAssignment {
  id: string;
  facultyId: string;
  subjectId: string;
  departmentId: string;
  schoolId: string;
}

export interface Program {
  id: string;
  name: string;
  level: ProgramLevel;
  duration: number; // in months
  startYear: number;
  intakeStats: IntakeStats[];
  departmentId: string;
}

export interface Department {
  id: string;
  name: string;
  schoolId: string;
  hodId?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  deanId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  departmentId?: string;
  assignedYear?: number; // For HOD — which year they manage across programs
}

export interface Syllabus {
  id: string;
  programId: string;
  subjectId?: string;
  facultyId: string;
  status: SyllabusStatus;
  semesters: SemesterData[];
  hodSignature?: string;
  deanSignature?: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface SemesterData {
  semesterNumber: number;
  courses: Course[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'Core' | 'Elective' | 'Lab';
  description: string;
  coDocument?: DocumentFile;
  cloDocument?: DocumentFile;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface DocumentFile {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface POPSODocument {
  id: string;
  type: 'PO' | 'PSO';
  fileName: string;
  uploadedBy: string;
  departmentId: string;
  yearOrder: number;
  uploadedAt: string;
}

// ────────────────────────────────────────────
// Schools
// ────────────────────────────────────────────

export const schools: School[] = [
  { id: 'sch1', name: 'Dr. B.R. Ambedkar Memorial College of Pharmacy and Spirituality', code: 'DBMCPS' },
  { id: 'sch2', name: 'Dr. B.R. Ambedkar School of Architecture', code: 'DBSA' },
  { id: 'sch3', name: 'School of Agriculture', code: 'SOA' },
  { id: 'sch4', name: 'School of Applied Sciences', code: 'SOAS' },
  { id: 'sch5', name: 'School of Design and Performing Arts', code: 'SODAP' },
  { id: 'sch6', name: 'School of Engineering and Computing', code: 'SOEC', deanId: 'dean1' },
  { id: 'sch7', name: 'School of Hotel Management and Tourism', code: 'SOHMT' },
  { id: 'sch8', name: 'School of Journalism, Languages and Arts', code: 'SOJLA' },
  { id: 'sch9', name: 'School of Law', code: 'SOL' },
  { id: 'sch10', name: 'School of Management and Commerce', code: 'SOMC' },
  { id: 'sch11', name: 'School of Nursing', code: 'SON' },
  { id: 'sch12', name: 'School of Paramedical and Research', code: 'SOPR' },
];

// ────────────────────────────────────────────
// Departments
// ────────────────────────────────────────────

export const departments: Department[] = [
  // SOEC Departments
  { id: 'dept1', name: 'Civil Engineering', schoolId: 'sch6', hodId: 'hod1' },
  { id: 'dept2', name: 'Computer Application', schoolId: 'sch6', hodId: 'hod2' },
  { id: 'dept3', name: 'Computer Science and Engineering', schoolId: 'sch6', hodId: 'hod3' },
  { id: 'dept4', name: 'Electrical Engineering', schoolId: 'sch6' },
  { id: 'dept5', name: 'Mechanical Engineering', schoolId: 'sch6' },

  // SOMC Departments
  { id: 'dept6', name: 'Management Studies', schoolId: 'sch10' },
  { id: 'dept7', name: 'Commerce', schoolId: 'sch10' },

  // Other schools
  { id: 'dept8', name: 'Pharmacy', schoolId: 'sch1' },
  { id: 'dept9', name: 'Architecture', schoolId: 'sch2' },
  { id: 'dept10', name: 'Agriculture Science', schoolId: 'sch3' },
];

// ────────────────────────────────────────────
// Programs
// ────────────────────────────────────────────

export const programs: Program[] = [
  // ── CSE — UG ──────────────────────────────
  {
    id: 'prog_cse_core',
    name: 'B.Tech CSE Core',
    level: 'UG',
    duration: 48,
    startYear: 2020,
    departmentId: 'dept3',
    intakeStats: [
      { year: 2021, count: 120 }, { year: 2022, count: 135 },
      { year: 2023, count: 150 }, { year: 2024, count: 155 }, { year: 2025, count: 160 },
    ],
  },
  {
    id: 'prog_cse_aiml',
    name: 'B.Tech CSE AI/ML',
    level: 'UG',
    duration: 48,
    startYear: 2021,
    departmentId: 'dept3',
    intakeStats: [
      { year: 2021, count: 60 }, { year: 2022, count: 75 },
      { year: 2023, count: 90 }, { year: 2024, count: 100 }, { year: 2025, count: 110 },
    ],
  },
  {
    id: 'prog_cse_ds',
    name: 'B.Tech CSE Data Science',
    level: 'UG',
    duration: 48,
    startYear: 2022,
    departmentId: 'dept3',
    intakeStats: [
      { year: 2022, count: 40 }, { year: 2023, count: 55 },
      { year: 2024, count: 70 }, { year: 2025, count: 80 },
    ],
  },

  // ── CSE — PG ──────────────────────────────
  {
    id: 'prog_mtech_core',
    name: 'M.Tech CSE Core',
    level: 'PG',
    duration: 24,
    startYear: 2018,
    departmentId: 'dept3',
    intakeStats: [
      { year: 2021, count: 30 }, { year: 2022, count: 35 },
      { year: 2023, count: 40 }, { year: 2024, count: 42 }, { year: 2025, count: 45 },
    ],
  },
  {
    id: 'prog_mtech_aiml',
    name: 'M.Tech AI/ML',
    level: 'PG',
    duration: 24,
    startYear: 2020,
    departmentId: 'dept3',
    intakeStats: [
      { year: 2021, count: 20 }, { year: 2022, count: 25 },
      { year: 2023, count: 30 }, { year: 2024, count: 35 }, { year: 2025, count: 38 },
    ],
  },
  {
    id: 'prog_mtech_ds',
    name: 'M.Tech Data Science',
    level: 'PG',
    duration: 24,
    startYear: 2021,
    departmentId: 'dept3',
    intakeStats: [
      { year: 2022, count: 15 }, { year: 2023, count: 22 },
      { year: 2024, count: 28 }, { year: 2025, count: 32 },
    ],
  },

  // ── CSE — Ph.D ────────────────────────────
  {
    id: 'prog_phd_cs',
    name: 'Ph.D in Computer Science',
    level: 'Ph.D',
    duration: 36,
    startYear: 2015,
    departmentId: 'dept3',
    intakeStats: [
      { year: 2021, count: 8 }, { year: 2022, count: 10 },
      { year: 2023, count: 12 }, { year: 2024, count: 15 }, { year: 2025, count: 18 },
    ],
  },

  // ── Civil Engineering ─────────────────────
  {
    id: 'prog_civil_core',
    name: 'B.Tech Civil Engineering',
    level: 'UG',
    duration: 48,
    startYear: 2019,
    departmentId: 'dept1',
    intakeStats: [
      { year: 2021, count: 90 }, { year: 2022, count: 95 },
      { year: 2023, count: 100 }, { year: 2024, count: 105 }, { year: 2025, count: 110 },
    ],
  },

  // ── Computer Application ──────────────────
  {
    id: 'prog_mca',
    name: 'Master of Computer Applications (MCA)',
    level: 'PG',
    duration: 24,
    startYear: 2017,
    departmentId: 'dept2',
    intakeStats: [
      { year: 2021, count: 60 }, { year: 2022, count: 65 },
      { year: 2023, count: 70 }, { year: 2024, count: 75 }, { year: 2025, count: 80 },
    ],
  },

  // ── Management Studies ────────────────────
  {
    id: 'prog_mba',
    name: 'Master of Business Administration (MBA)',
    level: 'PG',
    duration: 24,
    startYear: 2016,
    departmentId: 'dept6',
    intakeStats: [
      { year: 2021, count: 100 }, { year: 2022, count: 110 },
      { year: 2023, count: 120 }, { year: 2024, count: 125 }, { year: 2025, count: 130 },
    ],
  },

  // ── Commerce ──────────────────────────────
  {
    id: 'prog_bcom',
    name: 'Bachelor of Commerce (B.Com)',
    level: 'UG',
    duration: 36,
    startYear: 2018,
    departmentId: 'dept7',
    intakeStats: [
      { year: 2021, count: 80 }, { year: 2022, count: 85 },
      { year: 2023, count: 90 }, { year: 2024, count: 95 }, { year: 2025, count: 100 },
    ],
  },
];

// ────────────────────────────────────────────
// Subjects — organized by Program → Year → Subject
// ────────────────────────────────────────────

export const subjects: Subject[] = [
  // ═══════════════════════════════════════════
  // B.Tech CSE Core — 4 Years × 3 Subjects
  // ═══════════════════════════════════════════
  { id: 'sub_cc_1_1', name: 'Programming Fundamentals',   programId: 'prog_cse_core', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_cc_1_2', name: 'Engineering Mathematics',    programId: 'prog_cse_core', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_cc_1_3', name: 'Basic Electronics',          programId: 'prog_cse_core', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },

  { id: 'sub_cc_2_1', name: 'Data Structures',            programId: 'prog_cse_core', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_cc_2_2', name: 'Operating Systems',          programId: 'prog_cse_core', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_cc_2_3', name: 'Discrete Mathematics',       programId: 'prog_cse_core', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },

  { id: 'sub_cc_3_1', name: 'DBMS',                       programId: 'prog_cse_core', yearLabel: 'Year 3', yearOrder: 3, departmentId: 'dept3' },
  { id: 'sub_cc_3_2', name: 'Computer Networks',          programId: 'prog_cse_core', yearLabel: 'Year 3', yearOrder: 3, departmentId: 'dept3' },
  { id: 'sub_cc_3_3', name: 'Software Engineering',       programId: 'prog_cse_core', yearLabel: 'Year 3', yearOrder: 3, departmentId: 'dept3' },

  { id: 'sub_cc_4_1', name: 'Machine Learning',           programId: 'prog_cse_core', yearLabel: 'Year 4', yearOrder: 4, departmentId: 'dept3' },
  { id: 'sub_cc_4_2', name: 'Distributed Systems',        programId: 'prog_cse_core', yearLabel: 'Year 4', yearOrder: 4, departmentId: 'dept3' },
  { id: 'sub_cc_4_3', name: 'Project Work',               programId: 'prog_cse_core', yearLabel: 'Year 4', yearOrder: 4, departmentId: 'dept3' },

  // ═══════════════════════════════════════════
  // B.Tech CSE AI/ML — 4 Years × 3 Subjects
  // ═══════════════════════════════════════════
  { id: 'sub_ai_1_1', name: 'Programming Fundamentals',   programId: 'prog_cse_aiml', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_ai_1_2', name: 'Engineering Mathematics',    programId: 'prog_cse_aiml', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_ai_1_3', name: 'Basic Electronics',          programId: 'prog_cse_aiml', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },

  { id: 'sub_ai_2_1', name: 'Data Structures',            programId: 'prog_cse_aiml', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_ai_2_2', name: 'Operating Systems',          programId: 'prog_cse_aiml', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_ai_2_3', name: 'Probability & Statistics',   programId: 'prog_cse_aiml', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },

  { id: 'sub_ai_3_1', name: 'DBMS',                       programId: 'prog_cse_aiml', yearLabel: 'Year 3', yearOrder: 3, departmentId: 'dept3' },
  { id: 'sub_ai_3_2', name: 'Machine Learning',           programId: 'prog_cse_aiml', yearLabel: 'Year 3', yearOrder: 3, departmentId: 'dept3' },
  { id: 'sub_ai_3_3', name: 'Artificial Intelligence',    programId: 'prog_cse_aiml', yearLabel: 'Year 3', yearOrder: 3, departmentId: 'dept3' },

  { id: 'sub_ai_4_1', name: 'Deep Learning',              programId: 'prog_cse_aiml', yearLabel: 'Year 4', yearOrder: 4, departmentId: 'dept3' },
  { id: 'sub_ai_4_2', name: 'NLP',                        programId: 'prog_cse_aiml', yearLabel: 'Year 4', yearOrder: 4, departmentId: 'dept3' },
  { id: 'sub_ai_4_3', name: 'AI Project',                 programId: 'prog_cse_aiml', yearLabel: 'Year 4', yearOrder: 4, departmentId: 'dept3' },

  // ═══════════════════════════════════════════
  // B.Tech CSE Data Science — 4 Years × 3 Subjects
  // ═══════════════════════════════════════════
  { id: 'sub_ds_1_1', name: 'Programming Fundamentals',   programId: 'prog_cse_ds', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_ds_1_2', name: 'Engineering Mathematics',    programId: 'prog_cse_ds', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_ds_1_3', name: 'Basic Electronics',          programId: 'prog_cse_ds', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },

  { id: 'sub_ds_2_1', name: 'Data Structures',            programId: 'prog_cse_ds', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_ds_2_2', name: 'Operating Systems',          programId: 'prog_cse_ds', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_ds_2_3', name: 'Statistics',                 programId: 'prog_cse_ds', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },

  { id: 'sub_ds_3_1', name: 'DBMS',                       programId: 'prog_cse_ds', yearLabel: 'Year 3', yearOrder: 3, departmentId: 'dept3' },
  { id: 'sub_ds_3_2', name: 'Data Mining',                programId: 'prog_cse_ds', yearLabel: 'Year 3', yearOrder: 3, departmentId: 'dept3' },
  { id: 'sub_ds_3_3', name: 'Big Data Analytics',         programId: 'prog_cse_ds', yearLabel: 'Year 3', yearOrder: 3, departmentId: 'dept3' },

  { id: 'sub_ds_4_1', name: 'Data Visualization',         programId: 'prog_cse_ds', yearLabel: 'Year 4', yearOrder: 4, departmentId: 'dept3' },
  { id: 'sub_ds_4_2', name: 'Cloud Computing',            programId: 'prog_cse_ds', yearLabel: 'Year 4', yearOrder: 4, departmentId: 'dept3' },
  { id: 'sub_ds_4_3', name: 'Data Science Project',       programId: 'prog_cse_ds', yearLabel: 'Year 4', yearOrder: 4, departmentId: 'dept3' },

  // ═══════════════════════════════════════════
  // M.Tech CSE Core — 2 Years × 3 Subjects
  // ═══════════════════════════════════════════
  { id: 'sub_mc_1_1', name: 'Advanced Data Structures',     programId: 'prog_mtech_core', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_mc_1_2', name: 'Advanced Operating Systems',   programId: 'prog_mtech_core', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_mc_1_3', name: 'Research Methodology',         programId: 'prog_mtech_core', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },

  { id: 'sub_mc_2_1', name: 'Distributed Systems',          programId: 'prog_mtech_core', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_mc_2_2', name: 'Cloud Computing',              programId: 'prog_mtech_core', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_mc_2_3', name: 'Thesis',                       programId: 'prog_mtech_core', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },

  // ═══════════════════════════════════════════
  // M.Tech AI/ML — 2 Years × 3 Subjects
  // ═══════════════════════════════════════════
  { id: 'sub_ma_1_1', name: 'Machine Learning',          programId: 'prog_mtech_aiml', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_ma_1_2', name: 'Deep Learning',             programId: 'prog_mtech_aiml', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_ma_1_3', name: 'Statistical Methods',       programId: 'prog_mtech_aiml', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },

  { id: 'sub_ma_2_1', name: 'NLP',                       programId: 'prog_mtech_aiml', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_ma_2_2', name: 'Computer Vision',           programId: 'prog_mtech_aiml', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_ma_2_3', name: 'Thesis',                    programId: 'prog_mtech_aiml', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },

  // ═══════════════════════════════════════════
  // M.Tech Data Science — 2 Years × 3 Subjects
  // ═══════════════════════════════════════════
  { id: 'sub_md_1_1', name: 'Data Analytics',            programId: 'prog_mtech_ds', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_md_1_2', name: 'Big Data',                  programId: 'prog_mtech_ds', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_md_1_3', name: 'Statistical Modeling',      programId: 'prog_mtech_ds', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept3' },

  { id: 'sub_md_2_1', name: 'Data Visualization',        programId: 'prog_mtech_ds', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_md_2_2', name: 'AI in Data Science',        programId: 'prog_mtech_ds', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_md_2_3', name: 'Thesis',                    programId: 'prog_mtech_ds', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept3' },

  // ═══════════════════════════════════════════
  // Ph.D in Computer Science — Coursework + Research Area
  // ═══════════════════════════════════════════
  { id: 'sub_phd_cw_1', name: 'Research Methodology',      programId: 'prog_phd_cs', yearLabel: 'Coursework',    yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_phd_cw_2', name: 'Advanced Topics in AI',     programId: 'prog_phd_cs', yearLabel: 'Coursework',    yearOrder: 1, departmentId: 'dept3' },
  { id: 'sub_phd_cw_3', name: 'Seminar',                   programId: 'prog_phd_cs', yearLabel: 'Coursework',    yearOrder: 1, departmentId: 'dept3' },

  { id: 'sub_phd_ra_1', name: 'Artificial Intelligence',   programId: 'prog_phd_cs', yearLabel: 'Research Area', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_phd_ra_2', name: 'Data Science',              programId: 'prog_phd_cs', yearLabel: 'Research Area', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_phd_ra_3', name: 'Systems',                   programId: 'prog_phd_cs', yearLabel: 'Research Area', yearOrder: 2, departmentId: 'dept3' },
  { id: 'sub_phd_ra_4', name: 'Thesis',                    programId: 'prog_phd_cs', yearLabel: 'Research Area', yearOrder: 2, departmentId: 'dept3' },

  // ═══════════════════════════════════════════
  // Civil Engineering — minimal data
  // ═══════════════════════════════════════════
  { id: 'sub_ce_1_1', name: 'Engineering Mechanics',     programId: 'prog_civil_core', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept1' },
  { id: 'sub_ce_1_2', name: 'Surveying',                 programId: 'prog_civil_core', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept1' },
  { id: 'sub_ce_2_1', name: 'Structural Analysis',       programId: 'prog_civil_core', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept1' },
  { id: 'sub_ce_2_2', name: 'Geotechnical Engineering',  programId: 'prog_civil_core', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept1' },

  // ═══════════════════════════════════════════
  // MCA — minimal data
  // ═══════════════════════════════════════════
  { id: 'sub_mca_1_1', name: 'Web Technologies',    programId: 'prog_mca', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept2' },
  { id: 'sub_mca_1_2', name: 'Database Systems',    programId: 'prog_mca', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept2' },
  { id: 'sub_mca_2_1', name: 'Cloud Computing',     programId: 'prog_mca', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept2' },
  { id: 'sub_mca_2_2', name: 'Project Work',        programId: 'prog_mca', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept2' },

  // ═══════════════════════════════════════════
  // MBA — minimal data
  // ═══════════════════════════════════════════
  { id: 'sub_mba_1_1', name: 'Financial Management',           programId: 'prog_mba', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept6' },
  { id: 'sub_mba_1_2', name: 'Marketing Strategy',             programId: 'prog_mba', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept6' },
  { id: 'sub_mba_2_1', name: 'Applied Economics and Computing', programId: 'prog_mba', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept6' },
  { id: 'sub_mba_2_2', name: 'Strategic Management',           programId: 'prog_mba', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept6' },

  // ═══════════════════════════════════════════
  // B.Com — minimal data
  // ═══════════════════════════════════════════
  { id: 'sub_bc_1_1', name: 'Accounting Principles', programId: 'prog_bcom', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept7' },
  { id: 'sub_bc_1_2', name: 'Business Law',          programId: 'prog_bcom', yearLabel: 'Year 1', yearOrder: 1, departmentId: 'dept7' },
  { id: 'sub_bc_2_1', name: 'Corporate Finance',     programId: 'prog_bcom', yearLabel: 'Year 2', yearOrder: 2, departmentId: 'dept7' },
];

// ────────────────────────────────────────────
// Faculty Assignments — cross-school teaching
// ────────────────────────────────────────────

export let facultyAssignments: FacultyAssignment[] = [
  // Prof. Ananya Singh — teaches in SOEC (CSE) AND SOMC (Management Studies)
  { id: 'fa1', facultyId: 'faculty1', subjectId: 'sub_cc_2_1', departmentId: 'dept3', schoolId: 'sch6' },  // Data Structures (CSE Core Y2)
  { id: 'fa2', facultyId: 'faculty1', subjectId: 'sub_ai_2_1', departmentId: 'dept3', schoolId: 'sch6' },  // Data Structures (CSE AI/ML Y2)
  { id: 'fa3', facultyId: 'faculty1', subjectId: 'sub_mba_2_1', departmentId: 'dept6', schoolId: 'sch10' }, // Applied Economics (SOMC)

  // Prof. Rohan Verma — teaches in SOEC (CSE) only
  { id: 'fa4', facultyId: 'faculty2', subjectId: 'sub_cc_3_1', departmentId: 'dept3', schoolId: 'sch6' },  // DBMS (CSE Core Y3)
  { id: 'fa5', facultyId: 'faculty2', subjectId: 'sub_ai_3_2', departmentId: 'dept3', schoolId: 'sch6' },  // Machine Learning (CSE AI/ML Y3)
  { id: 'fa6', facultyId: 'faculty2', subjectId: 'sub_mc_1_1', departmentId: 'dept3', schoolId: 'sch6' },  // Adv DS (M.Tech Core Y1)
];

// ────────────────────────────────────────────
// Users
// ────────────────────────────────────────────

export let users: User[] = [
  { id: 'superadmin1', name: 'Admin User', email: 'admin@university.edu', role: 'SuperAdmin' },
  { id: 'dean1', name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@university.edu', role: 'Dean', schoolId: 'sch6' },
  { id: 'hod1', name: 'Dr. Priya Sharma', email: 'priya.sharma@university.edu', role: 'HOD', schoolId: 'sch6', departmentId: 'dept1', assignedYear: 2 },
  { id: 'hod2', name: 'Dr. Amit Patel', email: 'amit.patel@university.edu', role: 'HOD', schoolId: 'sch6', departmentId: 'dept2', assignedYear: 1 },
  { id: 'hod3', name: 'Dr. Neha Gupta', email: 'neha.gupta@university.edu', role: 'HOD', schoolId: 'sch6', departmentId: 'dept3', assignedYear: 2 },
  { id: 'faculty1', name: 'Prof. Ananya Singh', email: 'ananya.singh@university.edu', role: 'Faculty', schoolId: 'sch6', departmentId: 'dept3' },
  { id: 'faculty2', name: 'Prof. Rohan Verma', email: 'rohan.verma@university.edu', role: 'Faculty', schoolId: 'sch6', departmentId: 'dept3' },
  { id: 'faculty3', name: 'Prof. Deepak Kumar', email: 'deepak.kumar@university.edu', role: 'Faculty', schoolId: 'sch6', departmentId: 'dept3' },
  { id: 'faculty4', name: 'Prof. Sonia Mehta', email: 'sonia.mehta@university.edu', role: 'Faculty', schoolId: 'sch6', departmentId: 'dept1' },
  { id: 'faculty5', name: 'Prof. Vikash Yadav', email: 'vikash.yadav@university.edu', role: 'Faculty', schoolId: 'sch10', departmentId: 'dept6' },
];

// ────────────────────────────────────────────
// PO/PSO Documents
// ────────────────────────────────────────────

export let popsoDocuments: POPSODocument[] = [];

// ────────────────────────────────────────────
// Syllabi
// ────────────────────────────────────────────

export let syllabi: Syllabus[] = [
  {
    id: 'syl1',
    programId: 'prog_cse_core',
    facultyId: 'faculty1',
    status: 'Pending HOD Review',
    semesters: [
      {
        semesterNumber: 1,
        courses: [
          { id: 'c1', code: 'CS101', name: 'Programming Fundamentals', credits: 4, type: 'Core', description: 'Introduction to programming using C/C++' },
          { id: 'c2', code: 'MA101', name: 'Engineering Mathematics I', credits: 4, type: 'Core', description: 'Calculus and Linear Algebra' },
          { id: 'c3', code: 'PH101', name: 'Engineering Physics', credits: 3, type: 'Core', description: 'Fundamentals of Physics' },
        ],
      },
      {
        semesterNumber: 2,
        courses: [
          { id: 'c4', code: 'CS102', name: 'Data Structures', credits: 4, type: 'Core', description: 'Arrays, Linked Lists, Trees, Graphs' },
          { id: 'c5', code: 'MA102', name: 'Engineering Mathematics II', credits: 4, type: 'Core', description: 'Differential Equations and Probability' },
        ],
      },
    ],
    hodSignature: undefined,
    deanSignature: undefined,
    comments: [
      {
        id: 'com1',
        userId: 'faculty1',
        userName: 'Prof. Ananya Singh',
        text: 'Initial draft submitted for review',
        timestamp: '2026-04-10T10:30:00Z',
      },
    ],
    createdAt: '2026-04-10T10:30:00Z',
    updatedAt: '2026-04-10T10:30:00Z',
  },
  {
    id: 'syl2',
    programId: 'prog_mtech_core',
    facultyId: 'faculty2',
    status: 'Published',
    semesters: [
      {
        semesterNumber: 1,
        courses: [
          { id: 'c6', code: 'CS501', name: 'Advanced Algorithms', credits: 4, type: 'Core', description: 'Algorithm design and analysis' },
          { id: 'c7', code: 'CS502', name: 'Machine Learning', credits: 4, type: 'Core', description: 'Supervised and unsupervised learning' },
        ],
      },
    ],
    hodSignature: 'Dr. Priya Sharma',
    deanSignature: 'Dr. Rajesh Kumar',
    comments: [],
    createdAt: '2026-03-15T14:20:00Z',
    updatedAt: '2026-04-01T09:15:00Z',
  },
];

// ────────────────────────────────────────────
// Helper functions
// ────────────────────────────────────────────

export function getSchoolById(id: string): School | undefined {
  return schools.find(s => s.id === id);
}

export function getDepartmentById(id: string): Department | undefined {
  return departments.find(d => d.id === id);
}

export function getProgramById(id: string): Program | undefined {
  return programs.find(p => p.id === id);
}

export function getDepartmentsBySchool(schoolId: string): Department[] {
  return departments.filter(d => d.schoolId === schoolId);
}

export function getProgramsByDepartment(departmentId: string): Program[] {
  return programs.filter(p => p.departmentId === departmentId);
}

export function getSubjectsByProgram(programId: string): Subject[] {
  return subjects.filter(s => s.programId === programId);
}

export function getSubjectsByDepartment(departmentId: string): Subject[] {
  return subjects.filter(s => s.departmentId === departmentId);
}

export function getSubjectById(id: string): Subject | undefined {
  return subjects.find(s => s.id === id);
}

export function getFacultyAssignments(facultyId: string): FacultyAssignment[] {
  return facultyAssignments.filter(fa => fa.facultyId === facultyId);
}

/**
 * Groups programs under a department by level (UG / PG / Ph.D).
 */
export function getProgramsByDepartmentGrouped(departmentId: string): Partial<Record<ProgramLevel, Program[]>> {
  const deptPrograms = getProgramsByDepartment(departmentId);
  const grouped: Partial<Record<ProgramLevel, Program[]>> = {};
  for (const prog of deptPrograms) {
    if (!grouped[prog.level]) grouped[prog.level] = [];
    grouped[prog.level]!.push(prog);
  }
  return grouped;
}

/**
 * Groups subjects of a program by yearLabel, sorted by yearOrder.
 * Returns an ordered array of { yearLabel, yearOrder, subjects[] }.
 */
export function getSubjectsByProgramGroupedByYear(programId: string): { yearLabel: string; yearOrder: number; subjects: Subject[] }[] {
  const progSubjects = getSubjectsByProgram(programId);
  const map = new Map<string, { yearLabel: string; yearOrder: number; subjects: Subject[] }>();

  for (const sub of progSubjects) {
    if (!map.has(sub.yearLabel)) {
      map.set(sub.yearLabel, { yearLabel: sub.yearLabel, yearOrder: sub.yearOrder, subjects: [] });
    }
    map.get(sub.yearLabel)!.subjects.push(sub);
  }

  return Array.from(map.values()).sort((a, b) => a.yearOrder - b.yearOrder);
}

/**
 * For HOD: filters subjects to only the assigned year.
 */
export function getSubjectsByProgramForYear(programId: string, yearOrder: number): { yearLabel: string; yearOrder: number; subjects: Subject[] }[] {
  return getSubjectsByProgramGroupedByYear(programId).filter(g => g.yearOrder === yearOrder);
}

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function getSyllabusByProgram(programId: string): Syllabus | undefined {
  return syllabi.find(s => s.programId === programId);
}

export function updateSyllabus(syllabusId: string, updates: Partial<Syllabus>): void {
  const index = syllabi.findIndex(s => s.id === syllabusId);
  if (index !== -1) {
    syllabi[index] = { ...syllabi[index], ...updates, updatedAt: new Date().toISOString() };
  }
}

export function addComment(syllabusId: string, comment: Comment): void {
  const syllabus = syllabi.find(s => s.id === syllabusId);
  if (syllabus) {
    syllabus.comments.push(comment);
    syllabus.updatedAt = new Date().toISOString();
  }
}

// ────────────────────────────────────────────
// Mutation functions — CRUD operations
// ────────────────────────────────────────────

export function getUsersByRole(role: UserRole): User[] {
  return users.filter(u => u.role === role);
}

export function addSchool(school: School): void {
  schools.push(school);
}

export function assignDean(schoolId: string, userId: string): void {
  const school = schools.find(s => s.id === schoolId);
  if (school) {
    // Remove dean role from previous dean if exists
    if (school.deanId) {
      const prevDean = users.find(u => u.id === school.deanId);
      if (prevDean) {
        prevDean.schoolId = undefined;
      }
    }
    school.deanId = userId;
    const user = users.find(u => u.id === userId);
    if (user) {
      user.role = 'Dean';
      user.schoolId = schoolId;
    }
  }
}

export function removeDean(schoolId: string): void {
  const school = schools.find(s => s.id === schoolId);
  if (school && school.deanId) {
    school.deanId = undefined;
  }
}

export function addDepartment(dept: Department): void {
  departments.push(dept);
}

export function addProgram(program: Program): void {
  programs.push(program);
}

export function assignHOD(deptId: string, userId: string, year: number): void {
  const dept = departments.find(d => d.id === deptId);
  if (dept) {
    dept.hodId = userId;
    const user = users.find(u => u.id === userId);
    if (user) {
      user.role = 'HOD';
      user.schoolId = dept.schoolId;
      user.departmentId = deptId;
      user.assignedYear = year;
    }
  }
}

export function removeHOD(deptId: string): void {
  const dept = departments.find(d => d.id === deptId);
  if (dept) {
    dept.hodId = undefined;
  }
}

export function assignTeacher(assignment: FacultyAssignment): void {
  // Remove existing assignment for same subject if exists
  facultyAssignments = facultyAssignments.filter(fa => fa.subjectId !== assignment.subjectId);
  facultyAssignments.push(assignment);
}

export function removeTeacherAssignment(assignmentId: string): void {
  facultyAssignments = facultyAssignments.filter(fa => fa.id !== assignmentId);
}

export function getTeacherForSubject(subjectId: string): FacultyAssignment | undefined {
  return facultyAssignments.find(fa => fa.subjectId === subjectId);
}

export function uploadPOPSO(doc: POPSODocument): void {
  // Replace if same type + dept + year exists
  popsoDocuments = popsoDocuments.filter(
    d => !(d.type === doc.type && d.departmentId === doc.departmentId && d.yearOrder === doc.yearOrder)
  );
  popsoDocuments.push(doc);
}

export function getPOPSODocuments(departmentId: string, yearOrder: number): POPSODocument[] {
  return popsoDocuments.filter(d => d.departmentId === departmentId && d.yearOrder === yearOrder);
}

export function addUser(user: User): void {
  users.push(user);
}
