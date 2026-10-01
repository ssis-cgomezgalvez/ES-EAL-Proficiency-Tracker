import { Student, WidaScore, ProficiencyAssessment, LanguageProfile, QuarterlySupport } from '../types/eal';

export const INITIAL_STUDENTS: Student[] = [
  {
    studentId: 'EAL-2024-001',
    firstName: 'Minh',
    preferredName: 'Leo',
    lastName: 'Nguyen',
    dateOfBirth: '2016-04-12',
    age: 8,
    gender: 'Male',
    homeLanguage: 'Vietnamese',
    gradeLevel: '3',
    homeroom: '3A',
    homeroomTeacher: 'Ms. Sarah Jenkins',
    enteredSchoolDate: '2023-08-15',
    profilePhotoURL: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
    ealStatus: 'Current',
    currentSupportLevel: 'Tier 2',
    overallWIDALevel: 3.4
  },
  {
    studentId: 'EAL-2024-002',
    firstName: 'Ji-woo',
    preferredName: 'Chloe',
    lastName: 'Park',
    dateOfBirth: '2017-09-28',
    age: 7,
    gender: 'Female',
    homeLanguage: 'Korean',
    gradeLevel: '2',
    homeroom: '2B',
    homeroomTeacher: 'Mr. David Miller',
    enteredSchoolDate: '2024-01-08',
    profilePhotoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
    ealStatus: 'Current',
    currentSupportLevel: 'Tier 3',
    overallWIDALevel: 1.8
  },
  {
    studentId: 'EAL-2024-003',
    firstName: 'Yuto',
    preferredName: 'Ken',
    lastName: 'Takahashi',
    dateOfBirth: '2015-11-03',
    age: 9,
    gender: 'Male',
    homeLanguage: 'Japanese',
    gradeLevel: '4',
    homeroom: '4C',
    homeroomTeacher: 'Mrs. Emily Clark',
    enteredSchoolDate: '2022-08-10',
    profilePhotoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
    ealStatus: 'Monitor',
    currentSupportLevel: 'Tier 1',
    overallWIDALevel: 5.1
  },
  {
    studentId: 'EAL-2024-004',
    firstName: 'Zixuan',
    preferredName: 'Andy',
    lastName: 'Chen',
    dateOfBirth: '2014-06-19',
    age: 10,
    gender: 'Male',
    homeLanguage: 'Mandarin Chinese',
    gradeLevel: '5',
    homeroom: '5A',
    homeroomTeacher: 'Mr. Robert Wong',
    enteredSchoolDate: '2023-08-14',
    profilePhotoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=240&auto=format&fit=crop&q=80',
    ealStatus: 'Current',
    currentSupportLevel: 'Tier 2',
    overallWIDALevel: 4.2
  },
  {
    studentId: 'EAL-2024-005',
    firstName: 'Camille',
    preferredName: 'Cami',
    lastName: 'Dubois',
    dateOfBirth: '2018-02-14',
    age: 6,
    gender: 'Female',
    homeLanguage: 'French',
    gradeLevel: '1',
    homeroom: '1A',
    homeroomTeacher: 'Ms. Rebecca Ross',
    enteredSchoolDate: '2024-08-12',
    profilePhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    ealStatus: 'Current',
    currentSupportLevel: 'Tier 3',
    overallWIDALevel: 2.1
  },
  {
    studentId: 'EAL-2024-006',
    firstName: 'Thanakorn',
    preferredName: 'Beam',
    lastName: 'Sompong',
    dateOfBirth: '2016-08-20',
    age: 8,
    gender: 'Male',
    homeLanguage: 'Thai',
    gradeLevel: '3',
    homeroom: '3B',
    homeroomTeacher: 'Ms. Laura Evans',
    enteredSchoolDate: '2022-08-15',
    profilePhotoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    ealStatus: 'Exited',
    currentSupportLevel: 'Tier 1',
    overallWIDALevel: 5.8
  }
];

