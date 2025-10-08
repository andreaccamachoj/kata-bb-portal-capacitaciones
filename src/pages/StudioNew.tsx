import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialUploadModal } from '@/components/MaterialUploadModal';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, ArrowLeft, GripVertical, Plus, Trash2, Eye, CheckCircle2, File, Upload, Link } from 'lucide-react';
import { Course, CourseLevel, Chapter, ContentType } from '@/types';
import { storageUtils } from '@/utils/storage';
import { toast } from 'sonner';
import modulesData from '@/mocks/modules.json';

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface ChapterForm extends Chapter {
  tempId: string;
}

export default function StudioNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  
  // Step 1: Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState('');
  const [level, setLevel] = useState<CourseLevel>('Básico');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Step 2: Chapters
  const [chapters, setChapters] = useState<ChapterForm[]>([]);
  const [draggedChapter, setDraggedChapter] = useState<number | null>(null);

  // Step 3: Chapter content
  const [chapterContents, setChapterContents] = useState<Record<string, { contentUrl: string; materialName?: string; duration?: number; pages?: number }>>({});
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

  const handleMaterialSelect = (material: any) => {
    if (currentChapterForUpload) {
      setChapterContents({
        ...chapterContents,
        [currentChapterForUpload.tempId]: {
          contentUrl: material.url,
          materialName: material.name,
          duration: currentChapterForUpload.type === 'video' ? 15 : undefined,
          pages: currentChapterForUpload.type === 'pdf' ? 20 : undefined
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
      id: `ch_temp_${Date.now()}`,
      tempId: `temp_${Date.now()}`,
      title: `Capítulo ${chapters.length + 1}`,
      type: 'video',
      contentUrl: ''
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

  const canProceedStep1 = title && description && module && level;
  const canProceedStep2 = chapters.length > 0;
  const canProceedStep3 = chapters.every(ch => chapterContents[ch.tempId]?.contentUrl);
  const canProceedStep4 = badgeName && badgeIcon;

  const handlePublish = () => {
    if (!user) return;

    const finalChapters: Chapter[] = chapters.map(ch => ({
      id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: ch.title,
      type: ch.type,
      contentUrl: chapterContents[ch.tempId].contentUrl,
      duration: chapterContents[ch.tempId].duration,
      pages: chapterContents[ch.tempId].pages
    }));

    const totalDuration = finalChapters.reduce((sum, ch) => sum + (ch.duration || 0), 0);

    const newCourse: Course = {
      id: `c_${Date.now()}`,
      title,
      description,
      module,
      level,
      duration: totalDuration,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      isExternal: false,
      tags,
      createdAt: new Date().toISOString(),
      popularity: 0,
      rating: 0,
      chapters: finalChapters,
      badge: {
        id: `b_${Date.now()}`,
        name: badgeName,
        icon: badgeIcon,
        color: badgeColor
      },
      author: {
        id: user.id,
        name: user.name
      },
      status: 'published'
    };

    toast.success('¡Curso publicado!', {
      description: `${title} está ahora disponible en el catálogo`
    });

    navigate('/catalog');
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
                          {modulesData.map(modName => (
                            <SelectItem key={modName} value={modName}>
                              {modName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="level">Nivel *</Label>
                      <Select value={level} onValueChange={(v) => setLevel(v as CourseLevel)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Básico">Básico</SelectItem>
                          <SelectItem value="Intermedio">Intermedio</SelectItem>
                          <SelectItem value="Avanzado">Avanzado</SelectItem>
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
                    <Tabs defaultValue="url" className="w-full mt-2">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url" className="gap-2">
                          <Link className="w-4 h-4" />
                          URL
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="gap-2">
                          <Upload className="w-4 h-4" />
                          Subir Imagen
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="url" className="mt-4">
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
                      </TabsContent>
                      <TabsContent value="upload" className="mt-4">
                        <FileUpload
                          acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                          maxSizeMB={5}
                          onUploadComplete={(file, url) => {
                            setCoverUrl(url);
                            toast.success('Imagen de portada subida');
                          }}
                        />
                        {coverUrl && (
                          <div className="mt-3">
                            <img 
                              src={coverUrl} 
                              alt="Preview de portada" 
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
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
                          {chapterContents[chapter.tempId]?.contentUrl ? (
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

                      {chapter.type === 'video' && chapterContents[chapter.tempId] && (
                        <div>
                          <Label>Duración (minutos)</Label>
                          <Input
                            type="number"
                            value={chapterContents[chapter.tempId]?.duration || ''}
                            onChange={(e) => setChapterContents({
                              ...chapterContents,
                              [chapter.tempId]: {
                                ...chapterContents[chapter.tempId],
                                duration: parseInt(e.target.value) || 0
                              }
                            })}
                          />
                        </div>
                      )}

                      {chapter.type === 'pdf' && chapterContents[chapter.tempId] && (
                        <div>
                          <Label>Páginas</Label>
                          <Input
                            type="number"
                            value={chapterContents[chapter.tempId]?.pages || ''}
                            onChange={(e) => setChapterContents({
                              ...chapterContents,
                              [chapter.tempId]: {
                                ...chapterContents[chapter.tempId],
                                pages: parseInt(e.target.value) || 0
                              }
                            })}
                          />
                        </div>
                      )}
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

                <div className="flex gap-2">
                  <Badge>{module}</Badge>
                  <Badge variant="outline">{level}</Badge>
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
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
        filterType={currentChapterForUpload?.type === 'video' ? 'video' : currentChapterForUpload?.type === 'pdf' ? 'pdf' : undefined}
      />
    </div>
  );
}
