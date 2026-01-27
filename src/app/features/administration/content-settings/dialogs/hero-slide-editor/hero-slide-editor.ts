import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  FormGroup,
} from '@angular/forms';
import {
  moveItemInArray,
  DragDropModule,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';


import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { ContentSettingsDataSource } from '../../services';
import { ImagePreview } from '../../interfaces';

@Component({
  selector: 'hero-slide-editor',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    DragDropModule,
    ButtonModule,
    TagModule,
    FloatLabel
],
  templateUrl: './hero-slide-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSlideEditor {
  private heroSectionService = inject(ContentSettingsDataSource);
  private dialogRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);

  slideImages = signal<ImagePreview[]>([]);

  form: FormGroup = this.formBuilder.nonNullable.group({
    slides: this.formBuilder.array([]),
  });

  ngOnInit() {
    this.loadSlides();
  }

  save() {
    const { slides = [] } = this.form.value;
    this.heroSectionService
      .replaceSlides(
        this.slideImages().map((item, index) => ({
          ...item,
          ...slides[index],
        }))
      )
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  close() {
    this.dialogRef.close();
  }

  onFileSelected(event: Event): void {
    const files = this.extractFileFromEvent(event);
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const preview = reader.result as string;
        this.addSlide(file, preview);
      };
      reader.readAsDataURL(file);
    });
  }

  addSlide(file: File, preview: string) {
    this.slides.push(this.createSlideControl());
    this.slideImages.update((values) => [...values, { file, url: preview }]);
  }

  removeSlide(index: number) {
    this.slides.removeAt(index);
    this.slideImages.update((values) => {
      values.splice(index, 1);
      return [...values];
    });
  }

  drop(event: CdkDragDrop<object[]>) {
    moveItemInArray(
      this.slides.controls,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(
      this.slideImages(),
      event.previousIndex,
      event.currentIndex
    );
    this.slides.updateValueAndValidity();
  }

  get slides(): FormArray {
    return this.form.get('slides') as FormArray;
  }

  private loadSlides(): void {
    this.heroSectionService.getHeroSlides().subscribe((data) => {
      this.slideImages.set( data.map((item) => ({ ...item, url: item.imageUrl })) );
      data.forEach((slide) => {
        this.slides.push(this.createSlideControl(slide));
      });
    });
  }

  private createSlideControl(slide?: object) {
    const control = this.formBuilder.group({
      title: [''],
      description: [''],
      redirectUrl: [''],
    });
    if (slide) {
      control.patchValue(slide);
    }
    return control;
  }

  private extractFileFromEvent(event: Event): File[] {
    const inputElement = event.target as HTMLInputElement | null;
    if (!inputElement?.files || inputElement.files?.length === 0) return [];
    return Array.from(inputElement.files);
  }
}
