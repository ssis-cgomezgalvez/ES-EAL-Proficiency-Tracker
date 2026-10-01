import React from 'react';
import {
  GraduationCap,
  Users,
  Award,
  BookOpen,
  PlusCircle,
  ShieldCheck,
  LogIn,
  LogOut,
  ChevronDown,
  Bell,
  Printer,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/eal';

interface NavbarProps {
  currentTab: 'roster' | 'assessment-entry' | 'reports';
  onSelectTab: (tab: 'roster' | 'assessment-entry' | 'reports') => void;
  onOpenAddStudent: () => void;
  onOpenAssessmentEntry: () => void;
  notificationCount?: number;
  onOpenNotifications?: () => void;
  onOpenReports?: () => void;
  onOpenGoogleSheets?: () => void;
  onOpenDataImport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddStudent,
  onOpenAssessmentEntry,
  notificationCount = 0,
  onOpenNotifications,
  onOpenReports,
  onOpenGoogleSheets,
  onOpenDataImport
}) => {
  const {
    currentUser,
    activeRole,
    setActiveRole,
    signInWithGoogle,
    signOut,
    canEditStudents,
    canEditAssessments
  } = useAuth();

  const roleLabels: Record<UserRole, { title: string; badge: string; desc: string }> = {
    eal_teacher: {
      title: 'EAL Specialist',
      badge: 'bg-[#fec707]/20 text-[#fec707] border-[#fec707]/30',
      desc: 'Full Edit Access'
    },
    homeroom_teacher: {
      title: 'Homeroom Teacher',
      badge: 'bg-[#8cacd3]/20 text-[#8cacd3] border-[#8cacd3]/30',
      desc: 'View + Limited Edit'
    },
    admin: {
      title: 'Administrator',
      badge: 'bg-[#e7e8da]/30 text-[#e7e8da] border-[#e7e8da]/30',
      desc: 'Full System View'
    }
  };

  return (
    <header className="bg-[#0635aa] text-white shadow-md border-b border-[#052c8c] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onSelectTab('roster')}
          >
            {/* SSIS Yellow Accent Emblem */}
            <div className="h-10 w-10 rounded-xl bg-[#fec707] flex items-center justify-center shadow-md shadow-[#052c8c]/30 flex-shrink-0">
              <GraduationCap className="h-6 w-6 text-[#0635aa] stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-white/90 transition-colors">
                  Saigon South International School
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-white/15 text-white border border-white/20 hidden sm:inline-block">
                  EAL Tracker
                </span>
              </div>
              <p className="text-[11px] text-white/70 hidden md:block">
                Elementary Multilingual Learner Progress &amp; Language Proficiency Tracking
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('roster')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                currentTab === 'roster'
                  ? 'bg-white/15 text-white shadow-inner font-semibold border border-white/20'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="h-4 w-4 text-[#fec707]" />
              <span>Student Roster</span>
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                currentTab === 'reports'
                  ? 'bg-white/15 text-white shadow-inner font-semibold border border-white/20'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="h-4 w-4 text-[#fec707]" />
              <span>WIDA Matrix &amp; Analytics</span>
            </button>
          </nav>

          {/* Quick Tools & Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Notification Bell with SSIS Red Accent Badge */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Assessment Reminders & Alerts"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#f26544] text-white font-bold text-[10px] flex items-center justify-center shadow-xs animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Reports & Print */}
            {onOpenReports && (
              <button
                onClick={onOpenReports}
                className="hidden sm:inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                title="Printable Reports & Transition Packs"
              >
                <Printer className="h-3.5 w-3.5 text-[#fec707]" />
                <span className="hidden xl:inline">Reports &amp; Handoff</span>
              </button>
            )}

            {/* Google Sheets Export */}
            {onOpenGoogleSheets && (
              <button
                onClick={onOpenGoogleSheets}
                className="hidden sm:inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                title="Export Formatted Google Sheet"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#fec707]" />
                <span className="hidden xl:inline">Google Sheets</span>
              </button>
            )}

            {/* Bulk Import */}
            {canEditStudents && onOpenDataImport && (
              <button
                onClick={onOpenDataImport}
                className="hidden md:inline-flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                title="Import Students from CSV"
              >
                <Upload className="h-3.5 w-3.5 text-[#8cacd3]" />
                <span className="hidden xl:inline">Import CSV</span>
              </button>
            )}

            {/* Action Buttons: SSIS Yellow */}
            {canEditAssessments && (
              <button
                onClick={onOpenAssessmentEntry}
                className="hidden sm:inline-flex items-center space-x-1.5 bg-[#fec707] hover:bg-[#eab706] text-[#0635aa] px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold shadow-sm transition-all active:scale-95"
              >
                <BookOpen className="h-4 w-4 stroke-[2.4]" />
                <span>+ Assessment</span>
              </button>
            )}

            {canEditStudents && (
              <button
                onClick={onOpenAddStudent}
                className="inline-flex items-center space-x-1 bg-white/15 hover:bg-white/25 text-white border border-white/25 px-2.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-colors"
              >
                <PlusCircle className="h-4 w-4 text-[#fec707]" />
                <span className="hidden sm:inline">Add</span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="relative group">
              <div className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-2 py-1.5 text-xs cursor-pointer transition-colors">
                <ShieldCheck className="h-3.5 w-3.5 text-[#fec707]" />
                <div className="text-left hidden lg:block">
                  <div className="text-[9px] uppercase tracking-wider text-[#8cacd3] leading-none">Role:</div>
                  <div className="font-semibold text-white leading-tight">{roleLabels[activeRole].title}</div>
                </div>
                <span className="lg:hidden text-white font-semibold">{roleLabels[activeRole].title.split(' ')[0]}</span>
                <ChevronDown className="h-3 w-3 text-[#8cacd3]" />
              </div>

              {/* Role Dropdown */}
              <div className="absolute right-0 mt-1 w-56 bg-[#232f49] border border-[#0635aa] rounded-xl shadow-2xl py-1.5 hidden group-hover:block group-focus-within:block z-50">
                <div className="px-3 py-1.5 border-b border-white/10 text-[10px] text-[#8cacd3] font-semibold uppercase tracking-wider">
                  Switch Active Role (Demo / Review):
                </div>
                {(['eal_teacher', 'homeroom_teacher', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setActiveRole(r)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#0635aa] transition-colors ${
                      activeRole === r ? 'bg-[#fec707]/15 text-[#fec707] font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{roleLabels[r].title}</div>
                      <div className="text-[10px] text-[#8cacd3]">{roleLabels[r].desc}</div>
                    </div>
                    {activeRole === r && <div className="h-2 w-2 rounded-full bg-[#fec707]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-white/20">
                <div className="hidden 2xl:block text-right">
                  <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-[#8cacd3] truncate max-w-[120px]">{currentUser.email}</div>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-white/80 hover:text-[#f26544] hover:bg-white/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center space-x-1.5 bg-[#fec707] hover:bg-[#eab706] text-[#0635aa] px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <LogIn className="h-3.5 w-3.5 text-[#0635aa]" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
