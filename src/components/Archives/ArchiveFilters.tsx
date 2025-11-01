import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { archiveCategories } from "@/data/archivesData";

interface ArchiveFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const ArchiveFilters = ({ selectedCategory, onCategoryChange }: ArchiveFiltersProps) => {
  return (
    <div className="mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom duration-700 delay-150">
      <Tabs value={selectedCategory} className="w-full" onValueChange={onCategoryChange}>
        <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 sm:grid-cols-6 h-auto gap-2 bg-muted/50 p-2 backdrop-blur-sm">
          {archiveCategories.map((cat, index) => (
            <TabsTrigger 
              key={cat.value} 
              value={cat.value}
              className="flex items-center gap-2 text-xs sm:text-sm transition-all hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};
