import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { archiveCategories } from "@/data/archivesData";

interface ArchiveHeaderProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  totalArchives: number;
  filteredCount: number;
}

export const ArchiveHeader = ({ selectedCategory, onCategoryChange, totalArchives, filteredCount }: ArchiveHeaderProps) => {
  const showingFiltered = filteredCount !== totalArchives;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          {/* Logo et titre */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">
                Archives Familiales
              </h1>
              <p className="text-xs text-muted-foreground">
                {showingFiltered ? (
                  <>
                    <span className="font-semibold text-primary">{filteredCount}</span> sur {totalArchives} archives
                  </>
                ) : (
                  <>{totalArchives} archives • Famille Diop</>
                )}
              </p>
            </div>
          </Link>

          {/* Navigation moderne */}
          <nav className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
            {archiveCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.value;
              return (
                <Button
                  key={cat.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => onCategoryChange(cat.value)}
                  className={cn(
                    "rounded-full gap-2 transition-all",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-medium">
                    {cat.label}
                  </span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
