import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  debounced,
  effect,
  inject,
  linkedSignal,
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
  lucideChevronLeft,
  lucideChevronRight,
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
  PortalDocumentResponse,
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
  validityStatus: DocumentValidityStatus | null;
}

interface DocumentQueryState {
  searchTerm: string;
  organizationalUnit: string | null;
  documentType: string | null;
  documentSubtype: string | null;
  year: number | null;
  validityStatus: DocumentValidityStatus | null;
  page: number;
}

interface PortalOrganizationalUnitData {
  readonly items: readonly HierarchicalComboboxItem[];
  readonly idBySlug: ReadonlyMap<string, number>;
  readonly slugById: ReadonlyMap<number, string>;
}

type DocumentValidityStatus = PortalDocumentResponse['validityStatus'];

const PAGE_SIZE = 20;
const MIN_YEAR = 2000;
const MAX_YEAR = new Date().getFullYear() + 1;

const EMPTY_FILTERS: Readonly<DocumentFiltersModel> = {
  organizationalUnitId: null,
  documentType: null,
  documentSubtype: null,
  year: null,
  validityStatus: null,
};

const EMPTY_QUERY_STATE: Readonly<DocumentQueryState> = {
  searchTerm: '',
  organizationalUnit: null,
  documentType: null,
  documentSubtype: null,
  year: null,
  validityStatus: null,
  page: 1,
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
      lucideChevronLeft,
      lucideChevronRight,
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
  readonly validityStatusOptions: readonly {
    value: DocumentValidityStatus;
    label: string;
  }[] = [
    { value: 'CURRENT', label: 'Vigente' },
    { value: 'HISTORICAL', label: 'Histórico' },
  ];
  readonly validityStatusNames = new Map(
    this.validityStatusOptions.map(({ value, label }) => [value, label]),
  );

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
  private readonly routeQueryState = computed(() =>
    this.parseQueryParams(this.routeQueryParamMap()),
  );

  readonly organizationalUnitData = computed<PortalOrganizationalUnitData>(
    () => this.mapOrganizationalUnits(this.catalogs()),
  );

  readonly types = computed(() => this.catalogs()?.types ?? []);

  private readonly queryState = computed(() => {
    const catalogs = this.catalogs();
    if (!catalogs) return undefined;

    return this.validateQueryState(this.routeQueryState(), catalogs);
  });

  readonly searchTerm = linkedSignal(
    () => this.routeQueryState().searchTerm,
  );
  private readonly debouncedSearchTerm = debounced(this.searchTerm, 350);

  readonly filtersModel = linkedSignal<DocumentFiltersModel>(() => {
    const state = this.queryState();
    if (!state) return { ...EMPTY_FILTERS };

    return {
      organizationalUnitId: state.organizationalUnit
        ? (this.organizationalUnitData().idBySlug.get(
            state.organizationalUnit,
          ) ?? null)
        : null,
      documentType: state.documentType,
      documentSubtype: state.documentSubtype,
      year: state.year,
      validityStatus: state.validityStatus,
    };
  });
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

  readonly page = computed(() => this.queryState()?.page ?? 1);
  readonly advancedFiltersOpen = signal(false);
  private readonly filtersTop = viewChild<ElementRef<HTMLElement>>('filtersTop');

  readonly activeSecondaryFiltersCount = computed(() => {
    const state = this.queryState();
    if (!state) return 0;

    return [
      state.organizationalUnit,
      state.documentType,
      state.documentSubtype,
      state.year,
      state.validityStatus,
    ].filter((value) => value !== null && value !== '').length;
  });

  readonly hasActiveFilters = computed(
    () =>
      Boolean(this.routeQueryState().searchTerm) ||
      this.activeSecondaryFiltersCount() > 0,
  );

  readonly documentsResource = rxResource({
    params: (): SearchPublicDocumentsParams | undefined => {
      const state = this.queryState();
      if (!state) return undefined;

      return {
        limit: PAGE_SIZE,
        offset: (state.page - 1) * PAGE_SIZE,
        term: state.searchTerm || null,
        organizationalUnit: state.organizationalUnit,
        type: state.documentType,
        subtype: state.documentSubtype,
        year: state.year,
        validityStatus: state.validityStatus,
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

  readonly totalPages = computed(() => {
    const total = this.documentsResource.hasValue()
      ? this.documentsResource.value().total
      : 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  });
  readonly hasPreviousPage = computed(
    () => !this.isUpdating() && this.page() > 1,
  );
  readonly hasNextPage = computed(
    () => !this.isUpdating() && this.page() < this.totalPages(),
  );

  constructor() {
    effect(() => {
      const paramMap = this.routeQueryParamMap();
      const state = this.queryState();
      if (!state || this.queryParamsMatch(paramMap, this.toQueryParams(state))) {
        return;
      }

      untracked(() => this.navigateToQuery(state, true));
    });

    effect(() => {
      const debouncedTerm = this.normalizeString(
        this.debouncedSearchTerm.value(),
      );
      const state = this.queryState();
      if (!state || debouncedTerm === state.searchTerm) return;

      untracked(() =>
        this.navigateToQuery(
          { ...state, searchTerm: debouncedTerm, page: 1 },
          true,
        ),
      );
    });

    effect(() => {
      const response = this.documentsResource.hasValue()
        ? this.documentsResource.value()
        : undefined;
      const isLoading = this.documentsResource.isLoading();
      const state = this.queryState();
      if (!response || isLoading || !state) return;

      const lastPage = Math.max(1, Math.ceil(response.total / PAGE_SIZE));
      if (state.page <= lastPage) return;

      untracked(() =>
        this.navigateToQuery({ ...state, page: lastPage }, true),
      );
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    const state = this.queryState();
    if (!state || (!this.searchTerm() && !state.searchTerm)) return;

    this.searchTerm.set('');
    this.navigateToQuery({ ...state, searchTerm: '', page: 1 }, true);
  }

  changeOrganizationalUnit(value: number | null | undefined): void {
    const state = this.queryState();
    if (!state) return;

    const organizationalUnit = value
      ? (this.organizationalUnitData().slugById.get(value) ?? null)
      : null;
    if (organizationalUnit === state.organizationalUnit) return;

    this.navigateToQuery({ ...state, organizationalUnit, page: 1 }, true);
  }

  changeDocumentType(value: string | null | undefined): void {
    const state = this.queryState();
    if (!state) return;

    const documentType = this.normalizeNullableString(value);
    if (documentType === state.documentType) return;

    this.navigateToQuery(
      { ...state, documentType, documentSubtype: null, page: 1 },
      true,
    );
  }

  changeDocumentSubtype(value: string | null | undefined): void {
    const state = this.queryState();
    if (!state) return;

    const documentSubtype = this.normalizeNullableString(value);
    if (documentSubtype === state.documentSubtype) return;

    this.navigateToQuery({ ...state, documentSubtype, page: 1 }, true);
  }

  changeYear(value: number | null): void {
    const state = this.queryState();
    if (!state || value === state.year) return;

    this.navigateToQuery({ ...state, year: value, page: 1 }, true);
  }

  changeValidityStatus(
    value: DocumentValidityStatus | null | undefined,
  ): void {
    const state = this.queryState();
    if (!state) return;

    const validityStatus = this.normalizeValidityStatus(value);
    if (validityStatus === state.validityStatus) return;

    this.navigateToQuery({ ...state, validityStatus, page: 1 }, true);
  }

  changePage(page: number): void {
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > this.totalPages() ||
      page === this.page()
    ) {
      return;
    }

    const state = this.queryState();
    if (!state) return;

    this.navigateToQuery({ ...state, page }, false);
    this.filtersTop()?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.advancedFiltersOpen.set(false);
    this.navigateToQuery({ ...EMPTY_QUERY_STATE }, true);
  }

  toggleAdvancedFilters(): void {
    this.advancedFiltersOpen.update((open) => !open);
  }

  reloadCatalogs(): void {
    this.documentDataSource.reloadDocumentFilters();
  }

  private parseQueryParams(paramMap: ParamMap): DocumentQueryState {
    return {
      searchTerm: this.normalizeString(paramMap.get('q')).slice(0, 255),
      organizationalUnit: this.normalizeNullableString(paramMap.get('unit')),
      documentType: this.normalizeNullableString(paramMap.get('type')),
      documentSubtype: this.normalizeNullableString(paramMap.get('subtype')),
      year: this.parseInteger(paramMap.get('year')),
      validityStatus: this.normalizeValidityStatus(
        paramMap.get('validityStatus'),
      ),
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
    if (state.validityStatus) {
      params['validityStatus'] = state.validityStatus;
    }
    if (state.page > 1) params['page'] = state.page;

    return params;
  }

  private navigateToQuery(
    state: DocumentQueryState,
    replaceUrl: boolean,
  ): void {
    const queryParams = this.toQueryParams(state);
    if (this.queryParamsMatch(this.routeQueryParamMap(), queryParams)) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
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

    const toItems = (
      nodes: readonly DocSectionFilterResponse[],
      parentNames: readonly string[] = [],
      depth = 0,
    ): readonly HierarchicalComboboxItem[] =>
      nodes.map((node) => {
        const path = [...parentNames, node.name];
        idBySlug.set(node.slug, node.id);
        slugById.set(node.id, node.slug);

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

  private normalizeString(value: string | null | undefined): string {
    return value?.trim() ?? '';
  }

  private normalizeNullableString(
    value: string | null | undefined,
  ): string | null {
    return this.normalizeString(value) || null;
  }

  private normalizeValidityStatus(
    value: string | null | undefined,
  ): DocumentValidityStatus | null {
    return value === 'CURRENT' || value === 'HISTORICAL' ? value : null;
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
