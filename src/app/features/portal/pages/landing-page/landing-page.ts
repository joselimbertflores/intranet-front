import { DatePipe, NgOptimizedImage } from '@angular/common';
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
  lucideAppWindow,
  lucideArrowRight,
  lucideArrowUpRight,
  lucideBookOpen,
  lucideCalendarDays,
  lucideCarFront,
  lucideChartNoAxesColumn,
  lucideCircleHelp,
  lucideClipboardList,
  lucideDownload,
  lucideExternalLink,
  lucideFileText,
  lucideImageOff,
  lucideLandmark,
  lucideMail,
  lucideMegaphone,
  lucideRefreshCw,
  lucideUserRound,
} from '@ng-icons/lucide';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

import { FileIcon, FileSizePipe } from '../../../../shared';
import { PortalDocumentResponse } from '../../interfaces';
import { PortalLandingResponse } from '../../models';
import { PortalLandingService } from '../../services';
import {
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

@Component({
  selector: 'landing-page',
  imports: [
    DatePipe,
    FileIcon,
    FileSizePipe,
    HlmAlertImports,
    HlmButtonImports,
    HlmSkeletonImports,
    LandingHeroCarousel,
    LandingNoticesDialog,
    NgIcon,
    NgOptimizedImage,
    RouterLink,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    provideIcons({
      lucideAppWindow,
      lucideArrowRight,
      lucideArrowUpRight,
      lucideBookOpen,
      lucideCalendarDays,
      lucideCarFront,
      lucideChartNoAxesColumn,
      lucideCircleHelp,
      lucideClipboardList,
      lucideDownload,
      lucideExternalLink,
      lucideFileText,
      lucideImageOff,
      lucideLandmark,
      lucideMail,
      lucideMegaphone,
      lucideRefreshCw,
      lucideUserRound,
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
  readonly failedBannerImages = signal<ReadonlySet<number>>(new Set());
  readonly failedCommunicationImages = signal<ReadonlySet<string>>(new Set());

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
  readonly visibleCommunications = computed(() =>
    this.communications().slice(0, 4),
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
      email: 'lucideMail',
      application: 'lucideAppWindow',
      document: 'lucideFileText',
      book: 'lucideBookOpen',
      form: 'lucideClipboardList',
      report: 'lucideChartNoAxesColumn',
      calendar: 'lucideCalendarDays',
      user: 'lucideUserRound',
      support: 'lucideCircleHelp',
      finance: 'lucideLandmark',
      vehicle: 'lucideCarFront',
      'external-link': 'lucideExternalLink',
    };

    return icons[iconKey] ?? 'lucideExternalLink';
  }

  isInternalUrl(url: string | null): boolean {
    return Boolean(url?.startsWith('/'));
  }

  validUrl(url: string | null): string | null {
    if (!url) return null;
    return this.isInternalUrl(url) || /^https?:\/\//i.test(url) ? url : null;
  }

  documentCategory(document: PortalDocumentResponse): string {
    return [document.type, document.subtype].filter(Boolean).join(' / ');
  }

  markBannerImageAsFailed(id: number): void {
    this.failedBannerImages.update((failed) => new Set(failed).add(id));
  }

  markCommunicationImageAsFailed(id: string): void {
    this.failedCommunicationImages.update(
      (failed) => new Set(failed).add(id),
    );
  }
}
