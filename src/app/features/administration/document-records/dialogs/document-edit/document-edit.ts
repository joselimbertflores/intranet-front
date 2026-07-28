import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  disabled,
  form,
  FormField,
  FormRoot,
  maxLength,
  required,
  validate,
} from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAudioLines,
  lucideCircleAlert,
  lucideDownload,
  lucideExternalLink,
  lucideFileText,
  lucideImage,
  lucideTrash2,
  lucideUpload,
  lucideVideo,
} from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { firstValueFrom } from 'rxjs';

import { YearSelector } from '../../../../../shared';
import {
  OrganizationalUnitOption,
  OrganizationalUnitPicker,
} from '../../components/organizational-unit-picker/organizational-unit-picker';
import { DOCUMENT_FILE_RULES } from '../../constants/document-file-rules';
import { DocumentResponse, SectionTreeNodeResponse } from '../../interfaces';
import { FileSizePipe } from '../../pipes';
import { DocumentDataSource } from '../../services';

interface DocumentEditContext {
  document: DocumentResponse;
}

interface DocumentEditFormModel {
  title: string;
  organizationalUnitId: string | null;
  documentTypeId: number | null;
  documentSubtypeId: number | null;
  year: number | null;
  status: string | null;
  replaceFile: boolean;
}

@Component({
  selector: 'app-document-edit',
  imports: [
    DatePipe,
    FileSizePipe,
    FormField,
    FormRoot,
    HlmButtonImports,
    HlmCheckbox,
    HlmDialogDescription,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInputImports,
    HlmSelectImports,
    HlmSeparator,
    HlmSpinner,
    NgIcon,
    OrganizationalUnitPicker,
    YearSelector,
  ],
  providers: [
    provideIcons({
      lucideAudioLines,
      lucideCircleAlert,
      lucideDownload,
      lucideExternalLink,
      lucideFileText,
      lucideImage,
      lucideTrash2,
      lucideUpload,
      lucideVideo,
    }),
  ],
  templateUrl: './document-edit.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] flex-col',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentEdit {
  private readonly dialogRef =
    inject<BrnDialogRef<DocumentResponse>>(BrnDialogRef);
  private readonly documentDataSource = inject(DocumentDataSource);
  private readonly context = injectBrnDialogContext<DocumentEditContext>();

  readonly document = this.context.document;
  readonly fileRules = DOCUMENT_FILE_RULES;

  readonly organizationalUnits = toSignal(
    this.documentDataSource.getOrganizationTree(),
    { initialValue: [] },
  );
  readonly documentTypes = toSignal(
    this.documentDataSource.getDocumentTypes(),
    { initialValue: [] },
  );

  readonly selectedFile = signal<File | null>(null);
  readonly fileSelectionError = signal<string | null>(null);
  readonly updateError = signal<string | null>(null);

  readonly formModel = signal<DocumentEditFormModel>(
    this.createInitialFormModel(),
  );

  readonly documentForm = form(
    this.formModel,
    (schemaPath) => {
      disabled(schemaPath, {
        when: ({ state }) => state.submitting(),
      });

      validate(schemaPath.title, ({ value }) =>
        value().trim()
          ? null
          : {
              kind: 'required',
              message: 'El título es obligatorio.',
            },
      );
      maxLength(schemaPath.title, 150, {
        message: 'El título admite hasta 150 caracteres.',
      });

      required(schemaPath.documentTypeId, {
        message: 'Seleccione un tipo documental.',
      });
      required(schemaPath.status, {
        message: 'Seleccione un estado.',
      });

      disabled(schemaPath.documentSubtypeId, {
        when: ({ valueOf }) => {
          const typeId = valueOf(schemaPath.documentTypeId);
          return !this.documentTypes().some(
            ({ id, subtypes }) => id === typeId && subtypes.length > 0,
          );
        },
      });

      validate(schemaPath.replaceFile, ({ value }) =>
        value() && !this.selectedFile()
          ? {
              kind: 'required',
              message: 'Seleccione el archivo que reemplazará al actual.',
            }
          : null,
      );
    },
    {
      submission: {
        action: async (formField) => {
          await this.updateDocument(formField().value());
        },
      },
    },
  );

  readonly documentSubtypes = computed(() => {
    const selectedTypeId = this.documentForm.documentTypeId().value();
    return (
      this.documentTypes().find(({ id }) => id === selectedTypeId)?.subtypes ??
      []
    );
  });
  readonly documentTypeNames = computed(
    () => new Map(this.documentTypes().map(({ id, name }) => [id, name])),
  );
  readonly documentSubtypeNames = computed(
    () => new Map(this.documentSubtypes().map(({ id, name }) => [id, name])),
  );
  readonly organizationalUnitOptions = computed<OrganizationalUnitOption[]>(
    () => this.flattenOrganizationalUnits(this.organizationalUnits()),
  );

  readonly statusOptions = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
  ];
  readonly statusNames = new Map(
    this.statusOptions.map(({ value, label }) => [value, label]),
  );

  ngOnInit(){
    console.log(this.context.document);
  }

  close(): void {
    if (!this.documentForm().submitting()) {
      this.dialogRef.close();
    }
  }

  onDocumentTypeChange(): void {
    this.documentForm.documentSubtypeId().value.set(null);
  }

  onReplaceFileChange(replaceFile: boolean): void {
    if (!replaceFile) {
      this.clearReplacementFile();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const [file] = input.files ?? [];
    input.value = '';

    if (!file) return;

    const validationMessage = this.validateReplacementFile(file);
    if (validationMessage) {
      this.selectedFile.set(null);
      this.fileSelectionError.set(validationMessage);
      this.documentForm.replaceFile().markAsTouched();
      return;
    }

    this.selectedFile.set(file);
    this.fileSelectionError.set(null);
    this.updateError.set(null);
  }

  clearReplacementFile(): void {
    this.selectedFile.set(null);
    this.fileSelectionError.set(null);
  }

  openFile(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  downloadFile(url: string): void {
    const fileUrl = new URL(url);
    fileUrl.searchParams.set('download', 'true');
    window.open(fileUrl.toString(), '_blank', 'noopener,noreferrer');
  }

  isFieldInvalid(fieldName: keyof DocumentEditFormModel): boolean {
    const field = this.documentForm[fieldName]();
    return field.touched() && field.errors().length > 0;
  }

  fileIconName(fileName: string, mimeType = ''): string {
    const extension = this.fileExtension(fileName);

    if (
      mimeType.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'webp'].includes(extension)
    ) {
      return 'lucideImage';
    }
    if (mimeType.startsWith('video/') || ['mp4', 'webm'].includes(extension)) {
      return 'lucideVideo';
    }
    if (mimeType.startsWith('audio/') || ['mp3', 'ogg'].includes(extension)) {
      return 'lucideAudioLines';
    }
    return 'lucideFileText';
  }

  fileExtension(fileName: string): string {
    const finalDotIndex = fileName.lastIndexOf('.');
    return finalDotIndex < 0
      ? ''
      : fileName.slice(finalDotIndex + 1).toLowerCase();
  }

  private createInitialFormModel(): DocumentEditFormModel {
    return {
      title: this.document.title,
      organizationalUnitId: this.document.organizationalUnit?.id ?? null,
      documentTypeId: this.document.documentType.id,
      documentSubtypeId: this.document.documentSubtype?.id ?? null,
      year: this.document.year ?? null,
      status: this.document.status,
      replaceFile: false,
    };
  }

  private async updateDocument(
    formValue: DocumentEditFormModel,
  ): Promise<void> {
    this.updateError.set(null); 
    try {
      const updatedDocument = await firstValueFrom(
        this.documentDataSource.update(this.document.id, {
          title: formValue.title.trim(),
          organizationalUnitId: formValue.organizationalUnitId,
          documentTypeId: formValue.documentTypeId,
          documentSubtypeId: formValue.documentSubtypeId,
          year: formValue.year,
          status: formValue.status,
          file: formValue.replaceFile ? this.selectedFile() : null,
        }),
      );
      this.dialogRef.close(updatedDocument);
    } catch (error: unknown) {
      this.updateError.set(
        this.requestErrorMessage(
          error,
          'No se pudieron guardar los cambios. Intente nuevamente.',
        ),
      );
    }
  }

  private validateReplacementFile(file: File): string | null {
    const extension = this.fileExtension(file.name);

    if (
      !(this.fileRules.allowedExtensions as readonly string[]).includes(
        extension,
      )
    ) {
      return `La extensión .${extension || '(sin extensión)'} no está permitida.`;
    }
    if (file.size > this.fileRules.maxSizeBytes) {
      return `El archivo supera el tamaño máximo de ${this.fileRules.maxSizeMB} MB.`;
    }
    return null;
  }

  private flattenOrganizationalUnits(
    nodes: SectionTreeNodeResponse[],
    parentPath: string[] = [],
    depth = 0,
  ): OrganizationalUnitOption[] {
    return nodes.flatMap((node) => {
      const path = [...parentPath, node.name];
      return [
        {
          id: node.id,
          name: node.name,
          depth,
          searchText: path.join(' / '),
        },
        ...this.flattenOrganizationalUnits(node.children, path, depth + 1),
      ];
    });
  }

  private requestErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) return fallback;

    const responseBody = error.error as
      | { message?: string | string[] }
      | null
      | undefined;
    const message = responseBody?.message;

    if (Array.isArray(message)) return message.join(' ');
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
}
