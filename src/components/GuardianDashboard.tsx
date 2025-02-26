import { useState, useEffect } from 'react';
import { GraduationCap, School as SchoolIcon, Phone, MapPin, FileDown, LogOut } from 'lucide-react';
import { Users } from 'lucide-react';
import { signOut } from '../lib/auth';
import { pdf } from '@react-pdf/renderer';
import { TranscriptPDF } from './TranscriptPDF';
import { supabase } from '../lib/supabase';
import { StudentManagement } from './StudentManagement';
import { GuardianSetup } from './GuardianSetup';
import { CourseList } from './CourseList';
import { TestScores } from './TestScores';
import type { Course, TestScore, Student, User } from '../types';

interface GuardianDashboardProps {
  user: User;
}

export function GuardianDashboard({ user }: GuardianDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [student, setStudent] = useState<Student>({
    school: {
      name: '',
      address: '',
      phone: '',
      id: '', // Added to fix TypeScript error
      created_at: '' // Added to fix TypeScript error
    },
    info: {
      id: 'HS2024001',
      name: 'John Doe',
      birthDate: '2006-05-15',
      graduationDate: '2024-05-30'
    },
    courses: [],
    testScores: [],
    transcriptMeta: {
      issueDate: new Date().toISOString().split('T')[0],
      administrator: user.email || ''
    }
  });

  useEffect(() => {
    async function loadSchool() {
      const { data: schools } = await supabase
        .from('schools')
        .select('*')
        .eq('guardian_id', user.id)
        .limit(1);

      if (!schools?.length) {
        setNeedsSetup(true);
      } else {
        setStudent(prev => ({
          ...prev,
          school: schools[0]
        }));
      }
      setLoading(false);
    }

    loadSchool();
  }, [user.id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (needsSetup) {
    return <GuardianSetup onComplete={() => setNeedsSetup(false)} />;
  }

  // Removed unused handleAddCourse and handleAddScore functions

  const handleEditCourse = (course: Course) => {
    // Implementation for editing a course would go here
    console.log('Edit course', course);
  };

  const handleDeleteCourse = (id: string) => {
    setStudent(prev => ({
      ...prev,
      courses: prev.courses.filter(course => course.id !== id)
    }));
  };

  const handleEditScore = (score: TestScore) => {
    // Implementation for editing a test score would go here
    console.log('Edit score', score);
  };

  const handleDeleteScore = (id: string) => {
    setStudent(prev => ({
      ...prev,
      testScores: prev.testScores.filter(score => score.id !== id)
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Force a page reload to clear React state and re-check authentication
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGeneratePDF = async () => {
    const blob = await pdf(<TranscriptPDF student={student} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.info.name.replace(/\s+/g, '_')}_transcript.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SchoolIcon size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{student.school.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {student.school.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      {student.school.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{student.info.name}</h2>
                <p className="text-sm text-gray-600">Student ID: {student.info.id}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <GraduationCap size={20} className="text-blue-600" />
                  <span className="font-semibold">Expected Graduation: {student.info.graduationDate}</span>
                </div>
                <p className="text-sm text-gray-600">Date of Birth: {student.info.birthDate}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setShowStudentManagement(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Users size={20} />
              Manage Students
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <LogOut size={20} />
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <CourseList
            studentId={student.info.id}
            courses={student.courses}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
          />
          <TestScores
            studentId={student.info.id}
            scores={student.testScores}
            onEditScore={handleEditScore}
            onDeleteScore={handleDeleteScore}
          />
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Issue Date: {student.transcriptMeta.issueDate}</p>
                <p className="text-sm text-gray-600">Administrator: {student.transcriptMeta.administrator}</p>
              </div>
              <button
                onClick={handleGeneratePDF}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <FileDown size={20} />
                Download Official Transcript
              </button>
            </div>
          </div>
        </div>
      </main>
      {showStudentManagement && (
        <StudentManagement
          user={user}
          onClose={() => setShowStudentManagement(false)}
        />
      )}
    </div>
  );
}
