import { useState, useEffect } from 'react';
import { Course, CourseStatus } from '@/types';
import { mockApi } from '@/mocks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, BookOpen, Eye, Archive, Copy } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setIsLoading(true);
    const allCourses = await mockApi.fetchCourses();
    // Include all courses (published, draft, archived)
    setCourses(allCourses);
    setIsLoading(false);
  };

  const handleStatusChange = (courseId: string, newStatus: CourseStatus) => {
    setCourses(prev => prev.map(c => 
      c.id === courseId ? { ...c, status: newStatus } : c
    ));
    
    const statusText = {
      published: 'publicado',
      draft: 'marcado como borrador',
      archived: 'archivado'
    };
    toast.success(`Curso ${statusText[newStatus]}`);
  };

  const handleDuplicate = (course: Course) => {
    const newCourse: Course = {
      ...course,
      id: `${course.id}_copy_${Date.now()}`,
      title: `${course.title} (Copia)`,
      status: 'draft'
    };
    setCourses(prev => [newCourse, ...prev]);
    toast.success('Curso duplicado correctamente');
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                         c.module.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: CourseStatus) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
          <p className="text-muted-foreground">Administra todos los cursos del sistema</p>
        </div>
        <BookOpen className="w-8 h-8 text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Cursos</CardTitle>
          <CardDescription>Total: {courses.length} cursos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
                <SelectItem value="archived">Archivados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Cargando cursos...
                    </TableCell>
                  </TableRow>
                ) : filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No se encontraron cursos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{course.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {course.level} • {course.duration} min
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{course.module}</TableCell>
                      <TableCell>{course.author.name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(course.status)}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/courses/${course.id}`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Select
                            value={course.status}
                            onValueChange={(value) => handleStatusChange(course.id, value as CourseStatus)}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="published">Publicar</SelectItem>
                              <SelectItem value="draft">Borrador</SelectItem>
                              <SelectItem value="archived">Archivar</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(course)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
