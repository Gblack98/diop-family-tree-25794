import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ArchiveHeaderProps {
  archiveCount: number;
}

export const ArchiveHeader = ({ archiveCount }: ArchiveHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-xl border-b border-border/30 shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-left duration-500">
            <Link 
              to="/" 
              className="p-2 hover:bg-accent rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Archives Familiales
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Mémoire et héritage de la famille Diop
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="animate-in fade-in slide-in-from-right duration-500">
            {archiveCount} {archiveCount > 1 ? 'archives' : 'archive'}
          </Badge>
        </div>
      </div>
    </header>
  );
};
