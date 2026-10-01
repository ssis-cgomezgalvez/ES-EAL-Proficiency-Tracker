import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { Student, GradeLevel, EalStatus, SupportLevel, COMMON_HOME_LANGUAGES } from '../types/eal';
import { createStudent, updateStudent } from '../firebase/services';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentToEdit?: Student | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentToEdit
}) => {
  const [studentId, setStudentId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2017-05-15');
  const [age, setAge] = useState<number>(7);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Non-binary' | 'Other'>('Female');
  const [homeLanguage, setHomeLanguage] = useState('Vietnamese');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('2');
  const [homeroom, setHomeroom] = useState('2A');
  const [homeroomTeacher, setHomeroomTeacher] = useState('Ms. Henderson');
  const [enteredSchoolDate, setEnteredSchoolDate] = useState('2024-08-15');
  const [profilePhotoURL, setProfilePhotoURL] = useState('');
  const [ealStatus, setEalStatus] = useState<EalStatus>('Current');
  const [currentSupportLevel, setCurrentSupportLevel] = useState<SupportLevel>('Targeted');
  const [overallWIDALevel, setOverallWIDALevel] = useState<number>(2.5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setStudentId(studentToEdit.studentId);
      setFirstName(studentToEdit.firstName);
      setPreferredName(studentToEdit.preferredName || '');
      setLastName(studentToEdit.lastName);
      setDateOfBirth(studentToEdit.dateOfBirth);
      setAge(studentToEdit.age);
      setGender(studentToEdit.gender);
      setHomeLanguage(studentToEdit.homeLanguage);
      setGradeLevel(studentToEdit.gradeLevel);
      setHomeroom(studentToEdit.homeroom);
      setHomeroomTeacher(studentToEdit.homeroomTeacher);
      setEnteredSchoolDate(studentToEdit.enteredSchoolDate);
      setProfilePhotoURL(studentToEdit.profilePhotoURL || '');
      setEalStatus(studentToEdit.ealStatus);
      setCurrentSupportLevel(studentToEdit.currentSupportLevel);
      setOverallWIDALevel(studentToEdit.overallWIDALevel);
    } else {
      // Auto-generate fresh student ID
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setStudentId(`EAL-${new Date().getFullYear()}-${randomSuffix}`);
      setFirstName('');
      setPreferredName('');
      setLastName('');
      setProfilePhotoURL('');
      setOverallWIDALevel(2.5);
    }
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const studentData: Omit<Student, 'id'> = {
        studentId: studentId.trim(),
        firstName: firstName.trim(),
        preferredName: preferredName.trim() || undefined,
        lastName: lastName.trim(),
        dateOfBirth,
        age: Number(age),
        gender,
        homeLanguage,
        gradeLevel,
        homeroom: homeroom.trim(),
        homeroomTeacher: homeroomTeacher.trim(),
        enteredSchoolDate,
        profilePhotoURL: profilePhotoURL.trim() || undefined,
        ealStatus,
        currentSupportLevel,
        overallWIDALevel: Number(overallWIDALevel)
      };

      if (studentToEdit && studentToEdit.id) {
        await updateStudent(studentToEdit.id, studentData);
      } else {
        await createStudent(studentData);
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save student:', err);
      setError('Could not save student: ' + (err instanceof Error ? err.message : String(err)));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#0635aa] text-white flex items-center justify-center shadow-xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {studentToEdit ? 'Edit Multilingual Student' : 'Enroll New Multilingual Learner'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#f26544]/10 border border-[#f26544]/30 text-[#232f49] text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-[#f26544]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Student ID & Names */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Student ID *</label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 font-medium text-[#232f49] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Minh"
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Preferred Name</label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="e.g. Leo"
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Nguyen"
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              />
            </div>
          </div>

          {/* Row 2: DOB, Age, Gender, Home Language */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  const birthYear = new Date(e.target.value).getFullYear();
                  const currentYear = new Date().getFullYear();
                  setAge(Math.max(4, Math.min(12, currentYear - birthYear)));
                }}
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Age</label>
              <input
                type="number"
                min="4"
                max="14"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 6)}
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Home Language *</label>
              <select
                value={homeLanguage}
                onChange={(e) => setHomeLanguage(e.target.value)}
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              >
                {COMMON_HOME_LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Grade Level, Homeroom, Teacher, Entry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Grade Level *</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              >
                <option value="K">Kindergarten</option>
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Homeroom</label>
              <input
                type="text"
                value={homeroom}
                onChange={(e) => setHomeroom(e.target.value)}
                placeholder="e.g. 3A"
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Homeroom Teacher</label>
              <input
                type="text"
                value={homeroomTeacher}
                onChange={(e) => setHomeroomTeacher(e.target.value)}
                placeholder="e.g. Ms. Sarah Jenkins"
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Entered School Date</label>
              <input
                type="date"
                value={enteredSchoolDate}
                onChange={(e) => setEnteredSchoolDate(e.target.value)}
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              />
            </div>
          </div>

          {/* Row 4: EAL Status, Support Level, WIDA Overall Level, Photo URL */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">EAL Status *</label>
              <select
                value={ealStatus}
                onChange={(e) => setEalStatus(e.target.value as EalStatus)}
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              >
                <option value="Current">Current</option>
                <option value="Monitor">Monitor</option>
                <option value="Exited">Exited</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Language Service Tier *</label>
              <select
                value={currentSupportLevel}
                onChange={(e) => setCurrentSupportLevel(e.target.value as SupportLevel)}
                className="w-full bg-white border border-slate-200 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 font-medium text-slate-900 outline-none"
              >
                <option value="Tier 3">Tier 3: Targeted Services (Levels 1–2)</option>
                <option value="Tier 2">Tier 2: Targeted Services (Levels 3–4)</option>
                <option value="Tier 1">Tier 1: Monitored (Core Instruction)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">
                WIDA Overall Level ({overallWIDALevel.toFixed(1)})
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="6.0"
                value={overallWIDALevel}
                onChange={(e) => setOverallWIDALevel(parseFloat(e.target.value) || 1.0)}
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 font-bold text-[#0635aa] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#232f49] mb-1">Photo URL (Optional)</label>
              <input
                type="url"
                value={profilePhotoURL}
                onChange={(e) => setProfilePhotoURL(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border border-[#8cacd3]/40 focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 text-[#232f49] outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#8cacd3]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-[#232f49] font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0635aa] hover:bg-[#232f49] text-white font-bold shadow-xs transition-colors"
            >
              {isSubmitting ? 'Saving...' : studentToEdit ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
