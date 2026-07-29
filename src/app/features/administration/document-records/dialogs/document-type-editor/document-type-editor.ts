import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  applyEach,
  form,
  FormField,
  FormRoot,
  maxLength,
  submit,
  validate,
} from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import {
  HlmAlertDialog,
  HlmAlertDialogImports,
} from '@spartan-ng/helm/alert-dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { firstValueFrom } from 'rxjs';

import {
  DocumentSubtypeToSave,
  DocumentTypeCreateDto,
  DocumentTypeUpdateDto,
  DocumentTypeWithSubTypesResponse,
} from '../../interfaces';
import { DocumentTypeDatasource } from '../../services';

interface DocumentTypeEditorContext {
  documentType?: DocumentTypeWithSubTypesResponse;
}

interface DocumentTypeFormData {
  name: string;
  isActive: boolean;
  subtypes: DocumentSubtypeToSave[];
}

@Component({
  selector: 'app-document-type-editor',
  imports: [
    FormField,
    FormRoot,
    HlmAlertDialogImports,
    HlmButton,
    HlmCheckbox,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInput,
    HlmSpinner,
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideTrash2 })],
  templateUrl: './document-type-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col',
  },
})
export class DocumentTypeEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<DocumentTypeWithSubTypesResponse>>(BrnDialogRef);
  private readonly documentTypeDataSource = inject(DocumentTypeDatasource);
  private readonly context =
    injectBrnDialogContext<DocumentTypeEditorContext>();

  readonly documentType = this.context.documentType;
  readonly subtypeIdsToDelete = signal<number[]>([]);
  readonly saveError = signal<string | null>(null);

  readonly formModel = signal<DocumentTypeFormData>({
    name: this.documentType?.name ?? '',
    isActive: this.documentType?.isActive ?? true,
    subtypes:
      this.documentType?.subtypes.map(({ id, name, isActive }) => ({
        id,
        name,
        isActive,
      })) ?? [],
  });

  readonly documentTypeForm = form(this.formModel, (schemaPath) => {
    validate(schemaPath.name, ({ value }) =>
      this.validateName(value(), 'El nombre del tipo es obligatorio'),
    );
    maxLength(schemaPath.name, 50, {
      message: 'El nombre admite hasta 50 caracteres',
    });

    applyEach(schemaPath.subtypes, (subtype) => {
      validate(subtype.name, ({ value }) =>
        this.validateName(value(), 'El nombre del subtipo es obligatorio'),
      );
    });
  });

  close(): void {
    if (this.documentTypeForm().submitting()) return;
    this.dialogRef.close();
  }

  addSubtype(): void {
    if (this.documentTypeForm().submitting()) return;

    this.formModel.update((value) => ({
      ...value,
      subtypes: [...value.subtypes, { name: '', isActive: true }],
    }));
  }

  removeSubtype(index: number): void {
    if (this.documentTypeForm().submitting()) return;

    const subtype = this.formModel().subtypes[index];
    if (!subtype) return;

    if (subtype.id !== undefined) {
      this.subtypeIdsToDelete.update((ids) =>
        ids.includes(subtype.id!) ? ids : [...ids, subtype.id!],
      );
    }

    this.formModel.update((value) => ({
      ...value,
      subtypes: value.subtypes.filter(
        (_, subtypeIndex) => subtypeIndex !== index,
      ),
    }));
  }

  requestSave(deleteDialog: HlmAlertDialog): void {
    if (this.documentTypeForm().submitting()) return;

    this.documentTypeForm().markAsTouched();
    if (this.documentTypeForm().invalid()) return;

    this.saveError.set(null);

    if (this.documentType && this.subtypeIdsToDelete().length > 0) {
      deleteDialog.open();
      return;
    }

    void this.save();
  }

  confirmSave(deleteDialog: HlmAlertDialog): void {
    if (this.documentTypeForm().submitting()) return;
    void this.save(deleteDialog);
  }

  onDeleteConfirmationClosed(): void {
    this.saveError.set(null);
  }

  private async save(deleteDialog?: HlmAlertDialog): Promise<void> {
    this.saveError.set(null);

    try {
      await submit(this.documentTypeForm, async (field) => {
        const value = field().value();
        const request = this.documentType
          ? this.documentTypeDataSource.update(
              this.documentType.id,
              this.buildUpdateDto(value),
            )
          : this.documentTypeDataSource.create(this.buildCreateDto(value));

        const response = await firstValueFrom(request);
        deleteDialog?.close();
        this.dialogRef.close(response);
      });
    } catch (error: unknown) {
      this.saveError.set(this.getSaveErrorMessage(error));
    }
  }

  private buildCreateDto(value: DocumentTypeFormData): DocumentTypeCreateDto {
    return {
      name: value.name,
      isActive: value.isActive,
      subtypes: value.subtypes.map((subtype) => ({
        ...(subtype.id !== undefined && { id: subtype.id }),
        name: subtype.name,
        isActive: subtype.isActive,
      })),
    };
  }

  private buildUpdateDto(value: DocumentTypeFormData): DocumentTypeUpdateDto {
    return {
      ...this.buildCreateDto(value),
      subtypeIdsToDelete: this.subtypeIdsToDelete(),
    };
  }

  private validateName(value: string, requiredMessage: string) {
    const name = value.trim();
    if (!name) {
      return { kind: 'required', message: requiredMessage };
    }

    return name.length < 3
      ? {
          kind: 'minLength',
          message: 'El nombre debe tener al menos 3 caracteres',
        }
      : null;
  }

  private getSaveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage =
        typeof error.error === 'object' &&
        error.error !== null &&
        'message' in error.error
          ? error.error.message
          : null;

      if (error.status === 409) {
        return typeof backendMessage === 'string'
          ? backendMessage
          : 'No se pueden eliminar los subtipos porque están asignados a documentos.';
      }

      if (typeof backendMessage === 'string') return backendMessage;
    }

    return 'No se pudieron guardar los cambios. Intenta nuevamente.';
  }
}
