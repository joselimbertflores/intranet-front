import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  LOCALE_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideDownload,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

import { FileIcon, FileSizePipe } from '../../../../shared';
import { PortalDocumentResponse } from '../../interfaces';
import { PortalLandingResponse } from '../../models';
import { PortalLandingService } from '../../services';
import {
  FeaturedBannersSection,
  LandingCommunicationsSection,
  LandingHeroCarousel,
  LandingNoticesDialog,
} from './components';

type LandingState = 'loading' | 'ready' | 'error';

const EMPTY_LANDING_RESPONSE: PortalLandingResponse = {
  heroSlides: [],
  quickAccesses: [],
  featuredBanners: [],
  landingNotices: [],
  latestCommunications: [],
  mostDownloadedDocuments: [],
};

const quickAccessEmailFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/></svg>`;
const quickAccessApplicationFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM8 17H5v-3h3v3Zm0-5H5V9h3v3Zm0-5H5V5h3v2Zm11 10H10V9h9v8Z"/></svg>`;
const quickAccessDocumentFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm1 15H7v-2h8v2Zm2-4H7v-2h10v2Zm-4-4V3.5L18.5 9H13Z"/></svg>`;
const quickAccessBookFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H8a4 4 0 0 0-4 4v13a3 3 0 0 0 3 3h12a1 1 0 0 0 1-1V4a2 2 0 0 0-2-2Zm0 16H8a3.9 3.9 0 0 0-2 .54V6a2 2 0 0 1 2-2h10v14Z"/></svg>`;
const quickAccessFormFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18A3 3 0 0 0 9.18 3H5a2 2 0 0 0-2 2v16h18V5a2 2 0 0 0-2-2Zm-7-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-1 15H7v-2h4v2Zm6-4H7v-2h10v2Zm0-4H7V7h10v2Z"/></svg>`;
const quickAccessReportFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 9h3v10H5V9Zm5-4h4v14h-4V5Zm6 7h3v7h-3v-7ZM3 21h18v2H3v-2Z"/></svg>`;
const quickAccessCalendarFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a3 3 0 0 0-3 3v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a3 3 0 0 0-3-3Zm1 16H4V10h16v10ZM4 8V7a1 1 0 0 1 1-1h1v2h2V6h8v2h2V6h1a1 1 0 0 1 1 1v1H4Z"/><path d="M7 13h4v4H7z"/></svg>`;
const quickAccessUserFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 6v2h16v-2c0-3.33-2.67-6-8-6Z"/></svg>`;
const quickAccessSupportFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h4a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9h-1Z"/></svg>`;
const quickAccessFinanceFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 10 5v2H2V7l10-5ZM4 11h3v7H4v-7Zm6 0h4v7h-4v-7Zm7 0h3v7h-3v-7ZM2 20h20v2H2v-2Z"/></svg>`;
const quickAccessVehicleFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="m18.92 6.01-1.2-3.6A2 2 0 0 0 15.82 1H8.18a2 2 0 0 0-1.9 1.41l-1.2 3.6A3 3 0 0 0 3 9v8a2 2 0 0 0 2 2v2h2v-2h10v2h2v-2a2 2 0 0 0 2-2V9a3 3 0 0 0-2.08-2.99ZM8.18 3h7.64l1 3H7.18l1-3ZM7 15a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg>`;
const quickAccessExternalLinkFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h6V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-2v6ZM13 3v2h4.59l-9.3 9.29 1.42 1.42L19 6.41V11h2V3h-8Z"/></svg>`;

@Component({
  selector: 'landing-page',
  imports: [
    FileIcon,
    FileSizePipe,
    FeaturedBannersSection,
    HlmAlertImports,
    HlmButtonImports,
    HlmSkeletonImports,
    LandingCommunicationsSection,
    LandingHeroCarousel,
    LandingNoticesDialog,
    NgIcon,
    RouterLink,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    provideIcons({
      lucideArrowRight,
      lucideDownload,
      lucideRefreshCw,
      quickAccessApplicationFilled,
      quickAccessBookFilled,
      quickAccessCalendarFilled,
      quickAccessDocumentFilled,
      quickAccessEmailFilled,
      quickAccessExternalLinkFilled,
      quickAccessFinanceFilled,
      quickAccessFormFilled,
      quickAccessReportFilled,
      quickAccessSupportFilled,
      quickAccessUserFilled,
      quickAccessVehicleFilled,
    }),
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  readonly communications = computed(
    () => this.landingResponse().latestCommunications,
  );
  readonly mostDownloadedDocuments = computed(
    () => this.landingResponse().mostDownloadedDocuments,
  );
  readonly visibleDocuments = computed(() =>
    this.mostDownloadedDocuments().slice(0, 6),
  );

  readonly hasContent = computed(() => {
    const response = this.landingResponse();

    return Boolean(
      response.heroSlides.length ||
        response.quickAccesses.length ||
        response.featuredBanners.length ||
        response.landingNotices.length ||
        response.latestCommunications.length ||
        response.mostDownloadedDocuments.length,
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

  quickAccessIcon(iconKey: string): string {
    const icons: Readonly<Record<string, string>> = {
      email: 'quickAccessEmailFilled',
      application: 'quickAccessApplicationFilled',
      document: 'quickAccessDocumentFilled',
      book: 'quickAccessBookFilled',
      form: 'quickAccessFormFilled',
      report: 'quickAccessReportFilled',
      calendar: 'quickAccessCalendarFilled',
      user: 'quickAccessUserFilled',
      support: 'quickAccessSupportFilled',
      finance: 'quickAccessFinanceFilled',
      vehicle: 'quickAccessVehicleFilled',
      'external-link': 'quickAccessExternalLinkFilled',
    };

    return icons[iconKey] ?? 'quickAccessExternalLinkFilled';
  }

  documentCategory(document: PortalDocumentResponse): string {
    return [document.type, document.subtype].filter(Boolean).join(' / ');
  }
}
