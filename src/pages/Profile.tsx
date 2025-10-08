import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge as BadgeType, Progress } from '@/types';
import { mockApi } from '@/mocks/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Award, Calendar, Copy, Mail, User } from 'lucide-react';
import modulesData from '@/mocks/modules.json';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;

    const loadBadges = async () => {
      setLoading(true);
      const progress = await mockApi.fetchUserProgress(user.id);
      const courses = await mockApi.fetchCourses({});
      
      const earnedBadges: BadgeType[] = [];
      
      progress.forEach(prog => {
        if (prog.percentage === 100) {
          const course = courses.find(c => c.id === prog.courseId);
          if (course && course.badge) {
            earnedBadges.push({
              ...course.badge,
              earnedAt: prog.lastWatchedAt,
              courseId: course.id
            });
          }
        }
      });

      setBadges(earnedBadges);
      setLoading(false);
    };

    loadBadges();
  }, [user]);

  const copyBadgeLink = (badge: BadgeType) => {
    const link = `${window.location.origin}/courses/${badge.courseId}`;
    navigator.clipboard.writeText(link);
    toast.success('Enlace copiado al portapapeles');
  };

  const filteredBadges = moduleFilter === 'all' 
    ? badges 
    : badges.filter(badge => {
        // Simple filtering - in real app would need course-badge mapping
        return true;
      });

  if (!user) return null;

  const userInitials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{user.name}</CardTitle>
              <CardDescription className="text-lg mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Rol: <Badge variant="secondary">{user.role}</Badge>
                </div>
              </CardDescription>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="font-semibold">{badges.length}</span> Insignias obtenidas
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Mis Insignias</h2>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all" onClick={() => setModuleFilter('all')}>
              Todas ({badges.length})
            </TabsTrigger>
            {modulesData.slice(0, 3).map(module => {
              const count = badges.length; // Simplified - would need proper filtering
              return (
                <TabsTrigger 
                  key={module} 
                  value={module}
                  onClick={() => setModuleFilter(module)}
                >
                  {module}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={moduleFilter === 'all' ? 'all' : moduleFilter}>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            ) : filteredBadges.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Aún no tienes insignias</h3>
                  <p className="text-muted-foreground">Completa cursos para obtener insignias y demostrar tus logros</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBadges.map((badge) => (
                  <Card 
                    key={badge.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <CardContent className="p-6 text-center">
                      <div 
                        className="text-6xl mb-3 inline-block p-4 rounded-full"
                        style={{ backgroundColor: `${badge.color}20` }}
                      >
                        {badge.icon}
                      </div>
                      <h3 className="font-semibold mb-1">{badge.name}</h3>
                      {badge.earnedAt && (
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-4xl">{selectedBadge?.icon}</span>
              {selectedBadge?.name}
            </DialogTitle>
            <DialogDescription>
              Insignia obtenida al completar un curso
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">ID de la insignia</p>
              <p className="font-mono text-sm">{selectedBadge?.id}</p>
            </div>
            
            {selectedBadge?.earnedAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha de obtención</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedBadge.earnedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
            
            {selectedBadge?.courseId && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Curso origen</p>
                <p className="font-medium">{selectedBadge.courseId}</p>
              </div>
            )}

            <Button 
              onClick={() => selectedBadge && copyBadgeLink(selectedBadge)}
              className="w-full"
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar enlace del curso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
