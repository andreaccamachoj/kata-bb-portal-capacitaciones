export type CourseLevel = 'Básico' | 'Intermedio' | 'Avanzado';

export type ContentType = 'video' | 'pdf';

export type CourseStatus = 'published' | 'draft' | 'archived';

export type MaterialType = 'video' | 'pdf' | 'document' | 'image';

export interface Badge {
  id: number;
  userId: number;
  badgeId: number;
  badgeName: string;
  badgeDescription: string;
  badgeIconUrl: string;
  assignedAt: string;
}

export interface CourseBadge {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  criterion: string;
  courseId: number | null;
}

export interface Chapter {
  id: number;
  courseId: number;
  title: string;
  orderIndex: number;
  fileName: string | null;
  s3Key: string;
  contentType: string;
}

export interface Course {
  id: number;
  moduleId: number;
  moduleName: string;
  title: string;
  description: string;
  tags: string;
  published: boolean;
  createdAt: string;
  coverUrl: string;
  chapterList: Chapter[];
}
export interface Progress {
  courseId: string;
  userId: string;
  completedChapters: string[];
  lastChapterId?: string;
  lastWatchedAt: string;
  percentage: number;
}

// Nueva interfaz para el progreso de la API de training
export interface CourseProgress {
  courseId: number;
  courseTitle: string;
  progressPct: number;
  completedAt: string | null;
}

// Interfaz para el progreso detallado con capítulos completados
export interface DetailedCourseProgress {
  courseId: number;
  courseTitle: string;
  progressPct: number;
  completedAt: string | null;
  completedChapters: CompletedChapter[];
}

export interface CompletedChapter {
  chapterId: number;
  chapterTitle: string;
}


export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  size: number; // bytes
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

