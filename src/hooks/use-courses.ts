import { useQueryWithAuth } from './use-query-with-auth';
import { useMutationWithAuth } from './use-mutation-with-auth';

interface Course {
  id: string;
  title: string;
  description: string;
  // ... otros campos
}

interface CreateCourseData {
  title: string;
  description: string;
  // ... otros campos necesarios para crear un curso
}

export function useGetCourses() {
  return useQueryWithAuth<Course[]>({
    url: '/courses',
    queryKey: ['courses'],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useGetCourse(courseId: string) {
  return useQueryWithAuth<Course>({
    url: `/courses/${courseId}`,
    queryKey: ['course', courseId],
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  return useMutationWithAuth<Course, CreateCourseData>({
    url: '/courses',
    method: 'POST',
    invalidateQueries: ['courses'],
    onSuccess: (data) => {
      // Puedes agregar lógica adicional aquí
      console.log('Curso creado:', data);
    },
  });
}

export function useUpdateCourse(courseId: string) {
  return useMutationWithAuth<Course, Partial<Course>>({
    url: `/courses/${courseId}`,
    method: 'PUT',
    invalidateQueries: ['courses', `course-${courseId}`],
  });
}

export function useDeleteCourse(courseId: string) {
  return useMutationWithAuth<void, void>({
    url: `/courses/${courseId}`,
    method: 'DELETE',
    invalidateQueries: ['courses'],
  });
}