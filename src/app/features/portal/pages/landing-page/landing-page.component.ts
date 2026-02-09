import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollRestoreDirective } from '../../../../shared';
import {
  HeroSectionComponent,
  PortalLoaderComponent,
  FooterSectionComponent,
  QuickAccessSectionComponent,
  CommunicationsSectionComponent,
  MostDownloadedDocumentsSection,
} from '../../presentation/components';
import { PortalService } from '../../services';
import { CommonModule } from '@angular/common';
import { HeroSection } from '../../components/hero-section/hero-section';

@Component({
  selector: 'landing-page',
  imports: [
    CommonModule,
    HeroSectionComponent,
    PortalLoaderComponent,
    FooterSectionComponent,
    QuickAccessSectionComponent,
    CommunicationsSectionComponent,
    MostDownloadedDocumentsSection,
    ScrollRestoreDirective,
    HeroSection
  ],
  templateUrl: './landing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingPageComponent {
  private portalService = inject(PortalService);
  isLoading = this.portalService.isPortalLoading;
  portalData = this.portalService.portalData;
}
