import { Progress, Material } from '@/types';

const STORAGE_KEYS = {
  PROGRESS: 'course_progress',
  INTERESTS: 'user_interests',
  NOTIFICATIONS_READ: 'notifications_read',
  PREFERENCES: 'user_preferences',
  MATERIALS: 'uploaded_materials',
};

export const storageUtils = {
  // Progress
  getProgress: (userId: string): Progress[] => {
    const data = localStorage.getItem(`${STORAGE_KEYS.PROGRESS}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveProgress: (userId: string, progress: Progress) => {
    const allProgress = storageUtils.getProgress(userId);
    const existingIndex = allProgress.findIndex(p => p.courseId === progress.courseId);
    
    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress;
    } else {
      allProgress.push(progress);
    }
    
    localStorage.setItem(`${STORAGE_KEYS.PROGRESS}_${userId}`, JSON.stringify(allProgress));
  },

  getCourseProgress: (userId: string, courseId: string): Progress | null => {
    const allProgress = storageUtils.getProgress(userId);
    return allProgress.find(p => p.courseId === courseId) || null;
  },

  // Interests
  getInterests: (userId: string): string[] => {
    const data = localStorage.getItem(`${STORAGE_KEYS.INTERESTS}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveInterests: (userId: string, interests: string[]) => {
    localStorage.setItem(`${STORAGE_KEYS.INTERESTS}_${userId}`, JSON.stringify(interests));
  },

  // Notifications
  getReadNotifications: (userId: string): string[] => {
    const data = localStorage.getItem(`${STORAGE_KEYS.NOTIFICATIONS_READ}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  markNotificationRead: (userId: string, notificationId: string) => {
    const read = storageUtils.getReadNotifications(userId);
    if (!read.includes(notificationId)) {
      read.push(notificationId);
      localStorage.setItem(`${STORAGE_KEYS.NOTIFICATIONS_READ}_${userId}`, JSON.stringify(read));
    }
  },

  // Preferences
  getPreferences: (userId: string) => {
    const data = localStorage.getItem(`${STORAGE_KEYS.PREFERENCES}_${userId}`);
    return data ? JSON.parse(data) : {
      notificationsEnabled: true,
      highContrast: false,
      fontSize: 'medium',
    };
  },

  savePreferences: (userId: string, preferences: any) => {
    localStorage.setItem(`${STORAGE_KEYS.PREFERENCES}_${userId}`, JSON.stringify(preferences));
  },

  // Chapter Notes
  getChapterNotes: (userId: string, courseId: string, chapterId: string): string => {
    const key = `chapter_notes_${userId}_${courseId}_${chapterId}`;
    return localStorage.getItem(key) || '';
  },

  saveChapterNotes: (userId: string, courseId: string, chapterId: string, notes: string) => {
    const key = `chapter_notes_${userId}_${courseId}_${chapterId}`;
    localStorage.setItem(key, notes);
  },

  // Materials
  getMaterials: (userId: string): Material[] => {
    const data = localStorage.getItem(`${STORAGE_KEYS.MATERIALS}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveMaterial: (userId: string, material: Material): void => {
    const materials = storageUtils.getMaterials(userId);
    materials.push(material);
    localStorage.setItem(`${STORAGE_KEYS.MATERIALS}_${userId}`, JSON.stringify(materials));
  },

  deleteMaterial: (userId: string, materialId: string): void => {
    const materials = storageUtils.getMaterials(userId);
    const filtered = materials.filter(m => m.id !== materialId);
    localStorage.setItem(`${STORAGE_KEYS.MATERIALS}_${userId}`, JSON.stringify(filtered));
  },
};
