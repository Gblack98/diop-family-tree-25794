import { useState, useMemo } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { archivesData, Archive } from "@/data/archivesData";
import { ArchiveHeader } from "@/components/Archives/ArchiveHeader";
import { ArchiveCard } from "@/components/Archives/ArchiveCard";
import { ArchiveDialog } from "@/components/Archives/ArchiveDialog";
import { EmptyState } from "@/components/Archives/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ArrowUpDown, Grid3x3, List, Download } from "lucide-react";
import { MobileBottomNav } from "@/components/FamilyTree/MobileBottomNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc" | "person-asc";
type ViewMode = "grid" | "list";

const Archives = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentTreeMode, setCurrentTreeMode] = useState<"tree" | "ancestors" | "descendants" | "path">("tree");

  const filteredAndSortedArchives = useMemo(() => {
    let filtered = archivesData.filter((archive) => {
      const matchesCategory = selectedCategory === "all" || archive.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchTerm.trim()) return true;

      const searchableContent = [
        archive.title,
        archive.person,
        archive.content,
        archive.fullContent || "",
        archive.date,
        ...(archive.achievements || [])
      ].join(" ");

      const normalizedContent = normalizeText(searchableContent);
      const searchKeywords = normalizeText(searchTerm).split(" ").filter(Boolean);

      return searchKeywords.every((keyword) => normalizedContent.includes(keyword));
    });

    // Sort archives
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return b.date.localeCompare(a.date);
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "person-asc":
          return a.person.localeCompare(b.person);
        default:
          return 0;
      }
    });

    return sorted;
  }, [selectedCategory, searchTerm, sortBy]);

  return (
    // CORRECTION ICI : h-dvh (hauteur écran) + overflow-y-auto (scroll autorisé) + pb-16 sur mobile pour bottom nav
    <div className="h-dvh w-full overflow-y-auto bg-background pb-0 sm:pb-0 pb-16">
      <ArchiveHeader 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <div className="max-w-xl mx-auto mb-6 relative group animate-in fade-in slide-in-from-top duration-500">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-violet-500 transition-colors" />
            <Input
              placeholder="Rechercher (ex: 'Médecin 1972', 'Gabar Dakar')..."
              className="pl-10 pr-10 bg-gradient-to-r from-violet-50/50 to-pink-50/50 dark:from-violet-950/50 dark:to-pink-950/50 border-violet-200/50 dark:border-violet-800/50 focus:bg-background focus:ring-2 focus:ring-violet-500/20 transition-all h-12 text-base shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-violet-500 p-1 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Effacer</span>
              </button>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center opacity-0 group-focus-within:opacity-100 transition-opacity">
            💡 Astuce : Vous pouvez combiner plusieurs mots (ex: nom + année)
          </div>
        </div>

        {/* Toolbar with sort and view options */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-in fade-in slide-in-from-top duration-500 delay-100">
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[200px] border-violet-200 dark:border-violet-800">
                <SelectValue placeholder="Trier par..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">📅 Plus récent</SelectItem>
                <SelectItem value="date-asc">📅 Plus ancien</SelectItem>
                <SelectItem value="name-asc">🔤 Titre A → Z</SelectItem>
                <SelectItem value="name-desc">🔤 Titre Z → A</SelectItem>
                <SelectItem value="person-asc">👤 Personne A → Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-violet-100 dark:bg-violet-900/30" : ""}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-violet-100 dark:bg-violet-900/30" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-violet-600 dark:text-violet-400">
              {filteredAndSortedArchives.length}
            </span>
            <span>archive{filteredAndSortedArchives.length > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className={viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pb-10"
          : "flex flex-col gap-4 pb-10"
        }>
          {filteredAndSortedArchives.map((archive, index) => (
            <Dialog key={archive.id}>
              <DialogTrigger asChild>
                <div className="h-full">
                  <ArchiveCard 
                    archive={archive} 
                    index={index} 
                    onClick={() => setSelectedArchive(archive)} 
                  />
                </div>
              </DialogTrigger>
              <ArchiveDialog archive={archive} />
            </Dialog>
          ))}
        </div>

        {filteredAndSortedArchives.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
             <EmptyState />
             {searchTerm && (
               <p className="mt-4 text-muted-foreground">
                 Aucun résultat pour "<span className="font-medium bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">{searchTerm}</span>".
               </p>
             )}
          </div>
        )}
      </main>

      <MobileBottomNav
        currentMode={currentTreeMode}
        onModeChange={(mode) => setCurrentTreeMode(mode as typeof currentTreeMode)}
      />
    </div>
  );
};

export default Archives;