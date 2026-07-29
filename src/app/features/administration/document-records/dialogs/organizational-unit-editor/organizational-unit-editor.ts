import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  submit,
  validate,
} from '@angular/forms/signals';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { firstValueFrom } from 'rxjs';

import {
  CreateOrganizationalUnitDto,
  OrganizationalUnitResponse,
  UpdateOrganizationalUnitDto,
} from '../../interfaces';
import { OrganizationalUnitDatasource } from '../../services';

interface OrganizationalUnitEditorContext {
  organizationalUnit?: OrganizationalUnitResponse;
  parent?: OrganizationalUnitResponse;
}

interface OrganizationalUnitFormModel {
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-organizational-unit-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButton,
    HlmCheckbox,
    HlmDialogDescription,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInput,
    HlmSpinner,
  ],
  templateUrl: './organizational-unit-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationalUnitEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<OrganizationalUnitResponse>>(BrnDialogRef);
  private readonly organizationalUnitDataSource = inject(
    OrganizationalUnitDatasource,
  );
  private readonly context =
    injectBrnDialogContext<OrganizationalUnitEditorContext>();

  readonly organizationalUnit = this.context.organizationalUnit;
  readonly parent = this.context.parent;
  readonly saveError = signal<string | null>(null);

  readonly formModel = signal<OrganizationalUnitFormModel>({
    name: this.organizationalUnit?.name ?? '',
    isActive: this.organizationalUnit?.isActive ?? true,
  });

  readonly organizationalUnitForm = form(this.formModel, (schemaPath) => {
    validate(schemaPath.name, ({ value }) =>
      value().trim()
        ? null
        : {
            kind: 'required',
            message: 'El nombre de la unidad es obligatorio',
          },
    );
  });

  close(): void {
    if (this.organizationalUnitForm().submitting()) return;
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    if (this.organizationalUnitForm().submitting()) return;

    this.organizationalUnitForm().markAsTouched();
    if (this.organizationalUnitForm().invalid()) return;

    this.saveError.set(null);

    try {
      await submit(this.organizationalUnitForm, async (field) => {
        const value = field().value();
        const request = this.organizationalUnit
          ? this.organizationalUnitDataSource.update(
              this.organizationalUnit.id,
              this.buildUpdateDto(value),
            )
          : this.organizationalUnitDataSource.create(
              this.buildCreateDto(value),
            );

        const response = await firstValueFrom(request);
        this.dialogRef.close(response);
      });
    } catch (error: unknown) {
      this.saveError.set(this.getSaveErrorMessage(error));
    }
  }

  private buildCreateDto(
    value: OrganizationalUnitFormModel,
  ): CreateOrganizationalUnitDto {
    return {
      name: value.name.trim(),
      isActive: value.isActive,
      ...(this.parent && { parentId: this.parent.id }),
    };
  }

  private buildUpdateDto(
    value: OrganizationalUnitFormModel,
  ): UpdateOrganizationalUnitDto {
    return {
      name: value.name.trim(),
      isActive: value.isActive,
    };
  }

  private getSaveErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No se pudieron guardar los cambios. Intenta nuevamente.';
    }

    const responseBody = error.error as
      | { message?: string | string[] }
      | string
      | null
      | undefined;
    const message =
      typeof responseBody === 'string' ? responseBody : responseBody?.message;

    if (Array.isArray(message)) return message.join(' ');
    return typeof message === 'string' && message.trim()
      ? message
      : 'No se pudieron guardar los cambios. Intenta nuevamente.';
  }
}
