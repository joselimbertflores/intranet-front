import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { DocumentManageResponse } from '../../interfaces';
import { DocumentDataSource } from '../../services';
import { FileIcon } from '../../../../../shared';

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
    FileIcon,
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

  readonly fileStatusOptions = [
    { name: 'PUBLICADO', value: 'PUBLISHED' },
    { name: 'ARCHIVADO', value: 'ARCHIVED' },
  ];

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

  form: FormGroup = this.formBuilder.nonNullable.group({
    displayName: ['', Validators.required],
    date: [null, Validators.required],
    status: ['', Validators.required],
  });
  selectedFile: File | null = null;
  replaceFile = signal(false);

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    if (!this.isFormValid) return;
    this.documentDataSource
      .update(this.data.id, {
        ...this.form.value,
        file: this.selectedFile,
      })
      .subscribe((resp) => this.diagloRef.close(resp));
  }

  close() {
    this.diagloRef.close();
  }

  onSelectFile(event: FileSelectEvent): void {
    const [file] = Array.from(event.files) ?? [];
    if (!file || !this.validateFile(file)) return;
    this.selectedFile = file;
    this.form.get('displayName')?.setValue(this.removeExtension(file.name));
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
    const { fiscalYear, ...props } = this.data;
    this.form.patchValue({ ...props, date: new Date(fiscalYear, 0, 1) });
  }
}
