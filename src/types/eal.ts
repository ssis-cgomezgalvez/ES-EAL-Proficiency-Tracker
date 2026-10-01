export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';

export type EalStatus = 'Current' | 'Monitor' | 'Exited';

export type MtssTier = 'Tier 3' | 'Tier 2' | 'Tier 1';

// Backwards-compatible support level strings
export type SupportLevel = 'Tier 3' | 'Tier 2' | 'Tier 1' | 'Intensive' | 'Targeted' | 'Monitored' | string;

export type AssessmentLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | string;

export type AssessmentType = 'Admissions' | 'Annual' | 'Interim';

export type AssessmentCategory = 'Required Benchmark (A–H)' | 'Ongoing Formative Point';

export type KeyLanguageUse = 
  | 'ELD-SI.4-12.Explain'
  | 'ELD-SI.4-12.Argue'
  | 'ELD-SI.4-12.Inform'
  | 'ELD-SI.4-12.Narrate';

export type LanguageModality =
  | 'Expressive-Writing'
  | 'Expressive-Speaking'
  | 'Interpretive-Reading'
  | 'Interpretive-Listening';

export type EvidenceType = 'writing sample' | 'audio recording' | 'video' | 'photo';

export type UserRole = 'eal_teacher' | 'homeroom_teacher' | 'admin';

export interface Student {
  id?: string;
  studentId: string;
  firstName: string;
  preferredName?: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: 'Female' | 'Male' | 'Non-binary' | 'Other';
  homeLanguage: string;
  gradeLevel: GradeLevel;
  homeroom: string;
  homeroomTeacher: string;
  enteredSchoolDate: string;
  profilePhotoURL?: string;
  ealStatus: EalStatus;
  currentSupportLevel: SupportLevel;
  overallWIDALevel: number; // 1.0 - 6.0
  createdAt?: string;
  updatedAt?: string;
}

export interface WidaScore {
  id?: string;
  studentId: string;
  assessmentDate: string;
  assessmentType: AssessmentType;
  speakingScore: number;
  listeningScore: number;
  writingScore: number;
  readingScore: number;
  overallComposite: number;
  gradeAtAssessment: GradeLevel;
  notes?: string;
  assessedBy?: string;
  createdAt?: string;
}

export type ProficiencySubLevel =
  | '1-' | '1' | '1+'
  | '2-' | '2' | '2+'
  | '3-' | '3' | '3+'
  | '4-' | '4' | '4+'
  | '5-' | '5' | '5+'
  | '6-' | '6' | '6+';

export interface ProficiencySubLevelInfo {
  subLevel: ProficiencySubLevel;
  baseLevel: number;
  modifier: '-' | '' | '+';
  name: string; // e.g. "Developing"
  label: string; // e.g. "Level 3- – Developing", "Level 3 – Developing", "Level 3+ – Developing"
  shortLabel: string; // e.g. "Level 3-", "Level 3", "Level 3+"
  numericValue: number; // e.g. 2.8, 3.0, 3.3 for progression charts
  descriptor: string;
}

