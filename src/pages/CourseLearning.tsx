import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/mocks/api';
import { Course, Chapter, Progress } from '@/types';
import { ChapterList } from '@/components/ChapterList';
import { VideoPlayer } from '@/components/VideoPlayer';
import { PdfViewer } from '@/components/PdfViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Award } from 'lucide-react';
import { storageUtils } from '@/utils/storage';

export default function CourseLearning() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (course && user) {
      loadProgress();
    }
  }, [course, user]);

  useEffect(() => {
    if (activeChapter && user && courseId) {
      // Load notes for active chapter
      const savedNotes = storageUtils.getChapterNotes(user.id, courseId, activeChapter.id);
      setNotes(savedNotes);
    }
  }, [activeChapter, user, courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const data = await mockApi.fetchCourse(courseId);
      if (data) {
        setCourse(data);
        // Set first chapter as active
        if (data.chapters.length > 0) {
          setActiveChapter(data.chapters[0]);
        }
      } else {
        navigate('/catalog');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el curso',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!user || !courseId) return;
    try {
      const progress = storageUtils.getCourseProgress(user.id, courseId);
      if (progress) {
        setCompletedChapterIds(progress.completedChapters);
        // Resume from last chapter if available
        if (progress.lastChapterId && course) {
          const lastChapter = course.chapters.find(c => c.id === progress.lastChapterId);
          if (lastChapter) {
            setActiveChapter(lastChapter);
          }
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
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

    const newCompletedIds = [...completedChapterIds, activeChapter.id];
    setCompletedChapterIds(newCompletedIds);

    const progress: Progress = {
      courseId,
      userId: user.id,
      completedChapters: newCompletedIds,
      lastChapterId: activeChapter.id,
      lastWatchedAt: new Date().toISOString(),
      percentage: (newCompletedIds.length / (course?.chapters.length || 1)) * 100,
    };

    await mockApi.saveProgress(progress);

    // Check if all chapters completed
    if (course && newCompletedIds.length === course.chapters.length) {
      toast({
        title: '¡Insignia obtenida!',
        description: `Has completado "${course.title}" y ganado la insignia ${course.badge.name}`,
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
        title: 'Capítulo completado',
        description: 'Tu progreso ha sido guardado',
      });
    }

    // Auto-advance to next chapter
    if (course) {
      const currentIndex = course.chapters.findIndex(c => c.id === activeChapter.id);
      if (currentIndex < course.chapters.length - 1) {
        setActiveChapter(course.chapters[currentIndex + 1]);
      }
    }
  };

  const handleChapterSelect = (chapterId: string) => {
    const chapter = course?.chapters.find(c => c.id === chapterId);
    if (chapter) {
      setActiveChapter(chapter);
      // Update last watched chapter
      if (user && courseId) {
        const progress: Progress = {
          courseId,
          userId: user.id,
          completedChapters: completedChapterIds,
          lastChapterId: chapterId,
          lastWatchedAt: new Date().toISOString(),
          percentage: (completedChapterIds.length / (course?.chapters.length || 1)) * 100,
        };
        mockApi.saveProgress(progress);
      }
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (user && courseId && activeChapter) {
      storageUtils.saveChapterNotes(user.id, courseId, activeChapter.id, value);
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
                  {completedChapterIds.length} de {course.chapters.length} capítulos completados
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
              chapters={course.chapters}
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

              {activeChapter.type === 'video' ? (
                <VideoPlayer
                  url={activeChapter.contentUrl}
                  onProgress={(percentage) => {
                    // You can track progress here if needed
                  }}
                  onComplete={handleChapterComplete}
                />
              ) : (
                <PdfViewer
                  url={activeChapter.contentUrl}
                  totalPages={activeChapter.pages || 10}
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
