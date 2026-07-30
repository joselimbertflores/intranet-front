import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  disabled,
  form,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideExternalLink,
  lucideFileText,
  lucideTrash2,
  lucideUpload,
} from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { firstValueFrom } from 'rxjs';

import { CommunicationResponse } from '../../interfaces';
import {
  CommunicationAdminDataSource,
  SaveCommunicationDto,
} from '../../services';

interface CommunicationEditorContext {
  communication?: CommunicationResponse;
}

interface CommunicationFormModel {
  reference: string;
  code: string;
  isActive: boolean;
  typeId: number | null;
}

@Component({
  selector: 'app-communication-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButtonImports,
    HlmCheckbox,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInputImports,
    HlmSelectImports,
    HlmSpinner,
    HlmTextarea,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideExternalLink,
      lucideFileText,
      lucideTrash2,
      lucideUpload,
    }),
  ],
  templateUrl: './communication-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] flex-col',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<CommunicationResponse>>(BrnDialogRef);
  private readonly communicationDataSource = inject(
    CommunicationAdminDataSource,
  );
  private readonly context =
    injectBrnDialogContext<CommunicationEditorContext>();

  readonly communication = signal(this.context.communication ?? null);
  readonly isEditing = computed(() => this.communication() !== null);
  readonly selectedFile = signal<File | null>(null);
  readonly currentFile = computed(() => this.communication()?.file ?? null);

  readonly types = this.communicationDataSource.types;
  readonly typeNames = computed(
    () => new Map(this.types().map(({ id, name }) => [id, name])),
  );

  readonly formModel = signal<CommunicationFormModel>(
    this.createInitialFormModel(),
  );

  readonly communicationForm = form(
    this.formModel,
    (schemaPath) => {
      disabled(schemaPath, {
        when: ({ state }) => state.submitting(),
      });

      validate(schemaPath.reference, ({ value }) =>
        value().trim()
          ? null
          : {
              kind: 'required',
              message: 'La referencia es obligatoria.',
            },
      );
      minLength(schemaPath.reference, 3, {
        message: 'La referencia debe tener al menos 3 caracteres.',
      });

      validate(schemaPath.code, ({ value }) =>
        value().trim()
          ? null
          : {
              kind: 'required',
              message: 'El CITE es obligatorio.',
            },
      );
      minLength(schemaPath.code, 5, {
        message: 'El CITE debe tener al menos 5 caracteres.',
      });
      maxLength(schemaPath.code, 50, {
        message: 'El CITE admite hasta 50 caracteres.',
      });
      pattern(schemaPath.code, /^[a-zA-Z0-9/-]+$/, {
        message: 'Use únicamente letras, números, guiones y barras.',
      });

      required(schemaPath.typeId, {
        message: 'Seleccione un tipo de comunicado.',
      });

      validate(schemaPath, () => {
        const file = this.selectedFile();
        if (!this.isEditing() && !file) {
          return {
            kind: 'fileRequired',
            message: 'Seleccione el archivo PDF del comunicado.',
          };
        }
        return file && !this.isPdf(file)
          ? {
              kind: 'invalidFileType',
              message: 'El archivo seleccionado debe estar en formato PDF.',
            }
          : null;
      });
    },
    {
      submission: {
        action: async (formField) => {
          const communication = this.communication();
          const selectedFile = this.selectedFile();
          const payload = this.buildPayload(formField().value());
          const request = communication
            ? this.communicationDataSource.update(
                communication.id,
                payload,
                selectedFile,
              )
            : this.communicationDataSource.create(payload, selectedFile!);

          const response = await firstValueFrom(request);
          this.dialogRef.close(response);
        },
      },
    },
  );

  close(): void {
    if (!this.communicationForm().submitting()) {
      this.dialogRef.close();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const [file] = input.files ?? [];
    input.value = '';

    if (!file) return;
    this.selectedFile.set(file);
  }

  clearSelectedFile(): void {
    this.selectedFile.set(null);
  }

  openCurrentFile(): void {
    const url = this.currentFile()?.url;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  isFieldInvalid(fieldName: keyof CommunicationFormModel): boolean {
    const field = this.communicationForm[fieldName]();
    return field.touched() && field.errors().length > 0;
  }

  private createInitialFormModel(): CommunicationFormModel {
    const communication = this.communication();
    return {
      reference: communication?.reference ?? '',
      code: communication?.code ?? '',
      isActive: communication?.isActive ?? true,
      typeId: communication?.type.id ?? null,
    };
  }

  private buildPayload(
    formValue: CommunicationFormModel,
  ): SaveCommunicationDto {
    return {
      reference: formValue.reference.trim(),
      code: formValue.code.trim(),
      isActive: formValue.isActive,
      typeId: formValue.typeId!,
    };
  }

  private isPdf(file: File): boolean {
    return (
      file.type === 'application/pdf' ||
      file.name.toLocaleLowerCase().endsWith('.pdf')
    );
  }
}
