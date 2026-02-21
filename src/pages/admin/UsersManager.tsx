import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Shield, ShieldAlert, ShieldCheck, UserX, UserCheck,
  UserPlus, Mail, Lock, User,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  username: string;
  role: 'admin' | 'moderator';
  suspended: boolean;
  created_at: string;
}

export const UsersManager = () => {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<UserProfile | null>(null);

  useEffect(() => { if (isAdmin) loadUsers(); }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator') => {
    if (userId === profile?.id) {
      toast({ title: 'Action impossible', description: 'Vous ne pouvez pas modifier votre propre rôle', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      toast({ title: 'Succès', description: `Rôle modifié en ${newRole}` });
      loadUsers();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Impossible de modifier le rôle', variant: 'destructive' });
    }
  };

  const handleSuspendToggle = async (user: UserProfile) => {
    if (user.id === profile?.id) {
      toast({ title: 'Action impossible', description: 'Vous ne pouvez pas vous suspendre vous-même', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('profiles').update({ suspended: !user.suspended }).eq('id', user.id);
      if (error) throw error;
      toast({ title: 'Succès', description: user.suspended ? 'Utilisateur réactivé' : 'Utilisateur suspendu' });
      loadUsers();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Impossible de modifier le statut', variant: 'destructive' });
    }
    setSuspendTarget(null);
  };

  const getRoleIcon = (role: string) =>
    role === 'admin' ? <ShieldAlert className="w-4 h-4 text-primary" /> : <ShieldCheck className="w-4 h-4 text-blue-500" />;

  const createButton = (
    <Button size={isMobile ? 'sm' : 'default'} onClick={() => setIsCreateDialogOpen(true)}>
      <UserPlus className="w-4 h-4 mr-2" />
      {isMobile ? 'Créer' : 'Créer un modérateur'}
    </Button>
  );

  return (
    <AdminLayout
      title="Gestion des utilisateurs"
      subtitle={`${users.length} utilisateur${users.length > 1 ? 's' : ''} enregistré${users.length > 1 ? 's' : ''}`}
      headerAction={createButton}
    >
      {loading ? (
        <Card className="p-4">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1 flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div>
                <Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Aucun utilisateur trouvé</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />Créer le premier modérateur
          </Button>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className={`p-4 ${user.suspended ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {(user.display_name || user.username || user.email)?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{user.display_name || user.username || 'Sans nom'}</p>
                    {user.id === profile?.id && <Badge variant="outline" className="text-[10px] px-1.5">Vous</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">{getRoleIcon(user.role)}<span className="text-xs capitalize">{user.role}</span></div>
                    {user.suspended
                      ? <Badge variant="destructive" className="text-xs">Suspendu</Badge>
                      : <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Actif</Badge>}
                  </div>
                  {user.id !== profile?.id && (
                    <div className="flex items-center gap-2 mt-3">
                      <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'moderator')}>
                        <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="moderator">Modérateur</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSuspendTarget(user)}>
                        {user.suspended
                          ? <><UserCheck className="w-3 h-3 mr-1 text-green-500" />Réactiver</>
                          : <><UserX className="w-3 h-3 mr-1 text-destructive" />Suspendre</>}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
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
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {(user.display_name || user.username || user.email)?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.display_name || user.username || 'Sans nom'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="flex items-center gap-2">{getRoleIcon(user.role)}<span className="capitalize">{user.role}</span></div></TableCell>
                    <TableCell>
                      {user.suspended
                        ? <Badge variant="destructive" className="text-xs">Suspendu</Badge>
                        : <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Actif</Badge>}
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      {user.id !== profile?.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'moderator')}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="moderator">Modérateur</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm" onClick={() => setSuspendTarget(user)}>
                            {user.suspended ? <UserCheck className="w-4 h-4 text-green-500" /> : <UserX className="w-4 h-4 text-destructive" />}
                          </Button>
                        </div>
                      ) : <Badge variant="outline" className="text-xs">Vous</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Card className="mt-6 p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium">À propos des rôles</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li><strong>Admin :</strong> Accès complet, peut gérer les utilisateurs, supprimer des données et voir l'historique</li>
              <li><strong>Modérateur :</strong> Peut ajouter et modifier des personnes et archives</li>
            </ul>
          </div>
        </div>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Créer un compte modérateur</DialogTitle></DialogHeader>
          <CreateUserForm onSuccess={() => { setIsCreateDialogOpen(false); loadUsers(); }} onCancel={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!suspendTarget} onOpenChange={() => setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{suspendTarget?.suspended ? 'Réactiver le compte' : 'Suspendre le compte'}</AlertDialogTitle>
            <AlertDialogDescription>
              {suspendTarget?.suspended
                ? `Réactiver le compte de ${suspendTarget?.display_name || suspendTarget?.username} ? L'utilisateur pourra à nouveau se connecter.`
                : `Suspendre le compte de ${suspendTarget?.display_name || suspendTarget?.username} ? L'utilisateur ne pourra plus se connecter.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className={suspendTarget?.suspended ? '' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
              onClick={() => suspendTarget && handleSuspendToggle(suspendTarget)}>
              {suspendTarget?.suspended ? 'Réactiver' : 'Suspendre'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

const CreateUserForm = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', displayName: '', role: 'moderator' as 'admin' | 'moderator',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password || !formData.displayName.trim()) {
      toast({ title: 'Erreur', description: 'Tous les champs sont requis', variant: 'destructive' });
      return;
    }
    if (formData.password.length < 8) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 8 caractères', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // Sauvegarder la session admin avant signUp (signUp peut connecter le nouvel user)
      const { data: { session: adminSession } } = await supabase.auth.getSession();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: { data: { display_name: formData.displayName.trim() } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création. Vérifiez que l'email n'est pas déjà utilisé.");

      // Restaurer la session admin si elle a changé
      if (adminSession) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user.id !== adminSession.user.id) {
          await supabase.auth.setSession({
            access_token: adminSession.access_token,
            refresh_token: adminSession.refresh_token,
          });
        }
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: formData.email.trim(),
        username: formData.displayName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
        display_name: formData.displayName.trim(),
        role: formData.role,
        suspended: false,
      });

      if (profileError && !profileError.message.includes('duplicate')) {
        toast({ title: 'Attention', description: 'Compte créé mais profil nécessite configuration. Erreur: ' + profileError.message, variant: 'destructive' });
      }

      toast({ title: 'Succès', description: `Compte ${formData.role} créé pour ${formData.displayName}.` });
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Impossible de créer le compte', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="create-user-name" className="text-sm font-medium">Nom d'affichage *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input id="create-user-name" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="Ex: Moussa Diop" className="pl-10" required />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="create-user-email" className="text-sm font-medium">Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input id="create-user-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="moderateur@example.com" className="pl-10" required />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="create-user-password" className="text-sm font-medium">Mot de passe *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input id="create-user-password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimum 8 caractères" className="pl-10" minLength={8} required />
        </div>
        <p className="text-xs text-muted-foreground">Partagez ce mot de passe avec le modérateur de manière sécurisée</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Rôle</label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'moderator' })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="moderator"><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" />Modérateur</div></SelectItem>
            <SelectItem value="admin"><div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-primary" />Administrateur</div></SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création...</> : <><UserPlus className="w-4 h-4 mr-2" />Créer le compte</>}
        </Button>
      </div>
    </form>
  );
};

export default UsersManager;
