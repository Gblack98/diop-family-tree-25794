/**
 * Télécharge un fichier depuis une URL
 * @param url - URL du fichier à télécharger
 * @param filename - Nom du fichier à enregistrer
 */
export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    throw error;
  }
};

/**
 * Génère un nom de fichier sécurisé
 * @param title - Titre de l'archive
 * @param date - Date de l'archive
 * @param extension - Extension du fichier (pdf, jpg, png, etc.)
 */
export const generateFilename = (title: string, date: string, extension: string = 'pdf'): string => {
  const sanitized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retire les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ''); // Retire les tirets au début et à la fin

  return `${sanitized}-${date}.${extension}`;
};
