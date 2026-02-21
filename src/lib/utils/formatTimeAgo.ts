/**
 * Formats a date string as a relative time (e.g. "Il y a 5 min").
 * @param dateString ISO date string
 * @param short If true, returns compact format ("5min", "2h", "3j")
 */
export const formatTimeAgo = (dateString: string, short = false): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return short ? `${diffMin}min` : `Il y a ${diffMin} min`;
  if (diffH < 24) return short ? `${diffH}h` : `Il y a ${diffH}h`;
  if (diffD < 7) return short ? `${diffD}j` : `Il y a ${diffD} jour${diffD > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR', short
    ? { day: '2-digit', month: '2-digit' }
    : { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  );
};
