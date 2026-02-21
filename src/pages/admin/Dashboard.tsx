import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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
  Eye,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils/formatTimeAgo';
import { useActiveVisitors } from '@/hooks/useActiveVisitors';

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

interface VisitPeriod {
  visits: number;
  unique_sessions: number;
}

interface DailyPoint {
  date: string;
  visits: number;
  unique_sessions: number;
}

interface TopPage {
  path: string;
  visits: number;
  unique_sessions: number;
}

interface VisitStats {
  today: VisitPeriod;
  this_week: VisitPeriod;
  this_month: VisitPeriod;
  total: VisitPeriod;
  daily_series: DailyPoint[];
  top_pages: TopPage[];
}

// Label lisible pour une page path
function pathLabel(path: string): string {
  const map: Record<string, string> = {
    '/': 'Accueil',
    '/archives': 'Archives',
    '/help': 'Aide',
  };
  if (map[path]) return map[path];
  if (path.startsWith('/family/')) return `Famille: ${decodeURIComponent(path.replace('/family/', ''))}`;
  if (path.startsWith('/constellation/')) return `Constellation: ${decodeURIComponent(path.replace('/constellation/', ''))}`;
  return path;
}

// Formate la date pour l'axe X (JJ/MM)
function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const AdminDashboard = () => {
  const { profile, isAdmin } = useAuth();
  const activeVisitors = useActiveVisitors(5);
  const [stats, setStats] = useState({ persons: 0, archives: 0, relationships: 0, users: 0 });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [personsRes, archivesRes, relationsRes, usersRes, activityRes, visitsRes] =
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
          isAdmin
            ? supabase.rpc('get_visit_stats')
            : Promise.resolve({ data: null }),
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

      if (visitsRes.data) {
        setVisitStats(visitsRes.data as VisitStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT': return <Plus className="w-3.5 h-3.5 text-green-500" />;
      case 'UPDATE': return <Pencil className="w-3.5 h-3.5 text-blue-500" />;
      case 'DELETE': return <Trash2 className="w-3.5 h-3.5 text-destructive" />;
      default: return null;
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
    { title: 'Gérer les personnes', description: 'Ajouter, modifier ou supprimer des membres', icon: Users, path: '/admin/persons', count: stats.persons },
    { title: 'Gérer les archives', description: 'Photos, biographies, articles et documents', icon: FileText, path: '/admin/archives', count: stats.archives },
    ...(isAdmin
      ? [
          { title: 'Gérer les utilisateurs', description: 'Créer des modérateurs, gérer les rôles', icon: UserCog, path: '/admin/users', count: stats.users },
          { title: 'Historique', description: 'Voir toutes les modifications', icon: History, path: '/admin/history', count: undefined as number | undefined },
        ]
      : []),
  ];

  // Préparer les données du graphique : afficher les 14 derniers jours
  const chartData = (visitStats?.daily_series ?? [])
    .slice(-14)
    .map((d) => ({ ...d, label: shortDate(d.date) }));

  const headerActions = (
    <div className="flex items-center gap-2">
      {isAdmin && activeVisitors !== null && (
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {activeVisitors} visiteur{activeVisitors !== 1 ? 's' : ''} actif{activeVisitors !== 1 ? 's' : ''} (5 min)
        </span>
      )}
      <Button variant="outline" size="sm" onClick={() => { setLoading(true); loadData(); }} disabled={loading}>
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Actualiser
      </Button>
    </div>
  );

  return (
    <AdminLayout
      title="Tableau de bord"
      subtitle={`Bienvenue, ${profile?.display_name || profile?.username || 'Admin'}`}
      headerAction={headerActions}
    >
      {/* Stats contenu */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
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

      {/* Section visiteurs — admins seulement */}
      {isAdmin && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Visiteurs du site
          </h2>

          {/* 4 cartes compteurs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {[
              { label: "Aujourd'hui",   icon: Eye,          color: 'text-cyan-500',   bg: 'bg-cyan-500/10',   visits: visitStats?.today.visits ?? 0,      unique: visitStats?.today.unique_sessions ?? 0 },
              { label: 'Cette semaine', icon: CalendarDays, color: 'text-indigo-500', bg: 'bg-indigo-500/10', visits: visitStats?.this_week.visits ?? 0,   unique: visitStats?.this_week.unique_sessions ?? 0 },
              { label: 'Ce mois',       icon: CalendarRange,color: 'text-violet-500', bg: 'bg-violet-500/10', visits: visitStats?.this_month.visits ?? 0,  unique: visitStats?.this_month.unique_sessions ?? 0 },
              { label: 'Total',         icon: TrendingUp,   color: 'text-rose-500',   bg: 'bg-rose-500/10',   visits: visitStats?.total.visits ?? 0,       unique: visitStats?.total.unique_sessions ?? 0 },
            ].map((card) => (
              <Card key={card.label} className="p-4 sm:p-5">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">{card.label}</p>
                      <p className="text-2xl sm:text-3xl font-bold">{card.visits}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {card.unique} session{card.unique !== 1 ? 's' : ''} uniques
                      </p>
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color}`} />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Graphique + Top pages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Courbe 14 derniers jours */}
            <Card className="lg:col-span-2 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Tendance — 14 derniers jours</h3>
              </div>
              {loading ? (
                <Skeleton className="h-44 w-full" />
              ) : chartData.length === 0 || chartData.every(d => d.visits === 0) ? (
                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
                  Aucune visite enregistrée pour le moment
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={176}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(value: number, name: string) => [
                        value,
                        name === 'visits' ? 'Visites' : 'Sessions uniques',
                      ]}
                      labelFormatter={(label) => `Jour : ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#visitsGrad)"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="unique_sessions"
                      stroke="#06b6d4"
                      strokeWidth={1.5}
                      fill="none"
                      dot={false}
                      strokeDasharray="4 2"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-indigo-500 rounded inline-block" />
                  Visites totales
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-500 rounded inline-block border-dashed" />
                  Sessions uniques
                </span>
              </div>
            </Card>

            {/* Top pages */}
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Pages populaires (30j)</h3>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : !visitStats?.top_pages?.length ? (
                <p className="text-sm text-muted-foreground">Aucune donnée</p>
              ) : (
                <div className="space-y-3">
                  {visitStats.top_pages.map((page, idx) => {
                    const max = visitStats.top_pages[0].visits;
                    const pct = max > 0 ? Math.round((page.visits / max) * 100) : 0;
                    return (
                      <div key={page.path}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium truncate max-w-[160px]" title={page.path}>
                            {idx + 1}. {pathLabel(page.path)}
                          </span>
                          <span className="text-muted-foreground flex-shrink-0 ml-2">
                            {page.visits} vue{page.visits !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Grille actions rapides + activité récente */}
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
                      <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
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
                <Link to="/admin/history" className="text-xs">Voir tout</Link>
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
                        <span className="text-muted-foreground">{getItemLabel(entry)}</span>
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
