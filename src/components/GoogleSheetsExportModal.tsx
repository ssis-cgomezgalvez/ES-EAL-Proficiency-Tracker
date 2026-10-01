import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  Student,
  WidaScore,
  ProficiencyAssessment,
  QuarterlySupport
} from '../types/eal';
import {
  generateGoogleSheetsExportData,
  downloadCsvFile,
  copyToGoogleSheetsClipboard
} from '../utils/googleSheetsExporter';
import { exportToGoogleSheetsApi, GoogleSpreadsheetResult } from '../utils/googleSheetsDirectApi';
import { useAuth } from '../contexts/AuthContext';

interface GoogleSheetsExportModalProps {
  students: Student[];
  assessments: ProficiencyAssessment[];
  widaScores: WidaScore[];
  quarterlySupports: QuarterlySupport[];
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsExportModal: React.FC<GoogleSheetsExportModalProps> = ({
  students,
  assessments,
  widaScores,
  quarterlySupports,
  isOpen,
  onClose
}) => {
  const { accessToken, signInWithGoogle, currentUser } = useAuth();
  const [selectedSheetType, setSelectedSheetType] = useState<
    'combined' | 'students' | 'wida' | 'assessments' | 'quarterly'
  >('combined');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Direct Google Sheets API states
  const [isExportingDirect, setIsExportingDirect] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportedSheet, setExportedSheet] = useState<GoogleSpreadsheetResult | null>(null);

  if (!isOpen) return null;

  const exportData = generateGoogleSheetsExportData(
    students,
    assessments,
    widaScores,
    quarterlySupports
  );

  const getActiveCsv = () => {
    switch (selectedSheetType) {
      case 'students':
        return { csv: exportData.studentsCsv, name: 'SSIS_EAL_Students_Roster.csv' };
      case 'wida':
        return { csv: exportData.widaScoresCsv, name: 'SSIS_EAL_WIDA_Scores_Log.csv' };
      case 'assessments':
        return { csv: exportData.assessmentsCsv, name: 'SSIS_EAL_Proficiency_Assessments.csv' };
      case 'quarterly':
        return { csv: exportData.quarterlySupportCsv, name: 'SSIS_EAL_Quarterly_MTSS_Support.csv' };
      default:
        return {
          csv: exportData.combinedProficiencyLogCsv,
          name: 'SSIS_EAL_Master_Proficiency_Log.csv'
        };
    }
  };

  const handleCopyClipboard = async () => {
    const { csv } = getActiveCsv();
    const success = await copyToGoogleSheetsClipboard(csv);
    if (success) {
      setCopiedKey(selectedSheetType);
      setTimeout(() => setCopiedKey(null), 3000);
    }
  };

  const handleDownload = () => {
    const { csv, name } = getActiveCsv();
    downloadCsvFile(csv, name);
  };

