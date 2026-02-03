import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Users,
  FileText,
  LogOut,
  Home,
  Settings,
  History,
  UserCog,
  Archive,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    persons: 0,
    archives: 0,
    relationships: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [personsRes, archivesRes, relationsRes] = await Promise.all([
        supabase.from('persons').select('*', { count: 'exact', head: true }),
        supabase.from('archives').select('*', { count: 'exact', head: true }),
        supabase.from('relationships').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        persons: personsRes.count || 0,
        archives: archivesRes.count || 0,
        relationships: relationsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Administration</h1>
              <p className="text-sm text-muted-foreground">
                Connecté en tant que <span className="font-semibold">{profile?.username}</span>
                {' • '}
                <span className="capitalize">{profile?.role}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Retour au site
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Personnes</p>
                <p className="text-3xl font-bold">{loading ? '...' : stats.persons}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Relations</p>
                <p className="text-3xl font-bold">{loading ? '...' : stats.relationships}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Archives</p>
                <p className="text-3xl font-bold">{loading ? '...' : stats.archives}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Archive className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Gérer les personnes</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Ajouter, modifier ou supprimer des membres de la famille
                </p>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link to="/admin/persons">
                    Gérer
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Gérer les archives</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Ajouter des biographies, photos et documents
                </p>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link to="/admin/archives">
                    Gérer
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          {profile?.role === 'admin' && (
            <>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <UserCog className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Gérer les utilisateurs</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ajouter, suspendre ou gérer les modérateurs
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link to="/admin/users">
                        Gérer
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <History className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Historique</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Voir toutes les modifications et les restaurer
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link to="/admin/history">
                        Consulter
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group opacity-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Paramètres</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configuration générale de l'application
                    </p>
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      Bientôt
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
