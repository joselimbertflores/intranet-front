
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { TableModule, TablePageEvent } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { SearchInputComponent } from '../../../../../shared';
import { DocumentCreate, DocumentEdit } from '../../dialogs';
import { DocumentDataSource } from '../../services';
import { FileIcon } from '../../components';
import {
  DocumentManageResponse,
  DocumentSubtypeResponse,
  DocumentTypeResponse,
} from '../../interfaces';

@Component({
  selector: 'app-document-admin',
  imports: [
    ReactiveFormsModule,
    DatePickerModule,
    FloatLabelModule,
    InputTextModule,
    PopoverModule,
    SelectModule,
    ButtonModule,
    TableModule,
    TagModule,
    FileIcon,
    SearchInputComponent
],
  templateUrl: './document-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export default class DocumentAdmin {
  private documentService = inject(DocumentDataSource);
  private dialogService = inject(DialogService);
  private formBuilder = inject(FormBuilder);

  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');
  dataSource = signal<DocumentManageResponse[]>([]);
  dataSize = signal<number>(0);

  filterForm: FormGroup = this.formBuilder.group({
    sectionId: [null],
    typeId: [null],
    subtypeId: [null],
    date: [null],
  });

  readonly sections = this.documentService.sections;
  readonly types = signal<DocumentTypeResponse[]>([]);
  readonly subtypes = signal<DocumentSubtypeResponse[]>([]);

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.documentService
      .findAll({
        limit: this.limit(),
        offset: this.offset(),
        term: this.searchTerm(),
        ...this.filterForm.value,
      })
      .subscribe(({ documents, total }) => {
        this.dataSource.set(documents);
        this.dataSize.set(total);
      });
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

  selectSection(value: number) {
    this.filterForm.patchValue({ typeId: null, subtypeId: null });
    this.types.set([]);
    this.subtypes.set([]);
    this.documentService.getTypesBySection(value).subscribe((items) => {
      this.types.set(items);
    });
  }

  selectType(value: number) {
    this.filterForm.patchValue({ subtypeId: null });
    this.subtypes.set([]);
    this.documentService.getSubtypesByType(value).subscribe((items) => {
      this.subtypes.set(items);
    });
  }

  openCreateDialog() {
    const diagloRef = this.dialogService.open(DocumentCreate, {
      header: 'Crear Documentación',
      modal: true,
      focusOnShow: false,
      closable: true,
      draggable: false,
      width: '40vw',
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
      focusOnShow: false,
      closable: true,
      draggable: false,
      data: item,
      width: '40vw',
    });
    diagloRef?.onClose.subscribe((result?: DocumentManageResponse) => {
      if (!result) return;
      this.upsertItem(result);
    });
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
}