export const WIDA_SUB_LEVELS: Record<ProficiencySubLevel, ProficiencySubLevelInfo> = {
  '1-': {
    subLevel: '1-',
    baseLevel: 1,
    modifier: '-',
    name: 'Entering',
    label: 'Level 1- – Entering',
    shortLabel: 'Level 1-',
    numericValue: 0.8,
    descriptor: 'Pre-emerging language: responds to gestures and visual cues with isolated words or non-verbal cues.'
  },
  '1': {
    subLevel: '1',
    baseLevel: 1,
    modifier: '',
    name: 'Entering',
    label: 'Level 1 – Entering',
    shortLabel: 'Level 1',
    numericValue: 1.0,
    descriptor: 'Single words, memorized chunks, and formulaic phrases with visual scaffolding.'
  },
  '1+': {
    subLevel: '1+',
    baseLevel: 1,
    modifier: '+',
    name: 'Entering',
    label: 'Level 1+ – Entering',
    shortLabel: 'Level 1+',
    numericValue: 1.3,
    descriptor: 'Emerging beyond single words into paired words, repetitive sentence patterns, and modeled structures.'
  },
  '2-': {
    subLevel: '2-',
    baseLevel: 2,
    modifier: '-',
    name: 'Emerging',
    label: 'Level 2- – Emerging',
    shortLabel: 'Level 2-',
    numericValue: 1.8,
    descriptor: 'Beginning to form short patterned phrases; relies heavily on sentence stems and peer models.'
  },
  '2': {
    subLevel: '2',
    baseLevel: 2,
    modifier: '',
    name: 'Emerging',
    label: 'Level 2 – Emerging',
    shortLabel: 'Level 2',
    numericValue: 2.0,
    descriptor: 'Phrases and short simple sentences with high-frequency vocabulary and visual supports.'
  },
  '2+': {
    subLevel: '2+',
    baseLevel: 2,
    modifier: '+',
    name: 'Emerging',
    label: 'Level 2+ – Emerging',
    shortLabel: 'Level 2+',
    numericValue: 2.4,
    descriptor: 'Consistently produces simple sentences and begins attempting compound sentences with connectors like "and".'
  },
  '3-': {
    subLevel: '3-',
    baseLevel: 3,
    modifier: '-',
    name: 'Developing',
    label: 'Level 3- – Developing',
    shortLabel: 'Level 3-',
    numericValue: 2.8,
    descriptor: 'Early developing: combines simple sentences; emerging general content vocabulary with occasional errors in tense or agreement.'
  },
  '3': {
    subLevel: '3',
    baseLevel: 3,
    modifier: '',
    name: 'Developing',
    label: 'Level 3 – Developing',
    shortLabel: 'Level 3',
    numericValue: 3.0,
    descriptor: 'Expanded sentences with compound structures, recognizable paragraph organization, and general academic terms.'
  },
  '3+': {
    subLevel: '3+',
    baseLevel: 3,
    modifier: '+',
    name: 'Developing',
    label: 'Level 3+ – Developing',
    shortLabel: 'Level 3+',
    numericValue: 3.4,
    descriptor: 'Solid developing: begins attempting complex clauses (because, although) and specific domain vocabulary.'
  },
  '4-': {
    subLevel: '4-',
    baseLevel: 4,
    modifier: '-',
    name: 'Expanding',
    label: 'Level 4- – Expanding',
    shortLabel: 'Level 4-',
    numericValue: 3.8,
    descriptor: 'Early expanding: produces connected paragraphs and varied sentence structures with emerging precision.'
  },
  '4': {
    subLevel: '4',
    baseLevel: 4,
    modifier: '',
    name: 'Expanding',
    label: 'Level 4 – Expanding',
    shortLabel: 'Level 4',
    numericValue: 4.0,
    descriptor: 'Complex linguistic structures, specific academic vocabulary, and clear cohesive discourse.'
  },
  '4+': {
    subLevel: '4+',
    baseLevel: 4,
    modifier: '+',
    name: 'Expanding',
    label: 'Level 4+ – Expanding',
    shortLabel: 'Level 4+',
    numericValue: 4.4,
    descriptor: 'Strong expanding: fluent expression across multiple paragraphs with minimal grammatical or lexical errors.'
  },
  '5-': {
    subLevel: '5-',
    baseLevel: 5,
    modifier: '-',
    name: 'Bridging',
    label: 'Level 5- – Bridging',
    shortLabel: 'Level 5-',
    numericValue: 4.8,
    descriptor: 'Early bridging: expresses complex thoughts with specialized academic words; near peer-level fluency.'
  },
  '5': {
    subLevel: '5',
    baseLevel: 5,
    modifier: '',
    name: 'Bridging',
    label: 'Level 5 – Bridging',
    shortLabel: 'Level 5',
    numericValue: 5.0,
    descriptor: 'Nuanced ideas with technical and abstract academic language comparable to native English proficient peers.'
  },
  '5+': {
    subLevel: '5+',
    baseLevel: 5,
    modifier: '+',
    name: 'Bridging',
    label: 'Level 5+ – Bridging',
    shortLabel: 'Level 5+',
    numericValue: 5.4,
    descriptor: 'Masterful bridging: sophisticated rhetorical devices, nominalization, and advanced discipline-specific register.'
  },
  '6-': {
    subLevel: '6-',
    baseLevel: 6,
    modifier: '-',
    name: 'Reaching',
    label: 'Level 6- – Reaching',
    shortLabel: 'Level 6-',
    numericValue: 5.8,
    descriptor: 'Approaching full grade-level command across all expressive and interpretive modalities.'
  },
  '6': {
    subLevel: '6',
    baseLevel: 6,
    modifier: '',
    name: 'Reaching',
    label: 'Level 6 – Reaching',
    shortLabel: 'Level 6',
    numericValue: 6.0,
    descriptor: 'Specialized grade-level language across all academic content areas without modification.'
  },
  '6+': {
    subLevel: '6+',
    baseLevel: 6,
    modifier: '+',
    name: 'Reaching',
    label: 'Level 6+ – Reaching',
    shortLabel: 'Level 6+',
    numericValue: 6.2,
    descriptor: 'Distinguished proficiency: exceptional stylistic elegance, versatility, and analytical precision.'
  }
};

