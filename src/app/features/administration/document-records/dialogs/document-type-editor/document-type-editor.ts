import { Component, inject, signal } from '@angular/core';
import {
  applyEach,
  FormField,
  FormRoot,
  maxLength,
  validate,
  form,
} from '@angular/forms/signals';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';

import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmInput } from '@spartan-ng/helm/input';
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
    HlmAlertImports,
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

  readonly documentTypeForm = form(
    this.formModel,
    (schemaPath) => {
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
    },
    {
      submission: {
        action: async (formField) => {
          const request = this.documentType
            ? this.documentTypeDataSource.update(
                this.documentType.id,
                this.buildUpdateDto(formField().value()),
              )
            : this.documentTypeDataSource.create(
                this.buildCreateDto(formField().value()),
              );

          const response = await firstValueFrom(request);
          this.dialogRef.close(response);
        },
      },
    },
  );

  close(): void {
    if (this.documentTypeForm().submitting()) return;
    this.dialogRef.close();
  }

  addSubtype(): void {
    this.formModel.update((value) => ({
      ...value,
      subtypes: [...value.subtypes, { name: '', isActive: true }],
    }));
  }

  removeSubtype(index: number): void {
    const subtype = this.formModel().subtypes[index];
    if (!subtype) return;

    if (subtype.id !== undefined) {
      this.subtypeIdsToDelete.update((ids) => [...ids, subtype.id!]);
    }

    this.formModel.update((value) => ({
      ...value,
      subtypes: value.subtypes.filter(
        (_, subtypeIndex) => subtypeIndex !== index,
      ),
    }));
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
}
