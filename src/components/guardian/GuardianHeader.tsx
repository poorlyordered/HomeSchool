import {
  GraduationCap,
  School as SchoolIcon,
  Phone,
  MapPin,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import type { User, Student, StudentData } from "../../types";

interface GuardianHeaderProps {
  user: User;
  student: Student;
  students: StudentData[];
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string) => void;
  onManageStudents: () => void;
  onOpenAccountSettings: () => void;
  onLogout: () => void;
}

export function GuardianHeader({
  user,
  student,
  students,
  selectedStudentId,
  setSelectedStudentId,
  onManageStudents,
  onOpenAccountSettings,
  onLogout,
}: GuardianHeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SchoolIcon size={32} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {student.school.name}
                </h1>
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
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Users size={14} />
                  Guardian: {user.profile.name || user.email}
                </div>
              </div>
            </div>
          </div>

          {students.length > 0 ? (
            <>
              {students.length > 1 && (
                <div className="mb-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Student
                  </label>
                  <select
                    value={selectedStudentId || ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedStudentId(id);
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {student.info.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Student ID: {student.info.id}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={20} className="text-blue-600" />
                    <span className="font-semibold">
                      Expected Graduation: {student.info.graduationDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Date of Birth: {student.info.birthDate}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center pt-2 border-t">
              <p className="text-gray-600 italic">
                No students found. Click "Manage Students" to add a student.
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={onManageStudents}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Users size={20} />
            Manage Students
          </button>
          <button
            onClick={onOpenAccountSettings}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Settings size={20} />
            Account Settings
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
