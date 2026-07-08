import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  rxResource,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SelectButtonModule } from 'primeng/selectbutton';
import { PaginatorModule } from 'primeng/paginator';
import { TreeSelectModule } from 'primeng/treeselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DataViewModule } from 'primeng/dataview';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TreeNode } from 'primeng/api';
import { debounce, form, FormField, FormRoot } from '@angular/forms/signals';

import {
  PortalDocumentResponse,
  DocSectionFilterResponse,
  DocSubtypeFilterResponse,
} from '../../interfaces';
import {
  FileIcon,
  FileSizePipe,
  SearchInput,
  YearSelector,
} from '../../../../shared';
import {
  PortalDocumentDataSource,
  SearchPublicDocumentsParams,
} from '../../services';
import { PublicSectionHeader } from '../../components';
import { debounceTime, map } from 'rxjs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';

interface FilterQueryParams {
  term?: string;
  section?: string;
  type?: string;
  subtype?: string;
  year?: string;
}
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
    ReactiveFormsModule,
    SelectButtonModule,
    PaginatorModule,
    TreeSelectModule,
    FloatLabelModule,
    DataViewModule,
    SelectModule,
    ButtonModule,
    FileSizePipe,
    FileIcon,
    PublicSectionHeader,
    YearSelector,
    FormField,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    FormRoot,
  ],
  templateUrl: './documents-page.html',
  styles: `
    :host {
      display: block;
    }

    :host ::ng-deep .documents-data-view .p-dataview-header {
      border: 0;
      background: transparent;
      padding: 0 0 1.25rem;
    }

    :host ::ng-deep .documents-data-view .p-dataview-content {
      background: transparent;
    }

    :host ::ng-deep .documents-data-view > .p-dataview-paginator-bottom {
      margin-top: 1.5rem;
      border: 1px solid var(--p-surface-200);
      border-radius: 1rem;
      background: var(--p-surface-0);
      padding: 0.75rem;
    }

    :host ::ng-deep .documents-top-paginator {
      border: 0;
      background: transparent;
      padding: 0;
    }

    :host
      ::ng-deep
      .documents-top-paginator
      :is(.p-paginator-prev, .p-paginator-next) {
      min-width: 2rem;
      width: 2rem;
      height: 2rem;
    }

    :host ::ng-deep .documents-top-paginator .p-paginator-current {
      min-width: auto;
      padding: 0 0.35rem;
      font-size: 0.75rem;
    }

    @media (max-width: 40rem) {
      :host
        ::ng-deep
        .documents-data-view
        > .p-dataview-paginator-bottom
        .p-paginator {
        justify-content: center;
        row-gap: 0.5rem;
      }
    }

    .results-section {
      scroll-margin-top: 100px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocumentsPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private destroyRef = inject(DestroyRef);
  private documentDataSource = inject(PortalDocumentDataSource);

  readonly rowsPerPageOptions = [10, 20, 30, 50];

  dataSize = signal(0);
  dataSource = signal<PortalDocumentResponse[]>([]);
  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  searchTerm = signal('');

  organizationTree = computed(() =>
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

  readonly activeQueryFilters = signal<FilterQueryParams>({});
  readonly advancedFiltersOpen = signal(false);
  readonly activeFilterCount = computed(() => {
    const filters = this.activeQueryFilters();
    return [
      filters.term,
      filters.type,
      filters.subtype,
      filters.section,
      filters.year,
    ].filter(Boolean).length;
  });

  readonly layoutOptions = ['list', 'grid'];
  layout = signal<'list' | 'grid'>('list');

  resultsSection = viewChild<ElementRef<HTMLElement>>('resultsSection');

  queryParams = toSignal(
    this.route.queryParams.pipe(map((params) => this.mapQueryParams(params))),
    { initialValue: this.mapQueryParams(this.route.snapshot.queryParams) },
  );

  dataResource = rxResource({
    params: () => this.queryParams(),
    stream: ({ params }) => this.documentDataSource.searchDocuments(params),
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

  selectedOrganizationUnit = linkedSignal(() => {
    const selectedSlug = this.filterForm().value().organizationalUnit;
    if (!selectedSlug) return [];
    return (
      this.organizationTree().find((node) => node.data === selectedSlug) ?? null
    );
  });

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
  }

  ngOnInit() {
    this.loadForm();
  }

  changePage(event: { first?: number; rows?: number }) {
    const rows = event.rows ?? this.limit();
    const first = event.first ?? 0;

    this.limit.set(rows);
    this.index.set(first / rows);
    this.resultsSection()?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    // console.log(this.resultsSection());
    // this.router.navigate([], {
    //   relativeTo: this.route,
    //   queryParams: { limit: this.limit(), index: this.limit() },
    //   queryParamsHandling: 'merge',
    //   replaceUrl: true,
    // });
  }

  selectOrganizationUnit(node: TreeNode) {
    this.filterForm.organizationalUnit().value.set(node.data ?? null);
  }

  clearSection() {
    this.setRouteQueryParams({ section: null });
  }

  resetFilterForm() {
    // this.selectedTreeNode.set(null);
    // this.setRouteQueryParams({
    //   term: null,
    //   section: null,
    //   type: null,
    //   subtype: null,
    //   year: null,
    // });
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

  private setRouteQueryParams(params: Params): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private loadForm(): void {
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

  private parseLimit(value: string | undefined): number {
    const parsed = Number(value);
    return this.rowsPerPageOptions.includes(parsed) ? parsed : 10;
  }

  private parseOffset(value: string | undefined): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  }

  private parseYear(value: string | undefined): number | null {
    if (!value) return null;
    const year = Number(value);
    return Number.isInteger(year) ? year : null;
  }

  private applyFilters(): void {
    // const {
    //   organizationalUnit: unit,
    //   documentType: type,
    //   documentSubtype: subtype,
    //   year,
    // } = this.filterForm.value;
    // const filters = {
    //   unit: this.normalizeFilterValue(unit),
    //   type: this.normalizeFilterValue(type),
    //   subtype: this.normalizeFilterValue(subtype),
    //   year: this.normalizeFilterValue(year),
    // };
    // const current = this.queryParams();
    // const hasChanged =
    //   filters.unit !== current.term ||
    //   filters.type !== current.type ||
    //   filters.subtype !== current.subtype ||
    //   filters.year !== current.year;
    // if (!hasChanged) return;
    // this.setQueryParams({ ...filters, offset: 0 });
  }

  private normalizeFilterValue(value: unknown): string | null {
    if (value == null) return null;
    const normalized = String(value).trim();
    return normalized.length ? normalized : null;
  }

  private setQueryParams(params: object): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      replaceUrl: true,
      scroll: 'manual',
      queryParams: params,
    });
  }
}
