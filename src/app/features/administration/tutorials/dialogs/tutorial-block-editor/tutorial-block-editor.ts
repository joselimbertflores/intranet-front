import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { EditorModule } from 'primeng/editor';
import { ButtonModule } from 'primeng/button';

import { TutorialBlockResponse, TutorialBlockType } from '../../interfaces';
import { FileIcon, FileSizePipe } from '../../../../../shared';
import { FormUtils } from '../../../../../helpers';
import { TutorialDataSource } from '../../services';

interface DialogData {
  tutorialId: string;
  blockType: TutorialBlockType;
  block?: TutorialBlockResponse;
}
@Component({
  selector: 'app-tutorial-block-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUploadModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    EditorModule,
    FileIcon,
    FileSizePipe,
  ],
  templateUrl: './tutorial-block-editor.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialBlockEditor implements OnInit {
  private dialogRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);
  private tutorialDataSource = inject(TutorialDataSource);

  readonly data: DialogData = inject(DynamicDialogConfig).data;
  formUtils = FormUtils;

  blockForm: FormGroup = this.formBuilder.group({
    content: [null],
  });

  file: File | null = null;

  previewUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    if (this.blockForm.invalid) return this.blockForm.markAllAsTouched();
    const saveObservable = this.data.block
      ? this.tutorialDataSource.updateBlock(
          this.data.block.id,
          this.blockForm.value,
          this.file,
        )
      : this.tutorialDataSource.createBlock(
          this.data.tutorialId,
          {
            ...this.blockForm.value,
            type: this.data.blockType,
          },
          this.file,
        );

    saveObservable.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  close() {
    this.dialogRef.close();
  }

  selectFile(event: FileSelectEvent) {
    const [file] = event.files;
    this.file = file;
  }

  private loadForm() {
    if (this.data.blockType === 'VIDEO_URL' || this.data.blockType === 'TEXT') {
      this.blockForm.get('content')?.addValidators(Validators.required);
      this.blockForm.updateValueAndValidity();
    }

    if (this.data.block) {
      this.blockForm.patchValue({ content: this.data.block.content ?? '' });
      this.previewUrl.set(this.data.block.file?.url ?? null);
    }
  }

  onFileChange(event: Event) {
    const [file] = (event.target as HTMLInputElement).files ?? [];
    if (!file) return;
    this.file = file;
    if (this.previewUrl() !== null) {
      URL.revokeObjectURL(this.previewUrl()!);
    }

    // preview local
    this.previewUrl.set(URL.createObjectURL(file));
  }
}
