import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  debounced,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { disabled, form, FormField, FormRoot } from '@angular/forms/signals';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronDown,
  lucideChevronUp,
  lucideCircleAlert,
  lucideFileSearch,
  lucideFilter,
  lucideRefreshCw,
  lucideSearch,
  lucideX,
} from '@ng-icons/lucide';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

import {
  HierarchicalCombobox,
  HierarchicalComboboxItem,
  PaginationControls,
  YearSelector,
} from '../../../../shared';
import {
  DocSectionFilterResponse,
  DocumentFiltersResponse,
} from '../../interfaces';
import {
  PortalDocumentDataSource,
  SearchPublicDocumentsParams,
} from '../../services';
import { PublicPageHeader } from '../../components';
import { PortalDocumentListItem } from './components/portal-document-list-item/portal-document-list-item';

interface DocumentFiltersModel {
  organizationalUnitId: number | null;
  documentType: string | null;
  documentSubtype: string | null;
  year: number | null;
}

interface DocumentQueryState {
  searchTerm: string;
  organizationalUnit: string | null;
  documentType: string | null;
  documentSubtype: string | null;
  year: number | null;
  page: number;
}

interface PortalOrganizationalUnitData {
  readonly items: readonly HierarchicalComboboxItem[];
  readonly idBySlug: ReadonlyMap<string, number>;
  readonly slugById: ReadonlyMap<number, string>;
  readonly nameById: ReadonlyMap<number, string>;
}

type ActiveFilterKey = 'search' | 'unit' | 'type' | 'subtype' | 'year';

interface ActiveFilterChip {
  readonly key: ActiveFilterKey;
  readonly label: string;
}

const PAGE_SIZE = 20;
const MIN_YEAR = 2000;
const MAX_YEAR = new Date().getFullYear() + 1;

const EMPTY_FILTERS: Readonly<DocumentFiltersModel> = {
  organizationalUnitId: null,
  documentType: null,
  documentSubtype: null,
  year: null,
};

