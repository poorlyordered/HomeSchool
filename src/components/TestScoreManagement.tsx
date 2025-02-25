import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';
import type { TestScore } from '../types';

const TEST_TEMPLATES = {
  SAT: [
    { name: 'Math', min: 200, max: 800 },
    { name: 'Evidence-Based Reading and Writing', min: 200, max: 800 }
  ],
  ACT: [
    { name: 'English', min: 1, max: 36 },
    { name: 'Math', min: 1, max: 36 },
    { name: 'Reading', min: 1, max: 36 },
    { name: 'Science', min: 1, max: 36 }
  ]
};

interface TestScoreManagementProps {
  studentId: string;
  onClose: () => void;
  onScoreAdded: () => void;
}

export function TestScoreManagement({ studentId, onClose, onScoreAdded }: TestScoreManagementProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<TestScore, 'id'>>({
    type: 'SAT',
    date: '',
    scores: { total: 0, sections: [] }
  });

  const [sections, setSections] = useState<{ name: string; score: number }[]>(
    TEST_TEMPLATES.SAT.map(template => ({ name: template.name, score: 0 }))
  );

  const validateScore = useCallback((score: number, type: 'SAT' | 'ACT', sectionName: string) => {
    const template = TEST_TEMPLATES[type].find(t => t.name === sectionName);
    if (!template) return false;
    return score >= template.min && score <= template.max;
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate sections
    const invalidSection = sections.find(section => 
      !section.name.trim() || !validateScore(section.score, formData.type, section.name)
    );

    if (invalidSection) {
      const template = TEST_TEMPLATES[formData.type].find(t => t.name === invalidSection.name);
      setError(
        `Invalid score for ${invalidSection.name}. ` +
        `Score must be between ${template?.min} and ${template?.max}.`
      );
      setLoading(false);
      return;
    }

    const totalScore = sections.reduce((sum, section) => sum + section.score, 0);

    const { data: testScore, error: testScoreError } = await supabase
      .from('test_scores')
      .insert([{
        student_id: studentId,
        type: formData.type,
        date: formData.date,
        total_score: totalScore
      }])
      .select()
      .single();

    if (testScoreError) {
      setError(testScoreError.message);
      setLoading(false);
      return;
    }

    const { error: sectionsError } = await supabase
      .from('test_sections')
      .insert(
        sections.map(section => ({
          test_score_id: testScore.id,
          name: section.name,
          score: section.score
        }))
      );

    if (sectionsError) {
      setError(sectionsError.message);
      // Clean up the test score since sections failed
      await supabase.from('test_scores').delete().eq('id', testScore.id);
    } else {
      onScoreAdded();
      onClose();
    }
    setLoading(false);
  }

  const handleTypeChange = useCallback((type: 'SAT' | 'ACT') => {
    setFormData(prev => ({ ...prev, type }));
    setSections(TEST_TEMPLATES[type].map(template => ({
      name: template.name,
      score: 0
    })));
  }, []);

  const updateSection = useCallback((index: number, field: 'name' | 'score', value: string | number) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      [field]: field === 'score' ? Number(value) : value
    };
    setSections(newSections);
  }, [sections]);

  const getScoreHint = useCallback((type: 'SAT' | 'ACT', sectionName: string) => {
    const template = TEST_TEMPLATES[type].find(t => t.name === sectionName);
    if (!template) return '';
    return `(${template.min}-${template.max})`;
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Test Score</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Test Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value as 'SAT' | 'ACT')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="SAT">SAT</option>
              <option value="ACT">ACT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Test Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Test Sections
            </label>
            {sections.map((section, index) => (
              <div key={index} className="flex gap-2">
                <input
                  readOnly
                  type="text"
                  value={section.name}
                  className="flex-1 rounded-md border-gray-300 bg-gray-50"
                />
                <div className="relative w-24">
                  <input
                    type="number"
                    value={section.score}
                    onChange={(e) => updateSection(index, 'score', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="absolute right-2 top-2 text-xs text-gray-500">
                    {getScoreHint(formData.type, section.name)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Test Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}