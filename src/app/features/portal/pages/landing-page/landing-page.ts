import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  FeaturedBannersSection,
  LandingCommunicationsSection,
  LandingDocumentsSection,
  LandingHeroSection,
  LandingNotices,
  LandingQuickAccessSection,
  LandingSkeleton,
} from './components';
import { PortalLandingResponse } from '../../models';
import { PortalLandingService } from '../../services';

type LandingState = 'loading' | 'ready' | 'error';

const EMPTY_LANDING_RESPONSE: PortalLandingResponse = {
  heroSlides: [],
  quickAccesses: [],
  featuredBanners: [],
  landingNotices: [],
  mostConsultedDocuments: [],
  communications: [],
};

@Component({
  selector: 'landing-page',
  imports: [
    LandingHeroSection,
    LandingQuickAccessSection,
    FeaturedBannersSection,
    LandingNotices,
    LandingDocumentsSection,
    LandingCommunicationsSection,
    LandingSkeleton,
  ],
  templateUrl: './landing-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './landing-page.css',
})
export default class LandingPage {
  private readonly portalLandingService = inject(PortalLandingService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly landingResponse = signal<PortalLandingResponse>(
    EMPTY_LANDING_RESPONSE,
  );

  readonly state = signal<LandingState>('loading');

  readonly heroSlides = computed(() => this.landingResponse().heroSlides);
  readonly quickAccesses = computed(() => this.landingResponse().quickAccesses);
  readonly featuredBanners = computed(
    () => this.landingResponse().featuredBanners,
  );
  readonly landingNotices = computed(
    () => this.landingResponse().landingNotices,
  );
  readonly mostConsultedDocuments = computed(
    () => this.landingResponse().mostConsultedDocuments,
  );
  readonly communications = computed(
    () => this.landingResponse().communications,
  );

  readonly hasContent = computed(() => {
    const response = this.landingResponse();

    return Boolean(
      response.heroSlides.length ||
        response.quickAccesses.length ||
        response.featuredBanners.length ||
        response.communications.length ||
        response.mostConsultedDocuments.length,
    );
  });

  constructor() {
    this.loadLanding();
  }

  loadLanding(): void {
    this.state.set('loading');

    this.portalLandingService
      .getLanding()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.landingResponse.set(response);
          this.state.set('ready');
        },
        error: () => {
          this.landingResponse.set(EMPTY_LANDING_RESPONSE);
          this.state.set('error');
        },
      });
  }
}
