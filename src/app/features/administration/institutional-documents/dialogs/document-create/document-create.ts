import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';

import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { TreeSelectModule } from 'primeng/treeselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TreeNode } from 'primeng/api';

import { DocumentDataSource } from '../../services';
import {
  DocumentSubtypeResponse,
  DocumentTypeWithSubTypesResponse,
  SectionTreeNodeResponse,
} from '../../interfaces';
import { FileIcon } from '../../components';
import { FileSizePipe } from '../../pipes';
import { CustomFormValidator, FormUtils } from '../../../../../helpers';
import { TreeNodeSelectEvent } from 'primeng/tree';

@Component({
  selector: 'app-document-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePickerModule,
    FloatLabelModule,
    InputTextModule,
    StepperModule,
    MessageModule,
    SelectModule,
    ButtonModule,
    FileSizePipe,
    FileIcon,
    TreeSelectModule,
  ],
  templateUrl: './document-create.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentCreate {
  private formBuilder = inject(FormBuilder);
  private documentDataSource = inject(DocumentDataSource);
  private diagloRef = inject(DynamicDialogRef);

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
  readonly formUtils = FormUtils;

  form: FormGroup = this.formBuilder.nonNullable.group({
    sectionId: [null, Validators.required],
    typeId: [null, Validators.required],
    subtypeId: [{ value: null, disabled: true }],
    documents: this.formBuilder.array([]),
    date: [this.currentDate, Validators.required],
  });

  readonly sectionsTree = toSignal(this.getTreeSections(), {
    initialValue: [],
  });
  readonly types = toSignal(this.documentDataSource.getTypes(), {
    initialValue: [],
  });
  readonly subtypes = signal<DocumentSubtypeResponse[]>([]);

  files = signal<File[]>([]);
  hasInvalidFiles = signal(false);

  save() {
    this.documentDataSource
      .create({ ...this.form.value, files: this.files() })
      .subscribe((resp) => {
        this.diagloRef.close(resp);
      });
  }

  close() {
    this.diagloRef.close();
  }

  removeFile(index: number) {
    this.files.update((files) => {
      files.splice(index, 1);
      return [...files];
    });
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

  selectSection(event: TreeNodeSelectEvent) {
    this.form.patchValue({ sectionId: event.node.key });
  }

  selectType(type: DocumentTypeWithSubTypesResponse) {
    this.subtypes.set(type.subtypes);
    this.form.patchValue({ typeId: type.id, subtypeId: null });
    this.form.get('subtypeId')?.enable();
  }

  get allowedExtensionsLabel(): string {
    return this.FILE_RULES.allowedExtensions
      .map((ext) => ext.toUpperCase())
      .join(', ');
  }

  get acceptAttribute(): string {
    return this.FILE_RULES.allowedExtensions.map((ext) => `.${ext}`).join(',');
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

  private removeExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot === -1 ? fileName : fileName.substring(0, lastDot);
  }

  private addAttachment(file: File) {
    this.files.update((files) => [...files, file]);
    this.documentsFormArray.push(this.createDocumentForm(file));
  }

  private createDocumentForm(file: File) {
    return this.formBuilder.group({
      displayName: [
        this.removeExtension(file.name),
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
          Validators.pattern(/^[\p{L}\p{N} _.,:'();\-–—]+$/u),
          CustomFormValidator.notOnlyWhitespace,
        ],
      ],
    });
  }

  private showInvalidFileMessage() {
    this.hasInvalidFiles.set(true);
    setTimeout(() => {
      this.hasInvalidFiles.set(false);
    }, 3000);
  }

  private getTreeSections(): Observable<TreeNode[]> {
    return this.documentDataSource
      .getTreeSections()
      .pipe(map((resp) => this.toTreeNode(resp)));
  }

  private toTreeNode(nodes: SectionTreeNodeResponse[]): TreeNode[] {
    return nodes.map((n) => ({
      key: n.id,
      label: n.name.toUpperCase(),
      selectable: true,
      children: n.children ? this.toTreeNode(n.children) : [],
    }));
  }
}
