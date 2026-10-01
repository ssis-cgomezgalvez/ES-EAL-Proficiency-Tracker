import {
  AiAssessmentSuggestion,
  AiGoalRecommendation,
  AiLanguageProfileDraft,
  AiParentProgressNarrative,
  AiBatchAnalysis,
  Student,
  WidaScore,
  ProficiencyAssessment,
  LanguageGoal
} from '../types/eal';

export async function getAiAssessmentSuggestion(payload: {
  studentName: string;
  gradeLevel: string;
  homeLanguage: string;
  assessmentLetter: string;
  assessmentTitle?: string;
  keyLanguageUse: string;
  wideELDStandard: string;
  languageModality: string;
  rubricUsed: string;
  teacherNotes: string;
  evidenceType: string;
  evidenceDataUrl?: string;
}): Promise<AiAssessmentSuggestion> {
  const res = await fetch('/api/ai/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`AI Assessment failed (${res.status}): ${errorText}`);
  }
  return res.json();
}

export async function getAiGoalRecommendations(payload: {
  student: Student;
  recentScores: WidaScore[];
  recentAssessments: ProficiencyAssessment[];
}): Promise<AiGoalRecommendation> {
  const res = await fetch('/api/ai/recommend-goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Goal recommendation failed (${res.status}): ${errorText}`);
  }
  return res.json();
}

export async function getAiLanguageProfileDraft(payload: {
  student: Student;
  widaScores: WidaScore[];
  assessments: ProficiencyAssessment[];
}): Promise<AiLanguageProfileDraft> {
  const res = await fetch('/api/ai/draft-language-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Language profile draft failed (${res.status}): ${errorText}`);
  }
  return res.json();
}

export async function getAiParentNarrative(payload: {
  student: Student;
  widaScores: WidaScore[];
  assessments: ProficiencyAssessment[];
  goals: LanguageGoal[];
  homeLanguage?: string;
}): Promise<AiParentProgressNarrative> {
  const res = await fetch('/api/ai/parent-narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Parent narrative generation failed (${res.status}): ${errorText}`);
  }
  return res.json();
}

export async function getAiBatchAnalysis(payload: {
  students: Student[];
}): Promise<AiBatchAnalysis> {
  const res = await fetch('/api/ai/batch-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Batch analysis failed (${res.status}): ${errorText}`);
  }
  return res.json();
}
