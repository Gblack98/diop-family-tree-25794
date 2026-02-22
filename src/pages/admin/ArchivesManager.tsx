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
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
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
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

interface Archive {
  id: string;
  person_id: string | null;
  category: string;
  title: string;
  content?: string;
  full_content?: string | null;
  date?: string;
  images?: string[] | null;
  achievements?: string[] | null;
  description?: string | null;
  image_url?: string | null;
  created_at: string;
  person?: { name: string } | null;
}

interface Person {
  id: string;
  name: string;
}

const CATEGORIES = [
  { value: 'biography', label: 'Biographie', icon: BookOpen, description: 'Histoire de vie détaillée' },
  { value: 'photo', label: 'Album Photos', icon: Camera, description: 'Collection de photos' },
  { value: 'article', label: 'Article', icon: FileText, description: 'Article ou récit' },
  { value: 'quote', label: 'Citation', icon: Quote, description: 'Paroles mémorables' },
  { value: 'video', label: 'Vidéo', icon: Film, description: 'Contenu vidéo' },
  { value: 'audio', label: 'Audio', icon: Music, description: 'Enregistrement audio' },
  { value: 'document', label: 'Document', icon: File, description: 'Document officiel' },
];

const normalizeArchive = (archive: any): Archive => {
  if (!archive) return {} as Archive;
  return {
    ...archive,
    id: archive.id || '',
    category: archive.category || 'document',
    title: archive.title || 'Sans titre',
    content: archive.content || archive.description || '',
    images: Array.isArray(archive.images) ? archive.images : (archive.image_url ? [archive.image_url] : []),
    date: archive.date || '',
    achievements: Array.isArray(archive.achievements) ? archive.achievements : [],
    full_content: archive.full_content || '',
    created_at: archive.created_at || new Date().toISOString(),
    person_id: archive.person_id || null,
    person: archive.person || null,
  };
};

