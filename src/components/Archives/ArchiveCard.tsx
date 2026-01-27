import { Download, Quote, ExternalLink, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive } from "@/data/archivesData";

interface ArchiveCardProps {
  archive: Archive;
  index: number;
  onClick: () => void;
}

export const ArchiveCard = ({ archive, index, onClick }: ArchiveCardProps) => {
  const hasImage = archive.category === "photo" || archive.category === "document" || archive.category === "article";
  const isDownloadable = archive.category === "document" || archive.category === "article";

  return (
    <Card 
      onClick={onClick}
      className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/40 hover:border-primary/50 animate-in fade-in slide-in-from-bottom"
      style={{ animationDelay: `${index * 100}ms`, animationDuration: '600ms' }}
    >
      {hasImage && archive.image && (
        <div className="aspect-video bg-gradient-to-br from-muted/40 to-muted/20 overflow-hidden relative flex items-center justify-center">
          <img
            src={archive.image}
            alt={archive.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
          />
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
              {archive.title}
            </h3>
          </div>
          {archive.category === "quote" && (
            <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-primary/20 group-hover:text-primary/40 transition-all duration-300 flex-shrink-0 group-hover:rotate-12" />
          )}
        </div>
        
        <p className={`text-sm text-muted-foreground leading-relaxed ${
          archive.category === "quote" ? "italic" : "line-clamp-3"
        }`}>
          {archive.content}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{archive.date}</span>
          </div>
          {isDownloadable && (
            <button 
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 hover:bg-accent rounded-lg transition-all hover:scale-110 active:scale-95"
            >
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
