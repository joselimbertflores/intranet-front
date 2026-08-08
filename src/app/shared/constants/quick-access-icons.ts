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

export const QUICK_ACCESS_ICONS: Readonly<Record<QuickAccessIconKey, string>> =
  {
    email: lucideMail,
    application: lucideAppWindow,
    document: lucideFileText,
    book: lucideBookOpen,
    form: lucideClipboardList,
    report: lucideChartNoAxesColumn,
    calendar: lucideCalendarDays,
    user: lucideUserRound,
    support: lucideCircleHelp,
    finance: lucideLandmark,
    vehicle: lucideCarFront,
    'external-link': lucideExternalLink,
  };
