export type UserRole = 'SuperAdmin' | 'Dean' | 'HOD' | 'Faculty';
export type ProgramLevel = 'UG' | 'PG' | 'Ph.D';
export type SyllabusStatus = 'Draft' | 'Pending HOD Review' | 'Pending Dean Approval' | 'Published';

export interface IntakeStats {
  year: number;
  count: number;
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
}

export interface Syllabus {
  id: string;
  programId: string;
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
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

// Mock Data
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

export const departments: Department[] = [
  // SOEC Departments
  { id: 'dept1', name: 'Civil Engineering', schoolId: 'sch6', hodId: 'hod1' },
  { id: 'dept2', name: 'Computer Application', schoolId: 'sch6', hodId: 'hod2' },
  { id: 'dept3', name: 'Computer Science and Engineering', schoolId: 'sch6' },
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

export const programs: Program[] = [
  // CSE Programs
  {
    id: 'prog1',
    name: 'B.Tech in Computer Science and Engineering',
    level: 'UG',
    duration: 48,
    startYear: 2020,
    departmentId: 'dept3',
    intakeStats: [
      { year: 2021, count: 120 },
      { year: 2022, count: 135 },
      { year: 2023, count: 150 },
      { year: 2024, count: 155 },
      { year: 2025, count: 160 },
    ],
  },
  {
    id: 'prog2',
    name: 'M.Tech in Computer Science and Engineering',
    level: 'PG',
    duration: 24,
    startYear: 2018,
    departmentId: 'dept3',
    intakeStats: [
      { year: 2021, count: 30 },
      { year: 2022, count: 35 },
      { year: 2023, count: 40 },
      { year: 2024, count: 42 },
      { year: 2025, count: 45 },
    ],
  },
  {
    id: 'prog3',
    name: 'Ph.D in Computer Science',
    level: 'Ph.D',
    duration: 36,
    startYear: 2015,
    departmentId: 'dept3',
    intakeStats: [
      { year: 2021, count: 8 },
      { year: 2022, count: 10 },
      { year: 2023, count: 12 },
      { year: 2024, count: 15 },
      { year: 2025, count: 18 },
    ],
  },

  // Civil Engineering Programs
  {
    id: 'prog4',
    name: 'B.Tech in Civil Engineering',
    level: 'UG',
    duration: 48,
    startYear: 2019,
    departmentId: 'dept1',
    intakeStats: [
      { year: 2021, count: 90 },
      { year: 2022, count: 95 },
      { year: 2023, count: 100 },
      { year: 2024, count: 105 },
      { year: 2025, count: 110 },
    ],
  },

  // MCA Program
  {
    id: 'prog5',
    name: 'Master of Computer Applications (MCA)',
    level: 'PG',
    duration: 24,
    startYear: 2017,
    departmentId: 'dept2',
    intakeStats: [
      { year: 2021, count: 60 },
      { year: 2022, count: 65 },
      { year: 2023, count: 70 },
      { year: 2024, count: 75 },
      { year: 2025, count: 80 },
    ],
  },

  // MBA Program
  {
    id: 'prog6',
    name: 'Master of Business Administration (MBA)',
    level: 'PG',
    duration: 24,
    startYear: 2016,
    departmentId: 'dept6',
    intakeStats: [
      { year: 2021, count: 100 },
      { year: 2022, count: 110 },
      { year: 2023, count: 120 },
      { year: 2024, count: 125 },
      { year: 2025, count: 130 },
    ],
  },

  // B.Com Program
  {
    id: 'prog7',
    name: 'Bachelor of Commerce (B.Com)',
    level: 'UG',
    duration: 36,
    startYear: 2018,
    departmentId: 'dept7',
    intakeStats: [
      { year: 2021, count: 80 },
      { year: 2022, count: 85 },
      { year: 2023, count: 90 },
      { year: 2024, count: 95 },
      { year: 2025, count: 100 },
    ],
  },
];

export const users: User[] = [
  { id: 'superadmin1', name: 'Admin User', email: 'admin@university.edu', role: 'SuperAdmin' },
  { id: 'dean1', name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@university.edu', role: 'Dean', schoolId: 'sch6' },
  { id: 'hod1', name: 'Dr. Priya Sharma', email: 'priya.sharma@university.edu', role: 'HOD', schoolId: 'sch6', departmentId: 'dept1' },
  { id: 'hod2', name: 'Dr. Amit Patel', email: 'amit.patel@university.edu', role: 'HOD', schoolId: 'sch6', departmentId: 'dept2' },
  { id: 'faculty1', name: 'Prof. Ananya Singh', email: 'ananya.singh@university.edu', role: 'Faculty', schoolId: 'sch6', departmentId: 'dept3' },
  { id: 'faculty2', name: 'Prof. Rohan Verma', email: 'rohan.verma@university.edu', role: 'Faculty', schoolId: 'sch6', departmentId: 'dept3' },
];

export let syllabi: Syllabus[] = [
  {
    id: 'syl1',
    programId: 'prog1',
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
    programId: 'prog2',
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

// Helper functions
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
