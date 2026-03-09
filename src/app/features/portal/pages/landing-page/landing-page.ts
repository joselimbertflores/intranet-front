import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

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
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingPage {
  private readonly portalDataSource = inject(PortalDataSource);

  readonly data = this.portalDataSource.portalData;
}
