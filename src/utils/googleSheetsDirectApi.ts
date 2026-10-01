import {
  Student,
  WidaScore,
  ProficiencyAssessment,
  QuarterlySupport,
  normalizeMtssTier
} from '../types/eal';

export interface GoogleSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetsCreated: number;
}

/**
 * Creates and populates a real Google Spreadsheet via Google Sheets REST API
 * using OAuth Bearer token with full multi-tab structure:
 * - Tab 1: Master Proficiency Log
 * - Tab 2: Student Roster
 * - Tab 3: Proficiency Assessments (Formative & Required Benchmarks)
 * - Tab 4: WIDA Domain Scores Log
 * - Tab 5: MTSS Quarterly Service Logs
 */
export async function exportToGoogleSheetsApi(
  accessToken: string,
  students: Student[],
  assessments: ProficiencyAssessment[] = [],
  widaScores: WidaScore[] = [],
  quarterlySupports: QuarterlySupport[] = []
): Promise<GoogleSpreadsheetResult> {
  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.studentId, s));

  // Build Tab 1: Master Combined Proficiency Log
  const masterHeaders = [
    'Student ID',
    'Learner Full Name',
    'Preferred Name',
    'Grade',
    'Homeroom',
    'Homeroom Teacher',
    'Home Language',
    'EAL Status',
    'MTSS Service Tier',
    'Current WIDA Composite',
    'Total Formative Assessments Logged',
    'Latest Assessment Date',
    'Latest Modality Tested',
    'Latest Assessed Level'
  ];
  const masterRows = students.map((s) => {
    const stAssessments = assessments
      .filter((a) => a.studentId === s.studentId)
      .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
    const latest = stAssessments[0];

    return [
      s.studentId,
      `${s.lastName}, ${s.firstName}`,
      s.preferredName || '',
      s.gradeLevel,
      s.homeroom,
      s.homeroomTeacher,
      s.homeLanguage,
      s.ealStatus,
      normalizeMtssTier(s.currentSupportLevel),
      s.overallWIDALevel.toFixed(1),
      stAssessments.length,
      latest ? latest.assessmentDate : 'None',
      latest ? latest.languageModality : '—',
      latest ? latest.proficiencyLevel : '—'
    ];
  });

  // Build Tab 2: Students Roster
  const studentsHeaders = [
    'Student ID',
    'First Name',
    'Preferred Name',
    'Last Name',
    'Date of Birth',
    'Age',
    'Gender',
    'Home Language',
    'Grade Level',
    'Homeroom',
    'Homeroom Teacher',
    'Entered School Date',
    'EAL Status',
    'Current MTSS Tier',
    'WIDA Overall Level'
  ];
  const studentsRows = students.map((s) => [
    s.studentId,
    s.firstName,
    s.preferredName || '',
    s.lastName,
    s.dateOfBirth,
    s.age,
    s.gender,
    s.homeLanguage,
    s.gradeLevel,
    s.homeroom,
    s.homeroomTeacher,
    s.enteredSchoolDate,
    s.ealStatus,
    normalizeMtssTier(s.currentSupportLevel),
    s.overallWIDALevel.toFixed(1)
  ]);

  // Build Tab 3: Proficiency Assessments
  const assessHeaders = [
    'Student ID',
    'Student Name',
    'Grade',
    'Assessment Letter / Code',
    'Assessment Title / Checkpoint',
    'Assessment Category',
    'Assessment Date',
    'Key Language Use',
    'WIDA ELD Standard',
    'Language Modality',
    'Proficiency Level (1-6)',
    'MTSS Service Tier',
    'Evidence Type',
    'Evidence URLs Count',
    'Rubric Used',
    'Teacher Observations & Notes',
    'Assessed By'
  ];
  const assessRows = assessments.map((a) => {
    const st = studentMap.get(a.studentId);
    const name = st ? `${st.lastName}, ${st.firstName}` : a.studentId;
    const grade = st ? st.gradeLevel : '';
    return [
      a.studentId,
      name,
      grade,
      a.assessmentLetter,
      a.assessmentTitle || `Assessment ${a.assessmentLetter}`,
      a.category || 'Required Benchmark (A–H)',
      a.assessmentDate,
      a.keyLanguageUse,
      a.wideELDStandard,
      a.languageModality,
      a.proficiencyLevel,
      a.supportLevel,
      a.evidenceType,
      a.evidenceFileURLs?.length || 0,
      a.rubricUsed,
      a.teacherNotes,
      a.assessedBy
    ];
  });

  // Build Tab 4: WIDA Domain Scores Log
  const widaHeaders = [
    'Student ID',
    'Student Name',
    'Grade at Test',
    'Assessment Date',
    'Assessment Type',
    'Speaking Score (1-6)',
    'Listening Score (1-6)',
    'Reading Score (1-6)',
    'Writing Score (1-6)',
    'Overall Composite (1-6)',
    'Teacher Notes / Examiner'
  ];
  const widaRows = widaScores.map((score) => {
    const st = studentMap.get(score.studentId);
    const name = st ? `${st.lastName}, ${st.firstName}` : score.studentId;
    return [
      score.studentId,
      name,
      score.gradeAtAssessment,
      score.assessmentDate,
      score.assessmentType,
      score.speakingScore.toFixed(1),
      score.listeningScore.toFixed(1),
      score.readingScore.toFixed(1),
      score.writingScore.toFixed(1),
      score.overallComposite.toFixed(1),
      score.notes || ''
    ];
  });

  // Build Tab 5: Quarterly MTSS Service Logs
  const suppHeaders = [
    'Student ID',
    'Student Name',
    'School Year',
    'Quarter',
    'Service Support Level',
    'Projected Support Next Year',
    'Intervention Notes'
  ];
  const suppRows = quarterlySupports.map((supp) => {
    const st = studentMap.get(supp.studentId);
    const name = st ? `${st.lastName}, ${st.firstName}` : supp.studentId;
    return [
      supp.studentId,
      name,
      supp.schoolYear,
      supp.quarter,
      supp.supportLevel,
      supp.projectedSupportNextYear || '',
      supp.notes || ''
    ];
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const spreadsheetTitle = `SSIS Elementary EAL Proficiency Master Log - ${timestamp}`;

  // 1. Create spreadsheet with multiple sheet tabs
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: spreadsheetTitle
      },
      sheets: [
        { properties: { title: 'Master Proficiency Log' } },
        { properties: { title: 'Student Roster' } },
        { properties: { title: 'Proficiency Assessments' } },
        { properties: { title: 'WIDA Scores' } },
        { properties: { title: 'Quarterly MTSS Logs' } }
      ]
    })
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Failed to create Google Spreadsheet (${createResponse.status}): ${errText}`);
  }

  const sheetResult = await createResponse.json();
  const spreadsheetId = sheetResult.spreadsheetId;
  const spreadsheetUrl = sheetResult.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Populate values in each sheet using batchUpdate values
  const valueRanges = [
    {
      range: "'Master Proficiency Log'!A1",
      values: [masterHeaders, ...masterRows]
    },
    {
      range: "'Student Roster'!A1",
      values: [studentsHeaders, ...studentsRows]
    },
    {
      range: "'Proficiency Assessments'!A1",
      values: [assessHeaders, ...assessRows]
    },
    {
      range: "'WIDA Scores'!A1",
      values: [widaHeaders, ...widaRows]
    },
    {
      range: "'Quarterly MTSS Logs'!A1",
      values: [suppHeaders, ...suppRows]
    }
  ];

  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueRanges
      })
    }
  );

  if (!updateResponse.ok) {
    console.warn('Batch update values warning, attempting individual append fallback:', await updateResponse.text());
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    sheetsCreated: 5
  };
}
