import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleAlert,
  lucideExternalLink,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

import { PublicPageHeader } from '../../components';
import {
  QUICK_ACCESS_ICON_REGISTRY,
  quickAccessIconName,
} from '../../constants/quick-access-icons';
import { QuickAccessIconKey } from '../../models';
import { PortalLandingService } from '../../services';

@Component({
  selector: 'app-quick-accesses-page',
  imports: [HlmButtonImports, HlmSkeletonImports, NgIcon, PublicPageHeader],
  providers: [
    provideIcons({
      lucideCircleAlert,
      lucideExternalLink,
      lucideRefreshCw,
      ...QUICK_ACCESS_ICON_REGISTRY,
    }),
  ],
  templateUrl: './quick-accesses-page.html',
  styleUrl: './quick-accesses-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QuickAccessesPage {
  private readonly portalLandingService = inject(PortalLandingService);

  readonly quickAccessesResource = rxResource({
    stream: () => this.portalLandingService.getQuickAccesses(),
  });
  readonly skeletonItems = Array.from({ length: 8 });

  quickAccessIcon(iconKey: QuickAccessIconKey): string {
    return quickAccessIconName(iconKey);
  }
}
