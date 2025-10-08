import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Progress } from '@/types';
import { mockApi } from '@/mocks/api';
import { CourseCard } from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter } from 'lucide-react';
import modulesData from '@/mocks/modules.json';

export default function Catalog() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<Progress[]>([]);
  
  const searchQuery = searchParams.get('q') || '';
  const moduleFilter = searchParams.get('module') || 'all';
  const levelFilter = searchParams.get('level') || 'all';
  const sortBy = (searchParams.get('sort') as 'recent' | 'popular' | 'rating') || 'recent';

  useEffect(() => {
    loadCourses();
  }, [searchQuery, moduleFilter, levelFilter, sortBy, user]);

  const loadCourses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [coursesData, progress] = await Promise.all([
        mockApi.fetchCourses({
          module: moduleFilter !== 'all' ? moduleFilter : undefined,
          level: levelFilter !== 'all' ? levelFilter : undefined,
          search: searchQuery || undefined,
          sortBy,
        }),
        mockApi.fetchUserProgress(user.id),
      ]);
      
      setCourses(coursesData);
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading catalog:', error);
    } finally {
      setLoading(false);
    }
  };

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
              {modulesData.map(module => (
                <SelectItem key={module} value={module}>{module}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={(v) => updateFilter('level', v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              <SelectItem value="Básico">Básico</SelectItem>
              <SelectItem value="Intermedio">Intermedio</SelectItem>
              <SelectItem value="Avanzado">Avanzado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => updateFilter('sort', v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="popular">Más populares</SelectItem>
              <SelectItem value="rating">Mejor valorados</SelectItem>
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
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No se encontraron cursos</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {courses.length} curso{courses.length !== 1 ? 's' : ''} encontrado{courses.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const progress = userProgress.find(p => p.courseId === course.id);
              return (
                <CourseCard key={course.id} course={course} progress={progress} />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
