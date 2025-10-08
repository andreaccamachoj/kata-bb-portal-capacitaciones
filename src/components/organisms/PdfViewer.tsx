import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/molecules/card';
import { Button } from '@/components/atoms/button';
import { Progress } from '@/components/atoms/progress';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  totalPages: number;
  onComplete: () => void;
}

export function PdfViewer({ url, totalPages, onComplete }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      // Check if reached the end
      if (nextPage === totalPages && !hasReachedEnd) {
        setHasReachedEnd(true);
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleMarkComplete = () => {
    setHasReachedEnd(true);
    onComplete();
  };

  const progressPercentage = (currentPage / totalPages) * 100;

  return (
    <Card className="overflow-hidden">
      {/* PDF Viewer */}
      <div className="relative bg-muted aspect-[3/4]">
        <iframe
          src={`${url}#page=${currentPage}`}
          className="w-full h-full"
          title="PDF Viewer"
        />
      </div>

      {/* Controls */}
      <CardFooter className="flex flex-col gap-4 p-6">
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Página {currentPage} de {totalPages}</span>
            <span>{Math.round(progressPercentage)}% completado</span>
          </div>
          <Progress value={progressPercentage} />
        </div>

        <div className="flex items-center justify-between w-full gap-4">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>

          {hasReachedEnd ? (
            <Button variant="default" className="flex-1" disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              Llegaste al final
            </Button>
          ) : currentPage === totalPages ? (
            <Button
              variant="default"
              className="flex-1"
              onClick={handleMarkComplete}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Llegué al final
            </Button>
          ) : null}

          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
