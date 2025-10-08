import { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { MaterialType } from '@/types';

interface FileUploadProps {
  onUploadComplete: (file: File, url: string) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

export function FileUpload({ 
  onUploadComplete, 
  acceptedTypes = ['.mp4', '.pdf', '.doc', '.docx', '.jpg', '.png'],
  maxSizeMB = 100 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return `El archivo excede el tamaño máximo de ${maxSizeMB}MB`;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `Tipo de archivo no permitido. Formatos aceptados: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const simulateUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const fileIndex = uploadingFiles.length;
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate URL creation
          const mockUrl = URL.createObjectURL(file);
          resolve(mockUrl);
        }

        setUploadingFiles(prev => 
          prev.map((f, i) => 
            i === fileIndex ? { ...f, progress: Math.min(progress, 100) } : f
          )
        );
      }, 300);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    const newUploadingFiles: UploadingFile[] = filesArray.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const error = validateFile(file);
      const uploadIndex = uploadingFiles.length + i;

      if (error) {
        setUploadingFiles(prev =>
          prev.map((f, idx) =>
            idx === uploadIndex ? { ...f, status: 'error' as const, error } : f
          )
        );
        continue;
      }

      try {
        const url = await simulateUpload(file);
        setUploadingFiles(prev =>
          prev.map((f, idx) =>
            idx === uploadIndex ? { ...f, status: 'complete' as const, progress: 100 } : f
          )
        );
        onUploadComplete(file, url);
      } catch (err) {
        setUploadingFiles(prev =>
          prev.map((f, idx) =>
            idx === uploadIndex 
              ? { ...f, status: 'error' as const, error: 'Error al subir el archivo' } 
              : f
          )
        );
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-sm text-muted-foreground">
          Formatos: {acceptedTypes.join(', ')} • Máximo {maxSizeMB}MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <File className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm truncate">
                      {uploadingFile.file.name}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(uploadingFile.file.size)}
                      </span>
                      {uploadingFile.status === 'complete' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {uploadingFile.status === 'uploading' && (
                    <div className="space-y-1">
                      <Progress value={uploadingFile.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(uploadingFile.progress)}% completado
                      </p>
                    </div>
                  )}
                  
                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-destructive">{uploadingFile.error}</p>
                  )}
                  
                  {uploadingFile.status === 'complete' && (
                    <p className="text-xs text-green-600">Subida completa</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
