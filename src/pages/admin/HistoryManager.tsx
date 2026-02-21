import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, History, ChevronLeft, ChevronRight, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 25;

interface ChangeHistoryEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: any;
  new_data: any;
  changed_by: string | null;
  changed_at: string;
  reverted: boolean;
  revert_reason: string | null;
  profile?: {
    display_name: string | null;
    email: string;
  };
}

export const HistoryManager = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [history, setHistory] = useState<ChangeHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [revertTarget, setRevertTarget] = useState<ChangeHistoryEntry | null>(null);
  const [revertReason, setRevertReason] = useState('');
  const [reverting, setReverting] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [page, selectedTable, selectedAction]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('change_history')
        .select(`*, profile:profiles(display_name, email)`, { count: 'exact' })
        .order('changed_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (selectedTable !== 'all') query = query.eq('table_name', selectedTable);
      if (selectedAction !== 'all') query = query.eq('action', selectedAction);

      const { data, error, count } = await query;

      if (error) throw error;
      setHistory(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de charger l'historique",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(0);
  };

  const handleRevert = async () => {
    if (!revertTarget) return;
    setReverting(true);
    try {
      const { error } = await supabase.rpc('revert_history_entry', {
        p_entry_id: revertTarget.id,
        p_revert_reason: revertReason || null,
      });
      if (error) throw error;
      toast({ title: 'Modification annulée', description: `La modification a été restaurée à son état précédent.` });
      setRevertTarget(null);
      setRevertReason('');
      loadHistory();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || "Impossible d'annuler cette modification", variant: 'destructive' });
    } finally {
      setReverting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const filteredHistory = history;

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'UPDATE':
        return <Pencil className="w-4 h-4 text-blue-500" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'INSERT': return 'Ajout';
      case 'UPDATE': return 'Modification';
      case 'DELETE': return 'Suppression';
      default: return action;
    }
  };

  const getTableLabel = (table: string) => {
    switch (table) {
      case 'persons': return 'Personnes';
      case 'relationships': return 'Relations';
      case 'archives': return 'Archives';
      default: return table;
    }
  };

  const formatData = (data: any) => {
    if (!data) return '—';
    if (data.name) return data.name;
    if (data.title) return data.title;
    if (data.parent_id && data.child_id) return 'Relation';
    return JSON.stringify(data).slice(0, 50) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout
      title="Historique des modifications"
      subtitle={`${totalCount} entrée${totalCount > 1 ? 's' : ''} au total`}
    >
      {/* Filters */}
      <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedTable} onValueChange={handleFilterChange(setSelectedTable)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les tables</SelectItem>
              <SelectItem value="persons">Personnes</SelectItem>
              <SelectItem value="relationships">Relations</SelectItem>
              <SelectItem value="archives">Archives</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedAction} onValueChange={handleFilterChange(setSelectedAction)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="INSERT">Ajouts</SelectItem>
              <SelectItem value="UPDATE">Modifications</SelectItem>
              <SelectItem value="DELETE">Suppressions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Card className="p-4">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : filteredHistory.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune modification trouvée</p>
        </Card>
      ) : isMobile ? (
        /* Mobile: Card view */
        <div className="space-y-3">
          {filteredHistory.map((entry) => (
            <Card key={entry.id} className={`p-4 ${entry.reverted ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {getActionIcon(entry.action)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{getActionLabel(entry.action)}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {getTableLabel(entry.table_name)}
                    </span>
                    {entry.reverted && (
                      <span className="text-xs text-orange-600 dark:text-orange-400">(annulé)</span>
                    )}
                  </div>
                  <p className="text-sm mt-1">
                    {entry.action === 'DELETE'
                      ? formatData(entry.old_data)
                      : formatData(entry.new_data)}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>
                      {entry.profile
                        ? entry.profile.display_name || entry.profile.email
                        : 'Système'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{formatDate(entry.changed_at)}</span>
                      {!entry.reverted && entry.action !== 'UPDATE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          onClick={() => setRevertTarget(entry)}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Desktop: Table view */
        <Card>
          <div className="overflow-auto max-h-[calc(100vh-320px)]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Données</TableHead>
                  <TableHead>Par</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((entry) => (
                  <TableRow key={entry.id} className={entry.reverted ? 'opacity-50' : ''}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(entry.changed_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(entry.action)}
                        <span>{getActionLabel(entry.action)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {getTableLabel(entry.table_name)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {entry.action === 'DELETE' ? (
                        <span className="text-muted-foreground">{formatData(entry.old_data)}</span>
                      ) : (
                        <span>{formatData(entry.new_data)}</span>
                      )}
                      {entry.reverted && (
                        <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">(annulé)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.profile ? (
                        <span className="text-sm">{entry.profile.display_name || entry.profile.email}</span>
                      ) : (
                        <span className="text-muted-foreground">Système</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!entry.reverted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                          onClick={() => setRevertTarget(entry)}
                          title="Annuler cette modification"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} sur {totalPages} — {totalCount} entrée{totalCount > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Info card */}
      <Card className="mt-6 p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <History className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium">À propos de l'historique</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Toutes les modifications sont automatiquement enregistrées. Utilisez le bouton <RotateCcw className="inline w-3 h-3" /> pour annuler une action.
            </p>
          </div>
        </div>
      </Card>

      {/* Dialog de confirmation du revert */}
      <AlertDialog open={!!revertTarget} onOpenChange={() => { setRevertTarget(null); setRevertReason(''); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette modification ?</AlertDialogTitle>
            <AlertDialogDescription>
              {revertTarget && (
                <span>
                  Cette action va <strong>annuler {getActionLabel(revertTarget.action).toLowerCase()}</strong> de{' '}
                  <strong>{formatData(revertTarget.new_data || revertTarget.old_data)}</strong> dans{' '}
                  {getTableLabel(revertTarget.table_name)}. L'action contraire sera appliquée immédiatement.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Raison de l'annulation (optionnel)..."
            value={revertReason}
            onChange={(e) => setRevertReason(e.target.value)}
            rows={2}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reverting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 text-white hover:bg-orange-700"
              disabled={reverting}
              onClick={handleRevert}
            >
              {reverting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default HistoryManager;
