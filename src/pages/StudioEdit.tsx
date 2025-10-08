import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/molecules/card';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { Label } from '@/components/atoms/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/molecules/select';
import { Badge } from '@/components/atoms/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/tabs';
import { GripVertical, Save, Trash2, Plus, ArchiveRestore, Eye } from 'lucide-react';
import { Course, Chapter, CourseLevel, CourseStatus } from '@/types';
import { toast } from 'sonner';
// TODO: Reemplazar con fetch real de cursos

export default function StudioEdit() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<CourseLevel>('Básico');
  const [status, setStatus] = useState<CourseStatus>('draft');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [draggedChapter, setDraggedChapter] = useState<number | null>(null);

  useEffect(() => {
    const foundCourse = coursesData.find(c => c.id === courseId) as Course | undefined;
    if (foundCourse) {
      setCourse(foundCourse);
      setTitle(foundCourse.title);
      setDescription(foundCourse.description);
      setLevel(foundCourse.level);
      setStatus(foundCourse.status);
      setChapters([...foundCourse.chapters]);
    }
  }, [courseId]);

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

  const updateChapter = (index: number, field: keyof Chapter, value: any) => {
    const updated = [...chapters];
    updated[index] = { ...updated[index], [field]: value };
    setChapters(updated);
  };

  const deleteChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
    toast.success('Capítulo eliminado');
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `ch_new_${Date.now()}`,
      title: `Nuevo Capítulo ${chapters.length + 1}`,
      type: 'video',
      contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: 10
    };
    setChapters([...chapters, newChapter]);
    toast.success('Capítulo agregado');
  };

  const handleSave = () => {
    toast.success('Cambios guardados', {
      description: 'El curso ha sido actualizado correctamente'
    });
  };

  const handleChangeStatus = (newStatus: CourseStatus) => {
    setStatus(newStatus);
    toast.success('Estado actualizado', {
      description: `El curso ahora está en estado: ${newStatus}`
    });
  };

  if (!course) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Cargando curso...</p>
      </div>
    );
  }

  const getStatusColor = (status: CourseStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Editar Curso</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basics">Información Básica</TabsTrigger>
          <TabsTrigger value="chapters">Capítulos</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="level">Nivel</Label>
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

              <div>
                <Label>Etiquetas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {course.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chapters">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Capítulos ({chapters.length})</CardTitle>
                <Button size="sm" onClick={addChapter}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Capítulo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="flex items-start gap-3 p-4 border rounded-lg bg-card cursor-move hover:bg-accent transition-colors"
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
                    <span className="font-semibold text-muted-foreground mt-2">{index + 1}</span>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label className="text-xs">Título</Label>
                        <Input
                          value={chapter.title}
                          onChange={(e) => updateChapter(index, 'title', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Tipo</Label>
                          <Select
                            value={chapter.type}
                            onValueChange={(v) => updateChapter(index, 'type', v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {chapter.type === 'video' && (
                          <div>
                            <Label className="text-xs">Duración (min)</Label>
                            <Input
                              type="number"
                              value={chapter.duration || 0}
                              onChange={(e) => updateChapter(index, 'duration', parseInt(e.target.value))}
                            />
                          </div>
                        )}

                        {chapter.type === 'pdf' && (
                          <div>
                            <Label className="text-xs">Páginas</Label>
                            <Input
                              type="number"
                              value={chapter.pages || 0}
                              onChange={(e) => updateChapter(index, 'pages', parseInt(e.target.value))}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs">URL del Contenido</Label>
                        <Input
                          value={chapter.contentUrl}
                          onChange={(e) => updateChapter(index, 'contentUrl', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteChapter(index)}
                      className="text-destructive hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="status">Estado del Curso</Label>
                <div className="flex gap-2 mt-2">
                  <Badge className={getStatusColor(status)}>{status}</Badge>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant={status === 'published' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChangeStatus('published')}
                  >
                    Publicar
                  </Button>
                  <Button
                    variant={status === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChangeStatus('draft')}
                  >
                    Borrador
                  </Button>
                  <Button
                    variant={status === 'archived' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChangeStatus('archived')}
                  >
                    <ArchiveRestore className="w-4 h-4 mr-2" />
                    Archivar
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-2">Estadísticas</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Popularidad</p>
                    <p className="text-2xl font-bold">{course.popularity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Calificación</p>
                    <p className="text-2xl font-bold">{course.rating} ⭐</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capítulos</p>
                    <p className="text-2xl font-bold">{chapters.length}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-2">Insignia</h3>
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-accent">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: course.badge.color + '20' }}
                  >
                    {course.badge.icon}
                  </div>
                  <div>
                    <p className="font-medium">{course.badge.name}</p>
                    <p className="text-xs text-muted-foreground">Se otorga al completar el curso</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
