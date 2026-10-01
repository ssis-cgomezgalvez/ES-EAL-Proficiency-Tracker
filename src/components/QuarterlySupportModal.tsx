import React, { useState } from 'react';
import { X, Layers, AlertCircle } from 'lucide-react';
import { Student, SupportLevel, QuarterlySupport } from '../types/eal';
import { createQuarterlySupport } from '../firebase/services';

interface QuarterlySupportModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuarterlySupportModal: React.FC<QuarterlySupportModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [quarter, setQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [supportLevel, setSupportLevel] = useState<SupportLevel>(student.currentSupportLevel);
  const [projectedSupportNextYear, setProjectedSupportNextYear] = useState('Targeted Services (3x weekly)');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data: Omit<QuarterlySupport, 'id'> = {
        studentId: student.studentId,
        schoolYear,
        quarter,
        supportLevel,
        projectedSupportNextYear: projectedSupportNextYear.trim(),
        notes: notes.trim()
      };

      await createQuarterlySupport(data);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to log quarterly support:', err);
      setError('Error saving record: ' + (err instanceof Error ? err.message : String(err)));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-[#0635aa] text-white flex items-center justify-center shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Log Service Record — {student.firstName}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Year *</label>
              <input
                type="text"
                required
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                placeholder="2024-2025"
                className="w-full bg-white border border-slate-200 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quarter *</label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value as any)}
                className="w-full bg-white border border-slate-200 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 font-medium text-slate-900 outline-none"
              >
                <option value="Q1">Quarter 1 (Fall)</option>
                <option value="Q2">Quarter 2 (Winter)</option>
                <option value="Q3">Quarter 3 (Early Spring)</option>
                <option value="Q4">Quarter 4 (Year End)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Language Service Delivery Tier *</label>
            <select
              value={supportLevel}
              onChange={(e) => setSupportLevel(e.target.value as SupportLevel)}
              className="w-full bg-white border border-slate-200 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 font-medium text-slate-900 outline-none"
            >
              <option value="Tier 3">Tier 3: Targeted Services (Levels 1–2)</option>
              <option value="Tier 2">Tier 2: Targeted Services (Levels 3–4)</option>
              <option value="Tier 1">Tier 1: Monitored (Tier 1 Instruction)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Projected Support Next Academic Year</label>
            <input
              type="text"
              value={projectedSupportNextYear}
              onChange={(e) => setProjectedSupportNextYear(e.target.value)}
              placeholder="e.g. Continue Tier 2 Targeted Services, Transition to Tier 1 Monitored..."
              className="w-full bg-white border border-slate-200 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Intervention Notes &amp; Service Hours</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Minutes per week, co-teaching model, accommodations..."
              className="w-full bg-white border border-slate-200 focus:border-[#0635aa] rounded-lg p-2.5 text-xs text-slate-900 outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#0635aa] hover:bg-[#052c8c] text-white font-semibold shadow-xs transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Support Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
