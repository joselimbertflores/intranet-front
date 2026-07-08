import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { TreeSelectModule } from 'primeng/treeselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TreeNodeSelectEvent } from 'primeng/tree';
import { MessageModule } from 'primeng/message';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TreeNode } from 'primeng/api';

import { CustomFormValidators, FormUtils } from '../../../../../helpers';
import { DocumentDataSource } from '../../services';
import { FileIcon } from '../../../../../shared';
import { FileSizePipe } from '../../pipes';
import {
  DocumentTypeWithSubTypesResponse,
  DocumentSubtypeResponse,
  SectionTreeNodeResponse,
} from '../../interfaces';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-document-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TreeSelectModule,
    FloatLabelModule,
    InputTextModule,
    StepperModule,
    MessageModule,
    SelectModule,
    ButtonModule,
    FileSizePipe,
    FileIcon,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './document-create.html',
})
export class DocumentCreate {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);
  private documentDataSource = inject(DocumentDataSource);

  readonly MIN_YEAR = 2000;
  readonly MAX_YEAR = new Date().getFullYear() + 1;
  readonly yearOptions = this.buildYearOptions(this.MIN_YEAR, this.MAX_YEAR);
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

  readonly acceptAttribute = this.FILE_RULES.allowedExtensions
    .map((ext) => ext.trim().toLowerCase())
    .map((ext) => (ext.startsWith('.') ? ext : `.${ext}`))
    .join(',');

  readonly allowedExtensionsLabel = this.FILE_RULES.allowedExtensions
    .map((ext) => ext.toUpperCase())
    .join(', ');

  readonly formUtils = FormUtils;

  form: FormGroup = this.formBuilder.group({
    organizationalUnitId: [null, Validators.required],
    documentTypeId: [null, Validators.required],
    documentSubtypeId: [{ value: null, disabled: true }],
    year: [null],
    documents: this.formBuilder.array([]),
  });

  organizationTree = computed(() =>
    this.toTreeNodes(this.documentDataSource.organizationUnitsTree()),
  );
  documentTypes = computed(() => this.documentDataSource.documentTypes());
  documentSubtypes = signal<DocumentSubtypeResponse[]>([]);

  files = signal<File[]>([]);
  hasInvalidFiles = signal(false);

  private invalidFileMessageTimer?: ReturnType<typeof setTimeout>;

  isSaving = signal(false);

  save() {
    if (this.isSaving()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    this.documentDataSource
      .create({ ...this.form.value, files: this.files() })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe((resp) => {
        this.diagloRef.close(resp);
      });
  }

  close() {
    this.diagloRef.close();
  }

  removeFile(index: number) {
    this.files.update((files) => files.filter((_, i) => i !== index));
    this.documentsFormArray.removeAt(index);
  }

  onFileSelect(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    if (!inputElement.files || inputElement.files.length === 0) return;

    const files = Array.from(inputElement.files);

    const validFiles = files.filter((file) => this.validateFile(file));

    validFiles.forEach((file) => this.addAttachment(file));

    (event.target as HTMLInputElement).value = '';

    if (validFiles.length !== files.length) {
      this.showInvalidFileMessage();
    }
  }

  selectOrganizationUnit(event: TreeNodeSelectEvent) {
    this.form.get('organizationalUnitId')?.setValue(event.node.data);
  }

  selectDocumentType(type: DocumentTypeWithSubTypesResponse) {
    this.documentSubtypes.set(type.subtypes);
    this.form.patchValue({ documentTypeId: type.id, documentSubtypeId: null });
    if (type.subtypes.length > 0) {
      this.form.get('documentSubtypeId')?.enable();
    } else {
      this.form.get('documentSubtypeId')?.disable();
    }
  }

  get documentsFormArray() {
    return this.form.get('documents') as FormArray;
  }

  private validateFile(file: File): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !this.FILE_RULES.allowedExtensions.includes(ext)) {
      return false;
    }

    const maxSizeBytes = this.FILE_RULES.maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return false;
    }

    if (this.isFileDuplicate(file)) {
      return false;
    }

    return true;
  }

  private isFileDuplicate(selectedFile: File): boolean {
    return this.files().some(
      (item) =>
        item.name === selectedFile.name &&
        item.size === selectedFile.size &&
        item.lastModified === selectedFile.lastModified,
    );
  }

  private addAttachment(file: File) {
    this.files.update((files) => [...files, file]);
    this.documentsFormArray.push(this.createDocumentForm(file));
  }

  private createDocumentForm(file: File) {
    return this.formBuilder.group({
      title: [
        this.removeExtension(file.name),
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
          Validators.pattern(/^[\p{L}\p{N} _.,:'();\-–—]+$/u),
          CustomFormValidators.notOnlyWhitespace,
        ],
      ],
    });
  }

  private showInvalidFileMessage(): void {
    this.hasInvalidFiles.set(true);

    if (this.invalidFileMessageTimer) {
      clearTimeout(this.invalidFileMessageTimer);
    }

    this.invalidFileMessageTimer = setTimeout(() => {
      this.hasInvalidFiles.set(false);
    }, 3000);
  }

  private toTreeNodes(nodes: SectionTreeNodeResponse[]): TreeNode<string>[] {
    return nodes.map((node) => ({
      key: node.id,
      label: node.name.toUpperCase(),
      data: node.id,
      children: node.children ? this.toTreeNodes(node.children) : [],
    }));
  }

  private buildYearOptions(minYear: number, maxYear: number) {
    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
      const year = maxYear - index;
      return { label: String(year), value: year };
    });
  }

  private removeExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot === -1 ? fileName : fileName.substring(0, lastDot);
  }
}
