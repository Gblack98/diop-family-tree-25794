import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { archivesData, Archive } from "@/data/archivesData";
import { ArchiveHeader } from "@/components/Archives/ArchiveHeader";
import { ArchiveCard } from "@/components/Archives/ArchiveCard";
import { ArchiveDialog } from "@/components/Archives/ArchiveDialog";
import { EmptyState } from "@/components/Archives/EmptyState";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Archives = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Logique de filtrage combinée (Catégorie + Recherche Texte)
  const filteredArchives = archivesData.filter(archive => {
    const matchesCategory = selectedCategory === "all" || archive.category === selectedCategory;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      archive.title.toLowerCase().includes(searchLower) || 
      archive.person.toLowerCase().includes(searchLower) ||
      archive.content.toLowerCase().includes(searchLower);
      
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <ArchiveHeader 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Barre de Recherche */}
        <div className="max-w-md mx-auto mb-8 relative animate-in fade-in slide-in-from-top duration-500">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Rechercher une archive, une personne..." 
            className="pl-10 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

        {filteredArchives.length === 0 && <EmptyState />}
      </main>
    </div>
  );
};

export default Archives;