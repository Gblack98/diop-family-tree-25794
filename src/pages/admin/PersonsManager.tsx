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
import { Plus, Pencil, Trash2, Search, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';

interface Person {
  id: string;
  name: string;
  genre: 'Homme' | 'Femme';
  generation: number;
  created_at: string;
}

export const PersonsManager = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      const { data, error } = await supabase
        .from('persons')
        .select('*')
        .order('name');

      if (error) throw error;
      setPersons(data || []);
    } catch (error) {
      console.error('Error loading persons:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les personnes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPersons = persons.filter((person) => {
    const matchesSearch = person.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGeneration =
      selectedGeneration === 'all' ||
      person.generation === parseInt(selectedGeneration);
    return matchesSearch && matchesGeneration;
  });

  const generations = Array.from(
    new Set(persons.map((p) => p.generation))
  ).sort((a, b) => a - b);

  const handleDelete = async (id: string, name: string) => {
    if (!isAdmin) {
      toast({
        title: 'Accès refusé',
        description: 'Seuls les administrateurs peuvent supprimer',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('persons').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Succès',
        description: `${name} a été supprimé`,
      });

      loadPersons();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer',
        variant: 'destructive',
      });
    }
    setDeleteTarget(null);
  };

  const addButton = (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button size={isMobile ? 'sm' : 'default'}>
          <Plus className="w-4 h-4 mr-2" />
          {isMobile ? 'Ajouter' : 'Ajouter une personne'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter une personne</DialogTitle>
        </DialogHeader>
        <PersonForm
          onSuccess={() => {
            setIsAddDialogOpen(false);
            loadPersons();
          }}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout
      title="Gestion des personnes"
      subtitle={`${persons.length} personnes${filteredPersons.length !== persons.length ? ` • ${filteredPersons.length} affichées` : ''}`}
      headerAction={addButton}
    >
      {/* Filters */}
      <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedGeneration} onValueChange={setSelectedGeneration}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Génération" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes générations</SelectItem>
              {generations.map((gen) => (
                <SelectItem key={gen} value={gen.toString()}>
                  Génération {gen}
                </SelectItem>
              ))}
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
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-8 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : filteredPersons.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune personne trouvée</p>
        </Card>
      ) : isMobile ? (
        /* Mobile: Card view */
        <div className="space-y-3">
          {filteredPersons.map((person) => (
            <Card key={person.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{person.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        person.genre === 'Homme'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                      }`}
                    >
                      {person.genre}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Gén. {person.generation}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Modifier {person.name}</DialogTitle>
                      </DialogHeader>
                      <PersonForm person={person} onSuccess={loadPersons} />
                    </DialogContent>
                  </Dialog>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteTarget({ id: person.id, name: person.name })}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Desktop: Table view */
        <Card>
          <div className="overflow-auto max-h-[calc(100vh-280px)]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Génération</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPersons.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          person.genre === 'Homme'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                        }`}
                      >
                        {person.genre}
                      </span>
                    </TableCell>
                    <TableCell>{person.generation}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Modifier {person.name}</DialogTitle>
                          </DialogHeader>
                          <PersonForm person={person} onSuccess={loadPersons} />
                        </DialogContent>
                      </Dialog>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget({ id: person.id, name: person.name })}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible et supprimera également toutes les relations associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id, deleteTarget.name)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

// Formulaire pour ajouter/modifier une personne
const PersonForm = ({
  person,
  onSuccess,
}: {
  person?: Person;
  onSuccess: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [allPersons, setAllPersons] = useState<Option[]>([]);
  const [formData, setFormData] = useState({
    name: person?.name || '',
    genre: person?.genre || 'Homme',
    generation: person?.generation?.toString() || '0',
    parents: [] as string[],
    children: [] as string[],
  });

  useEffect(() => {
    loadPersonsAndRelations();
  }, []);

  const loadPersonsAndRelations = async () => {
    try {
      const { data: persons, error: personsError } = await supabase
        .from('persons')
        .select('id, name')
        .order('name');

      if (personsError) throw personsError;

      const options: Option[] = (persons || [])
        .filter((p) => p.id !== person?.id)
        .map((p) => ({ value: p.id, label: p.name }));

      setAllPersons(options);

      if (person) {
        const { data: parentRels, error: parentError } = await supabase
          .from('relationships')
          .select('parent_id')
          .eq('child_id', person.id);

        const { data: childRels, error: childError } = await supabase
          .from('relationships')
          .select('child_id')
          .eq('parent_id', person.id);

        if (parentError) throw parentError;
        if (childError) throw childError;

        setFormData((prev) => ({
          ...prev,
          parents: (parentRels || []).map((r) => r.parent_id),
          children: (childRels || []).map((r) => r.child_id),
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.parents.length > 2) {
        toast({
          title: 'Erreur',
          description: 'Une personne ne peut avoir que 2 parents maximum',
          variant: 'destructive',
        });
        return;
      }

      const personData = {
        name: formData.name.trim(),
        genre: formData.genre as 'Homme' | 'Femme',
        generation: parseInt(formData.generation),
      };

      let personId: string;

      if (person) {
        const { error } = await supabase
          .from('persons')
          .update(personData)
          .eq('id', person.id);

        if (error) throw error;
        personId = person.id;
      } else {
        const { data, error } = await supabase
          .from('persons')
          .insert(personData)
          .select('id')
          .single();

        if (error) throw error;
        personId = data.id;
      }

      if (person) {
        await supabase.from('relationships').delete().eq('child_id', person.id);
        await supabase.from('relationships').delete().eq('parent_id', person.id);
      }

      if (formData.parents.length > 0) {
        const parentRelations = formData.parents.map((parentId) => ({
          parent_id: parentId,
          child_id: personId,
        }));

        const { error: parentError } = await supabase
          .from('relationships')
          .insert(parentRelations);

        if (parentError) throw parentError;
      }

      if (formData.children.length > 0) {
        const childRelations = formData.children.map((childId) => ({
          parent_id: personId,
          child_id: childId,
        }));

        const { error: childError } = await supabase
          .from('relationships')
          .insert(childRelations);

        if (childError) throw childError;
      }

      toast({
        title: 'Succès',
        description: person ? 'Personne modifiée avec succès' : 'Personne ajoutée avec succès',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nom complet</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Ibrahima Gabar Diop"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Genre</label>
          <Select
            value={formData.genre}
            onValueChange={(value) => setFormData({ ...formData, genre: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Homme">Homme</SelectItem>
              <SelectItem value="Femme">Femme</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Génération</label>
          <Input
            type="number"
            min="0"
            max="20"
            value={formData.generation}
            onChange={(e) =>
              setFormData({ ...formData, generation: e.target.value })
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            0 = Ancêtres racines
          </p>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-semibold mb-3">Relations familiales</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Parents (max 2)</label>
            <MultiSelect
              options={allPersons}
              selected={formData.parents}
              onChange={(parents) => setFormData({ ...formData, parents })}
              placeholder="Sélectionner les parents..."
              maxSelected={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Enfants</label>
            <MultiSelect
              options={allPersons}
              selected={formData.children}
              onChange={(children) => setFormData({ ...formData, children })}
              placeholder="Sélectionner les enfants..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : person ? (
            'Modifier'
          ) : (
            'Ajouter'
          )}
        </Button>
      </div>
    </form>
  );
};

export default PersonsManager;
