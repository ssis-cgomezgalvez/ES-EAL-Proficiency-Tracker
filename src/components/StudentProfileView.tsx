import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Globe,
  Award,
  Sparkles,
  BookOpen,
  FileText,
  Clock,
  Plus,
  Play,
  Volume2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Layers,
  ChevronRight,
  TrendingUp,
  Tag,
  Edit3
} from 'lucide-react';
import {
  Student,
  WidaScore,
  ProficiencyAssessment,
  LanguageProfile,
  QuarterlySupport,
  WIDA_LEVELS,
  WIDA_SUB_LEVELS,
  MTSS_TIERS,
  normalizeMtssTier,
  AssessmentLetter
} from '../types/eal';
import {
  subscribeToStudentWidaScores,
  subscribeToStudentAssessments,
  subscribeToLanguageProfile,
  subscribeToQuarterlySupport
} from '../firebase/services';
import { LanguageProfileEditor } from './LanguageProfileEditor';
import { ProgressNarrativeModal } from './ProgressNarrativeModal';
import { useAuth } from '../contexts/AuthContext';

interface StudentProfileViewProps {
  student: Student;
  onBack: () => void;
  onOpenAssessmentEntry: (student: Student, defaultLetter?: AssessmentLetter) => void;
  onOpenWidaScoreModal: (student: Student) => void;
  onOpenQuarterlySupportModal: (student: Student) => void;
  onEditStudent: (student: Student) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onBack,
  onOpenAssessmentEntry,
  onOpenWidaScoreModal,
  onOpenQuarterlySupportModal,
  onEditStudent
}) => {
  const { canEditAssessments, canEditStudents, canEditLanguageProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'wida' | 'assessments' | 'profile' | 'support'>('wida');

  // Subscribed records
  const [widaScores, setWidaScores] = useState<WidaScore[]>([]);
  const [assessments, setAssessments] = useState<ProficiencyAssessment[]>([]);
  const [languageProfile, setLanguageProfile] = useState<LanguageProfile | null>(null);
  const [quarterlySupports, setQuarterlySupports] = useState<QuarterlySupport[]>([]);

  // Selected media preview
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string; title: string } | null>(null);

  // Filter assessments letter
  const [selectedLetterFilter, setSelectedLetterFilter] = useState<string>('ALL');

  // Family narrative modal state
  const [isNarrativeModalOpen, setIsNarrativeModalOpen] = useState(false);

  useEffect(() => {
    const unsubWida = subscribeToStudentWidaScores(student.studentId, setWidaScores);
    const unsubAssess = subscribeToStudentAssessments(student.studentId, setAssessments);
    const unsubProfile = subscribeToLanguageProfile(student.studentId, setLanguageProfile);
    const unsubSupport = subscribeToQuarterlySupport(student.studentId, setQuarterlySupports);

    return () => {
      unsubWida();
      unsubAssess();
      unsubProfile();
      unsubSupport();
    };
  }, [student.studentId]);

  // WIDA Level Badge helper
  const getWidaBadge = (level: number) => {
    const rounded = Math.floor(level) || 1;
    const clamped = Math.max(1, Math.min(6, rounded));
    const desc = WIDA_LEVELS[clamped];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${desc.badgeBg} ${desc.badgeBorder}`}>
        Lv {level.toFixed(1)} • {desc.name}
      </span>
    );
  };

  // Distinct assessment tags/letters present for this student
  const availableLetters = Array.from(
    new Set(assessments.map((a) => a.assessmentLetter).filter(Boolean))
  );

  const filteredAssessments = assessments.filter((a) => {
    if (selectedLetterFilter === 'ALL') return true;
    if (selectedLetterFilter === 'REQUIRED') {
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(a.assessmentLetter);
    }
    return a.assessmentLetter === selectedLetterFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Student Roster</span>
        </button>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* AI Progress Narrative Button */}
          <button
            onClick={() => setIsNarrativeModalOpen(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#0635aa]" />
            <span>AI Progress Narrative (Family Letter)</span>
          </button>

          {canEditStudents && (
            <button
              onClick={() => onEditStudent(student)}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-2xs transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
          )}

          {canEditAssessments && (
            <button
              onClick={() => onOpenAssessmentEntry(student)}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-[#0635aa] hover:bg-[#052c8c] px-3.5 py-2 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Record Point of Proficiency</span>
            </button>
          )}
        </div>
      </div>

      {/* Student Profile Header Card (Lean & Clean) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 bg-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-4">
              {/* Profile Photo */}
              <div className="h-18 w-18 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs overflow-hidden flex-shrink-0 flex items-center justify-center">
                {student.profilePhotoURL ? (
                  <img
                    src={student.profilePhotoURL}
                    alt={student.firstName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-bold text-xl text-slate-700 bg-slate-100">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {student.firstName} {student.lastName}
                  </h1>
                  {student.preferredName && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-normal border border-slate-200">
                      &quot;{student.preferredName}&quot;
                    </span>
                  )}
                  {getWidaBadge(student.overallWIDALevel)}
                </div>

                <div className="mt-1.5 flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <div className="flex items-center space-x-1 font-mono tabular-nums">
                    <span className="text-slate-400">ID:</span>
                    <strong className="text-slate-800">{student.studentId}</strong>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400">Grade:</span>
                    <span className="font-semibold text-slate-800">
                      {student.gradeLevel === 'K' ? 'Kindergarten' : `Grade ${student.gradeLevel}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400">Homeroom:</span>
                    <span className="text-slate-800">{student.homeroom} ({student.homeroomTeacher})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span>Home Language: <strong className="text-slate-800">{student.homeLanguage}</strong></span>
                  </div>
                </div>

                <div className="mt-1 flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>DOB: {student.dateOfBirth} (Age {student.age})</span>
                  <span>·</span>
                  <span>Gender: {student.gender}</span>
                  <span>·</span>
                  <span>Entered: {student.enteredSchoolDate}</span>
                </div>
              </div>
            </div>

            {/* Status & Service Details (Quiet, lean, informative) */}
            <div className="flex sm:flex-col items-start sm:items-end gap-1.5 flex-wrap">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">EAL Status:</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {student.ealStatus}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Service:</span>
                {(() => {
                  const tier = normalizeMtssTier(student.currentSupportLevel);
                  const info = MTSS_TIERS[tier];
                  return (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${info.badgeBg} ${info.badgeBorder}`}>
                      {info.shortName}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Clean neutral header with subtle active tab) */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('wida')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'wida'
                ? 'border-[#0635aa] text-[#0635aa] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>WIDA Trajectory &amp; Scores ({widaScores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assessments')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'assessments'
                ? 'border-[#0635aa] text-[#0635aa] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Proficiency Assessments ({assessments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'border-[#0635aa] text-[#0635aa] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Language Profile &amp; Goals</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'support'
                ? 'border-[#0635aa] text-[#0635aa] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Language Services &amp; Support ({quarterlySupports.length})</span>
          </button>
        </div>

        {/* Tab 1: WIDA Scores & Visual Progression Chart */}
        {activeTab === 'wida' && (
          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-[#0635aa]">WIDA Standardized Progression</h3>
                <p className="text-xs text-slate-500">
                  Speaking, Listening, Reading, and Writing domain score trajectory (1.0 to 6.0 scale).
                </p>
              </div>

              {canEditAssessments && (
                <button
                  onClick={() => onOpenWidaScoreModal(student)}
                  className="bg-[#0635aa] hover:bg-[#052c8c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Plus className="h-4 w-4 text-[#fec707]" />
                  <span>Log WIDA Score</span>
                </button>
              )}
            </div>

            {/* Visual Growth Trajectory Chart */}
            {widaScores.length > 0 ? (
              <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                    Proficiency Growth Over Time
                  </span>
                  <div className="flex items-center space-x-3 text-[11px] font-bold">
                    <span className="flex items-center space-x-1 text-[#0635aa]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0635aa]" />
                      <span>Composite</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[#8cacd3]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8cacd3]" />
                      <span>Speaking</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[#7b9626]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7b9626]" />
                      <span>Listening</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[#232f49]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#232f49]" />
                      <span>Reading</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[#fec707]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fec707]" />
                      <span>Writing</span>
                    </span>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <svg className="w-full min-w-[540px] h-56" viewBox="0 0 600 220">
                    {/* Horizontal Level grid lines */}
                    {[1, 2, 3, 4, 5, 6].map((lvl) => {
                      const y = 200 - (lvl / 6) * 180;
                      return (
                        <g key={lvl}>
                          <line x1="50" y1={y} x2="580" y2={y} stroke="#8cacd3" strokeOpacity="0.3" strokeDasharray="3 3" />
                          <text x="35" y={y + 4} fontSize="10" fill="#8cacd3" textAnchor="end">
                            Lv {lvl}
                          </text>
                        </g>
                      );
                    })}

                    {widaScores.length > 1 && (
                      <>
                        {/* Overall Composite solid line */}
                        <polyline
                          fill="none"
                          stroke="#0635aa"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={widaScores
                            .map((s, idx) => {
                              const x = 60 + (idx / (widaScores.length - 1)) * 510;
                              const y = 200 - (s.overallComposite / 6) * 180;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />

                        {/* Speaking */}
                        <polyline
                          fill="none"
                          stroke="#8cacd3"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                          points={widaScores
                            .map((s, idx) => {
                              const x = 60 + (idx / (widaScores.length - 1)) * 510;
                              const y = 200 - (s.speakingScore / 6) * 180;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                        {/* Listening */}
                        <polyline
                          fill="none"
                          stroke="#7b9626"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                          points={widaScores
                            .map((s, idx) => {
                              const x = 60 + (idx / (widaScores.length - 1)) * 510;
                              const y = 200 - (s.listeningScore / 6) * 180;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                        {/* Reading */}
                        <polyline
                          fill="none"
                          stroke="#232f49"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                          points={widaScores
                            .map((s, idx) => {
                              const x = 60 + (idx / (widaScores.length - 1)) * 510;
                              const y = 200 - (s.readingScore / 6) * 180;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                        {/* Writing */}
                        <polyline
                          fill="none"
                          stroke="#fec707"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                          points={widaScores
                            .map((s, idx) => {
                              const x = 60 + (idx / (widaScores.length - 1)) * 510;
                              const y = 200 - (s.writingScore / 6) * 180;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                      </>
                    )}

                    {/* Nodes on points */}
                    {widaScores.map((s, idx) => {
                      const x =
                        widaScores.length === 1
                          ? 300
                          : 60 + (idx / (widaScores.length - 1)) * 510;
                      const y = 200 - (s.overallComposite / 6) * 180;

                      return (
                        <g key={s.id || idx}>
                          <circle cx={x} cy={y} r="6" fill="#0635aa" stroke="#fec707" strokeWidth="2.5" />
                          <text
                            x={x}
                            y={y - 10}
                            fontSize="11"
                            fontWeight="bold"
                            fill="#0635aa"
                            textAnchor="middle"
                          >
                            {s.overallComposite.toFixed(1)}
                          </text>
                          <text
                            x={x}
                            y="216"
                            fontSize="10"
                            fontWeight="500"
                            fill="#232f49"
                            textAnchor="middle"
                          >
                            {s.assessmentDate}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                <Award className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs">No WIDA scores recorded yet for this student.</p>
              </div>
            )}

            {/* WIDA Scores Progression Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3 text-[#0635aa]">Speaking</th>
                    <th className="py-2.5 px-3 text-[#7b9626]">Listening</th>
                    <th className="py-2.5 px-3 text-[#232f49]">Reading</th>
                    <th className="py-2.5 px-3 text-[#d98e16]">Writing</th>
                    <th className="py-2.5 px-4 font-bold text-[#0635aa]">Composite</th>
                    <th className="py-2.5 px-4">Teacher Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {widaScores.map((score, index) => (
                    <tr key={score.id || index} className="hover:bg-[#ebf8ff]/30">
                      <td className="py-3 px-4 font-semibold text-[#232f49]">{score.assessmentDate}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded font-bold bg-[#ebf8ff] text-[#0635aa]">
                          {score.assessmentType}
                        </span>
                      </td>
                      <td className="py-3 px-3">Gr {score.gradeAtAssessment}</td>
                      <td className="py-3 px-3 font-bold text-[#0635aa]">{score.speakingScore.toFixed(1)}</td>
                      <td className="py-3 px-3 font-bold text-[#7b9626]">{score.listeningScore.toFixed(1)}</td>
                      <td className="py-3 px-3 font-bold text-[#232f49]">{score.readingScore.toFixed(1)}</td>
                      <td className="py-3 px-3 font-bold text-[#d98e16]">{score.writingScore.toFixed(1)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0635aa]/15 text-[#0635aa] border border-[#0635aa]/30">
                          {score.overallComposite.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic max-w-xs">{score.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Assessments Timeline (A through H + Custom Formative Points) */}
        {activeTab === 'assessments' && (
          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-bold text-[#0635aa]">Points of Language Proficiency &amp; Formative Portfolios</h3>
                <p className="text-xs text-slate-500">
                  Required benchmarks (A through H) and ongoing formative checkpoints with multimedia evidence.
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                {/* Letter filter buttons */}
                <div className="flex items-center bg-[#ebf8ff] p-0.5 rounded-lg text-xs font-bold flex-wrap gap-0.5 border border-[#8cacd3]/40">
                  <button
                    onClick={() => setSelectedLetterFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      selectedLetterFilter === 'ALL' ? 'bg-[#0635aa] text-white shadow-xs' : 'text-[#0635aa]'
                    }`}
                  >
                    All Points ({assessments.length})
                  </button>
                  <button
                    onClick={() => setSelectedLetterFilter('REQUIRED')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      selectedLetterFilter === 'REQUIRED' ? 'bg-[#0635aa] text-white shadow-xs' : 'text-[#0635aa]'
                    }`}
                  >
                    Required (A–H)
                  </button>
                  {availableLetters.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedLetterFilter(tag)}
                      className={`px-2 py-1 rounded-md transition-colors ${
                        selectedLetterFilter === tag ? 'bg-[#0635aa] text-white shadow-xs font-bold' : 'text-[#0635aa]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {canEditAssessments && (
                  <button
                    onClick={() => onOpenAssessmentEntry(student)}
                    className="bg-[#fec707] hover:bg-[#eab706] text-[#0635aa] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-[#0635aa]" />
                    <span>Record Point of Proficiency</span>
                  </button>
                )}
              </div>
            </div>

            {/* Assessment Cards */}
            {filteredAssessments.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center">
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No assessment points found for this filter</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Click &quot;Record Point of Proficiency&quot; to capture language evidence for {student.firstName}.
                </p>
                {canEditAssessments && (
                  <button
                    onClick={() => onOpenAssessmentEntry(student)}
                    className="mt-3 inline-flex items-center space-x-1.5 bg-[#0635aa] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#052b8a] transition-colors shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5 text-white" />
                    <span>Record Point of Proficiency</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAssessments.map((a) => (
                  <div
                    key={a.id || a.assessmentLetter + a.assessmentDate}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-900 text-white font-semibold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                          {a.assessmentLetter}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-semibold text-slate-900 text-sm">
                              {a.assessmentTitle || `Assessment ${a.assessmentLetter}`}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              Level {a.proficiencyLevel} ({WIDA_LEVELS[a.proficiencyLevel]?.name || 'Proficient'})
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                              Support: {a.supportLevel}
                            </span>
                            {a.category && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {a.category}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-3">
                            <span>Date: <strong className="text-slate-700">{a.assessmentDate}</strong></span>
                            <span>•</span>
                            <span>Modality: <strong className="text-slate-700">{a.languageModality}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 text-right">
                        <span>Assessed by: </span>
                        <strong className="text-slate-700">{a.assessedBy || 'EAL Specialist'}</strong>
                      </div>
                    </div>

                    {/* Standard & Key Language Use */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-0.5">
                          Key Language Use
                        </span>
                        <span className="font-medium text-slate-800">{a.keyLanguageUse}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-0.5">
                          WIDA ELD Standard
                        </span>
                        <span className="font-medium text-slate-800">{a.wideELDStandard}</span>
                      </div>
                    </div>

                    {/* Teacher Observations & Notes */}
                    <div className="mt-3 text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
                      <span className="font-semibold text-slate-900 block mb-1">Teacher Observations &amp; Evidence Analysis:</span>
                      <p className="whitespace-pre-line leading-relaxed">{a.teacherNotes}</p>
                      {a.rubricUsed && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                          <strong>Rubric:</strong> {a.rubricUsed}
                        </div>
                      )}
                    </div>

                    {/* Evidence Files List & Preview Buttons */}
                    {a.evidenceFileURLs && a.evidenceFileURLs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                        <div className="text-xs font-bold text-[#0635aa] flex items-center space-x-1.5">
                          <FileCheck className="h-4 w-4 text-[#0635aa]" />
                          <span>Attached Evidence ({a.evidenceType}):</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {a.evidenceFileURLs.map((url, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedMedia({ url, type: a.evidenceType, title: `${a.assessmentTitle || `Assessment ${a.assessmentLetter}`} Evidence #${idx + 1}` })}
                              className="inline-flex items-center space-x-1 bg-white hover:bg-[#ebf8ff] border border-[#8cacd3] text-[#0635aa] px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs transition-colors"
                            >
                              {a.evidenceType.includes('audio') ? (
                                <Volume2 className="h-3.5 w-3.5 text-[#0635aa]" />
                              ) : a.evidenceType.includes('video') ? (
                                <Play className="h-3.5 w-3.5 text-[#0635aa]" />
                              ) : (
                                <ExternalLink className="h-3.5 w-3.5 text-[#0635aa]" />
                              )}
                              <span>View Evidence #{idx + 1}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Language Profile */}
        {activeTab === 'profile' && (
          <div className="p-5 sm:p-6">
            <LanguageProfileEditor
              student={student}
              initialProfile={languageProfile}
              canEdit={canEditLanguageProfile}
              widaScores={widaScores}
              assessments={assessments}
            />
          </div>
        )}

        {/* Tab 4: Quarterly Support & Projections */}
        {activeTab === 'support' && (
          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-[#0635aa]">Quarterly MTSS Service Delivery History</h3>
                <p className="text-xs text-slate-500">
                  Intervention tracking across quarters (Q1–Q4) and projected support for next academic year.
                </p>
              </div>

              {canEditAssessments && (
                <button
                  onClick={() => onOpenQuarterlySupportModal(student)}
                  className="bg-[#0635aa] hover:bg-[#052c8c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Plus className="h-4 w-4 text-[#fec707]" />
                  <span>Log Quarterly Support</span>
                </button>
              )}
            </div>

            {quarterlySupports.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                <Layers className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs">No quarterly support records logged yet.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">School Year</th>
                      <th className="py-2.5 px-3">Quarter</th>
                      <th className="py-2.5 px-3">Service Tier</th>
                      <th className="py-2.5 px-4">Projected Next Year Service</th>
                      <th className="py-2.5 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {quarterlySupports.map((supp, idx) => (
                      <tr key={supp.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{supp.schoolYear}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {supp.quarter}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium border ${
                              supp.supportLevel.includes('3')
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : supp.supportLevel.includes('2')
                                ? 'bg-blue-50 text-[#0635aa] border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {supp.supportLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {supp.projectedSupportNextYear || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 italic">{supp.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Evidence Modal Viewer */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-[#232f49]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 border border-[#8cacd3]/40">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-[#0635aa] text-sm flex items-center space-x-2">
                <FileCheck className="h-4 w-4 text-[#0635aa]" />
                <span>{selectedMedia.title}</span>
              </h4>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex items-center justify-center bg-[#232f49] rounded-xl overflow-hidden min-h-[240px] max-h-[460px]">
              {selectedMedia.type.includes('audio') ? (
                <div className="p-8 text-center w-full">
                  <Volume2 className="h-12 w-12 text-[#fec707] mx-auto mb-4 animate-bounce" />
                  <audio controls className="w-full max-w-md mx-auto" src={selectedMedia.url} />
                </div>
              ) : selectedMedia.type.includes('video') ? (
                <video controls className="w-full max-h-[420px]" src={selectedMedia.url} autoPlay />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="max-h-[420px] max-w-full object-contain"
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMedia(null)}
                className="bg-slate-100 hover:bg-slate-200 text-[#232f49] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Family Progress Narrative Modal */}
      <ProgressNarrativeModal
        student={student}
        widaScores={widaScores}
        assessments={assessments}
        goals={languageProfile?.currentGoals || []}
        isOpen={isNarrativeModalOpen}
        onClose={() => setIsNarrativeModalOpen(false)}
      />
    </div>
  );
};
