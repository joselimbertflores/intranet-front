import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { map } from 'rxjs';

import { PortalService } from '../../services/portal.service';
import {
  DocumentResponse,
  DocSectionFilterResponse,
  DocSubtypeFilterResponse,
  DocTypeFilterResponse,
} from '../../interfaces';
import {
  DocumentListComponent,
  FilterDocumentsComponent,
} from '../../presentation/components';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TreeSelectModule } from 'primeng/treeselect';
import { DatePicker } from 'primeng/datepicker';
import { PortalDocumentDataSource } from '../../datasources';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FileSizePipe, SearchInputComponent } from '../../../../shared';
import { TagModule } from 'primeng/tag';
import { FileIcon } from '../../../administration/institutional-documents/components';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';

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
    DocumentListComponent,
    FilterDocumentsComponent,
    SelectModule,
    ButtonModule,
    PanelModule,
    TreeSelectModule,
    DatePicker,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    FloatLabelModule,
    SearchInputComponent,
    TagModule,
    FileSizePipe,
    FileIcon,
    DataViewModule,
    SelectButtonModule,
  ],
  templateUrl: './documents-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocumentsPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);

  private destroyRef = inject(DestroyRef);
  private portalService = inject(PortalService);
  private documentDataSource = inject(PortalDocumentDataSource);

  dataSize = signal(0);
  dataSource = signal<any[]>([]);
  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  activeFilter = signal<Record<string, string | number | Date>>({});

  sections = computed(() => {
    const sections = this.documentDataSource.documentFilters().sections;
    return this.toTreeNode(sections);
  });

  types = computed(() => this.documentDataSource.documentFilters().types);

  filterForm: FormGroup = this.formBuilder.group({
    section: [null],
    type: [null],
    subtype: [null],
    year: [null],
    term: [null],
  });

  selectedYearDate = signal<Date | null>(null);

  selectedSlugType = signal<string | null>(null);
  selectedNodeTreeSection = signal<TreeNode | null>(null);

  subtypes = computed(() => {
    const slug = this.selectedSlugType();
    if (!slug) return [];
    return this.types().find((item) => item.slug === slug)?.subtypes ?? [];
  });

  selectedTreeNode = linkedSignal(() => {
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

  selectSection(node: TreeNode) {
    const slug = node.key ?? null;
    this.filterForm.get('section')?.setValue(slug);
    this.setRouteQueryParams({ section: slug });
  }

  clearSection() {
    this.filterForm.patchValue({ section: null });
    this.setRouteQueryParams({ section: null });
  }

  selectType(slug: string | null) {
    this.setRouteQueryParams({ type: slug });
    // this.filterForm.patchValue({ subtype: null });
    // this.selectedSlugType.set(slug);
  }

  selectSubtype(slug: string | null) {
    this.setRouteQueryParams({ subtype: slug });
  }

  selectDate(value: Date) {
    const year = value.getFullYear();
    this.filterForm.patchValue({ year });
    this.setRouteQueryParams({ year });
  }

  clearDate() {
    this.filterForm.patchValue({ year: null });
    this.setRouteQueryParams({ year: null });
  }

  search(term: string) {
    this.filterForm.patchValue({ term });
    this.setRouteQueryParams({ term: term !== '' ? term : null });
  }

  downloadDocument(doc: DocumentResponse) {
    this.portalService
      .dowloadDocument(doc.id, doc.fileName, doc.originalName)
      .subscribe(({ newCount }) => {
        if (!newCount) return;
        this.dataSource.update((values) => {
          const index = values.findIndex((item) => item.id === doc.id);
          if (index !== -1) {
            values[index].downloadCount = newCount;
          }
          return [...values];
        });
      });
  }

  resetFilterForm() {
    this.filterForm.reset();
    this.selectedSlugType.set(null);
    this.selectedTreeNode.set(null);
    this.selectedYearDate.set(null);
    this.resetFilterQueryParams();
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

  private setRouteQueryParams(params: Params) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private resetFilterQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        term: null,
        section: null,
        type: null,
        subtype: null,
        year: null,
      },
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
    this.selectedSlugType.set(type ?? null);
  }
}
