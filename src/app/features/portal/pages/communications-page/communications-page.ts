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
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleAlert,
  lucideExternalLink,
  lucideFileSearch,
  lucideRefreshCw,
  lucideSearch,
  lucideX,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { PaginationControls } from '../../../../shared';
import { PublicPageHeader } from '../../components';
import { PortalCommunicationDataSource } from '../../services';

interface CommunicationFiltersModel {
  typeId: number | null;
}

interface CommunicationQueryState {
  term: string;
  typeId: number | null;
  page: number;
}

const PAGE_SIZE = 10;

@Component({
  selector: 'app-communications-page',
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
    HlmTableImports,
    NgIcon,
    PaginationControls,
    PublicPageHeader,
  ],
  providers: [
    provideIcons({
      lucideCircleAlert,
      lucideExternalLink,
      lucideFileSearch,
      lucideRefreshCw,
      lucideSearch,
      lucideX,
    }),
  ],
  templateUrl: './communications-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly communicationDataSource = inject(
    PortalCommunicationDataSource,
  );
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly pageSize = PAGE_SIZE;
  readonly skeletonRows = Array.from({ length: 6 });
  readonly typesResource = this.communicationDataSource.typesResource;
  readonly types = computed(() => this.typesResource.value() ?? []);
  readonly typeNames = computed(
    () => new Map(this.types().map(({ id, name }) => [id, name])),
  );

  private readonly rawQueryState = computed(() =>
    this.parseQueryState(this.queryParamMap()),
  );
  readonly queryState = computed<CommunicationQueryState>(() => {
    const state = this.rawQueryState();
    const typeId = this.types().some(({ id }) => id === state.typeId)
      ? state.typeId
      : null;
    return { ...state, typeId };
  });

  readonly searchTerm = linkedSignal(() => this.rawQueryState().term);
  private readonly debouncedSearchTerm = debounced(this.searchTerm, 350);
  readonly filtersModel = linkedSignal<CommunicationFiltersModel>(() => ({
    typeId: this.queryState().typeId,
  }));
  readonly filtersForm = form(this.filtersModel);

  readonly hasActiveFilters = computed(
    () => Boolean(this.queryState().term) || this.queryState().typeId !== null,
  );
  readonly currentPage = computed(() => this.queryState().page);

  readonly communicationResource = rxResource({
    params: () => {
      if (!this.typesResource.hasValue()) return undefined;
      const state = this.queryState();
      return {
        limit: PAGE_SIZE,
        offset: (state.page - 1) * PAGE_SIZE,
        term: state.term || null,
        typeId: state.typeId,
      };
    },
    stream: ({ params }) => this.communicationDataSource.getData(params),
  });

  readonly isInitialLoading = computed(
    () =>
      (!this.typesResource.hasValue() && !this.typesResource.error()) ||
      (this.communicationResource.isLoading() &&
        !this.communicationResource.hasValue()),
  );
  readonly isUpdating = computed(
    () =>
      this.communicationResource.isLoading() &&
      this.communicationResource.hasValue(),
  );

  constructor() {
    effect(() => {
      const term = this.normalizeTerm(this.debouncedSearchTerm.value());
      const current = this.queryState();
      if (term === current.term) return;

      untracked(() =>
        this.navigateToState({ ...current, term, page: 1 }, true),
      );
    });

    effect(() => {
      const paramMap = this.queryParamMap();
      if (!this.typesResource.hasValue()) return;

      const state = this.queryState();
      const normalizedParams = this.toQueryParams(state);
      if (this.queryParamsMatch(paramMap, normalizedParams)) return;

      untracked(() => this.navigateToState(state, true));
    });

    effect(() => {
      const response = this.communicationResource.value();
      const currentPage = this.currentPage();
      if (!response || this.communicationResource.isLoading()) return;

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

  clearSearch(): void {
    this.searchTerm.set('');
    this.navigateToState({ ...this.queryState(), term: '', page: 1 }, true);
  }

  changeType(typeId: number | null | undefined): void {
    this.navigateToState(
      { ...this.queryState(), typeId: typeId ?? null, page: 1 },
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
    this.navigateToState({ term: '', typeId: null, page: 1 }, true);
  }

  reloadTypes(): void {
    this.communicationDataSource.reloadTypes();
  }

  private parseQueryState(paramMap: ParamMap): CommunicationQueryState {
    const parsedTypeId = Number(paramMap.get('type'));
    const parsedPage = Number(paramMap.get('page'));
    return {
      term: this.normalizeTerm(paramMap.get('q')).slice(0, 255),
      typeId:
        Number.isInteger(parsedTypeId) && parsedTypeId > 0
          ? parsedTypeId
          : null,
      page:
        Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    };
  }

  private normalizeTerm(value: string | null | undefined): string {
    return value?.replace(/\s+/g, ' ').trim() ?? '';
  }

  private toQueryParams(state: CommunicationQueryState): Params {
    const params: Params = {};
    if (state.term) params['q'] = state.term;
    if (state.typeId !== null) params['type'] = state.typeId;
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

  private navigateToState(
    state: CommunicationQueryState,
    replaceUrl: boolean,
  ): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.toQueryParams(state),
      replaceUrl,
      scroll: 'manual',
    });
  }
}
