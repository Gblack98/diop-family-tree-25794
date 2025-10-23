import { useState, useRef, useEffect } from "react";
import { PersonNode } from "@/lib/familyTree/types";
import { Search } from "lucide-react";

interface SearchBarProps {
  persons: PersonNode[];
  onSelectPerson: (person: PersonNode) => void;
}

export const SearchBar = ({ persons, onSelectPerson }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredPersons = searchTerm.trim()
    ? persons
        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 10)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Rechercher une personne..."
          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 pl-9 sm:pl-10 bg-background border border-border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
      </div>

      {showResults && filteredPersons.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-lg shadow-lg max-h-[300px] overflow-y-auto z-50">
          {filteredPersons.map((person) => (
            <button
              key={person.name}
              onClick={() => {
                onSelectPerson(person);
                setSearchTerm("");
                setShowResults(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
            >
              <div className="font-medium text-sm">{person.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {person.genre} • Génération {person.level} • {person.enfants.length}{" "}
                enfant(s)
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && searchTerm.trim() && filteredPersons.length === 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
        </div>
      )}
    </div>
  );
};
