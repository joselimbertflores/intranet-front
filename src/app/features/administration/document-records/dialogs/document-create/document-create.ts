import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  applyEach,
  disabled,
  form,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';
import { toSignal } from '@angular/core/rxjs-interop';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAudioLines,
  lucideCircleAlert,
  lucideFileText,
  lucideImage,
  lucidePlus,
  lucideTrash2,
  lucideUploadCloud,
  lucideVideo,
} from '@ng-icons/lucide';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import {
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
  DOCUMENT_FILE_RULES,
  DocumentAllowedExtension,
} from '../../constants/document-file-rules';
import { DocumentResponse, SectionTreeNodeResponse } from '../../interfaces';
import { CreateDocumentBatchDto, DocumentDataSource } from '../../services';
import { FileSizePipe } from '../../pipes';
import {
  OrganizationalUnitOption,
  OrganizationalUnitPicker,
} from '../../components/organizational-unit-picker/organizational-unit-picker';

interface BatchDocumentFormItem {
  clientId: string;
  title: string;
}

interface DocumentBatchFormModel {
  organizationalUnitId: string | null;
  documentTypeId: number | null;
  documentSubtypeId: number | null;
  year: number | null;
  documents: BatchDocumentFormItem[];
}

type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

interface PendingDocumentFile {
  clientId: string;
  file: File;
  uploadedFileId: string | null;
  uploadStatus: UploadStatus;
  uploadError: string | null;
}

interface FileSelectionIssue {
  fileName: string;
  message: string;
}

