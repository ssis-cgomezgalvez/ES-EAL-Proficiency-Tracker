import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Globe,
  FileText,
  Copy,
  Check,
  Printer,
  Download,
  BookOpen,
  Heart,
  Home,
  MessageSquare,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  Student,
  WidaScore,
  ProficiencyAssessment,
  LanguageGoal,
  COMMON_HOME_LANGUAGES
} from '../types/eal';

interface ProgressNarrativeModalProps {
  student: Student;
  widaScores: WidaScore[];
  assessments: ProficiencyAssessment[];
  goals: LanguageGoal[];
  isOpen: boolean;
  onClose: () => void;
}

interface EnglishSummary {
  greeting: string;
  introduction: string;
  currentProficiencySummary: string;
  strengthsAndGrowth: string[];
  concreteExamples: string[];
  homeSupportStrategies: string[];
  closing: string;
}

interface TranslatedSummary {
  language: string;
  greeting: string;
  introduction: string;
  currentProficiencySummary: string;
  strengthsAndGrowth: string[];
  concreteExamples: string[];
  homeSupportStrategies: string[];
  closing: string;
  fullFormattedLetter: string;
}

interface NarrativeResponse {
  studentName: string;
  homeLanguage: string;
  englishSummary: EnglishSummary;
  translatedSummary: TranslatedSummary;
}

