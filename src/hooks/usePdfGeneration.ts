import { useState, useCallback, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { TranscriptPDF } from "../components/TranscriptPDF";
import React from "react";
import { handleAndDisplayError } from "../lib/errorHandling";
import type { Student } from "../types";

export interface PDFCustomizationOptions {
  includeTestScores: boolean;
  includeGPA: boolean;
  issueDate: string;
  administratorName: string;
}

export interface PDFPreviewState {
  show: boolean;
  url: string | null;
  loading: boolean;
  error: string | null;
}

export function usePdfGeneration(student: Student) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfPreviewState, setPdfPreviewState] = useState<PDFPreviewState>({
    show: false,
    url: null,
    loading: false,
    error: null,
  });
  const [pdfOptions, setPdfOptions] = useState<PDFCustomizationOptions>({
    includeTestScores: true,
    includeGPA: true,
    issueDate: new Date().toISOString().split("T")[0],
    administratorName: "",
  });

  // Initialize PDF options with user data
  useEffect(() => {
    if (student?.transcriptMeta) {
      setPdfOptions((prev) => ({
        ...prev,
        issueDate: student.transcriptMeta.issueDate,
        administratorName: student.transcriptMeta.administrator,
      }));
    }
  }, [student]);

  // Clean up PDF preview resources
  const cleanupPdfPreview = useCallback(() => {
    if (pdfPreviewState.url) {
      URL.revokeObjectURL(pdfPreviewState.url);
    }
    setPdfPreviewState((prev) => ({
      ...prev,
      show: false,
      url: null,
    }));
  }, [pdfPreviewState.url]);

  // Regenerate PDF preview with new options
  const regeneratePreview = useCallback(
    async (options: PDFCustomizationOptions) => {
      try {
        setPdfLoading(true);

        // If there's an existing preview URL, revoke it
        if (pdfPreviewState.url) {
          URL.revokeObjectURL(pdfPreviewState.url);
        }

        // Update student transcript metadata with customization options
        const studentWithOptions = {
          ...student,
          transcriptMeta: {
            issueDate: options.issueDate,
            administrator: options.administratorName,
          },
          // Filter test scores if option is disabled
          testScores: options.includeTestScores ? student.testScores : [],
        };

        // Generate PDF blob
        const blob = await pdf(
          React.createElement(TranscriptPDF, {
            student: studentWithOptions,
            includeGPA: options.includeGPA,
          }),
        ).toBlob();

        // Create URL for preview
        const url = URL.createObjectURL(blob);
        setPdfPreviewState((prev) => ({
          ...prev,
          url,
          error: null,
        }));

        // Update options state
        setPdfOptions(options);
      } catch (error) {
        console.error("Error regenerating PDF preview:", error);
        setPdfPreviewState((prev) => ({
          ...prev,
          error: "Failed to update PDF preview. Please try again.",
        }));
        return {
          success: false,
          message: "Failed to update PDF preview. Please try again.",
        };
      } finally {
        setPdfLoading(false);
      }
    },
    [student, pdfPreviewState.url],
  );

  // Handle PDF preview generation
  const handlePreviewPDF = useCallback(async () => {
    try {
      setPdfLoading(true);

      // Update student transcript metadata with customization options
      const studentWithOptions = {
        ...student,
        transcriptMeta: {
          issueDate: pdfOptions.issueDate,
          administrator: pdfOptions.administratorName,
        },
        // Filter test scores if option is disabled
        testScores: pdfOptions.includeTestScores ? student.testScores : [],
      };

      // Generate PDF blob
      const blob = await pdf(
        React.createElement(TranscriptPDF, {
          student: studentWithOptions,
          includeGPA: pdfOptions.includeGPA,
        }),
      ).toBlob();

      // Create URL for preview
      const url = URL.createObjectURL(blob);
      setPdfPreviewState({
        show: true,
        url,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      setPdfPreviewState((prev) => ({
        ...prev,
        error: "Failed to generate PDF preview. Please try again.",
      }));
      handleAndDisplayError(error);
      return {
        success: false,
        message: "Failed to generate PDF preview. Please try again.",
      };
    } finally {
      setPdfLoading(false);
    }
  }, [student, pdfOptions]);

  // Handle PDF download
  const handleDownloadPDF = useCallback(async () => {
    try {
      if (pdfPreviewState.url) {
        // If we already have a preview, use that URL
        const link = document.createElement("a");
        link.href = pdfPreviewState.url;
        link.download = `${student.info.name.replace(/\s+/g, "_")}_transcript.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return {
          success: true,
          message: "Transcript downloaded successfully!",
        };
      } else {
        // Otherwise generate a new PDF
        setPdfLoading(true);

        // Update student transcript metadata with customization options
        const studentWithOptions = {
          ...student,
          transcriptMeta: {
            issueDate: pdfOptions.issueDate,
            administrator: pdfOptions.administratorName,
          },
          // Filter test scores if option is disabled
          testScores: pdfOptions.includeTestScores ? student.testScores : [],
        };

        // Generate PDF blob
        const blob = await pdf(
          React.createElement(TranscriptPDF, {
            student: studentWithOptions,
            includeGPA: pdfOptions.includeGPA,
          }),
        ).toBlob();

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${student.info.name.replace(/\s+/g, "_")}_transcript.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return {
          success: true,
          message: "Transcript downloaded successfully!",
        };
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfPreviewState((prev) => ({
        ...prev,
        error: "Failed to generate PDF. Please try again.",
      }));
      handleAndDisplayError(error);
      return {
        success: false,
        message: "Failed to generate PDF. Please try again.",
      };
    } finally {
      setPdfLoading(false);
    }
  }, [student, pdfOptions, pdfPreviewState.url]);

  return {
    pdfLoading,
    pdfPreviewState,
    pdfOptions,
    setPdfOptions,
    cleanupPdfPreview,
    regeneratePreview,
    handlePreviewPDF,
    handleDownloadPDF,
  };
}
