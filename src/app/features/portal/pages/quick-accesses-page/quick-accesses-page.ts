import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCircleAlert,
  lucideExternalLink,
  lucideRefreshCw,
  lucideSearch,
  lucideSearchX,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

import { QUICK_ACCESS_ICONS } from '../../../../shared/constants/quick-access-icons';
import { PublicPageHeader } from '../../components';
import { PortalLandingDataSource } from '../../services';

@Component({
  selector: 'app-quick-accesses-page',
  imports: [
    HlmButtonImports,
    HlmInputGroupImports,
    HlmSkeletonImports,
    NgIcon,
    PublicPageHeader,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCircleAlert,
      lucideExternalLink,
      lucideRefreshCw,
      lucideSearch,
      lucideSearchX,
      lucideX,
      ...QUICK_ACCESS_ICONS,
    }),
  ],
  host: { class: 'block' },
  templateUrl: './quick-accesses-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QuickAccessesPage {
  private readonly portalLandingService = inject(PortalLandingDataSource);

  readonly quickAccessesResource = rxResource({
    stream: () => this.portalLandingService.getQuickAccesses(),
  });
  readonly searchTerm = signal('');
  readonly filteredQuickAccesses = computed(() => {
    const quickAccesses = this.quickAccessesResource.value() ?? [];
    const term = this.normalizeSearchValue(this.searchTerm());

    if (!term) return quickAccesses;

    return quickAccesses.filter(({ title, description }) =>
      this.normalizeSearchValue(`${title} ${description ?? ''}`).includes(term),
    );
  });
  readonly skeletonItems = Array.from({ length: 8 });

  onSearchInput(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  private normalizeSearchValue(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .trim();
  }
}
