import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Shield, ShieldAlert, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  role: 'admin' | 'moderator';
  suspended: boolean;
  created_at: string;
}

export const UsersManager = () => {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Seuls les admins peuvent accéder à cette page
  if (!isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator') => {
    // Empêcher de modifier son propre rôle
    if (userId === profile?.id) {
      toast({
        title: 'Action impossible',
        description: 'Vous ne pouvez pas modifier votre propre rôle',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `Rôle modifié en ${newRole}`,
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le rôle',
        variant: 'destructive',
      });
    }
  };

  const handleSuspendToggle = async (userId: string, currentSuspended: boolean) => {
    // Empêcher de se suspendre soi-même
    if (userId === profile?.id) {
      toast({
        title: 'Action impossible',
        description: 'Vous ne pouvez pas vous suspendre vous-même',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ suspended: !currentSuspended })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: currentSuspended ? 'Utilisateur réactivé' : 'Utilisateur suspendu',
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? (
      <ShieldAlert className="w-4 h-4 text-primary" />
    ) : (
      <ShieldCheck className="w-4 h-4 text-blue-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
              <p className="text-sm text-muted-foreground">
                {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscrit le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className={user.suspended ? 'opacity-50' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.display_name || 'Sans nom'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.suspended ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                            Suspendu
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Actif
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.id !== profile?.id && (
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              value={user.role}
                              onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'moderator')}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="moderator">Modérateur</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspendToggle(user.id, user.suspended)}
                            >
                              {user.suspended ? (
                                <UserCheck className="w-4 h-4 text-green-500" />
                              ) : (
                                <UserX className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        )}
                        {user.id === profile?.id && (
                          <span className="text-xs text-muted-foreground">Vous</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Info card */}
        <Card className="mt-6 p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">À propos des rôles</h3>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li><strong>Admin:</strong> Accès complet, peut gérer les utilisateurs et supprimer des données</li>
                <li><strong>Modérateur:</strong> Peut ajouter et modifier des personnes et archives</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default UsersManager;
