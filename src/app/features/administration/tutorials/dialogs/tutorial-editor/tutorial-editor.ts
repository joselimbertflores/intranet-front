
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import {
  FormArray,
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TutorialDataSource } from '../../services';
import { TutorialResponse, TutorialVideoResponse } from '../../../interfaces';
import { CustomFormValidators } from '../../../../../../helpers';


@Component({
  selector: 'tutorial-editor',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    ButtonModule
],
  templateUrl: './tutorial-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialEditor {
  private dialogRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private tutorialData = inject(TutorialDataSource);

  readonly data?: TutorialResponse = inject(DynamicDialogConfig).data;

  tutorialForm: FormGroup = this.formBuilder.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        Validators.maxLength(80),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/),
      ],
    ],
    description: [''],
    videos: this.formBuilder.array([], CustomFormValidators.minLengthArray(1)),
  });
  videos = signal<{ file?: File; fileUrl: string }[]>([]);
  uploadedVideos = signal<TutorialVideoResponse[]>([]);

  imageFile: File | null = null;
  localImagePreview = signal<string | null>(null);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.videos().forEach((item) => {
        URL.revokeObjectURL(item.fileUrl);
      });
    });
  }

  ngOnInit() {
    this.loadForm();
  }

  save() {
    const { videos, ...rest } = this.tutorialForm.value;
    const body = {
      ...rest,
      image: { file: this.imageFile, fileUrl: this.data?.imageUrl },
      videos: videos.map((video: { title: string }, index: number) => ({
        ...video,
        ...this.videos()[index],
      })),
    };
    const subscription = this.data
      ? this.tutorialData.update(this.data.id, body)
      : this.tutorialData.create(body);

    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  close() {
    this.dialogRef.close();
  }

  onFileSelected(event: Event): void {
    const files = this.extractFileFromEvent(event);
    files.forEach((file: File) => {
      this.addVideo(file);
    });
  }

  removeVideo(index: number) {
    this.videos.update((values) => {
      const item = values[index];
      if (item.fileUrl) {
        URL.revokeObjectURL(item.fileUrl);
      }
      values.splice(index, 1);
      return [...values];
    });
    this.videosFormArray.removeAt(index);
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.localImagePreview.set(reader.result as string);
      this.imageFile = file;
    };
    reader.readAsDataURL(file);
  }

  get videosFormArray(): FormArray {
    return this.tutorialForm.get('videos') as FormArray;
  }

  private addVideo(file: File) {
    if (file.type !== 'video/mp4') return;
    this.videosFormArray.push(this.createVideoFormGroup());
    this.videos.update((values) => [
      ...values,
      { file, fileUrl: URL.createObjectURL(file) },
    ]);
  }

  private createVideoFormGroup() {
    return this.formBuilder.group({
      title: ['', Validators.required],
    });
  }

  private extractFileFromEvent(event: Event): File[] {
    const inputElement = event.target as HTMLInputElement | null;
    if (!inputElement?.files || inputElement.files?.length === 0) return [];
    const files = Array.from(inputElement.files).filter((file) => {
      return !this.videos().some(
        (v) =>
          v.file?.name === file.name &&
          v.file?.size === file.size &&
          v.file?.lastModified === file.lastModified
      );
    });
    inputElement.value = ''; // * Empty file input;
    return files;
  }

  private loadForm(): void {
    if (!this.data) return;
    const { videos } = this.data;
    this.videos.set(videos.map(({ fileUrl }) => ({ fileUrl })));
    videos.forEach(() => {
      this.videosFormArray.push(this.createVideoFormGroup());
    });
    this.tutorialForm.patchValue(this.data);
  }
}
