import type { QuickAccessIconKey } from '../../../../shared/models/quick-access-icon-key';

export const QUICK_ACCESS_ICON_LABELS: Readonly<
  Record<QuickAccessIconKey, string>
> = {
  email: 'Correo',
  application: 'Aplicación',
  document: 'Documento',
  book: 'Libro',
  form: 'Formulario',
  report: 'Reporte',
  calendar: 'Calendario',
  user: 'Usuario',
  support: 'Soporte',
  finance: 'Finanzas',
  vehicle: 'Vehículo',
  'external-link': 'Enlace externo',
};

export const QUICK_ACCESS_ICON_OPTIONS = Object.entries(
  QUICK_ACCESS_ICON_LABELS,
).map(([key, label]) => ({
  key: key as QuickAccessIconKey,
  label,
}));
