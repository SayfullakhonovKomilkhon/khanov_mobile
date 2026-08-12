export type Gender = 'MALE' | 'FEMALE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type LessonType = 'REGULAR' | 'PRACTICE' | 'TEST' | 'CONTROL' | 'HOMEWORK' | 'EXAM';

export type TeacherSummary = { fullName: string; phone?: string };
export type ScheduleSlot = { days?: string[]; time?: string; duration?: number };
export type GroupSchedule =
  | { days?: { day: string; startTime: string; endTime: string }[]; slots?: ScheduleSlot[] }
  | ScheduleSlot[]
  | null;

export interface StudentProfile {
  id: string;
  fullName: string;
  phone?: string;
  birthDate?: string;
  gender: Gender;
  enrolledAt: string;
  monthlyFee: number;
  group: {
    id: string;
    name: string;
    schedule: GroupSchedule;
    teacher: TeacherSummary;
  } | null;
  totalLessons: number;
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
}

export interface StudentProgress {
  student: { id: string; fullName: string; gender: Gender };
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  title: string;
  titleEmoji: string;
  streak: number;
  bestStreak: number;
  stats: {
    totalLessons: number;
    present: number;
    late: number;
    absent: number;
    attendancePercent: number;
  };
}

export interface Homework {
  id: string;
  text: string;
  imageUrls: string[];
  youtubeUrl?: string;
  dueDate?: string;
  createdAt: string;
  group?: { id: string; name: string };
  teacher?: { id: string; fullName: string };
}

export interface GradeRecord {
  id: string;
  date: string;
  lessonType: LessonType;
  score: number;
  maxScore: number;
  scorePercent: number;
  comment?: string;
  groupName: string;
}

export interface RatingEntry {
  place: number;
  studentId: string;
  fullName: string;
  totalPoints: number;
  totalMax: number;
  averageScore: number;
  totalWorks: number;
  attendancePercent: number;
}

export interface MyRating {
  myPlace: number;
  totalStudents: number;
  myAverageScore: number;
  myTotalPoints: number;
  myTotalMax: number;
  isVisible: boolean;
  rating: RatingEntry[];
}

export interface Payment {
  id: string;
  amount: number;
  status: 'CONFIRMED' | 'PENDING' | 'REJECTED' | 'PAID' | 'UNPAID';
  receiptUrl?: string;
  nextPaymentDate?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
  createdAt: string;
}

export interface PaymentSummary {
  currentMonth: {
    status: 'PAID' | 'UNPAID' | 'PENDING';
    amount: number;
    nextPaymentDate: string | null;
    daysUntilPayment: number | null;
  };
  history: Payment[];
}

export interface ScheduleData {
  groupName?: string;
  schedule?: GroupSchedule;
  teacher?: TeacherSummary;
  nextTopic?: { date: string; topic: string } | null;
}

export interface AchievementMedal {
  month: number;
  year?: number;
  unlocked?: boolean;
  place?: 1 | 2 | 3 | null;
  unlockedAt?: string;
  createdAt?: string;
}

export interface SpecialAchievement {
  key: string;
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface AchievementsPayload {
  student?: { id: string; fullName: string; groupName: string | null; gender?: Gender };
  monthGrid?: AchievementMedal[];
  specialAchievements?: SpecialAchievement[];
  stats?: { goldCount: number; silverCount: number; bronzeCount: number; totalAchievements: number };
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  authorName: string;
  group: { id: string; name: string } | null;
  isPinned: boolean;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface AnnouncementsResponse {
  data: Announcement[];
  meta: { total: number; page: number; limit: number; totalPages: number; unreadCount?: number };
}

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown> | null;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  groupId: string;
  lessonType: LessonType;
  status: AttendanceStatus;
  editReason?: string;
}

export interface ParentChild {
  id: string;
  fullName: string;
  gender: Gender;
  enrolledAt: string;
  isActive?: boolean;
  monthlyFee?: number;
  group: { id: string; name: string; schedule: GroupSchedule; teacher: TeacherSummary } | null;
}

export interface ParentProfile {
  id: string;
  fullName: string;
  phone?: string;
  children: ParentChild[];
}
