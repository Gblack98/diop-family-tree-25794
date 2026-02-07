import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Check,
  X,
  Eye,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface PendingChange {
  id: string;
  table_name: string;
  action: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string;
  requester?: { username: string };
  review_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export const ChangeRequests = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [changes, setChanges] = useState<PendingChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending');
  const [selectedChange, setSelectedChange] = useState<PendingChange | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approving, setApproving] = useState<string | null>(null);

  // Redirection si non-admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  // Charger les changements en attente
  useEffect(() => {
    loadChanges();
  }, [statusFilter]);

  const loadChanges = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('pending_changes')
        .select(`
          *,
          requester:requested_by(username)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;
      if (error) throw error;
      setChanges(data || []);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes de changement',
        variant: 'destructive',
      });
      // eslint-disable-next-line no-console
      console.error('Error loading changes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (changeId: string) => {
    setApproving(changeId);
    try {
      const { data, error } = await supabase.rpc('approve_change', {
        p_change_id: changeId,
        p_reviewer_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Changement approuvé et appliqué',
      });

      loadChanges();
      setSelectedChange(null);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible d\'approuver le changement',
        variant: 'destructive',
      });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (changeId: string) => {
    try {
      const { data, error } = await supabase.rpc('reject_change', {
        p_change_id: changeId,
        p_reviewer_id: (await supabase.auth.getUser()).data.user?.id,
        p_reason: rejectReason || null,
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Changement rejeté',
      });

      loadChanges();
      setShowRejectDialog(null);
      setRejectReason('');
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de rejeter le changement',
        variant: 'destructive',
      });
    }
  };

  const getTableLabel = (table: string) => {
    const labels: Record<string, string> = {
      persons: 'Personne',
      archives: 'Archive',
      relationships: 'Relation',
    };
    return labels[table] || table;
  };

  const getActionLabel = (action: string) => {
    return action === 'INSERT' ? 'Créer' : 'Modifier';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      approved: { bg: 'bg-green-100', text: 'text-green-800' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800' },
    };
    return badges[status] || badges.pending;
  };

  return (
    <AdminLayout
      title="Approbation des changements"
      subtitle={`${changes.filter(c => c.status === 'pending').length} en attente`}
    >
      {/* Filtre */}
      <Card className="p-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
          >
            En attente ({changes.filter(c => c.status === 'pending').length})
          </Button>
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            Tous ({changes.length})
          </Button>
        </div>
      </Card>

      {/* Tableau */}
      {loading ? (
        <Card className="overflow-hidden">
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </Card>
      ) : changes.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {statusFilter === 'pending'
              ? 'Aucun changement en attente'
              : 'Aucun changement'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHead>Table</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Modérateur</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {changes.map((change) => (
                <tr key={change.id} className="border-b hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {getTableLabel(change.table_name)}
                  </TableCell>
                  <TableCell>{getActionLabel(change.action)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {change.requester?.username || 'Inconnu'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(change.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        getStatusBadge(change.status).bg
                      } ${getStatusBadge(change.status).text}`}
                    >
                      {change.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedChange(change)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {change.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(change.id)}
                          disabled={!!approving}
                        >
                          {approving === change.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRejectDialog({ id: change.id })}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog: Voir les détails */}
      <Dialog open={!!selectedChange} onOpenChange={() => setSelectedChange(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du changement</DialogTitle>
          </DialogHeader>
          {selectedChange && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Table</label>
                  <p className="text-sm text-muted-foreground">
                    {getTableLabel(selectedChange.table_name)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <p className="text-sm text-muted-foreground">
                    {getActionLabel(selectedChange.action)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Modérateur</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedChange.requester?.username || 'Inconnu'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedChange.status}
                  </p>
                </div>
              </div>

              {selectedChange.old_data && (
                <div>
                  <label className="text-sm font-medium">Données avant</label>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedChange.old_data, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Nouvelles données</label>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(selectedChange.new_data, null, 2)}
                </pre>
              </div>

              {selectedChange.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => handleApprove(selectedChange.id)}
                    disabled={!!approving}
                  >
                    {approving === selectedChange.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Approuver
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowRejectDialog({ id: selectedChange.id })}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Rejeter avec raison */}
      <AlertDialog
        open={!!showRejectDialog}
        onOpenChange={() => {
          setShowRejectDialog(null);
          setRejectReason('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter le changement</AlertDialogTitle>
            <AlertDialogDescription>
              Optionnel : explique pourquoi tu rejettes ce changement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Raison du rejet..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                showRejectDialog && handleReject(showRejectDialog.id)
              }
            >
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ChangeRequests;
