import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
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
import {
  FileIcon,
  FileSizePipe,
  SearchInput,
} from '../../../../shared';
import { PortalDocumentDataSource } from '../../services';

interface FilterQueryParams {
  term?: string;
  section?: string;
  type?: string;
  subtype?: string;
  year?: string;
}

interface ActiveFilter {
  key: keyof FilterQueryParams;
  label: string;
}
@Component({
  selector: 'app-documents-page',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectButtonModule,
    TreeSelectModule,
    FloatLabelModule,
    DataViewModule,
    SelectModule,
    ButtonModule,
    DatePicker,
    SearchInput,
    FileSizePipe,
    FileIcon,
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

    :host ::ng-deep .documents-data-view .p-paginator {
      margin-top: 1.5rem;
      border: 1px solid var(--p-surface-200);
      border-radius: 1rem;
      background: var(--p-surface-0);
      padding: 0.75rem;
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

  readonly activeFilters = computed<ActiveFilter[]>(() => {
    const filters = this.activeQueryFilters();
    const active: ActiveFilter[] = [];

    if (filters.term) {
      active.push({ key: 'term', label: `Búsqueda: ${filters.term}` });
    }
    if (filters.type) {
      const type = this.types().find((item) => item.slug === filters.type);
      active.push({ key: 'type', label: type?.name ?? filters.type });
    }
    if (filters.subtype) {
      const subtype = this.subtypes().find(
        (item) => item.slug === filters.subtype,
      );
      active.push({ key: 'subtype', label: subtype?.name ?? filters.subtype });
    }
    if (filters.section) {
      const section = this.findNodeByKey(this.sections(), filters.section);
      active.push({
        key: 'section',
        label: section?.label ?? filters.section,
      });
    }
    if (filters.year) {
      active.push({ key: 'year', label: `Gestión ${filters.year}` });
    }

    return active;
  });

  // Detect when sections is loaded
  selectedTreeNode = linkedSignal<TreeNode | null>(() => {
    const slug = this.filterForm.get('organizationalUnit')?.value;
    if (!slug) return null;
    return this.findNodeByKey(this.sections(), slug);
  });

  readonly layoutOptions = ['list', 'grid'];
  layout = signal<'list' | 'grid'>('list');

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
    const {
      organizationalUnit,
      documentType,
      documentSubtype,
      year,
    } = this.filterForm.value;

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

  changePage(event: { first: number; rows: number }) {
    this.limit.set(event.rows);
    this.index.set(event.first / event.rows);
    this.searchDocuments();
  }

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

  clearFilter(key: keyof FilterQueryParams): void {
    if (key === 'type') {
      this.setRouteQueryParams({ type: null, subtype: null });
      return;
    }

    this.setRouteQueryParams({ [key]: null });
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
