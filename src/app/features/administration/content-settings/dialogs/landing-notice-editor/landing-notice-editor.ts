import { Component, inject, OnDestroy, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  pattern,
  validate,
} from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideImage, lucideTrash2 } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { QuillEditorFieldComponent } from 'ngx-quill';
import type { QuillModules } from 'ngx-quill/config';
import { firstValueFrom } from 'rxjs';

import { LandingNoticeResponse, LandingNoticeToSave } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';

export interface LandingNoticeFormData {
  title: string;
  contentHtml: string;
  imageId: string | null;
  imageLinkUrl: string;
  isActive: boolean;
  visibleFrom: Date | null;
  visibleUntil: Date | null;
  isPinned: boolean;
}

interface LandingNoticeEditorContext {
  notice?: LandingNoticeResponse;
}

@Component({
  selector: 'app-landing-notice-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButton,
    HlmCheckbox,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInputImports,
    HlmSpinner,
    NgIcon,
    QuillEditorFieldComponent,
  ],
  providers: [provideIcons({ lucideImage, lucideTrash2 })],
  templateUrl: './landing-notice-editor.html',
  host: {
    class: 'flex flex-col',
  },
})
export class LandingNoticeEditor implements OnDestroy {
  private readonly dialogRef =
    inject<BrnDialogRef<LandingNoticeResponse>>(BrnDialogRef);
  private readonly dataSource = inject(ContentSettingsDataSource);
  private readonly context =
    injectBrnDialogContext<LandingNoticeEditorContext>();

  readonly notice = this.context.notice;
  readonly imageFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(this.notice?.imageUrl ?? null);
  readonly formModel = signal<LandingNoticeFormData>(
    this.createInitialFormData(),
  );

  readonly editorFormats = [
    'bold',
    'italic',
    'underline',
    'header',
    'list',
    'align',
    'link',
  ];
  readonly editorModules: QuillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'clean'],
    ],
    history: { delay: 500, maxStack: 100, userOnly: true },
  };

  readonly noticeForm = form(
    this.formModel,
    (schemaPath) => {
      validate(schemaPath.title, ({ value }) =>
        value().trim()
          ? null
          : {
              kind: 'required',
              message: 'El título es obligatorio',
            },
      );
      maxLength(schemaPath.title, 160, {
        message: 'El título admite hasta 160 caracteres',
      });

      maxLength(schemaPath.imageLinkUrl, 2048, {
        message: 'El enlace admite hasta 2048 caracteres',
      });

      pattern(
        schemaPath.imageLinkUrl,
        /^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/i,
        {
          message:
            'Use una URL HTTP/HTTPS o una ruta interna que comience con /',
        },
      );

      validate(schemaPath, ({ value }) => {
        const { visibleFrom, visibleUntil } = value();
        return visibleFrom && visibleUntil && visibleUntil < visibleFrom
          ? {
              kind: 'invalidDateRange',
              message:
                '“Visible hasta” debe ser posterior o igual a “Visible desde”',
            }
          : null;
      });
    },
    {
      submission: {
        action: async (field) => {
          const payload = this.buildPayload(field().value());
          const request = this.notice
            ? this.dataSource.updateLandingNotice(
                this.notice.id,
                payload,
                this.imageFile() ?? undefined,
              )
            : this.dataSource.createLandingNotice(
                payload,
                this.imageFile() ?? undefined,
              );

          const response = await firstValueFrom(request);
          this.dialogRef.close(response);
        },
      },
    },
  );

  ngOnDestroy(): void {
    this.revokePreview(this.imagePreview());
  }

  close(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const [file] = input.files ?? [];
    if (!file) return;

    this.revokePreview(this.imagePreview());
    this.imageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
    this.noticeForm.imageId().value.set(null);
    input.value = '';
  }

  removeImage(): void {
    this.revokePreview(this.imagePreview());
    this.imageFile.set(null);
    this.imagePreview.set(null);
    this.noticeForm.imageId().value.set(null);
    this.noticeForm.imageLinkUrl().value.set('');
  }

  hasImage(): boolean {
    return Boolean(this.imagePreview());
  }

  dateTimeValue(value: Date | null): string {
    if (!value) return '';
    const localDate = new Date(
      value.getTime() - value.getTimezoneOffset() * 60_000,
    );
    return localDate.toISOString().slice(0, 16);
  }

  updateDate(fieldName: 'visibleFrom' | 'visibleUntil', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.noticeForm[fieldName]().value.set(value ? new Date(value) : null);
  }

  touchDate(fieldName: 'visibleFrom' | 'visibleUntil'): void {
    this.noticeForm[fieldName]().markAsTouched();
  }

  private createInitialFormData(): LandingNoticeFormData {
    return {
      title: this.notice?.title ?? '',
      contentHtml: this.notice?.contentHtml ?? '',
      imageId: this.notice?.imageId ?? null,
      imageLinkUrl: this.notice?.imageLinkUrl ?? '',
      isActive: this.notice?.isActive ?? true,
      visibleFrom: this.notice?.visibleFrom
        ? new Date(this.notice.visibleFrom)
        : null,
      visibleUntil: this.notice?.visibleUntil
        ? new Date(this.notice.visibleUntil)
        : null,
      isPinned: this.notice?.isPinned ?? false,
    };
  }

  private buildPayload(value: LandingNoticeFormData): LandingNoticeToSave {
    const hasImage = this.hasImage();
    return {
      title: value.title.trim(),
      contentHtml: value.contentHtml.trim() || null,
      imageId: value.imageId,
      imageLinkUrl: hasImage ? value.imageLinkUrl.trim() || null : null,
      isActive: value.isActive,
      visibleFrom: value.visibleFrom ? new Date(value.visibleFrom) : null,
      visibleUntil: value.visibleUntil ? new Date(value.visibleUntil) : null,
      isPinned: value.isPinned,
    };
  }

  private revokePreview(preview: string | null): void {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  }
}
