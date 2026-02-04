import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
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
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  FileText,
  Quote,
  BookOpen,
  Camera,
  Film,
  Music,
  File,
  Calendar,
  User,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Archive {
  id: string;
  person_id: string | null;
  category: string;
  title: string;
  content: string;
  full_content: string | null;
  date: string;
  images: string[] | null;
  achievements: string[] | null;
  created_at: string;
  person?: {
    name: string;
  };
}

interface Person {
  id: string;
  name: string;
}

const CATEGORIES = [
  { value: 'biographie', label: 'Biographie', icon: BookOpen, description: 'Histoire de vie détaillée' },
  { value: 'photo', label: 'Album Photos', icon: Camera, description: 'Collection de photos' },
  { value: 'article', label: 'Article', icon: FileText, description: 'Article ou récit' },
  { value: 'citation', label: 'Citation', icon: Quote, description: 'Paroles mémorables' },
  { value: 'video', label: 'Vidéo', icon: Film, description: 'Contenu vidéo' },
  { value: 'audio', label: 'Audio', icon: Music, description: 'Enregistrement audio' },
  { value: 'document', label: 'Document', icon: File, description: 'Document officiel' },
];

export const ArchivesManager = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingArchive, setViewingArchive] = useState<Archive | null>(null);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);

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
      archive.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      archive.person?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || archive.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      const archive = archives.find((a) => a.id === id);

      // Supprimer les images du storage
      if (archive?.images && archive.images.length > 0) {
        const fileNames = archive.images.map(url => url.split('/').pop()).filter(Boolean);
        if (fileNames.length > 0) {
          await supabase.storage.from('family-images').remove(fileNames as string[]);
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

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find((c) => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
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
                  Nouvelle archive
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle archive</DialogTitle>
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
                placeholder="Rechercher par titre, contenu ou personne..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Archives Grid */}
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : filteredArchives.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune archive trouvée</p>
            <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer la première archive
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArchives.map((archive) => {
              const catInfo = getCategoryInfo(archive.category);
              const CatIcon = catInfo.icon;

              return (
                <Card key={archive.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image preview */}
                  {archive.images && archive.images.length > 0 ? (
                    <div className="relative h-48 bg-muted">
                      <img
                        src={archive.images[0]}
                        alt={archive.title}
                        className="w-full h-full object-cover"
                      />
                      {archive.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          +{archive.images.length - 1} photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <CatIcon className="w-12 h-12 text-primary/50" />
                    </div>
                  )}

                  <div className="p-4">
                    {/* Category badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <CatIcon className="w-3 h-3" />
                        {catInfo.label}
                      </span>
                      {archive.date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {archive.date}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{archive.title}</h3>

                    {/* Person */}
                    {archive.person && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                        <User className="w-3 h-3" />
                        {archive.person.name}
                      </p>
                    )}

                    {/* Content preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {archive.content}
                    </p>

                    {/* Achievements preview */}
                    {archive.achievements && archive.achievements.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                        <Award className="w-3 h-3" />
                        {archive.achievements.length} réalisation{archive.achievements.length > 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setViewingArchive(archive)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingArchive(archive)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(archive.id, archive.title)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* View Dialog */}
      <Dialog open={!!viewingArchive} onOpenChange={() => setViewingArchive(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingArchive && (
            <ArchiveViewer archive={viewingArchive} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingArchive} onOpenChange={() => setEditingArchive(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier {editingArchive?.title}</DialogTitle>
          </DialogHeader>
          {editingArchive && (
            <ArchiveForm
              archive={editingArchive}
              onSuccess={() => {
                setEditingArchive(null);
                loadArchives();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Visualiseur d'archive
const ArchiveViewer = ({ archive }: { archive: Archive }) => {
  const catInfo = CATEGORIES.find((c) => c.value === archive.category) || CATEGORIES[0];
  const CatIcon = catInfo.icon;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <CatIcon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{archive.title}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {catInfo.label}
            </span>
            {archive.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {archive.date}
              </span>
            )}
            {archive.person && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {archive.person.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      {archive.images && archive.images.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Photos ({archive.images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {archive.images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <h3 className="font-medium">Description</h3>
        <div className={`prose prose-sm max-w-none ${archive.category === 'citation' ? 'text-xl italic border-l-4 border-primary pl-4' : ''}`}>
          {archive.content}
        </div>
      </div>

      {/* Full Content */}
      {archive.full_content && (
        <div className="space-y-3">
          <h3 className="font-medium">Contenu complet</h3>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
            {archive.full_content}
          </div>
        </div>
      )}

      {/* Achievements */}
      {archive.achievements && archive.achievements.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Award className="w-4 h-4" />
            Réalisations
          </h3>
          <ul className="space-y-2">
            {archive.achievements.map((achievement, idx) => (
              <li key={idx} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                <Award className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Fullscreen"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    person_id: archive?.person_id || '',
    category: archive?.category || 'biographie',
    title: archive?.title || '',
    content: archive?.content || '',
    full_content: archive?.full_content || '',
    date: archive?.date || new Date().toISOString().split('T')[0],
    images: archive?.images || [] as string[],
    achievements: archive?.achievements || [] as string[],
  });

  const [newAchievement, setNewAchievement] = useState('');

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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Valider le type de fichier
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Erreur',
            description: `${file.name} n'est pas une image`,
            variant: 'destructive',
          });
          continue;
        }

        // Valider la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'Erreur',
            description: `${file.name} dépasse 5MB`,
            variant: 'destructive',
          });
          continue;
        }

        // Générer un nom de fichier unique
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload vers Supabase Storage
        const { error } = await supabase.storage
          .from('family-images')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          continue;
        }

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('family-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setFormData({
          ...formData,
          images: [...formData.images, ...uploadedUrls],
        });

        toast({
          title: 'Succès',
          description: `${uploadedUrls.length} image(s) uploadée(s)`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || "Erreur lors de l'upload",
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (urlToRemove: string) => {
    // Supprimer du storage
    const fileName = urlToRemove.split('/').pop();
    if (fileName) {
      await supabase.storage.from('family-images').remove([fileName]);
    }

    setFormData({
      ...formData,
      images: formData.images.filter((url) => url !== urlToRemove),
    });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, newAchievement.trim()],
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        person_id: formData.person_id || null,
        category: formData.category,
        title: formData.title.trim(),
        content: formData.content.trim(),
        full_content: formData.full_content.trim() || null,
        date: formData.date,
        images: formData.images.length > 0 ? formData.images : null,
        achievements: formData.achievements.length > 0 ? formData.achievements : null,
      };

      if (!data.content) {
        toast({
          title: 'Erreur',
          description: 'Le contenu est requis',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (archive) {
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
        const { error } = await supabase.from('archives').insert(data);

        if (error) throw error;

        toast({
          title: 'Succès',
          description: 'Archive créée',
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

  const catInfo = CATEGORIES.find((c) => c.value === formData.category) || CATEGORIES[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type d'archive</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = formData.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <CatIcon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${isSelected ? 'text-primary' : ''}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{catInfo.description}</p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Titre *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={
            formData.category === 'biographie'
              ? 'Ex: Biographie de Gabar Diop'
              : formData.category === 'photo'
              ? 'Ex: Album de mariage 1985'
              : formData.category === 'citation'
              ? 'Ex: Paroles de sagesse'
              : 'Titre de l\'archive'
          }
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        {/* Person */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Personne liée</label>
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
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {formData.category === 'citation' ? 'Citation *' : 'Description / Résumé *'}
        </label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder={
            formData.category === 'citation'
              ? 'La citation exacte...'
              : formData.category === 'biographie'
              ? 'Résumé de la vie et des accomplissements...'
              : 'Description de l\'archive...'
          }
          rows={formData.category === 'citation' ? 3 : 4}
          className={formData.category === 'citation' ? 'text-lg italic' : ''}
          required
        />
      </div>

      {/* Full Content (for biographies and articles) */}
      {(formData.category === 'biographie' || formData.category === 'article') && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Contenu complet</label>
          <Textarea
            value={formData.full_content}
            onChange={(e) => setFormData({ ...formData, full_content: e.target.value })}
            placeholder="Texte complet de la biographie ou de l'article..."
            rows={10}
          />
          <p className="text-xs text-muted-foreground">
            Vous pouvez écrire un texte long avec des paragraphes
          </p>
        </div>
      )}

      {/* Images Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          {formData.category === 'photo' ? 'Photos de l\'album' : 'Images'}
        </label>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {formData.category === 'photo' ? 'Ajouter des photos' : 'Ajouter une image'}
              </>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            {formData.images.length} image(s)
          </span>
        </div>

        {/* Image preview grid */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {formData.images.map((url, idx) => (
              <div key={idx} className="relative group aspect-square">
                <img
                  src={url}
                  alt={`Image ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Formats: JPG, PNG, GIF. Max 5MB par image.
        </p>
      </div>

      {/* Achievements (for biographies) */}
      {formData.category === 'biographie' && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Réalisations / Accomplissements</label>

          <div className="flex gap-2">
            <Input
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              placeholder="Ex: Fondateur de l'école du village"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAchievement();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addAchievement}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.achievements.length > 0 && (
            <div className="space-y-2">
              {formData.achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                >
                  <Award className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="flex-1 text-sm">{achievement}</span>
                  <button
                    type="button"
                    onClick={() => removeAchievement(idx)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="submit" disabled={loading || uploading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : archive ? (
            'Enregistrer les modifications'
          ) : (
            'Créer l\'archive'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ArchivesManager;
