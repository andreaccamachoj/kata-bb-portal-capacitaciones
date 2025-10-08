/* eslint-disable @typescript-eslint/no-explicit-any */
import { COURSE_BASE_URL } from '@/config/environment';
import { COURSE_SERVICE_CREATE_COURSE } from '@/config/resources';
import apiClient from '@/lib/api-client';

export interface CreateCourseChapter {
  title: string;
  orderIndex: number;
  fileName: string;
  contentType: string;
}

export interface CreateCourseDto {
  moduleId: number;
  title: string;
  description: string;
  tags: string;
  published: boolean;
  coverUrl: string;
  chapters: CreateCourseChapter[];
}

export async function createCourse(
  course: CreateCourseDto,
  files: File[]
): Promise<any> {
  const formData = new FormData();
  // Adjunta el JSON con tipo application/json
  const courseBlob = new Blob([JSON.stringify(course)], { type: 'application/json' });
  formData.append('course', courseBlob);
  files.forEach((file) => {
    formData.append('files', file, file.name);
  });
const { data } = await apiClient.post(`${COURSE_BASE_URL}${COURSE_SERVICE_CREATE_COURSE}`, formData);
  return data;
}
