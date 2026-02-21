import { useState, useEffect } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase/client';
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
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '@/lib/utils/formatTimeAgo';

// ---- Types ----
interface PendingChangeDetail {
  id: string;
  table_name: string;
  action: string;
  old_data: any;
  new_data: any;
  status: string;
}

// ---- Labels ----
const FIELD_LABELS: Record<string, string> = {
  name: 'Nom', genre: 'Genre', generation: 'Génération',
  title: 'Titre', category: 'Catégorie', content: 'Contenu',
  full_content: 'Contenu complet', date: 'Date',
  parent_id: 'Parent', child_id: 'Enfant',
};
const CATEGORY_LABELS: Record<string, string> = {
  biography: 'Biographie', photo: 'Photo', document: 'Document',
  quote: 'Citation', article: 'Article', video: 'Vidéo', audio: 'Audio',
};
const VISIBLE_FIELDS: Record<string, string[]> = {
  persons: ['name', 'genre', 'generation'],
  archives: ['title', 'category', 'content', 'date'],
  relationships: ['parent_id', 'child_id'],
};
const formatFieldValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return '—';
  if (key === 'category') return CATEGORY_LABELS[value] ?? value;
  if (Array.isArray(value)) return value.length > 0 ? `${value.length} élément(s)` : '—';
  const str = String(value);
  return str.length > 100 ? str.slice(0, 100) + '…' : str;
};

// ---- Composant diff inline ----
const MiniDiff = ({ change }: { change: PendingChangeDetail }) => {
  const fields = VISIBLE_FIELDS[change.table_name] ?? Object.keys(change.new_data ?? {}).slice(0, 4);
  const isUpdate = change.action === 'UPDATE' && change.old_data;

  return (
    <div className="mt-3 space-y-1.5 border-t pt-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {isUpdate ? 'Modifications demandées' : 'Données à créer'}
      </p>
      {fields.map((field) => {
        const newVal = change.new_data?.[field];
        const oldVal = change.old_data?.[field];
        const changed = isUpdate && JSON.stringify(oldVal) !== JSON.stringify(newVal);
        if (!isUpdate && (newVal === null || newVal === undefined)) return null;
        return (
          <div key={field} className={`rounded px-2.5 py-1.5 text-xs ${
            changed
              ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-700'
              : 'bg-muted/50'
          }`}>
            <span className="font-medium text-muted-foreground">{FIELD_LABELS[field] ?? field} : </span>
            {isUpdate && changed ? (
              <span className="inline-flex items-center gap-1 flex-wrap">
                <span className="line-through text-muted-foreground">{formatFieldValue(field, oldVal)}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-foreground">{formatFieldValue(field, newVal)}</span>
              </span>
            ) : (
              <span className={changed ? 'font-medium' : ''}>{formatFieldValue(field, newVal ?? oldVal)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---- Page principale ----
export const NotificationsPage = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filterTable, setFilterTable] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [pendingDetails, setPendingDetails] = useState<Record<string, PendingChangeDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filteredNotifications = notifications.filter((n) => {
    const matchesTable = filterTable === 'all' || n.target_table === filterTable;
    const matchesRead = filterRead === 'all' || (filterRead === 'unread' ? !n.read : n.read);
    const matchesType = filterType === 'all'
      || (filterType === 'pending' && !!n.pending_change_id)
      || (filterType === 'applied' && !n.pending_change_id);
    return matchesTable && matchesRead && matchesType;
  });

  const pendingNotifs = notifications.filter(n => n.pending_change_id && !n.read);

  const loadPendingDetail = async (notif: Notification) => {
    if (!notif.pending_change_id || pendingDetails[notif.id]) return;
    setLoadingDetails(prev => ({ ...prev, [notif.id]: true }));
    try {
      const { data, error } = await supabase
        .from('pending_changes')
        .select('id, table_name, action, old_data, new_data, status')
        .eq('id', notif.pending_change_id)
        .single();
      if (!error && data) {
        setPendingDetails(prev => ({ ...prev, [notif.id]: data }));
      }
    } catch (err) {
      console.error('Error loading pending detail:', err);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [notif.id]: false }));
    }
  };

  const toggleExpand = (notif: Notification) => {
    const isNowExpanded = !expanded[notif.id];
    setExpanded(prev => ({ ...prev, [notif.id]: isNowExpanded }));
    if (isNowExpanded && notif.pending_change_id) {
      loadPendingDetail(notif);
    }
  };

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

  const headerAction = (
    <div className="flex items-center gap-2">
      {pendingNotifs.length > 0 && (
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
          <Link to="/admin/change-requests">
            <Clock className="w-4 h-4 mr-2" />
            {pendingNotifs.length} à approuver
          </Link>
        </Button>
      )}
      {unreadCount > 0 && (
        <Button size="sm" variant="outline" onClick={markAllAsRead}>
          <CheckCheck className="w-4 h-4 mr-2" />
          Tout lire
        </Button>
      )}
    </div>
  );

  return (
    <AdminLayout
      title="Notifications"
      subtitle={`${unreadCount} non lue${unreadCount > 1 ? 's' : ''} sur ${notifications.length}`}
      headerAction={headerAction}
    >
      {/* Filters */}
      <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="pending">À approuver</SelectItem>
              <SelectItem value="applied">Déjà appliquées</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterTable} onValueChange={setFilterTable}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Table" />
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
              <SelectValue placeholder="Statut lu" />
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
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => {
            const isPending = !!notif.pending_change_id;
            const isExpanded = !!expanded[notif.id];
            const detail = pendingDetails[notif.id];

            return (
              <Card
                key={notif.id}
                className={`transition-all hover:shadow-sm ${
                  !notif.read
                    ? isPending
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/10'
                      : 'border-primary/30 bg-primary/[0.02]'
                    : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icône */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPending ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-muted'
                    }`}>
                      {isPending
                        ? <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        : getActionIcon(notif.action_type)
                      }
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Message */}
                      <p className={`text-sm leading-relaxed ${!notif.read ? 'font-medium' : ''}`}>
                        {notif.message}
                      </p>

                      {/* Métadonnées */}
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
                            "{notif.target_label}"
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            Approbation requise
                          </span>
                        )}
                      </div>

                      {/* Diff inline si expanded */}
                      {isExpanded && (
                        loadingDetails[notif.id] ? (
                          <div className="mt-3 border-t pt-3 space-y-1.5">
                            <Skeleton className="h-7 w-full" />
                            <Skeleton className="h-7 w-4/5" />
                          </div>
                        ) : detail ? (
                          <MiniDiff change={detail} />
                        ) : (
                          <p className="mt-3 text-xs text-muted-foreground border-t pt-3">
                            Demande introuvable (peut-être déjà traitée).
                          </p>
                        )
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isPending && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => toggleExpand(notif)}
                        >
                          {isExpanded ? 'Réduire' : 'Voir le détail'}
                        </Button>
                      )}
                      {isPending && (
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                          asChild
                          onClick={() => { if (!notif.read) markAsRead(notif.id); }}
                        >
                          <Link to="/admin/change-requests">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            Décider
                          </Link>
                        </Button>
                      )}
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => markAsRead(notif.id)}
                          title="Marquer comme lu"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default NotificationsPage;
