export const Legend = () => {
  return (
    <div className="fixed bottom-4 left-4 sm:left-auto sm:right-4 bg-card/5 backdrop-blur-md border border-border/5 rounded-lg shadow-lg p-2 sm:p-3 z-40 animate-in fade-in duration-500">
      <h3 className="font-semibold text-[10px] sm:text-xs mb-1.5 sm:mb-2">Légende</h3>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 sm:flex-col sm:space-y-2 sm:flex-nowrap">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="w-3 h-3 sm:w-5 sm:h-5 rounded-md bg-gradient-to-br from-[hsl(var(--male))] to-blue-600 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Homme</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="w-3 h-3 sm:w-5 sm:h-5 rounded-md bg-gradient-to-br from-[hsl(var(--female))] to-pink-600 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Femme</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="w-3 sm:w-5 h-0.5 bg-[hsl(var(--tree-link))] rounded-full flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">Parent-Enfant</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="w-3 sm:w-5 h-0.5 bg-primary rounded-full flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Conjugal</span>
        </div>
      </div>
    </div>
  );
};