@Component({
  selector: 'app-document-create',
  imports: [
    FileSizePipe,
    FormField,
    FormRoot,
    HlmBadgeImports,
    HlmButtonImports,
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
      lucideFileText,
      lucideImage,
      lucidePlus,
      lucideTrash2,
      lucideUploadCloud,
      lucideVideo,
    }),
  ],
  templateUrl: './document-create.html',
  host: {
    class:
      'flex max-h-[calc(100dvh-4rem)] flex-col overflow-hidden',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentCreate {
  private dialogRef = inject<BrnDialogRef<DocumentResponse[]>>(BrnDialogRef);
  private documentDataSource = inject(DocumentDataSource);
  private nextClientId = 0;

  readonly fileRules = DOCUMENT_FILE_RULES;
  readonly allowedExtensionsLabel = this.fileRules.allowedExtensions
    .map((extension) => extension.toUpperCase())
    .join(', ');

  readonly organizationalUnits = toSignal(
    this.documentDataSource.getOrganizationTree(),
    { initialValue: [] },
  );

  readonly documentTypes = toSignal(
    this.documentDataSource.getDocumentTypes(),
    { initialValue: [] },
  );

  readonly documentSubtypes = computed(() => {
    const selectedTypeId = this.documentForm.documentTypeId().value();
    return (
      this.documentTypes().find(({ id }) => id === selectedTypeId)?.subtypes ??
      []
    );
  });

  // For display select labels
  readonly documentTypeNames = computed(
    () => new Map(this.documentTypes().map(({ id, name }) => [id, name])),
  );
  readonly documentSubtypeNames = computed(
    () => new Map(this.documentSubtypes().map(({ id, name }) => [id, name])),
  );
  readonly organizationalUnitOptions = computed<OrganizationalUnitOption[]>(
    () => this.flattenOrganizationalUnits(this.organizationalUnits()),
  );

  readonly selectedFiles = signal<PendingDocumentFile[]>([]);
  readonly selectedFilesByClientId = computed(
    () =>
      new Map(
        this.selectedFiles().map((pendingFile) => [
          pendingFile.clientId,
          pendingFile,
        ]),
      ),
  );
  readonly selectionIssues = signal<FileSelectionIssue[]>([]);
  readonly creationError = signal<string | null>(null);
  readonly isDraggingFiles = signal(false);

  readonly formModel = signal<DocumentBatchFormModel>({
    organizationalUnitId: null,
    documentTypeId: null,
    documentSubtypeId: null,
    year: null,
    documents: [],
  });

  readonly documentForm = form(
    this.formModel,
    (schemaPath) => {
      disabled(schemaPath, {
        when: ({ state }) => state.submitting(),
      });
      required(schemaPath.documentTypeId, {
        message: 'Seleccione un tipo documental.',
      });

      disabled(schemaPath.documentSubtypeId, {
        when: ({ valueOf }) => {
          const typeId = valueOf(schemaPath.documentTypeId);
          return !this.documentTypes().some(
            ({ id, subtypes }) => id === typeId && subtypes.length > 0,
          );
        },
      });

      minLength(schemaPath.documents, 1, {
        message: 'Seleccione al menos un archivo.',
      });

      applyEach(schemaPath.documents, (document) => {
        validate(document.title, ({ value }) =>
          value().trim()
            ? null
            : {
                kind: 'required',
                message: 'El título es obligatorio.',
              },
        );
        maxLength(document.title, 150, {
          message: 'El título admite hasta 150 caracteres.',
        });
      });
    },
    {
      submission: {
        action: async (formField) => {
          await this.uploadAndCreateBatch(formField().value());
        },
      },
    },
  );

  close(): void {
    if (!this.documentForm().submitting()) {
      this.dialogRef.close();
    }
  }

  onDocumentTypeChange(): void {
    this.documentForm.documentSubtypeId().value.set(null);
  }

  onFileSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFiles = Array.from(input.files ?? []);
    input.value = '';
    this.addSelectedFiles(selectedFiles);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.documentForm().submitting()) {
      this.isDraggingFiles.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFiles.set(false);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFiles.set(false);

    if (this.documentForm().submitting()) return;
    this.addSelectedFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  removeDocument(clientId: string): void {
    if (this.documentForm().submitting()) return;

    this.selectedFiles.update((files) =>
      files.filter((pendingFile) => pendingFile.clientId !== clientId),
    );
    this.formModel.update((model) => ({
      ...model,
      documents: model.documents.filter(
        (document) => document.clientId !== clientId,
      ),
    }));
    this.creationError.set(null);
  }

  fileExtension(fileName: string): string {
    const finalDotIndex = fileName.lastIndexOf('.');
    return finalDotIndex < 0
      ? ''
      : fileName.slice(finalDotIndex + 1).toLowerCase();
  }

  fileIconName(file: File): string {
    const extension = this.fileExtension(file.name);

    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
      return 'lucideImage';
    }
    if (['mp4', 'webm'].includes(extension)) {
      return 'lucideVideo';
    }
    if (['mp3', 'ogg'].includes(extension)) {
      return 'lucideAudioLines';
    }
    return 'lucideFileText';
  }

  uploadStatusLabel(status: UploadStatus): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'uploading':
        return 'Subiendo';
      case 'uploaded':
        return 'Subido';
      case 'error':
        return 'Error';
    }
  }

  private addSelectedFiles(files: File[]): void {
    if (files.length === 0 || this.documentForm().submitting()) return;

    const knownFileKeys = new Set(
      this.selectedFiles().map(({ file }) => this.getFileSelectionKey(file)),
    );
    const pendingFiles: PendingDocumentFile[] = [];
    const documentItems: BatchDocumentFormItem[] = [];
    const issues: FileSelectionIssue[] = [];

    for (const file of files) {
      const validationMessage = this.validateFile(file, knownFileKeys);

      if (validationMessage) {
        issues.push({ fileName: file.name, message: validationMessage });
        continue;
      }

      knownFileKeys.add(this.getFileSelectionKey(file));
      const clientId = this.createClientId();
      pendingFiles.push({
        clientId,
        file,
        uploadedFileId: null,
        uploadStatus: 'pending',
        uploadError: null,
      });
      documentItems.push({
        clientId,
        title: this.removeFinalExtension(file.name),
      });
    }

    if (pendingFiles.length > 0) {
      this.selectedFiles.update((currentFiles) => [
        ...currentFiles,
        ...pendingFiles,
      ]);
      this.formModel.update((model) => ({
        ...model,
        documents: [...model.documents, ...documentItems],
      }));
      this.creationError.set(null);
    }

    this.selectionIssues.set(issues);
  }

  private validateFile(file: File, knownFileKeys: ReadonlySet<string>) {
    const extension = this.fileExtension(file.name);
    if (!this.isAllowedExtension(extension)) {
      return `La extensión .${extension || '(sin extensión)'} no está permitida.`;
    }
    if (file.size > this.fileRules.maxSizeBytes) {
      return `Supera el tamaño máximo de ${this.fileRules.maxSizeMB} MB.`;
    }

    if (knownFileKeys.has(this.getFileSelectionKey(file))) {
      return 'El archivo ya fue agregado.';
    }
    return null;
  }

  private async uploadAndCreateBatch(formValue: DocumentBatchFormModel) {
    this.creationError.set(null);

    for (const pendingFile of this.selectedFiles()) {
      if (pendingFile.uploadedFileId !== null) continue;

      this.updateUploadState(pendingFile.clientId, {
        uploadStatus: 'uploading',
        uploadError: null,
      });

      try {
        const upload = await firstValueFrom(
          this.documentDataSource.uploadDocumentFile(pendingFile.file),
        );
        this.updateUploadState(pendingFile.clientId, {
          uploadedFileId: upload.id,
          uploadStatus: 'uploaded',
          uploadError: null,
        });
      } catch (error: unknown) {
        this.updateUploadState(pendingFile.clientId, {
          uploadStatus: 'error',
          uploadError: this.requestErrorMessage(
            error,
            'No se pudo subir el archivo. Intente nuevamente.',
          ),
        });
      }
    }

    const currentFiles = this.selectedFiles();
    if (currentFiles.some((pendingFile) => !pendingFile.uploadedFileId)) {
      this.creationError.set(
        'No se pudieron subir algunos archivos. Revise los errores e inténtelo nuevamente.',
      );
      return;
    }

    try {
      const response = await firstValueFrom(
        this.documentDataSource.createBatch(
          this.buildBatchPayload(formValue, currentFiles),
        ),
      );
      this.dialogRef.close(response);
    } catch (error: unknown) {
      this.creationError.set(
        this.requestErrorMessage(
          error,
          'Los archivos se subieron, pero no se pudo completar el proceso. Inténtelo nuevamente; no tendrá que volver a subirlos.',
        ),
      );
    }
  }

  private buildBatchPayload(
    formValue: DocumentBatchFormModel,
    pendingFiles: PendingDocumentFile[],
  ): CreateDocumentBatchDto {
    if (formValue.documentTypeId === null) {
      throw new Error('Document type is required.');
    }

    const uploadedFileIds = new Map(
      pendingFiles.map(({ clientId, uploadedFileId }) => [
        clientId,
        uploadedFileId,
      ]),
    );

    return {
      organizationalUnitId: formValue.organizationalUnitId,
      documentTypeId: formValue.documentTypeId,
      ...(formValue.documentSubtypeId !== null && {
        documentSubtypeId: formValue.documentSubtypeId,
      }),
      ...(formValue.year !== null && { year: formValue.year }),
      documents: formValue.documents.map((document) => {
        const fileId = uploadedFileIds.get(document.clientId);
        if (!fileId) {
          throw new Error(`Uploaded file missing for ${document.clientId}.`);
        }
        return {
          fileId,
          title: document.title.trim(),
        };
      }),
    };
  }

  private updateUploadState(
    clientId: string,
    changes: Partial<
      Pick<
        PendingDocumentFile,
        'uploadedFileId' | 'uploadStatus' | 'uploadError'
      >
    >,
  ): void {
    this.selectedFiles.update((files) =>
      files.map((pendingFile) =>
        pendingFile.clientId === clientId
          ? { ...pendingFile, ...changes }
          : pendingFile,
      ),
    );
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

  private isAllowedExtension(extension: string) {
    return (this.fileRules.allowedExtensions as readonly string[]).includes(
      extension,
    );
  }

  private getFileSelectionKey(file: File): string {
    return JSON.stringify([file.name, file.size, file.lastModified]);
  }

  private createClientId(): string {
    this.nextClientId += 1;
    return `batch-document-${Date.now()}-${this.nextClientId}`;
  }

  private removeFinalExtension(fileName: string): string {
    const finalDotIndex = fileName.lastIndexOf('.');
    return finalDotIndex <= 0 ? fileName : fileName.slice(0, finalDotIndex);
  }
}
