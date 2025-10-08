import { useParams, Link, useNavigate } from 'react-router-dom';
import { Course, DetailedCourseProgress } from '@/types';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/molecules/card';
import { Accordion, AccordionItem, AccordionTrigger } from '@/components/organisms/accordion';
import { Progress as ProgressBar } from '@/components/atoms/progress';
import { Skeleton } from '@/components/atoms/skeleton';
import { PlayCircle, FileText, Award } from 'lucide-react';
import { useFetch } from '@/hooks/use-fetch';
import { useAuth } from '@/hooks/use-auth';
import { COURSE_BASE_URL } from '@/config/environment';
import { COURSE_SERVICE_GET_COURSES, TRAINING_SERVICE_GET_COURSE_PROGRESS, TRAINING_SERVICE_ASSIGN_COURSE } from '@/config/resources';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<DetailedCourseProgress | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Fetch detalle del curso
  const { data: courses, isLoading } = useFetch<Course[]>({
    resource: `${COURSE_BASE_URL}${COURSE_SERVICE_GET_COURSES}/${courseId}`,
  });
  const course = Array.isArray(courses) ? courses[0] : undefined;

  // Fetch progreso del curso
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.userId || !courseId) {
        setProgress(null);
        setLoadingProgress(false);
        return;
      }

      try {
        setLoadingProgress(true);
        const { data } = await apiClient.get<DetailedCourseProgress>(
          `${COURSE_BASE_URL}${TRAINING_SERVICE_GET_COURSE_PROGRESS}/${courseId}/progress/${user.userId}`
        );
        setProgress(data);
      } catch (error) {
        console.error('Error fetching course progress:', error);
        setProgress(null);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [user?.userId, courseId]);

  const handleEnrollCourse = async () => {
    if (!user?.userId || !courseId || hasStarted) return;

    try {
      setEnrolling(true);
      await apiClient.post(`${COURSE_BASE_URL}${TRAINING_SERVICE_ASSIGN_COURSE}`, {
        userId: user.userId,
        courseId: Number(courseId)
      });

      toast({
        title: 'Curso asignado exitosamente',
        description: `Te has inscrito al curso "${course?.title}"`,
      });

      // Refresh progress after enrollment
      const { data } = await apiClient.get<DetailedCourseProgress>(
        `${COURSE_BASE_URL}${TRAINING_SERVICE_GET_COURSE_PROGRESS}/${courseId}/progress/${user.userId}`
      );
      setProgress(data);

      // Redirect to course learning page
      navigate(`/courses/${courseId}/learn`);

    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: 'Error al inscribirse',
        description: 'No se pudo completar la inscripción. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading || loadingProgress) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-muted-foreground">Curso no encontrado</p>
      </div>
    );
  }

  // Ajuste: tags es string, moduleName es string, chapterList es el array de capítulos
  const tags = (course.tags || '').split(',').map(t => t.trim()).filter(Boolean);  
  const chapters = course.chapterList;
  const progressPercent = Math.round(progress?.progressPct || 0);
  
  // Un curso está iniciado si el usuario tiene progreso registrado (incluso si es 0%)
  const hasStarted = progress !== null; // Si progress existe, el usuario está inscrito
  const isCompleted = progressPercent === 100;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-lg overflow-hidden h-64">
        <img 
          src={course.coverUrl} 
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="p-6 text-white">
            <div className="flex gap-2 mb-2">
              {/* No hay course.level en el DTO, puedes quitarlo o ajustarlo si lo agregas */}
              {/* <Badge className="bg-primary">{course.level}</Badge> */}
              <Badge variant="secondary">{course.moduleName}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{course.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contenido del Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {chapters.map((chapter, index) => {
                  const isCompleted = progress?.completedChapters.some(cc => cc.chapterId === chapter.id) || false;
                  return (
                    <AccordionItem key={chapter.id} value={String(chapter.id)}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          {chapter.contentType === 'video' ? (
                            <PlayCircle className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          <span>{index + 1}. {chapter.title}</span>
                          {isCompleted && (
                            <Badge variant="outline" className="ml-2 bg-green-100 text-green-700">✓</Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {hasStarted && !isCompleted && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tu progreso</span>
                    <span className="font-medium text-primary">{progressPercent}%</span>
                  </div>
                  <ProgressBar value={progressPercent} className="h-2" />
                  {progressPercent === 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      ¡Estás inscrito! Comienza el primer capítulo
                    </p>
                  )}
                </div>
              )}

              {isCompleted && (
                <div className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 p-4 rounded-lg text-center">
                  <Award className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">¡Curso completado!</p>
                  {progress?.completedAt && (
                    <p className="text-sm mt-1">Completado el {new Date(progress.completedAt).toLocaleDateString()}</p>
                  )}
                </div>
              )}

              {hasStarted ? (
                <Link to={`/courses/${course.id}/learn`} className="block">
                  <Button className="w-full" size="lg">
                    {progressPercent === 0 ? 'Comenzar' : 'Continuar'}
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleEnrollCourse}
                  disabled={enrolling}
                >
                  {enrolling ? 'Inscribiendo...' : 'Iniciar Curso'}
                </Button>
              )}

              {/* Puedes agregar aquí más detalles del curso si están en el DTO */}
            </CardContent>
          </Card>

          {/* Insignia y tags solo si existen en el DTO */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-base">Insignia a obtener</CardTitle>
            </CardHeader>
            <CardContent>
              ...
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
