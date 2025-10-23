export const Legend = () => {
  return (
    <div className="fixed bottom-4 right-4 bg-card/5 backdrop-blur-md border border-border/5 rounded-lg shadow-lg p-3 z-40 max-w-[150px] sm:max-w-none animate-in fade-in duration-500">
      <h3 className="font-semibold text-xs mb-2">Légende</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[hsl(var(--male))] to-blue-600 flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Homme</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[hsl(var(--female))] to-pink-600 flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Femme</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-0.5 bg-[hsl(var(--tree-link))] rounded-full flex-shrink-0" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">Parent-Enfant</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-0.5 bg-primary rounded-full flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Conjugal</span>
        </div>
      </div>
    </div>
  );
};