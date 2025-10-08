import { Course, Progress, Notification } from '@/types';
import coursesData from './courses.json';
import { storageUtils } from '@/utils/storage';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async fetchCourses(params?: {
    module?: string;
    level?: string;
    search?: string;
    sortBy?: 'recent' | 'popular' | 'rating';
  }): Promise<Course[]> {
    await delay(400);
    
    let courses = [...coursesData] as Course[];
    
    // Filter by module
    if (params?.module && params.module !== 'all') {
      courses = courses.filter(c => c.module === params.module);
    }
    
    // Filter by level
    if (params?.level && params.level !== 'all') {
      courses = courses.filter(c => c.level === params.level);
    }
    
    // Search
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      courses = courses.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort
    if (params?.sortBy === 'recent') {
      courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (params?.sortBy === 'popular') {
      courses.sort((a, b) => b.popularity - a.popularity);
    } else if (params?.sortBy === 'rating') {
      courses.sort((a, b) => b.rating - a.rating);
    }
    
    return courses.filter(c => c.status === 'published');
  },

  async fetchCourse(id: string): Promise<Course | null> {
    await delay(300);
    const course = coursesData.find(c => c.id === id);
    return course ? (course as Course) : null;
  },

  async fetchUserProgress(userId: string): Promise<Progress[]> {
    await delay(200);
    return storageUtils.getProgress(userId);
  },

  async saveProgress(progress: Progress): Promise<void> {
    await delay(200);
    storageUtils.saveProgress(progress.userId, progress);
  },

  async fetchNotifications(userId: string): Promise<Notification[]> {
    await delay(300);
    
    // Mock notifications
    const notifications: Notification[] = [
      {
        id: 'n_001',
        type: 'NEW_COURSE',
        title: 'Nuevo curso disponible',
        message: 'React Avanzado: Hooks y Patterns ya está disponible',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/courses/c_002',
      },
      {
        id: 'n_002',
        type: 'BADGE',
        title: '¡Insignia obtenida!',
        message: 'Has completado "Microservicios con API Gateway" y ganado la insignia API Builder',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/me/profile',
      },
      {
        id: 'n_003',
        type: 'REMINDER',
        title: 'Continúa tu aprendizaje',
        message: 'Llevas 2 días sin completar un curso. ¡Sigue adelante!',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ];
    
    const readIds = storageUtils.getReadNotifications(userId);
    return notifications.map(n => ({
      ...n,
      read: readIds.includes(n.id) || n.read,
    }));
  },

  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    await delay(100);
    storageUtils.markNotificationRead(userId, notificationId);
  },
};
