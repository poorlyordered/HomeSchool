import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { handleAndDisplayError } from "../lib/errorHandling";
import type { TestScore } from "../types";

export function useTestScoreData() {
  const [testScoresLoading, setTestScoresLoading] = useState(false);
  const [testScores, setTestScores] = useState<TestScore[]>([]);

  // Function to load test scores for a student
  const loadTestScores = useCallback(async (studentId: string) => {
    setTestScoresLoading(true);

    console.log("Loading test scores for student ID:", studentId);

    try {
      // Load test scores
      const { data: testScoresData, error: testScoresError } = await supabase
        .from("test_scores")
        .select("*")
        .eq("student_id", studentId);

      if (testScoresError) {
        console.error("Error loading test scores:", testScoresError);
        throw testScoresError;
      }

      if (!testScoresData || testScoresData.length === 0) {
        setTestScores([]);
        setTestScoresLoading(false);
        return;
      }

      // Load test sections for each test score
      const transformedTestScores = await Promise.all(
        testScoresData.map(async (testScore) => {
          const { data: sectionsData, error: sectionsError } = await supabase
            .from("test_sections")
            .select("*")
            .eq("test_score_id", testScore.id);

          if (sectionsError) {
            console.error("Error loading test sections:", sectionsError);
            throw sectionsError;
          }

          // Transform the data to match the TestScore type
          const sections = sectionsData.map((section) => ({
            name: section.name,
            score: section.score,
          }));

          return {
            id: testScore.id,
            type: testScore.type as "ACT" | "SAT",
            date: testScore.date,
            scores: {
              total: testScore.total_score,
              sections,
            },
          };
        }),
      );

      console.log("Transformed test scores:", transformedTestScores);
      setTestScores(transformedTestScores);
    } catch (error) {
      handleAndDisplayError(error);
    } finally {
      setTestScoresLoading(false);
    }
  }, []);

  const handleDeleteScore = useCallback(async (id: string) => {
    try {
      // First delete the test sections
      const { error: sectionsError } = await supabase
        .from("test_sections")
        .delete()
        .eq("test_score_id", id);

      if (sectionsError) {
        throw sectionsError;
      }

      // Then delete the test score
      const { error: scoreError } = await supabase
        .from("test_scores")
        .delete()
        .eq("id", id);

      if (scoreError) {
        throw scoreError;
      }

      // Update local state
      setTestScores((prev) => prev.filter((score) => score.id !== id));

      return { success: true, message: "Test score deleted successfully!" };
    } catch (error) {
      handleAndDisplayError(error);
      return {
        success: false,
        message: "Failed to delete test score. Please try again.",
      };
    }
  }, []);

  return {
    testScores,
    testScoresLoading,
    loadTestScores,
    handleDeleteScore,
  };
}
