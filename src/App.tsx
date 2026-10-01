/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StudentProfileView } from './components/StudentProfileView';
import { AssessmentEntryModal } from './components/AssessmentEntryModal';
import { AddStudentModal } from './components/AddStudentModal';
import { WidaScoreModal } from './components/WidaScoreModal';
import { QuarterlySupportModal } from './components/QuarterlySupportModal';
import { WidaMatrixView } from './components/WidaMatrixView';
import { PrintReportsModal } from './components/PrintReportsModal';
import { GoogleSheetsExportModal } from './components/GoogleSheetsExportModal';
import { DataImportModal } from './components/DataImportModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import {
  Student,
  AssessmentLetter,
  ProficiencyAssessment,
  WidaScore,
  QuarterlySupport
} from './types/eal';
import {
  subscribeToStudents,
  subscribeToAllAssessments,
  subscribeToAllWidaScores,
  subscribeToAllQuarterlySupports,
  seedDemoDataIfEmpty
} from './firebase/services';
import { computeEalNotifications } from './utils/notificationEngine';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<'roster' | 'assessment-entry' | 'reports'>('roster');
  const [students, setStudents] = useState<Student[]>([]);
  const [allAssessments, setAllAssessments] = useState<ProficiencyAssessment[]>([]);
  const [allWidaScores, setAllWidaScores] = useState<WidaScore[]>([]);
  const [allQuarterlySupports, setAllQuarterlySupports] = useState<QuarterlySupport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentDefaultLetter, setAssessmentDefaultLetter] = useState<AssessmentLetter>('A');
  const [assessmentTargetStudent, setAssessmentTargetStudent] = useState<Student | undefined>(undefined);

  const [isWidaModalOpen, setIsWidaModalOpen] = useState(false);
  const [widaTargetStudent, setWidaTargetStudent] = useState<Student | null>(null);

  const [isQuarterlyModalOpen, setIsQuarterlyModalOpen] = useState(false);
  const [quarterlyTargetStudent, setQuarterlyTargetStudent] = useState<Student | null>(null);

  // Reporting, Export & Import Modals
  const [isPrintReportsOpen, setIsPrintReportsOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isDataImportOpen, setIsDataImportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Subscriptions from Firestore
  useEffect(() => {
    const unsubStudents = subscribeToStudents((fetchedStudents) => {
      setStudents(fetchedStudents);
      setLoading(false);

      if (selectedStudent) {
        const updated = fetchedStudents.find((s) => s.studentId === selectedStudent.studentId);
        if (updated) setSelectedStudent(updated);
      }
    });

    const unsubAssessments = subscribeToAllAssessments((list) => {
      setAllAssessments(list);
    });

    const unsubWida = subscribeToAllWidaScores((scores) => {
      setAllWidaScores(scores);
    });

    const unsubSupports = subscribeToAllQuarterlySupports((supports) => {
      setAllQuarterlySupports(supports);
    });

    return () => {
      unsubStudents();
      unsubAssessments();
      unsubWida();
      unsubSupports();
    };
  }, [selectedStudent]);

  // Initial seed check on mount
  useEffect(() => {
    seedDemoDataIfEmpty().then((seeded) => {
      if (seeded) {
        showToast('Initialized international elementary school EAL student dataset!');
      }
    });
  }, []);

  // Compute notifications dynamically
  const notifications = useMemo(() => {
    return computeEalNotifications(students, allAssessments, allWidaScores);
  }, [students, allAssessments, allWidaScores]);

  const handleManualSeed = async () => {
    setLoading(true);
    const success = await seedDemoDataIfEmpty();
    setLoading(false);
    if (success) {
      showToast('Successfully populated SSIS multilingual learner profiles!');
    } else {
      showToast('Database already contains student records.');
    }
  };

  const handleOpenAssessmentModal = (student?: Student, defaultLetter?: AssessmentLetter) => {
    setAssessmentTargetStudent(student || selectedStudent || students[0]);
    if (defaultLetter) setAssessmentDefaultLetter(defaultLetter);
    setIsAssessmentModalOpen(true);
  };

  const handleOpenWidaModal = (student: Student) => {
    setWidaTargetStudent(student);
    setIsWidaModalOpen(true);
  };

  const handleOpenQuarterlyModal = (student: Student) => {
    setQuarterlyTargetStudent(student);
    setIsQuarterlyModalOpen(true);
  };

  const handleOpenAddStudent = () => {
    setStudentToEdit(null);
    setIsAddStudentOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsAddStudentOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0635aa] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-fade-in border border-[#fec707]/60">
          <CheckCircle2 className="h-4 w-4 text-[#fec707]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedStudent(null);
          setCurrentTab(tab);
        }}
        onOpenAddStudent={handleOpenAddStudent}
        onOpenAssessmentEntry={() => handleOpenAssessmentModal(selectedStudent || undefined)}
        notificationCount={notifications.length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenReports={() => setIsPrintReportsOpen(true)}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        onOpenDataImport={() => setIsDataImportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {selectedStudent ? (
          <StudentProfileView
            student={selectedStudent}
            onBack={() => setSelectedStudent(null)}
            onOpenAssessmentEntry={(student, defaultLetter) =>
              handleOpenAssessmentModal(student, defaultLetter)
            }
            onOpenWidaScoreModal={handleOpenWidaModal}
            onOpenQuarterlySupportModal={handleOpenQuarterlyModal}
            onEditStudent={handleOpenEditStudent}
          />
        ) : currentTab === 'roster' ? (
          <DashboardView
            students={students}
            onSelectStudent={(student) => setSelectedStudent(student)}
            onOpenAddStudent={handleOpenAddStudent}
            onOpenAssessmentForStudent={(student) => handleOpenAssessmentModal(student)}
            onSeedData={handleManualSeed}
            loading={loading}
            onOpenReports={() => setIsPrintReportsOpen(true)}
            onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
            onOpenDataImport={() => setIsDataImportOpen(true)}
            notifications={notifications}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />
        ) : (
          <WidaMatrixView
            students={students}
            onSelectStudent={(student) => setSelectedStudent(student)}
          />
        )}
      </main>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        studentToEdit={studentToEdit}
        onClose={() => setIsAddStudentOpen(false)}
        onSuccess={() => {
          showToast(
            studentToEdit ? 'Student profile updated!' : 'New student enrolled successfully!'
          );
        }}
      />

      <AssessmentEntryModal
        students={students}
        preSelectedStudent={assessmentTargetStudent}
        defaultLetter={assessmentDefaultLetter}
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        onSuccess={() => {
          showToast(`Proficiency Assessment ${assessmentDefaultLetter} logged with evidence!`);
        }}
      />

      {widaTargetStudent && (
        <WidaScoreModal
          student={widaTargetStudent}
          isOpen={isWidaModalOpen}
          onClose={() => setIsWidaModalOpen(false)}
          onSuccess={() => {
            showToast('WIDA score history updated!');
          }}
        />
      )}

      {quarterlyTargetStudent && (
        <QuarterlySupportModal
          student={quarterlyTargetStudent}
          isOpen={isQuarterlyModalOpen}
          onClose={() => setIsQuarterlyModalOpen(false)}
          onSuccess={() => {
            showToast('Quarterly support record updated!');
          }}
        />
      )}

      {/* 1. Print Reports & Transition Handoff Modal */}
      <PrintReportsModal
        students={students}
        assessments={allAssessments}
        widaScores={allWidaScores}
        quarterlySupports={allQuarterlySupports}
        initialStudent={selectedStudent}
        isOpen={isPrintReportsOpen}
        onClose={() => setIsPrintReportsOpen(false)}
      />

      {/* 2. Google Sheets Export Modal */}
      <GoogleSheetsExportModal
        students={students}
        assessments={allAssessments}
        widaScores={allWidaScores}
        quarterlySupports={allQuarterlySupports}
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
      />

      {/* 3. CSV Bulk Data Import Modal */}
      <DataImportModal
        existingStudents={students}
        isOpen={isDataImportOpen}
        onClose={() => setIsDataImportOpen(false)}
        onSuccess={() => {
          showToast('Student roster imported successfully from CSV!');
        }}
      />

      {/* 4. Notification Center Modal */}
      <NotificationCenterModal
        notifications={notifications}
        students={students}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectStudent={(st) => setSelectedStudent(st)}
        onOpenAssessmentForStudent={(st, letter) => handleOpenAssessmentModal(st, letter)}
      />

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#8cacd3]/30 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-[#0635aa]">Saigon South International School</span> • Elementary EAL &amp; MTSS Multilingual Learner Hub
          </div>
          <div className="text-[11px] text-slate-500">
            Aligned with WIDA 2020 Standards Framework &amp; Elementary MTSS Multi-Tiered System of Supports
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
