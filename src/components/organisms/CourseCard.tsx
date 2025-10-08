import { Course, Progress, CourseProgress } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/molecules/card';
import { Badge } from '@/components/atoms/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/atoms/button';
import { Progress as ProgressBar } from '@/components/atoms/progress';

interface CourseCardProps {
  course: Course;
  progress?: Progress | CourseProgress | null;
  isStarted?: boolean;
}

export function CourseCard({ course, progress, isStarted = false }: CourseCardProps) {
  // Determinar el porcentaje basado en el tipo de progreso
  const progressPercent = progress ? 
    ('percentage' in progress ? progress.percentage : progress.progressPct) : 0;
  const hasProgress = progressPercent >= 0 && isStarted;
  const isCompleted = progressPercent === 100;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link to={`/courses/${course.id}`}>
        <div className="relative overflow-hidden h-40">
          <img 
            src={course.coverUrl} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <CardHeader className="space-y-2">
        <Link to={`/courses/${course.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
        </Link>
        <Badge variant="outline" className="w-fit">
          {course.moduleName}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
        {hasProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <ProgressBar value={progressPercent} className="h-2" />
            {isCompleted && (
              <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Completado
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link to={`/courses/${course.id}`} className="w-full">
          <Button className="w-full" variant={hasProgress ? "default" : "outline"}>
            {isCompleted ? 'Revisar' : hasProgress ? 'Continuar' : 'Ver Curso'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