export const ALL_SUB_LEVEL_KEYS: ProficiencySubLevel[] = [
  '1-', '1', '1+',
  '2-', '2', '2+',
  '3-', '3', '3+',
  '4-', '4', '4+',
  '5-', '5', '5+',
  '6-', '6', '6+'
];

export function formatProficiencyBadge(level: number, subLevel?: ProficiencySubLevel): string {
  if (subLevel && WIDA_SUB_LEVELS[subLevel]) {
    return WIDA_SUB_LEVELS[subLevel].label;
  }
  const intLvl = Math.max(1, Math.min(6, Math.round(level)));
  const name = WIDA_LEVELS[intLvl]?.name || 'Proficient';
  return `Level ${level} – ${name}`;
}

export interface ProficiencyAssessment {
  id?: string;
  studentId: string;
  assessmentLetter: AssessmentLetter;
  assessmentTitle?: string; // Optional custom title for ongoing formative checkpoints
  category?: AssessmentCategory; // 'Required Benchmark (A–H)' or 'Ongoing Formative Point'
  assessmentDate: string;
  keyLanguageUse: KeyLanguageUse;
  wideELDStandard: string;
  languageModality: LanguageModality;
  proficiencyLevel: number; // 1-6
  proficiencySubLevel?: ProficiencySubLevel; // e.g. '3-', '3', '3+'
  supportLevel: string; // e.g. "Tier 3", "Tier 2", "Tier 1"
  evidenceFileURLs: string[];
  evidenceType: EvidenceType;
  rubricUsed: string;
  rubricDimensionScores?: Record<string, { level: ProficiencySubLevel; score: number; dimensionName?: string }>;
  teacherNotes: string;
  assessedBy: string;
  aiSuggestedLevel?: number;
  aiSuggestedSubLevel?: ProficiencySubLevel;
  aiConfidence?: number;
  aiEvidenceNotes?: string;
  createdAt?: string;
}

export interface LanguageGoal {
  id: string;
  text: string;
  targetDate: string;
  status: 'In Progress' | 'Achieved' | 'Needs Review';
}

export interface LanguageProfile {
  id?: string;
  studentId: string;
  lastUpdated: string;
  whatCanStudentDoWithLanguage: string[];
  socialCulturalMultilingualStrengths: string[];
  concreteFeedbackForGrowth: string[];
  effectiveScaffoldsAndModalities: string[];
  currentGoals: LanguageGoal[];
}

export interface QuarterlySupport {
  id?: string;
  studentId: string;
  schoolYear: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  supportLevel: SupportLevel;
  projectedSupportNextYear: string;
  notes?: string;
  createdAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  homeroomGrade?: string;
}

export interface MtssTierInfo {
  tier: MtssTier;
  serviceName: string;
  shortName: string;
  targetLevels: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  pillClass: string;
}

export const MTSS_TIERS: Record<MtssTier, MtssTierInfo> = {
  'Tier 3': {
    tier: 'Tier 3',
    serviceName: 'Targeted Services (Levels 1–2)',
    shortName: 'Tier 3 (Lv 1–2)',
    targetLevels: 'Proficiency Levels 1.0 – 2.9',
    description: 'Students in Tier 3 receive targeted services for proficiency levels 1 and 2.',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-200',
    pillClass: 'bg-amber-50 text-amber-900 border-amber-200'
  },
  'Tier 2': {
    tier: 'Tier 2',
    serviceName: 'Targeted Services (Levels 3–4)',
    shortName: 'Tier 2 (Lv 3–4)',
    targetLevels: 'Proficiency Levels 3.0 – 4.9',
    description: 'Students in Tier 2 receive targeted language services for levels 3 and 4.',
    badgeBg: 'bg-blue-50 text-[#0635aa] border-blue-200',
    badgeText: 'text-[#0635aa]',
    badgeBorder: 'border-blue-200',
    pillClass: 'bg-blue-50 text-[#0635aa] border-blue-200'
  },
  'Tier 1': {
    tier: 'Tier 1',
    serviceName: 'Monitored (Tier 1 Instruction)',
    shortName: 'Tier 1 (Monitored)',
    targetLevels: 'Proficiency Levels 5.0 – 6.0',
    description: "Students do not receive specific services; they are monitored and supported through Tier 1 core classroom instruction.",
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    pillClass: 'bg-slate-100 text-slate-700 border-slate-200'
  }
};

