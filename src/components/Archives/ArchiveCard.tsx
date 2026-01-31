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
      className="group relative overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 hover:-translate-y-3 hover:scale-[1.02] bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-md border-border/50 hover:border-primary/60 animate-in fade-in slide-in-from-bottom-4"
      style={{
        animationDelay: `${index * 80}ms`,
        animationDuration: '700ms',
        animationFillMode: 'both'
      }}
    >
      {hasImage && archive.image && (
        <div className="aspect-video bg-gradient-to-br from-muted/50 via-muted/30 to-muted/20 overflow-hidden relative flex items-center justify-center">
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground animate-in fade-in zoom-in duration-300">
              <ImageOff className="w-10 h-10 mb-2 opacity-50" />
              <span className="text-xs">Image non disponible</span>
            </div>
          ) : (
            <img
              src={archive.image}
              alt={archive.title}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain group-hover:scale-110 transition-all duration-1000 ease-out group-hover:brightness-110"
            />
          )}
          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Icon avec effet glassmorphism */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
            <div className="backdrop-blur-md bg-white/20 dark:bg-black/20 rounded-full p-2 border border-white/30 shadow-lg">
              <ExternalLink className="w-4 h-4 text-white dark:text-white" />
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-6 space-y-3 relative">
        {/* Subtle background gradient that appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="flex items-start justify-between gap-2 relative z-10">
          <div className="flex-1 min-w-0 space-y-2">
            <Badge
              variant="secondary"
              className="text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-500 shadow-sm"
            >
              {archive.person}
            </Badge>
            <h3 className="font-bold text-base sm:text-lg leading-tight group-hover:text-primary transition-all duration-500 group-hover:translate-x-1">
              <HighlightedText text={archive.title} searchQuery={searchQuery} />
            </h3>
          </div>
          {archive.category === "quote" && (
            <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-primary/20 group-hover:text-primary/50 transition-all duration-700 flex-shrink-0 group-hover:rotate-12 group-hover:scale-110" />
          )}
        </div>

        <p className={`text-sm text-muted-foreground leading-relaxed relative z-10 transition-all duration-500 group-hover:text-foreground/80 ${
          archive.category === "quote" ? "italic font-medium" : "line-clamp-3"
        }`}>
          <HighlightedText text={archive.content} searchQuery={searchQuery} />
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border/30 group-hover:border-primary/20 transition-colors duration-500 relative z-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium group-hover:text-foreground/70 transition-colors duration-500">
            <Calendar className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-500" />
            <span>{archive.date}</span>
          </div>
          {isDownloadable && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 hover:bg-primary/10 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-primary/20"
              title="Télécharger"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              )}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
