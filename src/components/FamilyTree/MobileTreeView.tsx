import { useState } from "react";
import { PersonNode } from "@/lib/familyTree/types";
import { ChevronDown, ChevronRight, Users, Heart, Baby, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MobileTreeViewProps {
  persons: PersonNode[];
  onPersonClick: (person: PersonNode) => void;
  selectedPerson: PersonNode | null;
}

export const MobileTreeView = ({ persons, onPersonClick, selectedPerson }: MobileTreeViewProps) => {
  const [expandedPersons, setExpandedPersons] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const toggleExpand = (personName: string) => {
    const newExpanded = new Set(expandedPersons);
    if (newExpanded.has(personName)) {
      newExpanded.delete(personName);
    } else {
      newExpanded.add(personName);
    }
    setExpandedPersons(newExpanded);
  };

  // Group by generation
  const personsByGeneration = persons.reduce((acc, person) => {
    if (!acc[person.level]) acc[person.level] = [];
    acc[person.level].push(person);
    return acc;
  }, {} as Record<number, PersonNode[]>);

  const generations = Object.keys(personsByGeneration)
    .map(Number)
    .sort((a, b) => a - b);

  const filteredGenerations = searchTerm.trim()
    ? generations.filter(gen =>
        personsByGeneration[gen].some(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : generations;

  const filteredPersons = (gen: number) => {
    const personsInGen = personsByGeneration[gen] || [];
    if (!searchTerm.trim()) return personsInGen;
    return personsInGen.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-violet-50/50 to-pink-50/50 dark:from-violet-950/30 dark:to-pink-950/30">
      {/* Search bar fixe */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-violet-200/50 dark:border-violet-800/50 p-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-500" />
          <Input
            placeholder="Rechercher une personne..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white dark:bg-violet-950/50 border-violet-200 dark:border-violet-800 rounded-xl"
          />
        </div>
      </div>

      {/* Liste scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {filteredGenerations.map((generation) => {
          const personsInGen = filteredPersons(generation);
          if (personsInGen.length === 0) return null;

          return (
            <div key={generation} className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-300 to-transparent dark:via-violet-700" />
                <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                  Génération {generation}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent dark:via-pink-700" />
              </div>

              {personsInGen.map((person) => {
                const isExpanded = expandedPersons.has(person.name);
                const isSelected = selectedPerson?.name === person.name;
                const hasChildren = person.enfants.length > 0;

                const avatarGradient = person.genre === "Homme"
                  ? "from-violet-500 to-purple-600"
                  : "from-pink-500 to-rose-600";

                return (
                  <div
                    key={person.name}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                      isSelected
                        ? "ring-2 ring-violet-500 shadow-lg shadow-violet-500/20"
                        : "shadow-md hover:shadow-xl"
                    }`}
                  >
                    {/* Card principale */}
                    <div
                      onClick={() => onPersonClick(person)}
                      className={`p-4 cursor-pointer bg-gradient-to-br ${
                        isSelected
                          ? "from-violet-50 to-pink-50 dark:from-violet-950/50 dark:to-pink-950/50"
                          : "from-white to-gray-50 dark:from-violet-950/30 dark:to-pink-950/30"
                      } active:scale-[0.98] transition-transform`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                          {person.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base leading-tight truncate bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                            {person.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-0">
                              Gén. {person.level}
                            </Badge>
                          </div>
                        </div>

                        {/* Expand button */}
                        {hasChildren && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(person.name);
                            }}
                            className="p-2 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-full transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-violet-200/50 dark:border-violet-800/50">
                        {person.parents.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5 text-violet-500" />
                            <span>{person.parents.length} parent{person.parents.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {person.spouses.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Heart className="w-3.5 h-3.5 text-pink-500" />
                            <span>{person.spouses.length} conjoint{person.spouses.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {person.enfants.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Baby className="w-3.5 h-3.5 text-blue-500" />
                            <span>{person.enfants.length} enfant{person.enfants.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Children expandable */}
                    {hasChildren && isExpanded && (
                      <div className="bg-violet-50/50 dark:bg-violet-950/20 p-3 space-y-2 border-t border-violet-200/50 dark:border-violet-800/50">
                        <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-2">
                          Enfants ({person.enfants.length})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {person.enfants.map((childName) => (
                            <div
                              key={childName}
                              className="text-xs p-2 bg-white dark:bg-violet-950/30 rounded-lg border border-violet-200/50 dark:border-violet-800/50 truncate"
                            >
                              {childName}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
