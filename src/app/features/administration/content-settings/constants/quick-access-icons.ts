export const QUICK_ACCESS_ICON_KEYS = [
  'email',
  'application',
  'document',
  'book',
  'form',
  'report',
  'calendar',
  'user',
  'support',
  'finance',
  'vehicle',
  'external-link',
] as const;

export type QuickAccessIconKey = (typeof QUICK_ACCESS_ICON_KEYS)[number];

type QuickAccessIconName =
  | 'lucideMail'
  | 'lucideAppWindow'
  | 'lucideFileText'
  | 'lucideBookOpen'
  | 'lucideClipboardList'
  | 'lucideChartNoAxesColumn'
  | 'lucideCalendarDays'
  | 'lucideUserRound'
  | 'lucideCircleHelp'
  | 'lucideLandmark'
  | 'lucideCarFront'
  | 'lucideExternalLink';

interface QuickAccessIconConfig {
  label: string;
  icon: QuickAccessIconName;
}

export const QUICK_ACCESS_ICON_CATALOG: Readonly<
  Record<QuickAccessIconKey, QuickAccessIconConfig>
> = {
  email: { label: 'Correo', icon: 'lucideMail' },
  application: { label: 'Aplicación', icon: 'lucideAppWindow' },
  document: { label: 'Documento', icon: 'lucideFileText' },
  book: { label: 'Libro', icon: 'lucideBookOpen' },
  form: { label: 'Formulario', icon: 'lucideClipboardList' },
  report: { label: 'Reporte', icon: 'lucideChartNoAxesColumn' },
  calendar: { label: 'Calendario', icon: 'lucideCalendarDays' },
  user: { label: 'Usuario', icon: 'lucideUserRound' },
  support: { label: 'Soporte', icon: 'lucideCircleHelp' },
  finance: { label: 'Finanzas', icon: 'lucideLandmark' },
  vehicle: { label: 'Vehículo', icon: 'lucideCarFront' },
  'external-link': {
    label: 'Enlace externo',
    icon: 'lucideExternalLink',
  },
};

export const QUICK_ACCESS_ICON_OPTIONS = QUICK_ACCESS_ICON_KEYS.map((key) => ({
  key,
  ...QUICK_ACCESS_ICON_CATALOG[key],
}));

export function isQuickAccessIconKey(
  value: string,
): value is QuickAccessIconKey {
  return (QUICK_ACCESS_ICON_KEYS as readonly string[]).includes(value);
}