export const INITIAL_WIDA_SCORES: WidaScore[] = [
  // Leo Nguyen
  {
    studentId: 'EAL-2024-001',
    assessmentDate: '2023-08-20',
    assessmentType: 'Admissions',
    speakingScore: 2.2,
    listeningScore: 2.5,
    writingScore: 1.8,
    readingScore: 2.0,
    overallComposite: 2.1,
    gradeAtAssessment: '2',
    notes: 'Initial admission screener. Student demonstrated high communicative motivation with gestures and home language translanguaging.'
  },
  {
    studentId: 'EAL-2024-001',
    assessmentDate: '2024-01-15',
    assessmentType: 'Interim',
    speakingScore: 3.0,
    listeningScore: 3.2,
    writingScore: 2.6,
    readingScore: 2.8,
    overallComposite: 2.9,
    gradeAtAssessment: '2',
    notes: 'Mid-year growth. Strong leap in social instructional conversation and phonics decoding.'
  },
  {
    studentId: 'EAL-2024-001',
    assessmentDate: '2024-05-18',
    assessmentType: 'Annual',
    speakingScore: 3.6,
    listeningScore: 3.8,
    writingScore: 3.1,
    readingScore: 3.2,
    overallComposite: 3.4,
    gradeAtAssessment: '2',
    notes: 'Annual summative testing. Moving into Level 3 Developing range across all domains.'
  },
  // Chloe Park
  {
    studentId: 'EAL-2024-002',
    assessmentDate: '2024-01-10',
    assessmentType: 'Admissions',
    speakingScore: 1.6,
    listeningScore: 2.0,
    writingScore: 1.5,
    readingScore: 1.7,
    overallComposite: 1.7,
    gradeAtAssessment: '1',
    notes: 'Arrived mid-year from Seoul. Silent period observed; responds positively to visual routines and peer buddy.'
  },
  {
    studentId: 'EAL-2024-002',
    assessmentDate: '2024-05-20',
    assessmentType: 'Annual',
    speakingScore: 2.0,
    listeningScore: 2.4,
    writingScore: 1.7,
    readingScore: 1.9,
    overallComposite: 2.0,
    gradeAtAssessment: '1',
    notes: 'Emerging oral production. Now produces complete simple formulaic phrases ("I need pencil please").'
  },
  // Ken Takahashi
  {
    studentId: 'EAL-2024-003',
    assessmentDate: '2022-09-01',
    assessmentType: 'Admissions',
    speakingScore: 3.2,
    listeningScore: 3.5,
    writingScore: 2.8,
    readingScore: 3.0,
    overallComposite: 3.1,
    gradeAtAssessment: '2',
    notes: 'Admitted in Grade 2 with foundational English skills.'
  },
  {
    studentId: 'EAL-2024-003',
    assessmentDate: '2023-05-15',
    assessmentType: 'Annual',
    speakingScore: 4.4,
    listeningScore: 4.8,
    writingScore: 3.9,
    readingScore: 4.2,
    overallComposite: 4.3,
    gradeAtAssessment: '2',
    notes: 'Excellent academic progress in content vocabulary and informational text comprehension.'
  },
  {
    studentId: 'EAL-2024-003',
    assessmentDate: '2024-05-12',
    assessmentType: 'Annual',
    speakingScore: 5.2,
    listeningScore: 5.4,
    writingScore: 4.8,
    readingScore: 5.0,
    overallComposite: 5.1,
    gradeAtAssessment: '3',
    notes: 'Met exit criteria for direct pull-out support; transitioning to Monitored status.'
  }
];

