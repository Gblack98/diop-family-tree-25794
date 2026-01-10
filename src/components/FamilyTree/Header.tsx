import { PersonNode, ViewMode } from "@/lib/familyTree/types";
import { SearchBar } from "./SearchBar";
import { Link } from "react-router-dom";
import {
  TreeDeciduous,
  Users,
  GitMerge,
  Workflow,
  Maximize,
  Minimize,
  Download,
  Menu,
  Archive,
  HelpCircle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  totalMembers: number;
  totalGenerations: number;
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onReset: () => void;
  onFit: () => void;
  onExport: (format: 'png' | 'pdf') => void;
  persons: PersonNode[];
  onSelectPerson: (person: PersonNode) => void;
}

export const Header = ({
  totalMembers,
  totalGenerations,
  currentMode,
  onModeChange,
  onReset,
  onFit,
  onExport,
  persons,
  onSelectPerson,
}: HeaderProps) => {
  const modes: { value: ViewMode; label: string, icon: React.ElementType }[] = [
    { value: "tree", label: "Arbre Complet", icon: TreeDeciduous },
    { value: "ancestors", label: "Ascendants", icon: Users },
    { value: "descendants", label: "Descendants", icon: Workflow },
    { value: "path", label: "Relation", icon: GitMerge },
  ];

  const currentModeData = modes.find(m => m.value === currentMode);

  return (
    <header className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-b border-border/20 z-50 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 py-2">
        {/* Mobile Layout */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">
                Famille Diop
              </h1>
              <p className="text-[10px] text-muted-foreground">
                {totalMembers} membres • {totalGenerations} gen.
              </p>
            </div>
            <div className="flex gap-1.5 items-center flex-shrink-0">
              <Link to="/archives" className="p-2 rounded-lg hover:bg-accent transition-colors active:scale-95" title="Archives familiales">
                <Archive className="w-5 h-5" />
              </Link>

              <Link to="/help" className="p-1.5 rounded-md opacity-50 hover:opacity-100 hover:bg-accent/50 transition-all active:scale-95" title="Aide">
                <HelpCircle className="w-4 h-4" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-accent transition-colors active:scale-95">
                    <Menu className="w-5 h-5"/>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {modes.map((mode) => (
                     <DropdownMenuItem key={mode.value} onClick={() => onModeChange(mode.value)}>
                      <mode.icon className="w-4 h-4 mr-2"/>
                      <span>{mode.label}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={onReset}>
                    <Minimize className="w-4 h-4 mr-2"/>
                    Centrer
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={onFit}>
                    <Maximize className="w-4 h-4 mr-2"/>
                    Ajuster
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('png')}>
                    <Download className="w-4 h-4 mr-2"/>
                    Exporter (PNG)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* SearchBar on separate row for better UX */}
          <div className="w-full">
            <SearchBar persons={persons} onSelectPerson={onSelectPerson} />
          </div>
        </div>

        {/* Tablet & Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-bold text-foreground truncate">
              Arbre Généalogique - Famille Diop
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              {totalMembers} membres • {totalGenerations} générations
            </p>
          </div>

          <div className="flex-1 sm:max-w-xs md:max-w-sm lg:max-w-md">
            <SearchBar persons={persons} onSelectPerson={onSelectPerson} />
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/archives"
              className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors text-xs md:text-sm font-medium flex items-center gap-2"
              title="Archives familiales"
            >
              <Archive className="w-4 h-4"/>
              <span className="hidden lg:inline">Archives</span>
            </Link>

            <Link
              to="/help"
              className="p-2 rounded-md opacity-40 hover:opacity-100 hover:bg-accent/50 transition-all"
              title="Aide"
            >
              <HelpCircle className="w-3.5 h-3.5"/>
            </Link>

            <div className="flex bg-muted/50 rounded-lg p-1">
              {modes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => onModeChange(mode.value)}
                  className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all flex items-center gap-2 ${
                    currentMode === mode.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={mode.label}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
              <button
                onClick={onReset}
                className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs md:text-sm font-medium flex items-center gap-2"
                title="Centrer la vue"
              >
                <Minimize className="w-4 h-4"/>
              </button>

              <button
                onClick={onFit}
                className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs md:text-sm font-medium flex items-center gap-2"
                 title="Ajuster à l'écran"
              >
                <Maximize className="w-4 h-4"/>
              </button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs md:text-sm font-medium flex items-center gap-2" title="Exporter">
                    <Download className="w-4 h-4"/>
                    <span className="hidden lg:inline">Exporter</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport('png')}>Exporter en PNG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('pdf')}>Exporter en PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </header>
  );
};