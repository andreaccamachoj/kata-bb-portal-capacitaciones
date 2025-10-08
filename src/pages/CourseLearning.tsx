import { Button, Textarea, Skeleton } from '@/components/atoms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/molecules';
import { ChapterList,
    VideoPlayer,
    PdfViewer,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogContent } from '@/components/organisms';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Course, Chapter, DetailedCourseProgress, CourseBadge } from '@/types';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Award } from 'lucide-react';
import { storageUtils } from '@/utils/storage';
import { useEffect, useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { COURSE_BASE_URL, S3_BUCKET_URL } from '@/config/environment';
import { COURSE_SERVICE_GET_COURSES, TRAINING_SERVICE_GET_COURSE_PROGRESS, TRAINING_SERVICE_COMPLETE_CHAPTER, BADGES_SERVICE_GET_COURSE_BADGE, BADGES_SERVICE_ASSIGN_BADGE } from '@/config/resources';
import apiClient from '@/lib/api-client';

export default function CourseLearning() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [completedChapterIds, setCompletedChapterIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [courseBadge, setCourseBadge] = useState<CourseBadge | null>(null);

  // Fetch detalle del curso
  const { data: courses, isLoading: loadingCourse } = useFetch<Course[]>({
    resource: `${COURSE_BASE_URL}${COURSE_SERVICE_GET_COURSES}/${courseId}`,
  });
  const course = Array.isArray(courses) ? courses[0] : undefined;

  // Fetch progreso del curso
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.userId || !courseId) {
        setLoadingProgress(false);
        return;
      }

      try {
        setLoadingProgress(true);
        const { data } = await apiClient.get<DetailedCourseProgress>(
          `${COURSE_BASE_URL}${TRAINING_SERVICE_GET_COURSE_PROGRESS}/${courseId}/progress/${user.userId}`
        );
        setCompletedChapterIds(data.completedChapters.map(cc => cc.chapterId));
        console.log('completedChapterIds', completedChapterIds);
      } catch (error) {
        console.error('Error fetching course progress:', error);
        setCompletedChapterIds([]);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [user?.userId, courseId]);

  // Fetch course badge information
  useEffect(() => {
    const fetchCourseBadge = async () => {
      if (!courseId) return;

      try {
        const { data } = await apiClient.get<CourseBadge>(
          `${COURSE_BASE_URL}${BADGES_SERVICE_GET_COURSE_BADGE}/${courseId}/badge`
        );
        setCourseBadge(data);
      } catch (error) {
        console.error('Error fetching course badge:', error);
        setCourseBadge(null);
      }
    };

    fetchCourseBadge();
  }, [courseId]);

  // Set active chapter when course loads
  useEffect(() => {
    if (course && course.chapterList.length > 0 && !activeChapter) {
      // Ordenar capítulos por orderIndex y seleccionar el primero
      const sortedChapters = course.chapterList.sort((a, b) => b.orderIndex - a.orderIndex);
      const firstChapter = sortedChapters[0];
      setActiveChapter(firstChapter);
    }
  }, [course, activeChapter]);

  // Load notes for active chapter
  useEffect(() => {
    if (activeChapter && user && courseId) {
      const savedNotes = storageUtils.getChapterNotes(String(user.userId), courseId, String(activeChapter.id));
      setNotes(savedNotes);
    }
  }, [activeChapter, user, courseId]);

  const loading = loadingCourse || loadingProgress;

  // Helper function to construct the complete URL for video/PDF content
  const getContentUrl = (s3Key: string): string => {
    // If s3Key starts with http, it's already a complete URL
    if (s3Key.startsWith('http')) {
      return s3Key;
    }
    // Otherwise, construct the URL using S3_BUCKET_URL
    return `${S3_BUCKET_URL}${s3Key}`;
  };

  const assignBadgeToUser = async () => {
    if (!user || !courseId || !courseBadge) return;

    try {
      await apiClient.post(`${COURSE_BASE_URL}${BADGES_SERVICE_ASSIGN_BADGE}`, {
        userId: user.userId,
        badgeId: courseBadge.id,
        courseId: Number(courseId),
        awardedAt: new Date().toISOString()
      });
      console.log('Badge assigned successfully');
    } catch (error) {
      console.error('Error assigning badge:', error);
      // Don't show error to user since badge assignment is secondary to course completion
    }
  };

  const handleChapterComplete = async () => {
    if (!user || !courseId || !activeChapter) return;

    // Check if already completed
    if (completedChapterIds.includes(activeChapter.id)) {
      toast({
        title: 'Capítulo ya completado',
        description: 'Este capítulo ya está marcado como completado',
      });
      return;
    }

    try {
      // Save progress to backend
      await apiClient.post(`${COURSE_BASE_URL}${TRAINING_SERVICE_COMPLETE_CHAPTER}`, {
        userId: user.userId,
        courseId: Number(courseId),
        chapterId: activeChapter.id
      });

      const newCompletedIds = [...completedChapterIds, activeChapter.id];
      setCompletedChapterIds(newCompletedIds);

      // Check if all chapters completed
      if (course && newCompletedIds.length === course.chapterList.length) {
        // Assign badge to user if badge exists
        if (courseBadge) {
          await assignBadgeToUser();
        }

        // Show badge information if available
        if (courseBadge) {
          toast({
            title: '🎉 ¡Curso completado!',
            description: (
              <div className="space-y-3">
                <p>Has completado "{course.title}"</p>
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <img 
                    src={courseBadge.iconUrl} 
                    alt={courseBadge.name}
                    className="w-8 h-8"
                  />
                  <div>
                    <p className="font-semibold text-sm">¡Has ganado: {courseBadge.name}!</p>
                    <p className="text-xs text-muted-foreground">{courseBadge.description}</p>
                  </div>
                </div>
              </div>
            ),
            action: (
              <Button
                size="sm"
                onClick={() => navigate('/me/profile')}
              >
                <Award className="w-4 h-4 mr-2" />
                Ver perfil
              </Button>
            ),
          });
        } else {
          toast({
            title: '¡Curso completado!',
            description: `Has completado "${course.title}"`,
            action: (
              <Button
                size="sm"
                onClick={() => navigate('/me/profile')}
              >
                <Award className="w-4 h-4 mr-2" />
                Ver perfil
              </Button>
            ),
          });
        }
      } else {
        toast({
          title: 'Capítulo completado',
          description: 'Tu progreso ha sido guardado',
        });
      }

      // Auto-advance to next chapter
      if (course) {
        const sortedChapters = course.chapterList.sort((a, b) => a.orderIndex - b.orderIndex);
        const currentIndex = sortedChapters.findIndex(c => c.id === activeChapter.id);
        if (currentIndex < sortedChapters.length - 1) {
          setActiveChapter(sortedChapters[currentIndex + 1]);
        }
      }
    } catch (error) {
      console.error('Error completing chapter:', error);
      toast({
        title: 'Error al guardar progreso',
        description: 'No se pudo guardar tu progreso. Intenta de nuevo.',
        variant: 'destructive'
      });
    }
  };

  const handleChapterSelect = (chapterId: number) => {
    const chapter = course?.chapterList.find(c => c.id === chapterId);
    if (chapter) {
      setActiveChapter(chapter);
      // TODO: Actualizar último capítulo visitado en backend
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (user && courseId && activeChapter) {
      storageUtils.saveChapterNotes(String(user.userId), courseId, String(activeChapter.id), value);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl py-8 px-4">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Skeleton className="h-96" />
          </div>
          <div className="col-span-6">
            <Skeleton className="h-96" />
          </div>
          <div className="col-span-3">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!course || !activeChapter) {
    return null;
  }

  const isChapterCompleted = completedChapterIds.includes(activeChapter.id);

  if (!user) {
    return (
      <div className="space-y-8 p-6">
        <h1 className="text-2xl font-bold">Sesión cerrada</h1>
        <p className="text-muted-foreground">Por favor inicia sesión para continuar.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
        <div className="container max-w-7xl py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/courses/${courseId}`}>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {completedChapterIds.length} de {course.chapterList.length} capítulos completados
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={isChapterCompleted ? 'outline' : 'default'}
                  disabled={isChapterCompleted}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isChapterCompleted ? 'Completado' : 'Marcar como completado'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Marcar capítulo como completado?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esto guardará tu progreso y avanzará al siguiente capítulo si está disponible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleChapterComplete}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl py-6 px-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Chapter List */}
          <div className="col-span-12 lg:col-span-3">
            <ChapterList
              chapters={course.chapterList.sort((a, b) => b.orderIndex - a.orderIndex)}
              activeChapterId={activeChapter.id}
              completedChapterIds={completedChapterIds}
              onChapterSelect={handleChapterSelect}
            />
          </div>

          {/* Center: Content Player */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{activeChapter.title}</h2>
              </div>

              {activeChapter.contentType === 'video' ? (
                <VideoPlayer
                  url={getContentUrl(activeChapter.s3Key)}
                  onProgress={() => {
                    // You can track progress here if needed
                  }}
                  onComplete={handleChapterComplete}
                />
              ) : (
                <PdfViewer
                  url={getContentUrl(activeChapter.s3Key)}
                  totalPages={10} // Default pages since not in Chapter interface
                  onComplete={handleChapterComplete}
                />
              )}
            </div>

            {/* Footer: Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notas del capítulo</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Escribe tus notas aquí..."
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Tus notas se guardan automáticamente
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}