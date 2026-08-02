import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  debounced,
  effect,
  inject,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideRefreshCw, lucideSearch } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';

import { PaginationControls } from '../../../../../shared';
import { PublicSectionHeader } from '../../../components';
import { PortalTutorialDataSource } from '../../../services';

const PAGE_SIZES = [12, 24, 48] as const;

@Component({
  selector: 'app-tutorials-page',
  imports: [
    DatePipe,
    FormsModule,
    HlmBadge,
    HlmButtonImports,
    HlmInputGroupImports,
    HlmSelectImports,
    HlmSkeleton,
    NgIcon,
    PaginationControls,
    PublicSectionHeader,
    RouterLink,
  ],
  providers: [provideIcons({ lucideArrowRight, lucideRefreshCw, lucideSearch })],
  templateUrl: './tutorials-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataSource = inject(PortalTutorialDataSource);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly pageSizeOptions = [...PAGE_SIZES];
  readonly listState = computed(() => {
    const params = this.queryParamMap();
    const requestedLimit = Number(params.get('limit'));
    const requestedOffset = Number(params.get('offset'));
    const limit = PAGE_SIZES.includes(requestedLimit as (typeof PAGE_SIZES)[number])
      ? requestedLimit
      : 12;
    const offset =
      Number.isInteger(requestedOffset) && requestedOffset >= 0
        ? requestedOffset
        : 0;
    return {
      term: params.get('term')?.trim() ?? '',
      category: params.get('category')?.trim() ?? '',
      limit,
      offset,
    };
  });

  readonly searchTerm = linkedSignal(() => this.listState().term);
  readonly debouncedSearchTerm = debounced(this.searchTerm, 300);
  readonly currentPage = computed(
    () => Math.floor(this.listState().offset / this.listState().limit) + 1,
  );

  readonly categoriesResource = rxResource({
    stream: () => this.dataSource.getCategories(),
  });
  readonly tutorialsResource = rxResource({
    params: () => this.listState(),
    stream: ({ params }) =>
      this.dataSource.findAll({
        limit: params.limit,
        offset: params.offset,
        ...(params.term && { term: params.term }),
        ...(params.category && { category: params.category }),
      }),
  });
  readonly isLoading = computed(
    () => this.debouncedSearchTerm.isLoading() || this.tutorialsResource.isLoading(),
  );

  constructor() {
    effect(() => {
      const params = this.queryParamMap();
      const state = this.listState();
      if (
        params.get('limit') !== String(state.limit) ||
        params.get('offset') !== String(state.offset)
      ) {
        this.updateQuery({ limit: state.limit, offset: state.offset });
      }
    });

    effect(() => {
      const term = this.debouncedSearchTerm.value().trim();
      if (term === this.listState().term) return;
      this.updateQuery({
        term: term || null,
        limit: this.listState().limit,
        offset: 0,
      });
    });
  }

  filterByCategory(category: string | null | undefined): void {
    this.updateQuery({
      category: category || null,
      limit: this.listState().limit,
      offset: 0,
    });
  }

  changePage(page: number): void {
    this.updateQuery({ offset: (page - 1) * this.listState().limit });
  }

  changePageSize(limit: number): void {
    this.updateQuery({ limit, offset: 0 });
  }

  private updateQuery(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
      scroll: 'manual',
    });
  }
}
