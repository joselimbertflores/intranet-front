import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { catchError, of } from 'rxjs';

import {
  FeaturedBannersSection,
  LandingCommunicationsSection,
  LandingDocumentsSection,
  LandingHeroSection,
  LandingNotices,
  LandingQuickAccessSection,
} from './components';
import { PortalLandingService } from '../../services';

@Component({
  selector: 'landing-page',
  imports: [
    LandingHeroSection,
    LandingQuickAccessSection,
    FeaturedBannersSection,
    LandingNotices,
    LandingDocumentsSection,
    LandingCommunicationsSection,
  ],
  templateUrl: './landing-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './landing-page.css',
})
export default class LandingPage {
  private readonly portalLandingService = inject(PortalLandingService);

  private readonly landingResponse = toSignal(
    this.portalLandingService.getLanding().pipe(
      catchError(() =>
        of({
          heroSlides: [],
          quickAccesses: [],
          featuredBanners: [],
          landingNotices: [],
          mostConsultedDocuments: [],
          communications: [],
        }),
      ),
    ),
    {
      initialValue: {
        heroSlides: [],
        quickAccesses: [],
        featuredBanners: [],
        landingNotices: [],
        mostConsultedDocuments: [],
        communications: [],
      },
    },
  );

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
}
