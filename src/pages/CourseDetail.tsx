import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Progress } from '@/types';
import { mockApi } from '@/mocks/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Star, TrendingUp, PlayCircle, FileText, Award, User } from 'lucide-react';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    loadCourse();
  }, [courseId, user]);

  const loadCourse = async () => {
    if (!courseId || !user) return;

    try {
      setLoading(true);
      const [courseData, userProgress] = await Promise.all([
        mockApi.fetchCourse(courseId),
        mockApi.fetchUserProgress(user.id),
      ]);

      setCourse(courseData);
      const courseProgress = userProgress.find(p => p.courseId === courseId);
      setProgress(courseProgress || null);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  const progressPercent = progress?.percentage || 0;
  const hasStarted = progressPercent > 0;
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
              <Badge className="bg-primary">{course.level}</Badge>
              <Badge variant="secondary">{course.module}</Badge>
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
                {course.chapters.map((chapter, index) => {
                  const isCompleted = progress?.completedChapters.includes(chapter.id);
                  return (
                    <AccordionItem key={chapter.id} value={chapter.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          {chapter.type === 'video' ? (
                            <PlayCircle className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          <span>{index + 1}. {chapter.title}</span>
                          {isCompleted && (
                            <Badge variant="outline" className="ml-2">✓</Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-7 text-sm text-muted-foreground">
                          {chapter.type === 'video' && (
                            <p>Video · {chapter.duration} minutos</p>
                          )}
                          {chapter.type === 'pdf' && (
                            <p>PDF · {chapter.pages} páginas</p>
                          )}
                        </div>
                      </AccordionContent>
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
                </div>
              )}

              {isCompleted && (
                <div className="bg-success/10 text-success p-4 rounded-lg text-center">
                  <Award className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">¡Curso completado!</p>
                </div>
              )}

              <Link to={`/courses/${course.id}/learn`} className="block">
                <Button className="w-full" size="lg">
                  {hasStarted ? 'Continuar' : 'Iniciar Curso'}
                </Button>
              </Link>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{course.duration} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span>{course.rating} · Valoración</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span>{course.popularity}% popularidad</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{course.author.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Insignia a obtener</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: course.badge.color + '20' }}
                >
                  {course.badge.icon}
                </div>
                <div>
                  <p className="font-semibold">{course.badge.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {isCompleted ? '¡Obtenida!' : 'Completa el curso para obtenerla'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {course.tags.map(tag => (
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
