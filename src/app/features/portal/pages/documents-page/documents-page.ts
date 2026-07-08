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
    DatePicker,
    SearchInput,
    FileSizePipe,
    FileIcon,
    PublicSectionHeader,
    YearSelector,
    FormField,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    FormRoot
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
  private formBuilder = inject(FormBuilder);

  private destroyRef = inject(DestroyRef);
  private documentDataSource = inject(PortalDocumentDataSource);

  readonly rowsPerPageOptions = [10, 20, 30, 50];

  dataSize = signal(0);
  dataSource = signal<PortalDocumentResponse[]>([]);
  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  searchTerm = signal('');

  readonly sections = computed(() => {
    const sections =
      this.documentDataSource.documentFilters().organizationalUnits;
    return this.toTreeNode(sections);
  });
  readonly types = computed(() => {
    return this.documentDataSource.documentFilters().types;
  });

  selectedType = signal<string | null>(null);

  readonly subtypes = signal<DocSubtypeFilterResponse[]>([]);

  // filterForm = this.formBuilder.group({
  //   organizationalUnit: [null as string | null],
  //   documentType: [null as string | null],
  //   documentSubtype: [null as string | null],
  //   year: [null as number | null],
  // });

  selectedYearDate = signal<Date | null>(null);
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

  // Detect when sections is loaded
  selectedTreeNode = linkedSignal<TreeNode | null>(() => {
    const slug = this.filterForm.get('organizationalUnit')?.value;
    if (!slug) return null;
    return this.findNodeByKey(this.sections(), slug);
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

  filterFormModel = signal({
    term: '',
    organizationalUnit: null,
    documentType: '',
    documentSubtype: null,
    year: null,
  });

  filterFormSignal = form(this.filterFormModel, (schemaPath) => {
    debounce(schemaPath.term, 350);
  });

  constructor() {}

  ngOnInit() {
    this.loadFilterParams();
    this.listenToFilterChanges();
  }

  searchDocuments(): void {
    this.documentDataSource
      .searchDocuments({
        limit: this.limit(),
        offset: this.offset(),
        term: this.activeQueryFilters().term,
        ...this.filterForm.value,
      })
      .subscribe(({ documents, total }) => {
        this.dataSource.set(documents);
        this.dataSize.set(total);
      });
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
    this.searchDocuments();
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.setQueryParams({ term: term !== '' ? term : null });
  }

  onSelectType(slug: string | null) {
    const type = this.types().find((item) => item.slug === slug);
    this.filterForm.patchValue({ documentSubtype: null });
    this.subtypes.set(type?.subtypes ?? []);
  }

  selectDate(value: Date) {
    this.setRouteQueryParams({ year: value.getFullYear() });
  }

  clearDate() {
    this.setRouteQueryParams({ year: null });
  }

  selectSection(node: TreeNode) {
    this.setRouteQueryParams({ section: node.key ?? null });
  }

  clearSection() {
    this.setRouteQueryParams({ section: null });
  }

  resetFilterForm() {
    this.selectedTreeNode.set(null);
    this.setRouteQueryParams({
      term: null,
      section: null,
      type: null,
      subtype: null,
      year: null,
    });
  }

  toggleAdvancedFilters(): void {
    this.advancedFiltersOpen.update((isOpen) => !isOpen);
  }

  private toTreeNode(data: DocSectionFilterResponse[]): TreeNode[] {
    return data.map((item) => ({
      key: item.slug,
      label: item.name.toUpperCase(),
      children: item.children ? this.toTreeNode(item.children) : [],
    }));
  }

  // Función recursiva para encontrar un nodo por su KEY
  private findNodeByKey(nodes: TreeNode[], key: string): TreeNode | null {
    for (const node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        const found = this.findNodeByKey(node.children, key);
        if (found) return found;
      }
    }
    return null;
  }

  private setRouteQueryParams(params: Params): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private loadFilterParams(): void {
    const queryParams = this.route.snapshot.queryParams;
    this.filterForm.patchValue(
      {
        documentType: queryParams['type'],
        documentSubtype: queryParams['subtype'],
        organizationalUnit: queryParams['unit'],
        year: Number.isInteger(+queryParams['year'])
          ? +queryParams['year']
          : null,
      },
      {
        emitEvent: false,
      },
    );
  }

  private mapQueryParams(params: Record<string, string | undefined>) {
    return {
      term: params['term'] || null,
      unit: params['unit'] || null,
      type: params['type'] || null,
      subtype: params['subtype'] || null,
      year: this.parseYear(params['year']),
      limit: this.parseLimit(params['limit']),
      offset: this.parseOffset(params['offset']),
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

  private listenToFilterChanges(): void {
    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
  }

  private applyFilters(): void {
    const {
      organizationalUnit: unit,
      documentType: type,
      documentSubtype: subtype,
      year,
    } = this.filterForm.value;

    const filters = {
      unit: this.normalizeFilterValue(unit),
      type: this.normalizeFilterValue(type),
      subtype: this.normalizeFilterValue(subtype),
      year: this.normalizeFilterValue(year),
    };

    const current = this.queryParams();

    const hasChanged =
      filters.unit !== current.term ||
      filters.type !== current.type ||
      filters.subtype !== current.subtype ||
      filters.year !== current.year;

    if (!hasChanged) return;

    this.setQueryParams({ ...filters, offset: 0 });
  }

  private normalizeFilterValue(value: unknown): string | null {
    if (value == null) return null;
    const normalized = String(value).trim();
    return normalized.length ? normalized : null;
  }

  private setQueryParams(params: object): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
      scroll: 'manual',
    });
  }
}
