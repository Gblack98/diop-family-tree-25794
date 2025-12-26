import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { archivesData, Archive } from "@/data/archivesData";
import { ArchiveHeader } from "@/components/Archives/ArchiveHeader";
import { ArchiveCard } from "@/components/Archives/ArchiveCard";
import { ArchiveDialog } from "@/components/Archives/ArchiveDialog";
import { EmptyState } from "@/components/Archives/EmptyState";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Pre-normalize all archive content once at module load
const normalizedArchives = archivesData.map(archive => ({
  ...archive,
  _normalizedContent: normalizeText([
    archive.title,
    archive.person,
    archive.content,
    archive.fullContent || "",
    archive.date,
    ...(archive.achievements || [])
  ].join(" "))
}));

const Archives = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const filteredArchives = useMemo(() => {
    return normalizedArchives.filter((archive) => {
      const matchesCategory = selectedCategory === "all" || archive.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!debouncedSearch.trim()) return true;

      const searchKeywords = normalizeText(debouncedSearch).split(" ").filter(Boolean);
      return searchKeywords.every((keyword) => archive._normalizedContent.includes(keyword));
    });
  }, [selectedCategory, debouncedSearch]);

  return (
    // CORRECTION ICI : h-dvh (hauteur écran) + overflow-y-auto (scroll autorisé)
    <div className="h-dvh w-full overflow-y-auto bg-background">
      <ArchiveHeader 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        <div className="max-w-xl mx-auto mb-8 relative group animate-in fade-in slide-in-from-top duration-500">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Rechercher (ex: 'Médecin 1972', 'Gabar Dakar')..."
              className="pl-10 pr-10 bg-muted/50 border-muted-foreground/20 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all h-12 text-base shadow-sm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Effacer</span>
              </button>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center opacity-0 group-focus-within:opacity-100 transition-opacity">
            Astuce : Vous pouvez combiner plusieurs mots (ex: nom + année)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pb-10">
          {filteredArchives.map((archive, index) => (
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

        {filteredArchives.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
             <EmptyState />
             {debouncedSearch && (
               <p className="mt-4 text-muted-foreground">
                 Aucun résultat pour "<span className="font-medium text-foreground">{debouncedSearch}</span>".
               </p>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Archives;