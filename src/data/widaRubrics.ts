import { ProficiencySubLevel, WIDA_SUB_LEVELS } from '../types/eal';

export interface RubricLevelDescriptor {
  level: number;
  subLevels: {
    minus: string;
    standard: string;
    plus: string;
  };
  summary: string;
}

export interface RubricDimension {
  id: 'discourse' | 'sentence' | 'vocabulary';
  name: string;
  focus: string;
  levels: Record<number, RubricLevelDescriptor>;
}

export interface WidaRubric {
  id: string;
  title: string;
  modality: 'Writing' | 'Speaking';
  gradeBand: 'Grades K' | 'Grades 1–2' | 'Grades 3–5';
  description: string;
  dimensions: RubricDimension[];
}

export const WIDA_WRITING_RUBRIC_G3_5: WidaRubric = {
  id: 'wida-writing-3-5',
  title: 'WIDA 2020 Writing Rubric (Grades 3–5)',
  modality: 'Writing',
  gradeBand: 'Grades 3–5',
  description: 'Evaluates Discourse, Sentence, and Word/Phrase dimensions across WIDA ELD standards.',
  dimensions: [
    {
      id: 'discourse',
      name: 'Discourse Dimension (Linguistic Complexity)',
      focus: 'Quantity and variety of text; organization; cohesion across sentences and paragraphs.',
      levels: {
        1: {
          level: 1,
          summary: 'Single words, memorized chunks, or phrase fragments; no sustained cohesive discourse.',
          subLevels: {
            minus: 'Isolated copied words or letters; non-linear or fragmented marks with minimal message intent.',
            standard: 'Single words and memorized phrases; labeled drawings; disjointed word lists.',
            plus: 'Paired words or formulaic 2-3 word chunks; emerging attempt at linear sequence with graphic support.'
          }
        },
        2: {
          level: 2,
          summary: 'Phrases and short simple sentences; loose associations; repetitive organizational pattern.',
          subLevels: {
            minus: 'Strings of short phrases; emerging repetitive sentence stems; limited narrative or expository thread.',
            standard: 'Series of short sentences loosely connected with basic conjunctions (and, then); predictable sequence.',
            plus: 'Sustained simple sentences with beginning temporal connectors (first, next); emerging paragraph unity.'
          }
        },
        3: {
          level: 3,
          summary: 'Expanded simple and compound sentences; recognizable paragraph structure; sequential cohesion.',
          subLevels: {
            minus: 'Emerging paragraph structure with frequent topic shifts; inconsistent transitions between thoughts.',
            standard: 'Organized paragraph with a clear central idea; chronological or categorical sequencing using varied transitions (also, because).',
            plus: 'Multi-paragraph organization beginning to emerge; logical flow with introductory and concluding thoughts.'
          }
        },
        4: {
          level: 4,
          summary: 'Multiple connected paragraphs; clear introduction, body, and conclusion; cohesive across text.',
          subLevels: {
            minus: 'Connected paragraphs with generally clear organization; minor lapses in cohesion between body sections.',
            standard: 'Clear organizational structure matching genre purpose (narrative, informational, opinion); effective paragraph transitions.',
            plus: 'Well-developed multi-paragraph text with nuanced structural flow, guiding reader through logical argument or narrative arc.'
          }
        },
        5: {
          level: 5,
          summary: 'Complex multi-paragraph discourse with rich genre-specific organizational schemes and seamless cohesion.',
          subLevels: {
            minus: 'Strongly unified multi-paragraph composition; thoughtful progression of ideas with varied transitional devices.',
            standard: 'Cohesive, purposeful flow with sophisticated organizational design matching authentic academic registers.',
            plus: 'Stylistically engaging organization; seamless transitions, parallel structure, and sophisticated rhetorical pacing.'
          }
        },
        6: {
          level: 6,
          summary: 'Masterful academic discourse comparable to native English proficient peers across all curriculum areas.',
          subLevels: {
            minus: 'Extensive academic discourse with mature paragraph architecture and effortless thematic integration.',
            standard: 'Masterful academic discourse showcasing sophisticated rhetorical devices, authoritative voice, and natural cohesion.',
            plus: 'Exemplary authorial voice, exceptional nuance, and published-caliber stylistic maturity.'
          }
        }
      }
    },
    {
      id: 'sentence',
      name: 'Sentence Dimension (Language Forms & Conventions)',
      focus: 'Types, variety, and grammatical complexity of sentences; syntactic control and mechanics.',
      levels: {
        1: {
          level: 1,
          summary: 'Word-level fragments or formulaic phrases; high reliance on environmental print and copying.',
          subLevels: {
            minus: 'Incomplete phrase fragments; frequent copying errors; punctuation and capitalization absent.',
            standard: 'Formulaic sentence stems ("I like...", "This is..."); phonetic spelling; basic mechanics emerging.',
            plus: 'Attempts simple subject-verb structures with errors that may obscure meaning; inventive spelling.'
          }
        },
        2: {
          level: 2,
          summary: 'Simple sentences with repetitive patterns (S-V-O); basic grammatical agreements and mechanics.',
          subLevels: {
            minus: 'Simple sentences with consistent errors in verb tense, plurals, or word order.',
            standard: 'Simple sentences with emerging compound subjects/verbs; basic periods and capital letters.',
            plus: 'Compound sentences joined by "and", "but", "so"; developing subject-verb agreement in present/past.'
          }
        },
        3: {
          level: 3,
          summary: 'Compound sentences with coordinating conjunctions; emerging complex sentences with adverbial/relative clauses.',
          subLevels: {
            minus: 'Compound sentences with occasional run-ons or comma splices; emerging subordinate clauses (when, because).',
            standard: 'Mix of simple and compound sentences with emerging complex clauses; generally accurate basic mechanics.',
            plus: 'Variety of sentence lengths; consistent use of dependent clauses (if, although, while); controlled punctuation.'
          }
        },
        4: {
          level: 4,
          summary: 'Variety of complex sentence structures; prepositional phrases, relative clauses, and passive voice emerging.',
          subLevels: {
            minus: 'Complex sentences with minor structural slips in clause boundaries or pronoun reference.',
            standard: 'Accurate complex sentences with embedded clauses, varied sentence openings, and strong grammatical control.',
            plus: 'Sophisticated sentence variety (infinitive phrases, participial openers); dialogue mechanics used effectively.'
          }
        },
        5: {
          level: 5,
          summary: 'Syntactically varied and dense academic sentences with high accuracy in conventions and structural mechanics.',
          subLevels: {
            minus: 'Complex sentence combinations with infrequent minor errors that do not impede comprehension.',
            standard: 'Rich sentence variety; accurate modal verbs, conditional forms, and nominal clauses.',
            plus: 'Flawless syntactic control; stylistic sentence variety crafted purposefully to emphasize key concepts.'
          }
        },
        6: {
          level: 6,
          summary: 'Full grammatical control equivalent to native English speaking peers; expressive syntactic versatility.',
          subLevels: {
            minus: 'Consistent mastery of intricate grammar, punctuation, and academic conventions across genres.',
            standard: 'Full command of complex sentence architecture, rhetorical syntax, and nuanced mechanics.',
            plus: 'Flawless and artful sentence craft with complete precision and expressive variety.'
          }
        }
      }
    },
    {
      id: 'vocabulary',
      name: 'Word/Phrase Dimension (Vocabulary Usage)',
      focus: 'Specificity of word choice; general, specific, and technical academic language; precision.',
      levels: {
        1: {
          level: 1,
          summary: 'General high-frequency social vocabulary and everyday classroom labels.',
          subLevels: {
            minus: 'Isolated survival words; reliance on native language cognates or drawings to represent words.',
            standard: 'High-frequency sight words and basic classroom objects/actions ("school", "book", "play").',
            plus: 'Begins utilizing basic descriptive adjectives and common category words ("big", "blue", "animal").'
          }
        },
        2: {
          level: 2,
          summary: 'Everyday language with emerging content-area topic vocabulary supported by word banks.',
          subLevels: {
            minus: 'Repetitive general words (good, nice, thing); basic action verbs and nouns.',
            standard: 'Topic-specific nouns and basic descriptive words drawn from classroom charts and read-alouds.',
            plus: 'Precise common adjectives and adverbs; begins distinguishing basic synonyms ("glad" vs "happy").'
          }
        },
        3: {
          level: 3,
          summary: 'Specific academic words and general cross-disciplinary terms (analyze, cause, evidence).',
          subLevels: {
            minus: 'Uses specific content words, but occasionally substitutes general terms when uncertain.',
            standard: 'Appropriate use of content-area vocabulary (habitat, fraction, narrator) and relational terms.',
            plus: 'Consistently selects precise verbs (examined, discovered) and descriptive academic noun phrases.'
          }
        },
        4: {
          level: 4,
          summary: 'Technical and abstract content-area vocabulary; figurative language and collocations.',
          subLevels: {
            minus: 'Technical terminology used accurately with occasional imprecision in idiomatic phrasing.',
            standard: 'Specialized content vocabulary (adaptation, equivalent, chronological) and abstract concepts.',
            plus: 'Wide repertoire of academic synonyms; figurative language and metaphorical expressions used purposefully.'
          }
        },
        5: {
          level: 5,
          summary: 'Rich academic register with discipline-specific precision, nominalization, and subtle connotations.',
          subLevels: {
            minus: 'Technical vocabulary integrated smoothly; nominalized forms emerging (investigation, condensation).',
            standard: 'Precise academic diction with sensitivity to tone, audience, and discipline-specific register.',
            plus: 'Exquisite vocabulary precision, nuanced distinctions, and extensive academic collocations.'
          }
        },
        6: {
          level: 6,
          summary: 'Expert academic vocabulary and terminology comparable to native peers; rich semantic flexibility.',
          subLevels: {
            minus: 'Broad and versatile academic lexicon applied accurately across all disciplines.',
            standard: 'Precise, authoritative academic vocabulary with natural command of idiomatic and technical expressions.',
            plus: 'Exceptional linguistic breadth, subtle shades of meaning, and commanding academic lexicon.'
          }
        }
      }
    }
  ]
};