@Component({
  selector: 'app-documents-page',
  imports: [
    FormField,
    FormRoot,
    HierarchicalCombobox,
    HlmAlertImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCollapsibleImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmSelectImports,
    HlmSkeletonImports,
    HlmSpinner,
    NgIcon,
    PaginationControls,
    PortalDocumentListItem,
    PublicPageHeader,
    YearSelector,
  ],
  providers: [
    provideIcons({
      lucideChevronDown,
      lucideChevronUp,
      lucideCircleAlert,
      lucideFileSearch,
      lucideFilter,
      lucideRefreshCw,
      lucideSearch,
      lucideX,
    }),
  ],
  templateUrl: './documents-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocumentsPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly documentDataSource = inject(PortalDocumentDataSource);

  readonly pageSize = PAGE_SIZE;
  readonly minYear = MIN_YEAR;
  readonly maxYear = MAX_YEAR;
  readonly skeletonRows = Array.from({ length: 6 });

  readonly catalogResource =
    this.documentDataSource.documentFiltersResource;
  private readonly catalogs = computed(() =>
    this.catalogResource.hasValue()
      ? this.catalogResource.value()
      : undefined,
  );
  private readonly routeQueryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly routeStateReady = signal(false);

  readonly searchTerm = signal('');
  private readonly appliedSearchTerm = signal('');
  private readonly debouncedSearchTerm = debounced(this.searchTerm, 350);
  private readonly pendingNavigationSearchTerm = signal<string | null>(null);

  readonly filtersModel = signal<DocumentFiltersModel>({ ...EMPTY_FILTERS });
  readonly filtersForm = form(this.filtersModel, (schemaPath) => {
    disabled(schemaPath.documentSubtype, {
      when: ({ valueOf }) => {
        const selectedType = valueOf(schemaPath.documentType);
        if (!selectedType) return true;

        return !this.types().some(
          ({ slug, subtypes }) =>
            slug === selectedType && subtypes.length > 0,
        );
      },
    });
  });

  readonly page = signal(1);
  readonly advancedFiltersOpen = signal(false);
  private readonly filtersTop = viewChild<ElementRef<HTMLElement>>('filtersTop');
  private applyingNavigationState = false;

  readonly organizationalUnitData = computed<PortalOrganizationalUnitData>(
    () => this.mapOrganizationalUnits(this.catalogs()),
  );

  readonly types = computed(
    () => this.catalogs()?.types ?? [],
  );

  readonly subtypes = computed(() => {
    const selectedType = this.filtersModel().documentType;
    if (!selectedType) return [];

    return (
      this.types().find(({ slug }) => slug === selectedType)?.subtypes ?? []
    );
  });

  readonly typeNames = computed(
    () => new Map(this.types().map(({ slug, name }) => [slug, name])),
  );

  readonly subtypeNames = computed(
    () => new Map(this.subtypes().map(({ slug, name }) => [slug, name])),
  );

  readonly activeSecondaryFiltersCount = computed(() =>
    Object.values(this.filtersModel()).filter(
      (value) => value !== null && value !== '',
    ).length,
  );

  readonly hasActiveFilters = computed(
    () =>
      this.appliedSearchTerm().length > 0 ||
      this.activeSecondaryFiltersCount() > 0,
  );

  readonly activeFilterChips = computed<readonly ActiveFilterChip[]>(() => {
    const filters = this.filtersModel();
    const chips: ActiveFilterChip[] = [];

    if (this.appliedSearchTerm()) {
      chips.push({
        key: 'search',
        label: `Búsqueda: ${this.appliedSearchTerm()}`,
      });
    }
    if (filters.organizationalUnitId !== null) {
      const unitName = this.organizationalUnitData().nameById.get(
        filters.organizationalUnitId,
      );
      if (unitName) chips.push({ key: 'unit', label: unitName });
    }
    if (filters.documentType) {
      const typeName = this.typeNames().get(filters.documentType);
      if (typeName) chips.push({ key: 'type', label: typeName });
    }
    if (filters.documentSubtype) {
      const subtypeName = this.subtypeNames().get(filters.documentSubtype);
      if (subtypeName) chips.push({ key: 'subtype', label: subtypeName });
    }
    if (filters.year !== null) {
      chips.push({ key: 'year', label: `Gestión ${filters.year}` });
    }

    return chips;
  });

  readonly documentsResource = rxResource({
    params: (): SearchPublicDocumentsParams | undefined => {
      if (!this.routeStateReady() || !this.catalogResource.hasValue()) {
        return undefined;
      }

      const filters = this.filtersModel();
      return {
        limit: PAGE_SIZE,
        offset: (this.page() - 1) * PAGE_SIZE,
        term: this.appliedSearchTerm() || null,
        organizationalUnit:
          filters.organizationalUnitId === null
            ? null
            : (this.organizationalUnitData().slugById.get(
                filters.organizationalUnitId,
              ) ?? null),
        type: filters.documentType,
        subtype: filters.documentSubtype,
        year: filters.year,
      };
    },
    stream: ({ params }) =>
      this.documentDataSource.searchDocuments(params),
  });

  readonly isInitialLoading = computed(
    () =>
      (!this.catalogResource.hasValue() &&
        !this.catalogResource.error()) ||
      (this.documentsResource.isLoading() &&
        !this.documentsResource.hasValue()),
  );

  readonly isUpdating = computed(
    () =>
      this.documentsResource.isLoading() &&
      this.documentsResource.hasValue(),
  );

  constructor() {
    effect(() => {
      const paramMap = this.routeQueryParamMap();
      const catalogs = this.catalogs();
      if (!catalogs) return;

      const queryState = this.validateQueryState(
        this.parseQueryParams(paramMap),
        catalogs,
      );

      untracked(() => {
        this.applyNavigationState(queryState);
        this.routeStateReady.set(true);

        const normalizedParams = this.toQueryParams(queryState);
        if (!this.queryParamsMatch(paramMap, normalizedParams)) {
          this.navigateToQuery(queryState, true);
        }
      });
    });

    effect(() => {
      const debouncedTerm = this.normalizeString(
        this.debouncedSearchTerm.value(),
      );
      const ready = this.routeStateReady();
      const pendingNavigationTerm = this.pendingNavigationSearchTerm();
      if (!ready) return;

      if (pendingNavigationTerm !== null) {
        if (debouncedTerm === pendingNavigationTerm) {
          untracked(() => this.pendingNavigationSearchTerm.set(null));
        }
        return;
      }

      untracked(() => {
        if (debouncedTerm === this.appliedSearchTerm()) return;

        this.appliedSearchTerm.set(debouncedTerm);
        this.page.set(1);
        this.navigateFromCurrentState(true);
      });
    });

    effect(() => {
      const response = this.documentsResource.hasValue()
        ? this.documentsResource.value()
        : undefined;
      const isLoading = this.documentsResource.isLoading();
      const currentPage = this.page();
      if (!response || isLoading) return;

      const lastPage = Math.max(1, Math.ceil(response.total / PAGE_SIZE));
      if (currentPage <= lastPage) return;

      untracked(() => {
        this.page.set(lastPage);
        this.navigateFromCurrentState(true);
      });
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    this.pendingNavigationSearchTerm.set(null);
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    if (!this.searchTerm() && !this.appliedSearchTerm()) return;

    this.searchTerm.set('');
    this.appliedSearchTerm.set('');
    this.pendingNavigationSearchTerm.set(null);
    this.page.set(1);
    this.navigateFromCurrentState(true);
  }

  changeOrganizationalUnit(value: number | null | undefined): void {
    if (this.applyingNavigationState) return;
    this.applyFilterChange({ organizationalUnitId: value ?? null });
  }

  changeDocumentType(value: string | null | undefined): void {
    if (this.applyingNavigationState) return;
    this.applyFilterChange({
      documentType: this.normalizeNullableString(value),
      documentSubtype: null,
    });
  }

  changeDocumentSubtype(value: string | null | undefined): void {
    if (this.applyingNavigationState) return;
    this.applyFilterChange({
      documentSubtype: this.normalizeNullableString(value),
    });
  }

  changeYear(value: number | null): void {
    if (this.applyingNavigationState) return;
    this.applyFilterChange({ year: value });
  }

  changePage(page: number): void {
    if (!Number.isInteger(page) || page < 1 || page === this.page()) return;

    this.page.set(page);
    this.navigateFromCurrentState(false);
    this.filtersTop()?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  removeActiveFilter(key: ActiveFilterKey): void {
    if (key === 'search') {
      this.clearSearch();
      return;
    }

    switch (key) {
      case 'unit':
        this.applyFilterChange({ organizationalUnitId: null });
        break;
      case 'type':
        this.applyFilterChange({
          documentType: null,
          documentSubtype: null,
        });
        break;
      case 'subtype':
        this.applyFilterChange({ documentSubtype: null });
        break;
      case 'year':
        this.applyFilterChange({ year: null });
        break;
    }
  }

  resetFilters(): void {
    this.applyingNavigationState = true;
    this.searchTerm.set('');
    this.appliedSearchTerm.set('');
    this.pendingNavigationSearchTerm.set(null);
    this.filtersForm().reset({ ...EMPTY_FILTERS });
    this.page.set(1);
    this.advancedFiltersOpen.set(false);
    this.navigateFromCurrentState(true);
    queueMicrotask(() => (this.applyingNavigationState = false));
  }

  toggleAdvancedFilters(): void {
    this.advancedFiltersOpen.update((open) => !open);
  }

  reloadCatalogs(): void {
    this.documentDataSource.reloadDocumentFilters();
  }

  private applyFilterChange(changes: Partial<DocumentFiltersModel>): void {
    this.applyingNavigationState = true;
    this.filtersModel.update((filters) => ({ ...filters, ...changes }));
    this.page.set(1);
    this.navigateFromCurrentState(true);
    queueMicrotask(() => (this.applyingNavigationState = false));
  }

  private applyNavigationState(state: DocumentQueryState): void {
    this.applyingNavigationState = true;
    this.pendingNavigationSearchTerm.set(state.searchTerm);
    const nextFilters: DocumentFiltersModel = {
      organizationalUnitId: state.organizationalUnit
        ? (this.organizationalUnitData().idBySlug.get(
            state.organizationalUnit,
          ) ?? null)
        : null,
      documentType: state.documentType,
      documentSubtype: state.documentSubtype,
      year: state.year,
    };

    if (this.searchTerm() !== state.searchTerm) {
      this.searchTerm.set(state.searchTerm);
    }
    if (this.appliedSearchTerm() !== state.searchTerm) {
      this.appliedSearchTerm.set(state.searchTerm);
    }
    if (!this.filtersEqual(this.filtersModel(), nextFilters)) {
      this.filtersForm().reset(nextFilters);
    }
    if (this.page() !== state.page) this.page.set(state.page);
    queueMicrotask(() => (this.applyingNavigationState = false));
  }

  private parseQueryParams(paramMap: ParamMap): DocumentQueryState {
    return {
      searchTerm: this.normalizeString(paramMap.get('q')).slice(0, 255),
      organizationalUnit: this.normalizeNullableString(paramMap.get('unit')),
      documentType: this.normalizeNullableString(paramMap.get('type')),
      documentSubtype: this.normalizeNullableString(paramMap.get('subtype')),
      year: this.parseInteger(paramMap.get('year')),
      page: this.parsePage(paramMap.get('page')),
    };
  }

  private validateQueryState(
    state: DocumentQueryState,
    catalogs: DocumentFiltersResponse,
  ): DocumentQueryState {
    const organizationalUnits = this.flattenOrganizationalUnits(
      catalogs.organizationalUnits,
    );
    const organizationalUnit = organizationalUnits.some(
      ({ slug }) => slug === state.organizationalUnit,
    )
      ? state.organizationalUnit
      : null;

    const selectedType = catalogs.types.find(
      ({ slug }) => slug === state.documentType,
    );
    const documentType = selectedType?.slug ?? null;
    const documentSubtype = selectedType?.subtypes.some(
      ({ slug }) => slug === state.documentSubtype,
    )
      ? state.documentSubtype
      : null;

    const year =
      state.year !== null &&
      state.year >= MIN_YEAR &&
      state.year <= MAX_YEAR
        ? state.year
        : null;

    return {
      ...state,
      organizationalUnit,
      documentType,
      documentSubtype,
      year,
    };
  }

  private toQueryParams(state: DocumentQueryState): Params {
    const params: Params = {};

    if (state.searchTerm) params['q'] = state.searchTerm;
    if (state.organizationalUnit) params['unit'] = state.organizationalUnit;
    if (state.documentType) params['type'] = state.documentType;
    if (state.documentSubtype) params['subtype'] = state.documentSubtype;
    if (state.year !== null) params['year'] = state.year;
    if (state.page > 1) params['page'] = state.page;

    return params;
  }

  private currentQueryState(): DocumentQueryState {
    const filters = this.filtersModel();
    return {
      searchTerm: this.appliedSearchTerm(),
      organizationalUnit:
        filters.organizationalUnitId === null
          ? null
          : (this.organizationalUnitData().slugById.get(
              filters.organizationalUnitId,
            ) ?? null),
      documentType: filters.documentType,
      documentSubtype: filters.documentSubtype,
      year: filters.year,
      page: this.page(),
    };
  }

  private navigateFromCurrentState(replaceUrl: boolean): void {
    const state = this.currentQueryState();
    const params = this.toQueryParams(state);
    if (this.queryParamsMatch(this.routeQueryParamMap(), params)) return;

    this.navigateToQuery(state, replaceUrl);
  }

  private navigateToQuery(
    state: DocumentQueryState,
    replaceUrl: boolean,
  ): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.toQueryParams(state),
      replaceUrl,
    });
  }

  private queryParamsMatch(paramMap: ParamMap, params: Params): boolean {
    const expectedKeys = Object.keys(params).sort();
    const actualKeys = [...paramMap.keys].sort();

    if (expectedKeys.length !== actualKeys.length) return false;
    return expectedKeys.every(
      (key, index) =>
        key === actualKeys[index] &&
        paramMap.getAll(key).length === 1 &&
        paramMap.get(key) === String(params[key]),
    );
  }

  private mapOrganizationalUnits(
    catalogs: DocumentFiltersResponse | undefined,
  ): PortalOrganizationalUnitData {
    const idBySlug = new Map<string, number>();
    const slugById = new Map<number, string>();
    const nameById = new Map<number, string>();

    const toItems = (
      nodes: readonly DocSectionFilterResponse[],
      parentNames: readonly string[] = [],
      depth = 0,
    ): readonly HierarchicalComboboxItem[] =>
      nodes.map((node) => {
        const path = [...parentNames, node.name];
        idBySlug.set(node.slug, node.id);
        slugById.set(node.id, node.slug);
        nameById.set(node.id, node.name);

        return {
          id: node.id,
          name: node.name,
          depth,
          parentPath: parentNames.join(' / '),
          searchText: path.join(' / '),
          children: toItems(node.children, path, depth + 1),
        };
      });

    return {
      items: toItems(catalogs?.organizationalUnits ?? []),
      idBySlug,
      slugById,
      nameById,
    };
  }

  private flattenOrganizationalUnits(
    nodes: readonly DocSectionFilterResponse[],
  ): readonly DocSectionFilterResponse[] {
    return nodes.flatMap((node) => [
      node,
      ...this.flattenOrganizationalUnits(node.children),
    ]);
  }

  private filtersEqual(
    first: DocumentFiltersModel,
    second: DocumentFiltersModel,
  ): boolean {
    return (
      first.organizationalUnitId === second.organizationalUnitId &&
      first.documentType === second.documentType &&
      first.documentSubtype === second.documentSubtype &&
      first.year === second.year
    );
  }

  private normalizeString(value: string | null | undefined): string {
    return value?.trim() ?? '';
  }

  private normalizeNullableString(
    value: string | null | undefined,
  ): string | null {
    return this.normalizeString(value) || null;
  }

  private parseInteger(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  }

  private parsePage(value: string | null): number {
    const page = this.parseInteger(value);
    return page !== null && page >= 1 ? page : 1;
  }
}