export function normalizeMtssTier(level?: string): MtssTier {
  if (!level) return 'Tier 2';
  const clean = level.trim().toLowerCase();
  if (clean.includes('3') || clean.includes('intensive') || clean.includes('services')) {
    return 'Tier 3';
  }
  if (clean.includes('1') || clean.includes('monitor') || clean.includes('core')) {
    return 'Tier 1';
  }
  return 'Tier 2';
}

export interface WidaDescriptor {
  level: number;
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  generalCanDo: string;
  linguisticCharacteristics: string;
}

export const WIDA_LEVELS: Record<number, WidaDescriptor> = {
  1: {
    level: 1,
    name: 'Entering',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    generalCanDo: 'Understands and produces words, phrases, and short chunks of language with sensory or visual scaffolding.',
    linguisticCharacteristics: 'Single words, phrases, memorized chunks, formulaic expressions.'
  },
  2: {
    level: 2,
    name: 'Beginning',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
    generalCanDo: 'Understands and produces phrases and short sentences; relies on graphic organizers and modeling.',
    linguisticCharacteristics: 'Phrases, short sentences, emerging sentence structures, formulaic frames.'
  },
  3: {
    level: 3,
    name: 'Developing',
    badgeBg: 'bg-blue-50 text-[#0635aa] border-blue-200',
    badgeText: 'text-[#0635aa]',
    badgeBorder: 'border-blue-200',
    generalCanDo: 'Understands and produces expanded sentences with emerging academic vocabulary and contextual scaffolds.',
    linguisticCharacteristics: 'Simple and expanded sentences, emerging syntactic complexity, content vocabulary.'
  },
  4: {
    level: 4,
    name: 'Expanding',
    badgeBg: 'bg-blue-50 text-[#0635aa] border-blue-200',
    badgeText: 'text-[#0635aa]',
    badgeBorder: 'border-blue-200',
    generalCanDo: 'Understands and produces complex linguistic structures with minimal language scaffolding.',
    linguisticCharacteristics: 'Variety of sentence lengths, emerging paragraph cohesion, abstract vocabulary.'
  },
  5: {
    level: 5,
    name: 'Bridging',
    badgeBg: 'bg-indigo-50 text-[#0635aa] border-indigo-200',
    badgeText: 'text-[#0635aa]',
    badgeBorder: 'border-indigo-200',
    generalCanDo: 'Expresses nuanced ideas using technical and abstract academic language comparable to English proficient peers.',
    linguisticCharacteristics: 'Variety of sentence lengths and complexity, cohesive devices, nuance.'
  },
  6: {
    level: 6,
    name: 'Reaching',
    badgeBg: 'bg-indigo-50 text-[#0635aa] border-indigo-200',
    badgeText: 'text-[#0635aa]',
    badgeBorder: 'border-indigo-200',
    generalCanDo: 'Specialized grade-level language across all academic content areas without modification.',
    linguisticCharacteristics: 'Technical and abstract content-area language, precise domain terminology.'
  }
};

// ================= AI ASSISTANT TYPES =================
export interface AiAssessmentSuggestion {
  suggestedLevel: number;
  confidencePercent: number;
  confidenceLevel: 'High' | 'Moderate' | 'Emerging';
  widaDescriptorRef: string;
  evidenceQuotes: string[];
  suggestedSupportTier: MtssTier;
  nextSteps: string[];
  rationale: string;
}

export interface AiGoalRecommendation {
  suggestedGoals: {
    statement: string; // "I can..."
    targetTimeline: string;
    focusModality: string;
    rationale: string;
  }[];
  recommendedScaffolds: string[];
  nextFocusAreas: string[];
}

export interface AiLanguageProfileDraft {
  whatCanStudentDoWithLanguage: string[];
  socialCulturalMultilingualStrengths: string[];
  concreteFeedbackForGrowth: string[];
  effectiveScaffoldsAndModalities: string[];
}

export interface AiParentProgressNarrative {
  studentName: string;
  homeLanguage: string;
  englishSummary: {
    greeting: string;
    introduction: string;
    currentProficiencySummary: string;
    strengthsAndGrowth: string[];
    concreteExamples: string[];
    homeSupportStrategies: string[];
    closing: string;
  };
  translatedSummary?: {
    language: string;
    greeting: string;
    introduction: string;
    currentProficiencySummary: string;
    strengthsAndGrowth: string[];
    concreteExamples: string[];
    homeSupportStrategies: string[];
    closing: string;
    fullFormattedLetter: string;
  };
}

