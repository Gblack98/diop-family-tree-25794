import { useState } from "react";
import { Download, Quote, ExternalLink, Calendar, Loader2, ImageOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive } from "@/data/archivesData";
import { downloadFile, generateFilename } from "@/lib/utils/downloadFile";
import { HighlightedText } from "./HighlightedText";

interface ArchiveCardProps {
  archive: Archive;
  index: number;
  onClick: () => void;
  searchQuery?: string;
}

export const ArchiveCard = ({ archive, index, onClick, searchQuery = "" }: ArchiveCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasImage = archive.category === "photo" || archive.category === "document" || archive.category === "article";
  const isDownloadable = archive.category === "document" || archive.category === "article";

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

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
    <Card 
      onClick={onClick}
      className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/40 hover:border-primary/50 animate-in fade-in slide-in-from-bottom"
      style={{ animationDelay: `${index * 100}ms`, animationDuration: '600ms' }}
    >
      {hasImage && archive.image && (
        <div className="aspect-video bg-gradient-to-br from-muted/40 to-muted/20 overflow-hidden relative flex items-center justify-center">
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ImageOff className="w-10 h-10 mb-2 opacity-50" />
              <span className="text-xs">Image non disponible</span>
            </div>
          ) : (
            <img
              src={archive.image}
              alt={archive.title}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <ExternalLink className="absolute top-3 right-3 w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
        </div>
      )}
      
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            <Badge 
              variant="secondary" 
              className="text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
            >
              {archive.person}
            </Badge>
            <h3 className="font-bold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors duration-300">
              <HighlightedText text={archive.title} searchQuery={searchQuery} />
            </h3>
          </div>
          {archive.category === "quote" && (
            <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-primary/20 group-hover:text-primary/40 transition-all duration-300 flex-shrink-0 group-hover:rotate-12" />
          )}
        </div>
        
        <p className={`text-sm text-muted-foreground leading-relaxed ${
          archive.category === "quote" ? "italic" : "line-clamp-3"
        }`}>
          <HighlightedText text={archive.content} searchQuery={searchQuery} />
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{archive.date}</span>
          </div>
          {isDownloadable && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-1.5 hover:bg-accent rounded-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Télécharger"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
