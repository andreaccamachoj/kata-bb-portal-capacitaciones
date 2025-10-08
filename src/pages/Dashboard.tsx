import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Progress } from '@/types';
import { mockApi } from '@/mocks/api';
import { CourseCard } from '@/components/CourseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, TrendingUp, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState<{ course: Course; progress: Progress } | null>(null);
  const [recommended, setRecommended] = useState<Course[]>([]);
  const [recent, setRecent] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<Progress[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const [courses, progress] = await Promise.all([
        mockApi.fetchCourses(),
        mockApi.fetchUserProgress(user.id),
      ]);

      setUserProgress(progress);

      // Find last watched course
      if (progress.length > 0) {
        const lastProgress = progress.sort((a, b) => 
          new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()
        )[0];
        
        const course = courses.find(c => c.id === lastProgress.courseId);
        if (course && lastProgress.percentage < 100) {
          setContinueWatching({ course, progress: lastProgress });
        }
      }

      // Get recent courses
      setRecent(courses.slice(0, 6));

      // Simple recommendation: courses in user's interests
      const interests = user.interests || [];
      const recommendedCourses = interests.length > 0
        ? courses.filter(c => interests.includes(c.module)).slice(0, 6)
        : courses.slice(0, 6);
      setRecommended(recommendedCourses);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido, {user?.name}! 👋</h1>
        <p className="text-muted-foreground">Continúa tu camino de aprendizaje</p>
      </div>

      {continueWatching && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">Continuar donde quedaste</h2>
          </div>
          <div className="max-w-md">
            <CourseCard 
              course={continueWatching.course} 
              progress={continueWatching.progress} 
            />
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-semibold">Recomendados para ti</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map(course => {
              const progress = userProgress.find(p => p.courseId === course.id);
              return (
                <CourseCard key={course.id} course={course} progress={progress} />
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-success" />
          <h2 className="text-2xl font-semibold">Novedades</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recent.map(course => {
            const progress = userProgress.find(p => p.courseId === course.id);
            return (
              <CourseCard key={course.id} course={course} progress={progress} />
            );
          })}
        </div>
      </section>
    </div>
  );
}
