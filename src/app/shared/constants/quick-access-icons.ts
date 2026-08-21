import {
  lucideAppWindow,
  lucideBookOpen,
  lucideCalendarDays,
  lucideCarFront,
  lucideChartNoAxesColumn,
  lucideCircleHelp,
  lucideClipboardList,
  lucideExternalLink,
  lucideFileText,
  lucideLandmark,
  lucideMail,
  lucideUserRound,
} from '@ng-icons/lucide';

import type { QuickAccessIconKey } from '../models/quick-access-icon-key';

export const QUICK_ACCESS_ICONS = {
  lucideAppWindow,
  lucideBookOpen,
  lucideCalendarDays,
  lucideCarFront,
  lucideChartNoAxesColumn,
  lucideCircleHelp,
  lucideClipboardList,
  lucideExternalLink,
  lucideFileText,
  lucideLandmark,
  lucideMail,
  lucideUserRound,
};

export const QUICK_ACCESS_ICON_NAMES: Readonly<
  Record<QuickAccessIconKey, string>
> = {
  email: 'lucideMail',
  application: 'lucideAppWindow',
  document: 'lucideFileText',
  book: 'lucideBookOpen',
  form: 'lucideClipboardList',
  report: 'lucideChartNoAxesColumn',
  calendar: 'lucideCalendarDays',
  user: 'lucideUserRound',
  support: 'lucideCircleHelp',
  finance: 'lucideLandmark',
  vehicle: 'lucideCarFront',
  'external-link': 'lucideExternalLink',
};

const FALLBACK_ICON_NAME = QUICK_ACCESS_ICON_NAMES['external-link'];

export function resolveQuickAccessIcon(iconKey: unknown): string {
  if (typeof iconKey !== 'string') return FALLBACK_ICON_NAME;

  const normalizedKey = iconKey.trim().toLocaleLowerCase() as QuickAccessIconKey;

  return Object.hasOwn(QUICK_ACCESS_ICON_NAMES, normalizedKey)
    ? QUICK_ACCESS_ICON_NAMES[normalizedKey]
    : FALLBACK_ICON_NAME;
}
