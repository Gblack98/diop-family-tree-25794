const textStyle = { textShadow: '0 0 4px rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.4)' };

export const Legend = () => {
  return (
    <div className="fixed bottom-4 left-4 sm:left-auto sm:right-4 p-2 sm:p-3 z-40 animate-in fade-in duration-500 opacity-0 hover:opacity-100 transition-opacity duration-300">
      <h3 className="font-semibold text-[10px] sm:text-xs mb-1.5 sm:mb-2" style={textStyle}>Légende</h3>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 sm:flex-col sm:space-y-2 sm:flex-nowrap">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="w-3 h-3 sm:w-5 sm:h-5 rounded-md bg-gradient-to-br from-[hsl(var(--male))] to-blue-600 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground" style={textStyle}>Homme</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="w-3 h-3 sm:w-5 sm:h-5 rounded-md bg-gradient-to-br from-[hsl(var(--female))] to-pink-600 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground" style={textStyle}>Femme</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="w-3 sm:w-5 h-0.5 bg-[hsl(var(--tree-link))] rounded-full flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap" style={textStyle}>Filiation</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="w-3 sm:w-5 h-0.5 bg-primary rounded-full flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground" style={textStyle}>Mariage</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white flex-shrink-0">★</div>
          <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap" style={textStyle}>Ligne directe</span>
        </div>
      </div>
    </div>
  );
};