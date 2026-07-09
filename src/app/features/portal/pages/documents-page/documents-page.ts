import {
  afterRenderEffect,
  linkedSignal,
  ElementRef,
  viewChild,
  Component,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { debounce, form, FormField, FormRoot } from '@angular/forms/signals';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SelectButtonModule } from 'primeng/selectbutton';
import { TreeSelectModule } from 'primeng/treeselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PaginatorModule } from 'primeng/paginator';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TreeNode } from 'primeng/api';

import { map } from 'rxjs';

import { YearSelector } from '../../../../shared';
import { DocSectionFilterResponse } from '../../interfaces';
import { PortalDocumentDataSource } from '../../services';
import { PublicSectionHeader } from '../../components';
import { PortalDocumentGridCard } from './components/portal-document-grid-card/portal-document-grid-card';
import { PortalDocumentListItem } from './components/portal-document-list-item/portal-document-list-item';

interface FilterFormMode {
  term: string | null;
  organizationalUnit: string | null;
  documentType: string | null;
  documentSubtype: string | null;
  year: number | null;
}

@Component({
  selector: 'app-documents-page',
  imports: [
    CommonModule,
    FormsModule,
    SelectButtonModule,
    TreeSelectModule,
    FloatLabelModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    PaginatorModule,
    DataViewModule,
    SkeletonModule,
    SelectModule,
    ButtonModule,
    YearSelector,
    FormField,
    PublicSectionHeader,
    PortalDocumentGridCard,
    PortalDocumentListItem,
    FormRoot,
  ],
  styles: `
    ::ng-deep .p-dataview .p-dataview-header {
      background: transparent;
      padding: 8px;
    }
    ::ng-deep .p-dataview .p-dataview-content {
      padding: 8px;
    }

    :host ::ng-deep .compact-paginator {
      font-size: 14px;
      --p-paginator-background: transparent;
      --p-paginator-padding: 0px;
      --p-select-padding-y: 0.1rem;
      --p-select-padding-x: 0.2rem;
    }

    .fade-in {
      animation: fade-in 160ms ease-out;
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(3px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .fade-in {
        animation: none;
      }
    }
  `,
  templateUrl: './documents-page.html',
})
export default class DocumentsPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private documentDataSource = inject(PortalDocumentDataSource);

  private readonly DEFAULT_LIMIT = 20;
  private readonly DEFAULT_OFFSET = 0;
  readonly rowsPerPageOptions = [20, 30, 40, 50];
  readonly layoutOptions = ['list', 'grid'];
  readonly listSkeletonRows = Array.from({ length: 6 });
  readonly gridSkeletonCards = Array.from({ length: 6 });
  layout = signal<'list' | 'grid'>('list');

  queryParams = toSignal(
    this.route.queryParams.pipe(map((params) => this.mapQueryParams(params))),
    { initialValue: this.mapQueryParams(this.route.snapshot.queryParams) },
  );

  limit = linkedSignal(() => this.queryParams().limit);
  offset = linkedSignal(() => this.queryParams().offset);

  dataResource = rxResource({
    params: () => this.queryParams(),
    stream: ({ params }) => this.documentDataSource.searchDocuments(params),
  });

  readonly organizationTree = computed(() =>
    this.toTreeNodes(
      this.documentDataSource.documentFilters().organizationalUnits,
    ),
  );
  readonly types = computed(() => {
    return this.documentDataSource.documentFilters().types;
  });

  readonly subtypes = computed(() => {
    const selectedSlug = this.filterForm().value().documentType;

    if (!selectedSlug) return [];

    const selectedType = this.types().find(({ slug }) => slug === selectedSlug);

    return selectedType?.subtypes ?? [];
  });

  readonly advancedFiltersOpen = signal(false);
  private filtersTop = viewChild<ElementRef<HTMLElement>>('filtersTop');

  hasActiveFilters = computed(() => {
    const { term, year, organizationalUnit, documentType, documentSubtype } =
      this.queryParams();
    return [term, year, organizationalUnit, documentSubtype, documentType].some(
      Boolean,
    );
  });

  activeAdvancedFiltersCount = computed(() => {
    const { year, organizationalUnit, documentType, documentSubtype } =
      this.queryParams();
    return [year, organizationalUnit, documentType, documentSubtype].filter(
      Boolean,
    ).length;
  });

  filterFormModel = signal<FilterFormMode>({
    organizationalUnit: null,
    documentType: null,
    documentSubtype: null,
    term: null,
    year: null,
  });

  filterForm = form(this.filterFormModel, (schemaPath) => {
    debounce(schemaPath.term, 350);
  });

  selectedTreeNode = linkedSignal(() => {
    const selectedSlug = this.filterForm().value().organizationalUnit;
    if (!selectedSlug) return null;
    return (
      this.organizationTree().find((node) => node.data === selectedSlug) ?? null
    );
  });

  /**
   * Solo paginación activa el scroll al bloque de filtros.
   *
   * Los filtros/buscador ya están en la parte superior, así que al cambiar
   * esos query params no movemos el scroll.
   */
  private pendingScrollToFilters = false;

  constructor() {
    effect(() => {
      const values = this.filterForm().value();
      const filters = {
        unit: this.normalizeFilterValue(values.organizationalUnit),
        type: this.normalizeFilterValue(values.documentType),
        subtype: this.normalizeFilterValue(values.documentSubtype),
        year: this.normalizeFilterValue(values.year),
        term: this.normalizeFilterValue(values.term),
      };
      this.setQueryParams(filters);
    });

    afterRenderEffect(() => {
      this.handlePendingScrollAfterRender();
    });
  }

  ngOnInit() {
    this.syncFormFromQueryParams();
  }

  changePage(
    event: { rows?: number; first?: number },
    scrollToFilters?: boolean,
  ) {
    const limit = event.rows ?? this.DEFAULT_LIMIT;
    const offset = event.first ?? this.DEFAULT_OFFSET;
    this.setQueryParams({ limit, offset }, { scrollToFilters });
  }

  selectOrganizationUnit(node: TreeNode) {
    this.filterForm.organizationalUnit().value.set(node.data ?? null);
  }

  clearOrganizationUnit() {
    this.filterForm.organizationalUnit().value.set(null);
  }

  resetFilters() {
    this.filterFormModel.set({
      organizationalUnit: null,
      documentSubtype: null,
      documentType: null,
      term: null,
      year: null,
    });
  }

  toggleAdvancedFilters(): void {
    this.advancedFiltersOpen.update((isOpen) => !isOpen);
  }

  private toTreeNodes(nodes: DocSectionFilterResponse[]): TreeNode<string>[] {
    return nodes.map((node) => ({
      key: node.id,
      label: node.name.toUpperCase(),
      data: node.slug,
      children: node.children ? this.toTreeNodes(node.children) : [],
    }));
  }

  private syncFormFromQueryParams(): void {
    this.filterFormModel.set(
      this.mapQueryParams(this.route.snapshot.queryParams),
    );
  }

  private mapQueryParams(params: Record<string, string | undefined>) {
    return {
      organizationalUnit: params['unit'] || null,
      documentType: params['type'] || null,
      documentSubtype: params['subtype'] || null,
      year: this.parseYear(params['year']),
      limit: this.parseLimit(params['limit']),
      offset: this.parseOffset(params['offset']),
      term: params['term'] || null,
    };
  }

  /**
   * Usamos scroll: 'manual' para evitar que Angular mande al top absoluto
   * cuando cambia la URL por query params.
   *
   * Si la navegación viene de paginación, shouldScrollToFilters se encarga
   * de mover al inicio del bloque de filtros después de cargar la data.
   */
  private setQueryParams(
    params: object,
    options: { scrollToFilters?: boolean } = {},
  ): void {
    if (options.scrollToFilters) {
      this.pendingScrollToFilters = true;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      replaceUrl: true,
      scroll: 'manual',
      queryParams: params,
    });
  }

  private normalizeFilterValue(value: unknown): string | null {
    if (value == null) return null;
    const normalized = String(value).trim();
    return normalized.length ? normalized : null;
  }

  private parseLimit(value: string | undefined): number {
    const parsed = Number(value);
    return this.rowsPerPageOptions.includes(parsed)
      ? parsed
      : this.DEFAULT_LIMIT;
  }

  private parseOffset(value: string | undefined): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0
      ? parsed
      : this.DEFAULT_OFFSET;
  }

  private parseYear(value: string | undefined): number | null {
    if (!value) return null;
    const year = Number(value);
    return Number.isInteger(year) ? year : null;
  }

  private handlePendingScrollAfterRender(): void {
    if (this.dataResource.isLoading()) return;
    if (!this.pendingScrollToFilters) return;
    this.filtersTop()?.nativeElement.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    });
    this.pendingScrollToFilters = false;
  }
}
