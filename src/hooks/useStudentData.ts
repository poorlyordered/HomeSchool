import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { handleAndDisplayError } from "../lib/errorHandling";
import type { User, StudentData } from "../types";

export function useStudentData(user: User) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [needsSetup, setNeedsSetup] = useState(false);

  const loadStudents = useCallback(async () => {
    // First check if the student_guardians table exists
    let useJunctionTable = false;
    try {
      // Try to get the table info to see if it exists
      const { error: tableCheckError } = await supabase
        .from("student_guardians")
        .select("id")
        .limit(1);

      // If no error, the table exists
      if (!tableCheckError) {
        useJunctionTable = true;
      }
    } catch (err) {
      // Log but don't display to user as this is just a check
      console.log(
        "student_guardians table does not exist yet, using legacy approach",
        err,
      );
    }

    if (useJunctionTable) {
      try {
        // Load students from the student_guardians junction table
        const { data: guardianData, error: guardianError } = await supabase
          .from("student_guardians")
          .select(
            `
            student_id,
            is_primary,
            students(id, student_id, name, birth_date, graduation_date)
          `,
          )
          .eq("guardian_id", user.id);

        if (guardianError) {
          throw guardianError;
        }

        if (guardianData && guardianData.length > 0) {
          // Extract student data from the nested structure
          const processedStudents: StudentData[] = [];

          for (const item of guardianData) {
            // Safely access nested properties with type assertion
            const studentObj = item.students;

            if (studentObj && typeof studentObj === "object") {
              // Use type assertion with unknown first to avoid TypeScript errors
              const typedStudentObj = studentObj as unknown as {
                id: string;
                student_id: string;
                name: string;
                birth_date: string;
                graduation_date: string;
              };

              processedStudents.push({
                id: typedStudentObj.id,
                student_id: typedStudentObj.student_id,
                name: typedStudentObj.name,
                birth_date: typedStudentObj.birth_date,
                graduation_date: typedStudentObj.graduation_date,
              });
            }
          }

          if (processedStudents.length > 0) {
            setStudents(processedStudents);

            // Select the first student by default if none is selected
            if (!selectedStudentId) {
              // Find primary student if available
              const primaryItem = guardianData.find((item) => item.is_primary);
              let firstStudent: StudentData;

              if (primaryItem && primaryItem.students) {
                // Use type assertion with unknown first to avoid TypeScript errors
                const typedPrimaryStudentObj =
                  primaryItem.students as unknown as {
                    id: string;
                    student_id: string;
                    name: string;
                    birth_date: string;
                    graduation_date: string;
                  };

                firstStudent = {
                  id: typedPrimaryStudentObj.id,
                  student_id: typedPrimaryStudentObj.student_id,
                  name: typedPrimaryStudentObj.name,
                  birth_date: typedPrimaryStudentObj.birth_date,
                  graduation_date: typedPrimaryStudentObj.graduation_date,
                };
              } else {
                firstStudent = processedStudents[0];
              }

              setSelectedStudentId(firstStudent.id);
            }
          }

          return;
        }
      } catch (error) {
        handleAndDisplayError(error, "useStudentData.loadStudents.junction");
      }
    }

    // Fallback to the old method if the junction table doesn't exist yet or had an error
    try {
      const { data: legacyData, error: legacyError } = await supabase
        .from("students")
        .select("*")
        .eq("guardian_id", user.id);

      if (legacyError) {
        throw legacyError;
      }

      if (legacyData && legacyData.length > 0) {
        setStudents(legacyData);
        // Select the first student by default if none is selected
        if (!selectedStudentId) {
          setSelectedStudentId(legacyData[0].id);
        }
      }
    } catch (error) {
      handleAndDisplayError(error, "useStudentData.loadStudents.legacy");
    } finally {
      setLoading(false);
    }
  }, [user.id, selectedStudentId]);

  // Load school data and check if setup is needed
  useEffect(() => {
    async function loadData() {
      try {
        // Load school data
        const { data: schools, error: schoolsError } = await supabase
          .from("schools")
          .select("*")
          .eq("guardian_id", user.id)
          .limit(1);

        if (schoolsError) {
          throw schoolsError;
        }

        if (!schools?.length) {
          setNeedsSetup(true);
          setLoading(false);
          return;
        }

        // Load student data
        await loadStudents();
      } catch (error) {
        handleAndDisplayError(error, "useStudentData.loadData");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user.id, loadStudents]);

  return {
    loading,
    students,
    selectedStudentId,
    setSelectedStudentId,
    needsSetup,
    loadStudents,
  };
}
