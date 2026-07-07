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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

import {
  PortalDocumentResponse,
  DocSectionFilterResponse,
} from '../../interfaces';
import { FileIcon, FileSizePipe, SearchInput } from '../../../../shared';
import { PortalDocumentDataSource } from '../../services';
import { PublicSectionHeader } from '../../components';

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

  dataSize = signal(0);
  dataSource = signal<PortalDocumentResponse[]>([]);
  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());

  readonly sections = computed(() => {
    const sections =
      this.documentDataSource.documentFilters().organizationalUnits;
    return this.toTreeNode(sections);
  });
  readonly types = computed(() => {
    return this.documentDataSource.documentFilters().types;
  });

  selectedType = signal<string | null>(null);
  readonly subtypes = computed(() => {
    const slug = this.selectedType();
    if (!slug) return [];
    return this.types().find((item) => item.slug === slug)?.subtypes ?? [];
  });

  filterForm: FormGroup = this.formBuilder.group({
    organizationalUnit: [null],
    documentType: [null],
    documentSubtype: [null],
    year: [null],
  });

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

  constructor() {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.index.set(0);
        this.activeQueryFilters.set(params);
        this.initFiltersFromQueryParams(params);
        this.searchDocuments();
      });
  }

  searchDocuments(): void {
    const { organizationalUnit, documentType, documentSubtype, year } =
      this.filterForm.value;

    this.documentDataSource
      .searchDocuments({
        limit: this.limit(),
        offset: this.offset(),
        term: this.activeQueryFilters().term,
        section: organizationalUnit,
        type: documentType,
        subtype: documentSubtype,
        year,
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

  private setQueryParams(params: object): void {}

  search(term: string) {
    this.setRouteQueryParams({ term: term !== '' ? term : null });
  }

  selectType(slug: string | null) {
    this.setRouteQueryParams({ type: slug, subtype: null });
  }

  selectSubtype(slug: string | null) {
    this.setRouteQueryParams({ subtype: slug });
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

  private initFiltersFromQueryParams(params: FilterQueryParams): void {
    const { term, section, type, subtype, year } = params;

    const yearNumber = year ? Number(year) : null;

    this.filterForm.patchValue({
      organizationalUnit: section ?? null,
      documentType: type ?? null,
      documentSubtype: type ? (subtype ?? null) : null,
      year: yearNumber,
    });

    // * Start datepicker with date value
    this.selectedYearDate.set(yearNumber ? new Date(yearNumber, 0, 1) : null);

    // * Set value to get subtypes with signal: subtypes
    this.selectedType.set(type ?? null);
  }
}
