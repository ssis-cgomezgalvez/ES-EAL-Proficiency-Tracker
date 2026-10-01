import React, { useState } from 'react';
import {
  X,
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { EalNotification, NotificationType, Student, AssessmentLetter } from '../types/eal';

interface NotificationCenterModalProps {
  notifications: EalNotification[];
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
  onOpenAssessmentForStudent: (student: Student, defaultLetter?: AssessmentLetter) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  notifications,
  students,
  isOpen,
  onClose,
  onSelectStudent,
  onOpenAssessmentForStudent
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | NotificationType>('ALL');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const visibleNotifications = notifications
    .filter((n) => !dismissedIds.has(n.id))
    .filter((n) => {
      if (activeFilter === 'ALL') return true;
      return n.type === activeFilter;
    });

  const windowRemindersCount = notifications.filter(
    (n) => n.type === 'window_reminder' && !dismissedIds.has(n.id)
  ).length;
  const dueChecksCount = notifications.filter(
    (n) => n.type === 'due_check' && !dismissedIds.has(n.id)
  ).length;
  const growthFlagsCount = notifications.filter(
    (n) => n.type === 'growth_flag' && !dismissedIds.has(n.id)
  ).length;

  const handleActionClick = (n: EalNotification) => {
    if (!n.studentId) {
      onClose();
      return;
    }

    const st = students.find((s) => s.studentId === n.studentId);
    if (!st) return;

    if (n.type === 'due_check') {
      onClose();
      onOpenAssessmentForStudent(st);
    } else {
      onClose();
      onSelectStudent(st);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-[#0635aa] text-white flex items-center justify-center shadow-xs">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  EAL Assessment Notifications &amp; Alerts
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {visibleNotifications.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Assessment window reminders, student proficiency due checks, and growth anomaly flags.
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

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium overflow-x-auto border border-slate-200">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Alerts ({notifications.length - dismissedIds.size})
          </button>

          <button
            onClick={() => setActiveFilter('window_reminder')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center space-x-1 ${
              activeFilter === 'window_reminder'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            <span>Windows ({windowRemindersCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('due_check')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center space-x-1 ${
              activeFilter === 'due_check'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Due Checks ({dueChecksCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('growth_flag')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center space-x-1 ${
              activeFilter === 'growth_flag'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            <span>Growth Flags ({growthFlagsCount})</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {visibleNotifications.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-900">All caught up!</h4>
              <p className="text-xs text-slate-500">
                No active assessment alerts or overdue checks for this filter.
              </p>
            </div>
          ) : (
            visibleNotifications.map((n) => {
              return (
                <div
                  key={n.id}
                  onClick={() => handleActionClick(n)}
                  className={`p-3.5 rounded-lg border transition-colors cursor-pointer flex items-start justify-between gap-3 text-xs ${
                    n.type === 'growth_flag'
                      ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                      : n.type === 'due_check'
                      ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                      : 'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`h-7 w-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        n.type === 'growth_flag'
                          ? 'bg-red-600 text-white'
                          : n.type === 'due_check'
                          ? 'bg-amber-600 text-white'
                          : 'bg-[#0635aa] text-white'
                      }`}
                    >
                      {n.type === 'growth_flag' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : n.type === 'due_check' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <Calendar className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-slate-900">{n.title}</div>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                      {n.dueDate && (
                        <div className="text-[10px] text-slate-400 mt-1">Due: {n.dueDate}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(n);
                      }}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-[#0635aa] px-2.5 py-1 rounded-md font-semibold text-[11px] shadow-2xs flex items-center space-x-1"
                    >
                      <span>{n.actionLabel || 'View'}</span>
                      <ChevronRight className="h-3 w-3 text-slate-400" />
                    </button>

                    <button
                      onClick={(e) => handleDismiss(n.id, e)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Dismiss alert"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400">
            Automated monitoring • SSIS WIDA 2020 Framework &amp; Services
          </span>

          <button
            onClick={onClose}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
