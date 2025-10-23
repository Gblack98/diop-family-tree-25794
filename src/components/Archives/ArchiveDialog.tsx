import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Archive } from "@/data/archivesData";

interface ArchiveDialogProps {
  archive: Archive;
}

export const ArchiveDialog = ({ archive }: ArchiveDialogProps) => {
  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogDescription className="sr-only">
        Détails de l'archive de {archive.person}
      </DialogDescription>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{archive.title}</DialogTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">{archive.person}</Badge>
          <span className="text-sm text-muted-foreground">• {archive.date}</span>
        </div>
      </DialogHeader>
      
      {archive.image && (
        <div className="aspect-video overflow-hidden rounded-lg">
          <img 
            src={archive.image} 
            alt={archive.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          {archive.fullContent || archive.content}
        </p>
        
        {archive.achievements && archive.achievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Réalisations notables :</h4>
            <ul className="space-y-1">
              {archive.achievements.map((achievement, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DialogContent>
  );
};
