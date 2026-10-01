import React, { useState } from 'react';
import { X, Award, AlertCircle } from 'lucide-react';
import { Student, WidaScore, AssessmentType, GradeLevel } from '../types/eal';
import { createWidaScore } from '../firebase/services';

interface WidaScoreModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WidaScoreModal: React.FC<WidaScoreModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('Annual');
  const [speakingScore, setSpeakingScore] = useState<number>(3.0);
  const [listeningScore, setListeningScore] = useState<number>(3.5);
  const [writingScore, setWritingScore] = useState<number>(2.8);
  const [readingScore, setReadingScore] = useState<number>(3.2);
  const [overallComposite, setOverallComposite] = useState<number>(3.1);
  const [gradeAtAssessment, setGradeAtAssessment] = useState<GradeLevel>(student.gradeLevel);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Re-calculate standard WIDA composite: 35% reading, 35% writing, 15% listening, 15% speaking
  const handleRecalculateComposite = () => {
    const composite = (readingScore * 0.35) + (writingScore * 0.35) + (listeningScore * 0.15) + (speakingScore * 0.15);
    setOverallComposite(Math.round(composite * 10) / 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const scoreData: Omit<WidaScore, 'id'> = {
        studentId: student.studentId,
        assessmentDate,
        assessmentType,
        speakingScore: Number(speakingScore),
        listeningScore: Number(listeningScore),
        writingScore: Number(writingScore),
        readingScore: Number(readingScore),
        overallComposite: Number(overallComposite),
        gradeAtAssessment,
        notes: notes.trim()
      };

      await createWidaScore(scoreData);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to log WIDA score:', err);
      setError('Error saving score: ' + (err instanceof Error ? err.message : String(err)));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Award className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              Log Standardized WIDA Score — {student.firstName} {student.lastName}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assessment Date *</label>
              <input
                type="date"
                required
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 outline-hidden transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assessment Type *</label>
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                className="w-full bg-white border border-slate-300 focus:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium outline-hidden transition-colors"
              >
                <option value="Admissions">Admissions Screener</option>
                <option value="Annual">Annual Summative (ACCESS)</option>
                <option value="Interim">Interim Benchmark</option>
              </select>
            </div>
          </div>

          {/* Domain Scores */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-xs">Domain Scaled Scores (1.0 to 6.0)</span>
              <button
                type="button"
                onClick={handleRecalculateComposite}
                className="text-slate-600 hover:text-slate-900 font-medium text-[11px] underline"
              >
                Auto-calculate Composite
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Speaking Score</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="6.0"
                  value={speakingScore}
                  onChange={(e) => setSpeakingScore(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Listening Score</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="6.0"
                  value={listeningScore}
                  onChange={(e) => setListeningScore(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Reading Score</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="6.0"
                  value={readingScore}
                  onChange={(e) => setReadingScore(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Writing Score</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="6.0"
                  value={writingScore}
                  onChange={(e) => setWritingScore(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Overall Composite Score:</span>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="6.0"
                value={overallComposite}
                onChange={(e) => setOverallComposite(parseFloat(e.target.value) || 1.0)}
                className="w-24 text-right bg-white border border-slate-300 focus:border-slate-800 rounded-lg px-2.5 py-1 text-sm font-bold text-slate-900 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes &amp; Observations</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Test conditions, accommodations provided, strengths observed..."
              className="w-full bg-white border border-slate-300 focus:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 outline-hidden transition-colors"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save WIDA Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
