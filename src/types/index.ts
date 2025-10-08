export type UserRole = 'LEARNER' | 'INSTRUCTOR' | 'ADMIN';

export type CourseLevel = 'Básico' | 'Intermedio' | 'Avanzado';

export type ContentType = 'video' | 'pdf';

export type CourseStatus = 'published' | 'draft' | 'archived';

export type NotificationType = 'NEW_COURSE' | 'BADGE' | 'REMINDER' | 'SYSTEM';

export type MaterialType = 'video' | 'pdf' | 'document' | 'image';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  interests?: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earnedAt?: string;
  courseId?: string;
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
  title: string;
  description: string;
  tags: string;
  published: boolean;
  createdAt: string;
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

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
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
