import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { NotificationBell } from '@/components/Admin/NotificationBell';
import {
  LayoutDashboard,
  Users,
  FileText,
  History,
  UserCog,
  LogOut,
  Home,
  Menu,
  Bell,
  ChevronLeft,
  ChevronRight,
  TreePine,
  CheckSquare,
  Settings,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  separator?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord',  path: '/admin/dashboard',       icon: LayoutDashboard },
  { label: 'Personnes',        path: '/admin/persons',          icon: Users },
  { label: 'Archives',         path: '/admin/archives',         icon: FileText },
  { label: 'Utilisateurs',     path: '/admin/users',            icon: UserCog,     adminOnly: true },
  { label: 'Changements',      path: '/admin/change-requests',  icon: CheckSquare, adminOnly: true },
  { label: 'Historique',       path: '/admin/history',          icon: History,     adminOnly: true },
  { label: 'Notifications',    path: '/admin/notifications',    icon: Bell,        adminOnly: true },
  { label: 'Paramètres',       path: '/admin/settings',         icon: Settings,    adminOnly: true, separator: true },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const AdminLayout = ({ children, title, subtitle, headerAction }: AdminLayoutProps) => {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const filteredNavItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <TreePine className="w-5 h-5 text-primary" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="min-w-0">
            <h2 className="font-bold text-sm truncate">Famille Diop</h2>
            <p className="text-xs text-muted-foreground">Administration</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <div key={item.path}>
                {item.separator && <Separator className="my-2" />}
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {(!collapsed || isMobile) && <span>{item.label}</span>}
                </Link>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3 space-y-2">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Retour au site</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar (Sheet) */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={`fixed inset-y-0 left-0 z-30 border-r bg-background/95 backdrop-blur transition-all duration-300 ${
            collapsed ? 'w-16' : 'w-64'
          }`}
        >
          <SidebarContent />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-background border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>
        </aside>
      )}

      {/* Main content area */}
      <div
        className={`transition-all duration-300 ${
          isMobile ? 'ml-0' : collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="flex-shrink-0"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">{title}</h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {headerAction}

              {isAdmin && <NotificationBell />}

              {/* User info - hidden on very small screens */}
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {profile?.display_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium leading-none">
                    {profile?.display_name || profile?.username}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                    {profile?.role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