export const INITIAL_PROFICIENCY_ASSESSMENTS: ProficiencyAssessment[] = [
  {
    studentId: 'EAL-2024-001',
    assessmentLetter: 'A',
    assessmentDate: '2024-09-15',
    keyLanguageUse: 'ELD-SI.4-12.Inform',
    wideELDStandard: 'ELD-LA.2-3.Inform.Expressive',
    languageModality: 'Expressive-Writing',
    proficiencyLevel: 3,
    supportLevel: '3-4',
    evidenceFileURLs: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80'],
    evidenceType: 'writing sample',
    rubricUsed: 'WIDA Writing Rubric Grades 1-3 (Linguistic Complexity & Vocabulary Usage)',
    teacherNotes: 'Leo wrote a 4-sentence informational paragraph on Vietnamese water puppets. Used cohesive devices ("First", "Then", "Because"). Minor grammatical tense inconsistencies ("they make" vs "they made"), but meaning is clear and engaging.',
    assessedBy: 'Ms. Clara Vance (EAL Specialist)'
  },
  {
    studentId: 'EAL-2024-001',
    assessmentLetter: 'B',
    assessmentDate: '2024-10-22',
    keyLanguageUse: 'ELD-SI.4-12.Explain',
    wideELDStandard: 'ELD-SC.2-3.Inform.Interpretive',
    languageModality: 'Expressive-Speaking',
    proficiencyLevel: 3,
    supportLevel: '3-4',
    evidenceFileURLs: ['https://www.w3schools.com/html/horse.mp3'],
    evidenceType: 'audio recording',
    rubricUsed: 'WIDA Speaking Rubric Grades 1-3',
    teacherNotes: 'Oral explanation of seed germination cycle using illustrated diagram cards. Successfully used causal connectors ("so the root can grow", "because it has water"). Good pronunciation with natural pacing.',
    assessedBy: 'Ms. Clara Vance (EAL Specialist)'
  },
  {
    studentId: 'EAL-2024-001',
    assessmentLetter: 'C',
    assessmentDate: '2024-11-18',
    keyLanguageUse: 'ELD-SI.4-12.Argue',
    wideELDStandard: 'ELD-LA.4-5.Argue.Expressive',
    languageModality: 'Interpretive-Reading',
    proficiencyLevel: 4,
    supportLevel: '3-4',
    evidenceFileURLs: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80'],
    evidenceType: 'photo',
    rubricUsed: 'Reading Comprehension & Argument Analysis Rubric',
    teacherNotes: 'Identified the authors primary claim in a persuasive text about school garden composting and annotated 3 pieces of supporting evidence using colored highlighters.',
    assessedBy: 'Ms. Clara Vance (EAL Specialist)'
  },
  {
    studentId: 'EAL-2024-002',
    assessmentLetter: 'A',
    assessmentDate: '2024-09-20',
    keyLanguageUse: 'ELD-SI.4-12.Narrate',
    wideELDStandard: 'ELD-LA.K-1.Narrate.Expressive',
    languageModality: 'Expressive-Speaking',
    proficiencyLevel: 2,
    supportLevel: '5-6',
    evidenceFileURLs: ['https://www.w3schools.com/html/mov_bbb.mp4'],
    evidenceType: 'video',
    rubricUsed: 'Early Primary Oral Narrative Protocol',
    teacherNotes: 'Chloe retold the story "The Very Hungry Caterpillar" using felt puppets. Spoke in single words and paired noun-verb combinations ("Apple eat", "Big butterfly").',
    assessedBy: 'Ms. Clara Vance (EAL Specialist)'
  }
];

