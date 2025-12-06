import { useState, useMemo } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { archivesData, Archive } from "@/data/archivesData";
import { ArchiveHeader } from "@/components/Archives/ArchiveHeader";
import { ArchiveCard } from "@/components/Archives/ArchiveCard";
import { ArchiveDialog } from "@/components/Archives/ArchiveDialog";
import { EmptyState } from "@/components/Archives/EmptyState";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

// Fonction utilitaire pour normaliser le texte (minuscules + sans accents)
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Supprime les diacritiques (accents)
};

const Archives = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Logique de recherche intelligente
  const filteredArchives = useMemo(() => {
    return archivesData.filter((archive) => {
      // 1. Filtrage par catégorie
      const matchesCategory = selectedCategory === "all" || archive.category === selectedCategory;
      if (!matchesCategory) return false;

      // 2. Si pas de recherche, on garde tout
      if (!searchTerm.trim()) return true;

      // 3. Préparation des données pour la recherche (On concatène tout ce qui est cherchable)
      const searchableContent = [
        archive.title,
        archive.person,
        archive.content,
        archive.fullContent || "",
        archive.date,
        ...(archive.achievements || [])
      ].join(" ");

      const normalizedContent = normalizeText(searchableContent);
      
      // 4. Découpage de la recherche en mots-clés (ex: "Diop 1965" -> ["diop", "1965"])
      const searchKeywords = normalizeText(searchTerm).split(" ").filter(Boolean);

      // 5. Vérifie si TOUS les mots-clés sont présents dans le contenu
      // (ET logique : il faut trouver "Diop" ET "1965")
      return searchKeywords.every((keyword) => normalizedContent.includes(keyword));
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <ArchiveHeader 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Barre de Recherche Améliorée */}
        <div className="max-w-xl mx-auto mb-8 relative group animate-in fade-in slide-in-from-top duration-500">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Rechercher (ex: 'Médecin 1972', 'Gabar Dakar')..." 
              className="pl-10 pr-10 bg-muted/50 border-muted-foreground/20 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all h-12 text-base shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
             {searchTerm && (
               <p className="mt-4 text-muted-foreground">
                 Aucun résultat pour "<span className="font-medium text-foreground">{searchTerm}</span>".
                 <br />Essayez de vérifier l'orthographe ou d'utiliser des termes plus simples.
               </p>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Archives;