import React, { useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  Globe,
  PieChart,
  Users,
  CheckCircle,
  TrendingUp,
  Download,
  Flame,
  Sparkles,
  GraduationCap,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  Layers,
  FileText
} from 'lucide-react';
import { Student, WIDA_LEVELS, GradeLevel, normalizeMtssTier, MTSS_TIERS } from '../types/eal';

interface WidaMatrixViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

interface BatchAnalysisResult {
  generatedAt: string;
  totalStudents: number;
  executiveSummary: string;
  proficiencyDistribution: {
    level: number;
    name: string;
    count: number;
    percentage: number;
  }[];
  tierDistribution: {
    tier: string;
    count: number;
    percentage: number;
  }[];
  growthTrends: string[];
  studentsNeedingSupport: {
    studentId: string;
    name: string;
    grade: string;
    currentTier: string;
    widaLevel: number;
    concernFlag: string;
    actionableIntervention: string;
  }[];
  modalityAnalysis: {
    speakingGrowthObservations: string;
    writingGrowthObservations: string;
    receptiveVsExpressivePatterns: string;
  };
  instructionalRecommendations: string[];
}

export const WidaMatrixView: React.FC<WidaMatrixViewProps> = ({ students, onSelectStudent }) => {
  const grades: GradeLevel[] = ['K', '1', '2', '3', '4', '5'];

  // Subtab: 'matrix' vs 'ai-batch-analytics'
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'ai-batch-analytics'>('matrix');

  // AI Batch Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [batchData, setBatchData] = useState<BatchAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Matrix: Grade x WIDA Level (1 to 6)
  const matrix = useMemo(() => {
    const grid: Record<string, Record<number, Student[]>> = {};

    grades.forEach((g) => {
      grid[g] = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    });

    students.forEach((s) => {
      const roundedLevel = Math.max(1, Math.min(6, Math.floor(s.overallWIDALevel) || 1));
      if (grid[s.gradeLevel]) {
        grid[s.gradeLevel][roundedLevel].push(s);
      }
    });

    return grid;
  }, [students]);

  // Home languages breakdown
  const languageStats = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((s) => {
      map[s.homeLanguage] = (map[s.homeLanguage] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [students]);

  // Support tiers breakdown
  const supportStats = useMemo(() => {
    let tier3 = 0;
    let tier2 = 0;
    let tier1 = 0;

    students.forEach((s) => {
      const tier = normalizeMtssTier(s.currentSupportLevel);
      if (tier === 'Tier 3') tier3++;
      else if (tier === 'Tier 2') tier2++;
      else if (tier === 'Tier 1') tier1++;
    });

    return { tier3, tier2, tier1 };
  }, [students]);

  // Run AI Batch Analysis
  const handleRunBatchAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/ai/batch-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${res.status}`);
      }

      const result: BatchAnalysisResult = await res.json();
      setBatchData(result);
      setActiveSubTab('ai-batch-analytics');
    } catch (err) {
      console.error('Batch analysis error:', err);
      setAnalysisError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // CSV Export for school reporting
  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'First Name',
      'Preferred Name',
      'Last Name',
      'Grade',
      'Homeroom',
      'Homeroom Teacher',
      'Home Language',
      'EAL Status',
      'MTSS Tier',
      'WIDA Overall Level'
    ];

    const rows = students.map((s) => [
      `"${s.studentId}"`,
      `"${s.firstName}"`,
      `"${s.preferredName || ''}"`,
      `"${s.lastName}"`,
      `"${s.gradeLevel}"`,
      `"${s.homeroom}"`,
      `"${s.homeroomTeacher}"`,
      `"${s.homeLanguage}"`,
      `"${s.ealStatus}"`,
      `"${normalizeMtssTier(s.currentSupportLevel)}"`,
      s.overallWIDALevel.toFixed(1)
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SSIS_EAL_Multilingual_Learners_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-[#0635aa]" />
            <span>School-wide WIDA Proficiency Matrix &amp; Cohort Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-grade distribution of multilingual learners across WIDA 2020 Proficiency Levels (1 Entering to 6 Reaching) and language services.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* AI Batch Analysis Trigger Button */}
          <button
            onClick={handleRunBatchAnalysis}
            disabled={isAnalyzing || students.length === 0}
            className="inline-flex items-center space-x-1.5 bg-[#0635aa] hover:bg-[#052c8c] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Analyzing Cohort...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Run AI Batch Analysis</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {analysisError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span>Batch Analysis Error: {analysisError}</span>
        </div>
      )}

      {/* Subtab Navigation: Matrix Grid vs. AI Batch Analytics */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'matrix'
              ? 'border-[#0635aa] text-[#0635aa]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>WIDA Cross-Grade Grid</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('ai-batch-analytics');
            if (!batchData && !isAnalyzing) handleRunBatchAnalysis();
          }}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'ai-batch-analytics'
              ? 'border-[#0635aa] text-[#0635aa]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Administrator Batch Analysis {batchData && '✓'}</span>
        </button>
      </div>

      {/* SUBTAB 1: WIDA Cross-Grade Matrix Grid */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#8cacd3]/40 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0635aa]">
                Grade Level vs. WIDA Proficiency Level Distribution
              </div>
              <div className="text-xs text-slate-500">
                Total Enrolled MLLs: <strong className="text-[#0635aa]">{students.length}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="bg-[#ebf8ff] border-b border-[#8cacd3]/40">
                    <th className="py-3 px-4 text-left font-bold text-[#0635aa] uppercase tracking-wider w-24">
                      Grade
                    </th>
                    {[1, 2, 3, 4, 5, 6].map((lvl) => {
                      const desc = WIDA_LEVELS[lvl];
                      return (
                        <th key={lvl} className="py-3 px-3 font-bold border-l border-[#8cacd3]/30 min-w-[130px]">
                          <div className="text-[#0635aa]">Level {lvl}</div>
                          <div className="text-[10px] font-medium text-[#232f49]/80 truncate">{desc.name}</div>
                        </th>
                      );
                    })}
                    <th className="py-3 px-4 font-bold text-[#0635aa] border-l border-[#8cacd3]/40 bg-[#ebf8ff]/80 w-24">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map((grade) => {
                    const gradeStudents = students.filter((s) => s.gradeLevel === grade);

                    return (
                      <tr key={grade} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-left text-slate-900 bg-slate-50/50">
                          {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                        </td>

                        {[1, 2, 3, 4, 5, 6].map((lvl) => {
                          const cellStudents = matrix[grade]?.[lvl] || [];
                          const desc = WIDA_LEVELS[lvl];

                          return (
                            <td key={lvl} className="py-3 px-3 border-l border-slate-100 align-top">
                              {cellStudents.length > 0 ? (
                                <div className="space-y-1">
                                  <span
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs border ${desc.badgeBg} ${desc.badgeBorder} shadow-2xs`}
                                  >
                                    {cellStudents.length}
                                  </span>

                                  <div className="space-y-0.5 pt-1">
                                    {cellStudents.slice(0, 3).map((st) => (
                                      <button
                                        key={st.studentId}
                                        onClick={() => onSelectStudent(st)}
                                        className="w-full text-left truncate px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors block"
                                        title={`${st.firstName} ${st.lastName} (Lv ${st.overallWIDALevel.toFixed(1)})`}
                                      >
                                        {st.preferredName || st.firstName} ({st.overallWIDALevel.toFixed(1)})
                                      </button>
                                    ))}
                                    {cellStudents.length > 3 && (
                                      <span className="text-[10px] text-slate-400 block italic">
                                        +{cellStudents.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-300 font-light text-sm">—</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="py-3.5 px-4 font-bold text-slate-900 border-l border-slate-200 bg-slate-50/50">
                          {gradeStudents.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Demographics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Home Languages Card */}
            <div className="bg-white rounded-2xl border border-[#8cacd3]/40 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-[#0635aa] text-xs uppercase tracking-wider flex items-center space-x-2">
                <Globe className="h-4 w-4 text-[#0635aa]" />
                <span>Multilingual Linguistic Diversity ({languageStats.length} Languages)</span>
              </h3>

              <div className="space-y-2">
                {languageStats.map(([lang, count]) => {
                  const percent = Math.round((count / (students.length || 1)) * 100);
                  return (
                    <div key={lang} className="text-xs">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>{lang}</span>
                        <span className="font-bold text-[#0635aa]">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#0635aa] h-1.5 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Language Service Delivery Overview */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
                <Layers className="h-4 w-4 text-[#0635aa]" />
                <span>Language Service Delivery Overview</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Tier 3 */}
                <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>Tier 3: Targeted Services (Levels 1–2)</span>
                    <span className="text-amber-950 font-mono tabular-nums font-bold">{supportStats.tier3} learners</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Receiving direct targeted EAL services and daily intensive language scaffold.
                  </p>
                </div>

                {/* Tier 2 */}
                <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>Tier 2: Targeted Services (Levels 3–4)</span>
                    <span className="text-[#0635aa] font-mono tabular-nums font-bold">{supportStats.tier2} learners</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Receiving targeted language scaffolds in small-group and co-taught inquiries.
                  </p>
                </div>

                {/* Tier 1 */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>Tier 1: Monitored (Core Instruction)</span>
                    <span className="text-slate-800 font-mono tabular-nums font-bold">{supportStats.tier1} learners</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Monitored through differentiated core classroom instruction (Levels 5–6).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: AI Administrator Batch Analysis */}
      {activeSubTab === 'ai-batch-analytics' && (
        <div className="space-y-6">
          {isAnalyzing ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-[#0635aa] animate-spin mx-auto" />
              <h3 className="font-bold text-[#0635aa] text-base">
                Synthesizing Cohort Assessment &amp; Growth Data...
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Gemini is cross-referencing WIDA 2020 trajectory standards, modality growth differences, and MTSS service allocation across {students.length} elementary learners.
              </p>
            </div>
          ) : batchData ? (
            <div className="space-y-6 animate-fade-in">
              {/* Executive Summary Card */}
              <div className="bg-[#0635aa] text-white p-6 rounded-2xl border border-[#fec707]/50 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-[#fec707]" />
                    <h3 className="text-base font-bold">
                      Executive Cohort Analytics: Language Acquisition Health
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#8cacd3]">
                    Analyzed {batchData.totalStudents} Learners
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {batchData.executiveSummary}
                </p>

                {/* Key Growth Trends */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#fec707] uppercase tracking-wider block mb-1.5">
                    Identified Growth Trends &amp; Multilingual Asset Patterns:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {batchData.growthTrends.map((trend, i) => (
                      <div key={i} className="bg-white/10 p-2.5 rounded-xl border border-white/20 text-white">
                        • {trend}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Students Needing Additional Support Identification */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        Early Identification: Students Needing Support Adjustment
                      </h4>
                      <p className="text-xs text-slate-500">
                        Multilingual learners identified for service review, intervention adjustment, or intensive scaffolding.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Learner</th>
                        <th className="py-2.5 px-3">Grade</th>
                        <th className="py-2.5 px-3">WIDA Lv</th>
                        <th className="py-2.5 px-3">Service Tier</th>
                        <th className="py-2.5 px-4 text-amber-800 font-semibold">Flag</th>
                        <th className="py-2.5 px-4 text-slate-800 font-semibold">Recommended Intervention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batchData.studentsNeedingSupport.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {item.name}
                            <span className="block text-[10px] font-normal text-slate-400 font-mono tabular-nums">
                              {item.studentId}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">Gr {item.grade}</td>
                          <td className="py-3 px-3 font-mono tabular-nums">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              {item.widaLevel.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {item.currentTier}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-amber-900 max-w-xs">
                            {item.concernFlag}
                          </td>
                          <td className="py-3 px-4 text-[#232f49] max-w-md">
                            {item.actionableIntervention}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modality Comparison & Systemic Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Modality Growth Observations */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                  <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-700" />
                    <span>Language Modalities Comparative Analysis</span>
                  </h4>

                  <div className="space-y-2.5">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-0.5">
                        Speaking vs. Writing Trajectory:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {batchData.modalityAnalysis.speakingGrowthObservations}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-0.5">
                        Writing Growth &amp; Syntactic Complexity:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {batchData.modalityAnalysis.writingGrowthObservations}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-0.5">
                        Receptive vs. Expressive Dynamics:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {batchData.modalityAnalysis.receptiveVsExpressivePatterns}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Systemic Recommendations */}
                <div className="bg-white rounded-2xl border border-[#8cacd3]/40 p-5 shadow-xs space-y-3 text-xs">
                  <h4 className="font-bold text-[#0635aa] text-xs uppercase tracking-wider flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4 text-[#fec707]" />
                    <span>Systemic &amp; Co-Teaching Recommendations</span>
                  </h4>

                  <div className="space-y-2">
                    {batchData.instructionalRecommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="bg-[#fec707]/15 p-3 rounded-xl border border-[#fec707]/50 text-[#232f49] flex items-start space-x-2"
                      >
                        <span className="font-bold text-[#0635aa] mt-0.5">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#8cacd3]/40 p-12 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-[#0635aa] mx-auto animate-pulse" />
              <h3 className="font-bold text-[#0635aa] text-base">
                Generate Cohort Batch Analysis
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Evaluate all {students.length} multilingual learners across grades K-5 to identify trends, flag students requiring increased intervention, and receive systemic recommendations.
              </p>
              <button
                onClick={handleRunBatchAnalysis}
                className="mt-3 inline-flex items-center space-x-2 bg-[#fec707] hover:bg-[#eab706] text-[#0635aa] px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-[#0635aa]" />
                <span>Run AI Cohort Batch Analysis</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
