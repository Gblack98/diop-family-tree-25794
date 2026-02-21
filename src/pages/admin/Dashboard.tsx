import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import {
  Users,
  FileText,
  UserCog,
  History,
  Archive,
  Plus,
  Pencil,
  Trash2,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils/formatTimeAgo';

interface RecentActivity {
  id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  new_data: any;
  old_data: any;
  changed_at: string;
  profile?: {
    display_name: string | null;
    email: string;
  } | null;
}

export const AdminDashboard = () => {
  const { profile, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    persons: 0,
    archives: 0,
    relationships: 0,
    users: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [personsRes, archivesRes, relationsRes, usersRes, activityRes] =
        await Promise.all([
          supabase.from('persons').select('*', { count: 'exact', head: true }),
          supabase.from('archives').select('*', { count: 'exact', head: true }),
          supabase.from('relationships').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          isAdmin
            ? supabase
                .from('change_history')
                .select('*, profile:profiles(display_name, email)')
                .order('changed_at', { ascending: false })
                .limit(8)
            : Promise.resolve({ data: [] }),
        ]);

      setStats({
        persons: personsRes.count || 0,
        archives: archivesRes.count || 0,
        relationships: relationsRes.count || 0,
        users: usersRes.count || 0,
      });

      if (activityRes.data) {
        setRecentActivity(activityRes.data as RecentActivity[]);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Plus className="w-3.5 h-3.5 text-green-500" />;
      case 'UPDATE':
        return <Pencil className="w-3.5 h-3.5 text-blue-500" />;
      case 'DELETE':
        return <Trash2 className="w-3.5 h-3.5 text-destructive" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'INSERT': return 'a ajouté';
      case 'UPDATE': return 'a modifié';
      case 'DELETE': return 'a supprimé';
      default: return action;
    }
  };

  const getTableLabel = (table: string) => {
    switch (table) {
      case 'persons': return 'une personne';
      case 'relationships': return 'une relation';
      case 'archives': return 'une archive';
      default: return table;
    }
  };

  const getItemLabel = (entry: RecentActivity) => {
    const data = entry.action === 'DELETE' ? entry.old_data : entry.new_data;
    if (!data) return '';
    if (data.name) return `"${data.name}"`;
    if (data.title) return `"${data.title}"`;
    return '';
  };

  const statCards = [
    { label: 'Personnes', value: stats.persons, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Relations', value: stats.relationships, icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Archives', value: stats.archives, icon: Archive, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Utilisateurs', value: stats.users, icon: UserCog, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const actionCards = [
    {
      title: 'Gérer les personnes',
      description: 'Ajouter, modifier ou supprimer des membres',
      icon: Users,
      path: '/admin/persons',
      count: stats.persons,
    },
    {
      title: 'Gérer les archives',
      description: 'Photos, biographies, articles et documents',
      icon: FileText,
      path: '/admin/archives',
      count: stats.archives,
    },
    ...(isAdmin
      ? [
          {
            title: 'Gérer les utilisateurs',
            description: 'Créer des modérateurs, gérer les rôles',
            icon: UserCog,
            path: '/admin/users',
            count: stats.users,
          },
          {
            title: 'Historique',
            description: 'Voir toutes les modifications',
            icon: History,
            path: '/admin/history',
            count: undefined as number | undefined,
          },
        ]
      : []),
  ];

  const refreshButton = (
    <Button variant="outline" size="sm" onClick={() => { setLoading(true); loadData(); }} disabled={loading}>
      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      Actualiser
    </Button>
  );

  return (
    <AdminLayout
      title="Tableau de bord"
      subtitle={`Bienvenue, ${profile?.display_name || profile?.username || 'Admin'}`}
      headerAction={refreshButton}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-4 sm:p-5">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-full flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions rapides */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actionCards.map((card) => (
              <Link key={card.path} to={card.path}>
                <Card className="p-4 hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <card.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{card.title}</h3>
                        {card.count !== undefined && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {card.count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        {isAdmin && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Activité récente</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/history" className="text-xs">
                  Voir tout
                </Link>
              </Button>
            </div>
            <Card className="divide-y">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="p-6 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                </div>
              ) : (
                recentActivity.map((entry) => (
                  <div key={entry.id} className="p-3 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">
                        <span className="font-medium">
                          {entry.profile?.display_name || entry.profile?.email || 'Système'}
                        </span>{' '}
                        {getActionLabel(entry.action)} {getTableLabel(entry.table_name)}{' '}
                        <span className="text-muted-foreground">
                          {getItemLabel(entry)}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatTimeAgo(entry.changed_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
