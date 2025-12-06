import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive } from "@/data/archivesData";
import { Network, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

  // Fonction pour naviguer vers l'arbre avec le paramètre focus
  const handleViewInTree = () => {
    navigate(`/?focus=${encodeURIComponent(archive.person)}`);
  };

  // Gestion unifiée des images (si 'images' existe, on l'utilise, sinon on fallback sur 'image')
  const displayImages = archive.images || (archive.image ? [archive.image] : []);

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]">
      <DialogDescription className="sr-only">
        Détails de l'archive de {archive.person}
      </DialogDescription>
      
      <DialogHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <DialogTitle className="text-2xl font-bold leading-tight">{archive.title}</DialogTitle>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {archive.person}
              </Badge>
              <span className="text-sm text-muted-foreground">• {archive.date}</span>
            </div>
          </div>
          
          {/* Bouton Desktop pour voir dans l'arbre */}
          <Button 
            onClick={handleViewInTree} 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex items-center gap-2 shrink-0 hover:bg-primary hover:text-white transition-colors"
          >
            <Network className="w-4 h-4" />
            Voir dans l'arbre
          </Button>
        </div>
      </DialogHeader>
      
      {/* Zone Média : Image unique ou Carrousel */}
      {displayImages.length > 0 && (
        <div className="mt-2 mb-4 w-full">
          {displayImages.length === 1 ? (
            <div className="aspect-video overflow-hidden rounded-lg border bg-muted shadow-sm">
              <img 
                src={displayImages[0]} 
                alt={archive.title}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <Carousel className="w-full relative group">
              <CarouselContent>
                {displayImages.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video overflow-hidden rounded-lg border bg-muted shadow-sm flex items-center justify-center relative">
                      <img 
                        src={img} 
                        alt={`${archive.title} - ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {index + 1} / {displayImages.length}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white" />
              <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white" />
            </Carousel>
          )}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-wrap">
            {archive.fullContent || archive.content}
          </p>
        </div>
        
        {archive.achievements && archive.achievements.length > 0 && (
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-primary" />
              Réalisations notables
            </h4>
            <ul className="space-y-2">
              {archive.achievements.map((achievement, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2.5">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bouton Mobile pour voir dans l'arbre (en bas) */}
        <Button 
            onClick={handleViewInTree} 
            className="w-full sm:hidden flex items-center justify-center gap-2 mt-4"
            size="lg"
        >
            <Network className="w-4 h-4" />
            Voir dans l'arbre généalogique
        </Button>
      </div>
    </DialogContent>
  );
};