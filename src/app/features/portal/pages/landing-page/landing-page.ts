import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { SkeletonModule } from 'primeng/skeleton';

import { PortalDataSource } from '../../services';
import {
  LandingHeroSection,
  LandingBannersSection,
  LandingDocumentsSection,
  LandingQuickAccessSection,
  LandingCommunicationsSection,
} from '../../components';

@Component({
  selector: 'landing-page',
  imports: [
    LandingHeroSection,
    LandingBannersSection,
    LandingDocumentsSection,
    LandingQuickAccessSection,
    LandingCommunicationsSection,
    AnimateOnScroll,
    SkeletonModule,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingPage {
  private readonly portalDataSource = inject(PortalDataSource);

  readonly data = this.portalDataSource.portalData;
  readonly isLoading = this.portalDataSource.isPortalLoading;
  readonly quickAccessSkeletons = Array.from({ length: 8 }, (_, index) => index);
  readonly communicationSkeletons = Array.from(
    { length: 3 },
    (_, index) => index,
  );
  readonly documentSkeletons = Array.from({ length: 5 }, (_, index) => index);
}
