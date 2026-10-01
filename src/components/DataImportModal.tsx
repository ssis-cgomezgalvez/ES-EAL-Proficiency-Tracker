import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Student, GradeLevel, EalStatus, SupportLevel, normalizeMtssTier } from '../types/eal';
import { createStudent, updateStudent } from '../firebase/services';

interface DataImportModalProps {
  existingStudents: Student[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedStudentRow {
  studentId: string;
  firstName: string;
  preferredName?: string;
  lastName: string;
  gradeLevel: GradeLevel;
  homeroom: string;
  homeroomTeacher: string;
  homeLanguage: string;
  dateOfBirth: string;
  age: number;
  gender: 'Female' | 'Male' | 'Non-binary' | 'Other';
  enteredSchoolDate: string;
  ealStatus: EalStatus;
  currentSupportLevel: SupportLevel;
  overallWIDALevel: number;
  isValid: boolean;
  validationError?: string;
  isExisting: boolean;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  existingStudents,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [updateExisting, setUpdateExisting] = useState(true);

  if (!isOpen) return null;

  const existingIdSet = new Set(existingStudents.map((s) => s.studentId));

  // Download official CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      'studentId',
      'firstName',
      'preferredName',
      'lastName',
      'dateOfBirth',
      'age',
      'gender',
      'homeLanguage',
      'gradeLevel',
      'homeroom',
      'homeroomTeacher',
      'enteredSchoolDate',
      'ealStatus',
      'currentSupportLevel',
      'overallWIDALevel'
    ];

    const sampleRows = [
      [
        'EAL-2025-101',
        'Minh',
        'Leo',
        'Nguyen',
        '2018-04-12',
        '7',
        'Male',
        'Vietnamese',
        '2',
        '2A',
        'Ms. Sarah Jenkins',
        '2024-08-15',
        'Current',
        'Tier 3',
        '2.1'
      ],
      [
        'EAL-2025-102',
        'Ji-woo',
        'Chloe',
        'Park',
        '2017-09-24',
        '8',
        'Female',
        'Korean',
        '3',
        '3B',
        'Mr. David Miller',
        '2023-08-10',
        'Current',
        'Tier 2',
        '3.6'
      ],
      [
        'EAL-2025-103',
        'Yuto',
        '',
        'Takahashi',
        '2016-11-05',
        '9',
        'Male',
        'Japanese',
        '4',
        '4C',
        'Ms. Emily Clark',
        '2022-08-15',
        'Monitor',
        'Tier 1',
        '5.2'
      ]
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SSIS_EAL_Student_Roster_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length < 2) {
          throw new Error('CSV file must contain a header row and at least one student record.');
        }

        // Header mapping
        const headerRow = lines[0].toLowerCase();
        const headers = headerRow.split(',').map((h) => h.replace(/["'\r]/g, '').trim());

        const getIdx = (candidates: string[]) => {
          for (const c of candidates) {
            const idx = headers.findIndex((h) => h.toLowerCase() === c.toLowerCase());
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const idIdx = getIdx(['studentid', 'id', 'student_id']);
        const firstIdx = getIdx(['firstname', 'first_name', 'first', 'givenname']);
        const prefIdx = getIdx(['preferredname', 'preferred_name', 'nickname']);
        const lastIdx = getIdx(['lastname', 'last_name', 'last', 'surname']);
        const dobIdx = getIdx(['dateofbirth', 'date_of_birth', 'dob']);
        const ageIdx = getIdx(['age']);
        const genderIdx = getIdx(['gender', 'sex']);
        const langIdx = getIdx(['homelanguage', 'home_language', 'language', 'native_language']);
        const gradeIdx = getIdx(['gradelevel', 'grade_level', 'grade']);
        const hrIdx = getIdx(['homeroom', 'room', 'class']);
        const hrTeachIdx = getIdx(['homeroomteacher', 'homeroom_teacher', 'teacher']);
        const enteredIdx = getIdx(['enteredschooldate', 'entered_school_date', 'enrolled_date']);
        const ealStatusIdx = getIdx(['ealstatus', 'eal_status', 'status']);
        const tierIdx = getIdx(['currentsupportlevel', 'supportlevel', 'tier', 'mtss_tier']);
        const widaIdx = getIdx(['overallwidalevel', 'widalevel', 'wida_level', 'wida_overall', 'level']);

        const parsed: ParsedStudentRow[] = [];

        for (let i = 1; i < lines.length; i++) {
          const rawLine = lines[i].trim();
          if (!rawLine) continue;

          // Parse quoted values
          const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
          const cols: string[] = [];
          let match;
          while ((match = regex.exec(rawLine)) !== null) {
            let col = match[1] || '';
            if (col.startsWith('"') && col.endsWith('"')) {
              col = col.slice(1, -1).replace(/""/g, '"');
            }
            cols.push(col.trim());
            if (regex.lastIndex >= rawLine.length) break;
          }

          const rawId = idIdx !== -1 ? cols[idIdx] : '';
          const rawFirst = firstIdx !== -1 ? cols[firstIdx] : '';
          const rawPref = prefIdx !== -1 ? cols[prefIdx] : '';
          const rawLast = lastIdx !== -1 ? cols[lastIdx] : '';
          const rawGrade = (gradeIdx !== -1 ? cols[gradeIdx] : '2') as GradeLevel;
          const rawHr = hrIdx !== -1 ? cols[hrIdx] : 'Grade 2';
          const rawHrTeach = hrTeachIdx !== -1 ? cols[hrTeachIdx] : 'Teacher';
          const rawLang = langIdx !== -1 ? cols[langIdx] : 'Vietnamese';
          const rawDob = dobIdx !== -1 ? cols[dobIdx] : '2018-01-01';
          const rawAge = ageIdx !== -1 ? Number(cols[ageIdx]) || 7 : 7;
          const rawGender = (genderIdx !== -1 ? cols[genderIdx] : 'Other') as any;
          const rawEntered = enteredIdx !== -1 ? cols[enteredIdx] : new Date().toISOString().split('T')[0];
          const rawStatus = (ealStatusIdx !== -1 ? cols[ealStatusIdx] : 'Current') as EalStatus;
          const rawTier = tierIdx !== -1 ? normalizeMtssTier(cols[tierIdx]) : 'Tier 2';
          const rawWida = widaIdx !== -1 ? parseFloat(cols[widaIdx]) || 2.5 : 2.5;

          const studentId = rawId || `EAL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
          const isValid = Boolean(rawFirst && rawLast);
          const validationError = !rawFirst ? 'Missing first name' : !rawLast ? 'Missing last name' : undefined;
          const isExisting = existingIdSet.has(studentId);

          parsed.push({
            studentId,
            firstName: rawFirst,
            preferredName: rawPref || undefined,
            lastName: rawLast,
            gradeLevel: ['K', '1', '2', '3', '4', '5'].includes(rawGrade) ? rawGrade : '2',
            homeroom: rawHr,
            homeroomTeacher: rawHrTeach,
            homeLanguage: rawLang,
            dateOfBirth: rawDob,
            age: rawAge,
            gender: ['Female', 'Male', 'Non-binary', 'Other'].includes(rawGender) ? rawGender : 'Other',
            enteredSchoolDate: rawEntered,
            ealStatus: ['Current', 'Monitor', 'Exited'].includes(rawStatus) ? rawStatus : 'Current',
            currentSupportLevel: rawTier,
            overallWIDALevel: Math.max(1.0, Math.min(6.0, rawWida)),
            isValid,
            validationError,
            isExisting
          });
        }

        setParsedRows(parsed);
      } catch (err) {
        console.error('CSV parse error:', err);
        setErrorMessage(err instanceof Error ? err.message : String(err));
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsText(selectedFile);
  };

  // Run Bulk Import to Firestore
  const handleExecuteImport = async () => {
    setIsImporting(true);
    setErrorMessage('');
    setImportProgress(0);

    const validRows = parsedRows.filter((r) => r.isValid);
    let completed = 0;

    try {
      for (const row of validRows) {
        const studentPayload: Omit<Student, 'id'> = {
          studentId: row.studentId,
          firstName: row.firstName,
          preferredName: row.preferredName,
          lastName: row.lastName,
          dateOfBirth: row.dateOfBirth,
          age: row.age,
          gender: row.gender,
          homeLanguage: row.homeLanguage,
          gradeLevel: row.gradeLevel,
          homeroom: row.homeroom,
          homeroomTeacher: row.homeroomTeacher,
          enteredSchoolDate: row.enteredSchoolDate,
          ealStatus: row.ealStatus,
          currentSupportLevel: row.currentSupportLevel,
          overallWIDALevel: row.overallWIDALevel
        };

        const existing = existingStudents.find((s) => s.studentId === row.studentId);

        if (existing && existing.id) {
          if (updateExisting) {
            await updateStudent(existing.id, studentPayload);
          }
        } else {
          await createStudent(studentPayload);
        }

        completed++;
        setImportProgress(Math.round((completed / validRows.length) * 100));
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Import execution error:', err);
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const existingCount = parsedRows.filter((r) => r.isExisting).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-[#0635aa] text-white flex items-center justify-center shadow-xs">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Bulk Student Data Import (CSV)
              </h2>
              <p className="text-xs text-slate-500">
                Beginning-of-year roster onboarding and student record synchronization.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload Zone & Template Download */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-4 w-4 text-slate-600" />
              <span className="font-semibold text-slate-900">Need the official SSIS format?</span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium shadow-2xs transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Drag & drop / file chooser */}
          <label className="border-2 border-dashed border-slate-200 hover:border-[#0635aa] rounded-xl p-6 text-center block cursor-pointer transition-colors bg-white hover:bg-slate-50">
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <span className="text-xs font-semibold text-slate-800 block">
              {file ? file.name : 'Choose a CSV file or drag & drop here'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Supports .csv files exported from PowerSchool, Veracross, or Google Sheets
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900">
                  Ready to Import: {validCount} valid learners
                </span>
                {existingCount > 0 && (
                  <span className="text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium">
                    {existingCount} match existing student IDs
                  </span>
                )}
              </div>

              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                  className="rounded text-[#0635aa] focus:ring-[#0635aa]"
                />
                <span>Update existing student records</span>
              </label>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Student Name</th>
                    <th className="py-2 px-2">ID</th>
                    <th className="py-2 px-2">Grade</th>
                    <th className="py-2 px-2">Homeroom</th>
                    <th className="py-2 px-2">Language</th>
                    <th className="py-2 px-2">Service Tier</th>
                    <th className="py-2 px-2">WIDA Lv</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className={!r.isValid ? 'bg-red-50/50' : 'hover:bg-slate-50 transition-colors'}>
                      <td className="py-2 px-3">
                        {r.isValid ? (
                          r.isExisting ? (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-blue-50 text-[#0635aa] border border-blue-200">
                              Update
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              New
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-red-100 text-red-800" title={r.validationError}>
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {r.lastName}, {r.firstName}
                      </td>
                      <td className="py-2 px-2 text-slate-500 font-mono tabular-nums">{r.studentId}</td>
                      <td className="py-2 px-2">Gr {r.gradeLevel}</td>
                      <td className="py-2 px-2">{r.homeroom}</td>
                      <td className="py-2 px-2">{r.homeLanguage}</td>
                      <td className="py-2 px-2 font-medium text-slate-800">{r.currentSupportLevel}</td>
                      <td className="py-2 px-2 font-mono tabular-nums font-semibold text-slate-900">{r.overallWIDALevel.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isImporting && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs text-slate-800 font-semibold">
                  <span>Importing records to database...</span>
                  <span className="font-mono tabular-nums">{importProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#0635aa] h-2 transition-all duration-300 rounded-full"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400">
            Saigon South International School • Student Information Sync
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={isImporting || validCount === 0}
              className="bg-[#0635aa] hover:bg-[#052c8c] text-white px-5 py-2 rounded-lg font-semibold shadow-xs flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Execute Bulk Import ({validCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
