import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Course, CourseProgress } from '@/types';
import { Skeleton } from '@/components/atoms';
import { CourseCard } from '@/components/organisms';
import { useFetch } from '@/hooks/use-fetch';
import { COURSE_BASE_URL } from '@/config/environment';
import { COURSE_SERVICE_GET_COURSES, TRAINING_SERVICE_GET_PROGRESS } from '@/config/resources';
import { TrendingUp, GraduationCap } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState<{ course: Course; progress: CourseProgress } | null>(null);
  const [latestCourses, setLatestCourses] = useState<Course[]>([]);
  
  const { data: courses = [] } = useFetch<Course[]>({
    resource: `${COURSE_BASE_URL}${COURSE_SERVICE_GET_COURSES}`,
  });
console.log('Fetched Courses:', courses);
  useEffect(() => {
    loadDashboardData();
  }, [user, courses]);

  const loadDashboardData = async () => {
    if (!user || courses.length === 0) return;

    try {
      setLoading(true);
      
      // Fetch user progress
      const { data: userProgress } = await apiClient.get<CourseProgress[]>(
        `${COURSE_BASE_URL}${TRAINING_SERVICE_GET_PROGRESS}/${user.userId}`
      );

      // Find the course with the most recent progress (not completed)
      const inProgressCourses = userProgress.filter(progress => 
        progress.progressPct > 0 && progress.progressPct < 100
      );

      if (inProgressCourses.length > 0) {
        // Sort by most recent activity (you might need to add lastActivityAt field)
        // For now, we'll use the course with highest progress
        const mostRecentProgress = inProgressCourses.sort((a, b) => 
          b.progressPct - a.progressPct
        )[0];

        const courseForContinue = courses.find(course => 
          course.id === mostRecentProgress.courseId
        );

        if (courseForContinue) {
          setContinueWatching({
            course: courseForContinue,
            progress: mostRecentProgress
          });
        }
      }

      // Get courses not started by user (latest 5)
      const startedCourseIds = userProgress.map(progress => progress.courseId);
      console.log('Started Course IDs:', startedCourseIds);
      const notStartedCourses = courses
        .filter(course => !startedCourseIds.includes(course.id))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);
console.log('Not Started Courses:', notStartedCourses);
      setLatestCourses(notStartedCourses);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setContinueWatching(null);
      setLatestCourses(courses.slice(0, 5)); // Fallback to first 5 courses
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

  if (!user) {
    return (
      <div className="space-y-8 p-6">
        <h1 className="text-2xl font-bold">Sesión cerrada</h1>
        <p className="text-muted-foreground">Por favor inicia sesión para continuar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido, {user.userName}! 👋</h1>
        <p className="text-muted-foreground">Continúa tu camino de aprendizaje</p>
      </div>

      {/* {continueWatching && (
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
      )} */}

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
              isStarted={true}
            />
          </div>
        </section>
      )}


      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-success" />
          <h2 className="text-2xl font-semibold">Novedades</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestCourses.map(course => {
            return (
              <CourseCard key={course.id} course={course} progress={undefined} />
            );
          })}
        </div>
      </section>
    </div>
  );
}