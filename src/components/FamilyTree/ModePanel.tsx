import { useState, useMemo } from "react";
import { ViewMode, PersonNode } from "@/lib/familyTree/types";
import { X, Search, Users, TrendingUp, TrendingDown, GitBranch } from "lucide-react";

interface ModePanelProps {
  mode: ViewMode;
  isOpen: boolean;
  persons: PersonNode[];
  onApply: (person1?: PersonNode, person2?: PersonNode) => void;
  onCancel: () => void;
  onClose: () => void;
}

export const ModePanel = ({ mode, isOpen, persons, onApply, onCancel, onClose }: ModePanelProps) => {
  const [searchQuery1, setSearchQuery1] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [selectedPerson1, setSelectedPerson1] = useState<PersonNode | null>(null);
  const [selectedPerson2, setSelectedPerson2] = useState<PersonNode | null>(null);

  // Filtrer et grouper les personnes par génération
  const filteredPersons1 = useMemo(() => {
    const query = searchQuery1.toLowerCase();
    return persons.filter((p) => p.name.toLowerCase().includes(query));
  }, [persons, searchQuery1]);

  const filteredPersons2 = useMemo(() => {
    const query = searchQuery2.toLowerCase();
    return persons.filter((p) => p.name.toLowerCase().includes(query) && p.name !== selectedPerson1?.name);
  }, [persons, searchQuery2, selectedPerson1]);

  const groupByGeneration = (personsToGroup: PersonNode[]) => {
    const grouped: { [key: number]: PersonNode[] } = {};
    personsToGroup.forEach((p) => {
      if (!grouped[p.level]) grouped[p.level] = [];
      grouped[p.level].push(p);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([level, people]) => ({
        level: parseInt(level),
        persons: people.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  };

  const groupedPersons1 = useMemo(() => groupByGeneration(filteredPersons1), [filteredPersons1]);
  const groupedPersons2 = useMemo(() => groupByGeneration(filteredPersons2), [filteredPersons2]);

  if (mode === "tree" || !isOpen) return null;

  const getTitle = () => {
    switch (mode) {
      case "ancestors":
        return "Vue Ascendants";
      case "descendants":
        return "Vue Descendants";
      case "path":
        return "Vue Relation";
      default:
        return "";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "ancestors":
        return "Visualisez tous les ancêtres d'une personne, incluant leurs conjoints et fratries";
      case "descendants":
        return "Explorez tous les descendants d'une personne avec leurs conjoints";
      case "path":
        return "Découvrez le lien familial entre deux personnes avec un chemin surligné";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (mode) {
      case "ancestors":
        return <TrendingUp className="w-5 h-5" />;
      case "descendants":
        return <TrendingDown className="w-5 h-5" />;
      case "path":
        return <GitBranch className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getPersonAvatar = (person: PersonNode, size: "sm" | "md" = "md") => {
    const initial = person.name.charAt(0).toUpperCase();
    const isExternal = person.isExternalSpouse;
    const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

    const bgColor = isExternal
      ? person.genre === "Homme"
        ? "bg-gradient-to-br from-[hsl(270,65%,55%)] to-[hsl(270,65%,48%)]"
        : "bg-gradient-to-br from-[hsl(25,90%,60%)] to-[hsl(25,90%,55%)]"
      : person.genre === "Homme"
      ? "bg-gradient-to-br from-[hsl(var(--male))] to-blue-600"
      : "bg-gradient-to-br from-[hsl(var(--female))] to-pink-600";

    return (
      <div className={`${sizeClasses} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
        {initial}
      </div>
    );
  };

  const getPersonStats = (person: PersonNode) => {
    return (
      <div className="flex gap-2 text-[10px] text-muted-foreground">
        <span title="Parents">👥 {person.parents.length}</span>
        <span title="Conjoints">💑 {person.spouses.length}</span>
        <span title="Enfants">👶 {person.enfants.length}</span>
      </div>
    );
  };

  const handlePersonClick = (person: PersonNode, slot: 1 | 2) => {
    if (slot === 1) {
      setSelectedPerson1(person);
      setSearchQuery1("");
    } else {
      setSelectedPerson2(person);
      setSearchQuery2("");
    }
  };

  const handleSubmit = () => {
    if (mode === "path") {
      if (selectedPerson1 && selectedPerson2) {
        onApply(selectedPerson1, selectedPerson2);
      }
    } else if (selectedPerson1) {
      onApply(selectedPerson1);
    }
  };

  const renderPersonList = (groupedPersons: { level: number; persons: PersonNode[] }[], slot: 1 | 2) => {
    const selectedPerson = slot === 1 ? selectedPerson1 : selectedPerson2;
    const searchQuery = slot === 1 ? searchQuery1 : searchQuery2;

    return (
      <div className="space-y-2">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une personne..."
            value={searchQuery}
            onChange={(e) => slot === 1 ? setSearchQuery1(e.target.value) : setSearchQuery2(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        {/* Personne sélectionnée */}
        {selectedPerson && (
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center gap-3">
              {getPersonAvatar(selectedPerson)}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{selectedPerson.name}</div>
                <div className="text-xs text-muted-foreground">Génération {selectedPerson.level}</div>
                {getPersonStats(selectedPerson)}
              </div>
              <button
                onClick={() => slot === 1 ? setSelectedPerson1(null) : setSelectedPerson2(null)}
                className="p-1 hover:bg-destructive/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Liste des personnes par génération */}
        {!selectedPerson && (
          <div className="max-h-[40vh] overflow-y-auto space-y-3">
            {groupedPersons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Aucune personne trouvée
              </div>
            ) : (
              groupedPersons.map(({ level, persons }) => (
                <div key={level} className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded sticky top-0">
                    <Users className="w-3 h-3" />
                    <span className="text-xs font-semibold">Génération {level}</span>
                    <span className="text-xs text-muted-foreground">({persons.length})</span>
                  </div>
                  <div className="space-y-1">
                    {persons.map((person) => (
                      <button
                        key={person.name}
                        onClick={() => handlePersonClick(person, slot)}
                        className="w-full p-2 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors text-left"
                      >
                        {getPersonAvatar(person, "sm")}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{person.name}</div>
                          {getPersonStats(person)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed top-24 sm:top-28 right-4 sm:right-6 bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-4 sm:p-5 z-40 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
        <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg mb-1">{getTitle()}</h3>
          <p className="text-xs text-muted-foreground">{getDescription()}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden space-y-4">
        {/* Personne 1 */}
        <div>
          <label className="text-sm font-semibold mb-2 block">
            {mode === "path" ? "Personne 1" : "Personne sélectionnée"}
          </label>
          {renderPersonList(groupedPersons1, 1)}
        </div>

        {/* Personne 2 (uniquement pour mode path) */}
        {mode === "path" && (
          <div>
            <label className="text-sm font-semibold mb-2 block">Personne 2</label>
            {renderPersonList(groupedPersons2, 2)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedPerson1 || (mode === "path" && !selectedPerson2)}
          className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Afficher
        </button>
      </div>
    </div>
  );
};
