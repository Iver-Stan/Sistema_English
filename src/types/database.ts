export type UserRole = 'student' | 'admin';

export type ActivityKey = 'practica' | 'teoria' | 'produccion' | 'valoracion';

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface ActivityProgress {
  id: string;
  user_id: string;
  unit_id: string;
  activity_key: ActivityKey;
  completed: boolean;
  completed_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  unit_id: string;
  attempt_number: number;
  correct_answers: number;
  total_questions: number;
  score: number;
  duration_seconds: number;
  created_at: string;
}

export interface UnitReflection {
  id: string;
  user_id: string;
  unit_id: string;
  answer_1: string;
  answer_2: string;
  created_at: string;
  updated_at: string;
}

export interface WallPost {
  id: string;
  user_id: string;
  unit_id: string;
  author_name: string;
  description: string;
  image_url: string;
  image_path: string;
  created_at: string;
  updated_at: string;
}

export interface YoutubeLink {
  title: string;
  description: string;
  url: string;
}

export interface UnitSettings {
  unit_id: string;
  practice_wordwall_url: string;
  practice_url: string;
  theory_pdf_url: string | null;
  youtube_links: YoutubeLink[];
  updated_at: string;
}

export interface StudentSummary {
  profile: Profile;
  progress: Record<ActivityKey, boolean>;
  completedCount: number;
  attemptsCount: number;
  bestScore: number | null;
  bestAttemptSeconds: number | null;
  lastAttemptSeconds: number | null;
  attempts: QuizAttempt[];
  reflection: UnitReflection | null;
}
