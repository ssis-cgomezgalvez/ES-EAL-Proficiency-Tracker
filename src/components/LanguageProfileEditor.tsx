import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Target,
  Heart,
  Lightbulb,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  Check,
  Layers,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import {
  Student,
  LanguageProfile,
  LanguageGoal,
  WidaScore,
  ProficiencyAssessment,
  AiLanguageProfileDraft,
  AiGoalRecommendation
} from '../types/eal';
import { saveLanguageProfile } from '../firebase/services';

interface LanguageProfileEditorProps {
  student: Student;
  initialProfile: LanguageProfile | null;
  canEdit: boolean;
  widaScores?: WidaScore[];
  assessments?: ProficiencyAssessment[];
}

export const LanguageProfileEditor: React.FC<LanguageProfileEditorProps> = ({
  student,
  initialProfile,
  canEdit,
  widaScores = [],
  assessments = []
}) => {
  // 4 WIDA Question arrays
  const [canDoList, setCanDoList] = useState<string[]>([]);
  const [strengthsList, setStrengthsList] = useState<string[]>([]);
  const [feedbackList, setFeedbackList] = useState<string[]>([]);
  const [scaffoldsList, setScaffoldsList] = useState<string[]>([]);
  const [goals, setGoals] = useState<LanguageGoal[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AI Assistant States
  const [isDraftingProfile, setIsDraftingProfile] = useState(false);
  const [isRecommendingGoals, setIsRecommendingGoals] = useState(false);
  const [aiDraftPreview, setAiDraftPreview] = useState<AiLanguageProfileDraft | null>(null);
  const [aiGoalPreview, setAiGoalPreview] = useState<AiGoalRecommendation | null>(null);
  const [aiFeedbackMessage, setAiFeedbackMessage] = useState<string | null>(null);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);

  // Load initial profile or pre-populate with default template
  useEffect(() => {
    if (initialProfile) {
      setCanDoList(initialProfile.whatCanStudentDoWithLanguage || []);
      setStrengthsList(initialProfile.socialCulturalMultilingualStrengths || []);
      setFeedbackList(initialProfile.concreteFeedbackForGrowth || []);
      setScaffoldsList(initialProfile.effectiveScaffoldsAndModalities || []);
      setGoals(initialProfile.currentGoals || []);
      setLastUpdated(initialProfile.lastUpdated || new Date().toISOString().split('T')[0]);
    } else {
      setCanDoList([
        `Understands grade-appropriate instructional language in ${student.homeroom} with visual supports.`,
        `Expresses basic academic ideas using sentences and learned sentence frames.`,
        `Participates enthusiastically in small group partner conversations.`
      ]);
      setStrengthsList([
        `Rich home language literacy and oral communication skills in ${student.homeLanguage}.`,
        `High motivation to learn and collaborate with international classmates.`,
        `Transfers background knowledge and concept schema from home culture.`
      ]);
      setFeedbackList([
        `Expand academic content vocabulary using thematic word walls.`,
        `Practice past-tense verb morphology and grammatical accuracy.`,
        `Use transition words (e.g., however, furthermore, on the other hand) in written responses.`
      ]);
      setScaffoldsList([
        `Visual graphic organizers and bilingual ${student.homeLanguage}-English glossaries.`,
        `Sentence frames and paragraph stems for speaking and writing tasks.`,
        `Peer buddy language modeling during collaborative inquiries.`
      ]);
      setGoals([
        {
          id: 'g-default-1',
          text: `Produce an organized paragraph with a clear topic sentence, supporting facts, and concluding statement.`,
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'In Progress'
        }
      ]);
      setLastUpdated(new Date().toISOString().split('T')[0]);
    }
  }, [initialProfile, student.studentId]);

  // Debounced Auto-Save trigger
  const triggerAutoSave = (updatedData?: Partial<LanguageProfile>) => {
    if (!canEdit) return;
    setSaveStatus('unsaved');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const profilePayload: LanguageProfile = {
          id: initialProfile?.id,
          studentId: student.studentId,
          lastUpdated: new Date().toISOString(),
          whatCanStudentDoWithLanguage: updatedData?.whatCanStudentDoWithLanguage ?? canDoList,
          socialCulturalMultilingualStrengths: updatedData?.socialCulturalMultilingualStrengths ?? strengthsList,
          concreteFeedbackForGrowth: updatedData?.concreteFeedbackForGrowth ?? feedbackList,
          effectiveScaffoldsAndModalities: updatedData?.effectiveScaffoldsAndModalities ?? scaffoldsList,
          currentGoals: updatedData?.currentGoals ?? goals
        };

        await saveLanguageProfile(profilePayload);
        setLastUpdated(new Date().toLocaleDateString());
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to auto-save language profile:', err);
        setSaveStatus('unsaved');
      }
    }, 1200);
  };

  // Helper to update a bullet in an array
  const handleUpdateItem = (
    listType: 'canDo' | 'strengths' | 'feedback' | 'scaffolds',
    index: number,
    value: string
  ) => {
    if (listType === 'canDo') {
      const updated = [...canDoList];
      updated[index] = value;
      setCanDoList(updated);
      triggerAutoSave({ whatCanStudentDoWithLanguage: updated });
    } else if (listType === 'strengths') {
      const updated = [...strengthsList];
      updated[index] = value;
      setStrengthsList(updated);
      triggerAutoSave({ socialCulturalMultilingualStrengths: updated });
    } else if (listType === 'feedback') {
      const updated = [...feedbackList];
      updated[index] = value;
      setFeedbackList(updated);
      triggerAutoSave({ concreteFeedbackForGrowth: updated });
    } else if (listType === 'scaffolds') {
      const updated = [...scaffoldsList];
      updated[index] = value;
      setScaffoldsList(updated);
      triggerAutoSave({ effectiveScaffoldsAndModalities: updated });
    }
  };

  const handleAddItem = (listType: 'canDo' | 'strengths' | 'feedback' | 'scaffolds') => {
    if (listType === 'canDo') {
      const updated = [...canDoList, ''];
      setCanDoList(updated);
    } else if (listType === 'strengths') {
      const updated = [...strengthsList, ''];
      setStrengthsList(updated);
    } else if (listType === 'feedback') {
      const updated = [...feedbackList, ''];
      setFeedbackList(updated);
    } else if (listType === 'scaffolds') {
      const updated = [...scaffoldsList, ''];
      setScaffoldsList(updated);
    }
  };

  const handleDeleteItem = (listType: 'canDo' | 'strengths' | 'feedback' | 'scaffolds', index: number) => {
    if (listType === 'canDo') {
      const updated = canDoList.filter((_, i) => i !== index);
      setCanDoList(updated);
      triggerAutoSave({ whatCanStudentDoWithLanguage: updated });
    } else if (listType === 'strengths') {
      const updated = strengthsList.filter((_, i) => i !== index);
      setStrengthsList(updated);
      triggerAutoSave({ socialCulturalMultilingualStrengths: updated });
    } else if (listType === 'feedback') {
      const updated = feedbackList.filter((_, i) => i !== index);
      setFeedbackList(updated);
      triggerAutoSave({ concreteFeedbackForGrowth: updated });
    } else if (listType === 'scaffolds') {
      const updated = scaffoldsList.filter((_, i) => i !== index);
      setScaffoldsList(updated);
      triggerAutoSave({ effectiveScaffoldsAndModalities: updated });
    }
  };

  // Goal handlers
  const handleAddGoal = () => {
    const newGoal: LanguageGoal = {
      id: 'goal-' + Date.now(),
      text: '',
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress'
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
  };

  const handleUpdateGoal = (id: string, updates: Partial<LanguageGoal>) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    setGoals(updated);
    triggerAutoSave({ currentGoals: updated });
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    triggerAutoSave({ currentGoals: updated });
  };

  // ================= 1. AI LANGUAGE PROFILE DRAFT ASSISTANT =================
  const handleDraftProfileWithAi = async () => {
    setIsDraftingProfile(true);
    setAiErrorMessage(null);
    setAiFeedbackMessage(null);

    try {
      const res = await fetch('/api/ai/draft-language-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          widaScores,
          assessments
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error: ${res.status}`);
      }

      const draft: AiLanguageProfileDraft = await res.json();
      setAiDraftPreview(draft);
    } catch (err) {
      console.error('AI draft error:', err);
      setAiErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDraftingProfile(false);
    }
  };

  const handleApplyAiDraft = () => {
    if (!aiDraftPreview) return;
    setCanDoList(aiDraftPreview.whatCanStudentDoWithLanguage);
    setStrengthsList(aiDraftPreview.socialCulturalMultilingualStrengths);
    setFeedbackList(aiDraftPreview.concreteFeedbackForGrowth);
    setScaffoldsList(aiDraftPreview.effectiveScaffoldsAndModalities);

    triggerAutoSave({
      whatCanStudentDoWithLanguage: aiDraftPreview.whatCanStudentDoWithLanguage,
      socialCulturalMultilingualStrengths: aiDraftPreview.socialCulturalMultilingualStrengths,
      concreteFeedbackForGrowth: aiDraftPreview.concreteFeedbackForGrowth,
      effectiveScaffoldsAndModalities: aiDraftPreview.effectiveScaffoldsAndModalities
    });

    setAiDraftPreview(null);
    setAiFeedbackMessage('AI draft successfully applied to Language Profile! You can edit any line.');
    setTimeout(() => setAiFeedbackMessage(null), 5000);
  };

  // ================= 2. AI GOAL RECOMMENDATION ENGINE =================
  const handleRecommendGoalsWithAi = async () => {
    setIsRecommendingGoals(true);
    setAiErrorMessage(null);
    setAiFeedbackMessage(null);

    try {
      const res = await fetch('/api/ai/recommend-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          currentProfile: {
            whatCanStudentDoWithLanguage: canDoList,
            effectiveScaffoldsAndModalities: scaffoldsList,
            currentGoals: goals
          },
          widaScores,
          assessments
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error: ${res.status}`);
      }

      const recData: AiGoalRecommendation = await res.json();
      setAiGoalPreview(recData);
    } catch (err) {
      console.error('Goal recommendation error:', err);
      setAiErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRecommendingGoals(false);
    }
  };

  const handleInsertRecommendedGoal = (recGoal: {
    statement: string;
    focusModality: string;
    targetTimeline: string;
    rationale: string;
  }) => {
    const newGoal: LanguageGoal = {
      id: 'goal-ai-' + Date.now(),
      text: recGoal.statement,
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress'
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    triggerAutoSave({ currentGoals: updated });
    setAiFeedbackMessage(`Added goal: "${recGoal.statement}"`);
    setTimeout(() => setAiFeedbackMessage(null), 4000);
  };

  const handleInsertRecommendedScaffold = (scaffoldText: string) => {
    if (!scaffoldsList.includes(scaffoldText)) {
      const updated = [...scaffoldsList, scaffoldText];
      setScaffoldsList(updated);
      triggerAutoSave({ effectiveScaffoldsAndModalities: updated });
      setAiFeedbackMessage(`Added scaffold: "${scaffoldText}"`);
      setTimeout(() => setAiFeedbackMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-2xl border border-[#8cacd3]/40 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-[#fec707]" />
            <h3 className="text-base font-bold text-[#0635aa]">
              Multilingual Learner Language Profile &amp; Can-Do Descriptors
            </h3>
          </div>
          <p className="text-xs text-[#232f49]/80 mt-0.5">
            Asset-based framework answering the four core WIDA focal questions for {student.firstName}. Powered by continuous formative evidence.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs flex-wrap gap-y-2">
          {/* Status Indicator */}
          {saveStatus === 'saving' && (
            <span className="flex items-center space-x-1.5 text-[#0635aa] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#0635aa] animate-ping" />
              <span>Saving changes...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center space-x-1.5 text-[#0635aa] font-bold bg-[#ebf8ff] px-2.5 py-1 rounded-md border border-[#8cacd3]">
              <CheckCircle className="h-3.5 w-3.5 text-[#7b9626]" />
              <span>Auto-saved to Firestore</span>
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="flex items-center space-x-1.5 text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>Unsaved edits pending...</span>
            </span>
          )}

          {canEdit && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDraftProfileWithAi}
                disabled={isDraftingProfile}
                className="inline-flex items-center space-x-1.5 bg-[#fec707] hover:bg-[#eab706] text-[#0635aa] px-3.5 py-1.5 rounded-xl font-bold shadow-xs transition-all disabled:opacity-50"
              >
                {isDraftingProfile ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#0635aa]" />
                    <span>Synthesizing Portfolio...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-[#0635aa]" />
                    <span>AI Language Profile Assistant</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRecommendGoalsWithAi}
                disabled={isRecommendingGoals}
                className="inline-flex items-center space-x-1.5 bg-white hover:bg-[#ebf8ff] border border-[#8cacd3] text-[#0635aa] px-3 py-1.5 rounded-xl font-bold shadow-2xs transition-all disabled:opacity-50"
              >
                {isRecommendingGoals ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#0635aa]" />
                    <span>Generating Goals...</span>
                  </>
                ) : (
                  <>
                    <Target className="h-3.5 w-3.5 text-[#0635aa]" />
                    <span>Recommend Goals (AI)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {aiFeedbackMessage && (
        <div className="p-3 rounded-xl bg-[#e7e8da] border border-[#7b9626]/40 text-[#232f49] text-xs flex items-center space-x-2 animate-fade-in font-medium">
          <CheckCircle className="h-4 w-4 text-[#7b9626] flex-shrink-0" />
          <span>{aiFeedbackMessage}</span>
        </div>
      )}

      {aiErrorMessage && (
        <div className="p-3 rounded-xl bg-[#f26544]/15 border border-[#f26544]/40 text-[#232f49] text-xs flex items-center space-x-2 animate-fade-in font-medium">
          <AlertCircle className="h-4 w-4 text-[#f26544] flex-shrink-0" />
          <span>AI Assistance Error: {aiErrorMessage}</span>
        </div>
      )}

      {/* AI DRAFT PREVIEW BANNER with Official SSIS Colors */}
      {aiDraftPreview && (
        <div className="bg-[#0635aa] text-white p-5 rounded-2xl shadow-xl space-y-4 animate-fade-in border border-[#fec707]/60">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-[#fec707]" />
              <h4 className="font-bold text-sm">
                AI Synthesized Draft: 4 WIDA Focal Areas
              </h4>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAiDraftPreview(null)}
                className="text-white/80 hover:text-white text-xs px-2.5 py-1 rounded"
              >
                Discard
              </button>
              <button
                onClick={handleApplyAiDraft}
                className="bg-[#fec707] hover:bg-[#eab706] text-[#0635aa] px-4 py-1.5 rounded-xl font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all"
              >
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Apply Draft to Profile</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/20">
              <span className="font-bold text-[#fec707] block mb-1">
                1. What can the student do with language?
              </span>
              <ul className="list-disc pl-4 space-y-1 text-white/90">
                {aiDraftPreview.whatCanStudentDoWithLanguage.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 p-3.5 rounded-xl border border-white/20">
              <span className="font-bold text-[#fec707] block mb-1">
                2. Social, cultural &amp; multilingual strengths:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-white/90">
                {aiDraftPreview.socialCulturalMultilingualStrengths.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 p-3.5 rounded-xl border border-white/20">
              <span className="font-bold text-[#fec707] block mb-1">
                3. Concrete feedback for growth:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-white/90">
                {aiDraftPreview.concreteFeedbackForGrowth.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 p-3.5 rounded-xl border border-white/20">
              <span className="font-bold text-[#fec707] block mb-1">
                4. Effective scaffolds &amp; modalities:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-white/90">
                {aiDraftPreview.effectiveScaffoldsAndModalities.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* AI GOAL RECOMMENDATION DRAWER */}
      {aiGoalPreview && (
        <div className="bg-white rounded-2xl border border-[#8cacd3]/40 p-5 shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-[#0635aa]" />
              <h4 className="font-bold text-sm text-[#0635aa]">
                AI Goal Recommendation Engine — &quot;I can...&quot; Statements &amp; Scaffolds
              </h4>
            </div>
            <button
              onClick={() => setAiGoalPreview(null)}
              className="text-slate-400 hover:text-[#0635aa] text-xs px-2 py-1"
            >
              ✕ Close
            </button>
          </div>

          {/* Suggested "I can" Goals */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0635aa] uppercase tracking-wider block">
              Suggested Language Goals:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aiGoalPreview.suggestedGoals.map((g, i) => (
                <div
                  key={i}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2.5 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {g.focusModality}
                      </span>
                      <span className="text-slate-400">{g.targetTimeline}</span>
                    </div>
                    <div className="font-semibold text-slate-800 mt-1 leading-snug">
                      &quot;{g.statement}&quot;
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 italic">
                      Rationale: {g.rationale}
                    </p>
                  </div>

                  <button
                    onClick={() => handleInsertRecommendedGoal(g)}
                    className="w-full bg-[#fec707] hover:bg-[#eab706] text-[#0635aa] rounded-lg py-1.5 text-xs font-bold transition-colors flex items-center justify-center space-x-1 shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to Active Goals</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Scaffolds & Next Focus Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-[#fec707]/15 p-3 rounded-xl border border-[#fec707]/60">
              <span className="font-bold text-[#232f49] block mb-1.5 flex items-center space-x-1">
                <Lightbulb className="h-3.5 w-3.5 text-[#0635aa]" />
                <span>Recommended Scaffolds:</span>
              </span>
              <div className="space-y-1">
                {aiGoalPreview.recommendedScaffolds.map((scaff, i) => (
                  <div key={i} className="flex items-center justify-between text-[#232f49] py-0.5">
                    <span>• {scaff}</span>
                    <button
                      onClick={() => handleInsertRecommendedScaffold(scaff)}
                      className="text-[10px] font-bold text-[#0635aa] hover:text-[#052c8c] bg-white px-2 py-0.5 rounded ml-2 flex-shrink-0 shadow-2xs border border-[#8cacd3]/40"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#ebf8ff] p-3 rounded-xl border border-[#8cacd3]">
              <span className="font-bold text-[#0635aa] block mb-1.5">
                Next Assessment Focus Areas:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[#232f49]">
                {aiGoalPreview.nextFocusAreas.map((fa, i) => (
                  <li key={i}>{fa}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4 WIDA Question Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Question 1: What can the student do with language? */}
        <div className="bg-white rounded-2xl border border-[#8cacd3]/40 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#0635aa] text-[#fec707] font-bold text-xs">
                  1
                </span>
                <h4 className="font-bold text-[#0635aa] text-sm">
                  What can the student do with language?
                </h4>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Observed Can-Do linguistic competencies across speaking, listening, reading, and writing.
            </p>

            <div className="space-y-2">
              {canDoList.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2 group">
                  <span className="text-[#0635aa] font-bold mt-1 text-xs">•</span>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={item}
                    placeholder="Enter can-do linguistic capability..."
                    onChange={(e) => handleUpdateItem('canDo', idx, e.target.value)}
                    className="flex-1 text-xs text-[#232f49] bg-transparent hover:bg-[#ebf8ff]/40 focus:bg-white border border-transparent focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 transition-all outline-none"
                  />
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteItem('canDo', idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#f26544] transition-opacity p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {canEdit && (
            <button
              onClick={() => handleAddItem('canDo')}
              className="mt-3 text-xs font-bold text-[#0635aa] hover:text-[#052c8c] flex items-center space-x-1 pt-2 border-t border-slate-100"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Can-Do Observation</span>
            </button>
          )}
        </div>

        {/* Question 2: Social, cultural, and multilingual strengths */}
        <div className="bg-white rounded-2xl border border-[#8cacd3]/40 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#0635aa] text-[#fec707] font-bold text-xs">
                  2
                </span>
                <h4 className="font-bold text-[#0635aa] text-sm">
                  Social, Cultural &amp; Multilingual Strengths
                </h4>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Home language assets in {student.homeLanguage}, cultural funds of knowledge, and collaborative strengths.
            </p>

            <div className="space-y-2">
              {strengthsList.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2 group">
                  <span className="text-[#0635aa] font-bold mt-1 text-xs">•</span>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={item}
                    placeholder="Enter social, cultural or home language strength..."
                    onChange={(e) => handleUpdateItem('strengths', idx, e.target.value)}
                    className="flex-1 text-xs text-[#232f49] bg-transparent hover:bg-[#ebf8ff]/40 focus:bg-white border border-transparent focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 transition-all outline-none"
                  />
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteItem('strengths', idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#f26544] transition-opacity p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {canEdit && (
            <button
              onClick={() => handleAddItem('strengths')}
              className="mt-3 text-xs font-bold text-[#0635aa] hover:text-[#052c8c] flex items-center space-x-1 pt-2 border-t border-slate-100"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Multilingual Strength</span>
            </button>
          )}
        </div>

        {/* Question 3: Concrete feedback for growth */}
        <div className="bg-white rounded-2xl border border-[#8cacd3]/40 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#0635aa] text-[#fec707] font-bold text-xs">
                  3
                </span>
                <h4 className="font-bold text-[#0635aa] text-sm">
                  Concrete Feedback for Growth
                </h4>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Actionable linguistic feedback: sentence forms, vocabulary expansion, discourse complexity.
            </p>

            <div className="space-y-2">
              {feedbackList.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2 group">
                  <span className="text-[#0635aa] font-bold mt-1 text-xs">•</span>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={item}
                    placeholder="Enter targeted growth feedback point..."
                    onChange={(e) => handleUpdateItem('feedback', idx, e.target.value)}
                    className="flex-1 text-xs text-[#232f49] bg-transparent hover:bg-[#ebf8ff]/40 focus:bg-white border border-transparent focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 transition-all outline-none"
                  />
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteItem('feedback', idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#f26544] transition-opacity p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {canEdit && (
            <button
              onClick={() => handleAddItem('feedback')}
              className="mt-3 text-xs font-bold text-[#0635aa] hover:text-[#052c8c] flex items-center space-x-1 pt-2 border-t border-slate-100"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Growth Feedback</span>
            </button>
          )}
        </div>

        {/* Question 4: Effective scaffolds and modalities */}
        <div className="bg-white rounded-2xl border border-[#8cacd3]/40 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#0635aa] text-[#fec707] font-bold text-xs">
                  4
                </span>
                <h4 className="font-bold text-[#0635aa] text-sm">
                  Effective Scaffolds &amp; Modalities
                </h4>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Instructional scaffolds that support access to grade-level content inquiry and language expression.
            </p>

            <div className="space-y-2">
              {scaffoldsList.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2 group">
                  <span className="text-[#0635aa] font-bold mt-1 text-xs">•</span>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={item}
                    placeholder="Enter classroom scaffold or accommodation..."
                    onChange={(e) => handleUpdateItem('scaffolds', idx, e.target.value)}
                    className="flex-1 text-xs text-[#232f49] bg-transparent hover:bg-[#ebf8ff]/40 focus:bg-white border border-transparent focus:border-[#0635aa] rounded-lg px-2.5 py-1.5 transition-all outline-none"
                  />
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteItem('scaffolds', idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#f26544] transition-opacity p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {canEdit && (
            <button
              onClick={() => handleAddItem('scaffolds')}
              className="mt-3 text-xs font-bold text-[#0635aa] hover:text-[#052c8c] flex items-center space-x-1 pt-2 border-t border-slate-100"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Scaffold / Modality</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Language Goals with Target Dates & Status */}
      <div className="bg-white rounded-2xl border border-[#8cacd3]/40 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-[#0635aa] text-sm flex items-center space-x-2">
              <Target className="h-4 w-4 text-[#fec707]" />
              <span>Active Language Goals &amp; Milestones (&quot;I can...&quot; Statements)</span>
            </h4>
            <p className="text-xs text-slate-500">
              SMART language development targets linked to classroom instruction and assessment.
            </p>
          </div>

          {canEdit && (
            <button
              onClick={handleAddGoal}
              className="bg-[#fec707] hover:bg-[#eab706] text-[#0635aa] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-[#0635aa]" />
              <span>Add Goal</span>
            </button>
          )}
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs italic">
            No active goals logged. Click &quot;Add Goal&quot; or &quot;Recommend Goals (AI)&quot; to set targets.
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((g) => (
              <div
                key={g.id}
                className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={g.text}
                    placeholder="Enter &quot;I can...&quot; goal statement..."
                    onChange={(e) => handleUpdateGoal(g.id, { text: e.target.value })}
                    className="w-full font-bold text-[#232f49] bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-[#0635aa] rounded-lg px-2.5 py-1 transition-all outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-[#0635aa]" />
                    <input
                      type="date"
                      disabled={!canEdit}
                      value={g.targetDate}
                      onChange={(e) => handleUpdateGoal(g.id, { targetDate: e.target.value })}
                      className="bg-white border border-[#8cacd3]/50 rounded-lg px-2 py-0.5 text-xs text-[#232f49]"
                    />
                  </div>

                  <select
                    disabled={!canEdit}
                    value={g.status}
                    onChange={(e) =>
                      handleUpdateGoal(g.id, {
                        status: e.target.value as 'In Progress' | 'Achieved' | 'Needs Review'
                      })
                    }
                    className={`px-2 py-1 rounded-lg font-bold text-xs border ${
                      g.status === 'Achieved'
                        ? 'bg-[#e7e8da] text-[#7b9626] border-[#7b9626]/40'
                        : g.status === 'Needs Review'
                        ? 'bg-[#f26544]/15 text-[#232f49] border-[#f26544]/50'
                        : 'bg-[#ebf8ff] text-[#0635aa] border-[#8cacd3]'
                    }`}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Achieved">Achieved</option>
                    <option value="Needs Review">Needs Review</option>
                  </select>

                  {canEdit && (
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-slate-400 hover:text-[#f26544] p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
