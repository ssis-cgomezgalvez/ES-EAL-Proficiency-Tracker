import {
  Student,
  WidaScore,
  ProficiencyAssessment,
  EalNotification,
  ASSESSMENT_WINDOWS,
  normalizeMtssTier
} from '../types/eal';

export function computeEalNotifications(
  students: Student[],
  assessments: ProficiencyAssessment[] = [],
  widaScores: WidaScore[] = []
): EalNotification[] {
  const notifications: EalNotification[] = [];
  const now = new Date();

  // 1. ASSESSMENT WINDOW REMINDERS
  ASSESSMENT_WINDOWS.forEach((win) => {
    const end = new Date(win.endDate);
    const start = new Date(win.startDate);

    // If currently within or near the window (e.g. within 30 days)
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 60) {
      notifications.push({
        id: `win-${win.id}`,
        type: 'window_reminder',
        priority: diffDays <= 14 ? 'high' : 'medium',
        title: `${win.name} Active (${win.period})`,
        message: `${win.description} Target: ${win.targetAssessments}. Window concludes in ${diffDays} days (${win.endDate}).`,
        dueDate: win.endDate,
        daysRemaining: diffDays,
        actionLabel: 'Review Roster Benchmarks',
        createdAt: now.toISOString()
      });
    }
  });

  // 2. CHECK ASSESSMENT DUE DATES FOR INDIVIDUAL STUDENTS
  students.forEach((student) => {
    const studentAssessments = assessments.filter((a) => a.studentId === student.studentId);
    const studentTier = normalizeMtssTier(student.currentSupportLevel);

    // If student has no assessments at all
    if (studentAssessments.length === 0) {
      notifications.push({
        id: `due-no-assess-${student.studentId}`,
        type: 'due_check',
        priority: studentTier === 'Tier 3' ? 'high' : 'medium',
        title: `Baseline Assessment Needed: ${student.firstName} ${student.lastName}`,
        message: `${student.preferredName || student.firstName} (Grade ${student.gradeLevel}, ${studentTier}) has no formative assessments logged yet this academic year.`,
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        actionLabel: 'Log Assessment',
        createdAt: now.toISOString()
      });
      return;
    }

    // Sort by date descending
    const sorted = [...studentAssessments].sort(
      (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    );
    const latest = sorted[0];
    const latestDate = new Date(latest.assessmentDate);
    const daysSinceLast = Math.floor((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    // Thresholds: Tier 3 = 45 days, Tier 2 = 60 days, Tier 1 = 90 days
    const thresholdDays = studentTier === 'Tier 3' ? 45 : studentTier === 'Tier 2' ? 60 : 90;

    if (daysSinceLast > thresholdDays) {
      notifications.push({
        id: `due-check-${student.studentId}`,
        type: 'due_check',
        priority: studentTier === 'Tier 3' ? 'high' : 'medium',
        title: `Proficiency Check Due: ${student.firstName} ${student.lastName}`,
        message: `Last assessment was logged ${daysSinceLast} days ago (${latest.assessmentDate}). ${studentTier} progress monitoring recommended every ${thresholdDays} days.`,
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        actionLabel: 'Log Assessment',
        createdAt: now.toISOString()
      });
    }

    // 3. UNEXPECTED PATTERNS & GROWTH FLAGS
    // Check WIDA score differences
    const studentScores = widaScores
      .filter((s) => s.studentId === student.studentId)
      .sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime());

    if (studentScores.length >= 2) {
      const prev = studentScores[studentScores.length - 2];
      const curr = studentScores[studentScores.length - 1];

      // Score drop flag
      if (curr.overallComposite < prev.overallComposite - 0.3) {
        notifications.push({
          id: `flag-drop-${student.studentId}`,
          type: 'growth_flag',
          priority: 'high',
          title: `Composite Drop Flag: ${student.firstName} ${student.lastName}`,
          message: `Composite dropped from ${prev.overallComposite.toFixed(1)} to ${curr.overallComposite.toFixed(1)} between ${prev.assessmentDate} and ${curr.assessmentDate}. Review MTSS tier & instructional scaffolds.`,
          studentId: student.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          actionLabel: 'View Profile',
          createdAt: now.toISOString()
        });
      }

      // Large modality discrepancy (e.g. Speaking vs Writing difference >= 2.0)
      const modalityGap = Math.abs(curr.speakingScore - curr.writingScore);
      if (modalityGap >= 2.0) {
        notifications.push({
          id: `flag-gap-${student.studentId}`,
          type: 'growth_flag',
          priority: 'medium',
          title: `Modality Discrepancy Flag: ${student.firstName} ${student.lastName}`,
          message: `Significant gap between Speaking (${curr.speakingScore.toFixed(1)}) and Writing (${curr.writingScore.toFixed(1)}). Targeted expressive writing scaffolds advised.`,
          studentId: student.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          actionLabel: 'View Profile',
          createdAt: now.toISOString()
        });
      }
    }

    // Readiness to transition from Tier 2 to Tier 1
    if (studentTier === 'Tier 2' && student.overallWIDALevel >= 4.8) {
      notifications.push({
        id: `flag-transition-${student.studentId}`,
        type: 'growth_flag',
        priority: 'low',
        title: `Tier Transition Candidate: ${student.firstName} ${student.lastName}`,
        message: `${student.firstName} has attained WIDA Level ${student.overallWIDALevel.toFixed(1)}. Candidate for transition from Tier 2 Targeted Services to Tier 1 Monitored.`,
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        actionLabel: 'Review Support',
        createdAt: now.toISOString()
      });
    }
  });

  return notifications;
}
