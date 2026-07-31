import { Component, inject, signal } from '@angular/core';
import {
  disabled,
  form,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  validate,
} from '@angular/forms/signals';
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

import { DirectorySite, DirectorySitePayload } from '../../interfaces';
import { DirectoryDataSource } from '../../services';

export interface DirectorySiteEditorContext {
  site?: DirectorySite;
}

interface DirectorySiteFormModel {
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-directory-site-editor',
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
  templateUrl: './directory-site-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col',
  },
})
export class DirectorySiteEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<DirectorySite>>(BrnDialogRef);
  private readonly dataSource = inject(DirectoryDataSource);
  private readonly context =
    injectBrnDialogContext<DirectorySiteEditorContext>();

  readonly site = this.context.site;
  readonly formModel = signal<DirectorySiteFormModel>({
    name: this.site?.name ?? '',
    isActive: this.site?.isActive ?? true,
  });

  readonly siteForm = form(
    this.formModel,
    (schemaPath) => {
      disabled(schemaPath, {
        when: ({ state }) => state.submitting(),
      });
      validate(schemaPath.name, ({ value }) =>
        value().trim()
          ? null
          : {
              kind: 'required',
              message: 'El nombre de la sede es obligatorio.',
            },
      );
      minLength(schemaPath.name, 2, {
        message: 'El nombre debe tener al menos 2 caracteres.',
      });
      maxLength(schemaPath.name, 120, {
        message: 'El nombre admite hasta 120 caracteres.',
      });
    },
    {
      submission: {
        action: async (formField) => {
          const request = this.site
            ? this.dataSource.updateSite(this.site.id, formField().value())
            : this.dataSource.createSite(formField().value());

          const response = await firstValueFrom(request);
          this.dialogRef.close(response);
        },
      },
    },
  );

  close(): void {
    if (!this.siteForm().submitting()) this.dialogRef.close();
  }
}
