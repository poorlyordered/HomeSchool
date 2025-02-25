import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Student } from '../types';

// Register a standard font
Font.register({
  family: 'Times-Roman',
  src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/times-new-roman@1.0.4/Times-New-Roman-Regular.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Times-Roman'
  },
  header: {
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  schoolInfo: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center'
  },
  studentInfo: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10
  },
  studentName: {
    fontSize: 16,
    marginBottom: 5
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  value: {
    fontSize: 12
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    padding: 5
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 20
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 24,
    fontSize: 10
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold'
  },
  tableCell: {
    width: '16%',
    padding: 5
  },
  tableCellWide: {
    width: '20%',
    padding: 5
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50
  },
  signature: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    paddingTop: 5,
    width: '40%'
  }
});

interface TranscriptPDFProps {
  student: Student;
}

export function TranscriptPDF({ student }: TranscriptPDFProps) {
  const calculateGPA = () => {
    const gradePoints = {
      'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    const totalPoints = student.courses.reduce((sum, course) => 
      sum + (gradePoints[course.grade as keyof typeof gradePoints] * course.creditHours), 0);
    const totalCredits = student.courses.reduce((sum, course) => sum + course.creditHours, 0);
    
    return totalCredits === 0 ? '0.00' : (totalPoints / totalCredits).toFixed(2);
  };

  const coursesByGradeLevel = student.courses.reduce((acc, course) => {
    if (!acc[course.gradeLevel]) {
      acc[course.gradeLevel] = [];
    }
    acc[course.gradeLevel].push(course);
    return acc;
  }, {} as Record<number, typeof student.courses>);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>{student.school.name}</Text>
          <Text style={styles.schoolInfo}>{student.school.address}</Text>
          <Text style={styles.schoolInfo}>{student.school.phone}</Text>
        </View>

        {/* Student Information */}
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.info.name}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Student ID: <Text style={styles.value}>{student.info.id}</Text></Text>
            <Text style={styles.label}>Date of Birth: <Text style={styles.value}>{student.info.birthDate}</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Expected Graduation: <Text style={styles.value}>{student.info.graduationDate}</Text></Text>
            <Text style={styles.label}>Cumulative GPA: <Text style={styles.value}>{calculateGPA()}</Text></Text>
          </View>
        </View>

        {/* Course History */}
        {[9, 10, 11, 12].map(gradeLevel => coursesByGradeLevel[gradeLevel] && (
          <View key={gradeLevel}>
            <Text style={styles.sectionTitle}>{`Grade ${gradeLevel} Courses`}</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCellWide}>Course</Text>
                <Text style={styles.tableCell}>Year</Text>
                <Text style={styles.tableCell}>Semester</Text>
                <Text style={styles.tableCell}>Credits</Text>
                <Text style={styles.tableCell}>Grade</Text>
              </View>
              {coursesByGradeLevel[gradeLevel].map((course, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCellWide}>{course.name}</Text>
                  <Text style={styles.tableCell}>{course.academicYear}</Text>
                  <Text style={styles.tableCell}>{course.semester}</Text>
                  <Text style={styles.tableCell}>{course.creditHours}</Text>
                  <Text style={styles.tableCell}>{course.grade}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Test Scores */}
        <Text style={styles.sectionTitle}>Standardized Test Scores</Text>
        <View style={styles.table}>
          {student.testScores.map((score, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellWide}>{score.type}</Text>
              <Text style={styles.tableCell}>{score.date}</Text>
              <Text style={styles.tableCell}>Total: {score.scores.total}</Text>
              <View style={{ flex: 1 }}>
                {score.scores.sections.map((section, idx) => (
                  <Text key={idx} style={styles.value}>
                    {section.name}: {section.score}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Issue Date: <Text style={styles.value}>{student.transcriptMeta.issueDate}</Text></Text>
          </View>
          <View style={styles.signature}>
            <Text style={styles.value}>{student.transcriptMeta.administrator}</Text>
            <Text style={styles.label}>School Administrator</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}