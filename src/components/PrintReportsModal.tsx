import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  FileText,
  Users,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  Check,
  Download
} from 'lucide-react';
import {
  Student,
  WidaScore,
  ProficiencyAssessment,
  LanguageProfile,
  QuarterlySupport,
  WIDA_LEVELS,
  MTSS_TIERS,
  normalizeMtssTier,
  GradeLevel
} from '../types/eal';

interface PrintReportsModalProps {
  students: Student[];
  assessments: ProficiencyAssessment[];
  widaScores: WidaScore[];
  languageProfiles?: Record<string, LanguageProfile>;
  quarterlySupports?: QuarterlySupport[];
  initialStudent?: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export type ReportType =
  | 'individual_profile'
  | 'class_roster'
  | 'parent_conference'
  | 'eoy_summary'
  | 'transition_handoff';

export const PrintReportsModal: React.FC<PrintReportsModalProps> = ({
  students,
  assessments,
  widaScores,
  languageProfiles = {},
  quarterlySupports = [],
  initialStudent,
  isOpen,
  onClose
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('individual_profile');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent?.studentId || (students[0]?.studentId ?? '')
  );
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedHomeroom, setSelectedHomeroom] = useState<string>('ALL');

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.studentId === selectedStudentId) || students[0];

  const homeroomOptions = Array.from(
    new Set(students.map((s) => s.homeroom).filter(Boolean))
  ).sort();

  // Filtered students for roster / cohort reports
  const cohortStudents = students.filter((s) => {
    if (selectedGrade !== 'ALL' && s.gradeLevel !== selectedGrade) return false;
    if (selectedHomeroom !== 'ALL' && s.homeroom !== selectedHomeroom) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#232f49]/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-4 sm:p-7 shadow-2xl border border-[#8cacd3]/40 my-4 sm:my-8 space-y-5 print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none">
        {/* Modal Controls - Hidden during print */}
        <div className="print:hidden space-y-4 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-[#0635aa] text-[#fec707] border border-[#0635aa] flex items-center justify-center shadow-xs font-bold">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0635aa]">
                  EAL Reports &amp; Transition Document Center
                </h2>
                <p className="text-xs text-[#232f49]/80">
                  Generate formal, print-ready reports and transition handoffs for Saigon South International School.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0635aa] hover:bg-[#ebf8ff] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Report Type Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-semibold">
            <button
              onClick={() => setSelectedReport('individual_profile')}
              className={`p-2.5 rounded-lg border text-center transition-colors ${
                selectedReport === 'individual_profile'
                  ? 'bg-[#0635aa] text-white border-[#0635aa] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <FileText className="h-4 w-4 mx-auto mb-1" />
              <span>Student Profile PDF</span>
            </button>

            <button
              onClick={() => setSelectedReport('class_roster')}
              className={`p-2.5 rounded-lg border text-center transition-colors ${
                selectedReport === 'class_roster'
                  ? 'bg-[#0635aa] text-white border-[#0635aa] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Users className="h-4 w-4 mx-auto mb-1" />
              <span>Class Roster &amp; Levels</span>
            </button>

            <button
              onClick={() => setSelectedReport('parent_conference')}
              className={`p-2.5 rounded-lg border text-center transition-colors ${
                selectedReport === 'parent_conference'
                  ? 'bg-[#0635aa] text-white border-[#0635aa] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Award className="h-4 w-4 mx-auto mb-1" />
              <span>Parent Conference</span>
            </button>

            <button
              onClick={() => setSelectedReport('eoy_summary')}
              className={`p-2.5 rounded-lg border text-center transition-colors ${
                selectedReport === 'eoy_summary'
                  ? 'bg-[#0635aa] text-white border-[#0635aa] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Calendar className="h-4 w-4 mx-auto mb-1" />
              <span>End-of-Year Summary</span>
            </button>

            <button
              onClick={() => setSelectedReport('transition_handoff')}
              className={`p-2.5 rounded-lg border text-center transition-colors ${
                selectedReport === 'transition_handoff'
                  ? 'bg-[#0635aa] text-white border-[#0635aa] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <ArrowRight className="h-4 w-4 mx-auto mb-1" />
              <span>Teacher Handoff Pack</span>
            </button>
          </div>

          {/* Filtering Options Bar */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            {selectedReport === 'individual_profile' ||
            selectedReport === 'parent_conference' ||
            selectedReport === 'transition_handoff' ? (
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <span className="font-semibold text-slate-700 whitespace-nowrap">Target Student:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0635aa]"
                >
                  {students.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.lastName}, {s.firstName} (Gr {s.gradeLevel} · {s.homeroom} · {s.homeLanguage})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-700">Grade:</span>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-medium"
                  >
                    <option value="ALL">All Grades</option>
                    {['K', '1', '2', '3', '4', '5'].map((g) => (
                      <option key={g} value={g}>
                        {g === 'K' ? 'Kindergarten' : `Grade ${g}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-700">Homeroom:</span>
                  <select
                    value={selectedHomeroom}
                    onChange={(e) => setSelectedHomeroom(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-medium"
                  >
                    <option value="ALL">All Homerooms</option>
                    {homeroomOptions.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-slate-500 font-medium">
                  Showing {cohortStudents.length} learners
                </span>
              </div>
            )}

            {/* Print Action Button */}
            <button
              onClick={handlePrint}
              className="bg-[#0635aa] hover:bg-[#052c8c] text-white px-4 py-1.5 rounded-lg font-semibold shadow-xs flex items-center space-x-2 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PRINTABLE DOCUMENT AREA (Styled for formal printing & PDF)     */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-6 bg-white border border-slate-200 rounded-xl space-y-6 text-slate-900 print:border-none print:p-0 print:space-y-4">
          {/* Universal Official SSIS School Header */}
          <div className="border-b-2 border-[#0635aa] pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-xl bg-[#0635aa] text-white flex items-center justify-center font-black text-xl border border-[#0635aa]">
                SSIS
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#0635aa] tracking-tight leading-tight">
                  Saigon South International School
                </h1>
                <p className="text-xs font-semibold text-slate-800">
                  Elementary English as an Additional Language (EAL) • Language Proficiency &amp; Services
                </p>
                <p className="text-[10px] text-slate-500">
                  Phu My Hung, District 7, Ho Chi Minh City, Vietnam
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold text-[#0635aa] block uppercase tracking-wider text-[11px]">
                {selectedReport === 'individual_profile' && 'Student Assessment Portfolio'}
                {selectedReport === 'class_roster' && 'Class Proficiency Roster'}
                {selectedReport === 'parent_conference' && 'Parent-Teacher Conference Progress Report'}
                {selectedReport === 'eoy_summary' && 'End-of-Year EAL Summative Summary'}
                {selectedReport === 'transition_handoff' && 'Next-Year Teacher Handoff Transition Packet'}
              </span>
              <span className="text-slate-500 text-[11px]">
                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* REPORT 1: INDIVIDUAL STUDENT PROFILE PDF */}
          {selectedReport === 'individual_profile' && currentStudent && (
            <div className="space-y-5 text-xs">
              {/* Student Header */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0635aa]">
                    {currentStudent.lastName}, {currentStudent.firstName}{' '}
                    {currentStudent.preferredName ? `("${currentStudent.preferredName}")` : ''}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-1.5 text-slate-800">
                    <div>Student ID: <strong>{currentStudent.studentId}</strong></div>
                    <div>Grade: <strong>Grade {currentStudent.gradeLevel}</strong></div>
                    <div>Homeroom: <strong>{currentStudent.homeroom} ({currentStudent.homeroomTeacher})</strong></div>
                    <div>Home Language: <strong>{currentStudent.homeLanguage}</strong></div>
                    <div>DOB: <strong>{currentStudent.dateOfBirth} (Age {currentStudent.age})</strong></div>
                    <div>EAL Status: <strong>{currentStudent.ealStatus}</strong></div>
                    <div>MTSS Tier: <strong>{normalizeMtssTier(currentStudent.currentSupportLevel)}</strong></div>
                    <div>WIDA Level: <strong>Level {currentStudent.overallWIDALevel.toFixed(1)}</strong></div>
                  </div>
                </div>
              </div>

              {/* WIDA Scores Table */}
              <div>
                <h3 className="font-bold text-[#0635aa] text-xs uppercase tracking-wider mb-2">
                  1. WIDA Standardized Assessment Progression
                </h3>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-[#ebf8ff] font-bold text-[#0635aa] border-b border-[#8cacd3]/40">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2">Speaking</th>
                      <th className="py-2 px-2">Listening</th>
                      <th className="py-2 px-2">Reading</th>
                      <th className="py-2 px-2">Writing</th>
                      <th className="py-2 px-3 font-bold text-[#0635aa]">Composite</th>
                      <th className="py-2 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {widaScores
                      .filter((s) => s.studentId === currentStudent.studentId)
                      .map((sc, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-semibold text-[#232f49]">{sc.assessmentDate}</td>
                          <td className="py-2 px-2">{sc.assessmentType}</td>
                          <td className="py-2 px-2 font-bold text-[#0635aa]">{sc.speakingScore.toFixed(1)}</td>
                          <td className="py-2 px-2 font-bold text-[#7b9626]">{sc.listeningScore.toFixed(1)}</td>
                          <td className="py-2 px-2 font-bold text-[#232f49]">{sc.readingScore.toFixed(1)}</td>
                          <td className="py-2 px-2 font-bold text-[#d98e16]">{sc.writingScore.toFixed(1)}</td>
                          <td className="py-2 px-3 font-bold text-[#0635aa]">{sc.overallComposite.toFixed(1)}</td>
                          <td className="py-2 px-3 text-slate-500 italic">{sc.notes || '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Formative Assessments Portfolio Summary */}
              <div>
                <h3 className="font-bold text-[#0635aa] text-xs uppercase tracking-wider mb-2">
                  2. Formative Points of Proficiency &amp; Assessment Evidence
                </h3>
                <div className="space-y-2">
                  {assessments
                    .filter((a) => a.studentId === currentStudent.studentId)
                    .map((a, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>
                            {a.assessmentTitle || `Assessment ${a.assessmentLetter}`} ({a.category || 'Benchmark'})
                          </span>
                          <span className="text-slate-900 font-bold">
                            Level {a.proficiencyLevel} ({WIDA_LEVELS[a.proficiencyLevel]?.name}) • {a.languageModality}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Date: {a.assessmentDate} • Standard: {a.wideELDStandard} • Key Language Use: {a.keyLanguageUse}
                        </div>
                        <p className="mt-1.5 text-slate-700 italic text-[11px]">{a.teacherNotes}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
                <div>
                  <div className="border-b border-slate-400 pb-8" />
                  <span className="block mt-1 font-semibold">EAL Specialist Signature</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-8" />
                  <span className="block mt-1 font-semibold">Homeroom Teacher Signature</span>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 2: CLASS ROSTER WITH CURRENT LEVELS */}
          {selectedReport === 'class_roster' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center text-[#232f49] font-medium">
                <span>Filter: {selectedGrade === 'ALL' ? 'All Grades' : `Grade ${selectedGrade}`} • {selectedHomeroom}</span>
                <span>Total Students: <strong className="text-[#0635aa]">{cohortStudents.length}</strong></span>
              </div>

              <table className="w-full text-left border border-slate-200 text-xs">
                <thead className="bg-[#0635aa] text-white">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-2">ID</th>
                    <th className="py-2.5 px-2">Gr</th>
                    <th className="py-2.5 px-2">HR</th>
                    <th className="py-2.5 px-3">Home Language</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-3">MTSS Service Tier</th>
                    <th className="py-2.5 px-2 font-bold text-[#fec707]">WIDA Lv</th>
                    <th className="py-2.5 px-4">Teacher Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cohortStudents.map((st) => (
                    <tr key={st.studentId} className="hover:bg-[#ebf8ff]/30">
                      <td className="py-2 px-3 font-bold text-[#232f49]">
                        {st.lastName}, {st.firstName} {st.preferredName ? `("${st.preferredName}")` : ''}
                      </td>
                      <td className="py-2 px-2 text-slate-500">{st.studentId}</td>
                      <td className="py-2 px-2 font-semibold">{st.gradeLevel}</td>
                      <td className="py-2 px-2">{st.homeroom}</td>
                      <td className="py-2 px-3">{st.homeLanguage}</td>
                      <td className="py-2 px-2">{st.ealStatus}</td>
                      <td className="py-2 px-3 font-bold text-[#0635aa]">
                        {normalizeMtssTier(st.currentSupportLevel)}
                      </td>
                      <td className="py-2 px-2 font-bold text-[#232f49]">
                        {st.overallWIDALevel.toFixed(1)}
                      </td>
                      <td className="py-2 px-4 border-l border-slate-100 text-slate-400">
                        [ &nbsp; ] Verified
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 3: PROGRESS REPORT FOR PARENT CONFERENCES */}
          {selectedReport === 'parent_conference' && currentStudent && (
            <div className="space-y-4 text-xs">
              <div className="bg-[#ebf8ff] p-4 rounded-xl border border-[#8cacd3]">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-bold text-[#0635aa]">
                      Multilingual Learner Progress Conference Report
                    </h2>
                    <p className="text-xs text-[#232f49] mt-0.5">
                      Student: <strong>{currentStudent.firstName} {currentStudent.lastName}</strong> • Grade {currentStudent.gradeLevel} ({currentStudent.homeroom})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#0635aa]">
                      Overall Proficiency: Level {currentStudent.overallWIDALevel.toFixed(1)}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {WIDA_LEVELS[Math.min(6, Math.floor(currentStudent.overallWIDALevel) || 1)]?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-[#8cacd3]/40 bg-white space-y-1.5">
                  <h4 className="font-bold text-[#0635aa] uppercase tracking-wider text-[11px]">
                    What Your Child Can Do With Language:
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[#232f49]">
                    <li>Demonstrates active listening comprehension during grade-level inquiries in {currentStudent.homeroom}.</li>
                    <li>Uses social and instructional language comfortably with international classmates and teachers.</li>
                    <li>Utilizes visual and graphic organizers to organize academic thoughts and vocabulary.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-[#8cacd3]/40 bg-white space-y-1.5">
                  <h4 className="font-bold text-[#0635aa] uppercase tracking-wider text-[11px]">
                    Current Targeted Language Goals (&quot;I can...&quot;):
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[#232f49]">
                    <li>&quot;I can explain the steps of a process using sequential transition words (first, next, then, finally).&quot;</li>
                    <li>&quot;I can express and justify my opinion using evidence from texts and illustrations.&quot;</li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#fec707]/60 bg-[#fec707]/15 space-y-1.5">
                <h4 className="font-bold text-[#232f49] uppercase tracking-wider text-[11px]">
                  Home Support &amp; Native Language Development:
                </h4>
                <p className="text-[#232f49] leading-relaxed">
                  Continue reading and discussing complex stories in your home language ({currentStudent.homeLanguage})! Strong home language literacy directly strengthens conceptual understanding and English academic acquisition at school.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-slate-600">
                <div>
                  <div className="border-b border-slate-400 pb-6" />
                  <span className="block mt-1 font-semibold">Teacher Signature</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-6" />
                  <span className="block mt-1 font-semibold">Parent / Guardian Signature</span>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 4: END-OF-YEAR SUMMARY REPORT */}
          {selectedReport === 'eoy_summary' && currentStudent && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">
                    End-of-Year Multilingual Proficiency Evaluation
                  </h3>
                  <p className="text-slate-600">
                    {currentStudent.firstName} {currentStudent.lastName} • Grade {currentStudent.gradeLevel} • Homeroom {currentStudent.homeroom}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-800">
                    Language Service Delivery: {normalizeMtssTier(currentStudent.currentSupportLevel)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#0635aa] uppercase tracking-wider text-[11px]">
                  Academic Year Trajectory &amp; Growth:
                </h4>
                <p className="text-[#232f49] leading-relaxed">
                  During this academic year, {currentStudent.firstName} has demonstrated steady linguistic progression across the WIDA ELD Standards. The student has engaged in both required benchmark evaluations and ongoing formative checkpoints, demonstrating increasing independence in content discourse.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="font-bold text-slate-700 block mb-1">Incoming Fall Baseline:</span>
                  <span className="text-sm font-bold text-[#232f49]">Level 2.2 Beginning</span>
                </div>
                <div className="p-3 rounded-lg border border-[#8cacd3]/50 bg-[#ebf8ff]">
                  <span className="font-bold text-[#0635aa] block mb-1">End of Year Spring Status:</span>
                  <span className="text-sm font-bold text-[#0635aa]">Level {currentStudent.overallWIDALevel.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-[#0635aa]/20 bg-[#ebf8ff]/50">
                <span className="font-bold text-[#0635aa] block mb-1">
                  Projected MTSS Support for Next Academic Year:
                </span>
                <p className="text-[#232f49]">
                  Recommended for <strong>{normalizeMtssTier(currentStudent.currentSupportLevel)}</strong> with targeted classroom scaffolds and co-taught inquiry support.
                </p>
              </div>
            </div>
          )}

          {/* REPORT 5: TRANSITION DOCUMENTS / TEACHER HANDOFF PACK */}
          {selectedReport === 'transition_handoff' && currentStudent && (
            <div className="space-y-4 text-xs">
              <div className="bg-[#fec707]/15 p-4 rounded-xl border border-[#fec707]/60">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0635aa] bg-[#fec707] px-2 py-0.5 rounded-full inline-block mb-1">
                      CONFIDENTIAL EDUCATIONAL RECORD
                    </span>
                    <h2 className="text-base font-bold text-[#232f49]">
                      Student Handoff Document for Next Year&apos;s Teachers
                    </h2>
                    <p className="text-xs text-[#232f49] mt-0.5">
                      Incoming Grade: <strong>Grade {currentStudent.gradeLevel === 'K' ? '1' : Number(currentStudent.gradeLevel) + 1}</strong> • Current Student: <strong>{currentStudent.lastName}, {currentStudent.firstName} ({currentStudent.studentId})</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#0635aa] text-sm">
                      WIDA Level {currentStudent.overallWIDALevel.toFixed(1)}
                    </span>
                    <span className="block text-[11px] text-[#232f49] font-medium">
                      {normalizeMtssTier(currentStudent.currentSupportLevel)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Core Handoff Quadrants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. What student can do */}
                <div className="p-3.5 rounded-xl border border-[#8cacd3]/40 bg-white space-y-1.5">
                  <h4 className="font-bold text-[#0635aa] uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#fec707]" />
                    <span>Linguistic Strengths &amp; Can-Do Highlights:</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[#232f49]">
                    <li>Understands grade-level academic directions with visual modeling.</li>
                    <li>Participates well in peer discussions and paired problem-solving.</li>
                    <li>Translanguaging asset: Strong foundation in {currentStudent.homeLanguage}.</li>
                  </ul>
                </div>

                {/* 2. Effective Scaffolds */}
                <div className="p-3.5 rounded-xl border border-[#8cacd3]/40 bg-[#ebf8ff] space-y-1.5">
                  <h4 className="font-bold text-[#0635aa] uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#0635aa]" />
                    <span>Most Effective Scaffolds &amp; Modalities:</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[#232f49] font-medium">
                    <li>Bilingual word walls and graphic organizers with sentence stems.</li>
                    <li>Extended processing time during independent writing.</li>
                    <li>Frequent check-ins during multi-step inquiry projects.</li>
                  </ul>
                </div>

                {/* 3. Priority Goals */}
                <div className="p-3.5 rounded-xl border border-[#8cacd3]/40 bg-white space-y-1.5">
                  <h4 className="font-bold text-[#0635aa] uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-[#0635aa]" />
                    <span>Recommended Fall Focus Goals:</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[#232f49]">
                    <li>Develop academic paragraph structure with supporting details.</li>
                    <li>Expand Tier 2 and Tier 3 content vocabulary in science &amp; social studies.</li>
                  </ul>
                </div>

                {/* 4. MTSS Support Plan */}
                <div className="p-3.5 rounded-xl border border-[#8cacd3]/40 bg-white space-y-1.5">
                  <h4 className="font-bold text-[#0635aa] uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#0635aa]" />
                    <span>MTSS Service Allocation:</span>
                  </h4>
                  <p className="text-[#232f49] leading-snug">
                    Assigned to <strong>{normalizeMtssTier(currentStudent.currentSupportLevel)}</strong>. Co-teaching support provided during literacy blocks.
                  </p>
                </div>
              </div>

              {/* Transition Handoff Signatures */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
                <div>
                  <div className="border-b border-slate-400 pb-6" />
                  <span className="block mt-1 font-semibold">Outgoing EAL Specialist Signature</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-6" />
                  <span className="block mt-1 font-semibold">Incoming Grade / Homeroom Teacher Signature</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
