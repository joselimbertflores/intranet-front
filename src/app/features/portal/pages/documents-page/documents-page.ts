import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  debounce,
  disabled,
  form,
  FormField,
  FormRoot,
  maxLength,
} from '@angular/forms/signals';
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
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { map } from 'rxjs';

import {
  HierarchicalCombobox,
  HierarchicalComboboxItem,
  PaginationControls,
  YearSelector,
} from '../../../../shared';
import {
  OrgUnitsFilterResponse,
  PortalDocumentResponse,
} from '../../interfaces';
import { PortalDocumentDataSource } from '../../services';
import { PublicPageHeader } from '../../components';
import { PortalDocumentListItem } from './components/portal-document-list-item/portal-document-list-item';

type DocumentValidityStatus = PortalDocumentResponse['validityStatus'];

interface DocumentFiltersModel {
  term: string;
  organizationalUnit: string | null;
  documentType: string | null;
  documentSubtype: string | null;
  year: number | null;
  validityStatus: DocumentValidityStatus | null;
}

interface DocumentQueryState extends DocumentFiltersModel {
  page: number;
}

const PAGE_SIZE = 20;
const MIN_YEAR = 2000;
const MAX_YEAR = new Date().getFullYear() + 1;

const EMPTY_QUERY_STATE: Readonly<DocumentQueryState> = {
  term: '',
  organizationalUnit: null,
  documentType: null,
  documentSubtype: null,
  year: null,
  validityStatus: null,
  page: 1,
};

function mapQueryParams(paramMap: ParamMap): DocumentQueryState {
  const year = Number(paramMap.get('year'));
  const page = Number(paramMap.get('page'));
  const validityStatus = paramMap.get('validityStatus');

  return {
    term: (paramMap.get('q')?.trim() ?? '').slice(0, 255),
    organizationalUnit: paramMap.get('unit')?.trim() || null,
    documentType: paramMap.get('type')?.trim() || null,
    documentSubtype: paramMap.get('subtype')?.trim() || null,
    year:
      Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR
        ? year
        : null,
    validityStatus:
      validityStatus === 'CURRENT' || validityStatus === 'HISTORICAL'
        ? validityStatus
        : null,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

function toQueryParams(state: DocumentQueryState): Params {
  const params: Params = {};

  if (state.term) params['q'] = state.term;
  if (state.organizationalUnit) params['unit'] = state.organizationalUnit;
  if (state.documentType) params['type'] = state.documentType;
  if (state.documentSubtype) params['subtype'] = state.documentSubtype;
  if (state.year !== null) params['year'] = state.year;
  if (state.validityStatus) params['validityStatus'] = state.validityStatus;
  if (state.page > 1) params['page'] = state.page;

  return params;
}

function mapOrganizationalUnits(
  units: readonly OrgUnitsFilterResponse[],
): readonly HierarchicalComboboxItem[] {
  return units.map((unit) => ({
    id: unit.slug,
    name: unit.name,
    children: mapOrganizationalUnits(unit.children),
  }));
}

@Component({
  selector: 'app-documents-page',
  imports: [
    FormField,
    FormRoot,
    HierarchicalCombobox,
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
})
export default class DocumentsPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly documentDataSource = inject(PortalDocumentDataSource);

  private queryParams = toSignal(
    this.route.queryParamMap.pipe(map(mapQueryParams)),
    {
      initialValue: mapQueryParams(this.route.snapshot.queryParamMap),
    },
  );

  readonly pageSize = PAGE_SIZE;
  readonly minYear = MIN_YEAR;
  readonly maxYear = MAX_YEAR;
  readonly skeletonRows = Array.from({ length: 6 });

  readonly validityStatusOptions = [
    { value: 'CURRENT', label: 'Vigente' },
    { value: 'HISTORICAL', label: 'Histórico' },
  ];
  readonly validityStatusNames = new Map(
    this.validityStatusOptions.map(({ value, label }) => [value, label]),
  );

  readonly documentsResource = rxResource({
    params: () => {
      const state = this.queryParams();

      return {
        limit: PAGE_SIZE,
        offset: (state.page - 1) * PAGE_SIZE,
        term: state.term || null,
        organizationalUnit: state.organizationalUnit,
        type: state.documentType,
        subtype: state.documentSubtype,
        year: state.year,
        validityStatus: state.validityStatus,
      };
    },
    stream: ({ params }) => this.documentDataSource.searchDocuments(params),
  });

  readonly types = computed(
    () => this.documentDataSource.documentFilters().types,
  );
  readonly organizationalUnits = computed(() =>
    mapOrganizationalUnits(
      this.documentDataSource.documentFilters().organizationalUnits,
    ),
  );

  readonly filtersModel = linkedSignal<DocumentFiltersModel>(() => {
    const { page: _page, ...filters } = this.queryParams();
    return filters;
  });

  readonly filtersForm = form(this.filtersModel, (schemaPath) => {
    maxLength(schemaPath.term, 255);
    debounce(schemaPath.term, 350);
    disabled(schemaPath.documentSubtype, {
      when: ({ valueOf }) => {
        const selectedType = valueOf(schemaPath.documentType);
        return (
          !selectedType ||
          !this.types().some(
            ({ slug, subtypes }) =>
              slug === selectedType && subtypes.length > 0,
          )
        );
      },
    });
  });

  readonly subtypes = computed(() => {
    const selectedType = this.filtersModel().documentType;
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

  readonly page = computed(() => this.queryParams().page);
  readonly advancedFiltersOpen = signal(false);
  private readonly filtersTop =
    viewChild<ElementRef<HTMLElement>>('filtersTop');

  readonly activeSecondaryFiltersCount = computed(
    () =>
      [
        this.queryParams().organizationalUnit,
        this.queryParams().documentType,
        this.queryParams().documentSubtype,
        this.queryParams().year,
        this.queryParams().validityStatus,
      ].filter((value) => value !== null && value !== '').length,
  );
  readonly hasActiveFilters = computed(
    () =>
      Boolean(this.queryParams().term) ||
      this.activeSecondaryFiltersCount() > 0,
  );

  readonly isInitialLoading = computed(
    () =>
      this.documentsResource.isLoading() && !this.documentsResource.hasValue(),
  );
  readonly isUpdating = computed(
    () =>
      this.documentsResource.isLoading() && this.documentsResource.hasValue(),
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
      const state = this.queryParams();
      const filters = this.filtersModel();
      const term = filters.term.trim();

      if (
        term === state.term &&
        filters.organizationalUnit === state.organizationalUnit &&
        filters.documentType === state.documentType &&
        filters.documentSubtype === state.documentSubtype &&
        filters.year === state.year &&
        filters.validityStatus === state.validityStatus
      ) {
        return;
      }

      const documentTypeChanged = filters.documentType !== state.documentType;

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: toQueryParams({
          ...filters,
          term,
          documentSubtype: documentTypeChanged ? null : filters.documentSubtype,
          page: 1,
        }),
        replaceUrl: true,
      });
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toQueryParams({ ...this.queryParams(), page }),
    });
    this.filtersTop()?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  resetFilters(): void {
    this.advancedFiltersOpen.set(false);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toQueryParams({ ...EMPTY_QUERY_STATE }),
      replaceUrl: true,
    });
  }

  toggleAdvancedFilters(): void {
    this.advancedFiltersOpen.update((open) => !open);
  }
}
