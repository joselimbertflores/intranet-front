import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  ValidatorFn,
  Validators,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { EditorModule } from 'primeng/editor';
import { ButtonModule } from 'primeng/button';

import { TutorialBlockResponse, TutorialBlockType } from '../../interfaces';
import { FileIcon, FileSizePipe } from '../../../../../shared';
import { FormUtils } from '../../../../../helpers';
import { TutorialDataSource } from '../../services';

export interface TutorialBLockDialogData {
  type: TutorialBlockType;
  tutorialId: string;
  block?: TutorialBlockResponse;
}

const BLOCK_EXTENSIONS: Record<TutorialBlockType, string[]> = {
  IMAGE: ['jpg', 'jpeg', 'png', 'webp'],
  VIDEO_FILE: ['mp4'],
  FILE: ['pdf', 'pptx'],
  TEXT: [],
  VIDEO_URL: [],
};
@Component({
  selector: 'app-tutorial-block-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUploadModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    MessageModule,
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

  readonly data: TutorialBLockDialogData = inject(DynamicDialogConfig).data;
  readonly formUtils = FormUtils;

  blockForm: FormGroup = this.formBuilder.group({
    content: [null],
  });

  file: File | null = null;

  ngOnInit(): void {
    this.setValidatorsForType(this.data.type);
    this.loadForm();
  }

  save() {
    if (!this.isFormValid) return this.blockForm.markAllAsTouched();
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
            type: this.data.type,
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

  getFileAccept(): string | undefined {
    const exts = BLOCK_EXTENSIONS[this.data.type];
    if (!exts || exts.length === 0) return undefined;
    return exts.map((e) => `.${e}`).join(',');
  }

  getAllowedExtensionsLabel(): string {
    return BLOCK_EXTENSIONS[this.data.type]
      ?.map((e) => e.toUpperCase())
      .join(', ');
  }

  get isFormValid() {
    return this.data.type === 'TEXT' || this.data.type === 'VIDEO_URL'
      ? this.blockForm.valid
      : this.blockForm.valid && (!!this.file || this.data.block);
  }

  private loadForm() {
    if (this.data.block) {
      this.blockForm.patchValue({ content: this.data.block.content ?? '' });
    }
  }

  private setValidatorsForType(type: TutorialBlockType): void {
    let validors: ValidatorFn[] = [];
    switch (type) {
      case 'VIDEO_URL':
        validors = [
          Validators.required,
          Validators.pattern(
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
          ),
        ];
        break;
      case 'TEXT':
        validors = [Validators.required];
        break;
      default:
        break;
    }

    this.blockForm.get('content')?.setValidators(validors);
    this.blockForm.updateValueAndValidity();
  }
}
