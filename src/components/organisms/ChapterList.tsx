import { Chapter, Progress } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/molecules/card';
import { Badge } from '@/components/atoms/badge';
import { Check, PlayCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChapterListProps {
  chapters: Chapter[];
  activeChapterId: number;
  completedChapterIds: number[];
  onChapterSelect: (chapterId: number) => void;
}

export function ChapterList({
  chapters,
  activeChapterId,
  completedChapterIds,
  onChapterSelect,
}: ChapterListProps) {
  console.log('ChapterList - completedChapterIds:', completedChapterIds);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Contenido del Curso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === activeChapterId;
          const isCompleted = completedChapterIds.includes(chapter.id);
          const Icon = chapter.contentType === 'video' ? PlayCircle : FileText;

          return (
            <button
              key={chapter.id}
              onClick={() => onChapterSelect(chapter.id)}
              className={cn(
                'w-full text-left p-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                'hover:bg-accent/50 hover:shadow-sm',
                isActive && 'bg-primary/5 border-l-4 border-primary shadow-sm',
                !isActive && 'border-l-4 border-transparent'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <h4
                      className={cn(
                        'font-medium text-sm truncate transition-colors',
                        isActive && 'text-primary',
                        !isActive && 'text-foreground group-hover:text-primary'
                      )}
                    >
                      {chapter.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {chapter.contentType === 'video' ? 'Video' : 'PDF'}
                    </Badge>
                  </div>
                </div>
                {isCompleted && !isActive && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Check className="w-4 h-4 text-primary/40" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}