  const handleDirectGoogleSheetsExport = async () => {
    setExportError(null);
    setIsExportingDirect(true);

    try {
      let token = accessToken;
      if (!token) {
        token = await signInWithGoogle();
      }

      if (!token) {
        throw new Error('Google authorization is required to create a new spreadsheet in your Google Drive. Please sign in with your Google account.');
      }

      const result = await exportToGoogleSheetsApi(
        token,
        students,
        assessments,
        widaScores,
        quarterlySupports
      );
      setExportedSheet(result);
    } catch (err: any) {
      console.error('Google Sheets export error:', err);
      setExportError(err?.message || 'Failed to export to Google Sheets.');
    } finally {
      setIsExportingDirect(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-[#0635aa] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  Export to Google Sheets
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Google Workspace Direct
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Maintains the exact tabular structure of SSIS proficiency logs, scores, and support tiers.
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

        {/* Primary Direct Export Callout */}
        <div className="bg-[#0635aa] text-white p-4 sm:p-5 rounded-xl shadow-md border border-[#052c8c] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-white" />
                <h3 className="text-sm font-semibold tracking-wide">
                  Export Direct to Google Sheets
                </h3>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                Creates a new, formatted Google Spreadsheet in your Google Drive with dedicated tabs:
                Master Proficiency Log, Student Roster, Formative Assessments, WIDA Scores, and Service Logs.
              </p>
            </div>
          </div>

          {exportedSheet ? (
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">
                  Spreadsheet created with {exportedSheet.sheetsCreated} tabs!
                </span>
              </div>
              <a
                href={exportedSheet.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-[#0635aa] px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Open in Google Sheets</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-[11px] text-blue-200">
                {currentUser?.email ? (
                  <span>Connected as: <strong className="text-white">{currentUser.email}</strong></span>
                ) : (
                  <span>Will prompt for Google sign-in to authorize spreadsheet creation</span>
                )}
              </div>
              <button
                onClick={handleDirectGoogleSheetsExport}
                disabled={isExportingDirect}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-100 disabled:opacity-50 text-[#0635aa] px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                {isExportingDirect ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Creating Google Sheet...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Export to Google Sheets Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {exportError && (
            <div className="bg-red-500/20 border border-red-400/40 p-2.5 rounded-lg flex items-start space-x-2 text-xs text-white">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{exportError}</span>
                {!accessToken && (
                  <button
                    onClick={async () => {
                      await signInWithGoogle();
                    }}
                    className="block mt-1 font-semibold underline text-white"
                  >
                    Click to authorize with Google
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sheet Selection Options for CSV & Clipboard */}
        <div className="space-y-3 pt-1">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            Or Export Specific Tabular Logs (CSV / Clipboard):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setSelectedSheetType('combined')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedSheetType === 'combined'
                  ? 'bg-[#0635aa] text-white border-[#0635aa] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold mb-0.5">
                <Sparkles className="h-4 w-4" />
                <span>Master Combined Log</span>
              </div>
              <p className="text-[11px] opacity-80 leading-snug">
                Student roster + latest WIDA levels + formative assessment counts &amp; dates.
              </p>
            </button>

            <button
              onClick={() => setSelectedSheetType('assessments')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedSheetType === 'assessments'
                  ? 'bg-[#0635aa] text-white border-[#0635aa] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold mb-0.5">
                <BookOpen className="h-4 w-4" />
                <span>Proficiency Assessments (A–H)</span>
              </div>
              <p className="text-[11px] opacity-80 leading-snug">
                All formative task scores, WIDA standards, modalities, rubrics, and notes ({assessments.length}).
              </p>
            </button>

            <button
              onClick={() => setSelectedSheetType('wida')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedSheetType === 'wida'
                  ? 'bg-[#0635aa] text-white border-[#0635aa] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold mb-0.5">
                <Award className="h-4 w-4" />
                <span>WIDA Domain Scores Log</span>
              </div>
              <p className="text-[11px] opacity-80 leading-snug">
                Speaking, Listening, Reading, Writing, and Composite trajectory ({widaScores.length}).
              </p>
            </button>

            <button
              onClick={() => setSelectedSheetType('quarterly')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedSheetType === 'quarterly'
                  ? 'bg-[#0635aa] text-white border-[#0635aa] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold mb-0.5">
                <Layers className="h-4 w-4" />
                <span>Language Service Logs</span>
              </div>
              <p className="text-[11px] opacity-80 leading-snug">
                Service tier tracking, targeted intervention hours &amp; next-year projections ({quarterlySupports.length}).
              </p>
            </button>
          </div>
        </div>

        {/* Quick Clipboard & CSV Download */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-semibold">1-Click Tabular Copy</strong>
            <p className="text-[11px] text-slate-500">
              Copies TSV table to clipboard. Open any spreadsheet and press <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-800 font-mono text-[10px]">Ctrl+V</kbd>.
            </p>
            <button
              onClick={handleCopyClipboard}
              className="w-full mt-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg py-1.5 font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
            >
              {copiedKey ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied TSV to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy for Existing Google Sheet</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-semibold">Download Raw CSV</strong>
            <p className="text-[11px] text-slate-500">
              Save formatted file to disk for archiving or uploading via File &gt; Import.
            </p>
            <button
              onClick={handleDownload}
              className="w-full mt-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg py-1.5 font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Download Formatted CSV</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <a
            href="https://docs.google.com/spreadsheets/d/create"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0635aa] hover:underline font-medium flex items-center space-x-1"
          >
            <span>Open Blank Google Sheet</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
