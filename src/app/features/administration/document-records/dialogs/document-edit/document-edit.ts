import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormsModule,
  Validators,
} from '@angular/forms';

import { finalize } from 'rxjs';

import { DOCUMENT_FILE_RULES } from '../../constants/document-file-rules';
import { FileIcon, YearSelector } from '../../../../../shared';
import { FileSizePipe } from '../../pipes';
import {
  DocumentManageResponse,
  DocumentSubtypeResponse,
  SectionTreeNodeResponse,
} from '../../interfaces';
import { DocumentDataSource } from '../../services';
import { FormUtils } from '../../../../../helpers';

@Component({
  selector: 'app-document-edit',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,

    FileSizePipe,
    FileIcon,
    YearSelector,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './document-edit.html',
})
export class DocumentEdit implements OnInit {
  private formBuilder = inject(FormBuilder);
  // private diagloRef = inject(DynamicDialogRef);
  private documentDataSource = inject(DocumentDataSource);

  // readonly data: DocumentManageResponse = inject(DynamicDialogConfig).data;

  readonly formUtils = FormUtils;

  form = this.formBuilder.group({
    title: ['', Validators.required],
    organizationalUnitNode: [null, Validators.required],
    documentTypeId: [null as number | null, Validators.required],
    documentSubtypeId: [{ value: null as number | null, disabled: true }],
    year: [null as number | null],
    status: [null as string | null, Validators.required],
  });
  isSaving = signal(false);
  submitted = signal(false);

  organizationTree = computed(() =>
    this.toTreeNodes(this.documentDataSource.organizationUnitsTree()),
  );
  documentTypes = computed(() => this.documentDataSource.documentTypes());
  documentSubtypes = signal<DocumentSubtypeResponse[]>([]);
  readonly documentStatusOptions = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
  ];

  readonly fileRules = DOCUMENT_FILE_RULES;
  readonly acceptAttribute = this.fileRules.allowedExtensions
    .map((ext) => ext.trim().toLowerCase())
    .map((ext) => (ext.startsWith('.') ? ext : `.${ext}`))
    .join(',');
  readonly allowedExtensionsLabel = this.fileRules.allowedExtensions
    .map((ext) => ext.toUpperCase())
    .join(', ');
  readonly maxFileSizeBytes = this.fileRules.maxSizeMB * 1024 * 1024;
  readonly maxFileSizeLabel = `${this.fileRules.maxSizeMB} MB`;

  selectedFile = signal<File | null>(null);
  replaceFile = signal(false);
  fileRequiredError = computed(
    () => this.submitted() && this.replaceFile() && !this.selectedFile(),
  );

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    if (this.isSaving()) return;

    const fileRequired = this.replaceFile() && !this.selectedFile();

    this.submitted.set(true);

    if (this.form.invalid || fileRequired) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const { organizationalUnitNode, ...props } = this.form.value;

    // this.documentDataSource
    //   .update(this.data.id, {
    //     ...props,
    //     organizationalUnitId: organizationalUnitNode?.data,
    //     file: this.selectedFile(),
    //   })
    //   .pipe(finalize(() => this.isSaving.set(false)))
    //   .subscribe((resp) => this.diagloRef.close(resp));
  }

  close() {
    if (!this.isSaving()) {
      // this.diagloRef.close();
    }
  }

  selectDocumentType(id: number) {
    const selectedType = this.documentTypes().find((item) => item.id === id);
    this.documentSubtypes.set(selectedType?.subtypes ?? []);

    const control = this.form.controls['documentSubtypeId'];
    control.setValue(null);

    if (selectedType?.subtypes.length) {
      control.enable();
    } else {
      control.disable();
    }
  }

  onSelectFile(event: any): void {
    // const [file] = Array.from(event.files) ?? [];
    // if (!file) return;
    // this.selectedFile.set(file);
  }

  onReplaceChange(checked: boolean) {
    this.replaceFile.set(checked);
    if (!checked) {
      this.selectedFile.set(null);
    }
  }

  downloadFile(url: string): void {
    const fileUrl = new URL(url);
    fileUrl.searchParams.set('download', 'true');
    window.open(fileUrl.toString(), '_blank', 'noopener,noreferrer');
  }

  openFile(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private loadForm() {
    // const node = this.findTreeNodeByKey(
    //   this.organizationTree(),
    //   this.data.organizationalUnit.id,
    // );
    // const selectedTypeDocument = this.documentTypes().find(
    //   ({ id }) => id === this.data.documentType.id,
    // );
    // if (selectedTypeDocument?.subtypes.length) {
    //   this.documentSubtypes.set(selectedTypeDocument.subtypes);
    //   this.form.get('documentSubtypeId')?.enable();
    // }
    // this.form.patchValue({
    //   documentSubtypeId: this.data.documentSubtype?.id,
    //   documentTypeId: this.data.documentType.id,
    //   organizationalUnitNode: node,
    //   status: this.data.status,
    //   year: this.data.year,
    //   title: this.data.title,
    // });
  }

  private toTreeNodes(nodes: SectionTreeNodeResponse[]): any[] {
    return nodes.map((node) => ({
      key: node.id,
      label: node.name.toUpperCase(),
      data: node.id,
      children: node.children ? this.toTreeNodes(node.children) : [],
    }));
  }

  // private findTreeNodeByKey(nodes: any[], key: string) {
  //   for (const node of nodes) {
  //     if (node.key === key) {
  //       return node;
  //     }

  //     const found = this.findTreeNodeByKey(node.children ?? [], key);

  //     if (found) {
  //       return found;
  //     }
  //   }

  //   return null;
  // }
}
