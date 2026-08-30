import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  debounced,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideBookOpen,
  lucideCircleAlert,
  lucideGraduationCap,
  lucideRefreshCw,
  lucideSearch,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

import { PaginationControls } from '../../../../../shared';
import { PublicPageHeader } from '../../../components';
import { PortalTutorialDataSource } from '../../../services';

interface TutorialFiltersModel {
  category: string | null;
}

interface TutorialQueryState {
  term: string;
  category: string | null;
  page: number;
}

const PAGE_SIZE = 12;

@Component({
  selector: 'app-tutorials-page',
  imports: [
    DatePipe,
    FormField,
    FormRoot,
    HlmBadgeImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmSelectImports,
    HlmSkeletonImports,
    HlmSpinner,
    NgIcon,
    PaginationControls,
    PublicPageHeader,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideBookOpen,
      lucideCircleAlert,
      lucideGraduationCap,
      lucideRefreshCw,
      lucideSearch,
    }),
  ],
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

  readonly pageSize = PAGE_SIZE;
  readonly skeletonCards = Array.from({ length: 6 });
  readonly categoriesResource = rxResource({
    stream: () => this.dataSource.getCategories(),
  });
  readonly categories = computed(() => this.categoriesResource.value() ?? []);
  readonly categoryNames = computed(
    () => new Map(this.categories().map(({ slug, name }) => [slug, name])),
  );

  private readonly rawQueryState = computed(() =>
    this.parseQueryState(this.queryParamMap()),
  );
  readonly queryState = computed<TutorialQueryState>(() => {
    const state = this.rawQueryState();
    const category = this.categories().some(
      ({ slug }) => slug === state.category,
    )
      ? state.category
      : null;
    return { ...state, category };
  });
  readonly searchTerm = linkedSignal(() => this.rawQueryState().term);
  private readonly debouncedSearchTerm = debounced(this.searchTerm, 350);
  readonly filtersModel = linkedSignal<TutorialFiltersModel>(() => ({
    category: this.queryState().category,
  }));
  readonly filtersForm = form(this.filtersModel);
  readonly currentPage = computed(() => this.queryState().page);
  readonly hasActiveFilters = computed(
    () => Boolean(this.queryState().term) || this.queryState().category !== null,
  );

  readonly tutorialsResource = rxResource({
    params: () => {
      if (!this.categoriesResource.hasValue()) return undefined;
      const state = this.queryState();
      return {
        limit: PAGE_SIZE,
        offset: (state.page - 1) * PAGE_SIZE,
        ...(state.term && { term: state.term }),
        ...(state.category && { category: state.category }),
      };
    },
    stream: ({ params }) => this.dataSource.findAll(params),
  });
  readonly isInitialLoading = computed(
    () =>
      (!this.categoriesResource.hasValue() &&
        !this.categoriesResource.error()) ||
      (this.tutorialsResource.isLoading() &&
        !this.tutorialsResource.hasValue()),
  );
  readonly isUpdating = computed(
    () =>
      this.tutorialsResource.isLoading() && this.tutorialsResource.hasValue(),
  );

  constructor() {
    effect(() => {
      const term = this.normalizeTerm(this.debouncedSearchTerm.value());
      const state = this.queryState();
      if (term === state.term) return;
      untracked(() =>
        this.navigateToState({ ...state, term, page: 1 }, true),
      );
    });

    effect(() => {
      const paramMap = this.queryParamMap();
      if (!this.categoriesResource.hasValue()) return;
      const state = this.queryState();
      const params = this.toQueryParams(state);
      if (this.queryParamsMatch(paramMap, params)) return;
      untracked(() => this.navigateToState(state, true));
    });

    effect(() => {
      const response = this.tutorialsResource.value();
      const currentPage = this.currentPage();
      if (!response || this.tutorialsResource.isLoading()) return;

      const lastPage = Math.max(1, Math.ceil(response.total / PAGE_SIZE));
      if (currentPage <= lastPage) return;
      untracked(() =>
        this.navigateToState(
          { ...this.queryState(), page: lastPage },
          true,
        ),
      );
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) this.searchTerm.set(input.value);
  }

  filterByCategory(category: string | null | undefined): void {
    this.navigateToState(
      { ...this.queryState(), category: category ?? null, page: 1 },
      true,
    );
  }

  changePage(page: number): void {
    if (!Number.isInteger(page) || page < 1 || page === this.currentPage()) {
      return;
    }
    this.navigateToState({ ...this.queryState(), page }, false);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.navigateToState({ term: '', category: null, page: 1 }, true);
  }

  reloadCategories(): void {
    this.categoriesResource.reload();
  }

  private parseQueryState(paramMap: ParamMap): TutorialQueryState {
    const page = Number(paramMap.get('page'));
    const category = paramMap.get('category')?.trim().toLowerCase() || null;
    return {
      term: this.normalizeTerm(paramMap.get('q')).slice(0, 255),
      category:
        category && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)
          ? category
          : null,
      page: Number.isInteger(page) && page > 0 ? page : 1,
    };
  }

  private normalizeTerm(value: string | null | undefined): string {
    return value?.replace(/\s+/g, ' ').trim() ?? '';
  }

  private toQueryParams(state: TutorialQueryState): Params {
    const params: Params = {};
    if (state.term) params['q'] = state.term;
    if (state.category) params['category'] = state.category;
    if (state.page > 1) params['page'] = state.page;
    return params;
  }

  private queryParamsMatch(paramMap: ParamMap, params: Params): boolean {
    const currentKeys = paramMap.keys.filter(
      (key) => paramMap.get(key) !== null && paramMap.get(key) !== '',
    );
    const nextKeys = Object.keys(params);
    return (
      currentKeys.length === nextKeys.length &&
      nextKeys.every((key) => paramMap.get(key) === String(params[key]))
    );
  }

  private navigateToState(state: TutorialQueryState, replaceUrl: boolean): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.toQueryParams(state),
      replaceUrl,
      scroll: 'manual',
    });
  }
}
