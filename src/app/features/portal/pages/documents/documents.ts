import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
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

@Component({
  selector: 'app-documents',
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
  ],
  templateUrl: './documents.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Documents {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private portalService = inject(PortalService);
  private documentDataSource = inject(PortalDocumentDataSource);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  dataSize = signal(0);
  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  dataSource = signal<DocumentResponse[]>([]);
  activeFilter = signal<Record<string, string | number | Date>>({});

  sections = computed(() => {
    const sections = this.documentDataSource.documentFilters().sections;
    return this.toTreeNode(sections);
  });

  types = computed(() => this.documentDataSource.documentFilters().types);

  subtypes = signal<DocSubtypeFilterResponse[]>([]);

  filterForm: FormGroup = this.formBuilder.group({
    section: [null],
    type: [null],
    subtype: [null],
  });

  selectedNodeVisual: TreeNode | null = null;

  nodes: any[] = [
    {
      key: '0',
      label: 'Documents',
      data: 'Documents Folder',
      icon: 'pi pi-fw pi-inbox',
      children: [
        {
          key: '0-0',
          label: 'Work',
          data: 'Work Folder',
          icon: 'pi pi-fw pi-cog',
          children: [
            {
              key: '0-0-0',
              label: 'Expenses.doc',
              icon: 'pi pi-fw pi-file',
              data: 'Expenses Document',
            },
            {
              key: '0-0-1',
              label: 'Resume.doc',
              icon: 'pi pi-fw pi-file',
              data: 'Resume Document',
            },
          ],
        },
        {
          key: '0-1',
          label: 'Home',
          data: 'Home Folder',
          icon: 'pi pi-fw pi-home',
          children: [
            {
              key: '0-1-0',
              label: 'Invoices.txt',
              icon: 'pi pi-fw pi-file',
              data: 'Invoices for this month',
            },
          ],
        },
      ],
    },
  ];

  constructor() {}

  ngOnInit() {
    // this.route.queryParamMap
    //   .pipe(
    //     map((params) => this.getFiltersFromQuery(params)),
    //     takeUntilDestroyed(this.destroyRef),
    //   )
    //   .subscribe((filters) => {
    //     this.index.set(0);
    //     // this.activeFilter.set(filters);
    //     this.getData(filters);
    //   });
    this.patchFormValue('0-1-0');
  }

  applyFilter(filterParams?: Record<string, unknown>) {
    this.index.set(0);
    this.getData(filterParams);
  }

  selectSection(node: TreeNode) {
    const slug = node.data as string;
    this.filterForm.get('section')?.setValue(slug);
    this.setRouteQueryParams({ section: slug });
  }

  selectType(slug: string) {
    this.setRouteQueryParams({ type: slug });
    const value = this.types().find((item) => item.slug === slug);
    if (!value) return;
    this.subtypes.set(value.subtypes ?? []);
  }

  selectSubtype(slug: string) {
    this.setRouteQueryParams({ subtype: slug });
  }

  getData(filterParams?: Record<string, unknown>): void {
    const resolvedFilter = {
      ...this.activeFilter(),
      ...(filterParams ?? {}),
    };
    this.activeFilter.set(
      resolvedFilter as Record<string, string | number | Date>,
    );

    this.portalService
      .filterDocuments({
        limit: this.limit(),
        offset: this.offset(),
        ...resolvedFilter,
      })
      .subscribe(({ documents, total }) => {
        this.dataSource.set(documents);
        this.dataSize.set(total);
      });
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

  changePage(event: { index: number; limit: number }) {
    this.limit.set(event.limit);
    this.index.set(event.index);
    this.getData();
  }

  // Método para setear el valor y sincronizar la vista
  patchFormValue(id: string) {
    this.filterForm.get('sectionId')?.setValue(id);
    // Buscamos el nodo completo para que el TreeSelect lo muestre seleccionado
    this.selectedNodeVisual = this.findNodeByKey(this.nodes, id);
  }

  // Evento cuando el usuario hace clic en el árbol
  onSelect(event: any) {
    const id = event.node.key;
    this.filterForm.get('sectionId')?.setValue(id);
    console.log(
      'ID en el Formulario:',
      this.filterForm.get('sectionId')?.value,
    );
  }

  onUnselect() {
    this.filterForm.get('sectionId')?.setValue(null);
  }

  resetFilterForm() {
    this.filterForm.reset();
    this.selectedNodeVisual = null;
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

  private toTreeNode(data: DocSectionFilterResponse[]): TreeNode[] {
    return data.map((item) => ({
      key: item.id,
      label: item.name.toUpperCase(),
      data: item.slug,
      children: item.children ? this.toTreeNode(item.children) : [],
    }));
  }

  private setRouteQueryParams(params: Params) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }
}
