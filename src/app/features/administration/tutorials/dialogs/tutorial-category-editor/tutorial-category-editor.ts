import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, validate } from '@angular/forms/signals';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { firstValueFrom } from 'rxjs';

import { TutorialCategoryResponse } from '../../interfaces';
import { TutorialCategoryDataSource } from '../../services';

interface TutorialCategoryEditorContext {
  category?: TutorialCategoryResponse;
}

interface TutorialCategoryFormModel {
  name: string;
}

@Component({
  selector: 'app-tutorial-category-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButtonImports,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInput,
    HlmSpinner,
  ],
  templateUrl: './tutorial-category-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialCategoryEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<TutorialCategoryResponse>>(BrnDialogRef);
  private readonly dataSource = inject(TutorialCategoryDataSource);
  private readonly context =
    injectBrnDialogContext<TutorialCategoryEditorContext>();

  readonly category = this.context.category;
  readonly model = signal<TutorialCategoryFormModel>({
    name: this.category?.name ?? '',
  });

  readonly categoryForm = form(
    this.model,
    (path) => {
      validate(path.name, ({ value }) =>
        value().trim()
          ? null
          : { kind: 'required', message: 'El nombre es obligatorio' },
      );
      maxLength(path.name, 120, {
        message: 'El nombre admite hasta 120 caracteres',
      });
    },
    {
      submission: {
        action: async (field) => {
          const payload = { name: field().value().name.trim() };
          const response = await firstValueFrom(
            this.category
              ? this.dataSource.update(this.category.id, payload)
              : this.dataSource.create(payload),
          );
          this.dialogRef.close(response);
        },
      },
    },
  );

  close(): void {
    this.dialogRef.close();
  }
}
