export interface Profile {
  id: string;
  email: string;
  role: 'guardian' | 'student';
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  profile: Profile;
}

export interface School {
  name: string;
  address: string;
  phone: string;
  id: string;
  created_at: string;
}

export interface StudentInfo {
  id: string;
  name: string;
  birthDate: string;
  graduationDate: string;
}

export interface Course {
  id: string;
  name: string;
  gradeLevel: 9 | 10 | 11 | 12;
  academicYear: string;
  semester: 'Fall' | 'Spring';
  creditHours: number;
  grade: string;
}

export interface TranscriptMeta {
  issueDate: string;
  administrator: string;
}

export interface TestScore {
  id: string;
  type: 'ACT' | 'SAT';
  date: string;
  scores: {
    total: number;
    sections: {
      name: string;
      score: number;
    }[];
  };
}

export interface Student {
  school: School;
  info: StudentInfo;
  courses: Course[];
  testScores: TestScore[];
  transcriptMeta: TranscriptMeta;
}