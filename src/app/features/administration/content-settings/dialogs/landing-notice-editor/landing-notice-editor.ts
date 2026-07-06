import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  ValidationErrors,
  AbstractControl,
  FormBuilder,
  Validators,
} from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';

import { LandingNoticeResponse, LandingNoticeToSave } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';
import { FormUtils } from '../../../../../helpers';

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const visibleFrom = control.get('visibleFrom')?.value as Date | null;
  const visibleUntil = control.get('visibleUntil')?.value as Date | null;
  return visibleFrom && visibleUntil && visibleFrom > visibleUntil
    ? { invalidDateRange: true }
    : null;
}

@Component({
  selector: 'app-landing-notice-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    EditorModule,
    FloatLabelModule,
    InputTextModule,
    MessageModule,
  ],
  templateUrl: './landing-notice-editor.html',
})
export class LandingNoticeEditor implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dataSource = inject(ContentSettingsDataSource);

  readonly dialogRef = inject(DynamicDialogRef);
  readonly data?: LandingNoticeResponse = inject(DynamicDialogConfig).data;
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly imageFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);

  readonly formUtils = FormUtils;
  readonly form = this.formBuilder.group(
    {
      title: ['', [Validators.required, Validators.maxLength(160)]],
      contentHtml: [''],
      imageId: [null as string | null],
      imageAlt: ['', Validators.maxLength(255)],
      imageLinkUrl: [
        '',
        Validators.pattern(/^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/i),
      ],
      isActive: [true],
      visibleFrom: [null as Date | null],
      visibleUntil: [null as Date | null],
      isPinned: [false],
    },
    { validators: dateRangeValidator },
  );

  ngOnInit(): void {
    this.loadForm();
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.revokePreview();
    this.imageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
    input.value = '';
  }

  removeImage(): void {
    this.revokePreview();
    this.imageFile.set(null);
    this.imagePreview.set(null);
    this.form.patchValue({ imageId: null, imageAlt: '', imageLinkUrl: '' });
  }

  save(): void {
    this.submitted.set(true);
    if (!this.isValid()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: LandingNoticeToSave = {
      title: value.title!.trim(),
      contentHtml: value.contentHtml?.trim() || null,
      imageId: value.imageId,
      imageAlt: this.hasImage() ? value.imageAlt?.trim() || null : null,
      imageLinkUrl: this.hasImage() ? value.imageLinkUrl?.trim() || null : null,
      isActive: value.isActive ?? true,
      visibleFrom: value.visibleFrom,
      visibleUntil: value.visibleUntil,
      isPinned: value.isPinned ?? false,
    };

    this.saving.set(true);
    const request$ = this.data
      ? this.dataSource.updateLandingNotice(
          this.data.id,
          payload,
          this.imageFile() ?? undefined,
        )
      : this.dataSource.createLandingNotice(
          payload,
          this.imageFile() ?? undefined,
        );

    request$.subscribe({
      next: (notice) => this.dialogRef.close(notice),
      error: () => this.saving.set(false),
    });
  }

  showContentError(): boolean {
    return this.submitted() && !this.hasImage() && !this.hasContent();
  }

  showImageAltRequiredError(): boolean {
    return (
      this.submitted() &&
      this.hasImage() &&
      !this.form.controls.imageAlt.value?.trim()
    );
  }

  private revokePreview(): void {
    const preview = this.imagePreview();
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  }

  private loadForm(): void {
    if (!this.data) return;
    const { visibleFrom, visibleUntil, ...props } = this.data;
    this.form.patchValue({
      ...props,
      visibleFrom: this.data.visibleFrom
        ? new Date(this.data.visibleFrom)
        : null,
      visibleUntil: this.data.visibleUntil
        ? new Date(this.data.visibleUntil)
        : null,
    });
    this.imagePreview.set(this.data.imageUrl);
  }

  private isValid(): boolean {
    return (
      this.form.valid &&
      !this.showContentError() &&
      !this.showImageAltRequiredError()
    );
  }

  private hasImage(): boolean {
    return !!this.form.controls.imageId.value || !!this.imageFile();
  }

  private hasContent(): boolean {
    return this.hasMeaningfulContent(this.form.controls.contentHtml.value);
  }

  private hasMeaningfulContent(value: string | null): boolean {
    return !!value
      ?.replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\u00a0/g, ' ')
      .trim();
  }
}
