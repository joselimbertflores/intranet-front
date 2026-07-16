import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'pdf-display',
  imports: [PdfViewerModule],
  template: `
    @if (isLoading()) {
    <div class="h-full w-full flex flex-col justify-center items-center">
      <!-- <app-ui-progress-spinner
        strokeWidth="4"
        [style]="{ width: '100px', height: '100px' }"
      /> -->
      <div class="mt-2 font-medium">Cargando PDF ({{ progress() }} %)</div>
    </div>
    }
    <pdf-viewer
      [src]="src()"
      [fit-to-page]="fitToPage()"
      (after-load-complete)="loadComplete()"
      style="width: 100%; height: 100%;"
      (on-progress)="onProgress($event)"
      [zoom]="zoom()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfDisplayComponent {
  src = input.required<string>();
  fitToPage = input<boolean>(true);
  isLoading = signal(true);
  zoom=input(0.6)

  progress = signal(0);

  onProgress(progressData: { loaded: number; total: number }) {
    const percent = (progressData.loaded / progressData.total) * 100;
    this.progress.set(percent);
  }

  loadComplete() {
    this.isLoading.set(false);
  }
}
