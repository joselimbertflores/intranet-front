import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, validate } from '@angular/forms/signals';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
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

import { OrganizationalUnitResponse } from '../../interfaces';
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
})
export class OrganizationalUnitEditor {
  private dialogRef =
    inject<BrnDialogRef<OrganizationalUnitResponse>>(BrnDialogRef);
  private orgUnitDataSource = inject(OrganizationalUnitDatasource);

  private context = injectBrnDialogContext<OrganizationalUnitEditorContext>();
  readonly organizationalUnit = this.context.organizationalUnit;
  readonly parent = this.context.parent;

  readonly formModel = signal<OrganizationalUnitFormModel>({
    name: this.organizationalUnit?.name ?? '',
    isActive: this.organizationalUnit?.isActive ?? true,
  });

  readonly organizationalUnitForm = form(
    this.formModel,
    (schemaPath) => {
      validate(schemaPath.name, ({ value }) =>
        value().trim()
          ? null
          : {
              kind: 'required',
              message: 'El nombre de la unidad es obligatorio',
            },
      );
    },
    {
      submission: {
        action: async (formField) => {
          const request = this.organizationalUnit
            ? this.orgUnitDataSource.update(
                this.organizationalUnit.id,
                formField().value(),
              )
            : this.orgUnitDataSource.create({
                ...formField().value(),
                ...(this.parent && { parentId: this.parent.id }),
              });

          const response = await firstValueFrom(request);
          this.dialogRef.close(response);
        },
      },
    },
  );

  close(): void {
    if (this.organizationalUnitForm().submitting()) return;
    this.dialogRef.close();
  }
}
