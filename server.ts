import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Shared Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const GEMINI_MODEL = 'gemini-3.8-flash';

// ==========================================
// 1. AI PROFICIENCY ASSESSMENT ASSISTANT
// ==========================================
app.post('/api/ai/assess', async (req, res) => {
  try {
    const {
      studentName,
      gradeLevel,
      homeLanguage,
      assessmentLetter,
      assessmentTitle,
      keyLanguageUse,
      wideELDStandard,
      languageModality,
      rubricUsed,
      teacherNotes,
      evidenceType,
      evidenceDataUrl,
    } = req.body;

    const parts: any[] = [];

    // If an image/document data URL is provided, attach it as inlineData
    if (evidenceDataUrl && typeof evidenceDataUrl === 'string' && evidenceDataUrl.startsWith('data:')) {
      const match = evidenceDataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        if (mimeType.startsWith('image/')) {
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
      }
    }

    const promptText = `
You are an expert EAL (English as an Additional Language) specialist and WIDA Certified Assessor at Saigon South International School (SSIS).
Analyze the multilingual learner's assessment evidence according to the WIDA 2020 English Language Development (ELD) Standards Framework.

Student Information:
- Name: ${studentName || 'Student'}
- Grade Level: Grade ${gradeLevel || 'Elementary'}
- Home Language: ${homeLanguage || 'Multilingual'}
- Assessment: ${assessmentTitle || `Assessment ${assessmentLetter || 'Checkpoint'}`}
- Key Language Use: ${keyLanguageUse}
- WIDA ELD Standard: ${wideELDStandard}
- Language Modality: ${languageModality}
- Rubric: ${rubricUsed || 'WIDA Proficiency Rubric'}
- Teacher Observations & Evidence Transcript:
"""
${teacherNotes || 'Teacher observed student performance in content inquiry.'}
"""

WIDA Proficiency Levels Reference:
- Level 1 - Entering: Single words, phrases, memorized chunks, formulaic expressions.
- Level 2 - Beginning / Emerging: Phrases, short sentences, formulaic structures, emerging basic syntax.
- Level 3 - Developing: Simple and expanded sentences, emerging syntactic complexity, topic vocabulary.
- Level 4 - Expanding: Variety of sentence lengths, emerging paragraph cohesion, abstract/domain vocabulary.
- Level 5 - Bridging: Variety of sentence lengths and complexity, cohesive devices, nuance, technical academic language.
- Level 6 - Reaching: Technical and abstract content-area language, precise terminology across disciplines without modifications.

SSIS MTSS Tiering Service Guidelines:
- Tier 3: Students in levels 1 and 2 (receiving targeted services).
- Tier 2: Students in levels 3 and 4 (receiving targeted services).
- Tier 1: Students in levels 5 and 6 (monitored through Tier 1 core instruction).

Task:
1. Suggest a WIDA proficiency level (number 1 to 6).
2. Provide a confidence percentage (e.g. 88) and level ('High', 'Moderate', or 'Emerging').
3. Quote specific evidence or observed linguistic features directly from the sample supporting the suggested level.
4. Recommend the matching SSIS MTSS Tier ('Tier 3', 'Tier 2', or 'Tier 1').
5. List 2 to 3 actionable next steps for the teacher and student to foster linguistic growth.
6. Provide a concise rationale paragraph highlighting discourse complexity, sentence forms, and vocabulary usage.
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedLevel: { type: Type.INTEGER, description: '1 to 6 WIDA level' },
            confidencePercent: { type: Type.INTEGER, description: '0 to 100 confidence' },
            confidenceLevel: { type: Type.STRING, description: 'High, Moderate, or Emerging' },
            widaDescriptorRef: { type: Type.STRING, description: 'Short name of WIDA level' },
            evidenceQuotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Specific quotes or linguistic indicators observed',
            },
            suggestedSupportTier: { type: Type.STRING, description: 'Tier 3, Tier 2, or Tier 1' },
            nextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 instructional next steps',
            },
            rationale: { type: Type.STRING, description: 'Pedagogical justification' },
          },
          required: [
            'suggestedLevel',
            'confidencePercent',
            'confidenceLevel',
            'widaDescriptorRef',
            'evidenceQuotes',
            'suggestedSupportTier',
            'nextSteps',
            'rationale',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('AI Assessment error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// ==========================================
// 2. GOAL RECOMMENDATION ENGINE
// ==========================================
app.post('/api/ai/recommend-goals', async (req, res) => {
  try {
    const { student, recentScores, recentAssessments } = req.body;

    const promptText = `
You are an expert EAL specialist crafting student-centered SMART language goals for an elementary student at Saigon South International School (SSIS).
Student Context:
- Name: ${student.firstName} ${student.lastName}
- Grade: ${student.gradeLevel}
- Home Language: ${student.homeLanguage}
- Current WIDA Level: ${student.overallWIDALevel}
- Current MTSS Service Tier: ${student.currentSupportLevel}
- Recent WIDA Scores: ${JSON.stringify(recentScores || [])}
- Recent Assessments: ${JSON.stringify(recentAssessments || [])}

Generate:
1. Three tailored language goals formulated as empowering "I can..." statements with target timelines (e.g. 4-6 weeks), focus modality, and rationale.
2. Recommended research-based classroom scaffolds (e.g., visual graphic organizers, bilingual ${student.homeLanguage} word banks, sentence builders, peer modeling).
3. Two to three focus areas for the next assessment period.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedGoals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  statement: { type: Type.STRING, description: 'I can statement' },
                  targetTimeline: { type: Type.STRING, description: 'Estimated target date or duration' },
                  focusModality: { type: Type.STRING, description: 'Speaking, Writing, Reading, or Listening' },
                  rationale: { type: Type.STRING, description: 'Why this goal fits current growth' },
                },
                required: ['statement', 'targetTimeline', 'focusModality', 'rationale'],
              },
            },
            recommendedScaffolds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            nextFocusAreas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['suggestedGoals', 'recommendedScaffolds', 'nextFocusAreas'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Goal recommendation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// ==========================================
// 3. LANGUAGE PROFILE ASSISTANT
// ==========================================
app.post('/api/ai/draft-language-profile', async (req, res) => {
  try {
    const { student, widaScores, assessments } = req.body;

    const promptText = `
You are the EAL Department Head at Saigon South International School (SSIS).
Synthesize all student assessment data to construct an asset-based Language Profile answering the four core WIDA questions for:
- Student: ${student.firstName} ${student.lastName} (Preferred: ${student.preferredName || student.firstName})
- Grade: ${student.gradeLevel}
- Home Language: ${student.homeLanguage}
- WIDA Overall Level: ${student.overallWIDALevel}
- Formative Assessments & Observation Evidence:
${JSON.stringify(assessments || [], null, 2)}
- Historical WIDA Scores:
${JSON.stringify(widaScores || [], null, 2)}

Provide authentic, detailed bullet points for each of the four WIDA focal areas:
1. whatCanStudentDoWithLanguage (3-4 bullets citing actual observed competencies in speaking, listening, reading, and writing).
2. socialCulturalMultilingualStrengths (3-4 bullets highlighting bilingual assets in ${student.homeLanguage}, cultural background, collaborative skills).
3. concreteFeedbackForGrowth (3-4 actionable pedagogical feedback points).
4. effectiveScaffoldsAndModalities (3-4 classroom accommodations and learning modalities).
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatCanStudentDoWithLanguage: { type: Type.ARRAY, items: { type: Type.STRING } },
            socialCulturalMultilingualStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            concreteFeedbackForGrowth: { type: Type.ARRAY, items: { type: Type.STRING } },
            effectiveScaffoldsAndModalities: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'whatCanStudentDoWithLanguage',
            'socialCulturalMultilingualStrengths',
            'concreteFeedbackForGrowth',
            'effectiveScaffoldsAndModalities',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Language profile draft error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// ==========================================
// 4. PROGRESS NARRATIVE GENERATOR
// ==========================================
app.post('/api/ai/parent-narrative', async (req, res) => {
  try {
    const { student, widaScores, assessments, goals, homeLanguage } = req.body;
    const targetLanguage = homeLanguage || student.homeLanguage || 'Vietnamese';

    const promptText = `
You are the Elementary EAL teacher at Saigon South International School (SSIS).
Write a warm, asset-based, family-friendly progress narrative for the parents of ${student.firstName} ${student.lastName}.
- Grade: ${student.gradeLevel} (Homeroom: ${student.homeroom})
- Family Home Language: ${targetLanguage}
- WIDA Level: ${student.overallWIDALevel}
- Assessments Summary: ${JSON.stringify(assessments || [])}
- Active Language Goals: ${JSON.stringify(goals || [])}

Requirements:
1. Asset-based, celebratory tone highlighting the student's growth and multilingual strengths.
2. English letter with clear sections: warm greeting, overview of language development, key strengths observed in the classroom with concrete examples, practical home support strategies (encouraging continued home language literacy at home!), and an encouraging closing.
3. Accurate, culturally natural translation into the student's home language (${targetLanguage}). Include a complete formatted translated letter so parents can read it comfortably in their native language.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING },
            homeLanguage: { type: Type.STRING },
            englishSummary: {
              type: Type.OBJECT,
              properties: {
                greeting: { type: Type.STRING },
                introduction: { type: Type.STRING },
                currentProficiencySummary: { type: Type.STRING },
                strengthsAndGrowth: { type: Type.ARRAY, items: { type: Type.STRING } },
                concreteExamples: { type: Type.ARRAY, items: { type: Type.STRING } },
                homeSupportStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
                closing: { type: Type.STRING },
              },
              required: [
                'greeting',
                'introduction',
                'currentProficiencySummary',
                'strengthsAndGrowth',
                'concreteExamples',
                'homeSupportStrategies',
                'closing',
              ],
            },
            translatedSummary: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING },
                greeting: { type: Type.STRING },
                introduction: { type: Type.STRING },
                currentProficiencySummary: { type: Type.STRING },
                strengthsAndGrowth: { type: Type.ARRAY, items: { type: Type.STRING } },
                concreteExamples: { type: Type.ARRAY, items: { type: Type.STRING } },
                homeSupportStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
                closing: { type: Type.STRING },
                fullFormattedLetter: { type: Type.STRING },
              },
              required: [
                'language',
                'greeting',
                'introduction',
                'currentProficiencySummary',
                'strengthsAndGrowth',
                'concreteExamples',
                'homeSupportStrategies',
                'closing',
                'fullFormattedLetter',
              ],
            },
          },
          required: ['studentName', 'homeLanguage', 'englishSummary', 'translatedSummary'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Parent narrative error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// ==========================================
// 5. BATCH ANALYSIS FOR ADMINISTRATORS
// ==========================================
app.post('/api/ai/batch-analysis', async (req, res) => {
  try {
    const { students } = req.body;

    const summaryPayload = (students || []).map((s: any) => ({
      id: s.studentId,
      name: `${s.firstName} ${s.lastName}`,
      grade: s.gradeLevel,
      homeroom: s.homeroom,
      homeLanguage: s.homeLanguage,
      status: s.ealStatus,
      tier: s.currentSupportLevel,
      widaLevel: s.overallWIDALevel,
    }));

    const promptText = `
You are an International Elementary School Director of Curriculum and EAL at Saigon South International School (SSIS).
Conduct a comprehensive cohort analytics report on the multilingual student population (${summaryPayload.length} learners).

Cohort Data:
${JSON.stringify(summaryPayload, null, 2)}

Provide:
1. Executive summary of overall language acquisition health and distribution across grades K-5.
2. Proficiency level breakdown (Levels 1 to 6 with counts and percentages).
3. MTSS Tier breakdown (Tier 3 Targeted Services, Tier 2 Targeted Services, Tier 1 Monitored).
4. Major growth trends and multilingual asset patterns across home languages.
5. Specific identification of learners who may need increased intervention (e.g. stalled progress or Tier 3 intensive need) with actionable instructional recommendations.
6. Comparative analysis of language modalities (speaking vs writing differences typical in international elementary learners).
7. Three to four strategic, systemic recommendations for co-teaching, MTSS resource allocation, and professional development.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generatedAt: { type: Type.STRING },
            totalStudents: { type: Type.INTEGER },
            executiveSummary: { type: Type.STRING },
            proficiencyDistribution: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  level: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  count: { type: Type.INTEGER },
                  percentage: { type: Type.NUMBER },
                },
                required: ['level', 'name', 'count', 'percentage'],
              },
            },
            tierDistribution: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tier: { type: Type.STRING },
                  count: { type: Type.INTEGER },
                  percentage: { type: Type.NUMBER },
                },
                required: ['tier', 'count', 'percentage'],
              },
            },
            growthTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
            studentsNeedingSupport: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  studentId: { type: Type.STRING },
                  name: { type: Type.STRING },
                  grade: { type: Type.STRING },
                  currentTier: { type: Type.STRING },
                  widaLevel: { type: Type.NUMBER },
                  concernFlag: { type: Type.STRING },
                  actionableIntervention: { type: Type.STRING },
                },
                required: [
                  'studentId',
                  'name',
                  'grade',
                  'currentTier',
                  'widaLevel',
                  'concernFlag',
                  'actionableIntervention',
                ],
              },
            },
            modalityAnalysis: {
              type: Type.OBJECT,
              properties: {
                speakingGrowthObservations: { type: Type.STRING },
                writingGrowthObservations: { type: Type.STRING },
                receptiveVsExpressivePatterns: { type: Type.STRING },
              },
              required: [
                'speakingGrowthObservations',
                'writingGrowthObservations',
                'receptiveVsExpressivePatterns',
              ],
            },
            instructionalRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'generatedAt',
            'totalStudents',
            'executiveSummary',
            'proficiencyDistribution',
            'tierDistribution',
            'growthTrends',
            'studentsNeedingSupport',
            'modalityAnalysis',
            'instructionalRecommendations',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// ==========================================
// VITE MIDDLEWARE (DEV) / STATIC SERVE (PROD)
// ==========================================
async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SSIS EAL Assessment Server listening at http://0.0.0.0:${port}`);
  });
}

startServer();
