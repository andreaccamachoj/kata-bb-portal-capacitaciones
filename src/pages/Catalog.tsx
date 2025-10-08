import { Input, Skeleton } from '@/components/atoms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/molecules';
import { CourseCard } from '@/components/organisms';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Course, CourseProgress } from '@/types';
import { Search, Filter } from 'lucide-react';
import { useFetch } from '@/hooks/use-fetch';
import { useEffect, useState } from 'react';
import { COURSE_BASE_URL } from '@/config/environment';
import { COURSE_SERVICE_GET_COURSES, MODULE_SERVICE_GET_MODULES, TRAINING_SERVICE_GET_PROGRESS } from '@/config/resources';
import apiClient from '@/lib/api-client';

export default function Catalog() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loadingProgress, setLoadingProgress] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<CourseProgress[]>([]);
  
  const searchQuery = searchParams.get('q') || '';
  const moduleFilter = searchParams.get('module') || 'all';
  const levelFilter = searchParams.get('level') || 'all';
  const sortBy = (searchParams.get('sort') as 'recent' | 'popular' | 'rating') || 'recent';

  // Fetch módulos
  const { data: modules = [], isLoading: loadingModules } = useFetch<Array<{ id: number; key: string; name: string; description: string }>>({
    resource: `${COURSE_BASE_URL}${MODULE_SERVICE_GET_MODULES}`,
  });

  // Fetch cursos
  const { data: courses = [], isLoading: loadingCourses } = useFetch<Course[]>({
    resource: `${COURSE_BASE_URL}${COURSE_SERVICE_GET_COURSES}`,
    params: {
      module: moduleFilter !== 'all' ? moduleFilter : undefined,
      level: levelFilter !== 'all' ? levelFilter : undefined,
      search: searchQuery || undefined,
      sortBy,
    },
  });

  useEffect(() => {
    const fetchUserProgressAndFilterCourses = async () => {
      if (!user?.userId || courses.length === 0) {
        setAvailableCourses(courses);
        return;
      }

      try {
        setLoadingProgress(true);
        // Fetch user progress
        const { data: userProgress } = await apiClient.get<CourseProgress[]>(
          `${COURSE_BASE_URL}${TRAINING_SERVICE_GET_PROGRESS}/${user.userId}`
        );
        
        // Store user progress for use in rendering
        setUserProgress(userProgress);

        // Filter out courses that user has completed (100%)
        const completedCourseIds = userProgress
          .filter(progress => progress.progressPct === 100)
          .map(progress => progress.courseId);
        
        const availableCoursesForUser = courses.filter(course => 
          !completedCourseIds.includes(course.id)
        );

        setAvailableCourses(availableCoursesForUser);
      } catch (error) {
        console.error('Error fetching user progress:', error);
        // Fallback to showing all courses if there's an error
        setAvailableCourses(courses);
        setUserProgress([]);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchUserProgressAndFilterCourses();
  }, [user, courses]);

  const loading = loadingCourses || loadingModules || loadingProgress;

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Catálogo de Cursos</h1>
        <p className="text-muted-foreground">Explora todos los cursos disponibles</p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => updateFilter('q', e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          <Select value={moduleFilter} onValueChange={(v) => updateFilter('module', v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los módulos</SelectItem>
              {modules.map(module => (
                <SelectItem key={module.id} value={module.id.toString()}>{module.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : availableCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No se encontraron cursos disponibles</p>
          {user && (
            <p className="text-sm text-muted-foreground mt-2">
              ¡Has completado todos los cursos disponibles! 🎉
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {availableCourses.length} curso{availableCourses.length !== 1 ? 's' : ''} disponible{availableCourses.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses
              .filter(course => moduleFilter === 'all' || course.moduleId === Number(moduleFilter))
              .filter(course => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.trim().toLowerCase();
                return (
                  course.title.toLowerCase().includes(q) ||
                  (course.tags && course.tags.toLowerCase().includes(q)) ||
                  (course.moduleName && course.moduleName.toLowerCase().includes(q)) ||
                  (course.description && course.description.toLowerCase().includes(q))
                );
              })
              .map(course => {
                // Find progress for this course
                const courseProgress = userProgress.find(p => p.courseId === course.id);
                const isStarted = courseProgress && courseProgress.progressPct > 0;
                
                return (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    progress={courseProgress} 
                    isStarted={isStarted}
                  />
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
