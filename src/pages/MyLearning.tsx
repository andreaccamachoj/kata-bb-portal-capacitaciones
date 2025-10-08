import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Progress } from '@/types';
import { mockApi } from '@/mocks/api';
import { CourseCard } from '@/components/CourseCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import modulesData from '@/mocks/modules.json';

export default function MyLearning() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      setLoading(true);
      const [allCourses, userProgress] = await Promise.all([
        mockApi.fetchCourses({}),
        mockApi.fetchUserProgress(user.id)
      ]);
      setCourses(allCourses);
      setProgress(userProgress);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const getCoursesWithProgress = () => {
    return courses
      .map(course => {
        const prog = progress.find(p => p.courseId === course.id);
        return { course, progress: prog };
      })
      .filter(item => item.progress);
  };

  const filterAndSort = (items: { course: Course; progress?: Progress }[]) => {
    let filtered = items;

    if (moduleFilter !== 'all') {
      filtered = filtered.filter(item => item.course.module === moduleFilter);
    }

    if (sortBy === 'recent') {
      filtered.sort((a, b) => {
        const dateA = a.progress?.lastWatchedAt || '';
        const dateB = b.progress?.lastWatchedAt || '';
        return dateB.localeCompare(dateA);
      });
    } else {
      filtered.sort((a, b) => a.course.title.localeCompare(b.course.title));
    }

    return filtered;
  };

  const coursesWithProgress = getCoursesWithProgress();
  const inProgress = coursesWithProgress.filter(item => item.progress && item.progress.percentage > 0 && item.progress.percentage < 100);
  const completed = coursesWithProgress.filter(item => item.progress && item.progress.percentage === 100);

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
            {modulesData.map(module => (
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
                <CourseCard key={course.id} course={course} progress={progress} />
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
                <CourseCard key={course.id} course={course} progress={progress} />
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
                <CourseCard key={course.id} course={course} progress={progress} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
