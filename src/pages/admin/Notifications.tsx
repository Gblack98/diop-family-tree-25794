import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  CheckCheck,
  Users,
  FileText,
  GitBranch,
  Check,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { formatTimeAgo } from '@/lib/utils/formatTimeAgo';

export const NotificationsPage = () => {
  const { isAdmin } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filterTable, setFilterTable] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  if (!isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const filteredNotifications = notifications.filter((n) => {
    const matchesTable = filterTable === 'all' || n.target_table === filterTable;
    const matchesRead = filterRead === 'all' || (filterRead === 'unread' ? !n.read : n.read);
    return matchesTable && matchesRead;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT': return <Plus className="w-4 h-4 text-green-500" />;
      case 'UPDATE': return <Pencil className="w-4 h-4 text-blue-500" />;
      case 'DELETE': return <Trash2 className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const getTableIcon = (table: string) => {
    switch (table) {
      case 'persons': return <Users className="w-4 h-4" />;
      case 'archives': return <FileText className="w-4 h-4" />;
      case 'relationships': return <GitBranch className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTableLabel = (table: string) => {
    switch (table) {
      case 'persons': return 'Personnes';
      case 'archives': return 'Archives';
      case 'relationships': return 'Relations';
      default: return table;
    }
  };

  const markAllButton = unreadCount > 0 ? (
    <Button size="sm" variant="outline" onClick={markAllAsRead}>
      <CheckCheck className="w-4 h-4 mr-2" />
      Tout marquer comme lu
    </Button>
  ) : undefined;

  return (
    <AdminLayout
      title="Notifications"
      subtitle={`${unreadCount} non lue${unreadCount > 1 ? 's' : ''} sur ${notifications.length}`}
      headerAction={markAllButton}
    >
      {/* Filters */}
      <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterTable} onValueChange={setFilterTable}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="persons">Personnes</SelectItem>
              <SelectItem value="archives">Archives</SelectItem>
              <SelectItem value="relationships">Relations</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRead} onValueChange={setFilterRead}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="unread">Non lues</SelectItem>
              <SelectItem value="read">Lues</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Notifications list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {notifications.length === 0
              ? 'Aucune notification pour le moment'
              : 'Aucune notification ne correspond aux filtres'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Les notifications apparaissent quand les modérateurs effectuent des actions.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 transition-all hover:shadow-sm ${
                !notif.read ? 'border-primary/30 bg-primary/[0.02]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {getActionIcon(notif.action_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-relaxed ${!notif.read ? 'font-medium' : ''}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notif.created_at)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {getTableIcon(notif.target_table)}
                      {getTableLabel(notif.target_table)}
                    </span>
                    {notif.target_label && (
                      <span className="text-xs text-muted-foreground italic truncate max-w-48">
                        {notif.target_label}
                      </span>
                    )}
                  </div>
                </div>
                {!notif.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => markAsRead(notif.id)}
                    title="Marquer comme lu"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default NotificationsPage;
