import { Link } from 'react-router-dom';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  CheckCheck,
  Users,
  FileText,
  GitBranch,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils/formatTimeAgo';

export const NotificationBell = () => {
  const { isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (!isAdmin) return null;

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT': return <Plus className="w-3.5 h-3.5 text-green-500" />;
      case 'UPDATE': return <Pencil className="w-3.5 h-3.5 text-blue-500" />;
      case 'DELETE': return <Trash2 className="w-3.5 h-3.5 text-destructive" />;
      default: return null;
    }
  };

  const getTableIcon = (table: string) => {
    switch (table) {
      case 'persons': return <Users className="w-3.5 h-3.5" />;
      case 'archives': return <FileText className="w-3.5 h-3.5" />;
      case 'relationships': return <GitBranch className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const recentNotifications = notifications.slice(0, 8);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Tout lire
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-80">
          {recentNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aucune notification
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={markAsRead}
                  getActionIcon={getActionIcon}
                  getTableIcon={getTableIcon}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
              <Link to="/admin/notifications">
                Voir toutes les notifications
              </Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const NotificationItem = ({
  notification,
  onRead,
  getActionIcon,
  getTableIcon,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  getActionIcon: (action: string) => React.ReactNode;
  getTableIcon: (table: string) => React.ReactNode;
}) => (
  <div
    className={`flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
      !notification.read ? 'bg-primary/5' : ''
    }`}
    onClick={() => !notification.read && onRead(notification.id)}
  >
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
      {getActionIcon(notification.action_type)}
    </div>
    <div className="min-w-0 flex-1">
      <p className={`text-sm leading-snug ${!notification.read ? 'font-medium' : ''}`}>
        {notification.message}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(notification.created_at)}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {getTableIcon(notification.target_table)}
        </span>
      </div>
    </div>
    {!notification.read && (
      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
    )}
  </div>
);

export default NotificationBell;
