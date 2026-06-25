import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { TableModule, TablePageEvent } from 'primeng/table';
import { TreeSelectModule } from 'primeng/treeselect';
import { DialogService } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { FileIcon, SearchInput } from '../../../../../shared';
import { DocumentCreate, DocumentEdit } from '../../dialogs';
import { DocumentDataSource } from '../../services';
import {
  DocumentManageResponse,
  DocumentSubtypeResponse,
  SectionTreeNodeResponse,
} from '../../interfaces';
import { MenuItem, TreeNode } from 'primeng/api';
import { finalize } from 'rxjs';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-document-admin',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    FloatLabelModule,
    TreeSelectModule,
    InputTextModule,
    PopoverModule,
    SelectModule,
    ButtonModule,
    MenuModule,
    TableModule,
    TagModule,
    FileIcon,
    SearchInput,
  ],
  templateUrl: './document-admin.html',
  providers: [DialogService],
})
export default class DocumentAdmin {
  private documentDataSource = inject(DocumentDataSource);
  private dialogService = inject(DialogService);
  private formBuilder = inject(FormBuilder);

  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');
  dataSource = signal<DocumentManageResponse[]>([]);
  dataSize = signal<number>(0);

  filterForm: FormGroup = this.formBuilder.group({
    organizationalUnitNode: [null as TreeNode<string> | null],
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
  readonly MIN_YEAR = 2000;
  readonly MAX_YEAR = new Date().getFullYear() + 1;
  readonly yearOptions = this.buildYearOptions(this.MIN_YEAR, this.MAX_YEAR);

  isLoading = signal(false);
  menuItems: MenuItem[] = [];

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

  chagePage(event: TablePageEvent) {
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
    const diagloRef = this.dialogService.open(DocumentCreate, {
      header: 'Crear Documentación',
      modal: true,
      draggable: false,
      focusOnShow: false,
      closable: false,
      closeOnEscape: false,
      dismissableMask: false,
      width: '50vw',
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    diagloRef?.onClose.subscribe((result?: DocumentManageResponse[]) => {
      if (!result) return;
      result.forEach((item) => this.upsertItem(item));
    });
  }

  openUpdateDialog(item: DocumentManageResponse) {
    const diagloRef = this.dialogService.open(DocumentEdit, {
      header: 'Editar Documentación',
      modal: true,
      draggable: false,
      focusOnShow: false,
      closable: false,
      closeOnEscape: false,
      dismissableMask: false,
      data: item,
      width: '40vw',
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    diagloRef?.onClose.subscribe((result?: DocumentManageResponse) => {
      if (!result) return;
      this.upsertItem(result);
    });
  }

  setMenuItems(row: DocumentManageResponse) {
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Editar',
            icon: 'pi pi-fw pi-pencil',
            command: () => this.openUpdateDialog(row),
          },
          {
            label: 'Descargar archivo',
            icon: 'pi pi-download',
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

  private upsertItem(newItem: DocumentManageResponse) {
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

  private toTreeNode(nodes: SectionTreeNodeResponse[]): TreeNode<string>[] {
    return nodes.map((node) => ({
      key: node.id,
      label: node.name.toUpperCase(),
      data: node.id,
      children: node.children.length ? this.toTreeNode(node.children) : [],
    }));
  }

  private buildYearOptions(minYear: number, maxYear: number) {
    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
      const year = maxYear - index;
      return { label: String(year), value: year };
    });
  }
}
