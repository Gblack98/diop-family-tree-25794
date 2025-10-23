import { ArrowLeft, FileText, Image as ImageIcon, BookOpen, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface Category {
  value: string;
  label: string;
  icon: typeof FileText;
}

const categories: Category[] = [
  { value: "all", label: "Tout", icon: FileText },
  { value: "photo", label: "Photos", icon: ImageIcon },
  { value: "biography", label: "Biographies", icon: BookOpen },
  { value: "document", label: "Documents", icon: FileText },
  { value: "quote", label: "Citations", icon: Quote },
  { value: "article", label: "Articles", icon: FileText },
];

interface ArchiveHeaderProps {
  archiveCount: number;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const ArchiveHeader = ({ archiveCount, selectedCategory, onCategoryChange }: ArchiveHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-xl border-b border-border/30 shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-left duration-500">
            <Link 
              to="/" 
              className="p-2 hover:bg-accent rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Archives Familiales
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                Mémoire et héritage de la famille Diop
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="animate-in fade-in slide-in-from-right duration-500">
            {archiveCount}
          </Badge>
        </div>

        {/* Navigation responsive */}
        <nav className="animate-in fade-in slide-in-from-bottom duration-700 delay-150">
          {isMobile ? (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategoryChange(cat.value)}
                    className="flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{cat.label}</span>
                  </Button>
                );
              })}
            </div>
          ) : (
            <NavigationMenu className="mx-auto">
              <NavigationMenuList className="flex-wrap justify-center gap-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <NavigationMenuItem key={cat.value}>
                      <NavigationMenuLink asChild>
                        <Button
                          variant={selectedCategory === cat.value ? "default" : "ghost"}
                          size="sm"
                          onClick={() => onCategoryChange(cat.value)}
                          className={cn(
                            "flex items-center gap-2 transition-all hover:scale-105",
                            selectedCategory === cat.value && "shadow-lg"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{cat.label}</span>
                        </Button>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </nav>
      </div>
    </header>
  );
};
