import { useState, useEffect } from 'react';
import { GraduationCap, School as SchoolIcon, Phone, MapPin, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { signOut } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import type { Student, User } from '../types';

interface StudentDashboardProps {
  user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    async function loadStudentData() {
      const { data: studentData } = await supabase
        .from('students')
        .select(`
          *,
          school:schools(*)
        `)
        .eq('id', user.id)
        .single();

      if (studentData) {
        setStudent({
          ...studentData,
          courses: [],
          testScores: [],
          transcriptMeta: {
            issueDate: new Date().toISOString().split('T')[0],
            administrator: ''
          }
        });
      }
      setLoading(false);
    }

    loadStudentData();
  }, [user.id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!student) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">No Student Record Found</h2>
        <p className="mt-2 text-gray-600">Please contact your guardian to set up your student profile.</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start">
          <div className="space-y-4 flex-grow">
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
          <button
            onClick={async () => {
              try {
                await signOut();
                navigate('/');
              } catch (error) {
                console.error('Error signing out:', error);
              }
            }}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors mt-4"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Read-only course list */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Course History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Grade Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Academic Year</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Semester</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Course</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Credits</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {student.courses.map((course) => (
                    <tr key={course.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-800">{course.gradeLevel}th</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{course.academicYear}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{course.semester}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{course.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{course.creditHours}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{course.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Read-only test scores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Standardized Test Scores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.testScores.map((score) => (
                <div key={score.id} className="border rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{score.type}</h3>
                    <p className="text-sm text-gray-600">{score.date}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Score:</span>
                      <span>{score.scores.total}</span>
                    </div>
                    {score.scores.sections.map((section, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{section.name}:</span>
                        <span>{section.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
