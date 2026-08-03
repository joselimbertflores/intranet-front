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
import { PortalLandingResponse, QuickAccessIconKey } from '../../models';
import {
  QUICK_ACCESS_ICON_REGISTRY,
  quickAccessIconName,
} from '../../constants/quick-access-icons';
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
  hasMoreQuickAccesses: false,
  featuredBanners: [],
  landingNotices: [],
  latestCommunications: [],
  mostDownloadedDocuments: [],
};

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
      ...QUICK_ACCESS_ICON_REGISTRY,
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
  readonly hasMoreQuickAccesses = computed(
    () => this.landingResponse().hasMoreQuickAccesses,
  );
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

  quickAccessIcon(iconKey: QuickAccessIconKey): string {
    return quickAccessIconName(iconKey);
  }

  documentCategory(document: PortalDocumentResponse): string {
    return [document.type, document.subtype].filter(Boolean).join(' / ');
  }
}
