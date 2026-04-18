export type UserRole = 'SuperAdmin' | 'Dean' | 'HOD' | 'Faculty';

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string | any;
  departmentId?: string | any;
  assignedYear?: number;
  assignedYears?: number[];
}

export type ProgramLevel = 'UG' | 'PG' | 'Ph.D';

export interface DocumentFile {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface SyllabusComment {
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}
