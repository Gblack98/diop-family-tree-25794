import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Pencil, Trash2, Search, ArrowLeft, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Archive {
  id: string;
  person_id: string | null;
  category: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  person?: {
    name: string;
  };
}

interface Person {
  id: string;
  name: string;
}

export const ArchivesManager = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const categories = [
    { value: 'biographie', label: 'Biographie' },
    { value: 'photo', label: 'Photo' },
    { value: 'document', label: 'Document' },
    { value: 'video', label: 'Vidéo' },
    { value: 'audio', label: 'Audio' },
    { value: 'autre', label: 'Autre' },
  ];

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      const { data, error } = await supabase
        .from('archives')
        .select(`
          *,
          person:persons(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArchives(data || []);
    } catch (error) {
      console.error('Error loading archives:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les archives',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredArchives = archives.filter((archive) => {
    const matchesSearch =
      archive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      archive.person?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || archive.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const usedCategories = Array.from(
    new Set(archives.map((a) => a.category))
  ).sort();

  const handleDelete = async (id: string, title: string) => {
    if (!isAdmin) {
      toast({
        title: 'Accès refusé',
        description: 'Seuls les administrateurs peuvent supprimer',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Supprimer "${title}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      // Supprimer l'image du storage si elle existe
      const archive = archives.find((a) => a.id === id);
      if (archive?.image_url) {
        const fileName = archive.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('family-images').remove([fileName]);
        }
      }

      const { error } = await supabase.from('archives').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `"${title}" a été supprimé`,
      });

      loadArchives();
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
                <h1 className="text-2xl font-bold">Gestion des archives</h1>
                <p className="text-sm text-muted-foreground">
                  {archives.length} archives • {filteredArchives.length} affichées
                </p>
              </div>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une archive
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter une archive</DialogTitle>
                </DialogHeader>
                <ArchiveForm
                  onSuccess={() => {
                    setIsAddDialogOpen(false);
                    loadArchives();
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
                placeholder="Rechercher par titre ou nom de personne..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
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
          ) : filteredArchives.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Aucune archive trouvée</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[calc(100vh-280px)]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Personne liée</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArchives.map((archive) => (
                    <TableRow key={archive.id}>
                      <TableCell>
                        {archive.image_url ? (
                          <img
                            src={archive.image_url}
                            alt={archive.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{archive.title}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {categories.find((c) => c.value === archive.category)?.label ||
                            archive.category}
                        </span>
                      </TableCell>
                      <TableCell>{archive.person?.name || '—'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Modifier {archive.title}</DialogTitle>
                            </DialogHeader>
                            <ArchiveForm archive={archive} onSuccess={loadArchives} />
                          </DialogContent>
                        </Dialog>

                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(archive.id, archive.title)}
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
          )}
        </Card>
      </main>
    </div>
  );
};

// Formulaire pour ajouter/modifier une archive
const ArchiveForm = ({
  archive,
  onSuccess,
}: {
  archive?: Archive;
  onSuccess: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [formData, setFormData] = useState({
    person_id: archive?.person_id || '',
    category: archive?.category || 'biographie',
    title: archive?.title || '',
    description: archive?.description || '',
    image_url: archive?.image_url || '',
  });

  const categories = [
    { value: 'biographie', label: 'Biographie' },
    { value: 'photo', label: 'Photo' },
    { value: 'document', label: 'Document' },
    { value: 'video', label: 'Vidéo' },
    { value: 'audio', label: 'Audio' },
    { value: 'autre', label: 'Autre' },
  ];

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      const { data, error } = await supabase
        .from('persons')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setPersons(data || []);
    } catch (error) {
      console.error('Error loading persons:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une image',
        variant: 'destructive',
      });
      return;
    }

    // Valider la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas dépasser 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('family-images')
        .upload(fileName, file);

      if (error) throw error;

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('family-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: urlData.publicUrl });

      toast({
        title: 'Succès',
        description: 'Image uploadée avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'upload',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        person_id: formData.person_id || null,
        category: formData.category,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        image_url: formData.image_url || null,
      };

      if (archive) {
        // Update
        const { error } = await supabase
          .from('archives')
          .update(data)
          .eq('id', archive.id);

        if (error) throw error;

        toast({
          title: 'Succès',
          description: 'Archive modifiée',
        });
      } else {
        // Insert
        const { error } = await supabase.from('archives').insert(data);

        if (error) throw error;

        toast({
          title: 'Succès',
          description: 'Archive ajoutée',
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
        <label className="text-sm font-medium">Titre</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Biographie de Gabar Diop"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Catégorie</label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Personne liée (optionnel)</label>
        <Select
          value={formData.person_id}
          onValueChange={(value) => setFormData({ ...formData, person_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Aucune personne" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Aucune personne</SelectItem>
            {persons.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description détaillée..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Image</label>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="flex-1"
          />
          {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>
        {formData.image_url && (
          <img
            src={formData.image_url}
            alt="Aperçu"
            className="mt-2 w-full max-w-sm h-48 object-cover rounded"
          />
        )}
        <p className="text-xs text-muted-foreground">
          Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading || uploading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : archive ? (
            'Modifier'
          ) : (
            'Ajouter'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ArchivesManager;