export const WIDA_SPEAKING_RUBRIC_G1_5: WidaRubric = {
  id: 'wida-speaking-1-5',
  title: 'WIDA 2020 Speaking Rubric (Grades 1–5)',
  modality: 'Speaking',
  gradeBand: 'Grades 3–5',
  description: 'Assesses oral discourse complexity, language control, and academic vocabulary during oral interactions.',
  dimensions: [
    {
      id: 'discourse',
      name: 'Discourse Dimension (Oral Complexity & Fluidity)',
      focus: 'Length of oral response; fluency; organizational structure and cohesion across turns.',
      levels: {
        1: {
          level: 1,
          summary: 'Single words or formulaic phrases with long pauses; gestures and non-verbal cues.',
          subLevels: {
            minus: 'Non-verbal responses; single isolated words with prompting.',
            standard: 'Single words or short 1-2 word memorized utterances with prolonged hesitation.',
            plus: 'Short formulaic phrases; begins answering simple social questions with modeled words.'
          }
        },
        2: {
          level: 2,
          summary: 'Phrases and short simple sentences; pauses to search for words; repetitive discourse.',
          subLevels: {
            minus: 'Halting short phrases with frequent pauses and reliance on teacher scaffolding.',
            standard: 'Short simple sentences; expresses basic wants, observations, and descriptions.',
            plus: 'Sustains simple conversation for 2-3 turns using basic connectors (and, then).'
          }
        },
        3: {
          level: 3,
          summary: 'Expanded simple and compound sentences; recognizable flow with occasional hesitation.',
          subLevels: {
            minus: 'Begins expressing extended thoughts with pauses for syntactic formulation.',
            standard: 'Communicates sequential events or explanations with clear organizational flow.',
            plus: 'Speaks in connected paragraphs orally with causal connectors (because, so that).'
          }
        },
        4: {
          level: 4,
          summary: 'Connected discourse with clear flow; expresses detailed opinions, narratives, and explanations.',
          subLevels: {
            minus: 'Speaks with general fluency; minor hesitations when discussing complex academic tasks.',
            standard: 'Elaborates on academic topics with structured arguments, evidence, and clear transitions.',
            plus: 'Fluid and organized academic presentations; adjusts pace and register to listener.'
          }
        },
        5: {
          level: 5,
          summary: 'Fluent, cohesive academic speech across informal and formal academic registers with minimal pauses.',
          subLevels: {
            minus: 'Fluent presentation with coherent logic and varied oral transitional devices.',
            standard: 'Engaging, articulate oral discourse with natural intonation, rhythm, and clarity.',
            plus: 'Effortless academic fluidity, public speaking poise, and sophisticated oral eloquence.'
          }
        },
        6: {
          level: 6,
          summary: 'Native-like oral command with nuanced discourse across all academic situations.',
          subLevels: {
            minus: 'Natural, fluent command comparable to native English speakers across topics.',
            standard: 'Articulate, persuasive, and authoritative speech with complete rhetorical control.',
            plus: 'Distinguished oral proficiency, expressive charisma, and masterful verbal agility.'
          }
        }
      }
    },
    {
      id: 'sentence',
      name: 'Sentence Dimension (Language Control & Grammatical Accuracy)',
      focus: 'Syntactic control; grammatical forms and agreement; clarity of meaning in speech.',
      levels: {
        1: {
          level: 1,
          summary: 'Word-level utterances; minimal syntactic control; high reliance on imitation.',
          subLevels: {
            minus: 'No syntactic framework; single words with emerging phonetic approximations.',
            standard: 'Repeats sentence stems; word order errors that may obscure intended meaning.',
            plus: 'Attempts basic subject-verb phrases with noticeable grammatical errors.'
          }
        },
        2: {
          level: 2,
          summary: 'Simple sentences; repetitive patterns; basic agreement errors that rarely impede understanding.',
          subLevels: {
            minus: 'Simple sentences with errors in verb tense, plurals, or pronouns.',
            standard: 'Produces simple sentences (S-V-O) with consistent basic grammatical control.',
            plus: 'Attempts compound structures using "and/but"; minor grammatical slips.'
          }
        },
        3: {
          level: 3,
          summary: 'Compound and emerging complex sentences with consistent control of basic grammar.',
          subLevels: {
            minus: 'Compound sentences with occasional awkward clause ordering or tense shifts.',
            standard: 'Generally accurate compound and simple sentences; emerging subordinate clauses.',
            plus: 'Consistent grammatical accuracy in complex structures (when, if, because).'
          }
        },
        4: {
          level: 4,
          summary: 'Variety of complex sentence structures spoken with high grammatical precision.',
          subLevels: {
            minus: 'Complex sentences with occasional slips in irregular verb forms or idioms.',
            standard: 'Accurate complex sentences with embedded clauses, relative pronouns, and modals.',
            plus: 'Flexible sentence variety tailored for academic questioning, debate, and explanation.'
          }
        },
        5: {
          level: 5,
          summary: 'Extensive grammatical control; complex conditional and hypothetical forms spoken accurately.',
          subLevels: {
            minus: 'High syntactic accuracy with rare self-corrections.',
            standard: 'Mastery of nuanced academic syntax, conditionals, and passive voice in speech.',
            plus: 'Flawless grammatical precision with spontaneous syntactic complexity.'
          }
        },
        6: {
          level: 6,
          summary: 'Flawless grammatical command matching native English speakers across all disciplines.',
          subLevels: {
            minus: 'Effortless grammatical control in formal and impromptu oral exchanges.',
            standard: 'Complete mastery of syntax, subtle nuances, and idiomatic precision.',
            plus: 'Exemplary grammatical perfection and sophisticated verbal style.'
          }
        }
      }
    },
    {
      id: 'vocabulary',
      name: 'Word/Phrase Dimension (Oral Vocabulary & Academic Diction)',
      focus: 'Breadth and depth of oral vocabulary; technical precision; social and academic register.',
      levels: {
        1: {
          level: 1,
          summary: 'Basic social phrases and everyday classroom labels.',
          subLevels: {
            minus: 'Survival words; relies on gestures or home language.',
            standard: 'Everyday vocabulary for common items (yes, no, water, book).',
            plus: 'Basic descriptive words and common action verbs (eat, write, big).'
          }
        },
        2: {
          level: 2,
          summary: 'Everyday language with emerging topic-specific terms; repetitive vocabulary.',
          subLevels: {
            minus: 'Repeats familiar words; searches for words with circumlocution.',
            standard: 'Uses general academic vocabulary and lesson-specific nouns.',
            plus: 'Expanding vocabulary with basic synonyms and descriptive qualifiers.'
          }
        },
        3: {
          level: 3,
          summary: 'General and specific content-area vocabulary; emerging idiomatic expressions.',
          subLevels: {
            minus: 'Uses content words appropriately; occasional reliance on general terms.',
            standard: 'Expresses academic concepts with specific subject-area terms.',
            plus: 'Rich vocabulary with varied adjectives, adverbs, and transition markers.'
          }
        },
        4: {
          level: 4,
          summary: 'Technical and abstract vocabulary; distinguishes subtle shades of meaning.',
          subLevels: {
            minus: 'Accurate technical vocabulary with minor pauses for retrieval.',
            standard: 'Precise academic terminology used naturally during discussions.',
            plus: 'Command of figurative expressions, domain-specific idioms, and abstract ideas.'
          }
        },
        5: {
          level: 5,
          summary: 'Broad, versatile academic lexicon matching native peers; register flexibility.',
          subLevels: {
            minus: 'Rich academic vocabulary applied across multiple subjects.',
            standard: 'Sophisticated academic vocabulary with sensitivity to formal tone.',
            plus: 'Exceptional verbal precision, nuanced word choices, and rich conceptual vocabulary.'
          }
        },
        6: {
          level: 6,
          summary: 'Distinguished oral vocabulary comparable to native speaking peers in depth and precision.',
          subLevels: {
            minus: 'Versatile vocabulary tailored effortlessly to audience and topic.',
            standard: 'Commanding academic vocabulary with effortless rhetorical impact.',
            plus: 'Peerless lexical breadth and sophisticated verbal expression.'
          }
        }
      }
    }
  ]
};

