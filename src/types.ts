export interface Profile {
  id: string;
  email: string;
  role: "guardian" | "student";
  name?: string;
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
  semester: "Fall" | "Spring";
  creditHours: number;
  grade: string;
  category?: string; // Added field
  standardCourseId?: string; // Reference to standard course
}

export interface TranscriptMeta {
  issueDate: string;
  administrator: string;
}

export interface TestScore {
  id: string;
  type: "ACT" | "SAT";
  date: string;
  scores: {
    total: number;
    sections: {
      name: string;
      score: number;
    }[];
  };
}

export interface StudentGuardian {
  id: string;
  student_id: string;
  guardian_id: string;
  is_primary: boolean;
  created_at: string;
  guardian?: Profile;
}

export interface StandardCourse {
  id: string;
  name: string;
  category: string;
  isSemester: boolean;
  source: string;
  recommendedGradeLevels?: number[];
  popularityScore?: number;
  userId?: string | null;
  created_at: string;
}

export interface StudentData {
  id: string;
  student_id: string;
  name: string;
  birth_date: string;
  graduation_date: string;
}

export interface Student {
  school: School;
  info: StudentInfo;
  courses: Course[];
  testScores: TestScore[];
  transcriptMeta: TranscriptMeta;
  guardians?: Profile[];
}

export interface Invitation {
  id: string;
  email: string;
  role: "guardian" | "student";
  student_id: string;
  inviter_id: string;
  token: string;
  status: "pending" | "accepted" | "expired";
  created_at: string;
  expires_at: string;
  student?: StudentInfo;
  inviter?: Profile;
}
