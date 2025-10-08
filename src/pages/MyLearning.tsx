import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFetch } from '@/hooks/use-fetch';
import { Course, CourseProgress } from '@/types';
import { CourseCard } from '@/components/organisms/CourseCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/molecules/select';
import { Skeleton } from '@/components/atoms/skeleton';
import { COURSE_BASE_URL } from '@/config/environment';
import { COURSE_SERVICE_GET_COURSES, TRAINING_SERVICE_GET_PROGRESS } from '@/config/resources';
import apiClient from '@/lib/api-client';

export default function MyLearning() {
  const { user } = useAuth();
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');
  const [progressData, setProgressData] = useState<CourseProgress[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Fetch de cursos
  const { data: courses = [], isLoading: loadingCourses } = useFetch<Course[]>({
    resource: `${COURSE_BASE_URL}${COURSE_SERVICE_GET_COURSES}`,
  });

  // Fetch de progreso del usuario cuando el userId esté disponible
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.userId) {
        setProgressData([]);
        setLoadingProgress(false);
        return;
      }

      try {
        setLoadingProgress(true);
        const { data } = await apiClient.get<CourseProgress[]>(
          `${COURSE_BASE_URL}${TRAINING_SERVICE_GET_PROGRESS}/${user.userId}`
        );
        setProgressData(data);
      } catch (error) {
        console.error('Error fetching progress:', error);
        setProgressData([]);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [user?.userId]);

  const loading = loadingCourses || loadingProgress;

  const getCoursesWithProgress = () => {
    return progressData
      .map(prog => {
        const course = courses.find(c => c.id === prog.courseId);
        return course ? { course, progress: prog } : null;
      })
      .filter(Boolean) as { course: Course; progress: CourseProgress }[];
  };

  const filterAndSort = (items: { course: Course; progress: CourseProgress }[]) => {
    let filtered = items;

    if (moduleFilter !== 'all') {
      filtered = filtered.filter(item => item.course.moduleName === moduleFilter);
    }

    if (sortBy === 'recent') {
      filtered.sort((a, b) => {
        // Si hay fecha de completado, usar esa, sino usar fecha de creación del curso
        const dateA = a.progress.completedAt || a.course.createdAt;
        const dateB = b.progress.completedAt || b.course.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    } else {
      filtered.sort((a, b) => a.course.title.localeCompare(b.course.title));
    }

    return filtered;
  };

  const coursesWithProgress = getCoursesWithProgress();
  const inProgress = coursesWithProgress.filter(item => item.progress.progressPct >= 0 && item.progress.progressPct < 100);
  const completed = coursesWithProgress.filter(item => item.progress.progressPct === 100);

  // Obtener módulos únicos de los cursos
  const availableModules = [...new Set(courses.map(course => course.moduleName))].filter(Boolean);

  if (!user) {
    return (
      <div className="space-y-8 p-6">
        <h1 className="text-2xl font-bold">Sesión cerrada</h1>
        <p className="text-muted-foreground">Por favor inicia sesión para continuar.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mi Aprendizaje</h1>
        <p className="text-muted-foreground">Gestiona tus cursos en progreso y completados</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los módulos</SelectItem>
            {availableModules.map(module => (
              <SelectItem key={module} value={module}>{module}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'recent' | 'title')}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Más recientes</SelectItem>
            <SelectItem value="title">Título A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="in-progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="in-progress">
            En Progreso ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completados ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Histórico ({coursesWithProgress.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))}
            </div>
          ) : filterAndSort(inProgress).length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No tienes cursos en progreso</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterAndSort(inProgress).map(({ course, progress }) => (
                <CourseCard key={course.id} course={course} progress={progress} isStarted={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))}
            </div>
          ) : filterAndSort(completed).length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Aún no has completado ningún curso</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterAndSort(completed).map(({ course, progress }) => (
                <CourseCard key={course.id} course={course} progress={progress} isStarted={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))}
            </div>
          ) : filterAndSort(coursesWithProgress).length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No has iniciado ningún curso todavía</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterAndSort(coursesWithProgress).map(({ course, progress }) => (
                <CourseCard key={course.id} course={course} progress={progress} isStarted={true} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
