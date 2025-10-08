import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { FileUpload } from '@/components/templates/FileUpload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/organisms/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/tabs';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { Material, MaterialType } from '@/types';
import { storageUtils } from '@/utils/storage';
import { File, Check } from 'lucide-react';
import { toast } from 'sonner';

interface MaterialUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMaterial: (material: Material, file?: File) => void;
  filterType?: MaterialType;
}

export function MaterialUploadModal({
  open,
  onOpenChange,
  onSelectMaterial,
  filterType
}: MaterialUploadModalProps) {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>(
    user ? storageUtils.getMaterials(user.email) : []
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  const getMaterialType = (fileName: string): MaterialType => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'video';
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'document';
    }
  };

  const handleUploadComplete = (file: File, url: string) => {
    if (!user) return;

    const newMaterial: Material = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: getMaterialType(file.name),
      size: file.size,
      url,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.email
    };

    storageUtils.saveMaterial(user.email, newMaterial);
    setMaterials(prev => [...prev, newMaterial]);
    setSelectedMaterialId(newMaterial.id); // Selecciona automáticamente el nuevo material
    onSelectMaterial(newMaterial, file);   // PASA TAMBIÉN EL FILE REAL
    onOpenChange(false);                   // Cierra el modal automáticamente
    toast.success('Material subido correctamente', {
      description: `${file.name} está listo para usar`
    });
  };

  const handleSelect = () => {
    const material = materials.find(m => m.id === selectedMaterialId);
    if (material) {
      onSelectMaterial(material); // Solo material, sin file
      onOpenChange(false);
      toast.success('Material seleccionado');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeColor = (type: MaterialType): string => {
    switch (type) {
      case 'video': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'pdf': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'image': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const filteredMaterials = filterType
    ? materials.filter(m => m.type === filterType)
    : materials;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Seleccionar Material</DialogTitle>
          <DialogDescription>
            Sube un nuevo archivo o selecciona uno existente
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">
              Mis Materiales ({filteredMaterials.length})
            </TabsTrigger>
            <TabsTrigger value="upload">Subir Nuevo</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay materiales disponibles</p>
                  <p className="text-sm mt-1">Sube archivos en la pestaña "Subir Nuevo"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMaterials.map(material => (
                    <button
                      key={material.id}
                      onClick={() => setSelectedMaterialId(material.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        selectedMaterialId === material.id
                          ? 'border-primary bg-accent'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-sm truncate">{material.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getTypeColor(material.type)}>
                            {material.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(material.size)}
                          </span>
                        </div>
                      </div>
                      {selectedMaterialId === material.id && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSelect}
                disabled={!selectedMaterialId}
              >
                Seleccionar Material
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="min-h-[400px]">
              <FileUpload 
                onUploadComplete={handleUploadComplete}
                acceptedTypes={
                  filterType === 'video' ? ['.mp4', '.avi', '.mov'] :
                  filterType === 'pdf' ? ['.pdf'] :
                  ['.mp4', '.pdf', '.doc', '.docx', '.jpg', '.png']
                }
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
