/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Input, Textarea, Label, Badge, Progress, toast } from '@/components/atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/molecules';
import { MaterialUploadModal } from '@/components/organisms';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { ArrowRight, ArrowLeft, GripVertical, Plus, Trash2, CheckCircle2, File } from 'lucide-react';
import { ContentType, Material } from '@/types';
import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { COURSE_BASE_URL } from '@/config/environment';
import { COURSE_SERVICE_CREATE_COURSE, MODULE_SERVICE_GET_MODULES } from '@/config/resources';
import { createCourse, CreateCourseDto } from '@/services/course.service';

export default function StudioNew() {
  // Fetch módulos
  const { data: modules = [], isLoading: loadingModules } = useFetch<Array<{ id: number; key: string; name: string; description: string }>>({
    resource: `${COURSE_BASE_URL}${MODULE_SERVICE_GET_MODULES}`,
  });

type WizardStep = 1 | 2 | 3 | 4 | 5;

type ChapterForm = {
  tempId: string;
  title: string;
  type: ContentType;
};

  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  
  // Step 1: Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Step 2: Chapters
  const [chapters, setChapters] = useState<ChapterForm[]>([]);
  const [draggedChapter, setDraggedChapter] = useState<number | null>(null);

  // Step 3: Chapter content
  const [chapterContents, setChapterContents] = useState<Record<string, { file?: File; materialName?: string; fileName?: string; contentType?: string }>>({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [currentChapterForUpload, setCurrentChapterForUpload] = useState<ChapterForm | null>(null);

  // Step 4: Badge
  const [badgeName, setBadgeName] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('🏅');
  const [badgeColor, setBadgeColor] = useState('#6C47FF');

  const openUploadModal = (chapter: ChapterForm) => {
    setCurrentChapterForUpload(chapter);
    setUploadModalOpen(true);
  };

  // Ahora acepta un segundo argumento opcional: el File real
  const handleMaterialSelect = (material: Material, file?: File) => {
    if (currentChapterForUpload) {
      setChapterContents({
        ...chapterContents,
        [currentChapterForUpload.tempId]: {
          materialName: material.name,
          fileName: material.name,
          contentType: material.type === 'video' ? 'video/mp4' : material.type === 'pdf' ? 'application/pdf' : '',
          ...(file ? { file } : {})
        }
      });
    }
    setCurrentChapterForUpload(null);
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addChapter = () => {
    const newChapter: ChapterForm = {
      tempId: `temp_${Date.now()}`,
      title: `Capítulo ${chapters.length + 1}`,
      type: 'video',
    };
    setChapters([...chapters, newChapter]);
  };

  const removeChapter = (tempId: string) => {
    setChapters(chapters.filter(c => c.tempId !== tempId));
  };

  const updateChapter = (tempId: string, field: keyof ChapterForm, value: any) => {
    setChapters(chapters.map(c => 
      c.tempId === tempId ? { ...c, [field]: value } : c
    ));
  };

  const handleDragStart = (index: number) => {
    setDraggedChapter(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedChapter === null || draggedChapter === index) return;

    const newChapters = [...chapters];
    const draggedItem = newChapters[draggedChapter];
    newChapters.splice(draggedChapter, 1);
    newChapters.splice(index, 0, draggedItem);
    
    setChapters(newChapters);
    setDraggedChapter(index);
  };

  const handleDragEnd = () => {
    setDraggedChapter(null);
  };

  const canProceedStep1 = title && description && module;
  const canProceedStep2 = chapters.length > 0;
  const canProceedStep3 = chapters.every(ch => chapterContents[ch.tempId]?.fileName);
  const canProceedStep4 = badgeName && badgeIcon;

  const handlePublish = async () => {
    if (!user) return;
    try {
      // Buscar moduleId real desde módulos obtenidos
      const selectedModule = modules.find((m) => m.name === module);
      const moduleId = selectedModule ? selectedModule.id : undefined;
      if (!moduleId) throw new Error('Selecciona un módulo válido');

      // Construir el objeto de curso como en el ejemplo
      const courseDto: CreateCourseDto = {
        moduleId,
        title,
        description,
        tags: tags.join(','),
        published: true,
        chapters: chapters.map((ch, idx) => {
          const content = chapterContents[ch.tempId];
          return {
            title: ch.title,
            orderIndex: idx + 1,
            fileName: content?.fileName || '',
            contentType: content?.contentType || '',
          };
        })
      };

      // Preparar archivos para enviar
      const files = chapters.map((ch) => chapterContents[ch.tempId]?.file).filter(Boolean) as File[];
      // Log para depuración: muestra los archivos que se van a enviar
      console.log('Archivos a enviar:', files);
      chapters.forEach((ch, idx) => {
        console.log(`Capítulo ${idx + 1}:`, chapterContents[ch.tempId]);
      });
      if (files.length === 0) {
        toast.error('Debes adjuntar al menos un archivo para los capítulos.');
        return;
      }
      await createCourse(courseDto, files);
      toast.success('¡Curso publicado!', {
        description: `${title} está ahora disponible en el catálogo`
      });
      navigate('/catalog');
    } catch (err: any) {
      toast.error('Error al publicar el curso', { description: err.message });
    }
  };

  const stepProgress = (currentStep / 5) * 100;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crear Nuevo Curso</h1>
        <p className="text-muted-foreground">Paso {currentStep} de 5</p>
        <Progress value={stepProgress} className="mt-4" />
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-4">Información Básica</CardTitle>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título del Curso *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: React Avanzado: Hooks y Patterns"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe de qué trata el curso..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="module">Módulo *</Label>
                      <Select value={module} onValueChange={setModule}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un módulo" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingModules ? (
                            <div className="px-4 py-2 text-muted-foreground text-sm">Cargando...</div>
                          ) : (
                            modules
                              .filter((mod) => !!mod.name && mod.name !== "")
                              .map((mod) => (
                                <SelectItem key={mod.id} value={mod.name}>
                                  {mod.name}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Etiquetas</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Agregar etiqueta"
                      />
                      <Button type="button" onClick={addTag}>Agregar</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="ml-2">×</button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Portada del Curso (opcional)</Label>
                        <Input
                          id="cover"
                          value={coverUrl}
                          onChange={(e) => setCoverUrl(e.target.value)}
                          placeholder="https://..."
                        />
                        {coverUrl && (
                          <div className="mt-3">
                            <img 
                              src={coverUrl} 
                              alt="Preview" 
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Chapters */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <CardTitle>Capítulos del Curso</CardTitle>
                <Button onClick={addChapter} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Capítulo
                </Button>
              </div>

              <div className="space-y-2">
                {chapters.map((chapter, index) => (
                  <div
                    key={chapter.tempId}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-3 p-4 border rounded-lg bg-card cursor-move hover:bg-accent transition-colors"
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="font-semibold text-muted-foreground">{index + 1}</span>
                    
                    <Input
                      value={chapter.title}
                      onChange={(e) => updateChapter(chapter.tempId, 'title', e.target.value)}
                      placeholder="Título del capítulo"
                      className="flex-1"
                    />

                    <Select
                      value={chapter.type}
                      onValueChange={(v) => updateChapter(chapter.tempId, 'type', v as ContentType)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChapter(chapter.tempId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {chapters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay capítulos. Agrega al menos uno para continuar.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Chapter Content */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <CardTitle>Contenido de Capítulos</CardTitle>
              
              <div className="space-y-4">
                {chapters.map((chapter, index) => (
                  <Card key={chapter.tempId}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {index + 1}. {chapter.title}
                      </CardTitle>
                      <CardDescription>Tipo: {chapter.type === 'video' ? 'Video' : 'PDF'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Material del Capítulo</Label>
                        <div className="flex gap-2">
                          {chapterContents[chapter.tempId]?.fileName ? (
                            <div className="flex-1 flex items-center gap-2 p-3 border rounded-lg bg-accent">
                              <File className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm flex-1 truncate">
                                {chapterContents[chapter.tempId]?.materialName || 'Material seleccionado'}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openUploadModal(chapter)}
                              >
                                Cambiar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => openUploadModal(chapter)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Seleccionar Material
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Badge */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <CardTitle>Insignia del Curso</CardTitle>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="badgeName">Nombre de la Insignia *</Label>
                  <Input
                    id="badgeName"
                    value={badgeName}
                    onChange={(e) => setBadgeName(e.target.value)}
                    placeholder="Ej: React Master"
                  />
                </div>

                <div>
                  <Label htmlFor="badgeIcon">Icono (emoji) *</Label>
                  <Input
                    id="badgeIcon"
                    value={badgeIcon}
                    onChange={(e) => setBadgeIcon(e.target.value)}
                    placeholder="🏅"
                    maxLength={2}
                  />
                </div>

                <div>
                  <Label htmlFor="badgeColor">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="badgeColor"
                      type="color"
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      placeholder="#6C47FF"
                    />
                  </div>
                </div>

                <div className="mt-6 p-6 border rounded-lg bg-accent">
                  <p className="text-sm text-muted-foreground mb-4">Vista Previa:</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                      style={{ backgroundColor: badgeColor + '20' }}
                    >
                      {badgeIcon}
                    </div>
                    <div>
                      <p className="font-semibold">{badgeName || 'Nombre de la Insignia'}</p>
                      <p className="text-sm text-muted-foreground">Se otorga al completar el curso</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Preview & Publish */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <CardTitle>Revisar y Publicar</CardTitle>
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-accent">
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Capítulos ({chapters.length}):</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {chapters.map((ch, i) => (
                      <li key={ch.tempId}>
                        {i + 1}. {ch.title} ({ch.type})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: badgeColor + '20' }}
                  >
                    {badgeIcon}
                  </div>
                  <div>
                    <p className="font-medium">{badgeName}</p>
                    <p className="text-xs text-muted-foreground">Insignia del curso</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Al publicar, el curso estará disponible inmediatamente en el catálogo.
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1) as WizardStep)}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1) as WizardStep)}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3) ||
                  (currentStep === 4 && !canProceedStep4)
                }
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handlePublish}>
                Publicar Curso
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <MaterialUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSelectMaterial={handleMaterialSelect}
        filterType={currentChapterForUpload?.type}
      />
    </div>
  );
}