export interface AiBatchAnalysis {
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

export const COMMON_HOME_LANGUAGES = [
  'Vietnamese',
  'Korean',
  'Mandarin Chinese',
  'Japanese',
  'French',
  'Thai',
  'Spanish',
  'German',
  'Hindi',
  'Russian',
  'Tagalog',
  'Indonesian',
  'Other'
];

export const KEY_LANGUAGE_USES: { id: KeyLanguageUse; label: string; description: string }[] = [
  {
    id: 'ELD-SI.4-12.Explain',
    label: 'Explain (ELD-SI.4-12.Explain)',
    description: 'Construct accounts of how and why phenomena work, causal chains, and procedural relationships.'
  },
  {
    id: 'ELD-SI.4-12.Argue',
    label: 'Argue (ELD-SI.4-12.Argue)',
    description: 'Construct, justify, and critique claims and counterclaims with relevant supporting evidence.'
  },
  {
    id: 'ELD-SI.4-12.Inform',
    label: 'Inform (ELD-SI.4-12.Inform)',
    description: 'Define, categorize, compare, and describe characteristics, patterns, or key entities.'
  },
  {
    id: 'ELD-SI.4-12.Narrate',
    label: 'Narrate (ELD-SI.4-12.Narrate)',
    description: 'Construct chronological or thematic sequences of events with perspectives and temporal markers.'
  }
];

export const WIDA_ELD_STANDARDS = [
  { id: 'ELD-LA.K-1.Narrate.Expressive', name: 'ELD-LA.K-1: Narrate in Language Arts (Expressive)' },
  { id: 'ELD-LA.2-3.Inform.Expressive', name: 'ELD-LA.2-3: Inform in Language Arts (Expressive)' },
  { id: 'ELD-LA.4-5.Inform.Interpretive', name: 'ELD-LA.4-5: Inform in Language Arts (Interpretive)' },
  { id: 'ELD-LA.4-5.Argue.Expressive', name: 'ELD-LA.4-5: Argue in Language Arts (Expressive)' },
  { id: 'ELD-MA.2-3.Explain.Expressive', name: 'ELD-MA.2-3: Explain in Mathematics (Expressive)' },
  { id: 'ELD-MA.4-5.Explain.Expressive', name: 'ELD-MA.4-5: Explain in Mathematics (Expressive)' },
  { id: 'ELD-SC.2-3.Inform.Interpretive', name: 'ELD-SC.2-3: Inform in Science (Interpretive)' },
  { id: 'ELD-SC.4-5.Explain.Expressive', name: 'ELD-SC.4-5: Explain in Science (Expressive)' },
  { id: 'ELD-SC.4-5.Argue.Expressive', name: 'ELD-SC.4-5: Argue in Science (Expressive)' },
  { id: 'ELD-SS.2-3.Narrate.Interpretive', name: 'ELD-SS.2-3: Narrate in Social Studies (Interpretive)' },
  { id: 'ELD-SS.4-5.Inform.Expressive', name: 'ELD-SS.4-5: Inform in Social Studies (Expressive)' },
  { id: 'ELD-SS.4-5.Argue.Expressive', name: 'ELD-SS.4-5: Argue in Social Studies (Expressive)' }
];

// ================= NOTIFICATION & WINDOW SYSTEM TYPES =================
export type NotificationType = 'window_reminder' | 'due_check' | 'growth_flag';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface EalNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  dueDate?: string;
  daysRemaining?: number;
  actionLabel?: string;
  createdAt: string;
  read?: boolean;
}

export interface AssessmentWindow {
  id: string;
  name: string;
  period: string;
  targetAssessments: string;
  startDate: string;
  endDate: string;
  description: string;
}

export const ASSESSMENT_WINDOWS: AssessmentWindow[] = [
  {
    id: 'fall_benchmarks',
    name: 'Fall WIDA Benchmark Window',
    period: 'Q1 (September – October)',
    targetAssessments: 'Assessments A & B',
    startDate: '2024-09-01',
    endDate: '2024-10-31',
    description: 'Initial formative language proficiency baseline & classroom scaffold placement.'
  },
  {
    id: 'winter_interim',
    name: 'Winter Interim Checkpoint Window',
    period: 'Q2 (January – February)',
    targetAssessments: 'Assessments C, D & E',
    startDate: '2025-01-06',
    endDate: '2025-02-28',
    description: 'Mid-year language trajectory verification, MTSS tier review, and ACCESS prep.'
  },
  {
    id: 'spring_annual',
    name: 'Spring Annual Evaluation & Transition Window',
    period: 'Q4 (April – May)',
    targetAssessments: 'Assessments F, G & H',
    startDate: '2025-04-07',
    endDate: '2025-05-30',
    description: 'Summative proficiency verification, next-year MTSS projection & handoff transition.'
  }
];

