import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Save, Globe, Mail, Share2, Layout, RefreshCw } from 'lucide-react';

type Settings = Record<string, string>;

const SECTIONS = [
  {
    title: 'Contenu principal',
    icon: Layout,
    fields: [
      { key: 'site_welcome_title',    label: 'Titre de bienvenue',   type: 'text',     placeholder: 'Arbre Généalogique Diop' },
      { key: 'site_welcome_subtitle', label: 'Sous-titre',           type: 'text',     placeholder: 'Explorez 6 générations...' },
      { key: 'site_description',      label: 'Description du site',  type: 'textarea', placeholder: 'Bienvenue dans l\'arbre généalogique...' },
      { key: 'site_footer_text',      label: 'Texte de pied de page',type: 'text',     placeholder: '© Famille Diop' },
    ],
  },
  {
    title: 'Contact & Réseaux sociaux',
    icon: Share2,
    fields: [
      { key: 'site_contact_email', label: 'Email de contact', type: 'text', placeholder: 'contact@famille-diop.com' },
      { key: 'site_facebook_url',  label: 'Facebook URL',     type: 'text', placeholder: 'https://facebook.com/...' },
      { key: 'site_instagram_url', label: 'Instagram URL',    type: 'text', placeholder: 'https://instagram.com/...' },
    ],
  },
  {
    title: 'Options de la page d\'accueil',
    icon: Globe,
    fields: [
      { key: 'homepage_show_stats',  label: 'Afficher les statistiques (membres, générations)',     type: 'toggle' },
      { key: 'homepage_show_recent', label: 'Afficher les dernières archives ajoutées', type: 'toggle' },
    ],
  },
];

export const SettingsPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (!error && data) {
      const map: Settings = {};
      data.forEach((row) => { map[row.key] = row.value ?? ''; });
      setSettings(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: profile?.id ?? null,
      }));

      const { error } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' });

      if (error) throw error;

      toast({ title: 'Paramètres enregistrés', description: 'Les modifications sont actives immédiatement.' });
      setDirty(false);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const headerAction = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={loadSettings} disabled={loading}>
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Recharger
      </Button>
      <Button size="sm" onClick={handleSave} disabled={saving || !dirty}>
        {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Enregistrer
      </Button>
    </div>
  );

  return (
    <AdminLayout
      title="Paramètres du site"
      subtitle="Personnalisez le contenu et l'apparence du site public"
      headerAction={headerAction}
    >
      {dirty && (
        <div className="mb-4 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <span>Modifications non enregistrées</span>
          <Button size="sm" variant="ghost" onClick={handleSave} disabled={saving} className="text-amber-800 hover:text-amber-900">
            Enregistrer maintenant
          </Button>
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-semibold">{section.title}</h2>
              </div>
              <Separator className="mb-4" />

              <div className="space-y-4">
                {section.fields.map((field) => {
                  if (loading) {
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className={`w-full ${field.type === 'textarea' ? 'h-20' : 'h-10'}`} />
                      </div>
                    );
                  }

                  if (field.type === 'toggle') {
                    return (
                      <div key={field.key} className="flex items-center justify-between">
                        <Label htmlFor={field.key} className="text-sm cursor-pointer">
                          {field.label}
                        </Label>
                        <Switch
                          id={field.key}
                          checked={settings[field.key] === 'true'}
                          onCheckedChange={(checked) => handleChange(field.key, checked ? 'true' : 'false')}
                        />
                      </div>
                    );
                  }

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
                        <Textarea
                          id={field.key}
                          placeholder={field.placeholder}
                          value={settings[field.key] ?? ''}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          rows={3}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
                      <Input
                        id={field.key}
                        type={field.key.includes('email') ? 'email' : 'text'}
                        placeholder={field.placeholder}
                        value={settings[field.key] ?? ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {/* Preview info */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-sm">Application des changements</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Les modifications sont appliquées en temps réel sur le site public dès l'enregistrement.
                Aucun rechargement du serveur n'est nécessaire.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
