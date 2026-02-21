import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimeAgo } from '@/lib/utils/formatTimeAgo';

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

// Labels for human-readable field names
const FIELD_LABELS: Record<string, string> = {
  name: 'Nom',
  genre: 'Genre',
  generation: 'Génération',
  title: 'Titre',
  category: 'Catégorie',
  content: 'Contenu',
  full_content: 'Contenu complet',
  date: 'Date',
  parent_id: 'Parent',
  child_id: 'Enfant',
  images: 'Images',
  achievements: 'Réalisations',
};

const CATEGORY_LABELS: Record<string, string> = {
  biography: 'Biographie',
  photo: 'Photo',
  document: 'Document',
  quote: 'Citation',
  article: 'Article',
  video: 'Vidéo',
  audio: 'Audio',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};

const formatFieldValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return '—';
  if (key === 'category') return CATEGORY_LABELS[value] ?? value;
  if (Array.isArray(value)) return value.length > 0 ? `${value.length} élément(s)` : '—';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  const str = String(value);
  return str.length > 120 ? str.slice(0, 120) + '…' : str;
};

const VISIBLE_FIELDS: Record<string, string[]> = {
  persons: ['name', 'genre', 'generation'],
  archives: ['title', 'category', 'content', 'date'],
  relationships: ['parent_id', 'child_id'],
};

const ChangeDiff = ({ change }: { change: PendingChange }) => {
  const fields = VISIBLE_FIELDS[change.table_name] ?? Object.keys(change.new_data ?? {});
  const isUpdate = change.action === 'UPDATE' && change.old_data;

  return (
    <div className="space-y-2">
      {fields.map((field) => {
        const newVal = change.new_data?.[field];
        const oldVal = change.old_data?.[field];
        const changed = isUpdate && JSON.stringify(oldVal) !== JSON.stringify(newVal);

        return (
          <div key={field} className={`rounded p-2.5 text-sm ${changed ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800' : 'bg-muted/50'}`}>
            <span className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
              {FIELD_LABELS[field] ?? field}
            </span>
            {isUpdate ? (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {changed ? (
                  <>
                    <span className="line-through text-muted-foreground">{formatFieldValue(field, oldVal)}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-foreground">{formatFieldValue(field, newVal)}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{formatFieldValue(field, newVal)}</span>
                )}
              </div>
            ) : (
              <div className="mt-1 font-medium">{formatFieldValue(field, newVal)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ChangeRequests = () => {
  const { isAdmin, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [changes, setChanges] = useState<PendingChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending');
  const [selectedChange, setSelectedChange] = useState<PendingChange | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

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
      console.error('Error loading changes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (changeId: string) => {
    if (!profile?.id) return;
    setApproving(changeId);
    try {
      const { error } = await supabase.rpc('approve_change', {
        p_change_id: changeId,
        p_reviewer_id: profile.id,
      });

      if (error) throw error;

      toast({ title: 'Succès', description: 'Changement approuvé et appliqué' });
      loadChanges();
      setSelectedChange(null);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || "Impossible d'approuver le changement",
        variant: 'destructive',
      });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (changeId: string) => {
    if (!profile?.id) return;
    setRejecting(true);
    try {
      const { error } = await supabase.rpc('reject_change', {
        p_change_id: changeId,
        p_reviewer_id: profile.id,
        p_reason: rejectReason || null,
      });

      if (error) throw error;

      toast({ title: 'Succès', description: 'Changement rejeté' });
      loadChanges();
      setShowRejectDialog(null);
      setSelectedChange(null);
      setRejectReason('');
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de rejeter le changement',
        variant: 'destructive',
      });
    } finally {
      setRejecting(false);
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
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
      approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
    };
    return badges[status] || badges.pending;
  };

  const pendingCount = changes.filter(c => c.status === 'pending').length;

  return (
    <AdminLayout
      title="Approbation des changements"
      subtitle={`${pendingCount} en attente`}
    >
      {/* Filtre */}
      <Card className="p-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
          >
            En attente
          </Button>
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            Tout l'historique
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
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Modérateur</TableHead>
                <TableHead>Soumis</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changes.map((change) => (
                <TableRow key={change.id}>
                  <TableCell className="font-medium">
                    {getTableLabel(change.table_name)}
                  </TableCell>
                  <TableCell>{getActionLabel(change.action)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {change.requester?.username || 'Inconnu'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(change.created_at)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(change.status).bg} ${getStatusBadge(change.status).text}`}>
                      {STATUS_LABELS[change.status] ?? change.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
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
                          title="Approuver"
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
                          title="Rejeter"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs text-muted-foreground">Table</p>
                  <p className="font-medium">{getTableLabel(selectedChange.table_name)}</p>
                </div>
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs text-muted-foreground">Action</p>
                  <p className="font-medium">{getActionLabel(selectedChange.action)}</p>
                </div>
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs text-muted-foreground">Modérateur</p>
                  <p className="font-medium">{selectedChange.requester?.username || 'Inconnu'}</p>
                </div>
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${getStatusBadge(selectedChange.status).bg} ${getStatusBadge(selectedChange.status).text}`}>
                    {STATUS_LABELS[selectedChange.status] ?? selectedChange.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  {selectedChange.action === 'UPDATE' ? 'Modifications demandées' : 'Données à créer'}
                </p>
                <ChangeDiff change={selectedChange} />
              </div>

              {selectedChange.review_reason && (
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs text-muted-foreground mb-1">Raison du rejet</p>
                  <p className="text-sm">{selectedChange.review_reason}</p>
                </div>
              )}

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
            <AlertDialogCancel disabled={rejecting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={rejecting}
              onClick={() => showRejectDialog && handleReject(showRejectDialog.id)}
            >
              {rejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ChangeRequests;