export const INITIAL_LANGUAGE_PROFILES: Record<string, LanguageProfile> = {
  'EAL-2024-001': {
    studentId: 'EAL-2024-001',
    lastUpdated: '2024-11-20',
    whatCanStudentDoWithLanguage: [
      'Can identify the main idea and supporting details in grade-level informational texts with illustrated glossaries.',
      'Can produce 4-6 sentence paragraphs using coordinating conjunctions (and, but, so) and sequential markers (first, next, finally).',
      'Can express preferences, ask clarifying questions, and participate actively in small-group science inquiries.',
      'Can accurately decode grade 3 sight words and read aloud with 88% accuracy.'
    ],
    socialCulturalMultilingualStrengths: [
      'Rich bilingual literacy assets: can read and write age-appropriate Vietnamese script.',
      'Acts as a cultural bridge and peer mentor for newly enrolled Vietnamese-speaking classmates.',
      'High motivation to communicate; uses drawing and bilingual story mapping to bridge vocabulary gaps.',
      'Strong family support and active participation in school multicultural celebrations.'
    ],
    concreteFeedbackForGrowth: [
      'Focus on consistent past-tense verb morphology (regular -ed endings and common irregular verbs: went, saw, brought).',
      'Expand academic descriptive vocabulary beyond basic adjectives (e.g., transition from "big" to "enormous" or "significant").',
      'Practice oral rehearsal before beginning independent writing assignments to organize syntactic flow.',
      'Incorporate self-editing checklists for capitalization and terminal punctuation.'
    ],
    effectiveScaffoldsAndModalities: [
      'Bilingual Vietnamese-English visual vocabulary cards and illustrated word banks on classroom desks.',
      'Color-coded sentence building frames (Subject = Yellow, Action = Green, Detail = Blue).',
      'Think-Pair-Share structured speaking routines with a designated peer language buddy.',
      'Digital text-to-speech tools for self-monitoring reading fluency.'
    ],
    currentGoals: [
      {
        id: 'g-1',
        text: 'Write a multi-paragraph informational report using at least 5 domain-specific science terms and transition words.',
        targetDate: '2024-12-15',
        status: 'In Progress'
      },
      {
        id: 'g-2',
        text: 'Self-correct past tense verb forms during peer editing with 80% accuracy using the verb reference chart.',
        targetDate: '2025-01-30',
        status: 'In Progress'
      },
      {
        id: 'g-3',
        text: 'Independently summarize a fiction chapter book using the "Somebody-Wanted-But-So-Then" framework.',
        targetDate: '2024-11-10',
        status: 'Achieved'
      }
    ]
  },
  'EAL-2024-002': {
    studentId: 'EAL-2024-002',
    lastUpdated: '2024-10-15',
    whatCanStudentDoWithLanguage: [
      'Can follow multi-step classroom directions supported by visual gesture modeling.',
      'Can name classroom objects, colors, numbers, and basic emotion descriptors in English.',
      'Can match vocabulary flashcards to photos with 95% accuracy.'
    ],
    socialCulturalMultilingualStrengths: [
      'Exceptionally observant, enthusiastic artist who expresses complex stories through detailed illustration.',
      'Strong Korean phonemic awareness and print concepts transferred from Korean kindergarten.',
      'Highly collaborative in non-verbal and tactile learning stations (Lego STEM, math manipulatives).'
    ],
    concreteFeedbackForGrowth: [
      'Encourage expanding 1-word responses into 2-3 word carrier phrases ("I want...", "Look at...").',
      'Practice initial consonant digraphs (/sh/, /ch/, /th/) in targeted daily phonics games.'
    ],
    effectiveScaffoldsAndModalities: [
      'Picture communication daily schedule with Korean translations.',
      'Tactile phonics tiles and sand trays for letter-sound integration.',
      'Total Physical Response (TPR) actions for action verbs.'
    ],
    currentGoals: [
      {
        id: 'g-201',
        text: 'Verbally request classroom materials using complete 3-word carrier sentences.',
        targetDate: '2024-12-01',
        status: 'In Progress'
      }
    ]
  }
};

export const INITIAL_QUARTERLY_SUPPORT: QuarterlySupport[] = [
  {
    studentId: 'EAL-2024-001',
    schoolYear: '2023-2024',
    quarter: 'Q1',
    supportLevel: 'Intensive',
    projectedSupportNextYear: 'Targeted services (4 sessions/week)',
    notes: 'Received daily 45-minute push-in and pull-out co-teaching support.'
  },
  {
    studentId: 'EAL-2024-001',
    schoolYear: '2023-2024',
    quarter: 'Q3',
    supportLevel: 'Targeted',
    projectedSupportNextYear: 'Targeted services',
    notes: 'Demonstrated rapid gains in literacy; reduced pull-out to 3 sessions weekly.'
  },
  {
    studentId: 'EAL-2024-001',
    schoolYear: '2024-2025',
    quarter: 'Q1',
    supportLevel: 'Targeted',
    projectedSupportNextYear: 'Monitored support or Level 4 transition',
    notes: 'Co-taught writer workshop support in 3A.'
  },
  {
    studentId: 'EAL-2024-002',
    schoolYear: '2024-2025',
    quarter: 'Q1',
    supportLevel: 'Intensive',
    projectedSupportNextYear: 'Intensive support',
    notes: '5 sessions weekly with intensive phonics and foundational vocabulary.'
  }
];
