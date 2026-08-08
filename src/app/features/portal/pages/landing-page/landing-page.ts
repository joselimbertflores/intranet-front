import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRefreshCw } from '@ng-icons/lucide';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { PortalLandingResponse } from '../../models';
import { PortalLandingDataSource } from '../../services';
import {
  FeaturedBannersSection,
  LandingCommunicationsSection,
  LandingDocumentsSection,
  LandingHeroSection,
  LandingNoticesDialog,
  LandingQuickAccessSection,
  LandingSkeleton,
} from './components';

const EMPTY_LANDING_RESPONSE: PortalLandingResponse = {
  heroSlides: [],
  quickAccesses: [],
  featuredBanners: [],
  landingNotices: [],
  latestCommunications: [],
  mostDownloadedDocuments: [],
};

@Component({
  selector: 'landing-page',
  imports: [
    FeaturedBannersSection,
    HlmAlertImports,
    HlmButtonImports,
    LandingCommunicationsSection,
    LandingDocumentsSection,
    LandingHeroSection,
    LandingNoticesDialog,
    LandingQuickAccessSection,
    LandingSkeleton,
    NgIcon,
  ],
  providers: [provideIcons({ lucideRefreshCw })],
  host: { class: 'block min-h-full bg-background text-foreground' },
  templateUrl: './landing-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingPage {
  private readonly portalLandingDataSource = inject(PortalLandingDataSource);

  readonly landingResource = rxResource({
    stream: () => this.portalLandingDataSource.getLanding(),
    defaultValue: EMPTY_LANDING_RESPONSE,
  });

  hasContent = computed(() => {
    const value = this.landingResource.value();
    return Boolean(
      value.heroSlides.length ||
      value.quickAccesses.length ||
      value.featuredBanners.length ||
      value.landingNotices.length ||
      value.latestCommunications.length ||
      value.mostDownloadedDocuments.length,
    );
  });
}
