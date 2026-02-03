import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, Pencil, Trash2, RotateCcw, History } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<ChangeHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  // Seuls les admins peuvent accéder à cette page
  if (!isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('change_history')
        .select(`
          *,
          profile:profiles(display_name, email)
        `)
        .order('changed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'historique',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((entry) => {
    const matchesTable = selectedTable === 'all' || entry.table_name === selectedTable;
    const matchesAction = selectedAction === 'all' || entry.action === selectedAction;
    return matchesTable && matchesAction;
  });

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
      case 'INSERT':
        return 'Ajout';
      case 'UPDATE':
        return 'Modification';
      case 'DELETE':
        return 'Suppression';
      default:
        return action;
    }
  };

  const getTableLabel = (table: string) => {
    switch (table) {
      case 'persons':
        return 'Personnes';
      case 'relationships':
        return 'Relations';
      case 'archives':
        return 'Archives';
      default:
        return table;
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
              <h1 className="text-2xl font-bold">Historique des modifications</h1>
              <p className="text-sm text-muted-foreground">
                {filteredHistory.length} entrée{filteredHistory.length > 1 ? 's' : ''} affichée{filteredHistory.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedTable} onValueChange={setSelectedTable}>
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

            <Select value={selectedAction} onValueChange={setSelectedAction}>
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

        {/* Table */}
        <Card>
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune modification trouvée</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[calc(100vh-320px)]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Données</TableHead>
                    <TableHead>Par</TableHead>
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
                          <span className="text-muted-foreground">
                            {formatData(entry.old_data)}
                          </span>
                        ) : (
                          <span>{formatData(entry.new_data)}</span>
                        )}
                        {entry.reverted && (
                          <span className="ml-2 text-xs text-muted-foreground">(annulé)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.profile ? (
                          <span className="text-sm">
                            {entry.profile.display_name || entry.profile.email}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Système</span>
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
            <History className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">À propos de l'historique</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Toutes les modifications sont automatiquement enregistrées pour permettre un suivi complet et la possibilité de revenir en arrière si nécessaire.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default HistoryManager;
