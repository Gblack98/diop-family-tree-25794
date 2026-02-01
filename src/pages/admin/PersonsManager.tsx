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
import { Plus, Pencil, Trash2, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

    if (!confirm(`Supprimer ${name} ? Cette action est irréversible.`)) {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Gestion des personnes</h1>
                <p className="text-sm text-muted-foreground">
                  {persons.length} personnes • {filteredPersons.length} affichées
                </p>
              </div>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une personne
                </Button>
              </DialogTrigger>
              <DialogContent>
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
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

        {/* Table */}
        <Card>
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : filteredPersons.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Aucune personne trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
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
                        <DialogContent>
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
                          onClick={() => handleDelete(person.id, person.name)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
    </div>
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
  const [formData, setFormData] = useState({
    name: person?.name || '',
    genre: person?.genre || 'Homme',
    generation: person?.generation?.toString() || '0',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name.trim(),
        genre: formData.genre as 'Homme' | 'Femme',
        generation: parseInt(formData.generation),
      };

      if (person) {
        // Update
        const { error } = await supabase
          .from('persons')
          .update(data)
          .eq('id', person.id);

        if (error) throw error;

        toast({
          title: 'Succès',
          description: 'Personne modifiée',
        });
      } else {
        // Insert
        const { error } = await supabase.from('persons').insert(data);

        if (error) throw error;

        toast({
          title: 'Succès',
          description: 'Personne ajoutée',
        });
      }

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
          0 = Ancêtres racines, 1 = Première descendance, etc.
        </p>
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
