import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { finalize } from 'rxjs';

import { FileIcon, SearchInput, YearSelector } from '../../../../../shared';
import { DocumentCreate, DocumentEdit } from '../../dialogs';
import { DocumentDataSource } from '../../services';
import {
  DocumentResponse,
  DocumentSubtypeResponse,
  SectionTreeNodeResponse,
} from '../../interfaces';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { lucidePencil, lucidePlus } from '@ng-icons/lucide';

@Component({
  selector: 'app-document-admin',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FileIcon,
    SearchInput,
    YearSelector,
    NgIcon,
    HlmButtonImports,
  ],
  templateUrl: './document-admin.html',
  providers: provideIcons({
    lucidePlus,
    lucidePencil,
  }),
})
export default class DocumentAdmin {
  private documentDataSource = inject(DocumentDataSource);
  // private dialogService = inject(DialogService);
  private formBuilder = inject(FormBuilder);
  private readonly dialogService = inject(HlmDialogService);

  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');
  dataSource = signal<DocumentResponse[]>([]);
  dataSize = signal<number>(0);

  filterForm: FormGroup = this.formBuilder.group({
    organizationalUnitNode: [null],
    documentTypeId: [null],
    documentSubtypeId: [{ value: null, disabled: true }],
    year: [null],
    status: [null],
  });

  documentTypes = computed(() => this.documentDataSource.documentTypes());
  organizationTree = computed(() =>
    this.toTreeNode(this.documentDataSource.organizationUnitsTree()),
  );
  documentSubTypes = signal<DocumentSubtypeResponse[]>([]);

  readonly statusOptions = [
    { value: 'ACTIVE', label: 'Activos' },
    { value: 'INACTIVE', label: 'Inactivos' },
  ];

  isLoading = signal(false);
  menuItems: any[] = [];

  ngOnInit() {
    this.getData();
  }

  getData() {
    const { organizationalUnitNode, ...props } = this.filterForm.value;
    this.isLoading.set(true);
    this.documentDataSource
      .findAll({
        limit: this.limit(),
        offset: this.offset(),
        term: this.searchTerm(),
        ...props,
        organizationalUnitId: organizationalUnitNode?.data,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(({ documents, total }) => {
        this.dataSource.set(documents);
        this.dataSize.set(total);
      });
  }

  openEditor(notice?: DocumentResponse): void {
    const dialogRef = this.dialogService.open<DocumentResponse>(
      DocumentCreate,
      {
        showCloseButton: false,
        disableClose: true,
        contentClass: 'w-[calc(100vw-2rem)] !max-w-[700px]',
        context: { notice },
      },
    );

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  selectSection(id: string) {
    this.filterForm.patchValue({ sectionId: id });
  }

  selectDocumentType(selectedId: number | null) {
    const control = this.filterForm.get('documentSubtypeId');
    control?.setValue(null);

    if (selectedId) {
      const documentType = this.documentTypes().find(
        ({ id }) => id === selectedId,
      );
      this.documentSubTypes.set(documentType?.subtypes ?? []);
      if (documentType?.subtypes.length) {
        control?.enable();
      } else {
        control?.disable();
      }
    } else {
      this.documentSubTypes.set([]);
    }
  }

  changePage(event: any) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
    this.getData();
  }

  search(term: string) {
    this.searchTerm.set(term);
    this.offset.set(0);
    this.getData();
  }

  applyFilters() {
    this.offset.set(0);
    this.getData();
  }

  clearFilters() {
    this.filterForm.reset();
    this.offset.set(0);
    this.getData();
  }

  openCreateDialog() {
    // const diagloRef = this.dialogService.open(DocumentCreate, {
    //   header: 'Crear Documentación',
    //   modal: true,
    //   draggable: false,
    //   focusOnShow: false,
    //   closable: false,
    //   closeOnEscape: false,
    //   dismissableMask: false,
    //   width: '50vw',
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    // });
    // diagloRef?.onClose.subscribe((result?: DocumentManageResponse[]) => {
    //   if (!result) return;
    //   result.forEach((item) => this.upsertItem(item));
    // });
  }

  openUpdateDialog(item: DocumentResponse) {
    // const diagloRef = this.dialogService.open(DocumentEdit, {
    //   header: 'Editar Documentación',
    //   modal: true,
    //   draggable: false,
    //   focusOnShow: false,
    //   closable: false,
    //   closeOnEscape: false,
    //   dismissableMask: false,
    //   data: item,
    //   width: '50vw',
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    // });
    // diagloRef?.onClose.subscribe((result?: DocumentManageResponse) => {
    //   if (!result) return;
    //   this.upsertItem(result);
    // });
  }

  setMenuItems(row: DocumentResponse) {
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Editar',
            icon: 'ui-icon ui-icon-fw ui-icon-pencil',
            command: () => this.openUpdateDialog(row),
          },
          {
            label: 'Descargar archivo',
            icon: 'ui-icon ui-icon-download',
            command: () => this.downloadFile(row.file.url),
          },
        ],
      },
    ];
  }

  downloadFile(url: string): void {
    const fileUrl = new URL(url);
    fileUrl.searchParams.set('download', 'true');
    window.open(fileUrl.toString(), '_blank', 'noopener,noreferrer');
  }

  get activeFiltersCount(): number {
    return Object.values(this.filterForm.value).filter(
      (v) => v !== null && v !== undefined,
    ).length;
  }

  private upsertItem(newItem: DocumentResponse) {
    const index = this.dataSource().findIndex((item) => item.id === newItem.id);
    if (index !== -1) {
      this.dataSource.update((values) => {
        values[index] = newItem;
        return [...values];
      });
    } else {
      this.dataSource.update((values) => [newItem, ...values]);
      this.dataSize.update((value) => (value += 1));
    }
  }

  private toTreeNode(nodes: SectionTreeNodeResponse[]): any {
    return nodes.map((node) => ({
      key: node.id,
      label: node.name.toUpperCase(),
      data: node.id,
      children: node.children.length ? this.toTreeNode(node.children) : [],
    }));
  }
}