export const ProgressNarrativeModal: React.FC<ProgressNarrativeModalProps> = ({
  student,
  widaScores,
  assessments,
  goals,
  isOpen,
  onClose
}) => {
  const [targetLanguage, setTargetLanguage] = useState<string>(student.homeLanguage || 'Vietnamese');
  const [loading, setLoading] = useState(false);
  const [narrativeData, setNarrativeData] = useState<NarrativeResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [activeView, setActiveView] = useState<'both' | 'translated' | 'english'>('both');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/parent-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          widaScores,
          assessments,
          goals,
          homeLanguage: targetLanguage
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const data: NarrativeResponse = await res.json();
      setNarrativeData(data);
    } catch (err) {
      console.error('Failed to generate progress narrative:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs font-semibold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Multilingual Family Progress Narrative
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Family Bridge
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Asset-based progress summary celebrating {student.firstName}&apos;s multilingual growth, translated into the family&apos;s home language.
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

        {/* Options Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span className="font-semibold text-slate-800 flex items-center space-x-1.5">
              <Globe className="h-4 w-4 text-slate-600" />
              <span>Target Family Language:</span>
            </span>

            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none transition-colors"
            >
              {COMMON_HOME_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
              <option value="Spanish">Spanish</option>
              <option value="German">German</option>
              <option value="Russian">Russian</option>
            </select>

            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">
              Grade {student.gradeLevel} • Homeroom {student.homeroom}
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-[#fec707] hover:bg-[#eab706] text-[#0635aa] px-4 py-2 rounded-xl font-bold shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-[#0635aa]" />
                <span>Crafting Asset Narrative...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#0635aa]" />
                <span>{narrativeData ? 'Regenerate Narrative' : 'Generate Progress Narrative'}</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#f26544]/15 border border-[#f26544]/40 text-[#232f49] text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-[#f26544] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Narrative Presentation */}
        {narrativeData ? (
          <div className="space-y-5">
            {/* View Switcher & Action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-1 bg-[#ebf8ff] p-1 rounded-xl text-xs font-bold border border-[#8cacd3]/40">
                <button
                  onClick={() => setActiveView('both')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeView === 'both' ? 'bg-[#0635aa] text-white shadow-xs' : 'text-[#0635aa]'
                  }`}
                >
                  Side-by-Side (Bilingual)
                </button>
                <button
                  onClick={() => setActiveView('translated')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeView === 'translated' ? 'bg-[#0635aa] text-white shadow-xs' : 'text-[#0635aa]'
                  }`}
                >
                  Family Language ({narrativeData.homeLanguage})
                </button>
                <button
                  onClick={() => setActiveView('english')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeView === 'english' ? 'bg-[#0635aa] text-white shadow-xs' : 'text-[#0635aa]'
                  }`}
                >
                  English Version
                </button>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() =>
                    copyToClipboard(
                      narrativeData.translatedSummary.fullFormattedLetter,
                      'translated'
                    )
                  }
                  className="inline-flex items-center space-x-1.5 bg-white hover:bg-[#ebf8ff] border border-[#8cacd3] text-[#0635aa] px-3 py-1.5 rounded-lg shadow-2xs transition-colors font-bold"
                >
                  {copiedKey === 'translated' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#7b9626]" />
                      <span className="text-[#7b9626]">Copied {narrativeData.homeLanguage}!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#0635aa]" />
                      <span>Copy {narrativeData.homeLanguage} Letter</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center space-x-1.5 bg-white hover:bg-[#ebf8ff] border border-[#8cacd3] text-[#232f49] px-3 py-1.5 rounded-lg shadow-2xs transition-colors font-bold"
                >
                  <Printer className="h-3.5 w-3.5 text-[#0635aa]" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Bilingual Presentation Content */}
            <div
              className={`grid gap-5 ${
                activeView === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {/* Home Language Column */}
              {(activeView === 'both' || activeView === 'translated') && (
                <div className="bg-[#ebf8ff]/50 rounded-2xl p-5 border border-[#8cacd3]/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#8cacd3]/30 pb-2.5">
                    <span className="font-bold text-[#0635aa] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                      <Globe className="h-4 w-4 text-[#fec707]" />
                      <span>Family Translation ({narrativeData.homeLanguage})</span>
                    </span>
                    <span className="text-[11px] text-[#0635aa] font-bold">SSIS Home Language Bridge</span>
                  </div>

                  <div className="space-y-3 text-xs text-[#232f49] leading-relaxed font-normal">
                    <div className="font-bold text-sm text-[#0635aa]">
                      {narrativeData.translatedSummary.greeting}
                    </div>

                    <p>{narrativeData.translatedSummary.introduction}</p>

                    <div className="bg-white p-3 rounded-xl border border-[#8cacd3]/30">
                      <span className="font-bold text-[#0635aa] block mb-1">
                        Tiến bộ ngôn ngữ hiện tại / Language Trajectory:
                      </span>
                      <p>{narrativeData.translatedSummary.currentProficiencySummary}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-[#0635aa] block">Điểm mạnh &amp; Sự tiến bộ (Strengths &amp; Growth):</span>
                      <ul className="list-disc pl-4 space-y-1 text-[#232f49]">
                        {narrativeData.translatedSummary.strengthsAndGrowth.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-[#0635aa] block">Ví dụ cụ thể từ lớp học (Classroom Evidence):</span>
                      <ul className="list-disc pl-4 space-y-1 text-[#232f49]">
                        {narrativeData.translatedSummary.concreteExamples.map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#fec707]/15 p-3 rounded-xl border border-[#fec707]/50 space-y-1">
                      <span className="font-bold text-[#232f49] flex items-center space-x-1.5">
                        <Home className="h-3.5 w-3.5 text-[#0635aa]" />
                        <span>Hỗ trợ tại nhà (Home Support Strategies):</span>
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-[#232f49] text-[11px]">
                        {narrativeData.translatedSummary.homeSupportStrategies.map((strat, i) => (
                          <li key={i}>{strat}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 text-slate-700 italic border-t border-[#8cacd3]/30">
                      {narrativeData.translatedSummary.closing}
                    </div>
                  </div>
                </div>
              )}

              {/* English Version Column */}
              {(activeView === 'both' || activeView === 'english') && (
                <div className="bg-white rounded-2xl p-5 border border-[#8cacd3]/40 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="font-bold text-[#0635aa] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                      <FileText className="h-4 w-4 text-[#0635aa]" />
                      <span>English Progress Narrative</span>
                    </span>
                    <button
                      onClick={() => {
                        const fullText = `${narrativeData.englishSummary.greeting}\n\n${narrativeData.englishSummary.introduction}\n\n${narrativeData.englishSummary.currentProficiencySummary}\n\nStrengths & Growth:\n${narrativeData.englishSummary.strengthsAndGrowth.map((s) => `• ${s}`).join('\n')}\n\nClassroom Evidence:\n${narrativeData.englishSummary.concreteExamples.map((s) => `• ${s}`).join('\n')}\n\nHome Support:\n${narrativeData.englishSummary.homeSupportStrategies.map((s) => `• ${s}`).join('\n')}\n\n${narrativeData.englishSummary.closing}`;
                        copyToClipboard(fullText, 'english');
                      }}
                      className="text-[11px] text-[#0635aa] hover:underline flex items-center space-x-1 font-bold"
                    >
                      {copiedKey === 'english' ? (
                        <span className="text-[#7b9626] font-bold">Copied!</span>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy English</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-[#232f49] leading-relaxed font-normal">
                    <div className="font-bold text-sm text-[#0635aa]">
                      {narrativeData.englishSummary.greeting}
                    </div>

                    <p>{narrativeData.englishSummary.introduction}</p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-1">
                        Proficiency Trajectory &amp; WIDA 2020 Milestones:
                      </span>
                      <p>{narrativeData.englishSummary.currentProficiencySummary}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-semibold text-slate-800 block">Strengths &amp; Language Growth:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {narrativeData.englishSummary.strengthsAndGrowth.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-semibold text-slate-800 block">Classroom Context &amp; Evidence:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {narrativeData.englishSummary.concreteExamples.map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-1">
                      <span className="font-semibold text-amber-900 flex items-center space-x-1.5">
                        <Home className="h-3.5 w-3.5 text-amber-700" />
                        <span>Recommended Home Support:</span>
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                        {narrativeData.englishSummary.homeSupportStrategies.map((strat, i) => (
                          <li key={i}>{strat}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 text-slate-600 italic border-t border-slate-100">
                      {narrativeData.englishSummary.closing}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center space-y-3">
            <Heart className="h-8 w-8 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-slate-800 text-base">
              Ready to Craft {student.firstName}&apos;s Family Letter
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click &quot;Generate Progress Narrative&quot; to synthesize assessment evidence and WIDA scores into a parent-friendly growth report, translated into {targetLanguage}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
