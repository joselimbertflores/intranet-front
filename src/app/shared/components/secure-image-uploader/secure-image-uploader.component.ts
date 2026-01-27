import {
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  inject,
  input,
  model,
  signal,
} from '@angular/core';


import { ButtonModule } from 'primeng/button';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'secure-image-uploader',
  imports: [ButtonModule],
  template: `
    <div class="flex flex-col border border-slate-500 p-3 rounded-xl">
      @if(imageDataUrl()){
      <figure class="flex justify-center items-center rounded-2xl mb-4">
        <img
          [src]="imageDataUrl()"
          alt="Image preview"
          class="object-contain rounded-2xl max-h-[350px]"
        />
      </figure>
      } pi-image
      <div class="flex items-center justify-between">
        <div class="text-lg">Imagen</div>
        <div class="flex gap-x-4">
        
          <button pButton   (click)="imageInput.click()">
            <i class="pi pi-image" pButtonIcon></i>
            <span pButtonLabel>Save</span>
          </button>

          <input
            #imageInput
            [hidden]="true"
            [multiple]="true"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            (change)="onFileChange($event)"
          />
          @if(imageDataUrl()){
          <!-- <button
            matMiniFab
            aria-label="Remove image"
            matTooltip="Remover imagen"
            (click)="removeImage(imageInput)"
          >
            <mat-icon>close</mat-icon>
          </button> -->
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecureImageUploaderComponent {
  private fileUploadService = inject(FileUploadService);
  private destroyRef = inject(DestroyRef);

  file = model<File | null>();
  imageDataUrl = signal<string | null>(null);

  // * Optional, for manage image uplaodes
  uploadedImage = model<string | null>(null);

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.imageDataUrl()?.startsWith('blob:')) {
        // * If image is a blob with createObjectURL, free memory
        URL.revokeObjectURL(this.imageDataUrl()!);
      }
    });
  }

  ngOnInit(): void {
    this.loadProtectedImage();
  }

  removeImage(fileInput: HTMLInputElement): void {
    this.file.set(null);
    this.imageDataUrl.set(null);
    this.uploadedImage.set(null);
    fileInput.value = '';
  }

  onFileChange(event: Event) {
    // * Load image from local files
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.imageDataUrl.set(reader.result as string);
      this.file.set(file);
    };
    reader.readAsDataURL(file);
  }

  private loadProtectedImage() {
    // * Load image from server protected jwt
    if (!this.uploadedImage()) return;
    this.fileUploadService.getFile(this.uploadedImage()!).subscribe((blob) => {
      this.imageDataUrl.set(URL.createObjectURL(blob));
    });
  }
}