export const ArchivesManager = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingArchive, setViewingArchive] = useState<Archive | null>(null);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('archives')
        .select(`*, person:persons(name)`)
        .order('created_at', { ascending: false });

      if (fetchError) { setError(fetchError.message); return; }
      setArchives((data || []).map(normalizeArchive));
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
      toast({ title: 'Erreur', description: 'Impossible de charger les archives', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredArchives = archives.filter((archive) => {
    const content = archive.content || archive.description || '';
    const matchesSearch =
      archive.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      archive.person?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || archive.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!isAdmin) {
      toast({ title: 'Accès refusé', description: 'Seuls les administrateurs peuvent supprimer', variant: 'destructive' });
      return;
    }
    try {
      const archive = archives.find((a) => a.id === id);
      const images = archive?.images || (archive?.image_url ? [archive.image_url] : []);
      if (images.length > 0) {
        const fileNames = images.map(url => url.split('/').pop()).filter(Boolean);
        if (fileNames.length > 0) await supabase.storage.from('family-images').remove(fileNames as string[]);
      }
      const { error } = await supabase.from('archives').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Succès', description: `"${title}" a été supprimé` });
      loadArchives();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Impossible de supprimer', variant: 'destructive' });
    }
    setDeleteTarget(null);
  };

  const getCategoryInfo = (category: string) =>
    CATEGORIES.find((c) => c.value === category) || CATEGORIES[CATEGORIES.length - 1];

  const getArchiveImages = (archive: Archive): string[] => {
    if (Array.isArray(archive.images) && archive.images.length > 0) {
      return archive.images.filter((img): img is string => typeof img === 'string');
    }
    if (typeof archive.image_url === 'string') return [archive.image_url];
    return [];
  };

  const getArchiveContent = (archive: Archive): string => {
    const content = archive.content || archive.description || '';
    return typeof content === 'string' ? content : '';
  };

  const addButton = (
    <Button size={isMobile ? 'sm' : 'default'} onClick={() => setIsAddDialogOpen(true)}>
      <Plus className="w-4 h-4 mr-2" />
      {isMobile ? 'Ajouter' : 'Nouvelle archive'}
    </Button>
  );

  return (
    <AdminLayout
      title="Gestion des archives"
      subtitle={`${archives.length} archive${archives.length > 1 ? 's' : ''}${filteredArchives.length !== archives.length ? ` • ${filteredArchives.length} affichée${filteredArchives.length > 1 ? 's' : ''}` : ''}`}
      headerAction={addButton}
    >
      {error && (
        <Card className="p-4 mb-4 border-destructive bg-destructive/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-destructive">Erreur de chargement</p>
              <p className="text-sm text-muted-foreground truncate">{error}</p>
              <Button variant="link" className="p-0 h-auto text-sm" onClick={loadArchives}>Réessayer</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredArchives.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            {archives.length === 0 ? 'Aucune archive trouvée' : 'Aucun résultat pour cette recherche'}
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une archive
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArchives.map((archive) => {
            const catInfo = getCategoryInfo(archive.category);
            const CatIcon = catInfo.icon;
            const images = getArchiveImages(archive);
            const content = getArchiveContent(archive);

            return (
              <Card key={archive.id} className="overflow-hidden hover:shadow-md transition-shadow">
                {images.length > 0 ? (
                  <div className="relative h-40 sm:h-48 bg-muted">
                    <img src={images[0]} alt={archive.title} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    {images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{images.length - 1} photos
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-28 sm:h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <CatIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary/50" />
                  </div>
                )}

                <div className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <CatIcon className="w-3 h-3" />{catInfo.label}
                    </span>
                    {archive.date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{archive.date}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">{archive.title}</h3>

                  {archive.person && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <User className="w-3 h-3" />{archive.person.name}
                    </p>
                  )}

                  {content && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{content}</p>}

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewingArchive(archive)}>
                      <Eye className="w-4 h-4 mr-1" />Voir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingArchive(archive)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" size="sm" onClick={() => setDeleteTarget({ id: archive.id, title: archive.title })}>
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

      {/* Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-full max-w-lg sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Créer une nouvelle archive</DialogTitle></DialogHeader>
          <ErrorBoundary>
            <ArchiveForm onSuccess={() => { setIsAddDialogOpen(false); loadArchives(); }} onCancel={() => setIsAddDialogOpen(false)} />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingArchive} onOpenChange={() => setViewingArchive(null)}>
        <DialogContent className="w-full max-w-lg sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <ErrorBoundary>
            {viewingArchive && <ArchiveViewer archive={viewingArchive} />}
          </ErrorBoundary>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingArchive} onOpenChange={() => setEditingArchive(null)}>
        <DialogContent className="w-full max-w-lg sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier l'archive</DialogTitle></DialogHeader>
          <ErrorBoundary>
            {editingArchive && (
              <ArchiveForm archive={editingArchive} onSuccess={() => { setEditingArchive(null); loadArchives(); }} onCancel={() => setEditingArchive(null)} />
            )}
          </ErrorBoundary>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer <strong>"{deleteTarget?.title}"</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id, deleteTarget.title)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

// Archive Viewer
const ArchiveViewer = ({ archive }: { archive: Archive }) => {
  if (!archive) {
    return <div className="p-4 text-muted-foreground">Archive non disponible</div>;
  }
  const catInfo = CATEGORIES.find((c) => c.value === archive.category) || CATEGORIES[0];
  const CatIcon = catInfo?.icon || FileText;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const images = (archive.images && archive.images.length > 0) 
    ? archive.images.filter((img): img is string => typeof img === 'string')
    : (archive.image_url ? [archive.image_url] : []);
  const content = archive.content || archive.description || '';
  const achievements = (archive.achievements && Array.isArray(archive.achievements)) 
    ? archive.achievements.filter((a): a is string => typeof a === 'string')
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-full bg-primary/10 flex-shrink-0">
          <CatIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold">{archive.title || 'Sans titre'}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{catInfo.label}</span>
            {archive.date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{archive.date}</span>}
            {archive.person && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{archive.person.name}</span>}
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2"><Camera className="w-4 h-4" />Photos ({images.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-muted" onClick={() => setSelectedImage(img)}>
                <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image</text></svg>'; }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {content && (
        <div className="space-y-2">
          <h3 className="font-medium">Description</h3>
          <div className={`prose prose-sm max-w-none ${archive.category === 'quote' ? 'text-xl italic border-l-4 border-primary pl-4' : ''}`}>{content}</div>
        </div>
      )}

      {archive.full_content && (
        <div className="space-y-2">
          <h3 className="font-medium">Contenu complet</h3>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">{archive.full_content}</div>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium flex items-center gap-2"><Award className="w-4 h-4" />Réalisations</h3>
          <ul className="space-y-2">
            {achievements.map((achievement, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2.5 bg-muted/30 rounded-lg">
                <Award className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span className="text-sm">{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setSelectedImage(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

// Archive Form
const ArchiveForm = ({ archive, onSuccess, onCancel }: { archive?: Archive; onSuccess: () => void; onCancel: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialImages = archive?.images || (archive?.image_url ? [archive.image_url] : []);
  const initialContent = archive?.content || archive?.description || '';

  const [formData, setFormData] = useState({
    person_id: archive?.person_id || 'none',
    category: archive?.category || 'biography',
    title: archive?.title || '',
    content: initialContent,
    full_content: archive?.full_content || '',
    date: archive?.date || '',
    images: initialImages as string[],
    achievements: (archive?.achievements || []) as string[],
  });
  const [newAchievement, setNewAchievement] = useState('');

  useEffect(() => { loadPersons(); }, []);

  const loadPersons = async () => {
    try {
      const { data, error } = await supabase.from('persons').select('id, name').order('name');
      if (error) throw error;
      setPersons(data || []);
    } catch (err: any) {
      console.error('Error loading persons:', err);
      toast({ title: 'Erreur', description: 'Impossible de charger la liste des personnes', variant: 'destructive' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) { toast({ title: 'Erreur', description: `${file.name} n'est pas une image`, variant: 'destructive' }); continue; }
        if (file.size > 5 * 1024 * 1024) { toast({ title: 'Erreur', description: `${file.name} dépasse 5MB`, variant: 'destructive' }); continue; }
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error } = await supabase.storage.from('family-images').upload(fileName, file);
        if (error) { toast({ title: 'Erreur upload', description: error.message, variant: 'destructive' }); continue; }
        try {
          const urlRes = supabase.storage.from('family-images').getPublicUrl(fileName);
          // getPublicUrl returns { data: { publicUrl } }
          const publicUrl = (urlRes as any)?.data?.publicUrl ?? (urlRes as any)?.publicUrl ?? '';
          if (publicUrl) {
            uploadedUrls.push(publicUrl);
          } else {
            toast({ title: 'Avertissement', description: `Impossible de générer l'URL pour ${file.name}`, variant: 'destructive' });
          }
        } catch (urlErr: any) {
          // eslint-disable-next-line no-console
          console.error('Error generating public URL:', urlErr);
          toast({ title: 'Erreur', description: 'Impossible de générer l\'URL pour la photo', variant: 'destructive' });
        }
      }
      if (uploadedUrls.length > 0) {
        setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
        toast({ title: 'Succès', description: `${uploadedUrls.length} image(s) uploadée(s)` });
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || "Erreur lors de l'upload", variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = async (urlToRemove: string) => {
    try {
      const fileName = urlToRemove.split('/').pop();
      if (fileName) await supabase.storage.from('family-images').remove([fileName]);
    } catch (err) {
      // ignore storage removal errors but log
      // eslint-disable-next-line no-console
      console.error('Error removing image from storage', err);
    }
    setFormData({ ...formData, images: formData.images.filter((url) => url !== urlToRemove) });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({ ...formData, achievements: [...formData.achievements, newAchievement.trim()] });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData({ ...formData, achievements: formData.achievements.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast({ title: 'Erreur', description: 'Le titre est requis', variant: 'destructive' }); return; }
    if (!formData.content.trim() && formData.category !== 'photo') { toast({ title: 'Erreur', description: 'Le contenu/description est requis', variant: 'destructive' }); return; }
    if (!formData.category) { toast({ title: 'Erreur', description: 'Le type d\'archive est requis', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const data: any = {
        person_id: formData.person_id === 'none' ? null : (formData.person_id || null),
        category: formData.category,
        title: formData.title.trim(),
        content: formData.content.trim(),
        full_content: formData.full_content.trim() || null,
        date: formData.date || null,
        images: formData.images.length > 0 ? formData.images : null,
        achievements: formData.achievements.length > 0 ? formData.achievements : null,
      };

      if (archive) {
        const { error } = await supabase.from('archives').update(data).eq('id', archive.id);
        if (error) {
          if (error.message.includes('column')) {
            const oldData = { person_id: formData.person_id === 'none' ? null : (formData.person_id || null), category: formData.category, title: formData.title.trim(), description: formData.content.trim(), image_url: formData.images[0] || null };
            const { error: oldError } = await supabase.from('archives').update(oldData).eq('id', archive.id);
            if (oldError) throw oldError;
          } else throw error;
        }
        toast({ title: 'Succès', description: 'Archive modifiée' });
      } else {
        const { error } = await supabase.from('archives').insert(data);
        if (error) {
          if (error.message.includes('column')) {
            const oldData = { person_id: formData.person_id === 'none' ? null : (formData.person_id || null), category: formData.category, title: formData.title.trim(), description: formData.content.trim(), image_url: formData.images[0] || null };
            const { error: oldError } = await supabase.from('archives').insert(oldData);
            if (oldError) throw oldError;
          } else throw error;
        }
        toast({ title: 'Succès', description: 'Archive créée' });
      }
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Une erreur est survenue', variant: 'destructive' });
      // eslint-disable-next-line no-console
      console.error('Archive submit error:', error);
    } finally { setLoading(false); }
  };

  const catInfo = CATEGORIES.find((c) => c.value === formData.category) || CATEGORIES[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">Type d'archive</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = formData.category === cat.value;
            return (
              <button key={cat.value} type="button" onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-all ${isSelected ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50'}`}>
                <CatIcon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${isSelected ? 'text-primary' : ''}`}>{cat.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{catInfo.description}</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Titre *</label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Titre de l'archive" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date <span className="text-muted-foreground font-normal">(optionnel)</span></label>
          <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Personne liée</label>
          <Select value={formData.person_id} onValueChange={(value) => setFormData({ ...formData, person_id: value })}>
            <SelectTrigger><SelectValue placeholder="Aucune personne" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune personne</SelectItem>
              {persons.map((person) => <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {formData.category === 'quote' ? 'Citation *' : formData.category === 'photo' ? 'Description / Légende' : 'Description / Résumé *'}
          {formData.category === 'photo' && <span className="text-muted-foreground font-normal"> (optionnel)</span>}
        </label>
        <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder={formData.category === 'quote' ? 'La citation exacte...' : formData.category === 'photo' ? 'Légende ou description des photos...' : "Description de l'archive..."} rows={4}
          className={formData.category === 'quote' ? 'text-lg italic' : ''} />
      </div>

      {(formData.category === 'biography' || formData.category === 'article') && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Contenu complet (optionnel)</label>
          <Textarea value={formData.full_content} onChange={(e) => setFormData({ ...formData, full_content: e.target.value })} placeholder="Texte complet..." rows={8} />
        </div>
      )}

      <div className="space-y-3">
        <label className="text-sm font-medium">Images</label>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Upload...</> : <><Upload className="w-4 h-4 mr-2" />Ajouter des images</>}
          </Button>
          <span className="text-sm text-muted-foreground">{formData.images.length} image(s)</span>
        </div>
        {formData.images.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {formData.images.map((url, idx) => (
              <div key={idx} className="relative group aspect-square">
                <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f0f0f0" width="100" height="100"/></svg>'; }} />
                <button type="button" onClick={() => removeImage(url)} className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {formData.category === 'biography' && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Réalisations</label>
          <div className="flex gap-2">
            <Input value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} placeholder="Ex: Fondateur de l'école du village"
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAchievement(); } }} />
            <Button type="button" variant="outline" onClick={addAchievement}><Plus className="w-4 h-4" /></Button>
          </div>
          {formData.achievements.length > 0 && (
            <div className="space-y-2">
              {formData.achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Award className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="flex-1 text-sm">{achievement}</span>
                  <button type="button" onClick={() => removeAchievement(idx)} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={loading || uploading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : archive ? 'Enregistrer' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default ArchivesManager;
