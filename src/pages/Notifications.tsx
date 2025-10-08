import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/mocks/api';
import { Notification, NotificationType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Bell, Award, Clock, AlertCircle, ExternalLink, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const notificationIcons: Record<NotificationType, React.ElementType> = {
  NEW_COURSE: Bell,
  BADGE: Award,
  REMINDER: Clock,
  SYSTEM: AlertCircle,
};

const notificationColors: Record<NotificationType, string> = {
  NEW_COURSE: 'text-blue-500',
  BADGE: 'text-yellow-500',
  REMINDER: 'text-orange-500',
  SYSTEM: 'text-purple-500',
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await mockApi.fetchNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las notificaciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    try {
      await mockApi.markNotificationRead(user.id, notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      toast({
        title: 'Notificación marcada como leída',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleAction = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const filterNotifications = (type?: NotificationType) => {
    if (!type) return notifications;
    return notifications.filter(n => n.type === type);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString();
  };

  const renderNotificationList = (filteredNotifications: Notification[]) => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No hay notificaciones</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {filteredNotifications.map(notification => {
          const Icon = notificationIcons[notification.type];
          const iconColor = notificationColors[notification.type];

          return (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.read ? 'border-primary/50 bg-accent/5' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center bg-muted ${iconColor}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge variant="default" className="shrink-0">
                          Nuevo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Marcar leído
                          </Button>
                        )}
                        {notification.actionUrl && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAction(notification)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Ver más
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container max-w-5xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notificaciones</h1>
        <p className="text-muted-foreground">
          {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer` : 'Todas las notificaciones leídas'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            Todas
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="NEW_COURSE">
            Cursos
            {filterNotifications('NEW_COURSE').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filterNotifications('NEW_COURSE').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="BADGE">
            Insignias
            {filterNotifications('BADGE').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filterNotifications('BADGE').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="REMINDER">
            Recordatorios
            {filterNotifications('REMINDER').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filterNotifications('REMINDER').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="SYSTEM">
            Sistema
            {filterNotifications('SYSTEM').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filterNotifications('SYSTEM').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderNotificationList(notifications)}</TabsContent>
        <TabsContent value="NEW_COURSE">
          {renderNotificationList(filterNotifications('NEW_COURSE'))}
        </TabsContent>
        <TabsContent value="BADGE">
          {renderNotificationList(filterNotifications('BADGE'))}
        </TabsContent>
        <TabsContent value="REMINDER">
          {renderNotificationList(filterNotifications('REMINDER'))}
        </TabsContent>
        <TabsContent value="SYSTEM">
          {renderNotificationList(filterNotifications('SYSTEM'))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
