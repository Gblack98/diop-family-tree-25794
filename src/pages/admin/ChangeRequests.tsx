import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimeAgo } from '@/lib/utils/formatTimeAgo';
import { useIsMobile } from '@/hooks/use-mobile';

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

const FIELD_LABELS: Record<string, string> = {
  name: 'Nom', genre: 'Genre', generation: 'Génération',
  title: 'Titre', category: 'Catégorie', content: 'Contenu',
  full_content: 'Contenu complet', date: 'Date',
  parent_id: 'Parent', child_id: 'Enfant',
  images: 'Images', achievements: 'Réalisations',
};

const CATEGORY_LABELS: Record<string, string> = {
  biography: 'Biographie', photo: 'Photo', document: 'Document',
  quote: 'Citation', article: 'Article', video: 'Vidéo', audio: 'Audio',
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending:  { label: 'En attente', variant: 'outline',     icon: <Clock className="w-3 h-3" /> },
  approved: { label: 'Approuvé',   variant: 'default',     icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rejeté',     variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
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

// Extrait un titre lisible pour une demande
const getChangeTitle = (change: PendingChange): string => {
  const d = change.new_data ?? change.old_data;
  if (!d) return '—';
  if (d.name) return d.name;
  if (d.title) return d.title;
  if (d.parent_id && d.child_id) return `Relation parentale`;
  return '—';
};

const getTableLabel = (table: string) => ({ persons: 'Personne', archives: 'Archive', relationships: 'Relation' }[table] || table);
const getActionLabel = (action: string) => action === 'INSERT' ? 'Créer' : 'Modifier';

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
  const { profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [changes, setChanges] = useState<PendingChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending');
  const [selectedChange, setSelectedChange] = useState<PendingChange | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);

  const loadChanges = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('pending_changes')
        .select('*, requester:requested_by(username)')
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
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadChanges();
  }, [loadChanges]);

  // Realtime: écoute les nouvelles demandes
  useEffect(() => {
    const channel = supabase
      .channel('pending-changes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_changes' }, () => {
        loadChanges();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadChanges]);

  const handleApprove = async (changeId: string) => {
    if (!profile?.id) return;
    setApproving(changeId);
    try {
      const { error } = await supabase.rpc('approve_change', {
        p_change_id: changeId,
        p_reviewer_id: profile.id,
      });
      if (error) throw error;
      toast({ title: 'Changement approuvé', description: 'Les données ont été mises à jour.' });
      setSelectedChange(null);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || "Impossible d'approuver", variant: 'destructive' });
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
      toast({ title: 'Changement rejeté' });
      setShowRejectDialog(null);
      setSelectedChange(null);
      setRejectReason('');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Impossible de rejeter', variant: 'destructive' });
    } finally {
      setRejecting(false);
    }
  };

  const pendingCount = changes.filter(c => c.status === 'pending').length;
  const totalCount = changes.length;

  const headerAction = (
    <Button variant="outline" size="sm" onClick={loadChanges} disabled={loading}>
      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      Actualiser
    </Button>
  );

  return (
    <AdminLayout
      title="Approbation des changements"
      subtitle={pendingCount > 0 ? `${pendingCount} demande${pendingCount > 1 ? 's' : ''} en attente` : 'Aucune demande en attente'}
      headerAction={headerAction}
    >
      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('pending')}
          className="gap-2"
        >
          <Clock className="w-4 h-4" />
          En attente
          {pendingCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs px-1.5">
              {pendingCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          Tout l'historique
          {statusFilter === 'all' && totalCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs px-1.5">
              {totalCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Contenu */}
      {loading ? (
        <Card className="overflow-hidden">
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        </Card>
      ) : changes.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="font-medium mb-1">
            {statusFilter === 'pending' ? 'Tout est à jour !' : 'Aucun changement'}
          </p>
          <p className="text-sm text-muted-foreground">
            {statusFilter === 'pending' ? 'Il n\'y a aucune demande en attente.' : 'Aucun changement dans l\'historique.'}
          </p>
        </Card>
      ) : isMobile ? (
        /* Vue carte mobile */
        <div className="space-y-3">
          {changes.map((change) => {
            const status = STATUS_CONFIG[change.status] ?? STATUS_CONFIG.pending;
            return (
              <Card key={change.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{getChangeTitle(change)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getActionLabel(change.action)} · {getTableLabel(change.table_name)}
                    </p>
                  </div>
                  <Badge variant={status.variant} className="flex items-center gap-1 flex-shrink-0 text-xs">
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span>{change.requester?.username || 'Inconnu'}</span>
                    <span className="mx-1">·</span>
                    <span>{formatTimeAgo(change.created_at)}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedChange(change)}>
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
                          {approving === change.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-green-600" />}
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
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Vue tableau desktop */
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Résumé</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Modérateur</TableHead>
                <TableHead>Soumis</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changes.map((change) => {
                const status = STATUS_CONFIG[change.status] ?? STATUS_CONFIG.pending;
                return (
                  <TableRow key={change.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {getChangeTitle(change)}
                    </TableCell>
                    <TableCell>{getTableLabel(change.table_name)}</TableCell>
                    <TableCell>{getActionLabel(change.action)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {change.requester?.username || 'Inconnu'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(change.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="flex items-center gap-1 w-fit text-xs">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedChange(change)} title="Voir le détail">
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
                              {approving === change.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Check className="w-4 h-4 text-green-600" />}
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog: Détails + actions */}
      <Dialog open={!!selectedChange} onOpenChange={() => setSelectedChange(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du changement</DialogTitle>
          </DialogHeader>
          {selectedChange && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Table',       value: getTableLabel(selectedChange.table_name) },
                  { label: 'Action',      value: getActionLabel(selectedChange.action) },
                  { label: 'Modérateur', value: selectedChange.requester?.username || 'Inconnu' },
                  { label: 'Soumis',     value: formatTimeAgo(selectedChange.created_at) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/50 rounded p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium text-sm">{value}</p>
                  </div>
                ))}
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
                    {approving === selectedChange.id
                      ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      : <Check className="w-4 h-4 mr-2" />}
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

      {/* AlertDialog: Raison du rejet */}
      <AlertDialog
        open={!!showRejectDialog}
        onOpenChange={() => { setShowRejectDialog(null); setRejectReason(''); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter le changement</AlertDialogTitle>
            <AlertDialogDescription>
              Optionnel : explique pourquoi tu rejettes ce changement. Le modérateur sera informé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Raison du rejet (optionnel)..."
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
              {rejecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ChangeRequests;