export const AVAILABLE_WIDA_RUBRICS: WidaRubric[] = [
  WIDA_WRITING_RUBRIC_G3_5,
  WIDA_SPEAKING_RUBRIC_G1_5
];

export function calculateRubricComposite(
  scores: Record<string, { level: ProficiencySubLevel; score: number }>
): {
  averageScore: number;
  subLevel: ProficiencySubLevel;
  baseLevel: number;
  label: string;
} {
  const entries = Object.values(scores);
  if (entries.length === 0) {
    return {
      averageScore: 3.0,
      subLevel: '3',
      baseLevel: 3,
      label: WIDA_SUB_LEVELS['3'].label
    };
  }

  const sum = entries.reduce((acc, curr) => acc + curr.score, 0);
  const avg = sum / entries.length;

  // Find closest sub-level
  let closestKey: ProficiencySubLevel = '3';
  let minDiff = Infinity;

  const keys = Object.keys(WIDA_SUB_LEVELS) as ProficiencySubLevel[];
  for (const key of keys) {
    const diff = Math.abs(WIDA_SUB_LEVELS[key].numericValue - avg);
    if (diff < minDiff) {
      minDiff = diff;
      closestKey = key;
    }
  }

  const info = WIDA_SUB_LEVELS[closestKey];
  return {
    averageScore: Math.round(avg * 10) / 10,
    subLevel: closestKey,
    baseLevel: info.baseLevel,
    label: info.label
  };
}
