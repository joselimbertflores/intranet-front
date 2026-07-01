import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { catchError, of } from 'rxjs';

import { LandingHeroSection, LandingQuickAccessSection } from './components';
import { PortalLandingService } from '../../services';

@Component({
  selector: 'landing-page',
  imports: [LandingHeroSection, LandingQuickAccessSection],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export default class LandingPage {
  private readonly portalLandingService = inject(PortalLandingService);

  private readonly landingResponse = toSignal(
    this.portalLandingService
      .getLanding()
      .pipe(catchError(() => of({ heroSlides: [], quickAccesses: [] }))),
    { initialValue: { heroSlides: [], quickAccesses: [] } },
  );

  readonly heroSlides = computed(() => this.landingResponse().heroSlides);
  readonly quickAccesses = computed(() => this.landingResponse().quickAccesses);
}
