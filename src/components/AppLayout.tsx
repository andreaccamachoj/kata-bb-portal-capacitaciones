import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  BookOpen,
  GraduationCap,
  Bell,
  Settings,
  LogOut,
  Users,
  LayoutDashboard,
  Search as SearchIcon,
  FolderTree,
  Plus,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { mockApi } from '@/mocks/api';
import { useNavigate } from 'react-router-dom';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const notifications = await mockApi.fetchNotifications(user.id);
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard', roles: ['LEARNER', 'INSTRUCTOR', 'ADMIN'] },
    { to: '/catalog', icon: BookOpen, label: 'Catálogo', roles: ['LEARNER', 'INSTRUCTOR', 'ADMIN'] },
    { to: '/me/learning', icon: GraduationCap, label: 'Mi Aprendizaje', roles: ['LEARNER', 'INSTRUCTOR', 'ADMIN'] },
    { to: '/admin/users', icon: Users, label: 'Usuarios', roles: ['ADMIN'] },
    { to: '/admin/modules', icon: FolderTree, label: 'Módulos', roles: ['ADMIN'] },
    { to: '/admin/courses', icon: LayoutDashboard, label: 'Cursos', roles: ['ADMIN'] },
  ];


  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline-block">Capacitaciones</span>
          </Link>

          <nav className="hidden md:flex gap-6 flex-1 px-6">
            {navItems.map(item => {
              if (!hasRole(item.roles)) return null;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.to) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            
            {hasRole(['INSTRUCTOR', 'ADMIN']) && (
              <Link
                to="/studio/new"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/studio/new') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Estudio
              </Link>
            )}
          </nav>

          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/notifications" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <Badge variant="outline" className="mt-1">{user?.role}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/catalog" className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Catálogo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/me/learning" className="cursor-pointer">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Mi Aprendizaje
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/me/profile" className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                {hasRole(['INSTRUCTOR', 'ADMIN']) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/studio/new" className="cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Curso
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
