import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  validate,
} from '@angular/forms/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import {
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { firstValueFrom } from 'rxjs';

import {
  TutorialCreatePayload,
  TutorialDetailResponse,
  TutorialResponse,
} from '../../interfaces';
import { TutorialCategoryDataSource, TutorialDataSource } from '../../services';

export interface TutorialEditorContext {
  tutorial?: TutorialResponse;
}

interface TutorialFormData {
  title: string;
  summary: string;
  categoryId: number | null;
}

@Component({
  selector: 'app-tutorial-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButtonImports,
    HlmDialogDescription,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInput,
    HlmSelectImports,
    HlmSpinner,
    HlmTextarea,
  ],
  templateUrl: './tutorial-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<TutorialDetailResponse>>(BrnDialogRef);
  private readonly tutorialDataSource = inject(TutorialDataSource);
  private readonly categoryDataSource = inject(TutorialCategoryDataSource);
  private readonly context = injectBrnDialogContext<TutorialEditorContext>();

  readonly tutorial = this.context.tutorial;
  readonly categoriesResource = rxResource({
    stream: () => this.categoryDataSource.findAll(),
  });
  readonly formModel = signal<TutorialFormData>({
    title: this.tutorial?.title ?? '',
    summary: this.tutorial?.summary ?? '',
    categoryId: this.tutorial?.category?.id ?? null,
  });

  readonly tutorialForm = form(
    this.formModel,
    (path) => {
      validate(path.title, ({ value }) =>
        value().trim()
          ? null
          : { kind: 'required', message: 'El título es obligatorio' },
      );
      maxLength(path.title, 200, {
        message: 'El título admite hasta 200 caracteres',
      });
    },
    {
      submission: {
        action: async (field) => {
          const value = field().value();
          const payload: TutorialCreatePayload = {
            title: value.title.trim(),
            summary: value.summary?.trim() || null,
            categoryId: value.categoryId,
          };
          const response = await firstValueFrom(
            this.tutorial
              ? this.tutorialDataSource.update(this.tutorial.id, payload)
              : this.tutorialDataSource.create(payload),
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
