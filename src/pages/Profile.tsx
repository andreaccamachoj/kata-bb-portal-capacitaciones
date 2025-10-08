import { Badge, Button, Avatar, AvatarFallback, Skeleton } from '@/components/atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/molecules';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/organisms';
import { useAuth } from '@/hooks/use-auth';
import { Badge as BadgeType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Award, Calendar, Copy, Mail, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { COURSE_BASE_URL } from '@/config/environment';
import { BADGES_SERVICE_GET_USER_BADGES } from '@/config/resources';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadBadges = async () => {
      try {
        setLoading(true);
        
        // Fetch user badges from the real API
        const { data: userBadges } = await apiClient.get<BadgeType[]>(
          `${COURSE_BASE_URL}${BADGES_SERVICE_GET_USER_BADGES}/${user.userId}`
        );
        
        setBadges(userBadges);
      } catch (error) {
        console.error('Error fetching user badges:', error);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, [user]);

  const copyBadgeLink = (badge: BadgeType) => {
    const link = `${window.location.origin}/badges/${badge.badgeId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Enlace copiado',
      description: 'Enlace copiado al portapapeles'
    });
  };

  if (!user) {
    return (
      <div className="space-y-8 p-6">
        <h1 className="text-2xl font-bold">Sesión cerrada</h1>
        <p className="text-muted-foreground">Por favor inicia sesión para continuar.</p>
      </div>
    );
  }

  const userInitials = user.userName
    ? user.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{user.userName}</CardTitle>
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
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : badges.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Aún no tienes insignias</h3>
              <p className="text-muted-foreground">Completa cursos para obtener insignias y demostrar tus logros</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <Card 
                key={badge.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedBadge(badge)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <img 
                      src={badge.badgeIconUrl} 
                      alt={badge.badgeName}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold mb-1">{badge.badgeName}</h3>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(badge.assignedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8">
                <img 
                  src={selectedBadge?.badgeIconUrl} 
                  alt={selectedBadge?.badgeName}
                  className="w-full h-full object-contain"
                />
              </div>
              {selectedBadge?.badgeName}
            </DialogTitle>
            <DialogDescription>
              {selectedBadge?.badgeDescription}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">ID de la insignia</p>
              <p className="font-mono text-sm">{selectedBadge?.badgeId}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fecha de obtención</p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {selectedBadge && new Date(selectedBadge.assignedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <Button 
              onClick={() => selectedBadge && copyBadgeLink(selectedBadge)}
              className="w-full"
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar enlace de la insignia
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
