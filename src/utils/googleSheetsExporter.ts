import {
  Student,
  WidaScore,
  ProficiencyAssessment,
  QuarterlySupport,
  normalizeMtssTier
} from '../types/eal';

export interface FormattedSheetsData {
  studentsCsv: string;
  widaScoresCsv: string;
  assessmentsCsv: string;
  quarterlySupportCsv: string;
  combinedProficiencyLogCsv: string;
}

/**
 * Generates formatted spreadsheet data matching the existing SSIS EAL proficiency logs.
 */
export function generateGoogleSheetsExportData(
  students: Student[],
  assessments: ProficiencyAssessment[] = [],
  widaScores: WidaScore[] = [],
  quarterlySupports: QuarterlySupport[] = []
): FormattedSheetsData {
  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.studentId, s));

  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // 1. STUDENTS ROSTER
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
    escapeCsv(s.studentId),
    escapeCsv(s.firstName),
    escapeCsv(s.preferredName || ''),
    escapeCsv(s.lastName),
    escapeCsv(s.dateOfBirth),
    escapeCsv(s.age),
    escapeCsv(s.gender),
    escapeCsv(s.homeLanguage),
    escapeCsv(s.gradeLevel),
    escapeCsv(s.homeroom),
    escapeCsv(s.homeroomTeacher),
    escapeCsv(s.enteredSchoolDate),
    escapeCsv(s.ealStatus),
    escapeCsv(normalizeMtssTier(s.currentSupportLevel)),
    escapeCsv(s.overallWIDALevel.toFixed(1))
  ]);

  const studentsCsv = [studentsHeaders.join(','), ...studentsRows.map((r) => r.join(','))].join('\n');

  // 2. WIDA STANDARDIZED SCORES
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
      escapeCsv(score.studentId),
      escapeCsv(name),
      escapeCsv(score.gradeAtAssessment),
      escapeCsv(score.assessmentDate),
      escapeCsv(score.assessmentType),
      escapeCsv(score.speakingScore.toFixed(1)),
      escapeCsv(score.listeningScore.toFixed(1)),
      escapeCsv(score.readingScore.toFixed(1)),
      escapeCsv(score.writingScore.toFixed(1)),
      escapeCsv(score.overallComposite.toFixed(1)),
      escapeCsv(score.notes || '')
    ];
  });

  const widaScoresCsv = [widaHeaders.join(','), ...widaRows.map((r) => r.join(','))].join('\n');

  // 3. PROFICIENCY ASSESSMENTS (Formative Checkpoints & Required A–H)
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
      escapeCsv(a.studentId),
      escapeCsv(name),
      escapeCsv(grade),
      escapeCsv(a.assessmentLetter),
      escapeCsv(a.assessmentTitle || `Assessment ${a.assessmentLetter}`),
      escapeCsv(a.category || 'Required Benchmark (A–H)'),
      escapeCsv(a.assessmentDate),
      escapeCsv(a.keyLanguageUse),
      escapeCsv(a.wideELDStandard),
      escapeCsv(a.languageModality),
      escapeCsv(a.proficiencyLevel),
      escapeCsv(a.supportLevel),
      escapeCsv(a.evidenceType),
      escapeCsv(a.evidenceFileURLs?.length || 0),
      escapeCsv(a.rubricUsed),
      escapeCsv(a.teacherNotes),
      escapeCsv(a.assessedBy)
    ];
  });

  const assessmentsCsv = [assessHeaders.join(','), ...assessRows.map((r) => r.join(','))].join('\n');

  // 4. QUARTERLY MTSS SUPPORT LOGS
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
      escapeCsv(supp.studentId),
      escapeCsv(name),
      escapeCsv(supp.schoolYear),
      escapeCsv(supp.quarter),
      escapeCsv(supp.supportLevel),
      escapeCsv(supp.projectedSupportNextYear || ''),
      escapeCsv(supp.notes || '')
    ];
  });

  const quarterlySupportCsv = [suppHeaders.join(','), ...suppRows.map((r) => r.join(','))].join('\n');

  // 5. MASTER COMBINED PROFICIENCY LOG
  // Combines students, their latest WIDA level, active assessments count, and MTSS tier
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
      escapeCsv(s.studentId),
      escapeCsv(`${s.lastName}, ${s.firstName}`),
      escapeCsv(s.preferredName || ''),
      escapeCsv(s.gradeLevel),
      escapeCsv(s.homeroom),
      escapeCsv(s.homeroomTeacher),
      escapeCsv(s.homeLanguage),
      escapeCsv(s.ealStatus),
      escapeCsv(normalizeMtssTier(s.currentSupportLevel)),
      escapeCsv(s.overallWIDALevel.toFixed(1)),
      escapeCsv(stAssessments.length),
      escapeCsv(latest ? latest.assessmentDate : 'None'),
      escapeCsv(latest ? latest.languageModality : '—'),
      escapeCsv(latest ? latest.proficiencyLevel : '—')
    ];
  });

  const combinedProficiencyLogCsv = [
    masterHeaders.join(','),
    ...masterRows.map((r) => r.join(','))
  ].join('\n');

  return {
    studentsCsv,
    widaScoresCsv,
    assessmentsCsv,
    quarterlySupportCsv,
    combinedProficiencyLogCsv
  };
}

/**
 * Downloads a CSV string as a file
 */
export function downloadCsvFile(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies CSV or tab-separated table to clipboard for direct 1-click paste into Google Sheets
 */
export async function copyToGoogleSheetsClipboard(csvContent: string): Promise<boolean> {
  try {
    // Convert CSV to TSV (tab-separated values) so Google Sheets natively pastes into multiple cells & columns!
    const lines = csvContent.split('\n');
    const tsvLines = lines.map((line) => {
      // Basic parser for quoted CSV
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const cells: string[] = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        let cell = match[1] || '';
        if (cell.startsWith('"') && cell.endsWith('"')) {
          cell = cell.slice(1, -1).replace(/""/g, '"');
        }
        cells.push(cell);
        if (regex.lastIndex >= line.length) break;
      }
      return cells.join('\t');
    });

    const tsv = tsvLines.join('\n');
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
