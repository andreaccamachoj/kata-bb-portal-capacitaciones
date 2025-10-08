import { Course, Progress } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Clock, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  course: Course;
  progress?: Progress | null;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  const progressPercent = progress?.percentage || 0;
  const hasProgress = progressPercent > 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link to={`/courses/${course.id}`}>
        <div className="relative overflow-hidden h-40">
          <img 
            src={course.coverUrl} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary text-primary-foreground">
              {course.level}
            </Badge>
          </div>
          {course.isExternal && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary">Externo</Badge>
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="space-y-2">
        <Link to={`/courses/${course.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
        </Link>
        <Badge variant="outline" className="w-fit">
          {course.module}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span>{course.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{course.popularity}%</span>
          </div>
        </div>

        {hasProgress && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium text-primary">{progressPercent}%</span>
            </div>
            <ProgressBar value={progressPercent} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link to={`/courses/${course.id}`} className="w-full">
          <Button className="w-full" variant={hasProgress ? "default" : "outline"}>
            {hasProgress ? 'Continuar' : 'Ver Curso'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
