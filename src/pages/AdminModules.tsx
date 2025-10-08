import { Button, Input, Label, toast } from '@/components/atoms';
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/molecules';
import { Dialog,
   DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/organisms';
import { COURSE_BASE_URL } from '@/config/environment';
import { MODULE_SERVICE_GET_MODULES } from '@/config/resources';
import { useFetch } from '@/hooks/use-fetch';

interface Module {
  id: string;
  name: string;
  description?: string;
}


export default function AdminModules() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Fetch módulos (API)
  const { data: fetchedModules = [], isLoading: loadingModules } = useFetch<Array<{ id: number; key: string; name: string; description: string }>>({
    resource: `${COURSE_BASE_URL}${MODULE_SERVICE_GET_MODULES}`,
  });

  // Local state for modules (for demo/local CRUD)
  const [modules, setModules] = useState<Module[]>([]);

  // Sync local modules with fetched modules on first load
  useEffect(() => {
    if (fetchedModules.length > 0) {
      setModules(
        fetchedModules.map((m) => ({
          id: m.id.toString(),
          name: m.name,
          description: m.description,
        }))
      );
    }
  }, [fetchedModules]);

  const handleOpenDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setFormName(module.name);
      setFormDescription(module.description || '');
    } else {
      setEditingModule(null);
      setFormName('');
      setFormDescription('');
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast.error('El nombre del módulo es requerido');
      return;
    }

    if (editingModule) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === editingModule.id
            ? { ...m, name: formName, description: formDescription }
            : m
        )
      );
      toast.success('Módulo actualizado correctamente');
    } else {
      const newModule: Module = {
        id: `mod_${modules.length + 1}`,
        name: formName,
        description: formDescription,
      };
      setModules((prev) => [...prev, newModule]);
      toast.success('Módulo creado correctamente');
    }

    setIsDialogOpen(false);
    setFormName('');
    setFormDescription('');
    setEditingModule(null);
  };

  const handleDelete = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    toast.success('Módulo eliminado correctamente');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Módulos</h1>
          <p className="text-muted-foreground">Administra las categorías de cursos</p>
        </div>
        <FolderTree className="w-8 h-8 text-primary" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Módulos Disponibles</CardTitle>
              <CardDescription>Total: {modules.length} módulos</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Módulo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingModule ? 'Modifica los datos del módulo' : 'Crea un nuevo módulo de capacitación'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del módulo</Label>
                    <Input
                      id="name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ej: Fullstack Development"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Breve descripción del módulo"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    {editingModule ? 'Actualizar' : 'Crear'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {module.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(module)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(module.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
