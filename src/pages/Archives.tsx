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
    <div className="min-h-dvh w-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        <ArchiveHeader
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          totalArchives={archivesData.length}
          filteredCount={filteredArchives.length}
        />

        <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        <div className="max-w-2xl mx-auto mb-10 relative group animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: '200ms' }}>
          <div className="relative">
            {/* Glow effect on focus */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />

            <div className="relative backdrop-blur-sm bg-card/50 rounded-xl border-2 border-border/40 group-focus-within:border-primary/50 transition-all duration-500 shadow-lg group-focus-within:shadow-xl group-focus-within:shadow-primary/10">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300" />
              <Input
                placeholder="Rechercher dans les archives (nom, année, mot-clé)..."
                className="pl-12 pr-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 text-base placeholder:text-muted-foreground/60"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted/80 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Effacer</span>
                </button>
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-3 text-center opacity-0 group-focus-within:opacity-100 transition-all duration-500 transform group-focus-within:translate-y-0 translate-y-2">
            💡 Astuce : Combinez plusieurs mots pour affiner votre recherche (ex: "Gabar 1947")
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-7 pb-16">
          {filteredArchives.map((archive, index) => (
            <Dialog key={archive.id}>
              <DialogTrigger asChild>
                <div className="h-full">
                  <ArchiveCard
                    archive={archive}
                    index={index}
                    onClick={() => setSelectedArchive(archive)}
                    searchQuery={debouncedSearch}
                  />
                </div>
              </DialogTrigger>
              <ArchiveDialog archive={archive} />
            </Dialog>
          ))}
        </div>

        {filteredArchives.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="animate-in fade-in zoom-in-50 duration-700 delay-100">
              <EmptyState />
            </div>
            {debouncedSearch && (
              <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <p className="text-muted-foreground text-lg">
                  Aucun résultat pour <span className="font-semibold text-foreground bg-muted px-2 py-1 rounded">{debouncedSearch}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Essayez avec d'autres termes ou catégories
                </p>
              </div>
            )}
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default Archives;