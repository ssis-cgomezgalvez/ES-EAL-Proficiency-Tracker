import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Layers,
  Upload,
  Mic,
  Video,
  Image as ImageIcon,
  FileText,
  StopCircle,
  Play,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Award,
  Check,
  Camera,
  FileCheck
} from 'lucide-react';
import {
  Student,
  AssessmentLetter,
  KeyLanguageUse,
  LanguageModality,
  EvidenceType,
  KEY_LANGUAGE_USES,
  WIDA_ELD_STANDARDS,
  WIDA_LEVELS,
  ProficiencySubLevel,
  WIDA_SUB_LEVELS,
  ALL_SUB_LEVEL_KEYS,
  AiAssessmentSuggestion,
  ProficiencyAssessment
} from '../types/eal';
import {
  AudioRecordingSession,
  VideoRecordingSession,
  uploadEvidenceMedia
} from '../utils/mediaRecorder';
import { createProficiencyAssessment } from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import { DocumentScannerModal } from './DocumentScannerModal';
import { WidaRubricEvaluatorModal } from './WidaRubricEvaluatorModal';

interface AssessmentEntryModalProps {
  students: Student[];
  preSelectedStudent?: Student;
  defaultLetter?: AssessmentLetter;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssessmentEntryModal: React.FC<AssessmentEntryModalProps> = ({
  students,
  preSelectedStudent,
  defaultLetter = 'A',
  isOpen,
  onClose,
  onSuccess
}) => {
  const { userProfile } = useAuth();

  // Assessment Mode: Required Benchmark (A–H) vs. Additional Custom Formative Checkpoint
  const [isCustomAssessment, setIsCustomAssessment] = useState(false);
  const [customLetter, setCustomLetter] = useState<string>('Checkpoint 1');
  const [customTitle, setCustomTitle] = useState<string>('');

  // Form Fields
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preSelectedStudent?.studentId || (students[0]?.studentId ?? '')
  );
  const [assessmentLetter, setAssessmentLetter] = useState<AssessmentLetter>(defaultLetter);
  const [assessmentDate, setAssessmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [keyLanguageUse, setKeyLanguageUse] = useState<KeyLanguageUse>('ELD-SI.4-12.Inform');
  const [wideELDStandard, setWideELDStandard] = useState<string>(
    'ELD-LA.4-5.Inform.Interpretive'
  );
  const [languageModality, setLanguageModality] = useState<LanguageModality>('Expressive-Writing');
  const [proficiencyLevel, setProficiencyLevel] = useState<number>(3);
  const [proficiencySubLevel, setProficiencySubLevel] = useState<ProficiencySubLevel>('3');
  const [rubricDimensionScores, setRubricDimensionScores] = useState<Record<string, { level: ProficiencySubLevel; score: number; dimensionName?: string }> | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [supportLevel, setSupportLevel] = useState<string>('Tier 2');
  const [rubricUsed, setRubricUsed] = useState<string>(
    'WIDA 2020 Writing Rubric (Grades 3–5)'
  );
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('writing sample');

  // Evidence Files
  const [pendingFiles, setPendingFiles] = useState<{
    file: File | Blob;
    previewUrl: string;
    name: string;
    type: string;
  }[]>([]);

  // In-App Audio Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);
  const audioSessionRef = useRef<AudioRecordingSession | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // In-App Video Recording State
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoTimer, setVideoTimer] = useState(0);
  const videoSessionRef = useRef<VideoRecordingSession | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // AI Assistant State
  const [isAiAssessing, setIsAiAssessing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiAssessmentSuggestion | null>(null);
  const [aiError, setAiError] = useState('');
  const [aiAccepted, setAiAccepted] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (preSelectedStudent) {
      setSelectedStudentId(preSelectedStudent.studentId);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].studentId);
    }
  }, [preSelectedStudent, students]);

  useEffect(() => {
    if (defaultLetter) {
      const isBenchmark = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(defaultLetter);
      if (isBenchmark) {
        setIsCustomAssessment(false);
        setAssessmentLetter(defaultLetter);
      } else {
        setIsCustomAssessment(true);
        setCustomLetter(defaultLetter);
      }
    }
  }, [defaultLetter]);

  if (!isOpen) return null;

  const currentStudent =
    students.find((s) => s.studentId === selectedStudentId) || preSelectedStudent || students[0];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newItems = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        type: file.type
      }));
      setPendingFiles((prev) => [...prev, ...newItems]);
      if (files[0].type.startsWith('image/')) setEvidenceType('photo');
      else if (files[0].type.startsWith('audio/')) setEvidenceType('audio recording');
      else if (files[0].type.startsWith('video/')) setEvidenceType('video');
      else setEvidenceType('writing sample');
    }
  };

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleStartAudioRecording = async () => {
    try {
      setErrorMessage('');
      const session = new AudioRecordingSession();
      audioSessionRef.current = session;
      await session.start();
      setIsRecordingAudio(true);
      setAudioTimer(0);
      setEvidenceType('audio recording');

      audioIntervalRef.current = setInterval(() => {
        setAudioTimer((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Audio recording failed:', err);
      setErrorMessage('Could not access microphone: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleStopAudioRecording = async () => {
    if (!audioSessionRef.current) return;
    try {
      const recordingResult = await audioSessionRef.current.stop();
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setIsRecordingAudio(false);

      const fileName = `Audio_Evidence_${currentStudent?.firstName || 'Student'}_${new Date().toISOString().slice(0, 10)}.webm`;
      setPendingFiles((prev) => [
        ...prev,
        {
          file: recordingResult.blob,
          previewUrl: recordingResult.url,
          name: fileName,
          type: recordingResult.blob.type || 'audio/webm'
        }
      ]);
    } catch (err) {
      console.error('Error stopping audio:', err);
      setIsRecordingAudio(false);
    }
  };

  const handleStartVideoRecording = async () => {
    try {
      setErrorMessage('');
      const session = new VideoRecordingSession();
      videoSessionRef.current = session;
      setIsRecordingVideo(true);
      setVideoTimer(0);
      setEvidenceType('video');

      await session.start(videoPreviewRef.current || undefined);

      videoIntervalRef.current = setInterval(() => {
        setVideoTimer((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Video recording failed:', err);
      setIsRecordingVideo(false);
      setErrorMessage('Could not access camera: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleStopVideoRecording = async () => {
    if (!videoSessionRef.current) return;
    try {
      const recordingResult = await videoSessionRef.current.stop();
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      setIsRecordingVideo(false);

      const fileName = `Video_Observation_${currentStudent?.firstName || 'Student'}_${new Date().toISOString().slice(0, 10)}.mp4`;
      setPendingFiles((prev) => [
        ...prev,
        {
          file: recordingResult.blob,
          previewUrl: recordingResult.url,
          name: fileName,
          type: recordingResult.blob.type || 'video/mp4'
        }
      ]);
    } catch (err) {
      console.error('Error stopping video:', err);
      setIsRecordingVideo(false);
    }
  };

  // Document Scanner completion handler
  const handleScanComplete = (dataUrl: string, fileName: string) => {
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        setPendingFiles((prev) => [
          ...prev,
          {
            file: blob,
            previewUrl: dataUrl,
            name: fileName,
            type: 'image/jpeg'
          }
        ]);
        setEvidenceType('writing sample');
      })
      .catch((err) => {
        console.error('Error attaching scanned file:', err);
      });
  };

  // Interactive WIDA Rubric evaluation handler
  const handleApplyRubric = (evaluation: {
    proficiencyLevel: number;
    proficiencySubLevel: ProficiencySubLevel;
    rubricUsed: string;
    rubricDimensionScores: Record<string, { level: ProficiencySubLevel; score: number; dimensionName?: string }>;
    generatedNotes: string;
  }) => {
    setProficiencyLevel(evaluation.proficiencyLevel);
    setProficiencySubLevel(evaluation.proficiencySubLevel);
    setRubricUsed(evaluation.rubricUsed);
    setRubricDimensionScores(evaluation.rubricDimensionScores);

    // If teacher already wrote some notes, keep them below the rubric evaluation
    setTeacherNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return evaluation.generatedNotes;
      return `${evaluation.generatedNotes}\n\nAdditional Teacher Observations:\n${trimmed}`;
    });
  };

  const handleGetAiAssessmentSuggestion = async () => {
    if (!currentStudent) return;
    setAiError('');
    setIsAiAssessing(true);
    setAiAccepted(false);

    try {
      let evidenceTextSnippet = teacherNotes.trim();
      const firstFile = pendingFiles[0];
      if (firstFile) {
        evidenceTextSnippet += `\n[Attached evidence file: ${firstFile.name}, type: ${firstFile.type}]`;
      }

      const response = await fetch('/api/ai/suggest-proficiency-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
          gradeLevel: currentStudent.gradeLevel,
          modality: languageModality,
          keyLanguageUse,
          wideELDStandard,
          evidenceType,
          evidenceText: evidenceTextSnippet,
          teacherNotes
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setAiSuggestion(data);
    } catch (err) {
      console.error('AI suggestion error:', err);
      setAiError(err instanceof Error ? err.message : 'Failed to generate AI suggestion.');
    } finally {
      setIsAiAssessing(false);
    }
  };

  const handleAcceptAiSuggestion = () => {
    if (!aiSuggestion) return;
    setProficiencyLevel(aiSuggestion.suggestedLevel);
    if (aiSuggestion.suggestedSupportTier) {
      setSupportLevel(aiSuggestion.suggestedSupportTier);
    }
    const aiNoteAppendix = `\n\n[WIDA AI Assessment Suggestion - Level ${aiSuggestion.suggestedLevel} (${aiSuggestion.confidenceLevel} Confidence)]:\n${aiSuggestion.rationale}\nNext Steps: ${aiSuggestion.nextSteps.join('; ')}`;
    if (!teacherNotes.includes('[WIDA AI Assessment Suggestion')) {
      setTeacherNotes((prev) => (prev ? prev + aiNoteAppendix : aiNoteAppendix.trim()));
    }
    setAiAccepted(true);
  };

  const handleRejectAiSuggestion = () => {
    setAiSuggestion(null);
    setAiAccepted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setErrorMessage('Please select a student.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setUploadStatus('Uploading evidence media...');

    try {
      const uploadedUrls: string[] = [];
      for (const item of pendingFiles) {
        const url = await uploadEvidenceMedia(
          selectedStudentId,
          isCustomAssessment ? customLetter : assessmentLetter,
          item.file
        );
        uploadedUrls.push(url);
      }

      setUploadStatus('Saving proficiency assessment...');

      const finalLetter = (isCustomAssessment ? customLetter.trim() || 'Formative' : assessmentLetter) as AssessmentLetter;
      const finalTitle = isCustomAssessment
        ? customTitle.trim() || `Formative Point ${customLetter}`
        : `Assessment ${assessmentLetter}`;

      const assessmentData: Omit<ProficiencyAssessment, 'id'> = {
        studentId: selectedStudentId,
        assessmentLetter: finalLetter,
        assessmentTitle: finalTitle,
        category: isCustomAssessment ? 'Ongoing Formative Point' : 'Required Benchmark (A–H)',
        assessmentDate,
        keyLanguageUse,
        wideELDStandard,
        languageModality,
        proficiencyLevel,
        proficiencySubLevel,
        supportLevel,
        evidenceFileURLs: uploadedUrls,
        evidenceType,
        rubricUsed: rubricUsed.trim(),
        rubricDimensionScores: rubricDimensionScores || undefined,
        teacherNotes: teacherNotes.trim(),
        assessedBy: userProfile?.displayName || 'EAL Specialist',
        aiSuggestedLevel: aiSuggestion?.suggestedLevel,
        aiConfidence: aiSuggestion?.confidencePercent,
        aiEvidenceNotes: aiSuggestion?.rationale
      };

      await createProficiencyAssessment(assessmentData);

      setUploadStatus('Saved successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
        onClose();
      }, 500);
    } catch (err) {
      console.error('Error saving assessment:', err);
      setErrorMessage(
        'Failed to save assessment: ' +
          (err instanceof Error ? err.message : String(err))
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-lg shadow-xs">
              {isCustomAssessment ? (customLetter[0] || '★') : assessmentLetter}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Log Proficiency Assessment
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {isCustomAssessment ? 'Formative Checkpoint' : `Required Benchmark ${assessmentLetter}`}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Capture evidence of language development aligned with WIDA 2020 descriptors.
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

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#f26544]/15 border border-[#f26544]/50 text-[#232f49] text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-[#f26544] flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Assessment Mode Toggle: Required Benchmark vs. Ongoing Formative Point */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Assessment Type &amp; Frequency
              </span>
              <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCustomAssessment(false)}
                  className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                    !isCustomAssessment
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Required Benchmark (A–H)
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomAssessment(true)}
                  className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                    isCustomAssessment
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + Additional / Formative Point
                </button>
              </div>
            </div>

            {/* If Required Benchmark: Letters A through H */}
            {!isCustomAssessment ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Select Benchmark Letter (Required Benchmarks A through H) *
                </label>
                <div className="grid grid-cols-8 gap-1.5">
                  {(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as AssessmentLetter[]).map((letter) => (
                    <button
                      type="button"
                      key={letter}
                      onClick={() => setAssessmentLetter(letter)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        assessmentLetter === letter
                          ? 'bg-[#0635aa] text-[#fec707] border border-[#fec707] shadow-xs scale-102 font-extrabold'
                          : 'bg-white text-[#232f49] hover:bg-[#ebf8ff] border border-[#8cacd3]/40'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* If Custom Formative Point: Custom identifier + descriptive title */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Checkpoint Code / Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={customLetter}
                    onChange={(e) => setCustomLetter(e.target.value)}
                    placeholder="e.g. Checkpoint 1, I, J, Unit 2"
                    className="w-full bg-white border border-[#8cacd3]/50 rounded-lg px-3 py-2 text-xs text-[#232f49] font-bold focus:ring-2 focus:ring-[#0635aa]/20 focus:border-[#0635aa] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Checkpoint Title / Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Science Ecosystem Explanation, Oral Fable Retell, Opinion Letter..."
                    className="w-full bg-white border border-[#8cacd3]/50 rounded-lg px-3 py-2 text-xs text-[#232f49] font-medium focus:ring-2 focus:ring-[#0635aa]/20 focus:border-[#0635aa] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 1: Student & Assessment Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Select Multilingual Student *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none transition-colors"
              >
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.lastName}, {s.firstName} {s.preferredName ? `("${s.preferredName}")` : ''} — Grade {s.gradeLevel} ({s.homeroom}, {s.homeLanguage})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assessment Date *
              </label>
              <input
                type="date"
                required
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Key Language Use & WIDA ELD Standard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Key Language Use (WIDA Framework) *
              </label>
              <select
                value={keyLanguageUse}
                onChange={(e) => setKeyLanguageUse(e.target.value as KeyLanguageUse)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none transition-colors"
              >
                {KEY_LANGUAGE_USES.map((klu) => (
                  <option key={klu.id} value={klu.id}>
                    {klu.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WIDA ELD Standard *
              </label>
              <select
                value={wideELDStandard}
                onChange={(e) => setWideELDStandard(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none transition-colors"
              >
                {WIDA_ELD_STANDARDS.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Modality, Proficiency Level (1-6), Support Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Language Modality *
              </label>
              <select
                value={languageModality}
                onChange={(e) => setLanguageModality(e.target.value as LanguageModality)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none transition-colors"
              >
                <option value="Expressive-Writing">Expressive - Writing</option>
                <option value="Expressive-Speaking">Expressive - Speaking</option>
                <option value="Interpretive-Reading">Interpretive - Reading</option>
                <option value="Interpretive-Listening">Interpretive - Listening</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Proficiency Level *
                </label>
                <button
                  type="button"
                  onClick={() => setIsRubricOpen(true)}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
                  title="Open interactive WIDA 2020 Rubric to score directly in-app"
                >
                  <FileCheck className="h-3 w-3" />
                  <span>Assess with WIDA Rubric</span>
                </button>
              </div>

              <select
                value={proficiencySubLevel}
                onChange={(e) => {
                  const val = e.target.value as ProficiencySubLevel;
                  setProficiencySubLevel(val);
                  const info = WIDA_SUB_LEVELS[val];
                  if (info) {
                    setProficiencyLevel(info.baseLevel);
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none transition-colors"
              >
                {ALL_SUB_LEVEL_KEYS.map((subKey) => {
                  const info = WIDA_SUB_LEVELS[subKey];
                  return (
                    <option key={subKey} value={subKey}>
                      {info.label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Language Service Delivery Tier *
              </label>
              <select
                value={supportLevel}
                onChange={(e) => setSupportLevel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none transition-colors"
              >
                <option value="Tier 3">Tier 3: Targeted Services (Levels 1–2)</option>
                <option value="Tier 2">Tier 2: Targeted Services (Levels 3–4)</option>
                <option value="Tier 1">Tier 1: Monitored (Tier 1 Instruction)</option>
              </select>
            </div>
          </div>

          {/* Level Descriptor Preview Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-semibold text-slate-900">
                {WIDA_SUB_LEVELS[proficiencySubLevel]?.label || `Level ${proficiencyLevel}`}:
              </span>
              {rubricDimensionScores && (
                <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                  Direct Rubric Scored
                </span>
              )}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {WIDA_SUB_LEVELS[proficiencySubLevel]?.descriptor || WIDA_LEVELS[proficiencyLevel]?.generalCanDo}
            </p>
          </div>

          {/* EVIDENCE SECTION: In-App Recording, Scanning & File Upload */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Upload className="h-4 w-4 text-slate-600" />
                <span>Assessment Evidence (Document Scan, Writing Sample, Audio, Video, Photo)</span>
              </label>

              <div className="flex items-center space-x-1 text-xs">
                <span className="text-slate-500">Type:</span>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                  className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 font-medium"
                >
                  <option value="writing sample">Writing Sample</option>
                  <option value="photo">Photo / Scanned Document</option>
                  <option value="audio recording">Audio Recording</option>
                  <option value="video">Video Recording</option>
                </select>
              </div>
            </div>

            {/* Media Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Scan Document Option */}
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="bg-white hover:bg-slate-100 border border-slate-300 rounded-xl p-3 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-800 shadow-xs transition-colors"
                title="Scan physical student writing or worksheet using camera"
              >
                <Camera className="h-4 w-4 text-slate-700" />
                <span>Scan Document</span>
              </button>

              <label className="cursor-pointer bg-white hover:bg-slate-100 border border-slate-300 rounded-xl p-3 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-800 shadow-xs transition-colors">
                <Upload className="h-4 w-4 text-slate-700" />
                <span>Upload File</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,audio/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {!isRecordingAudio ? (
                <button
                  type="button"
                  onClick={handleStartAudioRecording}
                  className="bg-white hover:bg-slate-100 border border-slate-300 rounded-xl p-3 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-800 shadow-xs transition-colors"
                >
                  <Mic className="h-4 w-4 text-slate-700" />
                  <span>Record Audio</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopAudioRecording}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl p-3 flex items-center justify-center space-x-2 text-xs font-bold shadow-xs animate-pulse transition-all"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>Stop ({audioTimer}s)</span>
                </button>
              )}

              {!isRecordingVideo ? (
                <button
                  type="button"
                  onClick={handleStartVideoRecording}
                  className="bg-white hover:bg-slate-100 border border-slate-300 rounded-xl p-3 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-800 shadow-xs transition-colors"
                >
                  <Video className="h-4 w-4 text-slate-700" />
                  <span>Record Video</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopVideoRecording}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl p-3 flex items-center justify-center space-x-2 text-xs font-bold shadow-xs animate-pulse transition-all"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>Stop Cam ({videoTimer}s)</span>
                </button>
              )}
            </div>

            {isRecordingVideo && (
              <div className="bg-[#232f49] rounded-xl overflow-hidden p-2 text-center">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full max-h-[220px] rounded-lg mx-auto object-cover"
                />
                <span className="text-[11px] text-[#fec707] mt-1 inline-block animate-pulse font-bold">
                  🔴 Recording Classroom Video Observation...
                </span>
              </div>
            )}

            {/* Pending Attached Files List */}
            {pendingFiles.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#8cacd3]/30">
                <span className="text-[11px] font-bold text-[#0635aa] uppercase">
                  Ready to Attach &amp; Upload ({pendingFiles.length}):
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {pendingFiles.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2 rounded-lg border border-[#8cacd3]/40 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {item.type.includes('audio') ? (
                          <Mic className="h-3.5 w-3.5 text-[#0635aa] flex-shrink-0" />
                        ) : item.type.includes('video') ? (
                          <Video className="h-3.5 w-3.5 text-[#7b9626] flex-shrink-0" />
                        ) : (
                          <FileText className="h-3.5 w-3.5 text-[#0635aa] flex-shrink-0" />
                        )}
                        <span className="font-semibold text-[#232f49] truncate max-w-[280px]">
                          {item.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePendingFile(idx)}
                        className="text-slate-400 hover:text-[#f26544] p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rubric Used */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rubric Used
            </label>
            <input
              type="text"
              value={rubricUsed}
              onChange={(e) => setRubricUsed(e.target.value)}
              placeholder="e.g. WIDA Writing Rubric Grades 1-3, Oral Narrative Protocol..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none transition-colors"
            />
          </div>

          {/* Teacher Observations & Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Teacher Observations, Language Samples &amp; Notes *
              </label>

              {/* AI Suggestion Trigger Button */}
              <button
                type="button"
                onClick={handleGetAiAssessmentSuggestion}
                disabled={isAiAssessing || (!teacherNotes.trim() && pendingFiles.length === 0)}
                className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              >
                {isAiAssessing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-800" />
                    <span>Analyzing with WIDA AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-slate-700" />
                    <span>Get AI Assessment Suggestion</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              required
              rows={4}
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Record detailed observations of student's discourse complexity, sentence forms, vocabulary usage, translanguaging, and scaffolds needed during this assessment task... You can also click 'Get AI Assessment Suggestion' to analyze the text or attached sample against WIDA 2020 descriptors."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none leading-relaxed transition-colors"
            />
          </div>

          {/* AI SUGGESTION RESULT CARD */}
          {aiError && (
            <div className="p-3 rounded-xl bg-[#f26544]/15 border border-[#f26544]/40 text-[#232f49] text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-[#f26544] flex-shrink-0" />
              <span>AI Evaluation Error: {aiError}</span>
            </div>
          )}

          {aiSuggestion && (
            <div className="bg-[#ebf8ff] border border-[#8cacd3] rounded-2xl p-4.5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#8cacd3]/40 pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-lg bg-[#0635aa] text-[#fec707] flex items-center justify-center font-bold text-xs">
                    Lv {aiSuggestion.suggestedLevel}
                  </div>
                  <div>
                    <span className="font-bold text-[#0635aa] text-xs">
                      AI WIDA Suggestion: Level {aiSuggestion.suggestedLevel} — {aiSuggestion.widaDescriptorRef}
                    </span>
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#e7e8da] text-[#7b9626] border border-[#7b9626]/30">
                      {aiSuggestion.confidencePercent}% ({aiSuggestion.confidenceLevel} Confidence)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-[#0635aa]">
                    Recommended: <strong>{aiSuggestion.suggestedSupportTier}</strong>
                  </span>
                </div>
              </div>

              {/* Rationale & Direct Sample Evidence */}
              <div className="space-y-2 text-xs">
                <p className="text-[#232f49] leading-relaxed font-normal">
                  <strong>Analysis:</strong> {aiSuggestion.rationale}
                </p>

                {aiSuggestion.evidenceQuotes.length > 0 && (
                  <div className="bg-white p-2.5 rounded-xl border border-[#8cacd3]/40 space-y-1">
                    <span className="font-bold text-[#0635aa] block text-[11px] uppercase tracking-wider">
                      Observed Sample Evidence:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#232f49]">
                      {aiSuggestion.evidenceQuotes.map((q, i) => (
                        <li key={i} className="italic">&quot;{q}&quot;</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSuggestion.nextSteps.length > 0 && (
                  <div className="bg-[#fec707]/15 p-2.5 rounded-xl border border-[#fec707]/60 space-y-1">
                    <span className="font-bold text-[#232f49] block text-[11px] uppercase tracking-wider">
                      Recommended Next Steps for Language Growth:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#232f49]">
                      {aiSuggestion.nextSteps.map((ns, i) => (
                        <li key={i}>{ns}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Teacher Decision Actions: Accept, Modify, Reject */}
              <div className="pt-2 flex items-center justify-between border-t border-[#8cacd3]/30">
                <span className="text-[11px] text-slate-500 italic">
                  {aiAccepted ? '✓ Suggestion applied to form fields.' : 'Review and accept to update form fields.'}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleRejectAiSuggestion}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
                  >
                    Reject / Dismiss
                  </button>

                  <button
                    type="button"
                    onClick={handleAcceptAiSuggestion}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      aiAccepted
                        ? 'bg-[#7b9626] text-white'
                        : 'bg-[#fec707] hover:bg-[#eab706] text-[#0635aa] shadow-xs'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 text-[#0635aa]" />
                    <span>{aiAccepted ? 'Suggestion Applied' : 'Accept Suggestion'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {uploadStatus || 'Evidence media stored with student assessment record.'}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all active:scale-95"
              >
                {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />}
                <span>Save Assessment</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Document Scanner Viewfinder & Processor Modal */}
      {isScannerOpen && (
        <DocumentScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanComplete={handleScanComplete}
          documentTitle={
            currentStudent
              ? `${currentStudent.firstName}_${currentStudent.lastName}_${isCustomAssessment ? customLetter : assessmentLetter}`
              : 'Writing_Sample'
          }
        />
      )}

      {/* Interactive WIDA 2020 Rubric Direct Evaluator */}
      {isRubricOpen && (
        <WidaRubricEvaluatorModal
          isOpen={isRubricOpen}
          onClose={() => setIsRubricOpen(false)}
          onApplyEvaluation={handleApplyRubric}
          initialModality={languageModality.includes('Speaking') ? 'Speaking' : 'Writing'}
          studentName={currentStudent?.firstName || 'Student'}
        />
      )}
    </div>
  );
};
