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

  // Category-based gradient colors (modern violet/pink theme)
  const getCategoryGradient = () => {
    switch (archive.category) {
      case "photo":
        return "from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/50";
      case "biography":
        return "from-violet-500/10 to-indigo-500/10 border-violet-500/20 hover:border-violet-500/50";
      case "document":
        return "from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/50";
      case "quote":
        return "from-pink-500/10 to-rose-500/10 border-pink-500/20 hover:border-pink-500/50";
      case "article":
        return "from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:border-indigo-500/50";
      default:
        return "from-violet-500/10 to-pink-500/10 border-violet-500/20 hover:border-violet-500/50";
    }
  };

  return (
    <Card
      onClick={onClick}
      className={`group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br ${getCategoryGradient()} backdrop-blur-sm animate-in fade-in slide-in-from-bottom`}
      style={{ animationDelay: `${index * 100}ms`, animationDuration: '600ms' }}
    >
      {hasImage && (archive.image || archive.images?.[0]) && (
        <div className="aspect-video bg-gradient-to-br from-violet-100/50 to-pink-100/50 dark:from-violet-950/50 dark:to-pink-950/50 overflow-hidden relative">
          <img
            src={archive.image || archive.images?.[0]}
            alt={archive.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <ExternalLink className="absolute top-3 right-3 w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 drop-shadow-lg" />
          {archive.images && archive.images.length > 1 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
              📷 {archive.images.length}
            </div>
          )}
        </div>
      )}

      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            <Badge
              variant="secondary"
              className="text-xs bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0 group-hover:shadow-lg transition-all duration-300"
            >
              {archive.person}
            </Badge>
            <h3 className="font-bold text-base sm:text-lg leading-tight bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent group-hover:from-violet-500 group-hover:to-pink-500 transition-all duration-300">
              {archive.title}
            </h3>
          </div>
          {archive.category === "quote" && (
            <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400/30 group-hover:text-pink-400/60 transition-all duration-300 flex-shrink-0 group-hover:rotate-12" />
          )}
        </div>

        <p className={`text-sm text-muted-foreground leading-relaxed ${
          archive.category === "quote" ? "italic" : "line-clamp-3"
        }`}>
          {archive.content}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-violet-200/30 dark:border-violet-800/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Calendar className="w-3.5 h-3.5 text-violet-500" />
            <span>{archive.date}</span>
          </div>
          {isDownloadable && (
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg transition-all hover:scale-110 active:scale-95"
            >
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-violet-500 transition-colors" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
