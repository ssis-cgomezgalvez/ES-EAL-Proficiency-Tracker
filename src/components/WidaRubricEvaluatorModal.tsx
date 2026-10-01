import React, { useState } from 'react';
import {
  FileCheck,
  X,
  BookOpen,
  Check,
  Award,
  Sparkles,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  WidaRubric,
  AVAILABLE_WIDA_RUBRICS,
  calculateRubricComposite
} from '../data/widaRubrics';
import { ProficiencySubLevel, WIDA_SUB_LEVELS } from '../types/eal';

interface WidaRubricEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEvaluation: (evaluation: {
    proficiencyLevel: number;
    proficiencySubLevel: ProficiencySubLevel;
    rubricUsed: string;
    rubricDimensionScores: Record<string, { level: ProficiencySubLevel; score: number; dimensionName?: string }>;
    generatedNotes: string;
  }) => void;
  initialModality?: 'Writing' | 'Speaking';
  studentName?: string;
}

export const WidaRubricEvaluatorModal: React.FC<WidaRubricEvaluatorModalProps> = ({
  isOpen,
  onClose,
  onApplyEvaluation,
  initialModality = 'Writing',
  studentName = 'Student'
}) => {
  const [selectedRubricId, setSelectedRubricId] = useState<string>(
    initialModality === 'Speaking' ? 'wida-speaking-1-5' : 'wida-writing-3-5'
  );

  const activeRubric: WidaRubric =
    AVAILABLE_WIDA_RUBRICS.find((r) => r.id === selectedRubricId) || AVAILABLE_WIDA_RUBRICS[0];

  // Selected sub-levels per dimension: default to 3 (Developing)
  const [dimensionSelections, setDimensionSelections] = useState<
    Record<string, { baseLevel: number; modifier: '-' | '' | '+'; subLevel: ProficiencySubLevel }>
  >({
    discourse: { baseLevel: 3, modifier: '', subLevel: '3' },
    sentence: { baseLevel: 3, modifier: '', subLevel: '3' },
    vocabulary: { baseLevel: 3, modifier: '', subLevel: '3' }
  });

  const handleSelectLevel = (
    dimensionId: string,
    baseLevel: number,
    modifier: '-' | '' | '+' = ''
  ) => {
    const subLevelKey = `${baseLevel}${modifier}` as ProficiencySubLevel;
    setDimensionSelections((prev) => ({
      ...prev,
      [dimensionId]: {
        baseLevel,
        modifier,
        subLevel: subLevelKey
      }
    }));
  };

  // Calculate composite
  const compositeScores = Object.entries(dimensionSelections).reduce(
    (acc, [dimId, sel]) => {
      acc[dimId] = {
        level: sel.subLevel,
        score: WIDA_SUB_LEVELS[sel.subLevel]?.numericValue || sel.baseLevel
      };
      return acc;
    },
    {} as Record<string, { level: ProficiencySubLevel; score: number }>
  );

  const composite = calculateRubricComposite(compositeScores);

  const handleApply = () => {
    // Generate structured narrative from selected rubric criteria
    const dimensionNotes = activeRubric.dimensions.map((dim) => {
      const sel = dimensionSelections[dim.id] || { baseLevel: 3, modifier: '', subLevel: '3' };
      const levelDesc = dim.levels[sel.baseLevel];
      let specificDetail = levelDesc.summary;
      if (sel.modifier === '-' && levelDesc.subLevels.minus) {
        specificDetail = levelDesc.subLevels.minus;
      } else if (sel.modifier === '+' && levelDesc.subLevels.plus) {
        specificDetail = levelDesc.subLevels.plus;
      } else if (levelDesc.subLevels.standard) {
        specificDetail = levelDesc.subLevels.standard;
      }

      const subLevelLabel = WIDA_SUB_LEVELS[sel.subLevel]?.shortLabel || `Level ${sel.baseLevel}`;
      return `• ${dim.name}: [${subLevelLabel}] — ${specificDetail}`;
    });

    const generatedText = [
      `WIDA Rubric Evaluation (${activeRubric.title}):`,
      ...dimensionNotes,
      `Calculated Level: ${composite.label} (Composite Score: ${composite.averageScore.toFixed(1)})`
    ].join('\n');

    const formattedScores: Record<
      string,
      { level: ProficiencySubLevel; score: number; dimensionName?: string }
    > = {};
    activeRubric.dimensions.forEach((dim) => {
      const sel = dimensionSelections[dim.id];
      formattedScores[dim.id] = {
        level: sel.subLevel,
        score: WIDA_SUB_LEVELS[sel.subLevel]?.numericValue || sel.baseLevel,
        dimensionName: dim.name
      };
    });

    onApplyEvaluation({
      proficiencyLevel: composite.baseLevel,
      proficiencySubLevel: composite.subLevel,
      rubricUsed: activeRubric.title,
      rubricDimensionScores: formattedScores,
      generatedNotes: generatedText
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] my-4">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-slate-50/60">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-base text-slate-900">
                  Interactive WIDA 2020 Rubric Evaluator
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Direct In-App Scoring
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Score {studentName}&apos;s language sample directly across Discourse, Sentence, and Word/Phrase dimensions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Rubric Selector Bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Modality Rubric:</span>
            {AVAILABLE_WIDA_RUBRICS.map((rubric) => (
              <button
                key={rubric.id}
                type="button"
                onClick={() => setSelectedRubricId(rubric.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeRubric.id === rubric.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {rubric.modality} Rubric ({rubric.gradeBand})
              </button>
            ))}
          </div>

          <div className="text-slate-500 text-[11px] hidden sm:block">
            Supports exact sub-levels: <strong>Level 3-</strong>, <strong>Level 3</strong>, <strong>Level 3+</strong>
          </div>
        </div>

        {/* Scrollable Dimensions Matrix */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30">
          {activeRubric.dimensions.map((dim, dimIndex) => {
            const currentSel = dimensionSelections[dim.id] || {
              baseLevel: 3,
              modifier: '',
              subLevel: '3'
            };
            const activeLevelData = dim.levels[currentSel.baseLevel];

            return (
              <div
                key={dim.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4"
              >
                {/* Dimension Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center">
                        {dimIndex + 1}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900">{dim.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 ml-7">{dim.focus}</p>
                  </div>

                  {/* Current Selected Sub-Level Badge */}
                  <div className="inline-flex items-center space-x-1.5 self-start sm:self-auto bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800">
                    <span>Selected:</span>
                    <strong className="text-slate-950 font-bold">
                      {WIDA_SUB_LEVELS[currentSel.subLevel]?.label || `Level ${currentSel.baseLevel}`}
                    </strong>
                  </div>
                </div>

                {/* Level Buttons (1 to 6) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                    Step A: Select General Proficiency Level (1 to 6)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((lvl) => {
                      const isSelected = currentSel.baseLevel === lvl;
                      const lvlInfo = WIDA_SUB_LEVELS[`${lvl}` as ProficiencySubLevel];

                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleSelectLevel(dim.id, lvl, currentSel.modifier)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-semibold text-xs flex items-center justify-between">
                            <span>Level {lvl}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <div
                            className={`text-[11px] truncate mt-0.5 ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {lvlInfo?.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-Level Refinement (- / Standard / +) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                    Step B: Refine Sub-Level Precision (e.g. Level {currentSel.baseLevel}-, Level {currentSel.baseLevel}, Level {currentSel.baseLevel}+)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Minus */}
                    <button
                      type="button"
                      onClick={() => handleSelectLevel(dim.id, currentSel.baseLevel, '-')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        currentSel.modifier === '-'
                          ? 'bg-slate-100 border-slate-800 ring-1 ring-slate-800'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1">
                        <span>Level {currentSel.baseLevel}- (Early / Emerging into Level)</span>
                        {currentSel.modifier === '-' && <Check className="h-3.5 w-3.5 text-slate-900" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {activeLevelData.subLevels.minus}
                      </p>
                    </button>

                    {/* Standard */}
                    <button
                      type="button"
                      onClick={() => handleSelectLevel(dim.id, currentSel.baseLevel, '')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        currentSel.modifier === ''
                          ? 'bg-slate-100 border-slate-800 ring-1 ring-slate-800'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1">
                        <span>Level {currentSel.baseLevel} (Solidly Meeting Descriptor)</span>
                        {currentSel.modifier === '' && <Check className="h-3.5 w-3.5 text-slate-900" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {activeLevelData.subLevels.standard}
                      </p>
                    </button>

                    {/* Plus */}
                    <button
                      type="button"
                      onClick={() => handleSelectLevel(dim.id, currentSel.baseLevel, '+')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        currentSel.modifier === '+'
                          ? 'bg-slate-100 border-slate-800 ring-1 ring-slate-800'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1">
                        <span>Level {currentSel.baseLevel}+ (Approaching Next Level)</span>
                        {currentSel.modifier === '+' && <Check className="h-3.5 w-3.5 text-slate-900" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {activeLevelData.subLevels.plus}
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Evaluation Summary & Apply Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Composite Rubric Evaluation
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-base font-bold text-slate-900">{composite.label}</span>
                <span className="text-xs text-slate-600 font-medium">
                  (Avg Score: {composite.averageScore.toFixed(1)})
                </span>
              </div>
            </div>

            {/* Dimension Breakdown Badges */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-1 text-xs">
              {activeRubric.dimensions.map((dim) => {
                const sel = dimensionSelections[dim.id];
                return (
                  <span
                    key={dim.id}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium text-[11px]"
                  >
                    {dim.id === 'discourse' ? 'Discourse' : dim.id === 'sentence' ? 'Sentence' : 'Vocabulary'}:{' '}
                    <strong className="text-slate-950 font-semibold">{sel.subLevel}</strong>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Apply Rubric Evaluation to Assessment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
