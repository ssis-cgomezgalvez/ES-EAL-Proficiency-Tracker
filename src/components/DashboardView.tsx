import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Users,
  ArrowUpDown,
  ChevronRight,
  Database,
  Plus,
  RefreshCw,
  Globe,
  BookOpen,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  Printer,
  Upload,
  Bell,
  Award,
  Layers
} from 'lucide-react';
import {
  Student,
  GradeLevel,
  EalStatus,
  MtssTier,
  MTSS_TIERS,
  normalizeMtssTier,
  WIDA_LEVELS,
  EalNotification
} from '../types/eal';
import { useAuth } from '../contexts/AuthContext';

interface DashboardViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onOpenAddStudent: () => void;
  onOpenAssessmentForStudent: (student: Student) => void;
  onSeedData: () => Promise<void>;
  loading: boolean;
  onOpenReports?: () => void;
  onOpenGoogleSheets?: () => void;
  onOpenDataImport?: () => void;
  notifications?: EalNotification[];
  onOpenNotifications?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  onSelectStudent,
  onOpenAddStudent,
  onOpenAssessmentForStudent,
  onSeedData,
  loading,
  onOpenReports,
  onOpenGoogleSheets,
  onOpenDataImport,
  notifications = [],
  onOpenNotifications
}) => {
  const { canEditStudents, canEditAssessments } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceTier, setSelectedServiceTier] = useState<'ALL' | MtssTier>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');

  // Advanced filters toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedHomeroom, setSelectedHomeroom] = useState<string>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<keyof Student>('overallWIDALevel');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter options
  const homeroomOptions = useMemo(() => {
    const set = new Set(students.map((s) => s.homeroom).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  const languageOptions = useMemo(() => {
    const set = new Set(students.map((s) => s.homeLanguage).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  // Overall Cohort Metrics (Language Proficiency Centered)
  const cohortMetrics = useMemo(() => {
    let tier3 = 0;
    let tier2 = 0;
    let tier1 = 0;
    let widaSum = 0;

    students.forEach((s) => {
      widaSum += s.overallWIDALevel || 0;
      const tier = normalizeMtssTier(s.currentSupportLevel);
      if (tier === 'Tier 3') tier3++;
      else if (tier === 'Tier 2') tier2++;
      else if (tier === 'Tier 1') tier1++;
    });

    const averageWida = students.length > 0 ? (widaSum / students.length).toFixed(1) : '—';
    const targetedCount = tier3 + tier2;

    return {
      total: students.length,
      averageWida,
      tier3,
      tier2,
      tier1,
      targetedCount
    };
  }, [students]);

  const hasActiveAdvancedFilters =
    selectedHomeroom !== 'ALL' || selectedLanguage !== 'ALL' || selectedStatus !== 'ALL';

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // Name / search
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const match =
            s.firstName.toLowerCase().includes(term) ||
            (s.preferredName && s.preferredName.toLowerCase().includes(term)) ||
            s.lastName.toLowerCase().includes(term) ||
            s.studentId.toLowerCase().includes(term) ||
            s.homeroom.toLowerCase().includes(term) ||
            s.homeroomTeacher.toLowerCase().includes(term);
          if (!match) return false;
        }

        // Service Tier Filter (represented as a filter facet)
        if (selectedServiceTier !== 'ALL') {
          const sTier = normalizeMtssTier(s.currentSupportLevel);
          if (sTier !== selectedServiceTier) return false;
        }

        // Grade Filter
        if (selectedGrade !== 'ALL' && s.gradeLevel !== selectedGrade) return false;

        // Advanced filters
        if (selectedHomeroom !== 'ALL' && s.homeroom !== selectedHomeroom) return false;
        if (selectedLanguage !== 'ALL' && s.homeLanguage !== selectedLanguage) return false;
        if (selectedStatus !== 'ALL' && s.ealStatus !== selectedStatus) return false;

        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === undefined || valB === undefined) return 0;
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [
    students,
    searchTerm,
    selectedServiceTier,
    selectedGrade,
    selectedHomeroom,
    selectedLanguage,
    selectedStatus,
    sortField,
    sortAsc
  ]);

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedServiceTier('ALL');
    setSelectedGrade('ALL');
    setSelectedHomeroom('ALL');
    setSelectedLanguage('ALL');
    setSelectedStatus('ALL');
  };

  // Helper for WIDA Level badge: lean, clean, tabular
  const renderWidaBadge = (level: number) => {
    const rounded = Math.floor(level) || 1;
    const clamped = Math.max(1, Math.min(6, rounded));
    const desc = WIDA_LEVELS[clamped];

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${desc.badgeBg} ${desc.badgeBorder}`}
        title={`Level ${level.toFixed(1)}: ${desc.name} — ${desc.generalCanDo}`}
      >
        <span className="font-mono tabular-nums mr-1 font-bold">{level.toFixed(1)}</span>
        <span>{desc.name}</span>
      </span>
    );
  };

  // Helper for Service Delivery badge (clean informational representation of MTSS)
  const renderServiceBadge = (levelString?: string) => {
    const tier = normalizeMtssTier(levelString);
    const info = MTSS_TIERS[tier];

    return (
      <div className="flex flex-col">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border w-fit ${info.badgeBg} ${info.badgeBorder}`}
          title={info.description}
        >
          {info.shortName}
        </span>
        <span className="text-[11px] text-slate-500 mt-0.5">{info.serviceName}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* High-Priority Notification Banner if active */}
      {notifications.length > 0 && onOpenNotifications && (
        <div
          onClick={onOpenNotifications}
          className="bg-blue-50 hover:bg-blue-100/60 border border-blue-200/80 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-colors text-xs"
        >
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-[#0635aa] text-white flex items-center justify-center font-bold flex-shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-900">
                {notifications[0].title}
              </span>
              <p className="text-slate-600 text-[11px] truncate max-w-xl">
                {notifications[0].message}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-[#0635aa] hover:underline">
              View All ({notifications.length} alerts) &rarr;
            </span>
          </div>
        </div>
      )}

      {/* Main Header with Action Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Elementary EAL Tracker
              </h1>
              <span className="h-2 w-2 rounded-full bg-[#0635aa]" title="SSIS Active" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multilingual Learner Language Proficiency &amp; Services • Saigon South International School
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {onOpenGoogleSheets && (
              <button
                onClick={onOpenGoogleSheets}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-2xs"
                title="Export student proficiency logs to Google Sheets"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-slate-600" />
                <span>Google Sheets</span>
              </button>
            )}

            {onOpenReports && (
              <button
                onClick={onOpenReports}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-2xs"
                title="Print student profiles, rosters & transition packs"
              >
                <Printer className="h-3.5 w-3.5 text-slate-600" />
                <span>Reports &amp; Handoff</span>
              </button>
            )}

            {canEditStudents && onOpenDataImport && (
              <button
                onClick={onOpenDataImport}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-2xs"
                title="Bulk upload student data from CSV"
              >
                <Upload className="h-3.5 w-3.5 text-slate-600" />
                <span>Import CSV</span>
              </button>
            )}

            {students.length === 0 && (
              <button
                onClick={onSeedData}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5"
              >
                <Database className="h-3.5 w-3.5 text-[#0635aa]" />
                <span>Load Sample SSIS Roster</span>
              </button>
            )}

            {canEditStudents && (
              <button
                onClick={onOpenAddStudent}
                className="bg-[#0635aa] hover:bg-[#052c8c] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Enroll Learner</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Balanced Overview Metric Cards (Centered on Learners and Proficiency, with MTSS as represented information) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {/* Card 1: Total Multilingual Learners */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Multilingual Learners</span>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {cohortMetrics.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Enrolled across Grades KG–5
            </div>
          </div>

          {/* Card 2: Mean WIDA Proficiency Level */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Cohort Mean WIDA Level</span>
              <Award className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              Lv {cohortMetrics.averageWida}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              WIDA 2020 Standard Scale (1.0–6.0)
            </div>
          </div>

          {/* Card 3: Language Services (Clear representation of MTSS without dominating) */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Service Delivery</span>
              <Layers className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {cohortMetrics.targetedCount} <span className="text-xs font-normal text-slate-500">Targeted</span> · {cohortMetrics.tier1} <span className="text-xs font-normal text-slate-500">Monitored</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Tier 3: {cohortMetrics.tier3} · Tier 2: {cohortMetrics.tier2} · Tier 1: {cohortMetrics.tier1}
            </div>
          </div>

          {/* Card 4: Home Languages Spoken */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Home Languages</span>
              <Globe className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {languageOptions.length} Spoken
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Across {homeroomOptions.length} homeroom classrooms
            </div>
          </div>
        </div>
      </div>

      {/* Clean Search, Grade Selector, Service Filter & Collapsible Options */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, ID, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0635aa] focus:border-[#0635aa] transition-colors text-slate-900 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Grade Filter Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto text-xs font-medium py-0.5">
            <span className="text-slate-400 mr-1 text-[11px]">Grade:</span>
            {['ALL', 'K', '1', '2', '3', '4', '5'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors font-semibold ${
                  selectedGrade === g
                    ? 'bg-[#0635aa] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {g === 'ALL' ? 'All' : g === 'K' ? 'KG' : `Gr ${g}`}
              </button>
            ))}
          </div>

          {/* Service Delivery Filter Dropdown (Quiet, Clean Representation) */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedServiceTier}
              onChange={(e) => setSelectedServiceTier(e.target.value as 'ALL' | MtssTier)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0635aa]"
              aria-label="Filter by Service Delivery"
            >
              <option value="ALL">All Services</option>
              <option value="Tier 3">Tier 3: Targeted Services (Lv 1–2)</option>
              <option value="Tier 2">Tier 2: Targeted Services (Lv 3–4)</option>
              <option value="Tier 1">Tier 1: Monitored (Core)</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showAdvancedFilters || hasActiveAdvancedFilters
                  ? 'bg-slate-100 text-slate-900 border-slate-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              <span>More</span>
              {hasActiveAdvancedFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0635aa]" />
              )}
            </button>

            {(searchTerm || selectedServiceTier !== 'ALL' || selectedGrade !== 'ALL' || hasActiveAdvancedFilters) && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium px-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fade-in">
            {/* Homeroom */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Homeroom
              </label>
              <select
                value={selectedHomeroom}
                onChange={(e) => setSelectedHomeroom(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0635aa]"
              >
                <option value="ALL">All Homerooms</option>
                {homeroomOptions.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Home Language */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Home Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0635aa]"
              >
                <option value="ALL">All Home Languages</option>
                {languageOptions.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* EAL Status */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                EAL Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0635aa]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Current">Current Active</option>
                <option value="Monitor">Monitoring</option>
                <option value="Exited">Exited</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Roster Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-900 text-sm">
              Multilingual Learner Roster
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
              {filteredStudents.length} of {students.length}
            </span>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            Click any row to open student profile &amp; formative checkpoints
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="h-6 w-6 text-[#0635aa] animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium">Loading student records...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No students match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {students.length === 0
                ? 'Your student database is empty. Click "Load Sample SSIS Roster" to populate initial multilingual profiles.'
                : 'Try clearing your search or resetting filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                    onClick={() => handleSort('lastName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Student</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
                    onClick={() => handleSort('gradeLevel')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Grade</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Homeroom</th>
                  <th className="py-3 px-3">Home Language</th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
                    onClick={() => handleSort('currentSupportLevel')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Service Tier</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                    onClick={() => handleSort('overallWIDALevel')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>WIDA Level</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id || student.studentId}
                    onClick={() => onSelectStudent(student)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Student Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {student.profilePhotoURL ? (
                            <img
                              src={student.profilePhotoURL}
                              alt={student.firstName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-semibold text-slate-700 text-xs">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 group-hover:text-[#0635aa] transition-colors flex items-center space-x-1.5">
                            <span>
                              {student.lastName}, {student.firstName}
                            </span>
                            {student.preferredName && (
                              <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal border border-slate-200">
                                &quot;{student.preferredName}&quot;
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                            ID: {student.studentId} · Age {student.age}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Grade Level */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded font-medium text-xs bg-slate-100 text-slate-700 border border-slate-200">
                        {student.gradeLevel === 'K' ? 'KG' : `Gr ${student.gradeLevel}`}
                      </span>
                    </td>

                    {/* Homeroom */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 text-xs">{student.homeroom}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                        {student.homeroomTeacher}
                      </div>
                    </td>

                    {/* Home Language */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <Globe className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{student.homeLanguage}</span>
                      </div>
                    </td>

                    {/* Service Tier (Represented cleanly, not centered) */}
                    <td className="py-3 px-3">
                      {renderServiceBadge(student.currentSupportLevel)}
                    </td>

                    {/* WIDA Proficiency Level */}
                    <td className="py-3 px-4">
                      {renderWidaBadge(student.overallWIDALevel)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        {canEditAssessments && (
                          <button
                            onClick={() => onOpenAssessmentForStudent(student)}
                            title="Log Formative Assessment"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0635aa] hover:bg-slate-100 transition-colors"
                          >
                            <BookOpen className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#0635aa] hover:bg-blue-50 transition-colors"
                        >
                          <span>Profile</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
