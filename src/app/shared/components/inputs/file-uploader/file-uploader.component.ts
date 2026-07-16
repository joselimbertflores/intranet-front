import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  model,
  output,
} from '@angular/core';



import { PrimengFileIconPipe } from '../../../pipes/primeng-file-icon';

interface UploadedFile {
 id: string; 
 originalName: string
}

@Component({
  selector: 'document-file-uploader',
  imports: [CommonModule, PrimengFileIconPipe],
  template: `
    <div class="card h-full">
      <!-- <app-ui-fileupload
        name="myfile[]"
        maxFileSize="1000000"
        [multiple]="true"
        [customUpload]="true"
        (onSelect)="onSelectedFiles($event)"
      >
        <ng-template
          #header
          let-files
          let-chooseCallback="chooseCallback"
          let-clearCallback="clearCallback"
          let-uploadCallback="uploadCallback"
        >
        <app-ui-button
          label="Seleccionar"
          variant="outlined"
          icon="ui-icon ui-icon-plus"
          size="small"
          (onClick)="chooseFiles($event, chooseCallback)"
        />
        </ng-template>
        <ng-template
          #content
          let-files
          let-removeFileCallback="removeFileCallback"
          let-removeUploadedFileCallback="removeUploadedFileCallback"
        >
          <div class="flex flex-col gap-2 max-h-[400px] overflow-y-auto p-2">
            @for (file of files; track $index) {
              <div class="flex justify-between p-2 rounded-lg border border-gray-300">
                <div class="flex items-center space-x-3">
                  <i [ngClass]="file.name | primengFileIcon" style="font-size: 1.5rem;"></i>
                  <div>
                    <p class="text-sm font-medium">
                      {{ file.name }}
                    </p>
                    <p class="text-xs text-orange-500">Pendiente</p>
                  </div>
                </div>
                <app-ui-button
                  icon="ui-icon ui-icon-times"
                  severity="danger"
                  [rounded]="true"
                  [text]="true"
                  (onClick)="onRemoveFile($event, removeFileCallback, $index)"
                />
              </div>
            }
            @for (file of uploadedFiles(); track $index) {
               <div class="flex justify-between p-2 rounded-lg border border-gray-300">
                <div class="flex items-center space-x-3">
                  <i [ngClass]="file.originalName | primengFileIcon" style="font-size: 1.5rem;"></i>
                  <div>
                    <p class="text-sm font-medium">
                      {{ file.originalName }}
                    </p>
                    <p class="text-xs text-green-500">Completado</p>
                  </div>
                </div>
                <app-ui-button
                  icon="ui-icon ui-icon-times"
                  severity="danger"
                  [rounded]="true"
                  [text]="true"
                  (onClick)="onRemoveUploadedFile($index)"
                />
              </div>
            }
          </div>
        </ng-template>
        @if (uploadedFiles().length === 0) {
          <ng-template #empty>
            <div class="flex items-center justify-center flex-col h-[300px]">
              <i
                class="ui-icon ui-icon-cloud-upload !border-2 !rounded-full !p-6 !text-4xl !text-muted-color"
              ></i>
              <p class="mt-6 mb-0">Seleccione o arrastre los archivos a subir</p>
            </div>
          </ng-template>
        }
      </app-ui-fileupload> -->
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderComponent {
  uploadedFiles = model<UploadedFile[]>([]);

  onSelectFiles = output<File[]>();

  chooseFiles(event: Event, chooseCallback: Function) {
    chooseCallback();
  }

  onSelectedFiles(event: any) {
    this.onSelectFiles.emit(event.currentFiles);
  }

  onRemoveFile(event: Event, removeFileCallback: Function, index: number) {
    removeFileCallback(event, index);
  }

  onRemoveUploadedFile(index: number) {
    this.uploadedFiles.update(values => {
      values.splice(index, 1);
      return [...values];
    })
  }
}
