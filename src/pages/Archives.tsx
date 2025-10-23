import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { archivesData, Archive } from "@/data/archivesData";
import { ArchiveHeader } from "@/components/Archives/ArchiveHeader";
import { ArchiveFilters } from "@/components/Archives/ArchiveFilters";
import { ArchiveCard } from "@/components/Archives/ArchiveCard";
import { ArchiveDialog } from "@/components/Archives/ArchiveDialog";
import { EmptyState } from "@/components/Archives/EmptyState";

const Archives = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);

  const filteredArchives = archivesData.filter(
    archive => selectedCategory === "all" || archive.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <ArchiveHeader archiveCount={filteredArchives.length} />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <ArchiveFilters 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredArchives.map((archive, index) => (
            <Dialog key={archive.id}>
              <DialogTrigger asChild>
                <div>
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