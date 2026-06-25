import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { FileSizePipe } from '../../pipes';
import {
  DocumentManageResponse,
  DocumentSubtypeResponse,
  DocumentTypeWithSubTypesResponse,
  SectionTreeNodeResponse,
} from '../../interfaces';
import { DocumentDataSource } from '../../services';
import { FileIcon } from '../../../../../shared';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeNode } from 'primeng/api';
import { FormUtils } from '../../../../../helpers';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-document-edit',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    FileUploadModule,
    InputTextModule,
    CheckboxModule,
    FloatLabelModule,
    DatePickerModule,
    SelectModule,
    FileSizePipe,
    ButtonModule,
    MessageModule,
    FileIcon,
    TreeSelectModule,
  ],

  templateUrl: './document-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentEdit implements OnInit {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);
  private documentDataSource = inject(DocumentDataSource);

  readonly currentDate = new Date();
  readonly minDateValue: Date = new Date(2000, 0, 1);
  readonly maxDateValue = new Date(this.currentDate.getFullYear() + 1, 11, 31);


  readonly FILE_RULES = {
    maxSizeMB: 20,
    allowedExtensions: [
      'pdf',
      'odt',
      'ods',
      'odp',
      'docx',
      'xlsx',
      'pptx',
      'jpg',
      'jpeg',
      'png',
      'webp',
      'mp4',
      'webm',
      'mp3',
      'ogg',
    ],
  };

  readonly data: DocumentManageResponse = inject(DynamicDialogConfig).data;

  // form: FormGroup = this.formBuilder.nonNullable.group({
  //   displayName: ['', Validators.required],
  //   date: [null, Validators.required],
  //   status: ['', Validators.required],
  // });

  form = this.formBuilder.group({
    title: ['', Validators.required],
    organizationalUnitNode: [
      null as TreeNode<string> | null,
      Validators.required,
    ],
    documentTypeId: [null as number | null, Validators.required],
    documentSubtypeId: [{ value: null as number | null, disabled: true }],
    year: [null as number | null],
    status: [null as string | null],
  });

  selectedFile: File | null = null;
  replaceFile = signal(false);

  organizationTree = computed(() =>
    this.toTreeNodes(this.documentDataSource.organizationUnitsTree()),
  );
  documentTypes = computed(() => this.documentDataSource.documentTypes());
  documentSubtypes = signal<DocumentSubtypeResponse[]>([]);
  readonly MIN_YEAR = 2000;
  readonly MAX_YEAR = new Date().getFullYear() + 1;
  readonly yearOptions = this.buildYearOptions(this.MIN_YEAR, this.MAX_YEAR);
  readonly documentStatusOptions = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
  ];

  readonly formUtils = FormUtils;

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    if (!this.isFormValid) return;
    // this.documentDataSource
    //   .update(this.data.id, {
    //     ...this.form.value,
    //     file: this.selectedFile,
    //   })
    //   .subscribe((resp) => this.diagloRef.close(resp));
  }

  close() {
    this.diagloRef.close();
  }

  selectDocumentType(type: DocumentTypeWithSubTypesResponse) {
    this.documentSubtypes.set(type.subtypes);
    this.form.get('documentSubtypeId')?.setValue(null);
    if (type.subtypes.length > 0) {
      this.form.get('documentSubtypeId')?.enable();
    } else {
      this.form.get('documentSubtypeId')?.disable();
    }
  }

  onSelectFile(event: FileSelectEvent): void {
    const [file] = Array.from(event.files) ?? [];
    if (!file || !this.validateFile(file)) return;
    this.selectedFile = file;
    // this.form.get('displayName')?.setValue(this.removeExtension(file.name));
  }

  onReplaceChange(checked: boolean) {
    if (!checked) {
      this.selectedFile = null;
    }
  }

  get allowedExtensionsLabel(): string {
    return this.FILE_RULES.allowedExtensions.join(', ');
  }

  get acceptAttribute(): string {
    return this.FILE_RULES.allowedExtensions.map((ext) => `.${ext}`).join(',');
  }

  get maxFileSizeBytes(): number {
    return this.FILE_RULES.maxSizeMB * 1024 * 1024;
  }

  get maxFileSizeLabel(): string {
    return `${this.FILE_RULES.maxSizeMB} MB`;
  }

  get isFormValid() {
    return this.form.valid && (!this.replaceFile() || !!this.selectedFile);
  }

  private validateFile(file: File): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !this.FILE_RULES.allowedExtensions.includes(ext)) {
      return false;
    }

    const maxSizeBytes = this.maxFileSizeBytes;

    if (file.size > maxSizeBytes) {
      return false;
    }

    return true;
  }

  private removeExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot === -1 ? fileName : fileName.substring(0, lastDot);
  }

  private loadForm() {
    const node = this.findTreeNodeByKey(
      this.organizationTree(),
      this.data.organizationalUnit.id,
    );

    const selectedTypeDocument = this.documentTypes().find(
      ({ id }) => id === this.data.documentType.id,
    );

    if (selectedTypeDocument?.subtypes.length) {
      this.documentSubtypes.set(selectedTypeDocument.subtypes);
      this.form.get('documentSubtypeId')?.enable();
    }

    this.form.patchValue({
      documentSubtypeId: this.data.documentSubtype?.id,
      documentTypeId: this.data.documentType.id,
      organizationalUnitNode: node,
      status: this.data.status,
      year: this.data.year,
      title: this.data.title,
    });
  }

  private toTreeNodes(nodes: SectionTreeNodeResponse[]): TreeNode<string>[] {
    return nodes.map((node) => ({
      key: node.id,
      label: node.name.toUpperCase(),
      data: node.id,
      children: node.children ? this.toTreeNodes(node.children) : [],
    }));
  }

  private findTreeNodeByKey(
    nodes: TreeNode<string>[],
    key: string,
  ): TreeNode<string> | null {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }

      const found = this.findTreeNodeByKey(node.children ?? [], key);

      if (found) {
        return found;
      }
    }

    return null;
  }

  private buildYearOptions(minYear: number, maxYear: number) {
    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
      const year = maxYear - index;
      return { label: String(year), value: year };
    });
  }
}
