import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive } from "@/data/archivesData";
import { Network, ExternalLink, Download, Loader2, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { downloadFile, generateFilename } from "@/lib/utils/downloadFile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ArchiveDialogProps {
  archive: Archive;
}

export const ArchiveDialog = ({ archive }: ArchiveDialogProps) => {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
  };

  // Fonction pour naviguer vers l'arbre avec le paramètre focus
  const handleViewInTree = () => {
    navigate(`/?focus=${encodeURIComponent(archive.person)}`);
  };

  // Gestion unifiée des images (si 'images' existe, on l'utilise, sinon on fallback sur 'image')
  const displayImages = archive.images || (archive.image ? [archive.image] : []);

  const isDownloadable = archive.category === "document" || archive.category === "article";

  const handleDownload = async () => {
    if (!archive.image) {
      console.warn('Aucune image/document disponible pour le téléchargement');
      return;
    }

    setIsDownloading(true);
    try {
      const extension = archive.image.split('.').pop() || 'pdf';
      const filename = generateFilename(archive.title, archive.date, extension);
      await downloadFile(archive.image, filename);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh] bg-gradient-to-br from-background via-background to-muted/20 border-border/50">
      <DialogDescription className="sr-only">
        Détails de l'archive de {archive.person}
      </DialogDescription>

      <DialogHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex-1">
            <DialogTitle className="text-2xl sm:text-3xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {archive.title}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 hover:scale-105 font-semibold">
                {archive.person}
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">• {archive.date}</span>
            </div>
          </div>

          {/* Boutons Desktop */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {isDownloadable && (
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="outline"
                size="sm"
                className="items-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-105"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Télécharger
              </Button>
            )}
            <Button
              onClick={handleViewInTree}
              variant="outline"
              size="sm"
              className="items-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            >
              <Network className="w-4 h-4" />
              Voir dans l'arbre
            </Button>
          </div>
        </div>
      </DialogHeader>
      
      {/* Zone Média : Image unique ou Carrousel */}
      {displayImages.length > 0 && (
        <div className="mt-4 mb-6 w-full animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: '100ms' }}>
          {displayImages.length === 1 ? (
            <div className="aspect-video overflow-hidden rounded-xl border-2 border-border/50 bg-gradient-to-br from-muted/50 to-muted/30 shadow-lg hover:shadow-xl transition-all duration-500 flex items-center justify-center group">
              {failedImages.has(0) ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <ImageOff className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm">Image non disponible</span>
                </div>
              ) : (
                <img
                  src={displayImages[0]}
                  alt={archive.title}
                  loading="eager"
                  decoding="async"
                  onError={() => handleImageError(0)}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                />
              )}
            </div>
          ) : (
            <Carousel className="w-full relative group">
              <CarouselContent>
                {displayImages.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video overflow-hidden rounded-xl border-2 border-border/50 bg-gradient-to-br from-muted/50 to-muted/30 shadow-lg flex items-center justify-center relative hover:shadow-xl transition-shadow duration-500">
                      {failedImages.has(index) ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <ImageOff className="w-12 h-12 mb-2 opacity-50" />
                          <span className="text-sm">Image non disponible</span>
                        </div>
                      ) : (
                        <img
                          src={img}
                          alt={`${archive.title} - ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          onError={() => handleImageError(index)}
                          className="w-full h-full object-contain"
                        />
                      )}
                      <div className="absolute bottom-3 right-3 backdrop-blur-md bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                        {index + 1} / {displayImages.length}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white" />
              <CarouselNext className="right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white" />
            </Carousel>
          )}
        </div>
      )}


      <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
            {archive.fullContent || archive.content}
          </p>
        </div>

        {archive.achievements && archive.achievements.length > 0 && (
          <div className="relative bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 p-5 sm:p-6 rounded-xl border-2 border-border/40 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-500">
            {/* Subtle background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <h4 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-500">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              Réalisations notables
            </h4>
            <ul className="space-y-3 relative z-10">
              {archive.achievements.map((achievement, i) => (
                <li key={i} className="text-sm sm:text-base text-muted-foreground flex items-start gap-3 group/item hover:text-foreground transition-colors duration-300">
                  <span className="text-primary mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0 group-hover/item:scale-125 transition-transform duration-300" />
                  <span className="leading-relaxed">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Boutons Mobile (en bas) */}
        <div className="sm:hidden flex flex-col gap-3 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
          {isDownloadable && (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
              size="lg"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Télécharger le document
            </Button>
          )}
          <Button
            onClick={handleViewInTree}
            className="w-full flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <Network className="w-4 h-4" />
            Voir dans l'arbre généalogique
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};