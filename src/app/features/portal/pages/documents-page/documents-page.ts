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
import { InputTextModule } from 'primeng/inputtext';
import { DataViewModule } from 'primeng/dataview';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TreeNode } from 'primeng/api';

import {
  PortalDocumentResponse,
  DocSectionFilterResponse,
} from '../../interfaces';
import {
  FileIcon,
  FileSizePipe,
  SearchInputComponent,
} from '../../../../shared';
import { PortalDocumentDataSource } from '../../services';

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
    TreeSelectModule,
    FloatLabelModule,
    InputTextModule,
    DataViewModule,
    SelectModule,
    ButtonModule,
    PanelModule,
    DatePicker,
    SearchInputComponent,
    FileSizePipe,
    FileIcon,
  ],
  templateUrl: './documents-page.html',
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
    const sections = this.documentDataSource.documentFilters().sections;
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
    section: [null],
    type: [null],
    subtype: [null],
    year: [null],
    term: [null],
  });

  selectedYearDate = signal<Date | null>(null);

  // Detect when sections is loaded
  selectedTreeNode = linkedSignal<TreeNode | null>(() => {
    const slug = this.filterForm.get('section')?.value;
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
        this.initFiltersFromQueryParams(params);
        this.searchDocuments();
      });
  }

  searchDocuments(): void {
    this.documentDataSource
      .searchDocuments({
        limit: this.limit(),
        offset: this.offset(),
        ...this.filterForm.value,
      })
      .subscribe(({ documents, total }) => {
        this.dataSource.set(documents);
        this.dataSize.set(total);
      });
  }

  changePage(event: { index: number; limit: number }) {
    this.limit.set(event.limit);
    this.index.set(event.index);
    this.searchDocuments();
  }

  search(term: string) {
    this.setRouteQueryParams({ term: term !== '' ? term : null });
  }

  selectType(slug: string | null) {
    this.setRouteQueryParams({ type: slug });
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
      term: term ?? null,
      section: section ?? null,
      type: type ?? null,
      subtype: type ? (subtype ?? null) : null,
      year: yearNumber,
    });

    // * Start datepicker with date value
    this.selectedYearDate.set(yearNumber ? new Date(yearNumber, 0, 1) : null);

    // * Set value to get subtypes with signal: subtypes
    this.selectedType.set(type ?? null);
  }
}
